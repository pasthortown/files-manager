import { useState } from 'react';

interface AprenderConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  count: number;
}

const AprenderConfirmModal: React.FC<AprenderConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  count,
}) => {
  const [processing, setProcessing] = useState(false);

  const handleConfirm = async () => {
    try {
      setProcessing(true);
      await onConfirm();
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className={`modal-backdrop${isOpen ? ' modal-backdrop--open' : ''}`} />
      <div className={`modal${isOpen ? ' modal--open' : ''}`} style={{ maxWidth: 480 }}>
        <div className="modal__header">
          <h3 className="modal__title">Proceso de Aprendizaje</h3>
          <button className="modal__close" onClick={onClose} disabled={processing}>
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
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
              }}
            >
              <svg width="28" height="28" fill="none" stroke="#F59E0B" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm" style={{ margin: 0, color: 'var(--color-text-primary)' }}>
                El conocimiento adquirido por el modelo no puede ser revertido. Sin embargo,
                siempre es posible agregar actualizaciones y nuevo conocimiento.
              </p>
              <p className="text-sm font-semibold" style={{ margin: 'var(--spacing-3) 0 0', color: 'var(--color-text-primary)' }}>
                ¿Desea continuar con el proceso de aprendizaje?
              </p>
              <p className="text-xs text-secondary" style={{ margin: 'var(--spacing-3) 0 0' }}>
                {count} archivo{count > 1 ? 's' : ''} seleccionado{count > 1 ? 's' : ''} para procesar.
              </p>
            </div>
          </div>
        </div>
        <div className="modal__footer">
          <button className="btn btn--secondary" onClick={onClose} disabled={processing}>
            Cancelar
          </button>
          <button className="btn btn--primary" onClick={handleConfirm} disabled={processing}>
            {processing ? 'Enviando...' : 'Continuar'}
          </button>
        </div>
      </div>
    </>
  );
};

export default AprenderConfirmModal;
