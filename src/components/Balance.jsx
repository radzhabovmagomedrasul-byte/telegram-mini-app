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
      <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#1c1634] via-[#0f1124] to-[#070714] p-6 text-white shadow-dash-neon">
        <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/45">{t('balance.total')}</p>
        <p className="mt-3 text-4xl font-semibold">{formatted} ₽</p>
        <div className="mt-4 flex items-center justify-between text-sm text-white/55">
          <span>{t('balance.status')}</span>
          <span className={isPositive ? 'text-dash-positive' : 'text-dash-negative'}>
            {isPositive ? t('balance.positive') : t('balance.negative')}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Balance

