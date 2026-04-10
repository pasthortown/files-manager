import logging
import re
from urllib.parse import urlparse

import chromadb

from app.config import settings

logger = logging.getLogger(__name__)


def _get_client() -> chromadb.HttpClient:
    """Create a ChromaDB HTTP client from the configured URL."""
    parsed = urlparse(settings.CHROMA_URL)
    host = parsed.hostname or "localhost"
    port = parsed.port or 8000
    return chromadb.HttpClient(host=host, port=port)


def _sanitize_collection_name(name: str) -> str:
    """Sanitize a string into a valid ChromaDB collection name.

    Rules: 3-63 chars, alphanumeric + underscore, no leading/trailing underscores.
    """
    # Lowercase and replace spaces/hyphens with underscores
    sanitized = name.lower().strip()
    sanitized = re.sub(r"[\s\-]+", "_", sanitized)
    # Remove any character that is not alphanumeric or underscore
    sanitized = re.sub(r"[^a-z0-9_]", "", sanitized)
    # Collapse multiple underscores
    sanitized = re.sub(r"_+", "_", sanitized)
    # Strip leading/trailing underscores
    sanitized = sanitized.strip("_")

    # Ensure minimum length of 3
    if len(sanitized) < 3:
        sanitized = sanitized + "_col" if sanitized else "default_col"
        sanitized = sanitized[:63]

    # Truncate to max 63 characters
    sanitized = sanitized[:63].rstrip("_")

    # Final safety: if still too short after rstrip
    if len(sanitized) < 3:
        sanitized = "default_col"

    return sanitized


def store_chunks(
    archivo_id: str,
    nombre: str,
    chunks: list[str],
    embeddings: list[list[float]],
    contexts: list[str],
) -> list[str]:
    """Store document chunks with embeddings into ChromaDB collections.

    Creates one collection per context keyword and upserts all chunks into each.
    Returns the list of chunk IDs that were stored.
    """
    if not chunks:
        logger.warning("No chunks to store for file '%s'", nombre)
        return []

    client = _get_client()

    ids = [f"{archivo_id}_chunk_{i}" for i in range(len(chunks))]
    metadatas = [
        {
            "archivo_id": archivo_id,
            "chunk_index": i,
            "nombre": nombre,
        }
        for i in range(len(chunks))
    ]

    for context_keyword in contexts:
        collection_name = _sanitize_collection_name(context_keyword)
        logger.info(
            "Storing %d chunks into collection '%s' (from context '%s') for file '%s'",
            len(chunks),
            collection_name,
            context_keyword,
            nombre,
        )

        try:
            collection = client.get_or_create_collection(
                name=collection_name,
                metadata={"hnsw:space": "cosine"},
            )

            collection.upsert(
                ids=ids,
                documents=chunks,
                embeddings=embeddings,
                metadatas=metadatas,
            )

            logger.info(
                "Successfully stored chunks in collection '%s' (total items: %d)",
                collection_name,
                collection.count(),
            )
        except Exception:
            logger.exception(
                "Failed to store chunks in collection '%s' for file '%s'",
                collection_name,
                nombre,
            )
            raise

    return ids


def delete_by_ids(ids: list[str]) -> None:
    """Delete chunks by their IDs from all ChromaDB collections."""
    if not ids:
        logger.warning("No IDs provided for deletion")
        return

    client = _get_client()
    collections = client.list_collections()

    for collection in collections:
        try:
            collection.delete(ids=ids)
            logger.info(
                "Deleted %d IDs from collection '%s'",
                len(ids),
                collection.name,
            )
        except Exception:
            logger.exception(
                "Failed to delete IDs from collection '%s'",
                collection.name,
            )
