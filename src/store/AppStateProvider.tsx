import { type PropsWithChildren, useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { createId, createNameParticipant, DEFAULT_SETTINGS } from '../data/defaults'
import { loadData, saveData } from '../services/storage'
import type {
  AppData,
  AppSettings,
  ClassroomWheel,
  HistoryEntry,
  ToastMessage,
  WheelFormValues,
} from '../types'
import { getAllParticipants, removeDuplicateNames } from '../utils/participants'
import { AppStateContext, type AppStateContextValue } from './stateContext'

type Action =
  | { type: 'select-wheel'; wheelId: string }
  | { type: 'create-wheel'; wheel: ClassroomWheel }
  | { type: 'update-wheel'; wheelId: string; values: WheelFormValues }
  | { type: 'delete-wheel'; wheelId: string }
  | { type: 'duplicate-wheel'; wheelId: string }
  | {
      type: 'record-draw'
      wheelId: string
      entries: HistoryEntry[]
      eliminatedIds: string[]
      usedAt: string
    }
  | { type: 'reset-wheel'; wheelId: string }
  | { type: 'clear-history'; wheelId: string }
  | { type: 'undo-last'; wheelId: string }
  | { type: 'update-settings'; settings: Partial<AppSettings> }
  | { type: 'import-wheel'; wheel: ClassroomWheel }
  | { type: 'restore-backup'; data: AppData }

const sanitizeValues = (values: WheelFormValues): WheelFormValues => {
  const numberConfig = {
    start: Number.isFinite(values.numberConfig.start) ? Math.round(values.numberConfig.start) : 1,
    end: Number.isFinite(values.numberConfig.end) ? Math.round(values.numberConfig.end) : 2,
    excluded: Array.from(
      new Set(values.numberConfig.excluded.map((item) => Math.round(item)).filter(Number.isFinite)),
    ),
  }

  const names = removeDuplicateNames(values.names).filter((item) => item.label.trim())

  return {
    ...values,
    name: values.name.trim() || 'Roleta sem nome',
    drawCount: Math.max(1, Math.round(values.drawCount || 1)),
    numberConfig,
    names,
  }
}

const createWheelFromValues = (values: WheelFormValues): ClassroomWheel => {
  const sanitized = sanitizeValues(values)
  const now = new Date().toISOString()

  return {
    id: createId('wheel'),
    name: sanitized.name,
    type: sanitized.type,
    theme: sanitized.theme,
    eliminateDrawn: sanitized.eliminateDrawn,
    drawCount: sanitized.drawCount,
    numberConfig: sanitized.numberConfig,
    names: sanitized.names,
    eliminatedIds: [],
    history: [],
    createdAt: now,
    updatedAt: now,
  }
}

const updateWheelFromValues = (wheel: ClassroomWheel, values: WheelFormValues): ClassroomWheel => {
  const sanitized = sanitizeValues(values)
  const nextWheel: ClassroomWheel = {
    ...wheel,
    name: sanitized.name,
    type: sanitized.type,
    theme: sanitized.theme,
    eliminateDrawn: sanitized.eliminateDrawn,
    drawCount: sanitized.drawCount,
    numberConfig: sanitized.numberConfig,
    names: sanitized.names,
    updatedAt: new Date().toISOString(),
  }
  const validIds = new Set(getAllParticipants(nextWheel).map((participant) => participant.id))

  return {
    ...nextWheel,
    eliminatedIds: nextWheel.eliminatedIds.filter((id) => validIds.has(id)),
  }
}

const normalizeImportedWheel = (wheel: ClassroomWheel, preserveId = false): ClassroomWheel => {
  const now = new Date().toISOString()
  const normalizedNames = removeDuplicateNames(
    wheel.names.map((item) => ({
      id: item.id || createId('name'),
      label: String(item.label ?? '').trim(),
    })),
  )

  return {
    ...wheel,
    id: preserveId && wheel.id ? wheel.id : createId('wheel'),
    name: `${wheel.name || 'Roleta importada'}`,
    type: wheel.type === 'names' ? 'names' : 'numbers',
    theme: wheel.theme || 'emerald',
    eliminateDrawn: Boolean(wheel.eliminateDrawn),
    drawCount: Math.max(1, Math.round(wheel.drawCount || 1)),
    numberConfig: {
      start: Math.round(wheel.numberConfig?.start || 1),
      end: Math.round(wheel.numberConfig?.end || 2),
      excluded: Array.isArray(wheel.numberConfig?.excluded)
        ? wheel.numberConfig.excluded.map(Number).filter(Number.isFinite)
        : [],
    },
    names: normalizedNames,
    eliminatedIds: Array.isArray(wheel.eliminatedIds) ? wheel.eliminatedIds : [],
    history: Array.isArray(wheel.history) ? wheel.history : [],
    createdAt: preserveId && wheel.createdAt ? wheel.createdAt : now,
    updatedAt: now,
  }
}

const reducer = (state: AppData, action: Action): AppData => {
  switch (action.type) {
    case 'select-wheel':
      return { ...state, lastWheelId: action.wheelId }

    case 'create-wheel': {
      const wheel = action.wheel
      return {
        ...state,
        wheels: [wheel, ...state.wheels],
        lastWheelId: wheel.id,
      }
    }

    case 'update-wheel':
      return {
        ...state,
        wheels: state.wheels.map((wheel) =>
          wheel.id === action.wheelId ? updateWheelFromValues(wheel, action.values) : wheel,
        ),
      }

    case 'delete-wheel': {
      const wheels = state.wheels.filter((wheel) => wheel.id !== action.wheelId)
      return {
        ...state,
        wheels,
        lastWheelId:
          state.lastWheelId === action.wheelId ? wheels[0]?.id : state.lastWheelId ?? wheels[0]?.id,
      }
    }

    case 'duplicate-wheel': {
      const original = state.wheels.find((wheel) => wheel.id === action.wheelId)
      if (!original) {
        return state
      }

      const now = new Date().toISOString()
      const copy: ClassroomWheel = {
        ...original,
        id: createId('wheel'),
        name: `${original.name} (cópia)`,
        names: original.names.map((participant) => createNameParticipant(participant.label)),
        eliminatedIds: [],
        history: [],
        createdAt: now,
        updatedAt: now,
        lastUsedAt: undefined,
      }

      return {
        ...state,
        wheels: [copy, ...state.wheels],
        lastWheelId: copy.id,
      }
    }

    case 'record-draw':
      return {
        ...state,
        lastWheelId: action.wheelId,
        wheels: state.wheels.map((wheel) =>
          wheel.id === action.wheelId
            ? {
                ...wheel,
                history: [...action.entries, ...wheel.history],
                eliminatedIds: Array.from(new Set([...wheel.eliminatedIds, ...action.eliminatedIds])),
                updatedAt: action.usedAt,
                lastUsedAt: action.usedAt,
              }
            : wheel,
        ),
      }

    case 'reset-wheel':
      return {
        ...state,
        wheels: state.wheels.map((wheel) =>
          wheel.id === action.wheelId
            ? {
                ...wheel,
                eliminatedIds: [],
                history: [],
                updatedAt: new Date().toISOString(),
              }
            : wheel,
        ),
      }

    case 'clear-history':
      return {
        ...state,
        wheels: state.wheels.map((wheel) =>
          wheel.id === action.wheelId
            ? {
                ...wheel,
                history: [],
                updatedAt: new Date().toISOString(),
              }
            : wheel,
        ),
      }

    case 'undo-last':
      return {
        ...state,
        wheels: state.wheels.map((wheel) => {
          if (wheel.id !== action.wheelId || !wheel.history.length) {
            return wheel
          }

          const [last, ...rest] = wheel.history
          return {
            ...wheel,
            history: rest,
            eliminatedIds: wheel.eliminatedIds.filter((id) => id !== last.participantId),
            updatedAt: new Date().toISOString(),
          }
        }),
      }

    case 'update-settings':
      return {
        ...state,
        settings: { ...state.settings, ...action.settings },
      }

    case 'import-wheel': {
      const wheel = normalizeImportedWheel(action.wheel)
      return {
        ...state,
        wheels: [wheel, ...state.wheels],
        lastWheelId: wheel.id,
      }
    }

    case 'restore-backup': {
      const wheels = action.data.wheels.length
        ? action.data.wheels.map((wheel) => normalizeImportedWheel(wheel, true))
        : state.wheels
      const restoredLastWheel = wheels.find((wheel) => wheel.id === action.data.lastWheelId)?.id ?? wheels[0]?.id
      return {
        version: 1,
        wheels,
        settings: { ...DEFAULT_SETTINGS, ...action.data.settings },
        lastWheelId: restoredLastWheel ?? state.lastWheelId,
      }
    }

    default:
      return state
  }
}

export const AppStateProvider = ({ children }: PropsWithChildren) => {
  const [data, dispatch] = useReducer(reducer, undefined, loadData)
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    saveData(data)
  }, [data])

  const showToast = useCallback((message: string, tone: ToastMessage['tone'] = 'info') => {
    const toast = { id: createId('toast'), message, tone }
    setToasts((current) => [...current, toast])
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== toast.id))
    }, 4300)
  }, [])

  const dismissToast = useCallback((toastId: string) => {
    setToasts((current) => current.filter((item) => item.id !== toastId))
  }, [])

  const activeWheel = useMemo(() => {
    return data.wheels.find((wheel) => wheel.id === data.lastWheelId) ?? data.wheels[0]
  }, [data.lastWheelId, data.wheels])

  const value = useMemo<AppStateContextValue>(
    () => ({
      data,
      activeWheel,
      toasts,
      selectWheel: (wheelId) => dispatch({ type: 'select-wheel', wheelId }),
      createWheel: (values) => {
        const wheel = createWheelFromValues(values)
        dispatch({ type: 'create-wheel', wheel })
        return wheel
      },
      updateWheel: (wheelId, values) => dispatch({ type: 'update-wheel', wheelId, values }),
      deleteWheel: (wheelId) => dispatch({ type: 'delete-wheel', wheelId }),
      duplicateWheel: (wheelId) => dispatch({ type: 'duplicate-wheel', wheelId }),
      recordDraw: (wheelId, entries, eliminatedIds, usedAt) =>
        dispatch({ type: 'record-draw', wheelId, entries, eliminatedIds, usedAt }),
      resetWheel: (wheelId) => dispatch({ type: 'reset-wheel', wheelId }),
      clearHistory: (wheelId) => dispatch({ type: 'clear-history', wheelId }),
      undoLastDraw: (wheelId) => dispatch({ type: 'undo-last', wheelId }),
      updateSettings: (settings) => dispatch({ type: 'update-settings', settings }),
      importWheel: (wheel) => dispatch({ type: 'import-wheel', wheel }),
      restoreBackup: (backup) => dispatch({ type: 'restore-backup', data: backup }),
      showToast,
      dismissToast,
    }),
    [activeWheel, data, dismissToast, showToast, toasts],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}
