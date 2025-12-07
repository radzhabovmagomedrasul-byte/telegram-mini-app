const formatLabel = (date) =>
  new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
  })

const TimelineChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-ios-text-secondary py-8 text-[15px]">
        Недостаточно данных
      </div>
    )
  }

  const maxValue = Math.max(...data.map((item) => item.amount))

  return (
    <div className="flex items-end gap-2 h-48">
      {data.map((item) => {
        const heightPercent = maxValue ? (item.amount / maxValue) * 100 : 0
        return (
          <div key={item.date} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-full bg-ios-blue rounded-ios-lg transition-all duration-500 min-h-[4px]"
              style={{ height: `${Math.max(heightPercent, 2)}%` }}
              title={`${formatLabel(item.date)} · ${item.amount.toLocaleString('ru-RU', {
                style: 'currency',
                currency: 'RUB',
              })}`}
            />
            <span className="text-[13px] text-ios-text-secondary">
              {formatLabel(item.date)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default TimelineChart


