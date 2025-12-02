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
    'rounded-[28px] border border-white/10 bg-[#111216] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.55)]'
  const inputClass =
    'w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-white placeholder-white/40 focus:border-white/40 focus:outline-none'

  return (
    <div className="space-y-6 pb-28 text-white">
      <Balance balance={balance} />

      <section className={`${panelClass} space-y-6`}>
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.35em] text-white/35">{t('add.title')}</p>
          <h2 className="mt-2 text-2xl font-semibold">{t('add.description')}</h2>
          <p className="text-sm text-white/45">{t('add.helper')}</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <span className="text-[0.65rem] uppercase tracking-[0.3em] text-white/35">
              {t('add.type')}
            </span>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] ${
                  type === 'expense'
                    ? 'border-transparent bg-red-500 text-white'
                    : 'border-white/10 bg-transparent text-white/60'
                }`}
              >
                {t('add.expense')}
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] ${
                  type === 'income'
                    ? 'border-transparent bg-green-500 text-white'
                    : 'border-white/10 bg-transparent text-white/60'
                }`}
              >
                {t('add.income')}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[0.65rem] uppercase tracking-[0.3em] text-white/35">
              {t('add.amount')}
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className={`${inputClass} text-lg font-semibold`}
              placeholder="0.00"
              required
            />
            {errors.amount ? <p className="mt-1 text-sm text-red-400">{errors.amount}</p> : null}
          </div>

          <div className="space-y-3">
            <label className="block text-[0.65rem] uppercase tracking-[0.3em] text-white/35">
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
                className={`${inputClass} flex-1 border-dashed`}
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
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/80 hover:text-white"
              >
                {t('add.addCategory')}
              </button>
            </div>
            {errors.category ? <p className="mt-1 text-sm text-red-400">{errors.category}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-[0.65rem] uppercase tracking-[0.3em] text-white/35">
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
            <label className="mb-2 block text-[0.65rem] uppercase tracking-[0.3em] text-white/35">
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
            className="w-full rounded-2xl bg-white/15 py-4 text-lg font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? t('add.saving') : t('add.submit')}
          </button>
        </form>
      </section>
    </div>
  )
}

export default AddTransactionPage
