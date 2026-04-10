export interface Archivo {
  id: string;
  nombre: string;
  descripcion: string | null;
  observaciones: string | null;
  path: string;
  createdAt: string;
  updatedAt: string | null;
  procesado: boolean;
  contexto: string | null;
  enProcesamiento: boolean;
  procesamientoInicio: string | null;
  procesamientoFin: string | null;
  chromaDbIds: string | null;
}

export interface CreateArchivoRequest {
  nombre: string;
  descripcion?: string;
  observaciones?: string;
  archivoBase64: string;
  nombreArchivo: string;
  contexto?: string;
}

export interface UpdateArchivoRequest {
  nombre?: string;
  descripcion?: string;
  observaciones?: string;
  archivoBase64?: string;
  nombreArchivo?: string;
  contexto?: string;
}
