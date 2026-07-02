import { createContext } from 'react'
import type {
  AppData,
  AppSettings,
  ClassroomWheel,
  HistoryEntry,
  ToastMessage,
  WheelFormValues,
} from '../types'

export interface AppStateContextValue {
  data: AppData
  activeWheel?: ClassroomWheel
  toasts: ToastMessage[]
  selectWheel: (wheelId: string) => void
  createWheel: (values: WheelFormValues) => ClassroomWheel
  updateWheel: (wheelId: string, values: WheelFormValues) => void
  deleteWheel: (wheelId: string) => void
  duplicateWheel: (wheelId: string) => void
  recordDraw: (
    wheelId: string,
    entries: HistoryEntry[],
    eliminatedIds: string[],
    usedAt: string,
  ) => void
  resetWheel: (wheelId: string) => void
  clearHistory: (wheelId: string) => void
  undoLastDraw: (wheelId: string) => void
  updateSettings: (settings: Partial<AppSettings>) => void
  importWheel: (wheel: ClassroomWheel) => void
  restoreBackup: (data: AppData) => void
  showToast: (message: string, tone?: ToastMessage['tone']) => void
  dismissToast: (toastId: string) => void
}

export const AppStateContext = createContext<AppStateContextValue | null>(null)
