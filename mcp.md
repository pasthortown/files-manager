# MCP Servers - Guia de Interaccion

## Informacion General

El proyecto cuenta con dos servidores MCP (Model Context Protocol) que exponen herramientas via **SSE (Server-Sent Events)**.

| Servidor | Puerto | Endpoint SSE | Descripcion |
|---|---|---|---|
| **mcp-files** | 8300 | `http://10.1.1.168:8300/sse` | Gestion de archivos del sistema |
| **mcp-knowledge** | 8301 | `http://10.1.1.168:8301/sse` | Base de conocimiento con RAG |

**Protocolo:** MCP sobre SSE (FastMCP + uvicorn)
**Version de protocolo:** `2024-11-05`

---

## Flujo de Conexion

La comunicacion con los MCP servers sigue 3 pasos:

### 1. Abrir conexion SSE (mantener abierta)

```bash
curl -s -N http://10.1.1.168:8300/sse >> /tmp/mcp_sse_output.txt &
SSE_PID=$!
sleep 1
```

El servidor responde con un evento `endpoint` que contiene el `session_id`:

```
event: endpoint
data: /messages/?session_id=<uuid>
```

Extraer el session ID:

```bash
SESSION_ID=$(grep "data:" /tmp/mcp_sse_output.txt | head -1 | sed 's/data: //' | tr -d '[:space:]')
URL="http://10.1.1.168:8300${SESSION_ID}"
```

### 2. Inicializar la sesion

```bash
curl -s -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {"name": "mi-cliente", "version": "1.0"}
    }
  }'
```

La respuesta llega por el stream SSE como evento `message`.

### 3. Llamar herramientas

```bash
curl -s -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "<nombre_herramienta>",
      "arguments": { ... }
    }
  }'
```

### 4. Leer respuestas

Las respuestas se reciben por el stream SSE (el archivo donde se redirige la salida):

```bash
cat /tmp/mcp_sse_output.txt
```

### 5. Cerrar conexion

```bash
kill $SSE_PID
```

---

## mcp-files (puerto 8300)

Gestiona los archivos almacenados en el sistema. Se comunica internamente con el backend .NET en `http://172.16.5.11:8080`.

### Herramientas disponibles

#### `search_files`

Busca y lista archivos del sistema. Si se proporciona `query`, filtra por nombre, descripcion, contexto u observaciones.

**Parametros:**

| Parametro | Tipo | Requerido | Descripcion |
|---|---|---|---|
| `query` | string | No | Termino de busqueda para filtrar archivos |

**Ejemplo - Listar todos:**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "search_files",
    "arguments": {}
  }
}
```

**Ejemplo - Buscar por termino:**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "search_files",
    "arguments": {"query": "imagen"}
  }
}
```

**Respuesta:**

```json
{
  "total": 3,
  "archivos": [
    {
      "id": "025a70ce-...",
      "nombre": "mi-archivo",
      "descripcion": "Descripcion del archivo",
      "observaciones": "Notas adicionales",
      "contexto": "etiquetas, separadas, por, coma",
      "tipo": "PNG",
      "procesado": true,
      "createdAt": "2026-04-08T15:29:26.517968",
      "updatedAt": "2026-04-08T19:54:33.808112"
    }
  ]
}
```

---

#### `get_file_details`

Obtiene los metadatos completos de un archivo por su ID (GUID).

**Parametros:**

| Parametro | Tipo | Requerido | Descripcion |
|---|---|---|---|
| `file_id` | string | Si | UUID del archivo |

**Ejemplo:**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "get_file_details",
    "arguments": {"file_id": "025a70ce-3fb8-48d3-ef3a-08de95833f5a"}
  }
}
```

---

#### `get_download_link`

Obtiene el enlace de descarga para un archivo por su ID.

**Parametros:**

| Parametro | Tipo | Requerido | Descripcion |
|---|---|---|---|
| `file_id` | string | Si | UUID del archivo |

**Ejemplo:**

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "get_download_link",
    "arguments": {"file_id": "025a70ce-3fb8-48d3-ef3a-08de95833f5a"}
  }
}
```

**Respuesta:**

```json
{
  "nombre": "mi-archivo",
  "url": "http://localhost:5000/api/archivos/025a70ce-.../download",
  "instrucciones": "Usa este enlace para descargar el archivo 'mi-archivo'"
}
```

---

## mcp-knowledge (puerto 8301)

Base de conocimiento con busqueda semantica y RAG. Usa **ChromaDB** para vectores, **Ollama** para embeddings y generacion de respuestas.

**Modelos configurados:**

| Funcion | Modelo | URL |
|---|---|---|
| Embeddings | `nomic-embed-text` | Ollama (172.16.5.40:11434) |
| Contexto/RAG | `gemma3:4b` | Ollama (172.16.5.40:11434) |
| Vectores | ChromaDB | 172.16.5.41:8000 |

### Herramientas disponibles

#### `list_collections`

Lista las colecciones de conocimiento disponibles en ChromaDB.

**Parametros:** Ninguno

**Ejemplo:**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "list_collections",
    "arguments": {}
  }
}
```

**Respuesta:**

```json
{
  "total": 2,
  "collections": [
    {"name": "mi-coleccion", "document_count": 15}
  ]
}
```

---

#### `search_documents`

Busqueda semantica en la base de conocimiento. Genera un embedding de la consulta y busca documentos similares en ChromaDB.

**Parametros:**

| Parametro | Tipo | Requerido | Descripcion |
|---|---|---|---|
| `query` | string | Si | Texto de busqueda |
| `collection` | string | No | Nombre de coleccion especifica (si no se indica, busca en todas) |
| `limit` | int | No | Cantidad maxima de resultados (default: 5) |

**Ejemplo:**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "search_documents",
    "arguments": {"query": "como se configura el servidor", "limit": 3}
  }
}
```

**Respuesta:**

```json
{
  "total": 3,
  "results": [
    {
      "collection": "nombre-coleccion",
      "document": "Contenido del fragmento...",
      "metadata": {"nombre": "archivo-fuente", "chunk_index": 0},
      "distance": 0.45
    }
  ]
}
```

> **Nota:** Menor `distance` = mayor relevancia semantica.

---

#### `ask_question`

Hace una pregunta a la base de conocimiento usando RAG (Retrieval Augmented Generation). Busca documentos relevantes y genera una respuesta con IA.

**Parametros:**

| Parametro | Tipo | Requerido | Descripcion |
|---|---|---|---|
| `question` | string | Si | Pregunta en lenguaje natural |
| `collection` | string | No | Coleccion especifica donde buscar |

**Ejemplo:**

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "ask_question",
    "arguments": {"question": "Que archivos tenemos sobre arquitectura?"}
  }
}
```

**Respuesta:**

```json
{
  "answer": "Respuesta generada por el modelo basada en los documentos...",
  "sources": ["archivo-fuente-1", "archivo-fuente-2"],
  "collection_searched": "todas"
}
```

> **Nota:** El timeout para generacion de respuestas es de 120 segundos dado que usa un modelo local (gemma3:4b via Ollama).

---

## Script Completo de Ejemplo

```bash
#!/bin/bash
# Ejemplo: listar archivos via mcp-files

MCP_HOST="http://10.1.1.168:8300"
OUTPUT="/tmp/mcp_sse_output.txt"

rm -f "$OUTPUT"

# 1. Abrir conexion SSE
curl -s -N "$MCP_HOST/sse" >> "$OUTPUT" &
SSE_PID=$!
sleep 1

# 2. Obtener session ID
SESSION_ID=$(grep "data:" "$OUTPUT" | head -1 | sed 's/data: //' | tr -d '[:space:]')
URL="${MCP_HOST}${SESSION_ID}"

# 3. Inicializar
curl -s -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"script","version":"1.0"}}}' > /dev/null
sleep 2

# 4. Llamar herramienta
curl -s -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"search_files","arguments":{}}}' > /dev/null
sleep 3

# 5. Leer respuesta del stream SSE
cat "$OUTPUT"

# 6. Cerrar
kill $SSE_PID 2>/dev/null
rm -f "$OUTPUT"
```

---

## Configuracion Docker

Los MCP servers se despliegan con `docker-compose-mcp.yml`:

| Contenedor | IP Interna | Puerto Host | Puerto Container |
|---|---|---|---|
| mcp-files | 172.16.5.50 | 8300 | 8000 |
| mcp-knowledge | 172.16.5.51 | 8301 | 8000 |

Ambos pertenecen a la red `app-network` (172.16.5.0/24).
