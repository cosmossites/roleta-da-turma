import { AlertCircle, Hash, Type } from 'lucide-react'
import { type CSSProperties, useMemo, useState } from 'react'
import { THEME_COLORS } from '../data/defaults'
import type { WheelFormValues, WheelType } from '../types'
import { getAllParticipants, parseExcludedNumbers } from '../utils/participants'
import { ParticipantsEditor } from './ParticipantsEditor'

interface WheelFormProps {
  initialValues: WheelFormValues
  submitLabel: string
  onSubmit: (values: WheelFormValues) => void
  onCancel: () => void
}

export const WheelForm = ({ initialValues, submitLabel, onSubmit, onCancel }: WheelFormProps) => {
  const [values, setValues] = useState<WheelFormValues>(initialValues)
  const [excludedText, setExcludedText] = useState(initialValues.numberConfig.excluded.join(', '))
  const [error, setError] = useState('')

  const previewWheel = useMemo(
    () => ({
      id: 'preview',
      createdAt: '',
      updatedAt: '',
      eliminatedIds: [],
      history: [],
      ...values,
    }),
    [values],
  )
  const participantCount = getAllParticipants(previewWheel).length

  const update = (patch: Partial<WheelFormValues>) => {
    setValues((current) => ({ ...current, ...patch }))
  }

  const setType = (type: WheelType) => {
    update({ type })
  }

  const submit = () => {
    const next = {
      ...values,
      numberConfig: {
        ...values.numberConfig,
        excluded: parseExcludedNumbers(excludedText),
      },
    }

    if (!next.name.trim()) {
      setError('Informe um nome para a roleta.')
      return
    }

    if (next.type === 'numbers' && next.numberConfig.end < next.numberConfig.start) {
      setError('O número final não pode ser menor que o número inicial.')
      return
    }

    const preview = {
      id: 'preview',
      createdAt: '',
      updatedAt: '',
      eliminatedIds: [],
      history: [],
      ...next,
    }

    if (getAllParticipants(preview).length < 2) {
      setError('Adicione pelo menos dois participantes.')
      return
    }

    if (next.drawCount <= 0) {
      setError('A quantidade de sorteios precisa ser maior que zero.')
      return
    }

    if (next.drawCount > getAllParticipants(preview).length) {
      setError(`Existem apenas ${getAllParticipants(preview).length} participantes disponíveis.`)
      return
    }

    setError('')
    onSubmit(next)
  }

  return (
    <div className="controls-stack">
      <div className="form-grid">
        <label className="field">
          <span>Nome da roleta</span>
          <input
            value={values.name}
            placeholder="Ex.: Turma 1001"
            onChange={(event) => update({ name: event.target.value })}
          />
        </label>

        <label className="field">
          <span>Quantidade sorteada por rodada</span>
          <input
            min={1}
            type="number"
            value={values.drawCount}
            onChange={(event) => update({ drawCount: Number(event.target.value) })}
          />
        </label>
      </div>

      <div className="field">
        <span className="field-label">Tipo da roleta</span>
        <div className="segmented">
          <button type="button" data-active={values.type === 'numbers'} onClick={() => setType('numbers')}>
            <Hash size={16} aria-hidden="true" />
            Números
          </button>
          <button type="button" data-active={values.type === 'names'} onClick={() => setType('names')}>
            <Type size={16} aria-hidden="true" />
            Nomes
          </button>
        </div>
      </div>

      <div className="field">
        <span className="field-label">Tema visual</span>
        <div className="theme-grid">
          {Object.entries(THEME_COLORS).map(([key, theme]) => (
            <button
              key={key}
              className="theme-swatch"
              type="button"
              title={theme.name}
              aria-label={`Tema ${theme.name}`}
              style={{ '--swatch': `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` } as CSSProperties}
              data-active={values.theme === key}
              onClick={() => update({ theme: key as WheelFormValues['theme'] })}
            />
          ))}
        </div>
      </div>

      <div className="switch-row">
        <div>
          <strong>Não repetir participantes já sorteados</strong>
          <span>Remove cada resultado da roleta até reiniciar.</span>
        </div>
        <button
          className="toggle"
          type="button"
          data-active={values.eliminateDrawn}
          aria-label="Não repetir participantes já sorteados"
          onClick={() => update({ eliminateDrawn: !values.eliminateDrawn })}
        />
      </div>

      {values.type === 'numbers' ? (
        <div className="controls-stack">
          <div className="form-grid">
            <label className="field">
              <span>Número inicial</span>
              <input
                type="number"
                value={values.numberConfig.start}
                onChange={(event) =>
                  update({
                    numberConfig: { ...values.numberConfig, start: Number(event.target.value) },
                  })
                }
              />
            </label>
            <label className="field">
              <span>Número final</span>
              <input
                type="number"
                value={values.numberConfig.end}
                onChange={(event) =>
                  update({
                    numberConfig: { ...values.numberConfig, end: Number(event.target.value) },
                  })
                }
              />
            </label>
          </div>
          <label className="field">
            <span>Números ignorados</span>
            <input
              value={excludedText}
              placeholder="Ex.: 3, 8, 19"
              onChange={(event) => setExcludedText(event.target.value)}
            />
          </label>
        </div>
      ) : (
        <ParticipantsEditor value={values.names} onChange={(names) => update({ names })} />
      )}

      <div className="stat-grid">
        <div className="stat">
          <strong>{participantCount}</strong>
          <span>Participantes na prévia</span>
        </div>
        <div className="stat">
          <strong>{values.drawCount}</strong>
          <span>Por rodada</span>
        </div>
        <div className="stat">
          <strong>{values.eliminateDrawn ? 'Sim' : 'Não'}</strong>
          <span>Eliminação</span>
        </div>
      </div>

      {error ? (
        <div className="toast" data-tone="error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          {error}
        </div>
      ) : null}

      <div className="inline-actions" style={{ justifyContent: 'flex-end' }}>
        <button className="button button-secondary" type="button" onClick={onCancel}>
          Cancelar
        </button>
        <button className="button button-primary" type="button" onClick={submit}>
          {submitLabel}
        </button>
      </div>
    </div>
  )
}
