import { useLocale } from '../../context/LocaleContext.jsx'

const TABS = [
  { id: 'history', labelKey: 'nav.history' },
  { id: 'add', labelKey: 'nav.add' },
  { id: 'stats', labelKey: 'nav.stats' },
  { id: 'ai', labelKey: 'nav.ai' },
  { id: 'settings', labelKey: 'nav.settings' },
]

const Icon = ({ id, active }) => {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    stroke: active ? '#ffffff' : 'rgba(255,255,255,0.45)',
  }

  switch (id) {
    case 'history':
      return (
        <svg {...common}>
          <path d="M3 11.5 12 4l9 7.5v8.5a1 1 0 0 1-1 1h-6.5v-5h-3v5H4a1 1 0 0 1-1-1z" />
        </svg>
      )
    case 'add':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      )
    case 'stats':
      return (
        <svg {...common}>
          <path d="M5 19V9m7 10V5m7 14v-7" />
          <path d="M4 19h16" stroke={active ? '#7af0c7' : 'rgba(255,255,255,0.4)'} />
        </svg>
      )
    case 'ai':
      return (
        <svg {...common}>
          <path d="m12 3 2 3.5 4 1-2.5 3.6.4 4.4L12 14.5 8.1 15.5l.4-4.4L6 7.5l4-1z" />
        </svg>
      )
    case 'settings':
    default:
      return (
        <svg {...common}>
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
          <path d="m19.4 15-.9 1.5.4 1.7-1.6 1.6-1.7-.4-1.5.9L12 19.5l-1.6.8-1.5-.9-1.7.4-1.6-1.6.4-1.7-.9-1.5.9-1.5-.4-1.7 1.6-1.6 1.7.4 1.5-.9L12 4.5l1.6-.8 1.5.9 1.7-.4 1.6 1.6-.4 1.7.9 1.5-.9 1.5.4 1.7z" />
        </svg>
      )
  }
}

const TabNavigation = ({ activeTab, onChange }) => {
  const { t } = useLocale()

  return (
    <nav>
      <div className="mx-auto rounded-2xl border border-gray-700/50 bg-gray-800/50 backdrop-blur-sm px-3 py-3 shadow-lg shadow-purple-500/10">
        <div className="grid grid-cols-5 gap-1">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                }`}
              >
                <Icon id={tab.id} active={isActive} />
                {t(tab.labelKey)}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default TabNavigation


