import { Minimize2, RotateCw } from 'lucide-react'
import type { ClassroomWheel, HistoryEntry, ParticipantOption, ThemeKey } from '../types'
import { RouletteWheel } from './RouletteWheel'

interface FullscreenModeProps {
  open: boolean
  wheel: ClassroomWheel
  participants: ParticipantOption[]
  rotation: number
  durationMs: number
  spinning: boolean
  highlightedId?: string
  theme: ThemeKey
  showLabels: boolean
  availableCount: number
  results: HistoryEntry[]
  onSpin: () => void
  onClose: () => void
}

export const FullscreenMode = ({
  open,
  wheel,
  participants,
  rotation,
  durationMs,
  spinning,
  highlightedId,
  theme,
  showLabels,
  availableCount,
  results,
  onSpin,
  onClose,
}: FullscreenModeProps) => {
  if (!open) {
    return null
  }

  return (
    <section className="fullscreen-mode" aria-label="Modo tela cheia">
      <div className="app-header">
        <div className="brand">
          <span className="brand-mark">R</span>
          <div>
            <h1>{wheel.name}</h1>
            <p>{availableCount} participantes restantes</p>
          </div>
        </div>
        <button className="button button-secondary" type="button" onClick={onClose}>
          <Minimize2 size={18} aria-hidden="true" />
          Sair
        </button>
      </div>
      <div className="fullscreen-main">
        <RouletteWheel
          participants={participants}
          rotation={rotation}
          durationMs={durationMs}
          spinning={spinning}
          highlightedId={highlightedId}
          theme={theme}
          showLabels={showLabels}
        />
      </div>
      <div className="panel" style={{ padding: 14 }}>
        <div className="inline-actions" style={{ justifyContent: 'center' }}>
          <button className="button button-primary button-large" type="button" onClick={onSpin} disabled={spinning}>
            <RotateCw size={21} aria-hidden="true" />
            {spinning ? 'Sorteando...' : 'Sortear'}
          </button>
        </div>
        {results.length ? (
          <div className="wheel-result">
            <span className="panel-subtitle">Últimos resultados</span>
            <strong>{results.map((result) => result.value).join(', ')}</strong>
          </div>
        ) : null}
      </div>
    </section>
  )
}
