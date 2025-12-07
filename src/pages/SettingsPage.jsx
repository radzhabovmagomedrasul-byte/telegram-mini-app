import { useState, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useCategories } from '../hooks/useCategories'
import { exportToJSON, exportToCSV, importFromJSON, importFromCSV } from '../services/exportImportService'
import { deleteUserData } from '../services/firebaseService'
import { syncToFirebase } from '../services/dataSyncService'
import { clearAllData, getOrCreateUserId } from '../services/localStorageService'
import { showAlert, showConfirm } from '../utils/telegram'
import { useLocale } from '../context/LocaleContext.jsx'

const SettingsPage = ({ userId }) => {
  const { theme, toggleTheme, autoTheme, setAutoTheme } = useTheme()
  const fileInputRef = useRef(null)
  const csvInputRef = useRef(null)
  const { categories, addCategory, removeCategory } = useCategories()
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage(
    'finance-notifications',
    true,
  )
  const [newCategory, setNewCategory] = useState('')
  const { t, locale } = useLocale()
  const inline = (ruText, enText) => (locale === 'ru' ? ruText : enText)

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      showAlert(inline('Введите название категории', 'Enter a category name'))
      return
    }

    addCategory(newCategory.trim())
    showAlert(inline('Категория добавлена', 'Category added'))
    setNewCategory('')
  }

  const handleRemoveCategory = (category) => {
    removeCategory(category)
    showAlert(inline('Категория удалена', 'Category removed'))
  }

  const handleExportJSON = () => {
    try {
      exportToJSON()
      showAlert(inline('Данные успешно экспортированы в JSON', 'Data exported to JSON'))
    } catch (error) {
      showAlert(inline('Ошибка при экспорте: ', 'Export error: ') + error.message)
    }
  }

  const handleExportCSV = () => {
    try {
      exportToCSV()
      showAlert(inline('Транзакции успешно экспортированы в CSV', 'Transactions exported to CSV'))
    } catch (error) {
      showAlert(inline('Ошибка при экспорте: ', 'Export error: ') + error.message)
    }
  }

  const handleImportJSON = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      await importFromJSON(file)
      showAlert(inline('Данные успешно импортированы из JSON', 'Data imported from JSON'))
      window.location.reload()
    } catch (error) {
      showAlert(inline('Ошибка при импорте: ', 'Import error: ') + error.message)
    }
    event.target.value = ''
  }

  const handleImportCSV = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      const count = await importFromCSV(file)
      showAlert(
        inline(`Импортировано ${count} транзакций из CSV`, `Imported ${count} transactions from CSV`),
      )
      window.location.reload()
    } catch (error) {
      showAlert(inline('Ошибка при импорте: ', 'Import error: ') + error.message)
    }
    event.target.value = ''
  }

  const handleBackupToFirebase = async () => {
    try {
      const currentUserId = userId || getOrCreateUserId()
      await syncToFirebase(currentUserId)
      showAlert(inline('Резервная копия успешно создана в Firebase', 'Backup created in Firebase'))
    } catch (error) {
      showAlert(inline('Ошибка при создании резервной копии: ', 'Backup error: ') + error.message)
    }
  }

  const handleDeleteProfile = async () => {
    const confirmed = await showConfirm(
      inline(
        'Вы уверены? Это действие удалит все ваши данные и не может быть отменено.',
        'Are you sure? This action removes all data and cannot be undone.',
      ),
    )
    if (!confirmed) return

    try {
      const currentUserId = userId || getOrCreateUserId()
      
      // Удаление из Firebase
      try {
        await deleteUserData(currentUserId)
      } catch (error) {
        console.error('Firebase delete error:', error)
      }
      
      // Удаление локальных данных
      clearAllData()
      
      showAlert(inline('Профиль успешно удален', 'Profile deleted'))
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      showAlert(inline('Ошибка при удалении профиля: ', 'Delete error: ') + error.message)
    }
  }

  return (
    <div className="space-y-4 pb-28 px-4">
      <section className="ios-card p-6 space-y-4">
        <div>
          <h2 className="text-[28px] font-semibold text-ios-text-primary">{t('settings.themeTitle')}</h2>
          <p className="text-[15px] text-ios-text-secondary mt-1">{t('settings.themeDescription')}</p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-ios-lg bg-ios-gray-5 px-4 py-3.5">
            <div className="flex-1">
              <p className="font-medium text-[17px] text-ios-text-primary">{t('settings.autoTheme')}</p>
              <p className="text-[15px] text-ios-text-secondary mt-0.5">{t('settings.autoThemeDescription')}</p>
            </div>
            <button
              onClick={() => setAutoTheme(!autoTheme)}
              className={`ios-button-press rounded-full w-12 h-7 px-1 transition-colors ${
                autoTheme ? 'bg-ios-green' : 'bg-ios-gray-4'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${autoTheme ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          
          {!autoTheme && (
            <div className="flex items-center justify-between rounded-ios-lg bg-ios-gray-5 px-4 py-3.5">
              <div className="flex-1">
                <p className="font-medium text-[17px] text-ios-text-primary">
                  {theme === 'light' ? t('settings.manualLight') : t('settings.manualDark')}
                </p>
                <p className="text-[15px] text-ios-text-secondary mt-0.5">{t('settings.manualTheme')}</p>
              </div>
              <button
                onClick={toggleTheme}
                className="ios-button-press rounded-ios-lg bg-ios-blue px-5 py-2.5 text-[15px] font-semibold text-white"
              >
                {t('settings.toggleTheme')}
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="ios-card p-6 space-y-4">
        <div>
          <h2 className="text-[28px] font-semibold text-ios-text-primary">{t('settings.notificationsTitle')}</h2>
          <p className="text-[15px] text-ios-text-secondary mt-1">{t('settings.notificationsDescription')}</p>
        </div>
        <div className="flex items-center justify-between rounded-ios-lg bg-ios-gray-5 px-4 py-3.5">
          <div className="flex-1">
            <p className="font-medium text-[17px] text-ios-text-primary">
              {t('settings.notificationsTitle')}
            </p>
            <p className="text-[15px] text-ios-text-secondary mt-0.5">{t('settings.notificationsDescription')}</p>
          </div>
          <button
            onClick={() => setNotificationsEnabled((prev) => !prev)}
            className={`ios-button-press rounded-full w-12 h-7 px-1 transition-colors ${
              notificationsEnabled ? 'bg-ios-green' : 'bg-ios-gray-4'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </section>

      <section className="ios-card p-6 space-y-4">
        <div>
          <h2 className="text-[28px] font-semibold text-ios-text-primary">{t('settings.categoriesTitle')}</h2>
          <p className="text-[15px] text-ios-text-secondary mt-1">{t('settings.categoriesDescription')}</p>
        </div>
        <div className="flex items-center gap-3 rounded-ios-lg bg-ios-gray-5 px-4 py-3">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder={t('settings.categoriesPlaceholder')}
            className="flex-1 bg-transparent text-[17px] text-ios-text-primary placeholder-ios-text-tertiary focus:outline-none"
            onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
          />
          <button
            onClick={handleAddCategory}
            className="ios-button-press rounded-ios-lg bg-ios-blue px-4 py-2.5 text-[15px] font-semibold text-white"
          >
            {t('settings.categoriesAdd')}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {categories.map((category) => (
            <div
              key={category}
              className="flex items-center justify-between gap-2 rounded-ios-lg bg-ios-gray-5 px-3 py-2.5"
            >
              <span className="text-[15px] font-medium text-ios-text-primary truncate">{category}</span>
              <button
                onClick={() => handleRemoveCategory(category)}
                className="ios-button-press text-[13px] text-ios-red flex-shrink-0"
              >
                {t('settings.categoriesDelete')}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="ios-card p-6 space-y-4">
        <div>
          <h2 className="text-[28px] font-semibold text-ios-text-primary">{t('settings.exportTitle')}</h2>
          <p className="text-[15px] text-ios-text-secondary mt-1">{t('settings.exportDescription')}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleExportJSON}
            className="ios-button-press rounded-ios-lg bg-ios-gray-5 px-4 py-3.5 text-left text-[15px] font-semibold text-ios-text-primary"
          >
            {t('settings.exportJson')}
          </button>
          <button
            onClick={handleExportCSV}
            className="ios-button-press rounded-ios-lg bg-ios-gray-5 px-4 py-3.5 text-left text-[15px] font-semibold text-ios-text-primary"
          >
            {t('settings.exportCsv')}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="ios-button-press rounded-ios-lg bg-ios-gray-5 px-4 py-3.5 text-left text-[15px] font-semibold text-ios-text-primary"
          >
            {t('settings.importJson')}
          </button>
          <button
            onClick={() => csvInputRef.current?.click()}
            className="ios-button-press rounded-ios-lg bg-ios-gray-5 px-4 py-3.5 text-left text-[15px] font-semibold text-ios-text-primary"
          >
            {t('settings.importCsv')}
          </button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportJSON}
          className="hidden"
        />
        <input
          ref={csvInputRef}
          type="file"
          accept=".csv"
          onChange={handleImportCSV}
          className="hidden"
        />
      </section>

      <section className="ios-card p-6 space-y-4">
        <div>
          <h2 className="text-[28px] font-semibold text-ios-text-primary">{t('settings.backupTitle')}</h2>
          <p className="text-[15px] text-ios-text-secondary mt-1">{t('settings.backupDescription')}</p>
        </div>
        
        <button
          onClick={handleBackupToFirebase}
          className="ios-button-press w-full rounded-ios-lg bg-ios-blue px-4 py-3.5 text-[17px] font-semibold text-white"
        >
          {t('settings.backupButton')}
        </button>
      </section>

      <section className="ios-card p-6 space-y-4 border-2 border-ios-red/30">
        <div>
          <h2 className="text-[28px] font-semibold text-ios-red">{t('settings.dangerTitle')}</h2>
          <p className="text-[15px] text-ios-text-secondary mt-1">{t('settings.dangerDescription')}</p>
        </div>
        
        <button
          onClick={handleDeleteProfile}
          className="ios-button-press w-full rounded-ios-lg bg-ios-red px-4 py-3.5 text-[17px] font-semibold text-white"
        >
          {t('settings.dangerButton')}
        </button>
      </section>
    </div>
  )
}

export default SettingsPage


