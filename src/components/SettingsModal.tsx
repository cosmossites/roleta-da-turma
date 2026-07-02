import { AnimatePresence, motion } from 'framer-motion'
import { Moon, Settings, Sun, Volume2, X } from 'lucide-react'
import { useAppState } from '../store/useAppState'
import type { AnimationSpeed, ThemeMode } from '../types'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

const speedOptions: { value: AnimationSpeed; label: string }[] = [
  { value: 'slow', label: 'Lenta' },
  { value: 'normal', label: 'Normal' },
  { value: 'fast', label: 'Rápida' },
]

const themeModes: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'auto', label: 'Automático' },
]

export const SettingsModal = ({ open, onClose }: SettingsModalProps) => {
  const { data, updateSettings } = useAppState()
  const settings = data.settings

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
            aria-labelledby="settings-title"
          >
            <div className="panel-header">
              <div className="brand">
                <span className="brand-mark">
                  <Settings size={20} aria-hidden="true" />
                </span>
                <div>
                  <h2 id="settings-title">Configurações</h2>
                  <p className="panel-subtitle">Preferências gerais salvas neste navegador.</p>
                </div>
              </div>
              <button className="button button-ghost icon-button" type="button" onClick={onClose} aria-label="Fechar">
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div className="switch-row">
                  <div>
                    <strong>Ativar sons</strong>
                    <span>Som curto durante o giro e ao finalizar.</span>
                  </div>
                  <button
                    className="toggle"
                    type="button"
                    data-active={settings.soundEnabled}
                    aria-label="Ativar ou desativar sons"
                    onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                  />
                </div>
                <div className="switch-row">
                  <div>
                    <strong>Confetes</strong>
                    <span>Animação discreta quando o resultado aparece.</span>
                  </div>
                  <button
                    className="toggle"
                    type="button"
                    data-active={settings.confettiEnabled}
                    aria-label="Ativar ou desativar confetes"
                    onClick={() => updateSettings({ confettiEnabled: !settings.confettiEnabled })}
                  />
                </div>
                <div className="switch-row">
                  <div>
                    <strong>Mostrar nomes na roleta</strong>
                    <span>Em turmas grandes, o texto será abreviado.</span>
                  </div>
                  <button
                    className="toggle"
                    type="button"
                    data-active={settings.showNamesOnWheel}
                    aria-label="Mostrar ou esconder nomes na roleta"
                    onClick={() => updateSettings({ showNamesOnWheel: !settings.showNamesOnWheel })}
                  />
                </div>
                <div className="switch-row">
                  <div>
                    <strong>Confirmar reinício</strong>
                    <span>Solicitar confirmação antes de restaurar participantes.</span>
                  </div>
                  <button
                    className="toggle"
                    type="button"
                    data-active={settings.confirmBeforeReset}
                    aria-label="Confirmar antes de reiniciar roleta"
                    onClick={() => updateSettings({ confirmBeforeReset: !settings.confirmBeforeReset })}
                  />
                </div>
                <div className="switch-row">
                  <div>
                    <strong>Vibração em celulares</strong>
                    <span>Usa o recurso do aparelho quando disponível.</span>
                  </div>
                  <button
                    className="toggle"
                    type="button"
                    data-active={settings.vibrationEnabled}
                    aria-label="Ativar vibração em celulares compatíveis"
                    onClick={() => updateSettings({ vibrationEnabled: !settings.vibrationEnabled })}
                  />
                </div>
                <label className="field">
                  <span>Velocidade da animação</span>
                  <select
                    value={settings.animationSpeed}
                    onChange={(event) => updateSettings({ animationSpeed: event.target.value as AnimationSpeed })}
                  >
                    {speedOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Duração da rotação: {(settings.durationMs / 1000).toFixed(1)}s</span>
                  <input
                    type="range"
                    min="1800"
                    max="8000"
                    step="100"
                    value={settings.durationMs}
                    onChange={(event) => updateSettings({ durationMs: Number(event.target.value) })}
                  />
                </label>
                <div className="field">
                  <span className="field-label">Tema</span>
                  <div className="segmented" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                    {themeModes.map((mode) => (
                      <button
                        key={mode.value}
                        type="button"
                        data-active={settings.themeMode === mode.value}
                        onClick={() => updateSettings({ themeMode: mode.value })}
                      >
                        {mode.value === 'light' ? <Sun size={16} aria-hidden="true" /> : null}
                        {mode.value === 'dark' ? <Moon size={16} aria-hidden="true" /> : null}
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="switch-row">
                  <div>
                    <strong>Status de áudio</strong>
                    <span>Os sons são gerados localmente, sem arquivo externo.</span>
                  </div>
                  <Volume2 size={22} aria-hidden="true" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
