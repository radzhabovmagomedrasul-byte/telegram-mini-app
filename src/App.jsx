import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { getBalance } from './services/transactionService'
import Header from './components/Header'
import Auth from './components/Auth'
import Balance from './components/Balance'
import TransactionsList from './components/TransactionsList'
import AddTransaction from './components/AddTransaction'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    // Проверка текущей сессии
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Слушатель изменений авторизации
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      fetchBalance()
    }
  }, [user])

  const fetchBalance = async () => {
    if (!user) return

    try {
      const total = await getBalance(user.id)
      setBalance(total)
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-lg">Загрузка...</div>
      </div>
    )
  }

  if (!user) {
    return <Auth onAuthSuccess={async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)
    }} />
  }

  return (
    <div className="min-h-screen pb-24">
      <Header title="Учет финансов" />
      
      <div className="mt-4">
        <Balance balance={balance} />
      </div>

      <TransactionsList
        userId={user.id}
        onTransactionUpdate={fetchBalance}
      />

      <AddTransaction
        userId={user.id}
        onTransactionAdded={fetchBalance}
      />

      <div className="fixed bottom-24 right-6">
        <button
          onClick={handleLogout}
          className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-lg text-sm font-medium hover:bg-gray-100 transition-all"
        >
          Выйти
        </button>
      </div>
    </div>
  )
}

export default App

