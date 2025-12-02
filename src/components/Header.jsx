import { useEffect } from 'react'
import { initTelegramWebApp } from '../utils/telegram'
import { useLocale } from '../context/LocaleContext.jsx'

const Header = ({ title, subtitle, onLogout }) => {
  const { locale, toggleLocale, t } = useLocale()

  useEffect(() => {
    initTelegramWebApp()
  }, [])

  return (
    <header className="mb-6">
      <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.35em] text-white/45">
        <span>{subtitle}</span>
        <button
          onClick={toggleLocale}
          className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.55rem] font-semibold text-white transition hover:bg-white/15"
        >
          {locale === 'ru' ? 'RU / EN' : 'EN / RU'}
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-sm text-white/45">{t('brand.welcome')}</p>
          <h1 className="text-3xl font-semibold leading-tight text-white">{title}</h1>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-white/20"
          >
            {t('brand.logout')}
          </button>
        )}
      </div>
      <div className="mt-4 h-px w-full bg-gradient-to-r from-dash-accent/40 via-white/10 to-transparent" />
    </header>
  )
}

export default Header

