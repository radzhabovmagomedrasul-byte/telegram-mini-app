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
      <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.35em] text-gray-400">
        <span>{subtitle}</span>
        <button
          onClick={toggleLocale}
          className="rounded-full border border-gray-700/50 bg-gray-800/50 px-3 py-1 text-[0.55rem] font-semibold text-white transition hover:bg-gray-700/50"
        >
          {locale === 'ru' ? 'RU / EN' : 'EN / RU'}
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{t('brand.welcome')}</p>
          <h1 className="text-3xl font-semibold leading-tight text-white">{title}</h1>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="rounded-2xl border border-gray-700/50 bg-gray-800/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-gray-700/50"
          >
            {t('brand.logout')}
          </button>
        )}
      </div>
      <div className="mt-4 h-px w-full bg-gradient-to-r from-blue-500/40 via-purple-500/30 to-transparent" />
    </header>
  )
}

export default Header

