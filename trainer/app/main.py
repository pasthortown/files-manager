import logging
from contextlib import asynccontextmanager

from fastapi import BackgroundTasks, FastAPI

from app.config import settings
from app.models import TrainRequest
from app.services import ollama_client, trainer

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: ensure required Ollama models are available."""
    logger.info("Trainer service starting up")
    logger.info("Ollama URL: %s", settings.OLLAMA_URL)
    logger.info("ChromaDB URL: %s", settings.CHROMA_URL)
    logger.info("Backend URL: %s", settings.BACKEND_URL)
    logger.info("Context model: %s", settings.OLLAMA_MODEL_CONTEXT)
    logger.info("Embedding model: %s", settings.OLLAMA_MODEL_EMBEDDING)
    logger.info("Vision model: %s", settings.OLLAMA_MODEL_VISION)

    try:
        await ollama_client.ensure_model(settings.OLLAMA_MODEL_CONTEXT)
    except Exception:
        logger.exception("Failed to ensure context model '%s' on startup", settings.OLLAMA_MODEL_CONTEXT)

    try:
        await ollama_client.ensure_model(settings.OLLAMA_MODEL_EMBEDDING)
    except Exception:
        logger.exception("Failed to ensure embedding model '%s' on startup", settings.OLLAMA_MODEL_EMBEDDING)

    try:
        await ollama_client.ensure_model(settings.OLLAMA_MODEL_VISION)
    except Exception:
        logger.exception("Failed to ensure vision model '%s' on startup", settings.OLLAMA_MODEL_VISION)

    logger.info("Trainer service ready")
    yield
    logger.info("Trainer service shutting down")


app = FastAPI(
    title="Trainer - Document Processing Service",
    description="Processes documents, generates embeddings, and stores them in ChromaDB",
    version="1.0.0",
    lifespan=lifespan,
)


@app.post("/train", status_code=202)
async def train(request: TrainRequest, background_tasks: BackgroundTasks):
    """Receive file processing requests and process them in the background."""
    logger.info("Received training request with %d file(s)", len(request.files))

    for file in request.files:
        logger.info("Queuing file for processing: %s (%s)", file.nombre, file.id)
        background_tasks.add_task(trainer.process_file, file)

    return {
        "status": "accepted",
        "message": f"{len(request.files)} file(s) queued for processing",
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}
