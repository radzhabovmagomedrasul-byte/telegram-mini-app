import { supabase } from '../supabaseClient'

/**
 * Получение всех транзакций пользователя
 * @param {string} userId - ID пользователя
 * @param {string} filter - Фильтр: 'all', 'income', 'expense'
 * @returns {Promise<Array>} Массив транзакций
 */
const parseDescription = (description) => {
  if (!description) {
    return {
      category: 'Прочее',
      comment: '',
    }
  }

  try {
    const parsed = JSON.parse(description)
    if (parsed && typeof parsed === 'object') {
      return {
        category: parsed.category || 'Прочее',
        comment: parsed.comment || '',
      }
    }
    return {
      category: 'Прочее',
      comment: description,
    }
  } catch (_err) {
    return {
      category: 'Прочее',
      comment: description,
    }
  }
}

const serializeDescription = ({ category, comment }) => {
  const payload = {
    category: category || 'Прочее',
    comment: comment || '',
  }

  try {
    return JSON.stringify(payload)
  } catch (_err) {
    return comment || ''
  }
}

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
    return (data || []).map((item) => {
      const { category, comment } = parseDescription(item.description)
      return {
        ...item,
        category,
        comment,
      }
    })
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
export const addTransaction = async (
  userId,
  type,
  amount,
  description = null,
  options = {},
) => {
  try {
    if (!userId || !type || !amount || amount <= 0) {
      throw new Error('Неверные параметры транзакции')
    }

    if (type !== 'income' && type !== 'expense') {
      throw new Error('Тип должен быть "income" или "expense"')
    }

    const payload = {
      user_id: userId,
      type,
      amount: parseFloat(amount),
      description: serializeDescription({
        category: options.category,
        comment: description,
      }),
    }

    if (options.date) {
      payload.created_at = options.date
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([payload])
      .select()
      .single()

    if (error) throw error
    const { category, comment } = parseDescription(data.description)
    return {
      ...data,
      category,
      comment,
    }
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
    
    let category = updates.category
    let comment = updates.description

    if (updates.comment !== undefined) {
      comment = updates.comment
    }

    if (updates.description !== undefined && comment === undefined) {
      comment = updates.description
    }

    if (updates.category !== undefined || updates.description !== undefined || updates.comment !== undefined) {
      updateData.description = serializeDescription({
        category: category ?? updates.currentCategory ?? updates.previousCategory,
        comment: comment ?? updates.currentComment ?? '',
      })
    }

    if (updates.created_at) {
      updateData.created_at = updates.created_at
    }

    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transactionId)
      .select()
      .single()

    if (error) throw error
    const { category: parsedCategory, comment: parsedComment } = parseDescription(data.description)
    return {
      ...data,
      category: parsedCategory,
      comment: parsedComment,
    }
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

