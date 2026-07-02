import { Clipboard, FileDown, FileText, RotateCcw, Trash2, Undo2 } from 'lucide-react'
import type { ClassroomWheel } from '../types'
import { formatDateTime } from '../utils/date'
import { exportHistoryCsv, exportHistoryTxt } from '../utils/exporters'

interface HistoryPanelProps {
  wheel: ClassroomWheel
  onCopy: () => void
  onClear: () => void
  onUndo: () => void
}

export const HistoryPanel = ({ wheel, onCopy, onClear, onUndo }: HistoryPanelProps) => {
  return (
    <aside className="panel">
      <div className="panel-header">
        <div>
          <h2>Histórico</h2>
          <p className="panel-subtitle">{wheel.history.length} resultado(s) registrados.</p>
        </div>
        <FileText size={20} aria-hidden="true" />
      </div>
      <div className="panel-body controls-stack">
        <div className="inline-actions">
          <button className="button button-secondary" type="button" onClick={onCopy} disabled={!wheel.history.length}>
            <Clipboard size={17} aria-hidden="true" />
            Copiar
          </button>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => exportHistoryCsv(wheel.history, wheel.name)}
            disabled={!wheel.history.length}
          >
            <FileDown size={17} aria-hidden="true" />
            CSV
          </button>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => exportHistoryTxt(wheel.history, wheel.name)}
            disabled={!wheel.history.length}
          >
            <FileText size={17} aria-hidden="true" />
            TXT
          </button>
        </div>
        <div className="inline-actions">
          <button className="button button-secondary" type="button" onClick={onUndo} disabled={!wheel.history.length}>
            <Undo2 size={17} aria-hidden="true" />
            Desfazer último
          </button>
          <button className="button button-secondary" type="button" onClick={onClear} disabled={!wheel.history.length}>
            <Trash2 size={17} aria-hidden="true" />
            Limpar
          </button>
        </div>

        <div className="history-list" aria-label="Histórico de sorteios">
          {wheel.history.length ? (
            wheel.history.map((entry, index) => (
              <div className="history-row" key={entry.id}>
                <span className="pill">#{wheel.history.length - index}</span>
                <div style={{ minWidth: 0 }}>
                  <strong>{entry.value}</strong>
                  <small>Rodada {entry.roundId.slice(-6)}</small>
                </div>
                <small>{formatDateTime(entry.createdAt)}</small>
              </div>
            ))
          ) : (
            <div className="empty-state">Os sorteios aparecerão aqui.</div>
          )}
        </div>

        <button className="button button-secondary" type="button" onClick={onUndo} disabled={!wheel.history.length}>
          <RotateCcw size={17} aria-hidden="true" />
          Voltar último participante
        </button>
      </div>
    </aside>
  )
}
