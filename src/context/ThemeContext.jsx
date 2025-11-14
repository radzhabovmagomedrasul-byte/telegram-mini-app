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
  // Определение системной темы
  const getSystemTheme = () => {
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

  // Слушатель изменений системной темы
  useEffect(() => {
    if (!autoTheme) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      const newTheme = e.matches ? 'dark' : 'light'
      setTheme(newTheme)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
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


