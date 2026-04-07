# Infraestructura del Servidor

## Servidor
- **Host:** 10.1.1.168
- **SO:** Debian 13 (trixie)
- **IP:** Estatica

---

## Servicios Disponibles

### Ollama (LLM Server)
- **Puerto:** 11434
- **Acceso:** HTTP `http://10.1.1.168:11434`
- **Autenticacion:** Sin autenticacion
- **Modelos disponibles:** nomic-embed-text
- **Datos:** `/docker/ollama/datos`

### ChromaDB (Vector Database)
- **Puerto:** 8000
- **Acceso:** HTTP API v2 `http://10.1.1.168:8000`
- **Autenticacion:** Sin autenticacion
- **Datos:** `/docker/chromadb/datos`

### MongoDB
- **Puerto:** 27017
- **Acceso:** `mongodb://admin:admin123@10.1.1.168:27017`
- **Usuario:** admin
- **Password:** admin123
- **Datos:** `/docker/mongodb/datos`

### SQL Server 2022
- **Puerto:** 1433
- **Acceso:** `Server=10.1.1.168,1433;User Id=sa;Password=SqlServer2024!`
- **Usuario:** sa
- **Password:** SqlServer2024!
- **Datos:** `/docker/sqlserver/datos`

---

## Docker Compose
Cada servicio tiene su propio `docker-compose.yml` en:
- `/docker/ollama/docker-compose.yml`
- `/docker/chromadb/docker-compose.yml`
- `/docker/mongodb/docker-compose.yml`
- `/docker/sqlserver/docker-compose.yml`

Todos configurados con `restart: unless-stopped` y volumenes persistentes en `./datos`.
