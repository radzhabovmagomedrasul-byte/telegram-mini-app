import { useState, useEffect, useMemo } from 'react'
import { supabase } from './supabaseClient'
import { getBalance } from './services/transactionService'
import Header from './components/Header'
import Auth from './components/Auth'
import TabNavigation from './components/navigation/TabNavigation'
import AddTransactionPage from './pages/AddTransactionPage'
import HistoryPage from './pages/HistoryPage'
import StatisticsPage from './pages/StatisticsPage'
import SettingsPage from './pages/SettingsPage'

const DEFAULT_TAB = 'history'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState(0)
  const [activeTab, setActiveTab] = useState(DEFAULT_TAB)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchBalance = async (targetUser) => {
    const currentUser = targetUser || user
    if (!currentUser) return

    try {
      const total = await getBalance(currentUser.id)
      setBalance(total)
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }

  useEffect(() => {
    if (user) {
      fetchBalance(user)
    } else {
      setBalance(0)
    }
  }, [user])

  const handleAuthSuccess = async () => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()
    if (currentUser) {
      setUser(currentUser)
      fetchBalance(currentUser)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setActiveTab(DEFAULT_TAB)
  }

  const handleTransactionsChanged = () => {
    setRefreshToken((prev) => prev + 1)
    fetchBalance()
  }

  const content = useMemo(() => {
    if (!user) return null

    switch (activeTab) {
      case 'add':
        return (
          <AddTransactionPage
            userId={user.id}
            balance={balance}
            onTransactionCreated={handleTransactionsChanged}
          />
        )
      case 'stats':
        return <StatisticsPage userId={user.id} refreshToken={refreshToken} />
      case 'settings':
        return <SettingsPage />
      case 'history':
      default:
        return (
          <HistoryPage
            userId={user.id}
            refreshToken={refreshToken}
            onTransactionsChanged={handleTransactionsChanged}
          />
        )
    }
  }, [activeTab, user, balance, refreshToken])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-lg">Загрузка...</div>
      </div>
    )
  }

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />
  }

  return (
    <div className="min-h-screen pb-24 text-gray-900 dark:text-gray-100 relative z-0">
      <Header
        title="Финансовый помощник"
        subtitle="Контролируйте доходы, расходы и цели"
        onLogout={handleLogout}
      />

      <main className="relative z-10 max-w-4xl mx-auto py-6 space-y-6">{content}</main>

      <TabNavigation activeTab={activeTab} onChange={setActiveTab} />
    </div>
  )
}

export default App

