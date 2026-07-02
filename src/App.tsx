import { Download, Home, MonitorPlay, Settings, Shuffle } from 'lucide-react'
import { useState } from 'react'
import { SettingsModal } from './components/SettingsModal'
import { ToastNotification } from './components/ToastNotification'
import { useInstallPrompt } from './hooks/useInstallPrompt'
import { useTheme } from './hooks/useTheme'
import { HomePage } from './pages/HomePage'
import { WheelPage } from './pages/WheelPage'
import { AppStateProvider } from './store/AppStateProvider'
import { useAppState } from './store/useAppState'

type View = 'home' | 'wheel'

const AppContent = () => {
  const { data, activeWheel, toasts, dismissToast, showToast } = useAppState()
  const [view, setView] = useState<View>('home')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const installPrompt = useInstallPrompt()
  useTheme(data.settings.themeMode)

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">
            <Shuffle size={20} aria-hidden="true" />
          </span>
          <div>
            <h1>Roleta da Turma</h1>
            <p>Sorteios por número ou nome, salvos neste navegador.</p>
          </div>
        </div>

        <nav className="header-actions" aria-label="Navegação principal">
          <button className="button button-secondary" type="button" onClick={() => setView('home')}>
            <Home size={17} aria-hidden="true" />
            Início
          </button>
          <button
            className="button button-primary"
            type="button"
            onClick={() => setView('wheel')}
            disabled={!activeWheel}
          >
            <MonitorPlay size={17} aria-hidden="true" />
            Abrir roleta
          </button>
          <button className="button button-secondary" type="button" onClick={() => setSettingsOpen(true)}>
            <Settings size={17} aria-hidden="true" />
            Configurações
          </button>
          {installPrompt.canInstall ? (
            <button
              className="button button-secondary"
              type="button"
              onClick={() => {
                void installPrompt.install().then((accepted) => {
                  showToast(accepted ? 'Aplicativo instalado.' : 'Instalação cancelada.', accepted ? 'success' : 'info')
                })
              }}
            >
              <Download size={17} aria-hidden="true" />
              Instalar
            </button>
          ) : null}
        </nav>
      </header>

      {view === 'home' ? <HomePage onOpenWheel={() => setView('wheel')} /> : <WheelPage onHome={() => setView('home')} />}

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ToastNotification toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

const App = () => (
  <AppStateProvider>
    <AppContent />
  </AppStateProvider>
)

export default App
