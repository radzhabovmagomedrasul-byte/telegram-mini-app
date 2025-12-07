const CategoryDistribution = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-ios-text-secondary py-8 text-[15px]">
        Недостаточно данных
      </div>
    )
  }

  const maxValue = Math.max(...data.map((item) => item.amount))
  const total = data.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="space-y-3">
      {data.map((item) => {
        const percentage = total ? Math.round((item.amount / total) * 100) : 0
        return (
          <div key={item.category} className="space-y-2">
            <div className="flex justify-between text-[15px] text-ios-text-primary">
              <span className="font-medium">{item.category}</span>
              <span className="text-ios-text-secondary">
                {item.amount.toLocaleString('ru-RU', {
                  style: 'currency',
                  currency: 'RUB',
                })}{' '}
                · {percentage}%
              </span>
            </div>
            <div className="h-2 bg-ios-gray-5 rounded-full overflow-hidden">
              <div
                className="h-full bg-ios-blue rounded-full transition-all duration-500"
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


