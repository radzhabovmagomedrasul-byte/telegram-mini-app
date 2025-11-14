import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { LocaleProvider } from './context/LocaleContext.jsx'
import { initTelegramWebApp } from './utils/telegram'
import './index.css'

// Инициализация Telegram WebApp при загрузке
initTelegramWebApp()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LocaleProvider>
      <App />
    </LocaleProvider>
  </React.StrictMode>,
)

