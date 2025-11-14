import { useState, useEffect, useMemo } from 'react'
import { getOrCreateUserId, updateLastActivity } from './services/localStorageService'
import { getBalance } from './services/transactionService'
import { syncFromFirebase, autoSync } from './services/dataSyncService'
import { ThemeProvider } from './context/ThemeContext'
import { useLocale } from './context/LocaleContext.jsx'
import Header from './components/Header'
import TabNavigation from './components/navigation/TabNavigation'
import AddTransactionPage from './pages/AddTransactionPage'
import HistoryPage from './pages/HistoryPage'
import StatisticsPage from './pages/StatisticsPage'
import SettingsPage from './pages/SettingsPage'
import AIAssistant from './components/ai/AIAssistant'

const DEFAULT_TAB = 'history'

function App() {
  const { t } = useLocale()
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState(0)
  const [activeTab, setActiveTab] = useState(DEFAULT_TAB)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    let syncInterval
    // Инициализация пользователя
    const initUser = async () => {
      try {
        const id = getOrCreateUserId()
        setUserId(id)
        
        // Попытка синхронизации с Firebase
        syncFromFirebase(id)
          .then((synced) => {
            if (synced) {
              setRefreshToken((prev) => prev + 1)
            }
          })
          .catch((error) => {
            console.log('Firebase sync failed, using local data:', error)
          })
        
        // Обновление активности
        updateLastActivity()
        
        // Автоматическая синхронизация
        syncInterval = setInterval(() => {
          autoSync()
        }, 5 * 60 * 1000) // Каждые 5 минут
      } catch (error) {
        console.error('Error initializing user:', error)
      } finally {
        setLoading(false)
      }
    }

    initUser()

    return () => {
      if (syncInterval) {
        clearInterval(syncInterval)
      }
    }
  }, [])

  const fetchBalance = () => {
    try {
      const total = getBalance()
      setBalance(total)
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchBalance()
    }
  }, [userId, refreshToken])

  const handleTransactionsChanged = () => {
    setRefreshToken((prev) => prev + 1)
    fetchBalance()
    updateLastActivity()
  }

  const handleLogout = () => {
    // Очистка данных при выходе (опционально)
    // clearAllData() - если нужно
    setUserId(null)
    setActiveTab(DEFAULT_TAB)
  }

  const content = useMemo(() => {
    if (!userId) return null

    switch (activeTab) {
      case 'add':
        return (
          <AddTransactionPage
            userId={userId}
            balance={balance}
            onTransactionCreated={handleTransactionsChanged}
          />
        )
      case 'stats':
        return <StatisticsPage userId={userId} refreshToken={refreshToken} />
      case 'ai':
        return <AIAssistant />
      case 'settings':
        return <SettingsPage userId={userId} />
      case 'history':
      default:
        return (
          <HistoryPage
            userId={userId}
            balance={balance}
            refreshToken={refreshToken}
            onTransactionsChanged={handleTransactionsChanged}
            onNavigateTab={setActiveTab}
          />
        )
    }
  }, [activeTab, userId, balance, refreshToken])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dash-bg text-white">
        <div className="flex flex-col items-center gap-3 font-mono text-sm uppercase tracking-[0.4em] text-dash-text-muted">
          <span className="text-xs text-white/40">{t('common.initializing')}</span>
          <span className="text-2xl font-semibold text-white tracking-[0.2em]">
            {t('common.loading')}
          </span>
        </div>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="relative mx-auto max-w-[480px] min-h-screen px-4 pb-28 pt-6">
          <div className="relative z-10 flex min-h-[calc(100vh-3rem)] flex-col rounded-[30px] border border-gray-800/50 bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-black px-5 pb-8 pt-6 shadow-2xl shadow-purple-500/10">
            <Header
              title={t('brand.name')}
              subtitle={t('brand.subtitle')}
              onLogout={handleLogout}
            />

            <main className="flex-1 space-y-6 overflow-visible">{content}</main>
          </div>
          <div className="fixed bottom-4 left-1/2 z-20 -translate-x-1/2 w-full max-w-[420px] px-4">
            <TabNavigation activeTab={activeTab} onChange={setActiveTab} />
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
