import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

const SuccessNotification = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Анимация появления
    setTimeout(() => setIsVisible(true), 10)
    
    // Автоматическое скрытие через 3 секунды
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300) // Ждем окончания анимации
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
      }`}
    >
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl px-6 py-4 shadow-2xl shadow-green-500/20 flex items-center gap-3 min-w-[280px] max-w-[90vw]">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-400" strokeWidth={2.5} style={{ animation: 'scale-in 0.3s ease-out' }} />
          </div>
        </div>
        <p className="text-white font-medium text-sm flex-1">{message}</p>
      </div>
    </div>
  )
}

export default SuccessNotification

