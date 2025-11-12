import { useState, useEffect } from 'react'
import { getTransactions, deleteTransaction } from '../services/transactionService'
import { showConfirm, showAlert } from '../utils/telegram'
import EditTransaction from './EditTransaction'

const TransactionsList = ({ userId, onTransactionUpdate }) => {
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState('all') // 'all', 'income', 'expense'
  const [loading, setLoading] = useState(true)
  const [editingTransaction, setEditingTransaction] = useState(null)

  useEffect(() => {
    fetchTransactions()
  }, [userId, filter])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const data = await getTransactions(userId, filter)
      setTransactions(data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      alert('Ошибка при загрузке транзакций')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = await showConfirm('Удалить эту транзакцию?')
    
    if (!confirmed) return

    try {
      await deleteTransaction(id)
      fetchTransactions()
      onTransactionUpdate()
    } catch (error) {
      console.error('Error deleting transaction:', error)
      showAlert('Ошибка при удалении транзакции')
    }
  }

  const calculateBalance = () => {
    return transactions.reduce((sum, transaction) => {
      return sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount)
    }, 0)
  }

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-600">
        <p>Загрузка...</p>
      </div>
    )
  }

  return (
    <div className="pb-20">
      <div className="px-4 mb-4">
        <div className="flex gap-2 bg-white rounded-lg p-1 shadow-md">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-indigo-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setFilter('income')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              filter === 'income'
                ? 'bg-green-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Доходы
          </button>
          <button
            onClick={() => setFilter('expense')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              filter === 'expense'
                ? 'bg-red-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Расходы
          </button>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Нет транзакций</p>
          <p className="text-sm mt-2">Добавьте первую транзакцию</p>
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      transaction.type === 'income'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {transaction.type === 'income' ? 'Доход' : 'Расход'}
                  </span>
                </div>
                <p className="font-semibold text-gray-800">{transaction.description || 'Без описания'}</p>
                <p className="text-xs text-gray-500">
                  {new Date(transaction.created_at).toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`text-lg font-bold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {transaction.amount.toLocaleString('ru-RU')} ₽
                </p>
                <div className="flex gap-2 justify-end mt-1">
                  <button
                    onClick={() => setEditingTransaction(transaction)}
                    className="text-indigo-500 text-xs hover:text-indigo-700"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="text-red-500 text-xs hover:text-red-700"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {transactions.length > 0 && (
        <div className="mt-6 px-4">
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Итого:</span>
              <span
                className={`text-xl font-bold ${
                  calculateBalance() >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {calculateBalance() >= 0 ? '+' : ''}
                {calculateBalance().toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </div>
        </div>
      )}

      {editingTransaction && (
        <EditTransaction
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onTransactionUpdated={() => {
            fetchTransactions()
            onTransactionUpdate()
          }}
        />
      )}
    </div>
  )
}

export default TransactionsList

