import { AnimatePresence, motion } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import { createNameParticipant } from '../data/defaults'
import { useAppState } from '../store/useAppState'
import type { WheelFormValues } from '../types'
import { WheelForm } from './WheelForm'

interface CreateWheelModalProps {
  open: boolean
  onClose: () => void
  onCreated?: () => void
}

const initialValues: WheelFormValues = {
  name: '',
  type: 'numbers',
  theme: 'emerald',
  eliminateDrawn: true,
  drawCount: 1,
  numberConfig: {
    start: 1,
    end: 30,
    excluded: [],
  },
  names: ['Ana', 'Bruno'].map(createNameParticipant),
}

export const CreateWheelModal = ({ open, onClose, onCreated }: CreateWheelModalProps) => {
  const { createWheel, showToast } = useAppState()

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className="modal"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-wheel-title"
          >
            <div className="panel-header">
              <div className="brand">
                <span className="brand-mark">
                  <Plus size={20} aria-hidden="true" />
                </span>
                <div>
                  <h2 id="create-wheel-title">Nova roleta</h2>
                  <p className="panel-subtitle">Crie uma turma, grupo ou lista de apresentações.</p>
                </div>
              </div>
              <button className="button button-ghost icon-button" type="button" onClick={onClose} aria-label="Fechar">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="modal-body">
              <WheelForm
                initialValues={initialValues}
                submitLabel="Criar roleta"
                onCancel={onClose}
                onSubmit={(values) => {
                  const wheel = createWheel(values)
                  showToast(`Roleta "${wheel.name}" criada.`, 'success')
                  onClose()
                  onCreated?.()
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
