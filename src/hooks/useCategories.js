import { useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'

const DEFAULT_CATEGORIES = [
  'Продукты',
  'Транспорт',
  'Жилье',
  'Развлечения',
  'Здоровье',
  'Счета',
  'Образование',
  'Подарки',
  'Прочее',
]

export const useCategories = () => {
  const [categories, setCategories] = useLocalStorage(
    'finance-categories',
    DEFAULT_CATEGORIES,
  )

  const normalizedCategories = useMemo(() => {
    if (!Array.isArray(categories)) {
      return DEFAULT_CATEGORIES
    }

    const merged = [...DEFAULT_CATEGORIES]
    categories.forEach((category) => {
      if (category && !merged.includes(category)) {
        merged.push(category)
      }
    })

    return merged
  }, [categories])

  const addCategory = (name) => {
    const trimmed = name?.trim()
    if (!trimmed) return

    setCategories((prev) => {
      const next = Array.isArray(prev) ? [...prev] : []
      if (!next.includes(trimmed)) {
        next.push(trimmed)
      }
      return next
    })
  }

  const removeCategory = (name) => {
    setCategories((prev) => {
      if (!Array.isArray(prev)) return DEFAULT_CATEGORIES
      return prev.filter((item) => item !== name)
    })
  }

  return {
    categories: normalizedCategories,
    addCategory,
    removeCategory,
  }
}



