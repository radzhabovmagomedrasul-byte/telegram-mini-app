import { useEffect, useMemo, useState } from 'react'
import { addTransaction } from '../services/transactionService'
import { useCategories } from '../hooks/useCategories'
import Balance from '../components/Balance'
import { showAlert } from '../utils/telegram'
import { useLocale } from '../context/LocaleContext.jsx'

const getTodayISO = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today.toISOString().slice(0, 10)
}

const AddTransactionPage = ({ userId, balance, onTransactionCreated }) => {
  const { categories, addCategory } = useCategories()
  const { t, locale } = useLocale()
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(categories[0] || t('history.labels.other'))
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
      newErrors.amount = t('add.errors.amount')
    }

    if (!category && !customCategory.trim()) {
      newErrors.category = t('add.errors.category')
    }

    if (!date) {
      newErrors.date = t('add.errors.date')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return

    const finalCategory = customCategory.trim() || category || t('history.labels.other')

    if (customCategory.trim()) {
      addCategory(customCategory.trim())
      setCategory(customCategory.trim())
    }

    setLoading(true)
    try {
      const isoDate = new Date(date).toISOString()
      addTransaction(type, parseFloat(amount), comment, {
        category: finalCategory,
        date: isoDate,
      })

      setAmount('')
      setCustomCategory('')
      setComment('')
      setDate(getTodayISO())
      setErrors({})
      onTransactionCreated?.()
      showAlert(t('add.success'))
    } catch (error) {
      console.error('AddTransactionPage error:', error)
      const fallback = locale === 'ru' ? 'Ошибка при добавлении транзакции' : 'Failed to add transaction'
      showAlert(error.message || fallback)
    } finally {
      setLoading(false)
    }
  }

  const panelClass =
    'rounded-2xl border border-gray-700/50 bg-gray-800/50 backdrop-blur-sm p-6 shadow-lg shadow-purple-500/10'
  const inputClass =
    'w-full rounded-xl border border-gray-700/50 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none'

  return (
    <div className="space-y-6 pb-28 text-white">
      <Balance balance={balance} />

      <section className={`${panelClass} space-y-6`}>
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-gray-400">{t('add.title')}</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{t('add.description')}</h2>
          <p className="text-sm text-gray-400">{t('add.helper')}</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <span className="text-[0.65rem] uppercase tracking-[0.3em] text-gray-400">
              {t('add.type')}
            </span>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] transition-all ${
                  type === 'expense'
                    ? 'bg-gradient-to-r from-pink-500 to-red-500 border-pink-500 text-white shadow-lg shadow-pink-500/25'
                    : 'border-gray-700/50 bg-gray-800/50 text-gray-400 hover:border-pink-500/50'
                }`}
              >
                {t('add.expense')}
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] transition-all ${
                  type === 'income'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500 text-white shadow-lg shadow-green-500/25'
                    : 'border-gray-700/50 bg-gray-800/50 text-gray-400 hover:border-green-500/50'
                }`}
              >
                {t('add.income')}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[0.65rem] uppercase tracking-[0.3em] text-gray-400">
              {t('add.amount')}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">₽</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className={`${inputClass} text-lg font-semibold pl-10 h-14`}
                placeholder="0.00"
                required
              />
            </div>
            {errors.amount ? <p className="mt-1 text-sm text-red-400">{errors.amount}</p> : null}
          </div>

          <div className="space-y-3">
            <label className="block text-[0.65rem] uppercase tracking-[0.3em] text-gray-400">
              {t('add.category')}
            </label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={inputClass}
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
                placeholder={t('add.newCategoryPlaceholder')}
                className={`${inputClass} flex-1 border-dashed border-gray-600/50`}
              />
              <button
                type="button"
                onClick={() => {
                  if (customCategory.trim()) {
                    const nextCategory = customCategory.trim()
                    addCategory(nextCategory)
                    setCategory(nextCategory)
                    setCustomCategory('')
                    showAlert(t('add.categoryAdded'))
                  }
                }}
                className="rounded-xl border border-gray-700/50 bg-gray-800/50 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-gray-400 hover:text-white hover:border-purple-500/50 transition"
              >
                {t('add.addCategory')}
              </button>
            </div>
            {errors.category ? <p className="mt-1 text-sm text-red-400">{errors.category}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-[0.65rem] uppercase tracking-[0.3em] text-gray-400">
              {t('add.date')}
            </label>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={inputClass}
              required
            />
            {errors.date ? <p className="mt-1 text-sm text-red-400">{errors.date}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-[0.65rem] uppercase tracking-[0.3em] text-gray-400">
              {t('add.comment')}
            </label>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder={t('add.commentPlaceholder')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 py-4 text-lg font-semibold uppercase tracking-[0.3em] text-white transition shadow-lg shadow-blue-500/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? t('add.saving') : t('add.submit')}
          </button>
        </form>
      </section>
    </div>
  )
}

export default AddTransactionPage
