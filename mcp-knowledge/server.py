import os
import json
import logging
from urllib.parse import urlparse

import httpx
import chromadb
from mcp.server.fastmcp import FastMCP

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://172.16.5.40:11434")
CHROMA_URL = os.getenv("CHROMA_URL", "http://172.16.5.41:8000")
OLLAMA_MODEL_CONTEXT = os.getenv("OLLAMA_MODEL_CONTEXT", "gemma3:4b")
OLLAMA_MODEL_EMBEDDING = os.getenv("OLLAMA_MODEL_EMBEDDING", "nomic-embed-text")

mcp = FastMCP(
    name="mcp-knowledge",
    host="0.0.0.0",
    port=8000,
)


def _get_chroma_client() -> chromadb.HttpClient:
    parsed = urlparse(CHROMA_URL)
    return chromadb.HttpClient(host=parsed.hostname or "localhost", port=parsed.port or 8000)


async def _generate_embedding(text: str) -> list[float]:
    async with httpx.AsyncClient(base_url=OLLAMA_URL, timeout=30.0) as client:
        resp = await client.post("/api/embed", json={"model": OLLAMA_MODEL_EMBEDDING, "input": text})
        resp.raise_for_status()
        data = resp.json()
    embeddings = data.get("embeddings", [])
    if not embeddings:
        raise ValueError("No embeddings returned from Ollama")
    return embeddings[0]


@mcp.tool(
    description="Listar las colecciones de conocimiento disponibles en la base de datos vectorial.",
)
async def list_collections() -> str:
    """List available knowledge collections in ChromaDB."""
    client = _get_chroma_client()
    collections = client.list_collections()

    results = []
    for col in collections:
        results.append({
            "name": col.name,
            "document_count": col.count(),
        })

    return json.dumps({"total": len(results), "collections": results}, ensure_ascii=False, indent=2)


@mcp.tool(
    description="Busqueda semantica en la base de conocimiento. Genera embedding de la consulta y busca documentos similares en ChromaDB.",
)
async def search_documents(query: str, collection: str | None = None, limit: int = 5) -> str:
    """Semantic search in the knowledge base."""
    embedding = await _generate_embedding(query)
    client = _get_chroma_client()

    target_collections = []
    if collection:
        try:
            target_collections.append(client.get_collection(name=collection))
        except Exception:
            return json.dumps({"error": f"Coleccion '{collection}' no encontrada"})
    else:
        target_collections = client.list_collections()

    if not target_collections:
        return json.dumps({"error": "No hay colecciones disponibles"})

    all_results = []
    for col in target_collections:
        if col.count() == 0:
            continue
        try:
            results = col.query(
                query_embeddings=[embedding],
                n_results=min(limit, col.count()),
                include=["documents", "metadatas", "distances"],
            )
            for i in range(len(results["ids"][0])):
                all_results.append({
                    "collection": col.name,
                    "document": results["documents"][0][i],
                    "metadata": results["metadatas"][0][i],
                    "distance": results["distances"][0][i],
                })
        except Exception as e:
            logger.warning("Error querying collection '%s': %s", col.name, e)

    all_results.sort(key=lambda x: x["distance"])
    all_results = all_results[:limit]

    return json.dumps({"total": len(all_results), "results": all_results}, ensure_ascii=False, indent=2)


@mcp.tool(
    description="Hacer una pregunta a la base de conocimiento usando RAG. Busca documentos relevantes y genera una respuesta con IA.",
)
async def ask_question(question: str, collection: str | None = None) -> str:
    """Ask a question using RAG (Retrieval Augmented Generation)."""
    # Step 1: Search relevant documents
    search_result = json.loads(await search_documents(question, collection, limit=5))

    if "error" in search_result:
        return json.dumps(search_result)

    results = search_result.get("results", [])
    if not results:
        return json.dumps({
            "answer": "No se encontraron documentos relevantes en la base de conocimiento para responder esta pregunta.",
            "sources": [],
        }, ensure_ascii=False)

    # Step 2: Build RAG context
    context_parts = []
    sources = set()
    for r in results:
        nombre = r.get("metadata", {}).get("nombre", "Documento desconocido")
        sources.add(nombre)
        context_parts.append(f"{r['document']}\n[Fuente: {nombre}]")

    context = "\n\n".join(context_parts)

    prompt = (
        "Eres un asistente de conocimiento. Responde la pregunta del usuario basandote "
        "UNICAMENTE en el contexto proporcionado. "
        "Si la informacion no esta en el contexto, indica que no tienes suficiente informacion para responder. "
        "Cita las fuentes (nombre del documento) cuando sea posible.\n\n"
        f"Contexto:\n---\n{context}\n---\n\n"
        f"Pregunta: {question}\n\n"
        "Respuesta:"
    )

    # Step 3: Generate answer with LLM
    try:
        async with httpx.AsyncClient(base_url=OLLAMA_URL, timeout=120.0) as client:
            resp = await client.post("/api/generate", json={
                "model": OLLAMA_MODEL_CONTEXT,
                "prompt": prompt,
                "stream": False,
            })
            resp.raise_for_status()
            data = resp.json()

        answer = data.get("response", "").strip()
    except Exception as e:
        logger.error("Error generating answer: %s", e)
        answer = "Error al generar la respuesta con el modelo de IA."

    return json.dumps({
        "answer": answer,
        "sources": sorted(sources),
        "collection_searched": collection or "todas",
    }, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    logger.info("Starting mcp-knowledge server")
    logger.info("Ollama URL: %s", OLLAMA_URL)
    logger.info("ChromaDB URL: %s", CHROMA_URL)
    logger.info("Context model: %s", OLLAMA_MODEL_CONTEXT)
    logger.info("Embedding model: %s", OLLAMA_MODEL_EMBEDDING)
    mcp.run(transport="sse")
