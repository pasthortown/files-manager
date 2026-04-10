import { useState, useEffect, useCallback, useRef } from 'react';
import * as archivosService from '../services';
import type { Archivo, CreateArchivoRequest, UpdateArchivoRequest } from '../types';

interface UseArchivosReturn {
  archivos: Archivo[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  create: (data: CreateArchivoRequest) => Promise<void>;
  update: (id: string, data: UpdateArchivoRequest) => Promise<void>;
  remove: (id: string) => Promise<void>;
  download: (id: string, fileName: string) => Promise<void>;
  aprender: (ids: string[]) => Promise<void>;
  eliminarMemoria: (id: string) => Promise<void>;
}

export const useArchivos = (): UseArchivosReturn => {
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchArchivos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await archivosService.getArchivos();
      setArchivos(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar archivos';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArchivos();
  }, [fetchArchivos]);

  // Polling: refresh every 5s while any file is being processed
  useEffect(() => {
    const hasProcessing = archivos.some((a) => a.enProcesamiento);

    if (hasProcessing && !pollingRef.current) {
      pollingRef.current = setInterval(() => {
        archivosService.getArchivos()
          .then((data) => setArchivos(data))
          .catch(() => { /* Silently ignore polling errors */ });
      }, 5000);
    } else if (!hasProcessing && pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [archivos]);

  const create = useCallback(async (data: CreateArchivoRequest) => {
    await archivosService.createArchivo(data);
    await fetchArchivos();
  }, [fetchArchivos]);

  const update = useCallback(async (id: string, data: UpdateArchivoRequest) => {
    await archivosService.updateArchivo(id, data);
    await fetchArchivos();
  }, [fetchArchivos]);

  const remove = useCallback(async (id: string) => {
    await archivosService.deleteArchivo(id);
    await fetchArchivos();
  }, [fetchArchivos]);

  const download = useCallback(async (id: string, fileName: string) => {
    await archivosService.downloadArchivo(id, fileName);
  }, []);

  const aprender = useCallback(async (ids: string[]) => {
    await archivosService.aprenderArchivos(ids);
    await fetchArchivos();
  }, [fetchArchivos]);

  const eliminarMemoria = useCallback(async (id: string) => {
    await archivosService.eliminarMemoria(id);
    await fetchArchivos();
  }, [fetchArchivos]);

  return { archivos, loading, error, refresh: fetchArchivos, create, update, remove, download, aprender, eliminarMemoria };
};
