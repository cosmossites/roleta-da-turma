import {
  Copy,
  FileJson,
  History,
  ListPlus,
  Pencil,
  Plus,
  Trash2,
  Upload,
  Users,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { CreateWheelModal } from '../components/CreateWheelModal'
import { EditWheelModal } from '../components/EditWheelModal'
import { ConfirmationModal } from '../components/ConfirmationModal'
import { useAppState } from '../store/useAppState'
import type { AppData, ClassroomWheel } from '../types'
import { formatDateTime } from '../utils/date'
import { exportBackupJson } from '../utils/exporters'
import { getAllParticipants, getAvailableParticipants } from '../utils/participants'
import { parseJsonFile } from '../services/storage'

interface HomePageProps {
  onOpenWheel: () => void
}

export const HomePage = ({ onOpenWheel }: HomePageProps) => {
  const {
    data,
    activeWheel,
    selectWheel,
    deleteWheel,
    duplicateWheel,
    importWheel,
    restoreBackup,
    showToast,
  } = useAppState()
  const [createOpen, setCreateOpen] = useState(false)
  const [editingWheel, setEditingWheel] = useState<ClassroomWheel | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<ClassroomWheel | undefined>()
  const [pendingBackup, setPendingBackup] = useState<AppData | undefined>()
  const importWheelRef = useRef<HTMLInputElement | null>(null)
  const restoreRef = useRef<HTMLInputElement | null>(null)

  const handleImportWheel = async (file?: File) => {
    if (!file) {
      return
    }

    try {
      const wheel = await parseJsonFile<ClassroomWheel>(file)
      importWheel(wheel)
      showToast('Roleta importada com sucesso.', 'success')
    } catch {
      showToast('Não foi possível importar essa roleta.', 'error')
    } finally {
      if (importWheelRef.current) {
        importWheelRef.current.value = ''
      }
    }
  }

  const handleRestoreBackup = async (file?: File) => {
    if (!file) {
      return
    }

    try {
      const backup = await parseJsonFile<AppData>(file)
      if (!Array.isArray(backup.wheels)) {
        throw new Error('backup inválido')
      }
      setPendingBackup(backup)
    } catch {
      showToast('O backup selecionado parece inválido.', 'error')
    } finally {
      if (restoreRef.current) {
        restoreRef.current.value = ''
      }
    }
  }

  const totalParticipants = data.wheels.reduce((sum, wheel) => sum + getAllParticipants(wheel).length, 0)

  return (
    <main className="screen home-grid">
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Roletas salvas</h2>
            <p className="panel-subtitle">Dados persistidos no LocalStorage deste navegador.</p>
          </div>
          <button className="button button-primary" type="button" onClick={() => setCreateOpen(true)}>
            <Plus size={18} aria-hidden="true" />
            Nova roleta
          </button>
        </div>
        <div className="panel-body controls-stack">
          <div className="wheel-list">
            {data.wheels.map((wheel) => {
              const total = getAllParticipants(wheel).length
              const available = getAvailableParticipants(wheel).length
              const selected = activeWheel?.id === wheel.id

              return (
                <article
                  className="wheel-card"
                  key={wheel.id}
                  style={{ borderColor: selected ? 'var(--accent)' : undefined }}
                >
                  <button
                    type="button"
                    className="button button-ghost"
                    style={{ justifyContent: 'flex-start', minHeight: 'auto', padding: 0 }}
                    onClick={() => {
                      selectWheel(wheel.id)
                      onOpenWheel()
                    }}
                  >
                    <div>
                      <h3>{wheel.name}</h3>
                      <div className="wheel-meta">
                        <span className="pill">{wheel.type === 'numbers' ? 'Números' : 'Nomes'}</span>
                        <span>{available} disponíveis</span>
                        <span>{total} participantes</span>
                        <span>Último uso: {formatDateTime(wheel.lastUsedAt)}</span>
                      </div>
                    </div>
                  </button>
                  <div className="inline-actions" aria-label={`Ações para ${wheel.name}`}>
                    <button
                      className="button button-ghost icon-button"
                      type="button"
                      aria-label="Editar roleta"
                      onClick={() => setEditingWheel(wheel)}
                    >
                      <Pencil size={17} aria-hidden="true" />
                    </button>
                    <button
                      className="button button-ghost icon-button"
                      type="button"
                      aria-label="Duplicar roleta"
                      onClick={() => {
                        duplicateWheel(wheel.id)
                        showToast('Roleta duplicada.', 'success')
                      }}
                    >
                      <Copy size={17} aria-hidden="true" />
                    </button>
                    <button
                      className="button button-ghost icon-button"
                      type="button"
                      aria-label="Excluir roleta"
                      onClick={() => setDeleteTarget(wheel)}
                    >
                      <Trash2 size={17} aria-hidden="true" />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <aside className="controls-stack">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Resumo</h2>
              <p className="panel-subtitle">Preparado para uso em sala.</p>
            </div>
            <Users size={20} aria-hidden="true" />
          </div>
          <div className="panel-body controls-stack">
            <div className="stat-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="stat">
                <strong>{data.wheels.length}</strong>
                <span>Roletas criadas</span>
              </div>
              <div className="stat">
                <strong>{totalParticipants}</strong>
                <span>Participantes cadastrados</span>
              </div>
              <div className="stat">
                <strong>{activeWheel?.name ?? '-'}</strong>
                <span>Roleta selecionada</span>
              </div>
            </div>
            <div className="inline-actions">
              <button className="button button-secondary" type="button" onClick={() => importWheelRef.current?.click()}>
                <Upload size={17} aria-hidden="true" />
                Importar roleta
              </button>
              <input
                ref={importWheelRef}
                hidden
                type="file"
                accept="application/json,.json"
                onChange={(event) => void handleImportWheel(event.target.files?.[0])}
              />
              <button className="button button-secondary" type="button" onClick={() => exportBackupJson(data)}>
                <FileJson size={17} aria-hidden="true" />
                Backup
              </button>
              <button className="button button-secondary" type="button" onClick={() => restoreRef.current?.click()}>
                <History size={17} aria-hidden="true" />
                Restaurar
              </button>
              <input
                ref={restoreRef}
                hidden
                type="file"
                accept="application/json,.json"
                onChange={(event) => void handleRestoreBackup(event.target.files?.[0])}
              />
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Dados de demonstração</h2>
              <p className="panel-subtitle">As roletas iniciais podem ser excluídas.</p>
            </div>
            <ListPlus size={20} aria-hidden="true" />
          </div>
          <div className="panel-body">
            <p className="panel-subtitle">
              A aplicação começa com “Turma de Exemplo” e “Grupo de Apresentação” para você testar números e nomes
              imediatamente.
            </p>
          </div>
        </section>
      </aside>

      <CreateWheelModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={onOpenWheel} />
      <EditWheelModal wheel={editingWheel} open={Boolean(editingWheel)} onClose={() => setEditingWheel(undefined)} />
      <ConfirmationModal
        open={Boolean(deleteTarget)}
        title="Excluir roleta?"
        message={`Essa ação removerá "${deleteTarget?.name ?? ''}" deste navegador.`}
        confirmLabel="Excluir"
        danger
        onCancel={() => setDeleteTarget(undefined)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteWheel(deleteTarget.id)
            showToast('Roleta excluída.', 'success')
          }
          setDeleteTarget(undefined)
        }}
      />
      <ConfirmationModal
        open={Boolean(pendingBackup)}
        title="Restaurar backup?"
        message="Isso substituirá as roletas e configurações atuais por uma nova cópia importada."
        confirmLabel="Restaurar"
        danger
        onCancel={() => setPendingBackup(undefined)}
        onConfirm={() => {
          if (pendingBackup) {
            restoreBackup(pendingBackup)
            showToast('Backup restaurado.', 'success')
          }
          setPendingBackup(undefined)
        }}
      />
    </main>
  )
}
