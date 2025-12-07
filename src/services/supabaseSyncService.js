import { supabase } from '../supabaseClient'
import { getTransactions, saveTransactions } from './localStorageService'

/**
 * Синхронизация транзакций с Supabase
 */

/**
 * Сохранение транзакции в Supabase
 */
export const saveTransactionToSupabase = async (transaction, userId) => {
  try {
    if (!userId) {
      console.warn('No userId provided for Supabase sync')
      return false
    }

    // Парсим описание для получения категории и комментария
    let category = 'Прочее'
    let comment = ''
    
    if (transaction.description) {
      try {
        const parsed = JSON.parse(transaction.description)
        category = parsed.category || transaction.category || 'Прочее'
        comment = parsed.comment || transaction.comment || ''
      } catch {
        category = transaction.category || 'Прочее'
        comment = transaction.comment || transaction.description || ''
      }
    } else {
      category = transaction.category || 'Прочее'
      comment = transaction.comment || ''
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: transaction.type,
        amount: Math.abs(transaction.amount),
        description: JSON.stringify({ category, comment }),
        created_at: transaction.created_at || new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving transaction to Supabase:', error)
      return false
    }

    // Обновляем локальную транзакцию с ID из Supabase
    if (data && transaction.id) {
      const transactions = getTransactions()
      const index = transactions.findIndex(t => t.id === transaction.id)
      if (index !== -1) {
        transactions[index].supabase_id = data.id
        saveTransactions(transactions)
      }
    }

    return true
  } catch (error) {
    console.error('Error in saveTransactionToSupabase:', error)
    return false
  }
}

/**
 * Загрузка транзакций из Supabase
 */
export const loadTransactionsFromSupabase = async (userId) => {
  try {
    if (!userId) {
      console.warn('No userId provided for Supabase sync')
      return false
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading transactions from Supabase:', error)
      return false
    }

    if (!data || data.length === 0) {
      return false
    }

    // Преобразуем данные из Supabase в формат приложения
    const supabaseTransactions = data.map(t => {
      let category = 'Прочее'
      let comment = ''
      
      if (t.description) {
        try {
          const parsed = JSON.parse(t.description)
          category = parsed.category || 'Прочее'
          comment = parsed.comment || ''
        } catch {
          comment = t.description || ''
        }
      }

      return {
        id: `txn_${t.id}`,
        supabase_id: t.id,
        user_id: t.user_id,
        type: t.type,
        amount: parseFloat(t.amount),
        category,
        comment,
        description: t.description,
        created_at: t.created_at
      }
    })

    // Получаем локальные транзакции
    const localTransactions = getTransactions()
    
    // Объединяем транзакции: приоритет у более новых
    const mergedTransactions = []
    const processedIds = new Set()

    // Сначала добавляем транзакции из Supabase
    supabaseTransactions.forEach(supabaseTxn => {
      const localMatch = localTransactions.find(
        localTxn => localTxn.supabase_id === supabaseTxn.supabase_id
      )
      
      if (localMatch) {
        // Если есть локальная версия, сравниваем даты
        const supabaseDate = new Date(supabaseTxn.created_at)
        const localDate = new Date(localMatch.created_at || 0)
        
        if (supabaseDate >= localDate) {
          mergedTransactions.push(supabaseTxn)
        } else {
          mergedTransactions.push(localMatch)
        }
        processedIds.add(localMatch.id)
      } else {
        mergedTransactions.push(supabaseTxn)
      }
    })

    // Добавляем локальные транзакции, которых нет в Supabase
    localTransactions.forEach(localTxn => {
      if (!processedIds.has(localTxn.id) && !localTxn.supabase_id) {
        mergedTransactions.push(localTxn)
      }
    })

    // Сортируем по дате
    mergedTransactions.sort((a, b) => {
      const dateA = new Date(a.created_at || 0)
      const dateB = new Date(b.created_at || 0)
      return dateB - dateA
    })

    // Сохраняем объединенные транзакции
    saveTransactions(mergedTransactions)

    return true
  } catch (error) {
    console.error('Error in loadTransactionsFromSupabase:', error)
    return false
  }
}

/**
 * Удаление транзакции из Supabase
 */
export const deleteTransactionFromSupabase = async (transactionId, userId) => {
  try {
    if (!userId || !transactionId) {
      return false
    }

    // Если есть supabase_id, удаляем из Supabase
    const transactions = getTransactions()
    const transaction = transactions.find(t => t.id === transactionId)
    
    if (transaction?.supabase_id) {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transaction.supabase_id)
        .eq('user_id', userId)

      if (error) {
        console.error('Error deleting transaction from Supabase:', error)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Error in deleteTransactionFromSupabase:', error)
    return false
  }
}

/**
 * Обновление транзакции в Supabase
 */
export const updateTransactionInSupabase = async (transaction, userId) => {
  try {
    if (!userId || !transaction.supabase_id) {
      return false
    }

    let category = transaction.category || 'Прочее'
    let comment = transaction.comment || ''
    
    if (transaction.description) {
      try {
        const parsed = JSON.parse(transaction.description)
        category = parsed.category || category
        comment = parsed.comment || comment
      } catch {
        // Используем уже извлеченные значения
      }
    }

    const { error } = await supabase
      .from('transactions')
      .update({
        type: transaction.type,
        amount: Math.abs(transaction.amount),
        description: JSON.stringify({ category, comment }),
        created_at: transaction.created_at
      })
      .eq('id', transaction.supabase_id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error updating transaction in Supabase:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in updateTransactionInSupabase:', error)
    return false
  }
}

/**
 * Синхронизация всех локальных транзакций в Supabase
 */
export const syncAllTransactionsToSupabase = async (userId) => {
  try {
    if (!userId) {
      return false
    }

    const transactions = getTransactions()
    let syncedCount = 0

    for (const transaction of transactions) {
      // Синхронизируем только транзакции без supabase_id
      if (!transaction.supabase_id) {
        const success = await saveTransactionToSupabase(transaction, userId)
        if (success) {
          syncedCount++
        }
      }
    }

    return syncedCount > 0
  } catch (error) {
    console.error('Error in syncAllTransactionsToSupabase:', error)
    return false
  }
}

