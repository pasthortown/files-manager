from pydantic import BaseModel


class TrainFileRequest(BaseModel):
    id: str
    path: str
    contexto: str | None = None
    nombre: str


class TrainRequest(BaseModel):
    files: list[TrainFileRequest]


class DeleteMemoryRequest(BaseModel):
    ids: list[str]
