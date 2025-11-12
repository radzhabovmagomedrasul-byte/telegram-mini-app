const Balance = ({ balance }) => {
  const isPositive = balance >= 0

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 mx-4 my-4 border-2 border-white/50">
      <div className="text-center">
        <p className="text-gray-500 text-sm font-medium mb-3 uppercase tracking-wide">Общий баланс</p>
        <p className={`text-5xl font-extrabold mb-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{balance.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
        </p>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          isPositive 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {isPositive ? '✓ Положительный' : '⚠ Отрицательный'}
        </div>
      </div>
    </div>
  )
}

export default Balance

