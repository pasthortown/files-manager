import logging
import re

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


async def ensure_model(model_name: str) -> None:
    """Check if a model exists in Ollama and pull it if not found."""
    logger.info("Checking availability of model '%s' at %s", model_name, settings.OLLAMA_URL)

    async with httpx.AsyncClient(base_url=settings.OLLAMA_URL, timeout=10.0) as client:
        try:
            resp = await client.get("/api/tags")
            resp.raise_for_status()
            data = resp.json()

            model_names = [m.get("name", "") for m in data.get("models", [])]
            # Check both exact match and match without tag (e.g. "gemma3:4b" matches "gemma3:4b")
            if any(model_name == name or model_name == name.split(":")[0] for name in model_names):
                logger.info("Model '%s' is already available", model_name)
                return
        except Exception:
            logger.exception("Failed to check existing models, will attempt pull anyway")

    logger.info("Model '%s' not found, pulling...", model_name)
    async with httpx.AsyncClient(base_url=settings.OLLAMA_URL, timeout=600.0) as client:
        try:
            resp = await client.post("/api/pull", json={"name": model_name, "stream": False})
            resp.raise_for_status()
            logger.info("Model '%s' pulled successfully", model_name)
        except Exception:
            logger.exception("Failed to pull model '%s'", model_name)
            raise


async def enrich_context(
    text: str,
    manual_contexts: list[str] | None,
    model: str,
) -> str:
    """Use an LLM to analyze document text and generate classification keywords.

    Returns a comma-separated string of keywords. On failure returns 'conocimiento general'.
    """
    truncated_text = text[:4000]

    manual_instruction = ""
    if manual_contexts:
        terms = ", ".join(manual_contexts)
        manual_instruction = (
            f"\nEl usuario ha proporcionado los siguientes términos de contexto: {terms}. "
            "Debes incluir y enriquecer estos términos en tu respuesta, añadiendo sinónimos "
            "o términos relacionados que complementen la clasificación."
        )

    prompt = (
        "Analiza el siguiente fragmento de un documento y genera entre 3 y 8 palabras clave "
        "de clasificación que describan el tema, área de conocimiento y contenido principal del documento. "
        "Las palabras clave deben ser útiles para organizar y buscar este documento en una base de conocimiento."
        f"{manual_instruction}\n\n"
        "Responde ÚNICAMENTE con las palabras clave separadas por comas, sin explicaciones adicionales, "
        "sin numeración y sin puntos al final.\n\n"
        f"Documento:\n{truncated_text}"
    )

    try:
        async with httpx.AsyncClient(base_url=settings.OLLAMA_URL, timeout=120.0) as client:
            resp = await client.post(
                "/api/generate",
                json={
                    "model": model,
                    "prompt": prompt,
                    "stream": False,
                },
            )
            resp.raise_for_status()
            data = resp.json()

        raw_response = data.get("response", "")
        keywords = _parse_keywords(raw_response)

        if not keywords:
            logger.warning("LLM returned no parseable keywords, using fallback")
            return "conocimiento general"

        result = ", ".join(keywords)
        logger.info("Enriched context keywords: %s", result)
        return result

    except Exception:
        logger.exception("Error during context enrichment with model '%s'", model)
        return "conocimiento general"


def _parse_keywords(raw: str) -> list[str]:
    """Parse, clean, deduplicate and return keywords from LLM response."""
    # Remove common artifacts like numbering, bullets, dashes at start of lines
    cleaned = re.sub(r"^[\d\.\-\*\#]+\s*", "", raw, flags=re.MULTILINE)
    # Split by commas or newlines
    parts = re.split(r"[,\n]+", cleaned)

    seen: set[str] = set()
    keywords: list[str] = []
    for part in parts:
        kw = part.strip().lower().rstrip(".")
        # Remove any remaining quotes
        kw = kw.strip("\"'")
        if kw and kw not in seen and len(kw) >= 2:
            seen.add(kw)
            keywords.append(kw)

    return keywords


async def generate_embedding(text: str, model: str) -> list[float]:
    """Generate an embedding vector for the given text using Ollama."""
    async with httpx.AsyncClient(base_url=settings.OLLAMA_URL, timeout=30.0) as client:
        resp = await client.post(
            "/api/embed",
            json={
                "model": model,
                "input": text,
            },
        )
        resp.raise_for_status()
        data = resp.json()

    embeddings = data.get("embeddings", [])
    if not embeddings:
        raise ValueError(f"No embeddings returned from Ollama for model '{model}'")

    return embeddings[0]
