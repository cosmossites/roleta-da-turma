import type { ClassroomWheel, NameParticipant, ParticipantOption } from '../types'

const normalizeName = (value: string) => value.trim().replace(/\s+/g, ' ')

export const splitParticipantText = (value: string) => {
  return value
    .split(/[\n,;]+/)
    .map(normalizeName)
    .filter(Boolean)
}

export const removeDuplicateNames = (names: NameParticipant[]) => {
  const seen = new Set<string>()

  return names.filter((participant) => {
    const key = normalizeName(participant.label).toLocaleLowerCase('pt-BR')
    if (!key || seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

export const parseExcludedNumbers = (value: string) => {
  return Array.from(
    new Set(
      value
        .split(/[\s,;]+/)
        .map((item) => Number.parseInt(item.trim(), 10))
        .filter(Number.isFinite),
    ),
  )
}

export const getAllParticipants = (wheel: ClassroomWheel): ParticipantOption[] => {
  if (wheel.type === 'numbers') {
    const start = Math.min(wheel.numberConfig.start, wheel.numberConfig.end)
    const end = Math.max(wheel.numberConfig.start, wheel.numberConfig.end)
    const excluded = new Set(wheel.numberConfig.excluded)
    const participants: ParticipantOption[] = []

    for (let number = start; number <= end; number += 1) {
      if (!excluded.has(number)) {
        participants.push({
          id: `num:${number}`,
          label: String(number),
          shortLabel: String(number),
          value: number,
          originalIndex: participants.length,
        })
      }
    }

    return participants
  }

  return wheel.names
    .map((participant, index) => ({
      id: participant.id,
      label: normalizeName(participant.label),
      shortLabel: abbreviateLabel(participant.label),
      value: participant.label,
      originalIndex: index,
    }))
    .filter((participant) => participant.label.length > 0)
}

export const getAvailableParticipants = (wheel: ClassroomWheel) => {
  const participants = getAllParticipants(wheel)

  if (!wheel.eliminateDrawn) {
    return participants
  }

  const eliminated = new Set(wheel.eliminatedIds)
  return participants.filter((participant) => !eliminated.has(participant.id))
}

export const abbreviateLabel = (label: string, maxLength = 13) => {
  const clean = normalizeName(label)
  if (clean.length <= maxLength) {
    return clean
  }

  return `${clean.slice(0, Math.max(4, maxLength - 1))}…`
}

export const validateWheelParticipants = (wheel: ClassroomWheel) => {
  const total = getAllParticipants(wheel).length
  const available = getAvailableParticipants(wheel).length

  if (total < 2) {
    return 'Adicione pelo menos dois participantes.'
  }

  if (available <= 0) {
    return 'Todos os participantes já foram sorteados. Reinicie a roleta para continuar.'
  }

  if (wheel.drawCount <= 0) {
    return 'A quantidade de sorteios precisa ser maior que zero.'
  }

  if (wheel.eliminateDrawn && wheel.drawCount > available) {
    return `Existem apenas ${available} participantes disponíveis.`
  }

  return ''
}
