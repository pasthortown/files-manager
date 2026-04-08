export const APP_CONFIG = {
  appName: 'Administrador de Archivos',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
} as const;
