import { useState, useEffect, useMemo } from 'react'
import { getOrCreateUserId, updateLastActivity } from './services/localStorageService'
import { getBalance } from './services/transactionService'
import { syncFromFirebase, autoSync } from './services/dataSyncService'
import { ThemeProvider } from './context/ThemeContext'
import { useLocale } from './context/LocaleContext.jsx'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [balance, setBalance] = useState(0)
  const [activeTab, setActiveTab] = useState(DEFAULT_TAB)
  const [refreshToken, setRefreshToken] = useState(0)

  // Проверка сессии Supabase при загрузке
  useEffect(() => {
    let syncInterval
    let timeoutId
    
    const checkSession = async () => {
      try {
        // Проверка сессии с таймаутом
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Session check timeout')), 10000)
        })
        
        let result
        try {
          result = await Promise.race([sessionPromise, timeoutPromise])
        } catch (raceError) {
          if (raceError.message === 'Session check timeout') {
            console.warn('Session check timed out, assuming not authenticated')
            setIsAuthenticated(false)
            setLoading(false)
            return
          }
          throw raceError
        } finally {
          if (timeoutId) clearTimeout(timeoutId)
        }
        
        const { data: { session }, error } = result || { data: { session: null }, error: null }
        
        if (error) {
          console.error('Error checking session:', error)
          setIsAuthenticated(false)
          setLoading(false)
          return
        }

        if (session?.user) {
          // Пользователь авторизован
          setIsAuthenticated(true)
          setUserId(session.user.id)
          
          // Синхронизация с Supabase (приоритет)
          const { loadTransactionsFromSupabase, syncAllTransactionsToSupabase } = await import('./services/supabaseSyncService')
          loadTransactionsFromSupabase(session.user.id)
            .then((synced) => {
              if (synced) {
                setRefreshToken((prev) => prev + 1)
              }
              // Синхронизируем локальные транзакции в Supabase
              return syncAllTransactionsToSupabase(session.user.id)
            })
            .catch((error) => {
              console.log('Supabase sync failed, trying Firebase:', error)
              // Fallback на Firebase
              return syncFromFirebase(session.user.id)
                .then((synced) => {
                  if (synced) {
                    setRefreshToken((prev) => prev + 1)
                  }
                })
                .catch((fbError) => {
                  console.log('Firebase sync also failed, using local data:', fbError)
                })
            })
          
          // Обновление активности
          try {
            updateLastActivity()
          } catch (e) {
            console.log('Failed to update activity:', e)
          }
          
          // Автоматическая синхронизация
          syncInterval = setInterval(() => {
            autoSync()
          }, 5 * 60 * 1000) // Каждые 5 минут
        } else {
          // Пользователь не авторизован
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Error initializing user:', error)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Слушатель изменений авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true)
        setUserId(session.user.id)
        try {
          updateLastActivity()
        } catch (e) {
          console.log('Failed to update activity:', e)
        }
      } else {
        setIsAuthenticated(false)
        setUserId(null)
      }
    })

    return () => {
      if (syncInterval) {
        clearInterval(syncInterval)
      }
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (subscription) {
        subscription.unsubscribe()
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setIsAuthenticated(false)
      setUserId(null)
      setActiveTab(DEFAULT_TAB)
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleAuthSuccess = () => {
    // После успешной авторизации состояние обновится через onAuthStateChange
    setIsAuthenticated(true)
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
            supabaseUserId={userId}
          />
        )
      case 'stats':
        return <StatisticsPage userId={userId} refreshToken={refreshToken} />
      case 'ai':
        return <AIAssistant />
      case 'settings':
        return <SettingsPage userId={userId} onLogout={handleLogout} />
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

  // Показываем форму авторизации, если пользователь не авторизован
  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <Auth onAuthSuccess={handleAuthSuccess} />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <div 
        style={{ 
          background: '#120F25'
        }}
        className="min-h-screen"
      >
        {/* Decorative blurred circles for glass effect */}
        <div className="absolute top-20 left-10 size-64 bg-purple-600/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-10 size-72 bg-indigo-600/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 bg-violet-600/20 rounded-full blur-3xl"></div>
        
        <div className="relative mx-auto max-w-[480px] min-h-screen">
          <div className="relative z-10 flex min-h-[calc(100dvh-3rem)] flex-col pb-20">
            <Header
              title={t('brand.name')}
              subtitle={t('brand.subtitle')}
              onLogout={handleLogout}
              onAssistantClick={() => setActiveTab('ai')}
            />

            <main className="flex-1 overflow-y-auto overscroll-contain">{content}</main>
          </div>
          <TabNavigation activeTab={activeTab} onChange={setActiveTab} />
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
