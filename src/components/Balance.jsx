import { useMemo, useState } from 'react'
import { useLocale } from '../context/LocaleContext.jsx'
import { getTransactionsList, getBalance } from '../services/transactionService'
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts'
import { TrendingUp } from 'lucide-react'

const Balance = ({ balance, savedAmount = 0 }) => {
  const { locale, t } = useLocale()
  const [selectedDayIndex, setSelectedDayIndex] = useState(null)

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
        if (!t.created_at) return false
        const transDate = new Date(t.created_at)
        return transDate >= dayStart && transDate <= date
      })
      
      const expenses = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0)
      
      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0)
      
      const dayBalance = income - expenses
      const isToday = date.toDateString() === now.toDateString()
      
      return { 
        day, 
        amount: expenses, 
        expenses,
        income,
        balance: dayBalance,
        isToday,
        date: new Date(dayStart),
        dayStart,
        dayEnd: new Date(date)
      }
    })
  }, [])

  // Calculate balance and spending for selected day
  const selectedDayData = useMemo(() => {
    if (selectedDayIndex === null) {
      return {
        balance: balance,
        spent: weeklySpendingData.reduce((sum, day) => sum + day.expenses, 0),
        income: weeklySpendingData.reduce((sum, day) => sum + day.income, 0),
        dayLabel: locale === 'ru' ? 'За неделю' : 'This week'
      }
    }
    
    const selectedDay = weeklySpendingData[selectedDayIndex]
    if (!selectedDay) return null
    
    // Calculate balance up to the end of selected day
    const transactions = getTransactionsList('all')
    const dayEnd = new Date(selectedDay.dayEnd)
    
    const transactionsUpToDay = transactions.filter(t => {
      if (!t.created_at) return false
      const transDate = new Date(t.created_at)
      return transDate <= dayEnd
    })
    
    const totalBalance = transactionsUpToDay.reduce((sum, t) => {
      return sum + (t.type === 'income' ? t.amount : -t.amount)
    }, 0)
    
    return {
      balance: totalBalance,
      spent: selectedDay.expenses,
      income: selectedDay.income,
      dayLabel: selectedDay.day
    }
  }, [selectedDayIndex, weeklySpendingData, balance, locale])

  const displayBalance = selectedDayData?.balance ?? balance
  const displaySpent = selectedDayData?.spent ?? 0
  const isPositive = displayBalance >= 0

  const formatted = new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(displayBalance))

  const formattedSpent = new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(displaySpent)

  return (
    <div className="px-6 pb-4 animate-fade-in">
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-indigo-500/10 pointer-events-none"></div>
        
        <div className="relative space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-white/60 text-sm">{selectedDayData?.dayLabel || t('balance.total')}</p>
              {selectedDayIndex !== null && (
                <button
                  onClick={() => setSelectedDayIndex(null)}
                  className="text-white/40 hover:text-white/60 text-xs transition-colors"
                >
                  {locale === 'ru' ? 'Сбросить' : 'Reset'}
                </button>
              )}
            </div>
            <p className="text-white text-5xl font-semibold mt-2">
              {isPositive ? '' : '-'}{formatted} ₽
            </p>
            {selectedDayIndex !== null && selectedDayData && (
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">{locale === 'ru' ? 'Потрачено' : 'Spent'}</span>
                  <span className="text-red-400 font-medium">{formattedSpent} ₽</span>
                </div>
                {selectedDayData.income > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">{locale === 'ru' ? 'Получено' : 'Income'}</span>
                    <span className="text-green-400 font-medium">
                      {selectedDayData.income.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                    </span>
                  </div>
                )}
              </div>
            )}
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
                <BarChart 
                  data={weeklySpendingData}
                  onClick={(data, index) => {
                    if (data && typeof index === 'number') {
                      setSelectedDayIndex(index === selectedDayIndex ? null : index)
                    }
                  }}
                >
                  <Bar 
                    dataKey="amount" 
                    radius={[8, 8, 0, 0]}
                    onClick={(data, index) => {
                      setSelectedDayIndex(index === selectedDayIndex ? null : index)
                    }}
                  >
                    {weeklySpendingData.map((entry, index) => {
                      const isSelected = selectedDayIndex === index
                      const isActive = isSelected || (selectedDayIndex === null && entry.isToday)
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={isActive ? '#a78bfa' : 'rgba(255, 255, 255, 0.1)'}
                          style={{ cursor: 'pointer' }}
                        />
                      )
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-between px-1 mt-1">
                {weeklySpendingData.map((day, idx) => {
                  const isSelected = selectedDayIndex === idx
                  const isActive = isSelected || (selectedDayIndex === null && day.isToday)
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDayIndex(isSelected ? null : idx)}
                      className={`text-xs transition-all cursor-pointer ${
                        isActive 
                          ? 'text-purple-300 font-semibold scale-110' 
                          : 'text-white/40 hover:text-white/60'
                      }`}
                    >
                      {day.day}
                    </button>
                  )
                })}
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

