import { useEffect, useState } from 'react';
import { getArchivos } from '../../files/services';
import type { Archivo } from '../../files/types';

interface ProcessingStats {
  total: number;
  procesados: number;
  sinProcesar: number;
  tiempoPromedio: number | null;
  tiempoMinimo: number | null;
  tiempoMaximo: number | null;
  archivoMinimo: string | null;
  archivoMaximo: string | null;
}

function calcProcessingSeconds(archivo: Archivo): number | null {
  if (!archivo.procesamientoInicio || !archivo.procesamientoFin) return null;
  const start = new Date(archivo.procesamientoInicio).getTime();
  const end = new Date(archivo.procesamientoFin).getTime();
  const diff = (end - start) / 1000;
  return diff > 0 ? diff : null;
}

function formatTime(seconds: number | null): string {
  if (seconds === null) return '--';
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs.toFixed(0)}s`;
}

function computeStats(archivos: Archivo[]): ProcessingStats {
  const total = archivos.length;
  const procesados = archivos.filter(a => a.procesado).length;
  const sinProcesar = total - procesados;

  const tiempos = archivos
    .map(a => ({ nombre: a.nombre, tiempo: calcProcessingSeconds(a) }))
    .filter((t): t is { nombre: string; tiempo: number } => t.tiempo !== null);

  if (tiempos.length === 0) {
    return { total, procesados, sinProcesar, tiempoPromedio: null, tiempoMinimo: null, tiempoMaximo: null, archivoMinimo: null, archivoMaximo: null };
  }

  const sum = tiempos.reduce((acc, t) => acc + t.tiempo, 0);
  const min = tiempos.reduce((a, b) => a.tiempo < b.tiempo ? a : b);
  const max = tiempos.reduce((a, b) => a.tiempo > b.tiempo ? a : b);

  return {
    total,
    procesados,
    sinProcesar,
    tiempoPromedio: sum / tiempos.length,
    tiempoMinimo: min.tiempo,
    tiempoMaximo: max.tiempo,
    archivoMinimo: min.nombre,
    archivoMaximo: max.nombre,
  };
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<ProcessingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const archivos = await getArchivos();
      setStats(computeStats(archivos));
    } catch {
      setError('Error al cargar las estadisticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Dashboard</h1>
          <p className="page-header__subtitle">Resumen general del administrador de archivos</p>
        </div>
        <button className="btn btn--outline btn--sm" onClick={fetchData} disabled={loading}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 6 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>

      {error && (
        <div className="card mb-6" style={{ borderLeft: '4px solid var(--color-error)' }}>
          <div className="card__body">
            <p className="text-sm" style={{ color: 'var(--color-error)' }}>{error}</p>
          </div>
        </div>
      )}

      {loading && !stats ? (
        <div className="d-flex justify-center items-center" style={{ minHeight: 300 }}>
          <div className="spinner" />
        </div>
      ) : stats && (
        <>
          {/* Stats Cards - Contadores */}
          <div className="d-grid gap-6 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {/* Total Archivos */}
            <div className="card">
              <div className="card__body">
                <div className="d-flex justify-between items-start">
                  <div>
                    <p className="text-sm text-secondary mb-1">Total Archivos</p>
                    <p className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>{stats.total}</p>
                    <p className="text-xs text-secondary mt-1">Archivos en el sistema</p>
                  </div>
                  <div className="d-flex items-center justify-center" style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(227, 24, 55, 0.1)' }}>
                    <svg width="28" height="28" fill="none" stroke="#E31837" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Procesados (RAG) */}
            <div className="card">
              <div className="card__body">
                <div className="d-flex justify-between items-start">
                  <div>
                    <p className="text-sm text-secondary mb-1">Incluidos en RAG</p>
                    <p className="text-3xl font-bold" style={{ color: '#10B981' }}>{stats.procesados}</p>
                    <p className="text-xs text-secondary mt-1">
                      {stats.total > 0 ? `${((stats.procesados / stats.total) * 100).toFixed(1)}% del total` : 'Sin archivos'}
                    </p>
                  </div>
                  <div className="d-flex items-center justify-center" style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                    <svg width="28" height="28" fill="none" stroke="#10B981" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Sin Procesar */}
            <div className="card">
              <div className="card__body">
                <div className="d-flex justify-between items-start">
                  <div>
                    <p className="text-sm text-secondary mb-1">Solo Repositorio</p>
                    <p className="text-3xl font-bold" style={{ color: '#F59E0B' }}>{stats.sinProcesar}</p>
                    <p className="text-xs text-secondary mt-1">
                      {stats.total > 0 ? `${((stats.sinProcesar / stats.total) * 100).toFixed(1)}% del total` : 'Sin archivos'}
                    </p>
                  </div>
                  <div className="d-flex items-center justify-center" style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                    <svg width="28" height="28" fill="none" stroke="#F59E0B" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cards Grandes - Tiempos de Procesamiento */}
          <div className="d-grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {/* Tiempo Promedio */}
            <div className="card">
              <div className="card__body d-flex flex-column items-center justify-center" style={{ padding: 'var(--spacing-8)', minHeight: 180 }}>
                <div className="d-flex items-center justify-center" style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.1)', marginBottom: 'var(--spacing-4)' }}>
                  <svg width="28" height="28" fill="none" stroke="#3B82F6" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-secondary mb-2">Tiempo Promedio</p>
                <p className="font-bold" style={{ fontSize: '2.25rem', color: '#3B82F6', lineHeight: 1.2 }}>
                  {formatTime(stats.tiempoPromedio)}
                </p>
                <p className="text-xs text-secondary mt-2">por archivo procesado</p>
              </div>
            </div>

            {/* Tiempo Minimo */}
            <div className="card">
              <div className="card__body d-flex flex-column items-center justify-center" style={{ padding: 'var(--spacing-8)', minHeight: 180 }}>
                <div className="d-flex items-center justify-center" style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', marginBottom: 'var(--spacing-4)' }}>
                  <svg width="28" height="28" fill="none" stroke="#10B981" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <p className="text-sm text-secondary mb-2">Mas Rapido</p>
                <p className="font-bold" style={{ fontSize: '2.25rem', color: '#10B981', lineHeight: 1.2 }}>
                  {formatTime(stats.tiempoMinimo)}
                </p>
                {stats.archivoMinimo && (
                  <p className="text-xs text-secondary mt-2 truncate" style={{ maxWidth: '100%' }}>{stats.archivoMinimo}</p>
                )}
              </div>
            </div>

            {/* Tiempo Maximo */}
            <div className="card">
              <div className="card__body d-flex flex-column items-center justify-center" style={{ padding: 'var(--spacing-8)', minHeight: 180 }}>
                <div className="d-flex items-center justify-center" style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', marginBottom: 'var(--spacing-4)' }}>
                  <svg width="28" height="28" fill="none" stroke="#EF4444" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <p className="text-sm text-secondary mb-2">Mas Lento</p>
                <p className="font-bold" style={{ fontSize: '2.25rem', color: '#EF4444', lineHeight: 1.2 }}>
                  {formatTime(stats.tiempoMaximo)}
                </p>
                {stats.archivoMaximo && (
                  <p className="text-xs text-secondary mt-2 truncate" style={{ maxWidth: '100%' }}>{stats.archivoMaximo}</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
