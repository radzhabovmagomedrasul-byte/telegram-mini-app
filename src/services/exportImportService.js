import Papa from 'papaparse'
import { exportAllData, importAllData, getTransactions, saveTransactions } from './localStorageService'

/**
 * Экспорт данных в JSON
 */
export const exportToJSON = () => {
  const data = exportAllData()
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `finance_backup_${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Импорт данных из JSON
 */
export const importFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        const success = importAllData(data)
        if (success) {
          resolve(true)
        } else {
          reject(new Error('Ошибка при импорте данных'))
        }
      } catch (error) {
        reject(new Error('Неверный формат JSON файла'))
      }
    }
    reader.onerror = () => reject(new Error('Ошибка чтения файла'))
    reader.readAsText(file)
  })
}

/**
 * Экспорт транзакций в CSV
 */
export const exportToCSV = () => {
  const transactions = getTransactions()
  
  if (transactions.length === 0) {
    throw new Error('Нет данных для экспорта')
  }
  
  // Преобразуем транзакции в формат CSV
  const csvData = transactions.map(t => ({
    Дата: t.created_at ? new Date(t.created_at).toLocaleDateString('ru-RU') : '',
    Тип: t.type === 'income' ? 'Доход' : 'Расход',
    Сумма: t.amount,
    Категория: t.category || 'Прочее',
    Комментарий: t.comment || ''
  }))
  
  const csv = Papa.unparse(csvData)
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Импорт транзакций из CSV
 */
export const importFromCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const transactions = results.data.map(row => {
            // Парсим дату
            let date = new Date()
            if (row['Дата']) {
              const dateParts = row['Дата'].split('.')
              if (dateParts.length === 3) {
                date = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]))
              }
            }
            
            return {
              id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: row['Тип'] === 'Доход' ? 'income' : 'expense',
              amount: parseFloat(row['Сумма']) || 0,
              category: row['Категория'] || 'Прочее',
              comment: row['Комментарий'] || '',
              created_at: date.toISOString(),
              description: JSON.stringify({
                category: row['Категория'] || 'Прочее',
                comment: row['Комментарий'] || ''
              })
            }
          })
          
          // Получаем существующие транзакции и добавляем новые
          const existingTransactions = getTransactions()
          const allTransactions = [...existingTransactions, ...transactions]
          
          // Сохраняем
          saveTransactions(allTransactions)
          
          resolve(transactions.length)
        } catch (error) {
          reject(new Error('Ошибка при обработке CSV файла: ' + error.message))
        }
      },
      error: (error) => {
        reject(new Error('Ошибка при чтении CSV файла: ' + error.message))
      }
    })
  })
}

