import { useState, useEffect } from 'react'
import { updateTransaction } from '../services/transactionService'

const EditTransaction = ({ transaction, onClose, onTransactionUpdated }) => {
  const [type, setType] = useState(transaction.type)
  const [amount, setAmount] = useState(transaction.amount.toString())
  const [description, setDescription] = useState(transaction.description || '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setType(transaction.type)
    setAmount(transaction.amount.toString())
    setDescription(transaction.description || '')
  }, [transaction])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) {
      alert('Введите корректную сумму')
      return
    }

    setLoading(true)
    try {
      await updateTransaction(transaction.id, {
        type,
        amount: parseFloat(amount),
        description,
      })

      onTransactionUpdated()
      onClose()
    } catch (error) {
      console.error('Error updating transaction:', error)
      alert(error.message || 'Ошибка при обновлении транзакции')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50 animate-slide-up">
      <div className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto p-6 animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Редактировать транзакцию</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тип транзакции
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                  type === 'income'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Доход
              </button>
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                  type === 'expense'
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Расход
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Сумма (₽)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0.01"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Описание (необязательно)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Например: Зарплата, Продукты..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-6"
          >
            {loading ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EditTransaction

