import { useLocale } from '../../context/LocaleContext.jsx'
import { Home, BarChart3, Plus, Bot, User } from 'lucide-react'

const TABS = [
  { id: 'history', labelKey: 'nav.history', icon: Home },
  { id: 'stats', labelKey: 'nav.stats', icon: BarChart3 },
  { id: 'add', labelKey: 'nav.add', icon: Plus },
  { id: 'ai', labelKey: 'nav.ai', icon: Bot },
  { id: 'settings', labelKey: 'nav.settings', icon: User },
]

const TabNavigation = ({ activeTab, onChange }) => {
  const { t } = useLocale()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50">
      <div className="bg-[#120F25]/95 backdrop-blur-xl border-t border-white/10">
        <div className="flex items-center justify-around py-3 max-w-2xl mx-auto px-6">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`flex flex-col items-center gap-1.5 transition-all ${
                  isActive ? 'text-white' : 'text-white/40 hover:text-white/60'
                }`}
              >
                <IconComponent className="size-7" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs font-medium">{t(tab.labelKey)}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default TabNavigation


