export type WheelType = 'numbers' | 'names'

export type ThemeKey = 'emerald' | 'cyan' | 'amber' | 'rose' | 'indigo' | 'slate'

export type ThemeMode = 'light' | 'dark' | 'auto'

export type AnimationSpeed = 'slow' | 'normal' | 'fast'

export interface NumberConfig {
  start: number
  end: number
  excluded: number[]
}

export interface NameParticipant {
  id: string
  label: string
}

export interface ParticipantOption {
  id: string
  label: string
  shortLabel: string
  value: string | number
  originalIndex: number
}

export interface HistoryEntry {
  id: string
  wheelId: string
  roundId: string
  position: number
  participantId: string
  value: string
  createdAt: string
}

export interface ClassroomWheel {
  id: string
  name: string
  type: WheelType
  theme: ThemeKey
  eliminateDrawn: boolean
  drawCount: number
  numberConfig: NumberConfig
  names: NameParticipant[]
  eliminatedIds: string[]
  history: HistoryEntry[]
  createdAt: string
  updatedAt: string
  lastUsedAt?: string
}

export interface AppSettings {
  soundEnabled: boolean
  confettiEnabled: boolean
  animationSpeed: AnimationSpeed
  durationMs: number
  themeMode: ThemeMode
  showNamesOnWheel: boolean
  confirmBeforeReset: boolean
  vibrationEnabled: boolean
}

export interface AppData {
  version: 1
  wheels: ClassroomWheel[]
  settings: AppSettings
  lastWheelId?: string
}

export interface WheelFormValues {
  name: string
  type: WheelType
  theme: ThemeKey
  eliminateDrawn: boolean
  drawCount: number
  numberConfig: NumberConfig
  names: NameParticipant[]
}

export interface ToastMessage {
  id: string
  tone: 'success' | 'error' | 'info'
  message: string
}
