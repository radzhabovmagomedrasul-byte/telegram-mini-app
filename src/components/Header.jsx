import { useEffect } from 'react'
import { initTelegramWebApp } from '../utils/telegram'
import { useLocale } from '../context/LocaleContext.jsx'

const Header = ({ title, subtitle, onLogout, onAssistantClick }) => {
  const { locale, toggleLocale, t } = useLocale()

  useEffect(() => {
    initTelegramWebApp()
  }, [])

  return (
    <header className="px-6 pt-12 pb-4 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        {/* Иконка уведомлений (колокольчик) */}
        <button className="size-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
        
        {/* Кнопка Assistant */}
        <button
          onClick={onAssistantClick || (() => {})}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors"
        >
          <div className="size-2 rounded-full bg-emerald-400"></div>
          <span className="text-white/90 text-sm">Ассистент</span>
        </button>
      </div>
    </header>
  )
}

export default Header

