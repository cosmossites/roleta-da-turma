import { useContext } from 'react'
import { AppStateContext } from './stateContext'

export const useAppState = () => {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState precisa ser usado dentro de AppStateProvider.')
  }

  return context
}
