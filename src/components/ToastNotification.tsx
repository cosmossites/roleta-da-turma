import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import type { ToastMessage } from '../types'

interface ToastNotificationProps {
  toasts: ToastMessage[]
  onDismiss: (toastId: string) => void
}

const iconByTone = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

export const ToastNotification = ({ toasts, onDismiss }: ToastNotificationProps) => {
  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="true">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = iconByTone[toast.tone]

          return (
            <motion.div
              key={toast.id}
              className="toast"
              data-tone={toast.tone}
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              role={toast.tone === 'error' ? 'alert' : 'status'}
            >
              <Icon size={20} aria-hidden="true" />
              <span style={{ flex: 1 }}>{toast.message}</span>
              <button
                className="button button-ghost icon-button"
                type="button"
                aria-label="Fechar notificação"
                onClick={() => onDismiss(toast.id)}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
