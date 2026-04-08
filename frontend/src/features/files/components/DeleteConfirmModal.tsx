import { useState } from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  fileName: string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  fileName,
}) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await onConfirm();
      onClose();
    } catch {
      // Error is handled by parent component
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className={`modal-backdrop${isOpen ? ' modal-backdrop--open' : ''}`} />
      <div className={`modal${isOpen ? ' modal--open' : ''}`} style={{ maxWidth: 440 }}>
        <div className="modal__header">
          <h3 className="modal__title">Eliminar Archivo</h3>
          <button className="modal__close" onClick={onClose} disabled={deleting}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal__body">
          <div className="d-flex flex-column items-center gap-4" style={{ textAlign: 'center' }}>
            <div
              className="d-flex items-center justify-center"
              style={{
                width: 56,
                height: 56,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
              }}
            >
              <svg width="28" height="28" fill="none" stroke="#EF4444" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm" style={{ margin: 0, color: 'var(--color-text-primary)' }}>
                Estas seguro de que deseas eliminar el archivo
              </p>
              <p className="text-sm font-semibold" style={{ margin: 'var(--spacing-1) 0 0', color: 'var(--color-text-primary)' }}>
                "{fileName}"?
              </p>
              <p className="text-xs text-secondary" style={{ margin: 'var(--spacing-3) 0 0' }}>
                Esta accion no se puede deshacer. El archivo sera eliminado permanentemente.
              </p>
            </div>
          </div>
        </div>
        <div className="modal__footer">
          <button className="btn btn--secondary" onClick={onClose} disabled={deleting}>
            Cancelar
          </button>
          <button className="btn btn--danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </>
  );
};

export default DeleteConfirmModal;
