import { getTransactions, saveTransactions } from './localStorageService'
import { getOrCreateUserId } from './localStorageService'

/**
 * Получение всех транзакций пользователя
 */
export const getTransactionsList = (filter = 'all') => {
  try {
    const transactions = getTransactions()
    
    if (filter === 'income') {
      return transactions.filter(t => t.type === 'income')
    } else if (filter === 'expense') {
      return transactions.filter(t => t.type === 'expense')
    }
    
    return transactions.sort((a, b) => {
      const dateA = new Date(a.created_at || 0)
      const dateB = new Date(b.created_at || 0)
      return dateB - dateA
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return []
  }
}

/**
 * Добавление новой транзакции
 */
export const addTransaction = (type, amount, comment = null, options = {}) => {
  try {
    const transactions = getTransactions()
    const userId = getOrCreateUserId()
    
    const transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      type,
      amount: parseFloat(amount),
      description: JSON.stringify({
        category: options.category || 'Прочее',
        comment: comment || ''
      }),
      created_at: options.date || new Date().toISOString()
    }
    
    // Парсим описание для удобства
    const { category, comment: parsedComment } = parseDescription(transaction.description)
    transaction.category = category
    transaction.comment = parsedComment
    
    transactions.push(transaction)
    saveTransactions(transactions)
    
    return transaction
  } catch (error) {
    console.error('Error adding transaction:', error)
    throw error
  }
}

/**
 * Обновление транзакции
 */
export const updateTransaction = (transactionId, updates) => {
  try {
    const transactions = getTransactions()
    const index = transactions.findIndex(t => t.id === transactionId)
    
    if (index === -1) {
      throw new Error('Транзакция не найдена')
    }
    
    if (updates.type !== undefined) {
      transactions[index].type = updates.type
    }
    
    if (updates.amount !== undefined) {
      transactions[index].amount = parseFloat(updates.amount)
    }
    
    if (updates.category !== undefined || updates.comment !== undefined) {
      transactions[index].description = JSON.stringify({
        category: updates.category || transactions[index].category || 'Прочее',
        comment: updates.comment || transactions[index].comment || ''
      })
      const { category, comment } = parseDescription(transactions[index].description)
      transactions[index].category = category
      transactions[index].comment = comment
    }
    
    if (updates.created_at) {
      transactions[index].created_at = updates.created_at
    }
    
    saveTransactions(transactions)
    return transactions[index]
  } catch (error) {
    console.error('Error updating transaction:', error)
    throw error
  }
}

/**
 * Удаление транзакции
 */
export const deleteTransaction = (transactionId) => {
  try {
    const transactions = getTransactions()
    const filtered = transactions.filter(t => t.id !== transactionId)
    saveTransactions(filtered)
    return true
  } catch (error) {
    console.error('Error deleting transaction:', error)
    throw error
  }
}

/**
 * Подсчёт баланса пользователя
 */
export const getBalance = () => {
  try {
    const transactions = getTransactions()
    return transactions.reduce((sum, transaction) => {
      return sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount)
    }, 0)
  } catch (error) {
    console.error('Error calculating balance:', error)
    return 0
  }
}

/**
 * Парсинг описания транзакции
 */
const parseDescription = (description) => {
  if (!description) {
    return { category: 'Прочее', comment: '' }
  }
  
  try {
    const parsed = JSON.parse(description)
    if (parsed && typeof parsed === 'object') {
      return {
        category: parsed.category || 'Прочее',
        comment: parsed.comment || ''
      }
    }
    return { category: 'Прочее', comment: description }
  } catch (_err) {
    return { category: 'Прочее', comment: description }
  }
}

