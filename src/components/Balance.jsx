const Balance = ({ balance }) => {
  const isPositive = balance >= 0

  return (
    <div className="mx-4 my-4 animate-fade-in">
      <div className="relative overflow-hidden rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-8">
        {/* Декоративный градиентный фон */}
        <div className={`absolute inset-0 opacity-10 ${
          isPositive 
            ? 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600' 
            : 'bg-gradient-to-br from-red-400 via-rose-500 to-pink-600'
        }`} />
        
        <div className="relative text-center">
          <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold mb-4 uppercase tracking-wider">
            Общий баланс
          </p>
          <p className={`text-6xl font-black mb-4 bg-gradient-to-r ${
            isPositive 
              ? 'from-green-600 via-emerald-600 to-teal-600' 
              : 'from-red-600 via-rose-600 to-pink-600'
          } bg-clip-text text-transparent`}>
            {isPositive ? '+' : ''}{balance.toLocaleString('ru-RU', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })} ₽
          </p>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold shadow-lg ${
            isPositive 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
              : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
          }`}>
            <span>{isPositive ? '✓' : '⚠'}</span>
            <span>{isPositive ? 'Положительный' : 'Отрицательный'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Balance

