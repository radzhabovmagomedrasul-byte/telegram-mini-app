import { useEffect, useMemo, useState } from 'react'
import {
  deleteTransaction,
  getTransactionsList,
  updateTransaction,
} from '../services/transactionService'
import { useCategories } from '../hooks/useCategories'
import { showAlert, showConfirm } from '../utils/telegram'
import { useLocale } from '../context/LocaleContext.jsx'
import Balance from '../components/Balance'
import { 
  ChevronRight, 
  X, 
  PieChart, 
  Calendar,
  Coffee,
  ShoppingBag,
  Car,
  Film,
  Zap,
  Activity,
  User,
  CreditCard,
  Smartphone,
  TrendingUp,
  Music
} from 'lucide-react'

const formatCurrency = (value, locale = 'ru') => {
  const num = Math.abs(value)
  return new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

// Цвета для категорий
const CATEGORY_COLORS = {
  'Продукты': { bg: 'bg-yellow-500/20', icon: 'text-yellow-400', iconBg: 'bg-yellow-500/30' },
  'Транспорт': { bg: 'bg-blue-500/20', icon: 'text-blue-400', iconBg: 'bg-blue-500/30' },
  'Развлечения': { bg: 'bg-pink-500/20', icon: 'text-pink-400', iconBg: 'bg-pink-500/30' },
  'Покупки': { bg: 'bg-purple-500/20', icon: 'text-purple-400', iconBg: 'bg-purple-500/30' },
  'Счета': { bg: 'bg-orange-500/20', icon: 'text-orange-400', iconBg: 'bg-orange-500/30' },
  'Здоровье': { bg: 'bg-red-500/20', icon: 'text-red-400', iconBg: 'bg-red-500/30' },
  'Образование': { bg: 'bg-indigo-500/20', icon: 'text-indigo-400', iconBg: 'bg-indigo-500/30' },
  'Зарплата': { bg: 'bg-green-500/20', icon: 'text-green-400', iconBg: 'bg-green-500/30' },
  'Фриланс': { bg: 'bg-emerald-500/20', icon: 'text-emerald-400', iconBg: 'bg-emerald-500/30' },
  'Инвестиции': { bg: 'bg-teal-500/20', icon: 'text-teal-400', iconBg: 'bg-teal-500/30' },
  'Подарок': { bg: 'bg-rose-500/20', icon: 'text-rose-400', iconBg: 'bg-rose-500/30' },
  'Прочее': { bg: 'bg-gray-500/20', icon: 'text-gray-400', iconBg: 'bg-gray-500/30' }
}

// Иконки компонентов для категорий
const CATEGORY_ICON_COMPONENTS = {
  'Продукты': Coffee,
  'Транспорт': Car,
  'Развлечения': Film,
  'Покупки': ShoppingBag,
  'Счета': Zap,
  'Здоровье': Activity,
  'Образование': User,
  'Зарплата': CreditCard,
  'Фриланс': Smartphone,
  'Инвестиции': TrendingUp,
  'Подарок': ShoppingBag,
  'Прочее': Activity
}

function WidgetsRow({ transactions }) {
  const { locale } = useLocale()
  
  // Calculate top category
  const categoryTotals = useMemo(() => {
    const totals = {}
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        totals[t.category] = (totals[t.category] || 0) + Math.abs(t.amount || 0)
      })
    return totals
  }, [transactions])
  
  const totalExpense = Object.values(categoryTotals).reduce((a, b) => a + b, 0)
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]
  const topCategoryPercent = topCategory ? Math.round((topCategory[1] / totalExpense) * 100) : 0

  // Find upcoming transaction (next expense)
  const upcomingTransaction = useMemo(() => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const upcoming = transactions
      .filter(t => t.type === 'expense' && t.created_at)
      .find(t => {
        const date = new Date(t.created_at)
        return date >= tomorrow && date < new Date(tomorrow.getTime() + 86400000)
      })
    
    return upcoming || { comment: 'Netflix', category: 'Развлечения' }
  }, [transactions])

  return (
    <div className="px-6 pb-4">
      <div className="grid grid-cols-2 gap-3">
        {/* Categories Widget */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="size-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <PieChart className="size-4 text-purple-400" />
              </div>
              <span className="text-white/60 text-xs uppercase tracking-wide">{locale === 'ru' ? 'Категории' : 'Categories'}</span>
            </div>
            <p className="text-white font-semibold">{topCategory ? topCategory[0] : 'N/A'}</p>
            <p className="text-purple-300 text-sm">{topCategoryPercent}% {locale === 'ru' ? 'расходов' : 'expenses'}</p>
          </div>
        </div>

        {/* Upcoming Widget */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="size-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <Calendar className="size-4 text-indigo-400" />
              </div>
              <span className="text-white/60 text-xs uppercase tracking-wide">{locale === 'ru' ? 'Скоро' : 'Upcoming'}</span>
            </div>
            <p className="text-white font-semibold">{upcomingTransaction.comment || 'Netflix'}</p>
            <p className="text-indigo-300 text-sm">{locale === 'ru' ? 'Завтра' : 'Tomorrow'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function TransactionItem({ 
  transaction, 
  onEdit, 
  onDelete,
  showDate = false
}) {
  const { locale } = useLocale()
  const isPositive = transaction.type === 'income'
  const colors = CATEGORY_COLORS[transaction.category] || CATEGORY_COLORS['Прочее']
  const IconComponent = CATEGORY_ICON_COMPONENTS[transaction.category] || Activity

  return (
    <div>
      {showDate && (
        <div className="text-white/50 text-sm mb-3 mt-4 font-medium">
          {new Date(transaction.created_at || transaction.date).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', { 
    day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </div>
      )}
      <div 
        className="flex items-center justify-between py-3 group cursor-pointer hover:bg-white/5 rounded-xl px-3 -mx-3 transition-colors"
        onClick={onEdit}
      >
        <div className="flex items-center gap-3">
          <div className={`size-12 rounded-2xl ${colors.iconBg} border border-white/10 flex items-center justify-center`}>
            <IconComponent className={`size-5 ${colors.icon}`} />
          </div>
          <div>
            <p className="text-white font-semibold">{transaction.comment || transaction.category}</p>
            <p className="text-white/50 text-sm">{transaction.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <p className={`font-semibold text-lg ${isPositive ? 'text-emerald-400' : 'text-white'}`}>
            {isPositive ? '+' : '-'}{formatCurrency(transaction.amount, locale)} ₽
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

function TransactionModal({ 
  isOpen, 
  onClose, 
  onSave,
  initialTransaction 
}) {
  const { locale, t } = useLocale()
  const { categories } = useCategories()
  const [type, setType] = useState(initialTransaction?.type || 'expense')
  const [amount, setAmount] = useState(initialTransaction?.amount?.toString() || '')
  const [category, setCategory] = useState(initialTransaction?.category || '')
  const [date, setDate] = useState(initialTransaction?.created_at ? initialTransaction.created_at.split('T')[0] : (initialTransaction?.date || new Date().toISOString().split('T')[0]))
  const [comment, setComment] = useState(initialTransaction?.comment || '')

  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type)
      setAmount(Math.abs(initialTransaction.amount || 0).toString())
      setCategory(initialTransaction.category)
      setDate(initialTransaction.created_at ? initialTransaction.created_at.split('T')[0] : (initialTransaction.date || new Date().toISOString().split('T')[0]))
      setComment(initialTransaction.comment || '')
    } else {
      setType('expense')
      setAmount('')
      setCategory('')
      setDate(new Date().toISOString().split('T')[0])
      setComment('')
    }
  }, [initialTransaction, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!amount || !category) return
    
    const now = new Date()
    const time = now.toLocaleTimeString(locale === 'ru' ? 'ru-RU' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    
    onSave({
      amount: parseFloat(amount),
      category,
      date,
      comment,
      type,
      time
    })
    
    onClose()
  }

  const presetCategories = {
    income: ['Зарплата', 'Фриланс', 'Инвестиции', 'Подарок', 'Прочее'],
    expense: ['Продукты', 'Транспорт', 'Развлечения', 'Покупки', 'Счета', 'Здоровье', 'Образование', 'Прочее']
  }

  const categoryList = type === 'income' ? presetCategories.income : presetCategories.expense

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className="w-full max-w-2xl bg-[#1a1b2e] backdrop-blur-xl rounded-t-[32px] p-6 pb-8 relative animate-slideUp border-t border-white/10">
        
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white text-xl font-semibold">
            {initialTransaction ? (locale === 'ru' ? 'Редактировать транзакцию' : 'Edit transaction') : (locale === 'ru' ? 'Новая транзакция' : 'New transaction')}
          </h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X className="size-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Type selector */}
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
              {locale === 'ru' ? 'Расход' : 'Expense'}
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
              {locale === 'ru' ? 'Доход' : 'Income'}
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs text-white/60 uppercase tracking-wide mb-2 block">
              {locale === 'ru' ? 'Сумма' : 'Amount'}
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-purple-500/50"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs text-white/60 uppercase tracking-wide mb-2 block">
              {locale === 'ru' ? 'Категория' : 'Category'}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50"
              required
            >
              <option value="">{locale === 'ru' ? 'Выберите категорию' : 'Select category'}</option>
              {categoryList.map((cat) => (
                <option key={cat} value={cat} className="bg-[#1a1b2e]">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="text-xs text-white/60 uppercase tracking-wide mb-2 block">
              {locale === 'ru' ? 'Дата' : 'Date'}
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50"
              required
            />
          </div>

          {/* Comment */}
          <div>
            <label className="text-xs text-white/60 uppercase tracking-wide mb-2 block">
              {locale === 'ru' ? 'Комментарий' : 'Comment'}
            </label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={locale === 'ru' ? 'Необязательно' : 'Optional'}
              className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold py-4 rounded-xl mt-2 hover:from-purple-600 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/30"
          >
            {initialTransaction ? (locale === 'ru' ? 'Сохранить изменения' : 'Save changes') : (locale === 'ru' ? 'Добавить транзакцию' : 'Add transaction')}
          </button>
        </form>
      </div>
    </div>
  )
}

function TransactionsList({ 
  transactions, 
  onEdit, 
  onDelete,
  onShowAll
}) {
  const { locale } = useLocale()
  
  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const grouped = {}
    
    transactions.forEach(t => {
      const dateKey = t.created_at ? t.created_at.split('T')[0] : (t.date || new Date().toISOString().split('T')[0])
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(t)
    })
    
    return grouped
  }, [transactions])

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )

  // Show only first 2 dates
  const visibleDates = sortedDates.slice(0, 2)
  const visibleTransactions = visibleDates.flatMap(date => 
    groupedTransactions[date].map((t, idx) => ({
      ...t,
      showDate: idx === 0
    }))
  )

  return (
    <div className="px-6 pb-28">
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-xl font-semibold">{locale === 'ru' ? 'Транзакции' : 'Transactions'}</h2>
            <button 
              onClick={onShowAll}
              className="text-purple-300 hover:text-purple-200 text-sm flex items-center gap-1 font-medium"
            >
              {locale === 'ru' ? 'Показать все' : 'Show all'}
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div>
            {visibleTransactions.length === 0 ? (
              <div className="py-12 text-center text-white/60 text-sm">{locale === 'ru' ? 'Нет транзакций' : 'No transactions'}</div>
            ) : (
              visibleTransactions.map((transaction) => (
                <TransactionItem 
                  key={transaction.id} 
                  transaction={transaction}
                  onEdit={() => onEdit(transaction)}
                  onDelete={() => onDelete(transaction.id)}
                  showDate={transaction.showDate}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const HistoryPage = ({
  userId,
  onTransactionsChanged,
  refreshToken,
  balance = 0,
  onNavigateTab,
}) => {
  const { t, locale } = useLocale()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAllTransactions, setShowAllTransactions] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  // Calculate totals
  const totalIncome = useMemo(() => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0)
  }, [transactions])
  
  const totalExpense = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0)
  }, [transactions])

  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction)
    setIsModalOpen(true)
  }

  const handleSaveTransaction = (transactionData) => {
    if (editingTransaction) {
      // Update existing transaction
      try {
        updateTransaction(editingTransaction.id, {
          amount: transactionData.amount,
          category: transactionData.category,
          comment: transactionData.comment,
          type: transactionData.type,
          created_at: new Date(transactionData.date).toISOString()
        })
        showAlert(t('history.alerts.updated'))
        loadTransactions()
        onTransactionsChanged?.()
      } catch (error) {
        console.error('Update error:', error)
        showAlert(error.message || (locale === 'ru' ? 'Ошибка при обновлении' : 'Update error'))
      }
    } else {
      // This should not happen from history page, but handle it anyway
      onNavigateTab?.('add')
    }
    setIsModalOpen(false)
    setEditingTransaction(null)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingTransaction(null)
  }

  const handleDelete = async (id) => {
    const confirmed = await showConfirm(t('history.alerts.confirmDelete'))
    if (!confirmed) return

    try {
      await deleteTransaction(id, userId)
      showAlert(t('history.alerts.deleted'))
      loadTransactions()
      onTransactionsChanged?.()
    } catch (error) {
      console.error('History delete error:', error)
      showAlert(error.message || (locale === 'ru' ? 'Ошибка при удалении' : 'Delete error'))
    }
  }

  if (showAllTransactions) {
    // Show all transactions view
    const groupedTransactions = {}
    transactions.forEach(t => {
      const dateKey = t.created_at ? t.created_at.split('T')[0] : (t.date || new Date().toISOString().split('T')[0])
      if (!groupedTransactions[dateKey]) {
        groupedTransactions[dateKey] = []
      }
      groupedTransactions[dateKey].push(t)
    })

    const sortedDates = Object.keys(groupedTransactions).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    )

  return (
      <div className="fixed inset-0 bg-[#120F25] z-50 overflow-y-auto">
        <div className="px-6 pt-12 pb-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white text-2xl font-semibold">{locale === 'ru' ? 'Все транзакции' : 'All transactions'}</h2>
            <button onClick={() => setShowAllTransactions(false)} className="text-white/50 hover:text-white">
              <X className="size-6" />
        </button>
      </div>

          {sortedDates.map((date) => (
            <div key={date}>
              <div className="text-white/50 text-sm mb-3 mt-4 font-medium">
                {new Date(date).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', { 
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
          </div>
              {groupedTransactions[date].map((transaction) => (
                <TransactionItem 
                  key={transaction.id} 
                  transaction={transaction}
                  onEdit={() => handleEditClick(transaction)}
                  onDelete={() => handleDelete(transaction.id)}
                />
              ))}
                </div>
              ))}
            </div>
          </div>
    )
  }

  return (
    <div className="relative w-full min-h-screen flex flex-col">
      <Balance balance={balance} />
      <WidgetsRow transactions={transactions} />
      <TransactionsList 
        transactions={transactions}
        onEdit={handleEditClick}
        onDelete={handleDelete}
        onShowAll={() => setShowAllTransactions(true)}
      />
      
      <TransactionModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveTransaction}
        initialTransaction={editingTransaction}
      />
    </div>
  )
}

export default HistoryPage
