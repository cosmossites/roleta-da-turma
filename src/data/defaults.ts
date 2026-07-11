import type { AppData, AppSettings, ClassroomWheel, NameParticipant, ThemeKey } from '../types'

export const STORAGE_KEY = 'roleta-da-turma:data:v1'

export const THEME_COLORS: Record<
  ThemeKey,
  { name: string; primary: string; secondary: string; soft: string; contrast: string }
> = {
  emerald: {
    name: 'FAETEC',
    primary: '#003a8c',
    secondary: '#0057d9',
    soft: '#eaf3ff',
    contrast: '#062d68',
  },
  cyan: {
    name: 'Ciano',
    primary: '#0e7490',
    secondary: '#22d3ee',
    soft: '#cffafe',
    contrast: '#083344',
  },
  amber: {
    name: 'Âmbar',
    primary: '#b45309',
    secondary: '#f59e0b',
    soft: '#fef3c7',
    contrast: '#451a03',
  },
  rose: {
    name: 'Rosa',
    primary: '#be123c',
    secondary: '#fb7185',
    soft: '#ffe4e6',
    contrast: '#4c0519',
  },
  indigo: {
    name: 'Índigo',
    primary: '#4338ca',
    secondary: '#818cf8',
    soft: '#e0e7ff',
    contrast: '#1e1b4b',
  },
  slate: {
    name: 'Grafite',
    primary: '#334155',
    secondary: '#64748b',
    soft: '#e2e8f0',
    contrast: '#020617',
  },
}

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  confettiEnabled: true,
  animationSpeed: 'normal',
  durationMs: 4200,
  themeMode: 'auto',
  showNamesOnWheel: true,
  confirmBeforeReset: true,
  vibrationEnabled: true,
}

export const createId = (prefix = 'id') => {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export const createNameParticipant = (label: string): NameParticipant => ({
  id: createId('name'),
  label: label.trim(),
})

export const createDefaultData = (): AppData => {
  const now = new Date().toISOString()

  const demoNumberWheel: ClassroomWheel = {
    id: createId('wheel'),
    name: 'Turma de Exemplo',
    type: 'numbers',
    theme: 'emerald',
    eliminateDrawn: true,
    drawCount: 1,
    numberConfig: {
      start: 1,
      end: 30,
      excluded: [],
    },
    names: [],
    eliminatedIds: [],
    history: [],
    createdAt: now,
    updatedAt: now,
    lastUsedAt: now,
  }

  const demoNames = ['Ana', 'Bruno', 'Carlos', 'Daniela', 'Eduardo', 'Fernanda']
  const demoNameWheel: ClassroomWheel = {
    id: createId('wheel'),
    name: 'Grupo de Apresentação',
    type: 'names',
    theme: 'cyan',
    eliminateDrawn: false,
    drawCount: 2,
    numberConfig: {
      start: 1,
      end: 6,
      excluded: [],
    },
    names: demoNames.map(createNameParticipant),
    eliminatedIds: [],
    history: [],
    createdAt: now,
    updatedAt: now,
  }

  return {
    version: 1,
    wheels: [demoNumberWheel, demoNameWheel],
    settings: DEFAULT_SETTINGS,
    lastWheelId: demoNumberWheel.id,
  }
}
