import type { AppData, ClassroomWheel, HistoryEntry, NameParticipant } from '../types'
import { formatFileDate } from './date'

const escapeCsv = (value: string | number) => {
  const text = String(value)
  if (/[",\n;]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }

  return text
}

export const downloadBlob = (fileName: string, content: string, type: string) => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export const exportWheelJson = (wheel: ClassroomWheel) => {
  downloadBlob(
    `${wheel.name.replace(/\s+/g, '-').toLowerCase()}-${formatFileDate()}.json`,
    JSON.stringify(wheel, null, 2),
    'application/json;charset=utf-8',
  )
}

export const exportBackupJson = (data: AppData) => {
  downloadBlob(
    `backup-roleta-da-turma-${formatFileDate()}.json`,
    JSON.stringify(data, null, 2),
    'application/json;charset=utf-8',
  )
}

export const exportNamesCsv = (wheel: ClassroomWheel) => {
  const rows =
    wheel.type === 'names'
      ? [['ordem', 'nome'], ...wheel.names.map((item, index) => [index + 1, item.label])]
      : [
          ['ordem', 'numero'],
          ...Array.from(
            { length: wheel.numberConfig.end - wheel.numberConfig.start + 1 },
            (_, index) => {
              const value = wheel.numberConfig.start + index
              return wheel.numberConfig.excluded.includes(value) ? undefined : [index + 1, value]
            },
          ).filter(Boolean),
        ]

  downloadBlob(
    `participantes-${wheel.name.replace(/\s+/g, '-').toLowerCase()}.csv`,
    rows.map((row) => row!.map(escapeCsv).join(',')).join('\n'),
    'text/csv;charset=utf-8',
  )
}

export const exportHistoryCsv = (history: HistoryEntry[], wheelName: string) => {
  const rows = [
    ['ordem', 'rodada', 'resultado', 'data_hora'],
    ...history.map((entry, index) => [
      index + 1,
      entry.roundId,
      entry.value,
      new Date(entry.createdAt).toLocaleString('pt-BR'),
    ]),
  ]

  downloadBlob(
    `historico-${wheelName.replace(/\s+/g, '-').toLowerCase()}.csv`,
    rows.map((row) => row.map(escapeCsv).join(',')).join('\n'),
    'text/csv;charset=utf-8',
  )
}

export const exportHistoryTxt = (history: HistoryEntry[], wheelName: string) => {
  const content = history
    .map((entry, index) => {
      return `${index + 1}. ${entry.value} - rodada ${entry.roundId} - ${new Date(
        entry.createdAt,
      ).toLocaleString('pt-BR')}`
    })
    .join('\n')

  downloadBlob(
    `historico-${wheelName.replace(/\s+/g, '-').toLowerCase()}.txt`,
    content || 'Sem histórico.',
    'text/plain;charset=utf-8',
  )
}

export const namesToCsv = (names: NameParticipant[]) => {
  return [['ordem', 'nome'], ...names.map((item, index) => [index + 1, item.label])]
    .map((row) => row.map(escapeCsv).join(','))
    .join('\n')
}
