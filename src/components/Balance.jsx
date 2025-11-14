import { useLocale } from '../context/LocaleContext.jsx'

const Balance = ({ balance }) => {
  const { locale, t } = useLocale()
  const isPositive = balance >= 0

  const formatted = new Intl.NumberFormat(locale === 'ru' ? 'ru-RU' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(balance)

  return (
    <div className="my-4 animate-fade-in">
      <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white shadow-lg shadow-purple-500/25">
        <p className="text-[0.65rem] uppercase tracking-[0.4em] text-blue-100">{t('balance.total')}</p>
        <p className="mt-3 text-4xl font-bold">{formatted} ₽</p>
        <div className="mt-4 flex items-center justify-between text-sm text-white/80">
          <span>{t('balance.status')}</span>
          <span className={`font-semibold ${isPositive ? 'text-green-300' : 'text-pink-300'}`}>
            {isPositive ? t('balance.positive') : t('balance.negative')}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Balance

