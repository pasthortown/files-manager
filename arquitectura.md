# Arquitectura del Sistema - Administrador de Archivos

## Vision General

Sistema de gestion documental con capacidades de aprendizaje automatico. Permite cargar, organizar y procesar documentos para generar embeddings semanticos almacenados en una base de datos vectorial.

## Diagrama de Arquitectura

```
                        +-----------+
                        |  Usuario  |
                        +-----+-----+
                              |
                              | HTTP :8080
                              v
                    +-------------------+
                    |   Frontend        |
                    |   (nginx:alpine)  |
                    |   172.16.5.10     |
                    +--------+----------+
                             |
                    /api/*   | proxy reverso
                             v
                    +-------------------+
                    |   Backend         |
                    |   (.NET 8 API)    |
                    |   172.16.5.11     |
                    +--+-----+------+--+
                       |     |      |
              SQL      |     |      | HTTP POST /train
              :1433    |     |      |
                       v     |      v
              +--------+-+   |   +--+---------------+
              | SQL Server|   |   |  Trainer         |
              | 2022      |   |   |  (Python/FastAPI)|
              | 172.16.5  |   |   |  172.16.5.42     |
              | .30       |   |   +--+----------+----+
              +-----------+   |      |          |
                              |      |          |
               PUT /procesado |      |          |
               (callback)     |      v          v
                    +---------+ +----+---+ +----+----+
                                | Ollama | | ChromaDB|
                                | LLM +  | | Vectores|
                                | Embed  | |         |
                                |172.16  | |172.16   |
                                |.5.40   | |.5.41    |
                                +--------+ +---------+
```

## Componentes

### Frontend (172.16.5.10:80 -> Host :8080)
- **Tecnologia:** React 18 + TypeScript + Vite
- **Servidor:** nginx:alpine
- **Funcion:** SPA con dos modulos:
  - **Gestion Documental:** CRUD de archivos (subir, editar, eliminar, descargar)
  - **Administracion de Memoria:** Seleccion y envio de archivos al pipeline de aprendizaje
- **Compilacion:** Local con `npm run build`, resultado copiado a `./html/`

### Backend (172.16.5.11:8080 -> Host :5000)
- **Tecnologia:** .NET 8, ASP.NET Core Web API, Arquitectura Hexagonal
- **Capas:**
  - `FilesManager.Domain` - Entidades, interfaces de repositorios
  - `FilesManager.Application` - DTOs, servicios, validadores, mappings
  - `FilesManager.Infrastructure` - EF Core, repositorios, servicios externos
  - `FilesManager.API` - Controllers, middleware, configuracion
- **Base de datos:** SQL Server 2022 via Entity Framework Core
- **Endpoints principales:**
  - `GET/POST/PUT/DELETE /api/archivos` - CRUD de archivos
  - `POST /api/archivos/aprender` - Inicia pipeline de aprendizaje
  - `PUT /api/archivos/{id}/procesado` - Callback del trainer
  - `GET /api/archivos/{id}/download` - Descarga de archivos

### Trainer Service (172.16.5.42:8000 -> Host :8200)
- **Tecnologia:** Python 3.12, FastAPI
- **Funcion:** Pipeline de procesamiento documental:
  1. Extraccion de texto (PDF, DOCX, XLSX, CSV, TXT)
  2. Enriquecimiento de contexto via LLM (Ollama)
  3. Division en chunks con overlap
  4. Generacion de embeddings (Ollama)
  5. Almacenamiento en ChromaDB (1 coleccion por contexto)
  6. Callback al backend con resultado
- **Endpoint:** `POST /train`
- **Auto-pull:** Descarga modelos de Ollama automaticamente si no existen

### Ollama (172.16.5.40:11434 -> Host :11434)
- **Funcion:** Servidor de modelos de IA
- **Modelos configurables via .env:**
  - `OLLAMA_MODEL_CONTEXT` - LLM para enriquecer contextos (default: gemma3:4b)
  - `OLLAMA_MODEL_EMBEDDING` - Modelo de embeddings (default: nomic-embed-text)

### ChromaDB (172.16.5.41:8000 -> Host :8100)
- **Funcion:** Base de datos vectorial
- **Estrategia:** Una coleccion por keyword de contexto
- **Metadata:** archivo_id, chunk_index, nombre

### SQL Server (172.16.5.30:1433 -> Host :1433)
- **Base de datos:** FilesManagerDB
- **Tabla principal:** Archivos (Id, Nombre, Descripcion, Observaciones, Path, Contexto, Procesado, EnProcesamiento, CreatedAt, UpdatedAt)

## Red Docker

| Servicio   | IP            | Puerto Host | Puerto Container |
|------------|---------------|-------------|------------------|
| frontend   | 172.16.5.10   | 8080        | 80               |
| backend    | 172.16.5.11   | 5000        | 8080             |
| sqlserver  | 172.16.5.30   | 1433        | 1433             |
| ollama     | 172.16.5.40   | 11434       | 11434            |
| chromadb   | 172.16.5.41   | 8100        | 8000             |
| trainer    | 172.16.5.42   | 8200        | 8000             |

Red: `app-network` (bridge), Subnet: `172.16.5.0/24`, Gateway: `172.16.5.1`

## Docker Compose Files

| Archivo                   | Contenido                              |
|---------------------------|----------------------------------------|
| `docker-compose.yml`      | Frontend + Backend                     |
| `docker-compose-sql.yml`  | SQL Server (desarrollo local)          |
| `docker-compose-ai.yml`   | Ollama + ChromaDB + Trainer            |
| `docker-compose.sonar.yml`| SonarQube Quality + OWASP              |

## Variables de Entorno (.env)

```
# Database
DB_SERVER=sqlserver          # Produccion: 10.1.1.168
DB_PORT=1433
DB_NAME=FilesManagerDB
DB_USER=sa
DB_PASSWORD=SqlServer2024!

# AI Models
OLLAMA_MODEL_CONTEXT=gemma3:4b
OLLAMA_MODEL_EMBEDDING=nomic-embed-text

# Trainer
TRAINER_URL=http://172.16.5.42:8000
```

## Flujo de Aprendizaje

```
1. Usuario selecciona archivos en "Administracion de Memoria"
2. Click en "Aprender" -> Dialogo de confirmacion
3. Frontend POST /api/archivos/aprender { archivoIds: [...] }
4. Backend marca archivos como EnProcesamiento=true
5. Backend envia POST /train al Trainer (fire-and-forget)
6. Frontend inicia polling cada 5s (muestra spinners)
7. Trainer por cada archivo:
   a. Extrae texto segun extension
   b. Envia texto al LLM para enriquecer contexto
   c. Divide texto en chunks (~800 chars)
   d. Genera embeddings por chunk
   e. Almacena en ChromaDB (1 coleccion por contexto)
   f. Callback PUT /api/archivos/{id}/procesado
8. Backend marca Procesado=true, EnProcesamiento=false
9. Frontend detecta cambio en polling, archivo sale de la lista
```

## Calidad de Codigo

- **SonarQube Quality** (puerto 9000): Code smells, bugs, duplicacion, cobertura
- **SonarQube OWASP** (puerto 9001): Vulnerabilidades, OWASP Top 10, security hotspots
