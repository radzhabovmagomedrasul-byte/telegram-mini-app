import { useEffect, useMemo, useState } from 'react'
import { getTransactionsList } from '../services/transactionService'
import { useCategories } from '../hooks/useCategories'
import CategoryDistribution from '../components/statistics/CategoryDistribution'
import TimelineChart from '../components/statistics/TimelineChart'
import { showAlert } from '../utils/telegram'
import { useLocale } from '../context/LocaleContext.jsx'

const defaultFilters = {
  type: 'expense',
  category: 'all',
  from: '',
  to: '',
}

const StatisticsPage = ({ userId, refreshToken }) => {
  const { t } = useLocale()
  const { categories } = useCategories()
  const [transactions, setTransactions] = useState([])
  const [filters, setFilters] = useState(defaultFilters)
  const [loading, setLoading] = useState(true)

  const loadTransactions = () => {
    setLoading(true)
    try {
      const data = getTransactionsList('all')
      setTransactions(data)
    } catch (error) {
      console.error('StatisticsPage error:', error)
      showAlert(t('statistics.loadError'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [refreshToken])

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
      const key = transaction.category || t('history.labels.other')
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
    <div className="space-y-4 pb-28 px-4">
      <section className="ios-card p-6 space-y-4">
        <h2 className="text-[28px] font-semibold text-ios-text-primary mb-4">
          {t('statistics.title') || 'Statistics'}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[15px] font-medium text-ios-text-primary mb-3 block">
              {t('statistics.filters.type')}
            </label>
            <div className="flex rounded-ios-lg bg-ios-gray-5 overflow-hidden">
              {['all', 'expense', 'income'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilters((prev) => ({ ...prev, type }))}
                  className={`ios-button-press flex-1 px-3 py-2.5 text-[15px] font-semibold ${
                    filters.type === type 
                      ? 'bg-ios-blue text-white' 
                      : 'text-ios-text-secondary'
                  }`}
                >
                  {type === 'all'
                    ? t('statistics.filters.all')
                    : type === 'expense'
                    ? t('history.expenses')
                    : t('history.income')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[15px] font-medium text-ios-text-primary mb-3 block">
              {t('statistics.filters.category')}
            </label>
            <select
              value={filters.category}
              onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}
              className="w-full rounded-ios-lg bg-ios-bg-tertiary border border-ios-gray-4 px-4 py-3 text-[17px] text-ios-text-primary focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/30 focus:outline-none"
            >
              <option value="all">{t('history.filters.all')}</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[15px] font-medium text-ios-text-primary mb-3 block">
              {t('statistics.filters.from')}
            </label>
            <input
              type="date"
              value={filters.from}
              onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value }))}
              className="w-full rounded-ios-lg bg-ios-bg-tertiary border border-ios-gray-4 px-4 py-3 text-[17px] text-ios-text-primary focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/30 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[15px] font-medium text-ios-text-primary mb-3 block">
              {t('statistics.filters.to')}
            </label>
            <input
              type="date"
              value={filters.to}
              onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value }))}
              className="w-full rounded-ios-lg bg-ios-bg-tertiary border border-ios-gray-4 px-4 py-3 text-[17px] text-ios-text-primary focus:border-ios-blue focus:ring-2 focus:ring-ios-blue/30 focus:outline-none"
            />
          </div>
        </div>
      </section>

      <section className="ios-card p-6 space-y-4">
        <header>
          <h2 className="text-[28px] font-semibold text-ios-text-primary">
            {t('statistics.distributionTitle')}
          </h2>
          <p className="text-[15px] text-ios-text-secondary mt-1">
            {t('statistics.distributionDescription')}
          </p>
        </header>

        {loading ? (
          <div className="py-12 text-center text-ios-text-secondary text-[15px]">
            {t('statistics.loading')}
          </div>
        ) : (
          <CategoryDistribution data={categoryDistribution} />
        )}
      </section>

      <section className="ios-card p-6 space-y-4">
        <header>
          <h2 className="text-[28px] font-semibold text-ios-text-primary">
            {t('statistics.timelineTitle')}
          </h2>
          <p className="text-[15px] text-ios-text-secondary mt-1">
            {t('statistics.timelineDescription')}
          </p>
        </header>

        {loading ? (
          <div className="py-12 text-center text-ios-text-secondary text-[15px]">
            {t('statistics.loading')}
          </div>
        ) : (
          <TimelineChart data={timelineData} />
        )}
      </section>
    </div>
  )
}

export default StatisticsPage
