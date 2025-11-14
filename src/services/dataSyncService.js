import { saveUserData, getUserData, updateLastActivity as updateFirebaseActivity } from './firebaseService'
import {
  getTransactions,
  saveTransactions,
  getCategories,
  saveCategories,
  getSettings,
  saveSettings,
  getProfile,
  saveProfile,
  saveLastSync,
  getOrCreateUserId,
  exportAllData
} from './localStorageService'

/**
 * Синхронизация данных с Firebase
 */
export const syncToFirebase = async (userId) => {
  try {
    const localData = exportAllData()
    
    await saveUserData(userId, {
      transactions: localData.transactions,
      categories: localData.categories,
      settings: localData.settings,
      profile: localData.profile
    })
    
    saveLastSync(new Date().toISOString())
    return true
  } catch (error) {
    console.error('Error syncing to Firebase:', error)
    return false
  }
}

/**
 * Синхронизация данных из Firebase
 */
export const syncFromFirebase = async (userId) => {
  try {
    const firebaseData = await getUserData(userId)
    
    if (!firebaseData) {
      return false
    }
    
    // Объединяем данные: приоритет у локальных, если они новее
    const localData = exportAllData()
    const localLastSync = new Date(localData.lastSync || 0)
    const firebaseLastSync = new Date(firebaseData.lastSync || 0)
    
    if (firebaseLastSync > localLastSync) {
      // Данные из Firebase новее - используем их
      if (firebaseData.transactions) {
        saveTransactions(firebaseData.transactions)
      }
      if (firebaseData.categories) {
        saveCategories(firebaseData.categories)
      }
      if (firebaseData.settings) {
        saveSettings(firebaseData.settings)
      }
      if (firebaseData.profile) {
        saveProfile(firebaseData.profile)
      }
    } else {
      // Локальные данные новее - отправляем в Firebase
      await syncToFirebase(userId)
    }
    
    saveLastSync(new Date().toISOString())
    return true
  } catch (error) {
    console.error('Error syncing from Firebase:', error)
    return false
  }
}

/**
 * Автоматическая синхронизация (если включена в настройках)
 */
export const autoSync = async () => {
  const settings = getSettings()
  if (!settings.autoSync) {
    return false
  }
  
  const userId = getOrCreateUserId()
  await updateFirebaseActivity(userId)
  
  // Синхронизируем каждые 5 минут
  const lastSync = localStorage.getItem('finance_last_sync')
  if (lastSync) {
    const lastSyncDate = new Date(lastSync)
    const now = new Date()
    const diffMinutes = (now - lastSyncDate) / (1000 * 60)
    
    if (diffMinutes < 5) {
      return false // Синхронизация недавно была выполнена
    }
  }
  
  return await syncToFirebase(userId)
}

/**
 * Восстановление данных из Firebase
 */
export const restoreFromFirebase = async (userId) => {
  try {
    const firebaseData = await getUserData(userId)
    
    if (!firebaseData) {
      throw new Error('Данные не найдены в облаке')
    }
    
    if (firebaseData.transactions) {
      saveTransactions(firebaseData.transactions)
    }
    if (firebaseData.categories) {
      saveCategories(firebaseData.categories)
    }
    if (firebaseData.settings) {
      saveSettings(firebaseData.settings)
    }
    if (firebaseData.profile) {
      saveProfile(firebaseData.profile)
    }
    
    saveLastSync(new Date().toISOString())
    return true
  } catch (error) {
    console.error('Error restoring from Firebase:', error)
    throw error
  }
}

