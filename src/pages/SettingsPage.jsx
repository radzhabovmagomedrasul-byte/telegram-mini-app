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
  const panelClass =
    'rounded-[28px] border border-white/10 bg-[#111216] p-6 space-y-4 text-white shadow-[0_18px_45px_rgba(0,0,0,0.55)]'
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
    <div className="space-y-6 pb-28 text-white">
      <section className={panelClass}>
        <h2 className="text-2xl font-semibold">{t('settings.themeTitle')}</h2>
        <p className="text-sm text-white/50">{t('settings.themeDescription')}</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#151720] px-4 py-3">
            <div>
              <p className="font-medium text-white">{t('settings.autoTheme')}</p>
              <p className="text-sm text-white/45">{t('settings.autoThemeDescription')}</p>
            </div>
            <button
              onClick={() => setAutoTheme(!autoTheme)}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] ${
                autoTheme ? 'bg-green-500 text-white' : 'bg-white/10 text-white/70'
              }`}
            >
              {autoTheme ? t('settings.toggleOn') : t('settings.toggleOff')}
            </button>
          </div>
          
          {!autoTheme && (
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#151720] px-4 py-3">
              <div>
                <p className="font-medium text-white">
                  {theme === 'light' ? t('settings.manualLight') : t('settings.manualDark')}
                </p>
                <p className="text-sm text-white/45">{t('settings.manualTheme')}</p>
              </div>
              <button
                onClick={toggleTheme}
                className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white hover:bg-white/10"
              >
                {t('settings.toggleTheme')}
              </button>
            </div>
          )}
        </div>
      </section>

      <section className={panelClass}>
        <h2 className="text-2xl font-semibold">{t('settings.notificationsTitle')}</h2>
        <p className="text-sm text-white/50">{t('settings.notificationsDescription')}</p>
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#151720] px-4 py-3">
          <div>
            <p className="font-medium text-white">
              {`${t('settings.notificationsTitle')} ${
                notificationsEnabled ? t('settings.notificationsOn') : t('settings.notificationsOff')
              }`}
            </p>
            <p className="text-sm text-white/45">{t('settings.notificationsDescription')}</p>
          </div>
          <button
            onClick={() => setNotificationsEnabled((prev) => !prev)}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] ${
              notificationsEnabled ? 'bg-red-500/30 text-red-200' : 'bg-green-500 text-white'
            }`}
          >
            {notificationsEnabled ? t('settings.notificationsDisable') : t('settings.notificationsEnable')}
          </button>
        </div>
      </section>

      <section className={panelClass}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{t('settings.categoriesTitle')}</h2>
            <p className="text-sm text-white/50">{t('settings.categoriesDescription')}</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#151720] px-3 py-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder={t('settings.categoriesPlaceholder')}
              className="flex-1 bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
            />
            <button
              onClick={handleAddCategory}
              className="rounded-2xl bg-white/15 px-3 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-white hover:bg-white/25"
            >
              {t('settings.categoriesAdd')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category}
              className="flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-[#151720] px-3 py-2"
            >
              <span className="text-sm font-medium text-white">{category}</span>
              <button
                onClick={() => handleRemoveCategory(category)}
                className="text-xs text-red-300 hover:text-red-200"
              >
                {t('settings.categoriesDelete')}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className={panelClass}>
        <h2 className="text-2xl font-semibold">{t('settings.exportTitle')}</h2>
        <p className="text-sm text-white/50">{t('settings.exportDescription')}</p>
        
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <button
            onClick={handleExportJSON}
            className="rounded-2xl border border-white/10 bg-[#151720] px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.2em] text-white hover:bg-white/10"
          >
            {t('settings.exportJson')}
          </button>
          <button
            onClick={handleExportCSV}
            className="rounded-2xl border border-white/10 bg-[#151720] px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.2em] text-white hover:bg-white/10"
          >
            {t('settings.exportCsv')}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-2xl border border-white/10 bg-[#151720] px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.2em] text-white hover:bg-white/10"
          >
            {t('settings.importJson')}
          </button>
          <button
            onClick={() => csvInputRef.current?.click()}
            className="rounded-2xl border border-white/10 bg-[#151720] px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.2em] text-white hover:bg-white/10"
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

      <section className={panelClass}>
        <h2 className="text-2xl font-semibold">{t('settings.backupTitle')}</h2>
        <p className="text-sm text-white/50">{t('settings.backupDescription')}</p>
        
        <button
          onClick={handleBackupToFirebase}
          className="w-full rounded-2xl bg-white/15 px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-white/25"
        >
          {t('settings.backupButton')}
        </button>
      </section>

      <section className="rounded-[28px] border border-red-500/40 bg-[#2a0f13] p-6 space-y-4 text-white shadow-[0_18px_45px_rgba(0,0,0,0.55)]">
        <h2 className="text-2xl font-semibold text-red-200">{t('settings.dangerTitle')}</h2>
        <p className="text-sm text-red-200/80">{t('settings.dangerDescription')}</p>
        
        <button
          onClick={handleDeleteProfile}
          className="w-full rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-red-600"
        >
          {t('settings.dangerButton')}
        </button>
      </section>
    </div>
  )
}

export default SettingsPage


