import { useEffect } from 'react'
import { initTelegramWebApp } from '../utils/telegram'

const Header = ({ title, subtitle, onLogout }) => {
  useEffect(() => {
    // Инициализация Telegram WebApp
    initTelegramWebApp()
  }, [])

  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white p-6 shadow-2xl">
      {/* Декоративные элементы */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative max-w-4xl mx-auto flex items-start justify-between gap-4 z-10">
        <div>
          <h1 className="text-3xl font-black tracking-tight drop-shadow-lg">{title}</h1>
          <p className="text-sm text-white/90 mt-2 font-medium">
            {subtitle || 'Управляйте своими финансами'}
          </p>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="px-5 py-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white text-sm font-bold hover:bg-white/30 transition-all shadow-xl border border-white/30 hover:scale-105 active:scale-95"
          >
            Выйти
          </button>
        )}
      </div>
    </header>
  )
}

export default Header

