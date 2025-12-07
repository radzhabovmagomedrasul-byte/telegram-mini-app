import { useEffect, useMemo, useState } from 'react'
import { addTransaction } from '../services/transactionService'
import { useCategories } from '../hooks/useCategories'
import Balance from '../components/Balance'
import SuccessNotification from '../components/SuccessNotification'
import { useLocale } from '../context/LocaleContext.jsx'
import { useInputFocus } from '../hooks/useKeyboardScroll'

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
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const handleInputFocus = useInputFocus()

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

      // Анимация успешного добавления
      setSuccessMessage(t('add.success'))
      setShowSuccess(true)
      
      // Небольшая задержка перед сбросом формы для визуального отклика
      setTimeout(() => {
        setAmount('')
        setCustomCategory('')
        setComment('')
        setDate(getTodayISO())
        setErrors({})
        onTransactionCreated?.()
      }, 500)
    } catch (error) {
      console.error('AddTransactionPage error:', error)
      const fallback = locale === 'ru' ? 'Ошибка при добавлении транзакции' : 'Failed to add transaction'
      setSuccessMessage(error.message || fallback)
      setShowSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50'

  return (
    <div className="space-y-4 pb-24">
      {showSuccess && (
        <SuccessNotification 
          message={successMessage} 
          onClose={() => setShowSuccess(false)} 
        />
      )}
      
      <Balance balance={balance} />

      <section className="px-6 pb-4">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
          <div className="relative space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white leading-tight">{t('add.description')}</h2>
                <p className="text-sm text-white/60 mt-1">{t('add.helper')}</p>
              </div>
              <button
                type="submit"
                form="transaction-form"
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/30 disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>{t('add.saving')}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t('add.submit')}</span>
                  </>
                )}
              </button>
            </div>

        <form id="transaction-form" className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs text-white/60 uppercase tracking-wide mb-2 block">
              {t('add.type')}
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 py-3 rounded-xl font-medium text-sm transition-colors ${
                  type === 'expense'
                    ? 'bg-red-500/20 text-red-400 border-2 border-red-500/40'
                    : 'bg-white/5 text-white/50 border-2 border-white/10'
                }`}
              >
                {t('add.expense')}
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex-1 py-3 rounded-xl font-medium text-sm transition-colors ${
                  type === 'income'
                    ? 'bg-green-500/20 text-green-400 border-2 border-green-500/40'
                    : 'bg-white/5 text-white/50 border-2 border-white/10'
                }`}
              >
                {t('add.income')}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-white/60 uppercase tracking-wide mb-2 block">
              {t('add.amount')}
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              onFocus={handleInputFocus}
              className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-purple-500/50 text-3xl font-bold"
              placeholder="0.00"
              required
            />
            {errors.amount ? <p className="mt-2 text-sm text-red-400 font-medium">{errors.amount}</p> : null}
          </div>

          <div className="space-y-4">
            <label className="text-xs text-white/60 uppercase tracking-wide mb-2 block">
              {t('add.category')}
            </label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              onFocus={handleInputFocus}
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
                onFocus={handleInputFocus}
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
                className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-5 py-3.5 text-sm font-semibold text-white hover:from-purple-600 hover:to-indigo-700 transition-all"
              >
                {t('add.addCategory')}
              </button>
            </div>
            {errors.category ? <p className="mt-2 text-sm text-red-400">{errors.category}</p> : null}
          </div>

          <div>
            <label className="text-xs text-white/60 uppercase tracking-wide mb-2 block">
              {t('add.date')}
            </label>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              onFocus={handleInputFocus}
              className={inputClass}
              required
            />
            {errors.date ? <p className="mt-2 text-sm text-red-400">{errors.date}</p> : null}
          </div>

          <div>
            <label className="text-xs text-white/60 uppercase tracking-wide mb-2 block">
              {t('add.comment')}
            </label>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              onFocus={handleInputFocus}
              rows={4}
              className={`${inputClass} resize-none`}
              placeholder={t('add.commentPlaceholder')}
            />
          </div>

        </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AddTransactionPage
