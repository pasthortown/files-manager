import { useState, useRef, useCallback, useEffect } from 'react';
import type { Archivo, CreateArchivoRequest, UpdateArchivoRequest } from '../types';

interface ArchivoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateArchivoRequest | UpdateArchivoRequest) => Promise<void>;
  archivo?: Archivo | null;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
};

const getFileExtension = (name: string): string => {
  return name.split('.').pop()?.toUpperCase() || '';
};

const ArchivoModal: React.FC<ArchivoModalProps> = ({ isOpen, onClose, onSave, archivo }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [contexto, setContexto] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!archivo;

  useEffect(() => {
    if (isOpen) {
      if (archivo) {
        setNombre(archivo.nombre);
        setDescripcion(archivo.descripcion || '');
        setObservaciones(archivo.observaciones || '');
        setContexto(archivo.contexto || '');
      } else {
        setNombre('');
        setDescripcion('');
        setObservaciones('');
        setContexto('');
      }
      setSelectedFile(null);
      setErrors({});
      setSaving(false);
    }
  }, [isOpen, archivo]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!isEditing && !selectedFile) newErrors.archivo = 'Debe seleccionar un archivo';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      if (isEditing) {
        const data: UpdateArchivoRequest = {
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          observaciones: observaciones.trim() || undefined,
          contexto: contexto.trim() || undefined,
        };
        if (selectedFile) {
          data.archivoBase64 = await fileToBase64(selectedFile);
          data.nombreArchivo = selectedFile.name;
        }
        await onSave(data);
      } else {
        const data: CreateArchivoRequest = {
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          observaciones: observaciones.trim() || undefined,
          contexto: contexto.trim() || undefined,
          archivoBase64: await fileToBase64(selectedFile!),
          nombreArchivo: selectedFile!.name,
        };
        await onSave(data);
      }
      onClose();
    } catch {
      // Error is handled by parent component
    } finally {
      setSaving(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setErrors((prev) => ({ ...prev, archivo: '' }));
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrors((prev) => ({ ...prev, archivo: '' }));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const currentFileExt = archivo ? getFileExtension(archivo.path) : '';

  return (
    <>
      {/* Backdrop - sin onClick para evitar cierre al hacer click fuera */}
      <div className={`modal-backdrop${isOpen ? ' modal-backdrop--open' : ''}`} />
      <div className={`modal${isOpen ? ' modal--open' : ''}`} style={{ maxWidth: 600 }}>
        {/* Header */}
        <div className="modal__header">
          <h3 className="modal__title">{isEditing ? 'Editar Archivo' : 'Nuevo Archivo'}</h3>
          <button className="modal__close" onClick={onClose} disabled={saving}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="modal__body">
          {/* Nombre */}
          <div className="form-group">
            <label className="form-label" htmlFor="archivo-nombre">NOMBRE</label>
            <input
              id="archivo-nombre"
              className={`form-control${errors.nombre ? ' form-input--error' : ''}`}
              type="text"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                setErrors((prev) => ({ ...prev, nombre: '' }));
              }}
              placeholder="Nombre del archivo"
              disabled={saving}
            />
            {errors.nombre && <span className="form-helper form-helper--error">{errors.nombre}</span>}
          </div>

          {/* Descripcion */}
          <div className="form-group">
            <label className="form-label" htmlFor="archivo-descripcion">DESCRIPCION</label>
            <textarea
              id="archivo-descripcion"
              className="form-control"
              style={{ height: 'auto', minHeight: 80, resize: 'vertical' }}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripcion del archivo"
              disabled={saving}
            />
          </div>

          {/* Observaciones */}
          <div className="form-group">
            <label className="form-label" htmlFor="archivo-observaciones">OBSERVACIONES</label>
            <textarea
              id="archivo-observaciones"
              className="form-control"
              style={{ height: 'auto', minHeight: 80, resize: 'vertical' }}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Observaciones adicionales"
              disabled={saving}
            />
          </div>

          {/* Contexto */}
          <div className="form-group">
            <label className="form-label" htmlFor="archivo-contexto">CONTEXTO</label>
            <input
              id="archivo-contexto"
              className="form-control"
              type="text"
              value={contexto}
              onChange={(e) => setContexto(e.target.value)}
              placeholder="Palabras clave separadas por coma (ej: finanzas, legal, rrhh)"
              disabled={saving}
            />
            <span className="form-helper">Opcional. Palabras clave para clasificar el documento.</span>
          </div>

          {/* Dropzone / File Upload */}
          <div style={{ marginBottom: 'var(--spacing-5)' }}>
            {selectedFile ? (
              /* Archivo seleccionado - Preview */
              <div
                className="d-flex items-center gap-4"
                style={{
                  padding: 'var(--spacing-4)',
                  border: '1px solid var(--color-border-main)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-bg-main)',
                }}
              >
                <div
                  className="d-flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(227, 24, 55, 0.1)',
                    color: 'var(--color-primary)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  {getFileExtension(selectedFile.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ margin: 0 }}>
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-secondary" style={{ margin: 0 }}>
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <button
                  className="btn btn--icon btn--sm btn--ghost"
                  onClick={handleRemoveFile}
                  disabled={saving}
                  title="Quitar archivo"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              /* Dropzone */
              <button
                type="button"
                className={`dropzone${isDragging ? ' dropzone--active' : ''}${errors.archivo ? ' form-input--error' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={errors.archivo ? { borderColor: 'var(--color-error)' } : undefined}
              >
                <svg className="dropzone__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="dropzone__title">Arrastra tu archivo aqui</span>
                <span className="dropzone__text">
                  o <strong style={{ color: 'var(--color-primary)', cursor: 'pointer' }}>haz click para seleccionar</strong>
                </span>
                <span className="dropzone__text" style={{ fontSize: 'var(--font-size-xs)', marginTop: 4 }}>
                  Tamano maximo: 50 MB
                </span>
              </button>
            )}

            {/* Info de archivo actual en modo edicion */}
            {isEditing && !selectedFile && (
              <div
                className="d-flex items-center gap-3"
                style={{
                  marginTop: 'var(--spacing-3)',
                  padding: 'var(--spacing-3) var(--spacing-4)',
                  backgroundColor: 'rgba(59, 130, 246, 0.05)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                }}
              >
                <svg width="18" height="18" fill="none" stroke="#3B82F6" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-xs" style={{ color: '#3B82F6' }}>
                  Archivo actual: <strong>{currentFileExt}</strong> — Arrastra o selecciona un archivo para reemplazarlo
                </span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
              disabled={saving}
            />
            {errors.archivo && (
              <span className="form-helper form-helper--error">{errors.archivo}</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal__footer">
          <button className="btn btn--secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </>
  );
};

export default ArchivoModal;
