import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useCategories } from '../hooks/useCategories'
import { showAlert } from '../utils/telegram'

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme()
  const { categories, addCategory, removeCategory } = useCategories()
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage(
    'finance-notifications',
    true,
  )
  const [newCategory, setNewCategory] = useState('')

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      showAlert('Введите название категории')
      return
    }

    addCategory(newCategory.trim())
    showAlert('Категория добавлена')
    setNewCategory('')
  }

  const handleRemoveCategory = (category) => {
    removeCategory(category)
    showAlert('Категория удалена')
  }

  return (
    <div className="pb-24 space-y-6">
      <section className="mx-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-slate-700/50 p-6 space-y-4 animate-fade-in">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Тема интерфейса
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Переключайте светлую или темную тему для комфортной работы.
        </p>
        <div className="flex items-center justify-between bg-gray-100 dark:bg-slate-800 rounded-2xl px-4 py-3">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {theme === 'light' ? 'Светлая тема' : 'Темная тема'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              В любой момент можно изменить цветовую схему приложения.
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-2xl bg-indigo-500 text-white font-semibold shadow-lg hover:bg-indigo-600 transition-all"
          >
            Переключить
          </button>
        </div>
      </section>

      <section className="mx-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-slate-700/50 p-6 space-y-4 animate-fade-in">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Уведомления
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Получайте напоминания о контроле расходов (только в веб-версии).
        </p>
        <div className="flex items-center justify-between bg-gray-100 dark:bg-slate-800 rounded-2xl px-4 py-3">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              Уведомления {notificationsEnabled ? 'включены' : 'отключены'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Можно включить напоминания для финансовых привычек.
            </p>
          </div>
          <button
            onClick={() => setNotificationsEnabled((prev) => !prev)}
            className={`px-4 py-2 rounded-2xl font-semibold shadow-lg transition-all ${
              notificationsEnabled
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            {notificationsEnabled ? 'Отключить' : 'Включить'}
          </button>
        </div>
      </section>

      <section className="mx-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-slate-700/50 p-6 space-y-4 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Категории расходов
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Настройте категории под свои привычки — изменения сохраняются локально.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 rounded-2xl px-3 py-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Новая категория"
              className="bg-transparent outline-none text-sm text-gray-900 dark:text-white"
            />
            <button
              onClick={handleAddCategory}
              className="px-3 py-1 rounded-2xl bg-indigo-500 text-white text-sm font-medium shadow-lg hover:bg-indigo-600 transition-all"
            >
              Добавить
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((category) => (
            <div
              key={category}
              className="flex items-center justify-between gap-2 bg-gray-100 dark:bg-slate-800 rounded-2xl px-3 py-2"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {category}
              </span>
              <button
                onClick={() => handleRemoveCategory(category)}
                className="text-xs text-red-500 hover:text-red-600"
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default SettingsPage


