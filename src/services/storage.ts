import { createDefaultData, DEFAULT_SETTINGS, STORAGE_KEY } from '../data/defaults'
import type { AppData, ClassroomWheel } from '../types'

const isWheel = (value: unknown): value is ClassroomWheel => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const wheel = value as ClassroomWheel
  return (
    typeof wheel.id === 'string' &&
    typeof wheel.name === 'string' &&
    (wheel.type === 'numbers' || wheel.type === 'names') &&
    Array.isArray(wheel.names) &&
    Array.isArray(wheel.eliminatedIds) &&
    Array.isArray(wheel.history) &&
    typeof wheel.numberConfig?.start === 'number' &&
    typeof wheel.numberConfig?.end === 'number'
  )
}

export const loadData = (): AppData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return createDefaultData()
    }

    const parsed = JSON.parse(raw) as AppData
    if (parsed.version !== 1 || !Array.isArray(parsed.wheels)) {
      return createDefaultData()
    }

    const wheels = parsed.wheels.filter(isWheel)
    if (!wheels.length) {
      return createDefaultData()
    }

    return {
      version: 1,
      wheels,
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
      lastWheelId: parsed.lastWheelId,
    }
  } catch {
    return createDefaultData()
  }
}

export const saveData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const parseJsonFile = async <T,>(file: File) => {
  const text = await file.text()
  return JSON.parse(text) as T
}
