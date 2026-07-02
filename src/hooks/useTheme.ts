import { useEffect } from 'react'
import type { ThemeMode } from '../types'

export const useTheme = (themeMode: ThemeMode) => {
  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const apply = () => {
      const dark = themeMode === 'dark' || (themeMode === 'auto' && media.matches)
      root.dataset.theme = dark ? 'dark' : 'light'
    }

    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [themeMode])
}
