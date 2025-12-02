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

  const panelClass =
    'rounded-[28px] border border-white/10 bg-gradient-to-b from-[#1a1c23] via-[#0e1015] to-[#050608] p-6 shadow-dash-neon text-white'
  const labelClass = 'text-[0.65rem] uppercase tracking-[0.3em] text-white/40 mb-2 block'
  const inputClass =
    'rounded-2xl border border-white/10 bg-[#151720] px-4 py-2 text-white placeholder-white/30 focus:border-dash-accent/50 focus:outline-none transition'

  return (
    <div className="space-y-6 pb-28 text-white">
      <section className={`${panelClass} space-y-4`}>
        <div className="flex flex-wrap gap-4">
          <div>
            <span className={labelClass}>{t('statistics.filters.type')}</span>
            <div className="flex rounded-2xl border border-white/10">
              {['all', 'expense', 'income'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilters((prev) => ({ ...prev, type }))}
                  className={`px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] ${
                    filters.type === type ? 'bg-white/15 text-white' : 'text-white/50'
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
            <span className={labelClass}>{t('statistics.filters.category')}</span>
            <select
              value={filters.category}
              onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}
              className={inputClass}
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
            <span className={labelClass}>{t('statistics.filters.from')}</span>
            <input
              type="date"
              value={filters.from}
              onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value }))}
              className={inputClass}
            />
          </div>

          <div>
            <span className={labelClass}>{t('statistics.filters.to')}</span>
            <input
              type="date"
              value={filters.to}
              onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value }))}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <section className={`${panelClass} space-y-4`}>
        <header>
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/40">
            {t('statistics.filters.category')}
          </p>
          <h2 className="text-2xl font-semibold">{t('statistics.distributionTitle')}</h2>
          <p className="text-sm text-white/45">{t('statistics.distributionDescription')}</p>
        </header>

        {loading ? (
          <div className="py-12 text-center text-white/40">{t('statistics.loading')}</div>
        ) : (
          <CategoryDistribution data={categoryDistribution} />
        )}
      </section>

      <section className={`${panelClass} space-y-4`}>
        <header>
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/40">Trends</p>
          <h2 className="text-2xl font-semibold">{t('statistics.timelineTitle')}</h2>
          <p className="text-sm text-white/45">{t('statistics.timelineDescription')}</p>
        </header>

        {loading ? (
          <div className="py-12 text-center text-white/40">{t('statistics.loading')}</div>
        ) : (
          <TimelineChart data={timelineData} />
        )}
      </section>
    </div>
  )
}

export default StatisticsPage
