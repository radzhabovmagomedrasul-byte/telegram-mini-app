import { useEffect, useMemo, useState } from 'react'
import {
  deleteTransaction,
  getTransactionsList,
  updateTransaction,
} from '../services/transactionService'
import { useCategories } from '../hooks/useCategories'
import { showAlert, showConfirm } from '../utils/telegram'
import { useLocale } from '../context/LocaleContext.jsx'

const formatCurrency = (value, locale = 'ru') =>
  new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(value)

const formatDate = (value, locale = 'ru') => {
  if (!value) return '—'
  const date = new Date(value)
  return date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const defaultFilters = {
  category: 'all',
  from: '',
  to: '',
  search: '',
}

const CATEGORY_STYLES = {
  Food: { icon: '🍱', gradient: 'from-[#4e4376] to-[#2b5876]' },
  Еда: { icon: '🍱', gradient: 'from-[#4e4376] to-[#2b5876]' },
  Housing: { icon: '🏠', gradient: 'from-[#42275a] to-[#734b6d]' },
  Жилье: { icon: '🏠', gradient: 'from-[#42275a] to-[#734b6d]' },
  Transport: { icon: '🚗', gradient: 'from-[#0f2027] to-[#2c5364]' },
  Транспорт: { icon: '🚗', gradient: 'from-[#0f2027] to-[#2c5364]' },
  Shopping: { icon: '🛍️', gradient: 'from-[#8360c3] to-[#2ebf91]' },
  Покупки: { icon: '🛍️', gradient: 'from-[#8360c3] to-[#2ebf91]' },
  Leisure: { icon: '🎮', gradient: 'from-[#232526] to-[#414345]' },
  Прочее: { icon: '💠', gradient: 'from-[#232526] to-[#414345]' },
}

const HistoryPage = ({
  userId,
  onTransactionsChanged,
  refreshToken,
  balance = 0,
  onNavigateTab,
}) => {
  const { t, locale } = useLocale()
  const { categories } = useCategories()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(defaultFilters)
  const [editingId, setEditingId] = useState(null)
  const [formState, setFormState] = useState({
    amount: '',
    category: '',
    date: '',
    comment: '',
    type: 'expense',
  })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const panelClass =
    'rounded-2xl border border-gray-700/50 bg-gray-800/50 backdrop-blur-sm p-5 shadow-lg shadow-purple-500/10'
  const inline = (ruText, enText) => (locale === 'ru' ? ruText : enText)
  const quickActions = [
    {
      id: 'send',
      labelKey: 'history.quickSend',
      noteKey: 'history.quickSendNote',
      icon: '↗',
      gradient: 'from-[#2b5876] to-[#4e4376]',
    },
    {
      id: 'receive',
      labelKey: 'history.quickReceive',
      noteKey: 'history.quickReceiveNote',
      icon: '↙',
      gradient: 'from-[#373b44] to-[#4286f4]',
    },
    {
      id: 'add',
      labelKey: 'history.quickAdd',
      noteKey: 'history.quickAddNote',
      icon: '+',
      gradient: 'from-[#4b134f] to-[#c94b4b]',
    },
  ]

  const handleQuickAction = (actionId) => {
    if (actionId === 'add') {
      onNavigateTab?.('add')
      return
    }
    showAlert(t('history.alerts.quickUnavailable'))
  }

  const loadTransactions = () => {
    setLoading(true)
    try {
      const data = getTransactionsList('all')
      setTransactions(data)
    } catch (error) {
      console.error('HistoryPage error:', error)
      showAlert(t('history.errors.load'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [refreshToken])

  const monthlyStats = useMemo(() => {
    const now = new Date()
    const currentKey = `${now.getFullYear()}-${now.getMonth()}`
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const prevKey = `${prevDate.getFullYear()}-${prevDate.getMonth()}`

    const stats = transactions.reduce(
      (acc, transaction) => {
        if (!transaction.created_at) return acc
        const date = new Date(transaction.created_at)
        const key = `${date.getFullYear()}-${date.getMonth()}`
        const amount = Number(transaction.amount) || 0

        if (key === currentKey) {
          if (transaction.type === 'income') {
            acc.current.income += amount
          } else {
            acc.current.expense += amount
          }
        } else if (key === prevKey) {
          if (transaction.type === 'income') {
            acc.previous.income += amount
          } else {
            acc.previous.expense += amount
          }
        }

        return acc
      },
      {
        current: { income: 0, expense: 0 },
        previous: { income: 0, expense: 0 },
      },
    )

    const currentNet = stats.current.income - stats.current.expense
    const previousNet = stats.previous.income - stats.previous.expense
    const growth =
      previousNet === 0
        ? currentNet === 0
          ? 0
          : 100
        : ((currentNet - previousNet) / Math.abs(previousNet)) * 100

    return {
      income: stats.current.income,
      expense: stats.current.expense,
      growth,
    }
  }, [transactions])
  const growthValue = Number.isFinite(monthlyStats.growth) ? monthlyStats.growth : 0

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesCategory =
        filters.category === 'all' || transaction.category === filters.category

      const createdAt = transaction.created_at
        ? new Date(transaction.created_at)
        : null

      let matchesDate = true
      if (filters.from && createdAt) {
        matchesDate = createdAt >= new Date(filters.from)
      }
      if (matchesDate && filters.to && createdAt) {
        const toDate = new Date(filters.to)
        toDate.setHours(23, 59, 59, 999)
        matchesDate = createdAt <= toDate
      }

      const matchesSearch =
        !filters.search ||
        transaction.comment?.toLowerCase().includes(filters.search.toLowerCase()) ||
        transaction.category?.toLowerCase().includes(filters.search.toLowerCase())

      return matchesCategory && matchesDate && matchesSearch
    })
  }, [transactions, filters])

  const handleEditClick = (transaction) => {
    setEditingId(transaction.id)
    setFormState({
      amount: transaction.amount.toString(),
      category: transaction.category || t('history.labels.other'),
      date: transaction.created_at ? transaction.created_at.slice(0, 10) : '',
      comment: transaction.comment || '',
      type: transaction.type || 'expense',
    })
  }

  const resetEdit = () => {
    setEditingId(null)
    setFormState({
      amount: '',
      category: '',
      date: '',
      comment: '',
      type: 'expense',
    })
  }

  const handleUpdate = (transaction) => {
    try {
      updateTransaction(transaction.id, {
        amount: parseFloat(formState.amount),
        category: formState.category,
        comment: formState.comment,
        type: formState.type,
        ...(formState.date
          ? { created_at: new Date(formState.date).toISOString() }
          : {}),
      })

      showAlert(t('history.alerts.updated'))
      resetEdit()
      loadTransactions()
      onTransactionsChanged?.()
    } catch (error) {
      console.error('History update error:', error)
      showAlert(error.message || inline('Ошибка при обновлении', 'Update error'))
    }
  }

  const handleDelete = async (id) => {
    const confirmed = await showConfirm(t('history.alerts.confirmDelete'))
    if (!confirmed) return

    try {
      deleteTransaction(id)
      showAlert(t('history.alerts.deleted'))
      loadTransactions()
      onTransactionsChanged?.()
    } catch (error) {
      console.error('History delete error:', error)
      showAlert(error.message || inline('Ошибка при удалении', 'Delete error'))
    }
  }

  return (
    <div className="space-y-5 pb-10 text-white">
      <section className={`${panelClass} relative overflow-hidden`}>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-20" />
        <div className="relative">
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-gray-400">
            {t('balance.total')}
          </p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-4xl font-semibold leading-tight">
              {formatCurrency(balance, locale)}
            </p>
            <span
              className={`rounded-2xl px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                growthValue >= 0
                  ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                  : 'bg-pink-500/10 border border-pink-500/30 text-pink-300'
              }`}
            >
              {t('history.badgeGrowth')} {growthValue >= 0 ? '+' : ''}
              {growthValue.toFixed(1)}%
            </span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-700/50 bg-gray-800/50 p-4">
              <div className="w-10 h-10 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center justify-center mb-3">
                <span className="text-green-400 text-xl">↑</span>
              </div>
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-gray-400">
                {t('history.income')}
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {formatCurrency(monthlyStats.income, locale)}
              </p>
              <p className="text-[0.7rem] text-gray-400">{t('history.thisMonth')}</p>
            </div>
            <div className="rounded-2xl border border-gray-700/50 bg-gray-800/50 p-4">
              <div className="w-10 h-10 bg-pink-500/10 border border-pink-500/30 rounded-xl flex items-center justify-center mb-3">
                <span className="text-pink-400 text-xl">↓</span>
              </div>
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-gray-400">
                {t('history.expenses')}
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {formatCurrency(monthlyStats.expense, locale)}
              </p>
              <p className="text-[0.7rem] text-gray-400">{t('history.thisMonth')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={panelClass}>
        <p className="text-[0.65rem] uppercase tracking-[0.3em] text-gray-400">
          {t('history.quickActions')}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action.id)}
              className="flex flex-col gap-2 rounded-2xl border border-gray-700/50 bg-gray-800/50 p-3 text-left transition hover:border-purple-500/50 hover:bg-gray-700/30"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-xl font-semibold text-white ${action.gradient}`}
              >
                {action.icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{t(action.labelKey)}</p>
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-gray-400">
                  {t(action.noteKey)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className={panelClass}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-gray-400">
              {t('history.title')}
            </p>
            <h3 className="mt-1 text-xl font-semibold text-white">{t('history.subtitle')}</h3>
          </div>
          <button
            onClick={() => setFiltersOpen((prev) => !prev)}
            className="rounded-xl border border-gray-700/50 bg-gray-800/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-gray-400 transition hover:text-white hover:border-purple-500/50"
          >
            {filtersOpen ? t('common.filtersHide') : t('common.filtersShow')}
          </button>
        </div>

        {filtersOpen && (
          <div className="mt-4 grid grid-cols-1 gap-3 text-sm">
            <div>
              <label className="mb-1 block text-[0.65rem] uppercase tracking-[0.3em] text-gray-400">
                {t('history.filters.category')}
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-xl border border-gray-700/50 bg-gray-800/50 px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none"
              >
                <option value="all">{t('history.filters.all')}</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[0.65rem] uppercase tracking-[0.3em] text-gray-400">
                  {t('history.filters.from')}
                </label>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
                  className="w-full rounded-xl border border-gray-700/50 bg-gray-800/50 px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[0.65rem] uppercase tracking-[0.3em] text-gray-400">
                  {t('history.filters.to')}
                </label>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
                  className="w-full rounded-xl border border-gray-700/50 bg-gray-800/50 px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[0.65rem] uppercase tracking-[0.3em] text-gray-400">
                {t('history.filters.search')}
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder={t('history.filters.placeholder')}
                className="w-full rounded-xl border border-gray-700/50 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none"
              />
            </div>
          </div>
        )}

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="py-8 text-center text-white/40">{t('history.states.loading')}</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-8 text-center text-white/40">{t('history.states.empty')}</div>
          ) : (
            filteredTransactions.map((transaction) => {
              const isEditing = editingId === transaction.id
              const isIncome = transaction.type === 'income'
              const amountLabel = formatCurrency(Math.abs(transaction.amount), locale)
              const categoryStyle = CATEGORY_STYLES[transaction.category] || {
                icon: '💠',
                gradient: 'from-[#232526] to-[#414345]',
              }

              return (
                <div
                  key={transaction.id}
                  className="rounded-xl border border-gray-700/30 bg-gray-800/30 p-4 hover:border-purple-500/30 transition-colors"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex flex-1 items-start gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-xl shrink-0 ${categoryStyle.gradient}`}
                      >
                        <span className="text-lg">{categoryStyle.icon}</span>
                      </div>
                      <div className="flex-1 space-y-2">
                        {isEditing ? (
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setFormState((prev) => ({ ...prev, type: 'expense' }))}
                                className={`flex-1 rounded-2xl px-3 py-2 text-sm font-semibold uppercase tracking-[0.2em] ${
                                  formState.type === 'expense'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-white/5 text-white/60'
                                }`}
                              >
                                {t('add.expense')}
                              </button>
                              <button
                                type="button"
                                onClick={() => setFormState((prev) => ({ ...prev, type: 'income' }))}
                                className={`flex-1 rounded-2xl px-3 py-2 text-sm font-semibold uppercase tracking-[0.2em] ${
                                  formState.type === 'income'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-white/5 text-white/60'
                                }`}
                              >
                                {t('add.income')}
                              </button>
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={formState.amount}
                              onChange={(e) => setFormState((prev) => ({ ...prev, amount: e.target.value }))}
                              className="w-full rounded-xl border border-gray-700/50 bg-gray-800/50 px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none"
                              placeholder={t('add.amount')}
                            />
                            <select
                              value={formState.category}
                              onChange={(e) =>
                                setFormState((prev) => ({
                                  ...prev,
                                  category: e.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-gray-700/50 bg-gray-800/50 px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none"
                            >
                              {categories.map((item) => (
                                <option key={item} value={item}>
                                  {item}
                                </option>
                              ))}
                            </select>
                            <input
                              type="date"
                              value={formState.date}
                              onChange={(e) => setFormState((prev) => ({ ...prev, date: e.target.value }))}
                              className="w-full rounded-xl border border-gray-700/50 bg-gray-800/50 px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none"
                            />
                            <input
                              type="text"
                              value={formState.comment}
                              onChange={(e) =>
                                setFormState((prev) => ({
                                  ...prev,
                                  comment: e.target.value,
                                }))
                              }
                              placeholder={t('add.comment')}
                              className="w-full rounded-xl border border-gray-700/50 bg-gray-800/50 px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none"
                            />
                          </div>
                        ) : (
                          <>
                            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-gray-400">
                              {transaction.category || t('history.labels.other')}
                            </p>
                            <p className="text-lg font-semibold text-white">
                              {transaction.comment || t('history.labels.generic')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(transaction.created_at, locale)}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold text-lg ${isIncome ? 'text-green-400' : 'text-pink-400'}`}>
                        {isIncome ? '+' : '-'}
                        {amountLabel}
                      </p>
                      {!isEditing && (
                        <span
                          className={`mt-2 inline-flex rounded-full px-3 py-1 text-[0.6rem] uppercase tracking-[0.3em] ${
                            isIncome
                              ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                              : 'bg-pink-500/10 border border-pink-500/30 text-pink-300'
                          }`}
                        >
                          {isIncome ? t('history.labels.income') : t('history.labels.expense')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleUpdate(transaction)}
                          className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/25"
                        >
                          {t('common.save')}
                        </button>
                        <button
                          onClick={resetEdit}
                          className="rounded-xl border border-gray-700/50 bg-gray-800/50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-gray-400 transition hover:text-white hover:border-purple-500/50"
                        >
                          {t('common.cancel')}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditClick(transaction)}
                          className="rounded-xl border border-gray-700/50 bg-gray-800/50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-gray-700/50 hover:border-purple-500/50"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="rounded-xl bg-red-500/20 border border-red-500/30 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-red-300 transition hover:bg-red-500/30"
                        >
                          {t('common.delete')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}

export default HistoryPage


