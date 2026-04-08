import os


class Settings:
    OLLAMA_URL: str = os.getenv("OLLAMA_URL", "http://172.16.5.40:11434")
    CHROMA_URL: str = os.getenv("CHROMA_URL", "http://172.16.5.41:8000")
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://172.16.5.11:8080")
    UPLOADED_PATH: str = os.getenv("UPLOADED_PATH", "/app/uploaded")
    OLLAMA_MODEL_CONTEXT: str = os.getenv("OLLAMA_MODEL_CONTEXT", "gemma3:4b")
    OLLAMA_MODEL_EMBEDDING: str = os.getenv("OLLAMA_MODEL_EMBEDDING", "nomic-embed-text")


settings = Settings()
