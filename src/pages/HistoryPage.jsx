import { useEffect, useMemo, useState } from 'react'
import {
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from '../services/transactionService'
import { useCategories } from '../hooks/useCategories'
import { showAlert, showConfirm } from '../utils/telegram'

const formatCurrency = (value) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(value)

const defaultFilters = {
  category: 'all',
  from: '',
  to: '',
  search: '',
}

const HistoryPage = ({ userId, onTransactionsChanged, refreshToken }) => {
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

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const data = await getTransactions(userId, 'all')
      setTransactions(data)
    } catch (error) {
      console.error('HistoryPage error:', error)
      showAlert('Не удалось загрузить транзакции')
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

  const totals = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') {
          acc.income += transaction.amount
        } else {
          acc.expense += transaction.amount
        }
        return acc
      },
      { income: 0, expense: 0 },
    )
  }, [filteredTransactions])

  const handleEditClick = (transaction) => {
    setEditingId(transaction.id)
    setFormState({
      amount: transaction.amount.toString(),
      category: transaction.category || 'Прочее',
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

  const handleUpdate = async (transaction) => {
    try {
      await updateTransaction(transaction.id, {
        amount: parseFloat(formState.amount),
        category: formState.category,
        comment: formState.comment,
        type: formState.type,
        ...(formState.date
          ? { created_at: new Date(formState.date).toISOString() }
          : {}),
        currentCategory: transaction.category,
        currentComment: transaction.comment,
      })

      showAlert('Транзакция обновлена')
      resetEdit()
      await loadTransactions()
      onTransactionsChanged?.()
    } catch (error) {
      console.error('History update error:', error)
      showAlert(error.message || 'Ошибка при обновлении')
    }
  }

  const handleDelete = async (id) => {
    const confirmed = await showConfirm('Удалить эту транзакцию?')
    if (!confirmed) return

    try {
      await deleteTransaction(id)
      showAlert('Транзакция удалена')
      await loadTransactions()
      onTransactionsChanged?.()
    } catch (error) {
      console.error('History delete error:', error)
      showAlert(error.message || 'Ошибка при удалении')
    }
  }

  return (
    <div className="pb-24 space-y-6">
      <section className="mx-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-slate-700/50 p-4 animate-fade-in">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Категория
            </label>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">Все категории</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              От
            </label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, from: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              До
            </label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, to: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Поиск
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              placeholder="Найти по комментарию или категории"
              className="w-full px-3 py-2 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </section>

      <section className="mx-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-slate-700/50 animate-fade-in">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            История операций
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Управляйте своими расходами и доходами, редактируйте или удаляйте их при необходимости.
          </p>
        </div>

        <div className="px-4 py-3 grid grid-cols-2 md:grid-cols-4 gap-3 border-b border-gray-100 dark:border-slate-800">
          <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-2xl p-3 flex flex-col">
            <span className="text-xs font-medium uppercase">Доходы</span>
            <span className="text-lg font-bold">{formatCurrency(totals.income)}</span>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-2xl p-3 flex flex-col">
            <span className="text-xs font-medium uppercase">Расходы</span>
            <span className="text-lg font-bold">{formatCurrency(totals.expense)}</span>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 rounded-2xl p-3 flex flex-col">
            <span className="text-xs font-medium uppercase">Количество</span>
            <span className="text-lg font-bold">{filteredTransactions.length}</span>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 rounded-2xl p-3 flex flex-col">
            <span className="text-xs font-medium uppercase">Баланс (выборка)</span>
            <span className="text-lg font-bold">
              {formatCurrency(totals.income - totals.expense)}
            </span>
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-slate-800">
          {loading ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              Загрузка...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              Транзакции не найдены. Попробуйте изменить фильтры.
            </div>
          ) : (
            filteredTransactions.map((transaction) => {
              const isEditing = editingId === transaction.id
              const isIncome = transaction.type === 'income'

              return (
                <div
                  key={transaction.id}
                  className="p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                        isIncome
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300'
                      }`}
                    >
                      {isIncome ? '↑' : '↓'}
                    </div>

                    <div className="space-y-1 flex-1">
                      {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 md:col-span-2">
                            <button
                              type="button"
                              onClick={() =>
                                setFormState((prev) => ({ ...prev, type: 'expense' }))
                              }
                              className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                                formState.type === 'expense'
                                  ? 'bg-red-500 text-white shadow-lg'
                                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300'
                              }`}
                            >
                              Расход
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setFormState((prev) => ({ ...prev, type: 'income' }))
                              }
                              className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                                formState.type === 'income'
                                  ? 'bg-green-500 text-white shadow-lg'
                                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300'
                              }`}
                            >
                              Доход
                            </button>
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formState.amount}
                            onChange={(e) =>
                              setFormState((prev) => ({ ...prev, amount: e.target.value }))
                            }
                            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                          <select
                            value={formState.category}
                            onChange={(e) =>
                              setFormState((prev) => ({
                                ...prev,
                                category: e.target.value,
                              }))
                            }
                            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                            onChange={(e) =>
                              setFormState((prev) => ({ ...prev, date: e.target.value }))
                            }
                            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                            placeholder="Комментарий"
                            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(transaction.amount)}
                            </span>
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wide ${
                                isIncome
                                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300'
                              }`}
                            >
                              {isIncome ? 'Доход' : 'Расход'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300">
                              {transaction.category || 'Прочее'}
                            </span>
                            <span>
                              {transaction.created_at
                                ? new Date(transaction.created_at).toLocaleDateString('ru-RU', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                  })
                                : '—'}
                            </span>
                          </div>
                          {transaction.comment && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {transaction.comment}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleUpdate(transaction)}
                          className="px-3 py-2 rounded-2xl bg-green-500 text-white text-sm font-medium shadow-lg hover:bg-green-600 transition-all"
                        >
                          Сохранить
                        </button>
                        <button
                          onClick={resetEdit}
                          className="px-3 py-2 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
                        >
                          Отмена
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditClick(transaction)}
                          className="px-3 py-2 rounded-2xl bg-indigo-500 text-white text-sm font-medium shadow-lg hover:bg-indigo-600 transition-all"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="px-3 py-2 rounded-2xl bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/40 transition-all"
                        >
                          Удалить
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


