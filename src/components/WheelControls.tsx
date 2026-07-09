import {
  Download,
  Expand,
  FileJson,
  Pencil,
  RefreshCw,
  RotateCw,
  Settings2,
  Users,
} from 'lucide-react'
import type { ClassroomWheel } from '../types'
import { exportNamesCsv, exportWheelJson } from '../utils/exporters'

interface WheelControlsProps {
  wheel: ClassroomWheel
  totalCount: number
  availableCount: number
  eliminatedCount: number
  isSpinning: boolean
  onSpin: () => void
  onEdit: () => void
  onReset: () => void
  onFullscreen: () => void
  onSettings: () => void
}

export const WheelControls = ({
  wheel,
  totalCount,
  availableCount,
  eliminatedCount,
  isSpinning,
  onSpin,
  onEdit,
  onReset,
  onFullscreen,
  onSettings,
}: WheelControlsProps) => {
  return (
    <aside className="panel">
      <div className="panel-header">
        <div>
          <h2>{wheel.name}</h2>
          <p className="panel-subtitle">{wheel.type === 'numbers' ? 'Roleta numérica' : 'Roleta de nomes'}</p>
        </div>
        <button className="button button-ghost icon-button" type="button" onClick={onSettings} aria-label="Configurações">
          <Settings2 size={19} aria-hidden="true" />
        </button>
      </div>
      <div className="panel-body controls-stack">
        <div className="stat-grid">
          <div className="stat">
            <strong>{availableCount}</strong>
            <span>Disponíveis</span>
          </div>
          <div className="stat">
            <strong>{eliminatedCount}</strong>
            <span>Já sorteados</span>
          </div>
          <div className="stat">
            <strong>{totalCount}</strong>
            <span>Total</span>
          </div>
        </div>

        <button className="button button-primary button-large" type="button" onClick={onSpin} disabled={isSpinning}>
          <RotateCw size={21} aria-hidden="true" />
          {isSpinning ? 'Sorteando...' : 'Sortear'}
        </button>

        <div className="switch-row">
          <div>
            <strong>Rodada</strong>
            <span>
              Sorteia {wheel.drawCount} participante(s).{' '}
              {wheel.eliminateDrawn ? 'Resultados não repetem.' : 'Pode repetir.'}
            </span>
          </div>
          <Users size={22} aria-hidden="true" />
        </div>

        <div className="inline-actions">
          <button className="button button-secondary" type="button" onClick={onEdit}>
            <Pencil size={17} aria-hidden="true" />
            Editar
          </button>
          <button className="button button-secondary" type="button" onClick={onReset}>
            <RefreshCw size={17} aria-hidden="true" />
            Reiniciar
          </button>
          <button className="button button-secondary" type="button" onClick={onFullscreen}>
            <Expand size={17} aria-hidden="true" />
            Tela cheia
          </button>
        </div>

        <div className="inline-actions">
          <button className="button button-secondary" type="button" onClick={() => exportWheelJson(wheel)}>
            <FileJson size={17} aria-hidden="true" />
            JSON
          </button>
          <button className="button button-secondary" type="button" onClick={() => exportNamesCsv(wheel)}>
            <Download size={17} aria-hidden="true" />
            Participantes
          </button>
        </div>
      </div>
    </aside>
  )
}
