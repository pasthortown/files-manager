import api from '../../../services/api';
import type { ApiResponse } from '../../../types';
import type { Archivo, CreateArchivoRequest, UpdateArchivoRequest } from '../types';

export const getArchivos = async (): Promise<Archivo[]> => {
  const response = await api.get<ApiResponse<Archivo[]>>('/archivos');
  return response.data.data;
};

export const createArchivo = async (data: CreateArchivoRequest): Promise<Archivo> => {
  const response = await api.post<ApiResponse<Archivo>>('/archivos', data);
  return response.data.data;
};

export const updateArchivo = async (id: string, data: UpdateArchivoRequest): Promise<Archivo> => {
  const response = await api.put<ApiResponse<Archivo>>(`/archivos/${id}`, data);
  return response.data.data;
};

export const deleteArchivo = async (id: string): Promise<void> => {
  await api.delete(`/archivos/${id}`);
};

export const aprenderArchivos = async (archivoIds: string[]): Promise<void> => {
  await api.post('/archivos/aprender', { archivoIds });
};

export const eliminarMemoria = async (id: string): Promise<void> => {
  await api.delete(`/archivos/${id}/memoria`);
};

export const downloadArchivo = async (id: string, fileName: string): Promise<void> => {
  const response = await api.get(`/archivos/${id}/download`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
