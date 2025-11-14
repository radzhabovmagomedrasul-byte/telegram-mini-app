import { getTransactions } from './localStorageService'
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'

/**
 * AI-помощник для анализа трат и предоставления советов
 */
export class AIAssistant {
  /**
   * Анализ трат за текущий месяц
   */
  static analyzeCurrentMonth() {
    const transactions = getTransactions()
    const now = new Date()
    const currentMonthStart = startOfMonth(now)
    const currentMonthEnd = endOfMonth(now)
    
    const currentMonthTransactions = transactions.filter(t => {
      const date = new Date(t.created_at)
      return isWithinInterval(date, { start: currentMonthStart, end: currentMonthEnd })
    })
    
    return this.analyzeTransactions(currentMonthTransactions, 'текущий месяц')
  }
  
  /**
   * Сравнение с предыдущим месяцем
   */
  static compareWithPreviousMonth() {
    const transactions = getTransactions()
    const now = new Date()
    const currentMonthStart = startOfMonth(now)
    const currentMonthEnd = endOfMonth(now)
    const previousMonthStart = startOfMonth(subMonths(now, 1))
    const previousMonthEnd = endOfMonth(subMonths(now, 1))
    
    const currentMonthTransactions = transactions.filter(t => {
      const date = new Date(t.created_at)
      return isWithinInterval(date, { start: currentMonthStart, end: currentMonthEnd })
    })
    
    const previousMonthTransactions = transactions.filter(t => {
      const date = new Date(t.created_at)
      return isWithinInterval(date, { start: previousMonthStart, end: previousMonthEnd })
    })
    
    const currentTotal = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const previousTotal = previousMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const diff = currentTotal - previousTotal
    const percentChange = previousTotal > 0 ? (diff / previousTotal) * 100 : 0
    
    return {
      currentTotal,
      previousTotal,
      diff,
      percentChange,
      advice: this.generateComparisonAdvice(diff, percentChange)
    }
  }
  
  /**
   * Анализ трат по категориям
   */
  static analyzeByCategories(period = 'month') {
    const transactions = getTransactions()
    const now = new Date()
    let startDate, endDate
    
    if (period === 'month') {
      startDate = startOfMonth(now)
      endDate = endOfMonth(now)
    } else if (period === 'quarter') {
      const quarter = Math.floor(now.getMonth() / 3)
      startDate = new Date(now.getFullYear(), quarter * 3, 1)
      endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0)
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1)
      endDate = new Date(now.getFullYear(), 11, 31)
    }
    
    const periodTransactions = transactions.filter(t => {
      const date = new Date(t.created_at)
      return isWithinInterval(date, { start: startDate, end: endDate })
    })
    
    const expenses = periodTransactions.filter(t => t.type === 'expense')
    const categoryMap = new Map()
    
    expenses.forEach(t => {
      const category = t.category || 'Прочее'
      categoryMap.set(category, (categoryMap.get(category) || 0) + t.amount)
    })
    
    const categoryStats = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: 0 // Будет вычислено ниже
      }))
      .sort((a, b) => b.amount - a.amount)
    
    const total = categoryStats.reduce((sum, stat) => sum + stat.amount, 0)
    categoryStats.forEach(stat => {
      stat.percentage = total > 0 ? (stat.amount / total) * 100 : 0
    })
    
    return {
      period,
      total,
      categories: categoryStats,
      advice: this.generateCategoryAdvice(categoryStats)
    }
  }
  
  /**
   * Генерация советов на основе анализа
   */
  static generateAdvice() {
    const advices = []
    
    // Сравнение с предыдущим месяцем
    const comparison = this.compareWithPreviousMonth()
    if (comparison.advice) {
      advices.push(comparison.advice)
    }
    
    // Анализ по категориям
    const categoryAnalysis = this.analyzeByCategories('month')
    if (categoryAnalysis.advice) {
      advices.push(categoryAnalysis.advice)
    }
    
    // Общий анализ
    const generalAnalysis = this.analyzeCurrentMonth()
    if (generalAnalysis.advice) {
      advices.push(generalAnalysis.advice)
    }
    
    return advices
  }
  
  /**
   * Анализ транзакций
   */
  static analyzeTransactions(transactions, period) {
    const expenses = transactions.filter(t => t.type === 'expense')
    const income = transactions.filter(t => t.type === 'income')
    
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)
    const balance = totalIncome - totalExpenses
    
    const categoryMap = new Map()
    expenses.forEach(t => {
      const category = t.category || 'Прочее'
      categoryMap.set(category, (categoryMap.get(category) || 0) + t.amount)
    })
    
    const topCategory = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])[0]
    
    let advice = null
    if (topCategory && topCategory[1] > totalExpenses * 0.4) {
      advice = `В ${period} вы потратили больше всего на "${topCategory[0]}" (${Math.round(topCategory[1] / totalExpenses * 100)}% от всех расходов). Рассмотрите возможность оптимизации трат в этой категории.`
    }
    
    if (balance < 0) {
      advice = (advice ? advice + ' ' : '') + `Ваш баланс отрицательный. Рекомендуется сократить расходы или увеличить доходы.`
    }
    
    return {
      period,
      totalExpenses,
      totalIncome,
      balance,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      advice
    }
  }
  
  /**
   * Генерация совета при сравнении месяцев
   */
  static generateComparisonAdvice(diff, percentChange) {
    if (Math.abs(percentChange) < 5) {
      return null // Изменение незначительное
    }
    
    if (diff > 0) {
      return `В этом месяце вы потратили на ${Math.abs(percentChange).toFixed(1)}% больше, чем в прошлом месяце. Это увеличение расходов на ${diff.toLocaleString('ru-RU')} ₽. Рекомендуется проанализировать, на что ушли дополнительные средства.`
    } else {
      return `Отлично! В этом месяце вы потратили на ${Math.abs(percentChange).toFixed(1)}% меньше, чем в прошлом месяце. Экономия составила ${Math.abs(diff).toLocaleString('ru-RU')} ₽. Продолжайте в том же духе!`
    }
  }
  
  /**
   * Генерация совета по категориям
   */
  static generateCategoryAdvice(categoryStats) {
    if (categoryStats.length === 0) {
      return null
    }
    
    const topCategory = categoryStats[0]
    if (topCategory.percentage > 50) {
      return `Более половины ваших расходов (${topCategory.percentage.toFixed(1)}%) приходится на категорию "${topCategory.category}". Рекомендуется диверсифицировать траты и пересмотреть приоритеты в этой категории.`
    }
    
    if (topCategory.percentage > 30) {
      return `Категория "${topCategory.category}" составляет ${topCategory.percentage.toFixed(1)}% от всех расходов. Стоит обратить внимание на оптимизацию трат в этой области.`
    }
    
    return null
  }
}

