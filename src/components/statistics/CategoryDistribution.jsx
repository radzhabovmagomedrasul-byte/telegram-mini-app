const CategoryDistribution = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-6">
        Недостаточно данных
      </div>
    )
  }

  const maxValue = Math.max(...data.map((item) => item.amount))
  const total = data.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="space-y-4">
      {data.map((item) => {
        const percentage = total ? Math.round((item.amount / total) * 100) : 0
        return (
          <div key={item.category} className="space-y-1">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>{item.category}</span>
              <span>
                {item.amount.toLocaleString('ru-RU', {
                  style: 'currency',
                  currency: 'RUB',
                })}{' '}
                · {percentage}%
              </span>
            </div>
            <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-600 rounded-full"
                style={{ width: maxValue ? `${(item.amount / maxValue) * 100}%` : '0%' }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default CategoryDistribution


