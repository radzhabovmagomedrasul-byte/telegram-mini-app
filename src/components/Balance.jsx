import { useMemo } from 'react'
import { useLocale } from '../context/LocaleContext.jsx'
import { getTransactionsList } from '../services/transactionService'
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts'
import { TrendingUp } from 'lucide-react'

const Balance = ({ balance, savedAmount = 0 }) => {
  const { locale, t } = useLocale()
  const isPositive = balance >= 0

  const formatted = new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(balance))

  // Рассчитываем расходы за текущий месяц
  const monthlyBudget = 40000
  const monthlyStats = useMemo(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const transactions = getTransactionsList('all')
    const totalSpent = transactions
      .filter(t => {
        if (t.type !== 'expense') return false
        if (!t.created_at) return false
        const date = new Date(t.created_at)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      })
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0)
    
    const remainingBudget = Math.max(0, monthlyBudget - totalSpent)
    const budgetProgress = monthlyBudget > 0 ? Math.min((totalSpent / monthlyBudget) * 100, 100) : 0
    
    return { totalSpent, remainingBudget, budgetProgress }
  }, [])

  const isOverBudget = monthlyStats.totalSpent > monthlyBudget

  // Calculate weekly spending data
  const weeklySpendingData = useMemo(() => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    monday.setHours(0, 0, 0, 0)

    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    const transactions = getTransactionsList('all')
    
    return days.map((day, index) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + index)
      date.setHours(23, 59, 59, 999)
      
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      
      const dayTransactions = transactions.filter(t => {
        if (t.type !== 'expense') return false
        if (!t.created_at) return false
        const transDate = new Date(t.created_at)
        return transDate >= dayStart && transDate <= date
      })
      
      const amount = dayTransactions.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0)
      const isToday = date.toDateString() === now.toDateString()
      
      return { day, amount, isToday }
    })
  }, [])

  return (
    <div className="px-6 pb-4 animate-fade-in">
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-indigo-500/10 pointer-events-none"></div>
        
        <div className="relative space-y-5">
          <div>
            <p className="text-white/60 text-sm">{t('balance.total')}</p>
            <p className="text-white text-5xl font-semibold mt-2">
              {isPositive ? '' : '-'}{formatted} ₽
            </p>
          </div>

          {/* Weekly Bar Chart */}
          <div className="py-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/60 text-xs uppercase tracking-wide">{locale === 'ru' ? 'Трата за неделю' : 'Weekly spending'}</span>
              <span className="text-purple-300 text-xs flex items-center gap-1">
                <TrendingUp className="size-3" />
                +12%
              </span>
            </div>
            <div className="w-full h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklySpendingData}>
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                    {weeklySpendingData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.isToday ? '#a78bfa' : 'rgba(255, 255, 255, 0.1)'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-between px-1 mt-1">
                {weeklySpendingData.map((day, idx) => (
                  <span 
                    key={idx} 
                    className={`text-xs ${day.isToday ? 'text-purple-300 font-semibold' : 'text-white/40'}`}
                  >
                    {day.day}
                  </span>
                ))}
          </div>
        </div>
          </div>

          {/* Budget Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">{locale === 'ru' ? 'Месячный бюджет' : 'Monthly budget'}</span>
              <span className={`font-semibold ${isOverBudget ? 'text-red-400' : 'text-purple-300'}`}>
                {monthlyStats.totalSpent.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽ / {monthlyBudget.toLocaleString('ru-RU')} ₽
              </span>
            </div>
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                  isOverBudget ? 'bg-red-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                }`}
              style={{ width: `${monthlyStats.budgetProgress}%` }}
            />
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Balance

