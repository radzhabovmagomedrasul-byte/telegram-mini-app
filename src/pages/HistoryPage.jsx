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
    'rounded-[28px] border border-white/10 bg-gradient-to-b from-[#101329] via-[#080c1b] to-[#050714] shadow-[0_22px_50px_rgba(5,6,8,0.85)] p-5'
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
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-white/35">
            {t('balance.total')}
          </p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-4xl font-semibold leading-tight">
              {formatCurrency(balance, locale)}
            </p>
            <span
              className={`rounded-2xl px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                growthValue >= 0
                  ? 'bg-white/10 text-dash-positive'
                  : 'bg-white/10 text-dash-negative'
              }`}
            >
              {t('history.badgeGrowth')} {growthValue >= 0 ? '+' : ''}
              {growthValue.toFixed(1)}%
            </span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-[#1a1c23] p-4">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/35">
                {t('history.income')}
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {formatCurrency(monthlyStats.income, locale)}
              </p>
              <p className="text-[0.7rem] text-white/40">{t('history.thisMonth')}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#1a1c23] p-4">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/35">
                {t('history.expenses')}
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {formatCurrency(monthlyStats.expense, locale)}
              </p>
              <p className="text-[0.7rem] text-white/40">{t('history.thisMonth')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${panelClass} bg-[#151720]`}>
        <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/35">
          {t('history.quickActions')}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action.id)}
              className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-[#1a1c23] p-3 text-left transition hover:border-white/30"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-xl font-semibold text-white ${action.gradient}`}
              >
                {action.icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{t(action.labelKey)}</p>
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/40">
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
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-white/40">
              {t('history.title')}
            </p>
            <h3 className="mt-1 text-xl font-semibold text-white">{t('history.subtitle')}</h3>
          </div>
          <button
            onClick={() => setFiltersOpen((prev) => !prev)}
            className="rounded-2xl border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/60 transition hover:text-white"
          >
            {filtersOpen ? t('common.filtersHide') : t('common.filtersShow')}
          </button>
        </div>

        {filtersOpen && (
          <div className="mt-4 grid grid-cols-1 gap-3 text-sm">
            <div>
              <label className="mb-1 block text-[0.65rem] uppercase tracking-[0.3em] text-white/35">
                {t('history.filters.category')}
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-[#151720] px-4 py-3 text-white focus:border-white/40 focus:outline-none"
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
                <label className="mb-1 block text-[0.65rem] uppercase tracking-[0.3em] text-white/35">
                  {t('history.filters.from')}
                </label>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-[#151720] px-4 py-3 text-white focus:border-white/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-[0.65rem] uppercase tracking-[0.3em] text-white/35">
                  {t('history.filters.to')}
                </label>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-[#151720] px-4 py-3 text-white focus:border-white/40 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[0.65rem] uppercase tracking-[0.3em] text-white/35">
                {t('history.filters.search')}
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder={t('history.filters.placeholder')}
                className="w-full rounded-2xl border border-white/10 bg-[#151720] px-4 py-3 text-white placeholder-white/30 focus:border-white/40 focus:outline-none"
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
                  className="rounded-[22px] border border-white/10 bg-[#151720] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.45)]"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex flex-1 items-start gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-xl ${categoryStyle.gradient}`}
                      >
                        {categoryStyle.icon}
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
                              className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-white focus:border-white/40 focus:outline-none"
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
                              className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-white focus:border-white/40 focus:outline-none"
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
                              className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-white focus:border-white/40 focus:outline-none"
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
                              className="w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-white focus:border-white/40 focus:outline-none"
                            />
                          </div>
                        ) : (
                          <>
                            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-white/35">
                              {transaction.category || t('history.labels.other')}
                            </p>
                            <p className="text-lg font-semibold text-white">
                              {transaction.comment || t('history.labels.generic')}
                            </p>
                            <p className="text-xs text-white/40">
                              {formatDate(transaction.created_at, locale)}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-mono text-lg ${isIncome ? 'text-dash-positive' : 'text-dash-negative'}`}>
                        {isIncome ? '+' : '-'}
                        {amountLabel}
                      </p>
                      {!isEditing && (
                        <span
                          className={`mt-2 inline-flex rounded-full px-3 py-1 text-[0.6rem] uppercase tracking-[0.3em] ${
                            isIncome
                              ? 'bg-[rgba(122,240,199,0.15)] text-dash-positive'
                              : 'bg-[rgba(255,143,123,0.15)] text-dash-negative'
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
                          className="rounded-2xl bg-green-500 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-green-600"
                        >
                          {t('common.save')}
                        </button>
                        <button
                          onClick={resetEdit}
                          className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/70 transition hover:text-white"
                        >
                          {t('common.cancel')}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditClick(transaction)}
                          className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/20"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="rounded-2xl bg-red-500/20 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-red-300 transition hover:bg-red-500/30"
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


