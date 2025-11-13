const formatLabel = (date) =>
  new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
  })

const TimelineChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-6">
        Недостаточно данных
      </div>
    )
  }

  const maxValue = Math.max(...data.map((item) => item.amount))

  return (
    <div className="flex items-end gap-3 h-48">
      {data.map((item) => {
        const heightPercent = maxValue ? (item.amount / maxValue) * 100 : 0
        return (
          <div key={item.date} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-full bg-gradient-to-t from-purple-500 via-indigo-500 to-indigo-400 rounded-2xl transition-all"
              style={{ height: `${heightPercent}%` }}
              title={`${formatLabel(item.date)} · ${item.amount.toLocaleString('ru-RU', {
                style: 'currency',
                currency: 'RUB',
              })}`}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatLabel(item.date)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default TimelineChart


