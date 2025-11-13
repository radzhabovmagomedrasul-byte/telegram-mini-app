const TABS = [
  { id: 'history', label: 'История расходов', icon: '🧾' },
  { id: 'add', label: 'Добавление', icon: '➕' },
  { id: 'stats', label: 'Статистика', icon: '📊' },
  { id: 'settings', label: 'Настройки', icon: '⚙️' },
]

const TabNavigation = ({ activeTab, onChange }) => {
  return (
    <nav className="sticky bottom-0 inset-x-0 z-50">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-t border-white/30 dark:border-slate-700/50 shadow-2xl">
        <div className="grid grid-cols-4 max-w-4xl mx-auto">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`relative flex flex-col items-center gap-1.5 py-4 text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <span className={`text-2xl transition-transform duration-300 ${
                  isActive ? 'scale-110' : 'scale-100'
                }`}>
                  {tab.icon}
                </span>
                <span className="text-xs">{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-12 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default TabNavigation


