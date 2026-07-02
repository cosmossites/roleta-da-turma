import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmationModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmationModal = ({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) => {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="presentation"
        >
          <motion.div
            className="modal modal-small"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmation-title"
          >
            <div className="panel-header">
              <div className="brand">
                <span className="brand-mark" style={{ background: danger ? 'var(--danger)' : undefined }}>
                  <AlertTriangle size={20} aria-hidden="true" />
                </span>
                <div>
                  <h2 id="confirmation-title">{title}</h2>
                  <p className="panel-subtitle">{message}</p>
                </div>
              </div>
              <button className="button button-ghost icon-button" type="button" onClick={onCancel} aria-label="Fechar">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="modal-body">
              <div className="inline-actions" style={{ justifyContent: 'flex-end' }}>
                <button className="button button-secondary" type="button" onClick={onCancel}>
                  {cancelLabel}
                </button>
                <button
                  className={`button ${danger ? 'button-danger' : 'button-primary'}`}
                  type="button"
                  onClick={onConfirm}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
