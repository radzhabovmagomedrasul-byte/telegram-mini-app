import { useLocale } from '../../context/LocaleContext.jsx'
import { Home, CreditCard, Activity, User, Plus } from 'lucide-react'

const TABS = [
  { id: 'history', labelKey: 'nav.history', icon: Home },
  { id: 'stats', labelKey: 'nav.stats', icon: CreditCard },
  { id: 'add', labelKey: 'nav.add', icon: Plus },
  { id: 'ai', labelKey: 'nav.ai', icon: Activity },
  { id: 'settings', labelKey: 'nav.settings', icon: User },
]

const TabNavigation = ({ activeTab, onChange }) => {
  const { t } = useLocale()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50">
      <div className="bg-[#120F25]/95 backdrop-blur-xl border-t border-white/10">
        <div className="flex items-center justify-around py-4 max-w-2xl mx-auto px-6">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  isActive ? 'text-white' : 'text-white/40 hover:text-white/60'
                }`}
              >
                <IconComponent className="size-6" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs">{t(tab.labelKey)}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default TabNavigation


