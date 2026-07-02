import { AnimatePresence, motion } from 'framer-motion'
import { Clipboard, RotateCcw, Trophy, X } from 'lucide-react'
import type { HistoryEntry } from '../types'

interface ResultModalProps {
  open: boolean
  results: HistoryEntry[]
  onClose: () => void
  onNewDraw: () => void
  onCopy: () => void
}

export const ResultModal = ({ open, results, onClose, onNewDraw, onCopy }: ResultModalProps) => {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            className="modal modal-small"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="result-title"
          >
            <div className="panel-header">
              <div className="brand">
                <span className="brand-mark" style={{ background: '#f59e0b' }}>
                  <Trophy size={20} aria-hidden="true" />
                </span>
                <div>
                  <h2 id="result-title">Resultado do sorteio</h2>
                  <p className="panel-subtitle">{results.length} participante(s) sorteado(s).</p>
                </div>
              </div>
              <button className="button button-ghost icon-button" type="button" onClick={onClose} aria-label="Fechar">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="modal-body controls-stack">
              <div className="history-list">
                {results.map((result) => (
                  <div className="history-row" key={result.id}>
                    <span className="pill">{result.position}º</span>
                    <strong>{result.value}</strong>
                    <small>{new Date(result.createdAt).toLocaleTimeString('pt-BR')}</small>
                  </div>
                ))}
              </div>
              <div className="inline-actions" style={{ justifyContent: 'flex-end' }}>
                <button className="button button-secondary" type="button" onClick={onCopy}>
                  <Clipboard size={17} aria-hidden="true" />
                  Copiar
                </button>
                <button className="button button-secondary" type="button" onClick={onClose}>
                  Fechar
                </button>
                <button className="button button-primary" type="button" onClick={onNewDraw}>
                  <RotateCcw size={17} aria-hidden="true" />
                  Novo sorteio
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
