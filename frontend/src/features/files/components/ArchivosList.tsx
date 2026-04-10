import { useState, useMemo } from 'react';
import { useArchivos } from '../hooks';
import ArchivoModal from './ArchivoModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import DeleteMemoriaModal from './DeleteMemoriaModal';
import AprenderConfirmModal from './AprenderConfirmModal';
import type { Archivo, CreateArchivoRequest, UpdateArchivoRequest } from '../types';

type TabKey = 'gestion' | 'memoria';

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getFileExtension = (path: string): string => {
  return path.split('.').pop()?.toUpperCase() || '';
};

const ArchivosList: React.FC = () => {
  const { archivos, loading, error, create, update, remove, download, aprender, eliminarMemoria } = useArchivos();
  const [activeTab, setActiveTab] = useState<TabKey>('gestion');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memoriaModalOpen, setMemoriaModalOpen] = useState(false);
  const [aprenderModalOpen, setAprenderModalOpen] = useState(false);
  const [selectedArchivo, setSelectedArchivo] = useState<Archivo | null>(null);
  const [archivoToDelete, setArchivoToDelete] = useState<Archivo | null>(null);
  const [archivoToDeleteMemoria, setArchivoToDeleteMemoria] = useState<Archivo | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  // Filtrar archivos segun tab y busqueda (sobre TODOS los archivos)
  const filteredArchivos = useMemo(() => {
    let list = archivos;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (a) =>
          a.nombre.toLowerCase().includes(term) ||
          getFileExtension(a.path).toLowerCase().includes(term) ||
          a.descripcion?.toLowerCase().includes(term),
      );
    }

    return [...list].sort((a, b) => {
      const dateDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (dateDiff !== 0) return dateDiff;
      return a.nombre.localeCompare(b.nombre, 'es');
    });
  }, [archivos, activeTab, searchTerm]);

  // Paginacion sobre el resultado filtrado
  const totalPages = Math.ceil(filteredArchivos.length / PAGE_SIZE);
  const paginatedArchivos = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredArchivos.slice(start, start + PAGE_SIZE);
  }, [filteredArchivos, currentPage]);

  // Resetear pagina al cambiar filtros
  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setSelectedIds(new Set());
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // CRUD handlers
  const handleCreate = () => {
    setSelectedArchivo(null);
    setModalOpen(true);
  };

  const handleEdit = (archivo: Archivo) => {
    setSelectedArchivo(archivo);
    setModalOpen(true);
  };

  const handleDeleteClick = (archivo: Archivo) => {
    setArchivoToDelete(archivo);
    setDeleteModalOpen(true);
  };

  const handleSave = async (data: CreateArchivoRequest | UpdateArchivoRequest) => {
    if (selectedArchivo) {
      await update(selectedArchivo.id, data as UpdateArchivoRequest);
    } else {
      await create(data as CreateArchivoRequest);
    }
  };

  const handleConfirmDelete = async () => {
    if (archivoToDelete) {
      await remove(archivoToDelete.id);
    }
  };

  const handleDeleteMemoriaClick = (archivo: Archivo) => {
    setArchivoToDeleteMemoria(archivo);
    setMemoriaModalOpen(true);
  };

  const handleConfirmDeleteMemoria = async () => {
    if (archivoToDeleteMemoria) {
      await eliminarMemoria(archivoToDeleteMemoria.id);
    }
  };

  const handleDownload = async (archivo: Archivo) => {
    const ext = archivo.path.split('.').pop() || '';
    const fileName = ext ? `${archivo.nombre}.${ext}` : archivo.nombre;
    await download(archivo.id, fileName);
  };

  // Multi-select handlers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const selectable = filteredArchivos.filter((a) => !a.enProcesamiento && !a.procesado);
    if (selectedIds.size === selectable.length && selectable.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectable.map((a) => a.id)));
    }
  };

  const handleAprender = () => {
    setAprenderModalOpen(true);
  };

  const handleConfirmAprender = async () => {
    const ids = Array.from(selectedIds);
    await aprender(ids);
    setSelectedIds(new Set());
  };

  const renderTable = () => {
    if (loading) {
      return (
        <div className="d-flex items-center justify-center" style={{ padding: 'var(--spacing-10)' }}>
          <p className="text-sm text-secondary">Cargando archivos...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="d-flex items-center justify-center" style={{ padding: 'var(--spacing-10)' }}>
          <p className="text-sm" style={{ color: 'var(--color-error)' }}>{error}</p>
        </div>
      );
    }

    if (filteredArchivos.length === 0) {
      return (
        <div className="d-flex flex-column items-center justify-center gap-4" style={{ padding: 'var(--spacing-12)' }}>
          <div
            className="d-flex items-center justify-center"
            style={{
              width: 64,
              height: 64,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(107, 114, 128, 0.1)',
            }}
          >
            <svg width="32" height="32" fill="none" stroke="#9CA3AF" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="text-sm font-semibold" style={{ margin: 0, color: 'var(--color-text-primary)' }}>
              {searchTerm ? 'Sin resultados' : 'No hay archivos'}
            </p>
            <p className="text-xs text-secondary" style={{ margin: 'var(--spacing-1) 0 0' }}>
              {searchTerm && 'Intenta con otro termino de busqueda'}
              {!searchTerm && activeTab === 'gestion' && 'Haz click en "Nuevo Archivo" para cargar tu primer archivo'}
              {!searchTerm && activeTab === 'memoria' && 'No hay archivos pendientes de procesar'}
            </p>
          </div>
        </div>
      );
    }

    const isMemoria = activeTab === 'memoria';

    return (
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {isMemoria && (
                <th style={{ width: 44, textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredArchivos.filter((a) => !a.enProcesamiento && !a.procesado).length && filteredArchivos.filter((a) => !a.enProcesamiento && !a.procesado).length > 0}
                    onChange={toggleSelectAll}
                    style={{ accentColor: 'var(--color-primary)', width: 16, height: 16, cursor: 'pointer' }}
                  />
                </th>
              )}
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Contexto</th>
              <th>Descripcion</th>
              <th>Fecha de Creacion</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedArchivos.map((archivo) => (
              <tr key={archivo.id} className={selectedIds.has(archivo.id) ? 'selected' : ''}>
                {isMemoria && (
                  <td style={{ textAlign: 'center' }}>
                    {archivo.enProcesamiento ? (
                      <span className="spinner" title="Procesando..." />
                    ) : !archivo.procesado ? (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(archivo.id)}
                        onChange={() => toggleSelect(archivo.id)}
                        style={{ accentColor: 'var(--color-primary)', width: 16, height: 16, cursor: 'pointer' }}
                      />
                    ) : null}
                  </td>
                )}
                <td>
                  <span className="font-medium">{archivo.nombre}</span>
                </td>
                <td>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(227, 24, 55, 0.08)',
                      color: 'var(--color-primary)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 'var(--font-weight-bold)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {getFileExtension(archivo.path)}
                  </span>
                </td>
                <td>
                  <span className="text-secondary truncate" style={{ maxWidth: 200, display: 'inline-block' }}>
                    {archivo.contexto || '—'}
                  </span>
                </td>
                <td>
                  <span className="text-secondary truncate" style={{ maxWidth: 200, display: 'inline-block' }}>
                    {archivo.descripcion || '—'}
                  </span>
                </td>
                <td>{formatDate(archivo.createdAt)}</td>
                <td>
                  <div className="table__actions" style={{ justifyContent: 'center' }}>
                    {!isMemoria ? (
                      <>
                        <button className="btn btn--icon btn--sm btn--ghost" title="Descargar" onClick={() => handleDownload(archivo)}>
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        <button className="btn btn--icon btn--sm btn--ghost" title="Editar" onClick={() => handleEdit(archivo)}>
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button className="btn btn--icon btn--sm btn--ghost" title="Eliminar" onClick={() => handleDeleteClick(archivo)} style={{ color: 'var(--color-error)' }}>
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      archivo.procesado && archivo.chromaDbIds ? (
                        <button
                          className="btn btn--icon btn--sm btn--ghost"
                          title="Eliminar memoria"
                          onClick={() => handleDeleteMemoriaClick(archivo)}
                          style={{ color: '#F59E0B' }}
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </button>
                      ) : (
                        <span className="text-xs text-secondary">—</span>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Repositorio de Archivos</h1>
          <p className="page-header__subtitle">Gestiona los archivos cargados en el sistema</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <div className="tabs__list">
          <button
            className={`tabs__tab${activeTab === 'gestion' ? ' tabs__tab--active' : ''}`}
            onClick={() => handleTabChange('gestion')}
          >
            Gestion Documental
          </button>
          <button
            className={`tabs__tab${activeTab === 'memoria' ? ' tabs__tab--active' : ''}`}
            onClick={() => handleTabChange('memoria')}
          >
            Administracion de Memoria
          </button>
        </div>
        <div className="tabs__actions">
          {activeTab === 'gestion' && (
            <button className="btn btn--primary btn--sm" onClick={handleCreate}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Archivo
            </button>
          )}
          {activeTab === 'memoria' && (
            <button
              className="btn btn--primary btn--sm"
              onClick={handleAprender}
              disabled={selectedIds.size === 0}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Aprender
            </button>
          )}
        </div>
      </div>

      {/* Buscador */}
      <div style={{ marginBottom: 'var(--spacing-6)' }}>
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <svg
            width="18" height="18" fill="none" stroke="#9CA3AF" viewBox="0 0 24 24"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="form-input"
            placeholder="Buscar por nombre, tipo o descripcion..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="card">
        <div className="card__header">
          <h3 className="card__title">Archivos</h3>
          <p className="card__subtitle">
            {filteredArchivos.length} {filteredArchivos.length === 1 ? 'archivo encontrado' : 'archivos encontrados'}
            {activeTab === 'memoria' && selectedIds.size > 0 && (
              <span style={{ color: 'var(--color-primary)', marginLeft: 'var(--spacing-2)' }}>
                — {selectedIds.size} seleccionado{selectedIds.size > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <div className="card__body" style={{ padding: 0 }}>
          {renderTable()}
        </div>
        {/* Paginacion */}
        {totalPages > 1 && (
          <div className="card__footer">
            <div className="d-flex items-center justify-between">
              <span className="text-xs text-secondary">
                Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredArchivos.length)} de {filteredArchivos.length}
              </span>
              <div className="d-flex items-center gap-2">
                <button
                  className="btn btn--icon btn--sm btn--secondary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`btn btn--sm${page === currentPage ? ' btn--primary' : ' btn--ghost'}`}
                    onClick={() => setCurrentPage(page)}
                    style={{ minWidth: 32, padding: '0 8px' }}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="btn btn--icon btn--sm btn--secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ArchivoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        archivo={selectedArchivo}
      />
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        fileName={archivoToDelete?.nombre || ''}
      />
      <AprenderConfirmModal
        isOpen={aprenderModalOpen}
        onClose={() => setAprenderModalOpen(false)}
        onConfirm={handleConfirmAprender}
        count={selectedIds.size}
      />
      <DeleteMemoriaModal
        isOpen={memoriaModalOpen}
        onClose={() => setMemoriaModalOpen(false)}
        onConfirm={handleConfirmDeleteMemoria}
        fileName={archivoToDeleteMemoria?.nombre || ''}
      />
    </div>
  );
};

export default ArchivosList;
