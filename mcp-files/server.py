import os
import json
import logging

import httpx
from mcp.server.fastmcp import FastMCP

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

BACKEND_URL = os.getenv("BACKEND_URL", "http://172.16.5.11:8080")
DOWNLOAD_BASE_URL = os.getenv("DOWNLOAD_BASE_URL", BACKEND_URL)

mcp = FastMCP(
    name="mcp-files",
    host="0.0.0.0",
    port=8000,
)


@mcp.tool(
    description="Buscar y listar archivos del sistema. Si se proporciona query, filtra por nombre, descripcion, contexto u observaciones.",
)
async def search_files(query: str | None = None) -> str:
    """Search and list files from the system."""
    async with httpx.AsyncClient(base_url=BACKEND_URL, timeout=15.0) as client:
        resp = await client.get("/api/archivos")
        resp.raise_for_status()
        data = resp.json()

    if not data.get("success"):
        return json.dumps({"error": data.get("message", "Error al obtener archivos")})

    archivos = data.get("data", [])

    if query:
        term = query.lower()
        archivos = [
            a for a in archivos
            if term in (a.get("nombre") or "").lower()
            or term in (a.get("descripcion") or "").lower()
            or term in (a.get("contexto") or "").lower()
            or term in (a.get("observaciones") or "").lower()
        ]

    results = []
    for a in archivos:
        results.append({
            "id": a["id"],
            "nombre": a["nombre"],
            "descripcion": a.get("descripcion"),
            "observaciones": a.get("observaciones"),
            "contexto": a.get("contexto"),
            "tipo": (a.get("path") or "").rsplit(".", 1)[-1].upper() if a.get("path") else None,
            "procesado": a.get("procesado"),
            "createdAt": a.get("createdAt"),
            "updatedAt": a.get("updatedAt"),
        })

    return json.dumps({"total": len(results), "archivos": results}, ensure_ascii=False, indent=2)


@mcp.tool(
    description="Obtener los metadatos completos de un archivo por su ID (GUID).",
)
async def get_file_details(file_id: str) -> str:
    """Get complete metadata for a specific file."""
    async with httpx.AsyncClient(base_url=BACKEND_URL, timeout=15.0) as client:
        resp = await client.get(f"/api/archivos/{file_id}")

        if resp.status_code == 404:
            return json.dumps({"error": f"Archivo con ID '{file_id}' no encontrado"})

        resp.raise_for_status()
        data = resp.json()

    if not data.get("success"):
        return json.dumps({"error": data.get("message", "Error")})

    archivo = data["data"]
    archivo["tipo"] = (archivo.get("path") or "").rsplit(".", 1)[-1].upper()
    return json.dumps(archivo, ensure_ascii=False, indent=2)


@mcp.tool(
    description="Obtener el enlace de descarga para un archivo por su ID (GUID).",
)
async def get_download_link(file_id: str) -> str:
    """Get the download URL for a file."""
    async with httpx.AsyncClient(base_url=BACKEND_URL, timeout=15.0) as client:
        resp = await client.get(f"/api/archivos/{file_id}")

        if resp.status_code == 404:
            return json.dumps({"error": f"Archivo con ID '{file_id}' no encontrado"})

        resp.raise_for_status()
        data = resp.json()

    if not data.get("success"):
        return json.dumps({"error": data.get("message", "Error")})

    archivo = data["data"]
    download_url = f"{DOWNLOAD_BASE_URL}/api/archivos/{file_id}/download"

    return json.dumps({
        "nombre": archivo["nombre"],
        "url": download_url,
        "instrucciones": f"Usa este enlace para descargar el archivo '{archivo['nombre']}'",
    }, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    logger.info("Starting mcp-files server")
    logger.info("Backend URL: %s", BACKEND_URL)
    logger.info("Download base URL: %s", DOWNLOAD_BASE_URL)
    mcp.run(transport="sse")
