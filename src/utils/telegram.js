import WebApp from '@twa-dev/sdk'

/**
 * Инициализация Telegram WebApp
 */
export const initTelegramWebApp = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    WebApp.ready()
    WebApp.expand()
    
    // Настройка цветов темы
    const themeParams = WebApp.themeParams
    WebApp.setHeaderColor('#667eea')
    WebApp.setBackgroundColor('#667eea')
    
    // Включение вибрации при клике (опционально)
    WebApp.enableClosingConfirmation()
    
    // Логирование для отладки
    console.log('Telegram WebApp initialized:', {
      version: WebApp.version,
      platform: WebApp.platform,
      colorScheme: WebApp.colorScheme,
      themeParams,
    })
    
    return WebApp
  }
  
  // Для локальной разработки
  console.warn('Telegram WebApp не обнаружен. Работаем в режиме разработки.')
  return null
}

/**
 * Проверка, запущено ли приложение в Telegram
 */
export const isTelegramWebApp = () => {
  return typeof window !== 'undefined' && 
         window.Telegram?.WebApp !== undefined
}

/**
 * Получение данных пользователя из Telegram
 */
export const getTelegramUser = () => {
  if (isTelegramWebApp()) {
    return WebApp.initDataUnsafe?.user || null
  }
  return null
}

/**
 * Показ алерта через Telegram WebApp
 */
export const showAlert = (message) => {
  if (isTelegramWebApp() && WebApp.showAlert) {
    WebApp.showAlert(message)
  } else {
    alert(message)
  }
}

/**
 * Показ подтверждения через Telegram WebApp
 */
export const showConfirm = (message) => {
  if (isTelegramWebApp() && WebApp.showConfirm) {
    return new Promise((resolve) => {
      WebApp.showConfirm(message, (confirmed) => {
        resolve(confirmed)
      })
    })
  } else {
    return Promise.resolve(confirm(message))
  }
}

