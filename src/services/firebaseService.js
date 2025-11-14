import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, get, remove, onValue, off } from 'firebase/database'

// Firebase конфигурация (замените на ваши данные)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'your-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'your-project.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://your-project-default-rtdb.firebaseio.com/',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'your-project-id',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'your-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'your-app-id'
}

// Инициализация Firebase
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

/**
 * Сохранение данных пользователя в Firebase
 */
export const saveUserData = async (userId, data) => {
  try {
    const userRef = ref(database, `users/${userId}`)
    await set(userRef, {
      ...data,
      lastSync: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    })
    return true
  } catch (error) {
    console.error('Error saving user data:', error)
    throw error
  }
}

/**
 * Получение данных пользователя из Firebase
 */
export const getUserData = async (userId) => {
  try {
    const userRef = ref(database, `users/${userId}`)
    const snapshot = await get(userRef)
    return snapshot.exists() ? snapshot.val() : null
  } catch (error) {
    console.error('Error getting user data:', error)
    throw error
  }
}

/**
 * Удаление данных пользователя из Firebase
 */
export const deleteUserData = async (userId) => {
  try {
    const userRef = ref(database, `users/${userId}`)
    await remove(userRef)
    return true
  } catch (error) {
    console.error('Error deleting user data:', error)
    throw error
  }
}

/**
 * Подписка на изменения данных пользователя
 */
export const subscribeToUserData = (userId, callback) => {
  const userRef = ref(database, `users/${userId}`)
  onValue(userRef, (snapshot) => {
    const data = snapshot.exists() ? snapshot.val() : null
    callback(data)
  })
  
  return () => off(userRef)
}

/**
 * Обновление времени последней активности
 */
export const updateLastActivity = async (userId) => {
  try {
    const userRef = ref(database, `users/${userId}/lastActivity`)
    await set(userRef, new Date().toISOString())
  } catch (error) {
    console.error('Error updating last activity:', error)
  }
}

/**
 * Проверка и удаление неактивных пользователей (вызывается на сервере)
 */
export const checkInactiveUsers = async () => {
  try {
    const usersRef = ref(database, 'users')
    const snapshot = await get(usersRef)
    
    if (!snapshot.exists()) return
    
    const users = snapshot.val()
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    
    const inactiveUsers = []
    
    for (const [userId, userData] of Object.entries(users)) {
      if (userData.lastActivity) {
        const lastActivity = new Date(userData.lastActivity)
        if (lastActivity < oneYearAgo) {
          inactiveUsers.push(userId)
        }
      }
    }
    
    // Удаление неактивных пользователей
    for (const userId of inactiveUsers) {
      await deleteUserData(userId)
    }
    
    return inactiveUsers.length
  } catch (error) {
    console.error('Error checking inactive users:', error)
    throw error
  }
}


export { database }

