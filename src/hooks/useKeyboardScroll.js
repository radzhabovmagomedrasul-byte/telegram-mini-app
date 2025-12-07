import { useEffect, useRef } from 'react'

/**
 * Хук для автоматического скролла к активному полю ввода при появлении клавиатуры
 */
export const useKeyboardScroll = () => {
  const inputRef = useRef(null)

  useEffect(() => {
    const handleFocus = (e) => {
      const target = e.target
      
      // Проверяем, является ли элемент input, textarea или select
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        // Небольшая задержка для того, чтобы клавиатура успела появиться
        setTimeout(() => {
          // Прокручиваем к элементу с отступом сверху
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          })
          
          // Дополнительная проверка для мобильных устройств
          // Прокручиваем родительский контейнер, если элемент не виден
          const rect = target.getBoundingClientRect()
          const viewportHeight = window.innerHeight || window.visualViewport?.height || 0
          const keyboardHeight = viewportHeight < window.screen.height * 0.75 ? window.screen.height - viewportHeight : 0
          
          if (rect.bottom > viewportHeight - keyboardHeight - 20) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'end',
              inline: 'nearest',
            })
          }
        }, 300)
      }
    }

    // Добавляем обработчик для всех элементов формы
    document.addEventListener('focusin', handleFocus)

    return () => {
      document.removeEventListener('focusin', handleFocus)
    }
  }, [])

  return inputRef
}

/**
 * Хук для отслеживания изменений viewport при появлении/скрытии клавиатуры
 */
export const useViewportResize = () => {
  useEffect(() => {
    const handleResize = () => {
      // При изменении размера viewport (появление клавиатуры) прокручиваем к активному элементу
      const activeElement = document.activeElement
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'SELECT')) {
        setTimeout(() => {
          activeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          })
        }, 100)
      }
    }

    // Используем visualViewport API если доступен (для мобильных устройств)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      return () => {
        window.visualViewport?.removeEventListener('resize', handleResize)
      }
    } else {
      // Fallback для старых браузеров
      window.addEventListener('resize', handleResize)
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])
}

/**
 * Хук для обработки фокуса на конкретном элементе
 */
export const useInputFocus = () => {
  const handleFocus = (e) => {
    const target = e.target
    
    setTimeout(() => {
      // Используем visualViewport если доступен (для мобильных устройств)
      const viewport = window.visualViewport || window
      const viewportHeight = viewport.height || window.innerHeight
      
      const rect = target.getBoundingClientRect()
      const elementBottom = rect.bottom
      const elementTop = rect.top
      
      // Если элемент находится в нижней части экрана (где может быть клавиатура)
      if (elementBottom > viewportHeight * 0.6) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        })
      } else if (elementTop < 100) {
        // Если элемент слишком высоко, прокручиваем к нему
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        })
      }
    }, 100)
  }

  return handleFocus
}

