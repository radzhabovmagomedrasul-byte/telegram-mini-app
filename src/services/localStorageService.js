/**
 * Сервис для работы с локальным хранилищем
 */

const STORAGE_KEYS = {
  USER_ID: 'finance_user_id',
  TRANSACTIONS: 'finance_transactions',
  CATEGORIES: 'finance_categories',
  SETTINGS: 'finance_settings',
  PROFILE: 'finance_profile',
  LAST_SYNC: 'finance_last_sync'
}

/**
 * Генерация уникального ID пользователя
 */
export const generateUserId = () => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Получение или создание ID пользователя
 */
export const getOrCreateUserId = () => {
  let userId = localStorage.getItem(STORAGE_KEYS.USER_ID)
  if (!userId) {
    userId = generateUserId()
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId)
    // Создаем начальный профиль
    const profile = {
      id: userId,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    }
    saveProfile(profile)
  }
  return userId
}

/**
 * Сохранение транзакций
 */
export const saveTransactions = (transactions) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions))
    return true
  } catch (error) {
    console.error('Error saving transactions:', error)
    return false
  }
}

/**
 * Получение транзакций
 */
export const getTransactions = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error getting transactions:', error)
    return []
  }
}

/**
 * Сохранение категорий
 */
export const saveCategories = (categories) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
    return true
  } catch (error) {
    console.error('Error saving categories:', error)
    return false
  }
}

/**
 * Получение категорий
 */
export const getCategories = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error getting categories:', error)
    return []
  }
}

/**
 * Сохранение настроек
 */
export const saveSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
    return true
  } catch (error) {
    console.error('Error saving settings:', error)
    return false
  }
}

/**
 * Получение настроек
 */
export const getSettings = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    return data ? JSON.parse(data) : {
      theme: 'light',
      notifications: true,
      autoSync: true
    }
  } catch (error) {
    console.error('Error getting settings:', error)
    return {
      theme: 'light',
      notifications: true,
      autoSync: true
    }
  }
}

/**
 * Сохранение профиля
 */
export const saveProfile = (profile) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile))
    return true
  } catch (error) {
    console.error('Error saving profile:', error)
    return false
  }
}

/**
 * Получение профиля
 */
export const getProfile = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Error getting profile:', error)
    return null
  }
}

/**
 * Обновление времени последней активности
 */
export const updateLastActivity = () => {
  const profile = getProfile()
  if (profile) {
    profile.lastActivity = new Date().toISOString()
    saveProfile(profile)
  }
}

/**
 * Сохранение времени последней синхронизации
 */
export const saveLastSync = (timestamp) => {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp)
    return true
  } catch (error) {
    console.error('Error saving last sync:', error)
    return false
  }
}

/**
 * Получение времени последней синхронизации
 */
export const getLastSync = () => {
  return localStorage.getItem(STORAGE_KEYS.LAST_SYNC) || null
}

/**
 * Удаление всех данных пользователя
 */
export const clearAllData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    return true
  } catch (error) {
    console.error('Error clearing data:', error)
    return false
  }
}

/**
 * Экспорт всех данных
 */
export const exportAllData = () => {
  return {
    userId: localStorage.getItem(STORAGE_KEYS.USER_ID),
    transactions: getTransactions(),
    categories: getCategories(),
    settings: getSettings(),
    profile: getProfile(),
    lastSync: getLastSync(),
    exportDate: new Date().toISOString()
  }
}

/**
 * Импорт данных
 */
export const importAllData = (data) => {
  try {
    if (data.userId) {
      localStorage.setItem(STORAGE_KEYS.USER_ID, data.userId)
    }
    if (data.transactions) {
      saveTransactions(data.transactions)
    }
    if (data.categories) {
      saveCategories(data.categories)
    }
    if (data.settings) {
      saveSettings(data.settings)
    }
    if (data.profile) {
      saveProfile(data.profile)
    }
    if (data.lastSync) {
      saveLastSync(data.lastSync)
    }
    return true
  } catch (error) {
    console.error('Error importing data:', error)
    return false
  }
}

