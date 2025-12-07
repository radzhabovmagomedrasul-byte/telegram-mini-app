import { createContext, useContext, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
  autoTheme: true,
  setAutoTheme: () => {},
})

const THEME_STORAGE_KEY = 'finance-theme'

export const ThemeProvider = ({ children }) => {
  // Определение системной темы (приоритет Telegram, затем системная)
  const getSystemTheme = () => {
    // Проверяем тему Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const telegramTheme = window.Telegram.WebApp.colorScheme
      if (telegramTheme === 'dark' || telegramTheme === 'light') {
        return telegramTheme
      }
    }
    
    // Fallback на системную тему
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }

  const [theme, setTheme] = useLocalStorage(THEME_STORAGE_KEY, getSystemTheme())
  const [autoTheme, setAutoTheme] = useLocalStorage('finance-auto-theme', true)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    
    if (autoTheme) {
      const systemTheme = getSystemTheme()
      root.classList.add(systemTheme)
      setTheme(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme, autoTheme])

  // Слушатель изменений системной темы и темы Telegram
  useEffect(() => {
    if (!autoTheme) return

    // Слушатель изменений темы Telegram
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const handleTelegramThemeChange = () => {
        const telegramTheme = window.Telegram.WebApp.colorScheme
        if (telegramTheme === 'dark' || telegramTheme === 'light') {
          setTheme(telegramTheme)
        }
      }
      
      // Подписываемся на события изменения темы Telegram
      window.Telegram.WebApp.onEvent('themeChanged', handleTelegramThemeChange)
      
      // Слушатель системной темы (fallback)
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleSystemChange = (e) => {
        // Используем системную тему только если Telegram тема не определена
        if (!window.Telegram?.WebApp?.colorScheme) {
          const newTheme = e.matches ? 'dark' : 'light'
          setTheme(newTheme)
        }
      }

      mediaQuery.addEventListener('change', handleSystemChange)
      
      return () => {
        window.Telegram?.WebApp?.offEvent('themeChanged', handleTelegramThemeChange)
        mediaQuery.removeEventListener('change', handleSystemChange)
      }
    } else {
      // Fallback на системную тему, если Telegram не доступен
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e) => {
        const newTheme = e.matches ? 'dark' : 'light'
        setTheme(newTheme)
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [autoTheme, setTheme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, autoTheme, setAutoTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}


