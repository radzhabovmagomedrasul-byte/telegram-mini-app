import { useEffect } from 'react'
import { initTelegramWebApp } from '../utils/telegram'

const Header = ({ title }) => {
  useEffect(() => {
    // Инициализация Telegram WebApp
    initTelegramWebApp()
  }, [])

  return (
    <header className="bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-600 text-white p-5 shadow-xl">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center">{title}</h1>
        <p className="text-sm text-white/80 text-center mt-1">Управляйте своими финансами</p>
      </div>
    </header>
  )
}

export default Header

