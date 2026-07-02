import { ArrowDown, ArrowUp, Download, GripVertical, Plus, Trash2, Upload, Wand2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { createNameParticipant } from '../data/defaults'
import type { NameParticipant } from '../types'
import { downloadBlob, namesToCsv } from '../utils/exporters'
import { removeDuplicateNames, splitParticipantText } from '../utils/participants'

interface ParticipantsEditorProps {
  value: NameParticipant[]
  onChange: (participants: NameParticipant[]) => void
}

export const ParticipantsEditor = ({ value, onChange }: ParticipantsEditorProps) => {
  const [singleName, setSingleName] = useState('')
  const [bulkText, setBulkText] = useState('')
  const fileRef = useRef<HTMLInputElement | null>(null)

  const addNames = (labels: string[]) => {
    const next = [...value, ...labels.map(createNameParticipant)]
    onChange(removeDuplicateNames(next))
  }

  const addSingle = () => {
    const label = singleName.trim()
    if (!label) {
      return
    }

    addNames([label])
    setSingleName('')
  }

  const updateName = (id: string, label: string) => {
    onChange(value.map((item) => (item.id === id ? { ...item, label } : item)))
  }

  const removeName = (id: string) => {
    onChange(value.filter((item) => item.id !== id))
  }

  const moveName = (index: number, direction: -1 | 1) => {
    const next = [...value]
    const target = index + direction
    if (target < 0 || target >= next.length) {
      return
    }

    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)
    onChange(next)
  }

  const importFile = async (file?: File) => {
    if (!file) {
      return
    }

    const text = await file.text()
    addNames(splitParticipantText(text))
    if (fileRef.current) {
      fileRef.current.value = ''
    }
  }

  return (
    <div className="controls-stack">
      <div className="form-grid">
        <label className="field">
          <span>Adicionar um nome</span>
          <input
            value={singleName}
            placeholder="Ex.: Mariana"
            onChange={(event) => setSingleName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addSingle()
              }
            }}
          />
        </label>
        <div className="field">
          <span className="field-label">Ações rápidas</span>
          <div className="inline-actions">
            <button className="button button-primary" type="button" onClick={addSingle}>
              <Plus size={17} aria-hidden="true" />
              Adicionar
            </button>
            <button className="button button-secondary" type="button" onClick={() => fileRef.current?.click()}>
              <Upload size={17} aria-hidden="true" />
              Importar
            </button>
            <input
              ref={fileRef}
              hidden
              type="file"
              accept=".txt,.csv,text/plain,text/csv"
              onChange={(event) => void importFile(event.target.files?.[0])}
            />
          </div>
        </div>
      </div>

      <label className="field">
        <span>Colar lista de nomes</span>
        <textarea
          value={bulkText}
          placeholder="Cole nomes separados por linha, vírgula ou ponto e vírgula."
          onChange={(event) => setBulkText(event.target.value)}
        />
      </label>
      <div className="inline-actions">
        <button
          className="button button-secondary"
          type="button"
          onClick={() => {
            addNames(splitParticipantText(bulkText))
            setBulkText('')
          }}
        >
          <Plus size={17} aria-hidden="true" />
          Adicionar lista
        </button>
        <button className="button button-secondary" type="button" onClick={() => onChange(removeDuplicateNames(value))}>
          <Wand2 size={17} aria-hidden="true" />
          Remover repetidos
        </button>
        <button
          className="button button-secondary"
          type="button"
          onClick={() => downloadBlob('participantes.csv', namesToCsv(value), 'text/csv;charset=utf-8')}
        >
          <Download size={17} aria-hidden="true" />
          Exportar lista
        </button>
      </div>

      <div className="panel-subtitle">{value.length} participantes cadastrados.</div>

      <div className="participants-list" aria-label="Lista de participantes">
        {value.length ? (
          value.map((participant, index) => (
            <div className="participant-row" key={participant.id}>
              <GripVertical size={18} aria-hidden="true" />
              <input
                aria-label={`Nome do participante ${index + 1}`}
                value={participant.label}
                onChange={(event) => updateName(participant.id, event.target.value)}
              />
              <div className="inline-actions">
                <button
                  className="button button-ghost icon-button"
                  type="button"
                  aria-label="Mover para cima"
                  onClick={() => moveName(index, -1)}
                  disabled={index === 0}
                >
                  <ArrowUp size={16} aria-hidden="true" />
                </button>
                <button
                  className="button button-ghost icon-button"
                  type="button"
                  aria-label="Mover para baixo"
                  onClick={() => moveName(index, 1)}
                  disabled={index === value.length - 1}
                >
                  <ArrowDown size={16} aria-hidden="true" />
                </button>
                <button
                  className="button button-ghost icon-button"
                  type="button"
                  aria-label="Excluir nome"
                  onClick={() => removeName(participant.id)}
                >
                  <Trash2 size={17} aria-hidden="true" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">Nenhum nome cadastrado.</div>
        )}
      </div>
    </div>
  )
}
