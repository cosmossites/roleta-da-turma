import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Dices, Sparkles } from 'lucide-react'
import { ConfettiBurst } from '../components/ConfettiBurst'
import { ConfirmationModal } from '../components/ConfirmationModal'
import { EditWheelModal } from '../components/EditWheelModal'
import { FullscreenMode } from '../components/FullscreenMode'
import { HistoryPanel } from '../components/HistoryPanel'
import { ResultModal } from '../components/ResultModal'
import { RouletteWheel } from '../components/RouletteWheel'
import { SettingsModal } from '../components/SettingsModal'
import { WheelControls } from '../components/WheelControls'
import { createId, THEME_COLORS } from '../data/defaults'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useAppState } from '../store/useAppState'
import type { HistoryEntry, ParticipantOption } from '../types'
import { computeTargetRotation, secureRandomInt } from '../utils/random'
import { getAllParticipants, getAvailableParticipants, validateWheelParticipants } from '../utils/participants'

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

const speedFactor = {
  slow: 1.22,
  normal: 1,
  fast: 0.68,
}

const playTone = (enabled: boolean, frequency: number, duration = 0.11) => {
  if (!enabled) {
    return
  }

  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextClass) {
    return
  }

  const context = new AudioContextClass()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0.001, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start()
  oscillator.stop(context.currentTime + duration)
}

interface WheelPageProps {
  onHome: () => void
}

export const WheelPage = ({ onHome }: WheelPageProps) => {
  const {
    activeWheel,
    data,
    recordDraw,
    resetWheel,
    clearHistory,
    undoLastDraw,
    showToast,
  } = useAppState()
  const reducedMotion = usePrefersReducedMotion()
  const [rotation, setRotation] = useState(0)
  const rotationRef = useRef(0)
  const [spinning, setSpinning] = useState(false)
  const spinningRef = useRef(false)
  const [displayParticipants, setDisplayParticipants] = useState<ParticipantOption[] | null>(null)
  const [highlightedId, setHighlightedId] = useState<string | undefined>()
  const [latestResults, setLatestResults] = useState<HistoryEntry[]>([])
  const [resultOpen, setResultOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [resetConfirm, setResetConfirm] = useState(false)
  const [clearConfirm, setClearConfirm] = useState(false)
  const [confetti, setConfetti] = useState(false)

  useEffect(() => {
    rotationRef.current = rotation
  }, [rotation])

  useEffect(() => {
    spinningRef.current = spinning
  }, [spinning])

  const wheel = activeWheel
  const allParticipants = useMemo(() => (wheel ? getAllParticipants(wheel) : []), [wheel])
  const availableParticipants = useMemo(() => (wheel ? getAvailableParticipants(wheel) : []), [wheel])
  const participantsForWheel = displayParticipants ?? availableParticipants
  const durationMs = reducedMotion
    ? 80
    : Math.round(data.settings.durationMs * speedFactor[data.settings.animationSpeed])
  const theme = wheel ? THEME_COLORS[wheel.theme] : THEME_COLORS.emerald

  const copyText = useCallback(async (text: string, success: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showToast(success, 'success')
    } catch {
      showToast('Não foi possível copiar automaticamente.', 'error')
    }
  }, [showToast])

  const copyResults = useCallback(
    (results: HistoryEntry[]) => {
      if (!results.length) {
        return
      }

      void copyText(
        results.map((result) => `${result.position}. ${result.value}`).join('\n'),
        'Resultados copiados.',
      )
    },
    [copyText],
  )

  const copyHistory = () => {
    if (!wheel?.history.length) {
      return
    }

    void copyText(
      wheel.history
        .map(
          (entry, index) =>
            `${wheel.history.length - index}. ${entry.value} - ${new Date(entry.createdAt).toLocaleString('pt-BR')}`,
        )
        .join('\n'),
      'Histórico copiado.',
    )
  }

  const runSpin = useCallback(async () => {
    if (!wheel) {
      return
    }

    if (spinningRef.current) {
      showToast('A roleta precisa terminar o giro atual.', 'error')
      return
    }

    const validation = validateWheelParticipants(wheel)
    if (validation) {
      showToast(validation, 'error')
      return
    }

    let localParticipants = getAvailableParticipants(wheel)
    const count = Math.min(wheel.drawCount, localParticipants.length)
    const roundId = createId('rodada')
    const results: HistoryEntry[] = []
    const eliminatedIds: string[] = []

    setResultOpen(false)
    setLatestResults([])
    setHighlightedId(undefined)
    setDisplayParticipants(localParticipants)
    setSpinning(true)

    for (let position = 1; position <= count; position += 1) {
      const targetIndex = secureRandomInt(localParticipants.length)
      const result = localParticipants[targetIndex]
      const extraSpins = data.settings.animationSpeed === 'fast' ? 4 : data.settings.animationSpeed === 'slow' ? 7 : 6
      const nextRotation = computeTargetRotation(
        rotationRef.current,
        localParticipants.length,
        targetIndex,
        extraSpins,
      )

      playTone(data.settings.soundEnabled, 220 + position * 40, 0.09)
      setHighlightedId(undefined)
      setRotation(nextRotation)
      await delay(durationMs + 120)
      rotationRef.current = nextRotation
      setHighlightedId(result.id)

      const createdAt = new Date().toISOString()
      const entry: HistoryEntry = {
        id: createId('hist'),
        wheelId: wheel.id,
        roundId,
        position,
        participantId: result.id,
        value: result.label,
        createdAt,
      }
      results.push(entry)
      if (wheel.eliminateDrawn) {
        eliminatedIds.push(result.id)
        localParticipants = localParticipants.filter((participant) => participant.id !== result.id)
      }

      recordDraw(wheel.id, [entry], wheel.eliminateDrawn ? [result.id] : [], createdAt)
      setLatestResults([...results])
      playTone(data.settings.soundEnabled, 660 + position * 30, 0.14)

      if (data.settings.vibrationEnabled && 'vibrate' in navigator) {
        navigator.vibrate?.(position === count ? [40, 30, 40] : 35)
      }

      if (position < count) {
        await delay(reducedMotion ? 80 : 520)
        setDisplayParticipants(localParticipants)
      }
    }

    setSpinning(false)
    setDisplayParticipants(null)
    setResultOpen(true)

    if (data.settings.confettiEnabled) {
      setConfetti(true)
      window.setTimeout(() => setConfetti(false), 1450)
    }
  }, [data.settings, durationMs, recordDraw, reducedMotion, showToast, wheel])

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const editing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable

      if (event.code === 'Space' && !editing) {
        event.preventDefault()
        void runSpin()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [runSpin])

  if (!wheel) {
    return (
      <main className="screen">
        <section className="panel empty-state">Crie uma roleta para começar.</section>
      </main>
    )
  }

  const resetAction = () => {
    resetWheel(wheel.id)
    setLatestResults([])
    setHighlightedId(undefined)
    showToast('Roleta reiniciada.', 'success')
  }

  return (
    <main
      className="screen workspace-grid"
      style={
        {
          '--accent': theme.primary,
          '--accent-2': theme.secondary,
          '--accent-soft': theme.soft,
          '--accent-contrast': theme.contrast,
        } as CSSProperties
      }
    >
      <WheelControls
        wheel={wheel}
        totalCount={allParticipants.length}
        availableCount={availableParticipants.length}
        eliminatedCount={Math.max(0, allParticipants.length - availableParticipants.length)}
        isSpinning={spinning}
        onSpin={() => void runSpin()}
        onEdit={() => setEditOpen(true)}
        onReset={() => {
          if (data.settings.confirmBeforeReset) {
            setResetConfirm(true)
          } else {
            resetAction()
          }
        }}
        onFullscreen={() => setFullscreen(true)}
        onSettings={() => setSettingsOpen(true)}
      />

      <section className="panel">
        <div className="panel-header">
          <div className="brand">
            <span className="brand-mark">
              <Dices size={20} aria-hidden="true" />
            </span>
            <div>
              <h2>Roleta</h2>
              <p className="panel-subtitle">Pressione Espaço para girar quando nenhum campo estiver selecionado.</p>
            </div>
          </div>
          <button className="button button-secondary" type="button" onClick={onHome}>
            <ArrowLeft size={17} aria-hidden="true" />
            Início
          </button>
        </div>
        <div className="roulette-stage">
          <RouletteWheel
            participants={participantsForWheel}
            rotation={rotation}
            durationMs={durationMs}
            spinning={spinning}
            highlightedId={highlightedId}
            theme={wheel.theme}
            showLabels={data.settings.showNamesOnWheel}
          />
        </div>
        <div className="wheel-result">
          <span className="panel-subtitle">Resultado destacado</span>
          <strong>{latestResults.at(-1)?.value ?? 'Aguardando giro'}</strong>
          {latestResults.length > 1 ? <p className="panel-subtitle">{latestResults.map((item) => item.value).join(', ')}</p> : null}
        </div>
      </section>

      <HistoryPanel
        wheel={wheel}
        onCopy={copyHistory}
        onUndo={() => {
          undoLastDraw(wheel.id)
          showToast('Último sorteio desfeito.', 'success')
        }}
        onClear={() => setClearConfirm(true)}
      />

      <ResultModal
        open={resultOpen}
        results={latestResults}
        onClose={() => setResultOpen(false)}
        onNewDraw={() => {
          setResultOpen(false)
          void runSpin()
        }}
        onCopy={() => copyResults(latestResults)}
      />
      <EditWheelModal wheel={wheel} open={editOpen} onClose={() => setEditOpen(false)} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ConfirmationModal
        open={resetConfirm}
        title="Reiniciar roleta?"
        message="Deseja restaurar todos os participantes e limpar o histórico desta roleta?"
        confirmLabel="Reiniciar"
        onCancel={() => setResetConfirm(false)}
        onConfirm={() => {
          resetAction()
          setResetConfirm(false)
        }}
      />
      <ConfirmationModal
        open={clearConfirm}
        title="Limpar histórico?"
        message="Os participantes eliminados serão mantidos; apenas o histórico será removido."
        confirmLabel="Limpar histórico"
        danger
        onCancel={() => setClearConfirm(false)}
        onConfirm={() => {
          clearHistory(wheel.id)
          setClearConfirm(false)
          showToast('Histórico limpo.', 'success')
        }}
      />
      <FullscreenMode
        open={fullscreen}
        wheel={wheel}
        participants={participantsForWheel}
        rotation={rotation}
        durationMs={durationMs}
        spinning={spinning}
        highlightedId={highlightedId}
        theme={wheel.theme}
        showLabels={data.settings.showNamesOnWheel}
        availableCount={availableParticipants.length}
        results={latestResults}
        onSpin={() => void runSpin()}
        onClose={() => setFullscreen(false)}
      />
      <ConfettiBurst active={confetti} />
      {latestResults.length ? (
        <div className="pill" style={{ position: 'fixed', left: 18, bottom: 18, zIndex: 40 }}>
          <Sparkles size={15} aria-hidden="true" />
          {latestResults.at(-1)?.value}
        </div>
      ) : null}
    </main>
  )
}
