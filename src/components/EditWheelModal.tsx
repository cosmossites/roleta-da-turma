import { AnimatePresence, motion } from 'framer-motion'
import { Pencil, X } from 'lucide-react'
import { useAppState } from '../store/useAppState'
import type { ClassroomWheel, WheelFormValues } from '../types'
import { WheelForm } from './WheelForm'

interface EditWheelModalProps {
  wheel?: ClassroomWheel
  open: boolean
  onClose: () => void
}

const toValues = (wheel: ClassroomWheel): WheelFormValues => ({
  name: wheel.name,
  type: wheel.type,
  theme: wheel.theme,
  eliminateDrawn: wheel.eliminateDrawn,
  drawCount: wheel.drawCount,
  numberConfig: wheel.numberConfig,
  names: wheel.names,
})

export const EditWheelModal = ({ wheel, open, onClose }: EditWheelModalProps) => {
  const { updateWheel, showToast } = useAppState()

  return (
    <AnimatePresence>
      {open && wheel ? (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className="modal"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-wheel-title"
          >
            <div className="panel-header">
              <div className="brand">
                <span className="brand-mark">
                  <Pencil size={20} aria-hidden="true" />
                </span>
                <div>
                  <h2 id="edit-wheel-title">Editar roleta</h2>
                  <p className="panel-subtitle">{wheel.name}</p>
                </div>
              </div>
              <button className="button button-ghost icon-button" type="button" onClick={onClose} aria-label="Fechar">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="modal-body">
              <WheelForm
                key={wheel.id}
                initialValues={toValues(wheel)}
                submitLabel="Salvar alterações"
                onCancel={onClose}
                onSubmit={(values) => {
                  updateWheel(wheel.id, values)
                  showToast('Roleta atualizada.', 'success')
                  onClose()
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
