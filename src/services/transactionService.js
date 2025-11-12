import { supabase } from '../supabaseClient'

/**
 * Получение всех транзакций пользователя
 * @param {string} userId - ID пользователя
 * @param {string} filter - Фильтр: 'all', 'income', 'expense'
 * @returns {Promise<Array>} Массив транзакций
 */
export const getTransactions = async (userId, filter = 'all') => {
  try {
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (filter === 'income') {
      query = query.eq('type', 'income')
    } else if (filter === 'expense') {
      query = query.eq('type', 'expense')
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching transactions:', error)
    throw error
  }
}

/**
 * Добавление новой транзакции
 * @param {string} userId - ID пользователя
 * @param {string} type - Тип: 'income' или 'expense'
 * @param {number} amount - Сумма
 * @param {string} description - Описание (опционально)
 * @returns {Promise<Object>} Созданная транзакция
 */
export const addTransaction = async (userId, type, amount, description = null) => {
  try {
    if (!userId || !type || !amount || amount <= 0) {
      throw new Error('Неверные параметры транзакции')
    }

    if (type !== 'income' && type !== 'expense') {
      throw new Error('Тип должен быть "income" или "expense"')
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: userId,
          type,
          amount: parseFloat(amount),
          description: description?.trim() || null,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error adding transaction:', error)
    throw error
  }
}

/**
 * Обновление транзакции
 * @param {string} transactionId - ID транзакции
 * @param {Object} updates - Обновления: { type?, amount?, description? }
 * @returns {Promise<Object>} Обновленная транзакция
 */
export const updateTransaction = async (transactionId, updates) => {
  try {
    const updateData = {}
    
    if (updates.type !== undefined) {
      if (updates.type !== 'income' && updates.type !== 'expense') {
        throw new Error('Тип должен быть "income" или "expense"')
      }
      updateData.type = updates.type
    }
    
    if (updates.amount !== undefined) {
      if (updates.amount <= 0) {
        throw new Error('Сумма должна быть больше 0')
      }
      updateData.amount = parseFloat(updates.amount)
    }
    
    if (updates.description !== undefined) {
      updateData.description = updates.description?.trim() || null
    }

    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transactionId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating transaction:', error)
    throw error
  }
}

/**
 * Удаление транзакции
 * @param {string} transactionId - ID транзакции
 * @returns {Promise<void>}
 */
export const deleteTransaction = async (transactionId) => {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting transaction:', error)
    throw error
  }
}

/**
 * Подсчёт баланса пользователя
 * @param {string} userId - ID пользователя
 * @returns {Promise<number>} Баланс (доходы - расходы)
 */
export const getBalance = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('user_id', userId)

    if (error) throw error

    const balance = (data || []).reduce((sum, transaction) => {
      return sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount)
    }, 0)

    return balance
  } catch (error) {
    console.error('Error calculating balance:', error)
    throw error
  }
}

