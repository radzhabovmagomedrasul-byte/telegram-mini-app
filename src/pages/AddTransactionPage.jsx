import { useEffect, useMemo, useState } from 'react'
import { addTransaction } from '../services/transactionService'
import { useCategories } from '../hooks/useCategories'
import Balance from '../components/Balance'
import { showAlert } from '../utils/telegram'

const getTodayISO = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today.toISOString().slice(0, 10)
}

const AddTransactionPage = ({ userId, balance, onTransactionCreated }) => {
  const { categories, addCategory } = useCategories()
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(categories[0] || 'Прочее')
  const [customCategory, setCustomCategory] = useState('')
  const [date, setDate] = useState(getTodayISO())
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const categoriesOptions = useMemo(() => categories, [categories])

  useEffect(() => {
    if (categories.length && !category) {
      setCategory(categories[0])
    }
  }, [categories, category])

  const validate = () => {
    const newErrors = {}

    if (!amount || Number.isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Введите корректную сумму'
    }

    if (!category && !customCategory.trim()) {
      newErrors.category = 'Выберите или добавьте категорию'
    }

    if (!date) {
      newErrors.date = 'Выберите дату'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return

    const finalCategory = customCategory.trim() || category || 'Прочее'

    if (customCategory.trim()) {
      addCategory(customCategory.trim())
      setCategory(customCategory.trim())
    }

    setLoading(true)
    try {
      const isoDate = new Date(date).toISOString()
      await addTransaction(userId, type, parseFloat(amount), comment, {
        category: finalCategory,
        date: isoDate,
      })

      setAmount('')
      setCustomCategory('')
      setComment('')
      setDate(getTodayISO())
      setErrors({})
      onTransactionCreated?.()
      showAlert('Транзакция успешно добавлена!')
    } catch (error) {
      console.error('AddTransactionPage error:', error)
      showAlert(error.message || 'Ошибка при добавлении транзакции')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-24 space-y-4">
      <Balance balance={balance} />

      <section className="mx-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-slate-700/50 p-6 space-y-6 animate-fade-in">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Новая транзакция
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Добавьте расход или доход, чтобы держать финансы под контролем.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Тип операции
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-3.5 rounded-2xl font-bold transition-all duration-300 border-2 ${
                  type === 'expense'
                    ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-xl border-transparent hover:scale-105 active:scale-95'
                    : 'bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-gray-700 dark:text-gray-200 border-gray-200/50 dark:border-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-800/70'
                }`}
              >
                Расход
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-3.5 rounded-2xl font-bold transition-all duration-300 border-2 ${
                  type === 'income'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl border-transparent hover:scale-105 active:scale-95'
                    : 'bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-gray-700 dark:text-gray-200 border-gray-200/50 dark:border-slate-700/50 hover:bg-white/70 dark:hover:bg-slate-800/70'
                }`}
              >
                Доход
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Сумма
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg text-gray-900 dark:text-white font-semibold transition-all"
              placeholder="0.00"
              required
            />
            {errors.amount ? (
              <p className="text-sm text-red-500 mt-1">{errors.amount}</p>
            ) : null}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Категория
            </label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
            >
              {categoriesOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={customCategory}
                onChange={(event) => setCustomCategory(event.target.value)}
                placeholder="Новая категория"
                className="flex-1 px-4 py-3 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => {
                  if (customCategory.trim()) {
                    const nextCategory = customCategory.trim()
                    addCategory(nextCategory)
                    setCategory(nextCategory)
                    setCustomCategory('')
                    showAlert('Категория добавлена!')
                  }
                }}
                className="px-4 py-3 rounded-2xl bg-indigo-500 text-white font-semibold shadow-lg hover:bg-indigo-600 transition-all"
              >
                Добавить
              </button>
            </div>
            {errors.category ? (
              <p className="text-sm text-red-500 mt-1">{errors.category}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Дата операции
            </label>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
              required
            />
            {errors.date ? (
              <p className="text-sm text-red-500 mt-1">{errors.date}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Комментарий
            </label>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 dark:text-white resize-none"
              placeholder="Например: покупка продуктов"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-black text-lg shadow-2xl hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default AddTransactionPage
