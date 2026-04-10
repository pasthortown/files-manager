import logging
import os
from datetime import datetime, timezone

import httpx

from app.config import settings
from app.models import TrainFileRequest
from app.services import chroma_client, extractor, ollama_client

SKIP_LLM_EXTENSIONS = {".md", ".txt"}
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"}

logger = logging.getLogger(__name__)

MIN_TEXT_LENGTH = 50


def parse_manual_contexts(contexto: str | None) -> list[str] | None:
    """Parse a comma-separated context string into a list of keywords."""
    if not contexto or not contexto.strip():
        return None
    parts = [c.strip() for c in contexto.split(",")]
    parts = [c for c in parts if c]
    return parts if parts else None


def split_text(text: str, chunk_size: int = 800, overlap: int = 100) -> list[str]:
    """Split text into overlapping chunks for embedding.

    Strategy:
    1. Split on double newlines (paragraphs).
    2. If a paragraph exceeds chunk_size, split on sentence boundaries (periods).
    3. Accumulate paragraphs/sentences into chunks with the specified overlap.
    """
    # Split into paragraphs
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]

    # Further split large paragraphs into sentences
    segments: list[str] = []
    for para in paragraphs:
        if len(para) <= chunk_size:
            segments.append(para)
        else:
            # Split on sentence boundaries
            sentences = _split_sentences(para)
            segments.extend(sentences)

    if not segments:
        return [text[:chunk_size]] if text.strip() else []

    # Build chunks with overlap
    chunks: list[str] = []
    current_chunk = ""

    for segment in segments:
        # If adding this segment would exceed chunk_size, finalize current chunk
        if current_chunk and len(current_chunk) + len(segment) + 1 > chunk_size:
            chunks.append(current_chunk.strip())
            # Start new chunk with overlap from end of previous
            if overlap > 0 and len(current_chunk) > overlap:
                current_chunk = current_chunk[-overlap:] + " " + segment
            else:
                current_chunk = segment
        else:
            if current_chunk:
                current_chunk += " " + segment
            else:
                current_chunk = segment

    # Don't forget the last chunk
    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    return chunks


def _split_sentences(text: str) -> list[str]:
    """Split text on sentence boundaries (periods followed by space or end)."""
    sentences: list[str] = []
    current = ""
    i = 0
    while i < len(text):
        current += text[i]
        # Check for sentence end: period followed by space, newline, or end of text
        if text[i] == "." and (i + 1 >= len(text) or text[i + 1] in (" ", "\n", "\t")):
            if current.strip():
                sentences.append(current.strip())
            current = ""
        i += 1

    if current.strip():
        sentences.append(current.strip())

    return sentences if sentences else [text]


async def process_file(file: TrainFileRequest) -> None:
    """Main orchestration: extract, enrich, embed, store, and callback."""
    logger.info("Processing file: %s (%s)", file.nombre, file.id)

    enriched_context = "conocimiento general"
    start_time = datetime.now(timezone.utc)
    stored_ids: list[str] = []

    try:
        file_ext = os.path.splitext(file.path)[1].lower()
        manual_contexts = parse_manual_contexts(file.contexto)
        is_image = file_ext in IMAGE_EXTENSIONS

        # Step 1: Extract text (or describe image via vision model)
        if is_image:
            logger.info("Image file detected, using vision model for '%s'", file.nombre)
            text = await ollama_client.describe_image(file.path, settings.OLLAMA_MODEL_VISION)
        else:
            text = extractor.extract_text(file.path)

        if not text or len(text.strip()) < MIN_TEXT_LENGTH:
            logger.warning(
                "File '%s' has insufficient text (%d chars), using fallback context",
                file.nombre,
                len(text.strip()) if text else 0,
            )
            await _callback_backend(file.id, enriched_context, start_time)
            return

        # Step 2: Enrich context with LLM (skip for .md/.txt and images)
        if is_image or file_ext in SKIP_LLM_EXTENSIONS:
            logger.info("Skipping LLM enrichment for '%s' (%s)", file.nombre, "image" if is_image else "plain text")
            enriched_context = ", ".join(manual_contexts) if manual_contexts else "conocimiento general"
        else:
            enriched_context = await ollama_client.enrich_context(
                text,
                manual_contexts,
                settings.OLLAMA_MODEL_CONTEXT,
            )

        # Step 3: Split text into chunks
        chunks = split_text(text, chunk_size=800, overlap=100)
        logger.info("Split text into %d chunks for file '%s'", len(chunks), file.nombre)

        if not chunks:
            logger.warning("No chunks generated for file '%s'", file.nombre)
            await _callback_backend(file.id, enriched_context, start_time)
            return

        # Step 4: Generate embeddings for each chunk
        embeddings: list[list[float]] = []
        for i, chunk in enumerate(chunks):
            logger.debug("Generating embedding for chunk %d/%d of '%s'", i + 1, len(chunks), file.nombre)
            embedding = await ollama_client.generate_embedding(chunk, settings.OLLAMA_MODEL_EMBEDDING)
            embeddings.append(embedding)

        logger.info("Generated %d embeddings for file '%s'", len(embeddings), file.nombre)

        # Step 5: Parse context keywords and store in ChromaDB
        context_keywords = [kw.strip() for kw in enriched_context.split(",") if kw.strip()]
        if not context_keywords:
            context_keywords = ["conocimiento general"]

        stored_ids = chroma_client.store_chunks(
            archivo_id=file.id,
            nombre=file.nombre,
            chunks=chunks,
            embeddings=embeddings,
            contexts=context_keywords,
        )

        logger.info("File processed successfully: %s", file.nombre)

    except Exception:
        logger.exception("Error processing file '%s' (%s)", file.nombre, file.id)

    # Step 6: Always attempt callback, even on error
    chroma_db_ids = ",".join(stored_ids) if stored_ids else None
    await _callback_backend(file.id, enriched_context, start_time, chroma_db_ids)


async def _callback_backend(
    archivo_id: str,
    contexto: str,
    start_time: datetime,
    chroma_db_ids: str | None = None,
) -> None:
    """Notify the backend that file processing is complete."""
    end_time = datetime.now(timezone.utc)
    url = f"{settings.BACKEND_URL}/api/archivos/{archivo_id}/procesado"
    logger.info("Sending callback to backend: PUT %s", url)

    payload: dict = {
        "contexto": contexto,
        "procesamientoInicio": start_time.isoformat(),
        "procesamientoFin": end_time.isoformat(),
    }

    if chroma_db_ids:
        payload["chromaDbIds"] = chroma_db_ids

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.put(url, json=payload)
            resp.raise_for_status()
            elapsed = (end_time - start_time).total_seconds()
            logger.info(
                "Backend callback successful for archivo %s (status %d, %.1fs elapsed)",
                archivo_id, resp.status_code, elapsed,
            )
    except Exception:
        logger.exception("Failed to send callback to backend for archivo %s", archivo_id)
