import { useEffect, useMemo, useState } from 'react'
import { getTransactions } from '../services/transactionService'
import { useCategories } from '../hooks/useCategories'
import CategoryDistribution from '../components/statistics/CategoryDistribution'
import TimelineChart from '../components/statistics/TimelineChart'
import { showAlert } from '../utils/telegram'

const defaultFilters = {
  type: 'expense',
  category: 'all',
  from: '',
  to: '',
}

const StatisticsPage = ({ userId, refreshToken }) => {
  const { categories } = useCategories()
  const [transactions, setTransactions] = useState([])
  const [filters, setFilters] = useState(defaultFilters)
  const [loading, setLoading] = useState(true)

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const data = await getTransactions(userId, 'all')
      setTransactions(data)
    } catch (error) {
      console.error('StatisticsPage error:', error)
      showAlert('Не удалось загрузить данные для статистики')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!userId) return
    loadTransactions()
  }, [userId, refreshToken])

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (filters.type !== 'all' && transaction.type !== filters.type) {
        return false
      }

      if (filters.category !== 'all' && transaction.category !== filters.category) {
        return false
      }

      const createdAt = transaction.created_at ? new Date(transaction.created_at) : null

      if (filters.from && createdAt) {
        const fromDate = new Date(filters.from)
        fromDate.setHours(0, 0, 0, 0)
        if (createdAt < fromDate) {
          return false
        }
      }

      if (filters.to && createdAt) {
        const toDate = new Date(filters.to)
        toDate.setHours(23, 59, 59, 999)
        if (createdAt > toDate) {
          return false
        }
      }

      return true
    })
  }, [transactions, filters])

  const categoryDistribution = useMemo(() => {
    const amountsByCategory = new Map()

    filteredTransactions.forEach((transaction) => {
      const key = transaction.category || 'Прочее'
      const value = Math.abs(transaction.amount)
      amountsByCategory.set(key, (amountsByCategory.get(key) || 0) + value)
    })

    return Array.from(amountsByCategory.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [filteredTransactions])

  const timelineData = useMemo(() => {
    const amountsByDate = new Map()

    filteredTransactions.forEach((transaction) => {
      if (!transaction.created_at) {
        return
      }

      const dateKey = transaction.created_at.slice(0, 10)
      const current = amountsByDate.get(dateKey) || 0
      amountsByDate.set(dateKey, current + Math.abs(transaction.amount))
    })

    return Array.from(amountsByDate.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [filteredTransactions])

  return (
    <div className="pb-24 space-y-6">
      <section className="mx-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-slate-700/50 p-5 space-y-4 animate-fade-in">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
              Тип
            </label>
            <div className="flex rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700">
              {['all', 'expense', 'income'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilters((prev) => ({ ...prev, type }))}
                  className={`px-4 py-2 text-sm font-medium ${
                    filters.type === type
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {type === 'all' ? 'Все' : type === 'expense' ? 'Расходы' : 'Доходы'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
              Категория
            </label>
            <select
              value={filters.category}
              onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}
              className="px-4 py-2 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">Все категории</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
              От
            </label>
            <input
              type="date"
              value={filters.from}
              onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value }))}
              className="px-4 py-2 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
              До
            </label>
            <input
              type="date"
              value={filters.to}
              onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value }))}
              className="px-4 py-2 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </section>

      <section className="mx-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-slate-700/50 p-5 space-y-6 animate-fade-in">
        <header>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Распределение по категориям
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Показывает, на что вы тратите больше всего средств.
          </p>
        </header>

        {loading ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">Загрузка...</div>
        ) : (
          <CategoryDistribution data={categoryDistribution} />
        )}
      </section>

      <section className="mx-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-slate-700/50 p-5 space-y-6 animate-fade-in">
        <header>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Динамика расходов и доходов
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Как меняются ваши траты и поступления со временем.
          </p>
        </header>

        {loading ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">Загрузка...</div>
        ) : (
          <TimelineChart data={timelineData} />
        )}
      </section>
    </div>
  )
}

export default StatisticsPage
