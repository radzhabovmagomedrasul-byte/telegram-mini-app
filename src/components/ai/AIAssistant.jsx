import { useState, useEffect } from 'react'
import { AIAssistant as AIService } from '../../services/aiAssistantService'
import { showAlert } from '../../utils/telegram'
import { useLocale } from '../../context/LocaleContext.jsx'

const AIAssistant = () => {
  const { t, locale } = useLocale()
  const [advices, setAdvices] = useState([])
  const [loading, setLoading] = useState(true)
  const [comparison, setComparison] = useState(null)
  const [categoryAnalysis, setCategoryAnalysis] = useState(null)

  useEffect(() => {
    loadAnalysis()
  }, [])

  const loadAnalysis = () => {
    setLoading(true)
    try {
      const generatedAdvices = AIService.generateAdvice()
      setAdvices(generatedAdvices.filter(a => a !== null))
      
      const comp = AIService.compareWithPreviousMonth()
      setComparison(comp)
      
      const catAnalysis = AIService.analyzeByCategories('month')
      setCategoryAnalysis(catAnalysis)
    } catch (error) {
      console.error('Error loading AI analysis:', error)
      showAlert(locale === 'ru' ? 'Ошибка при загрузке анализа' : 'Error loading analysis')
    } finally {
      setLoading(false)
    }
  }

  const panelClass = 'rounded-[28px] border border-white/10 bg-gradient-to-b from-[#1a1c23] via-[#0e1015] to-[#050608] p-6 shadow-dash-neon'

  if (loading) {
    return (
      <div className={`${panelClass} animate-fade-in`}>
        <div className="text-center py-8 text-white/40">
          {locale === 'ru' ? 'Анализ данных...' : 'Analyzing data...'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10 text-white">
      <section className={`${panelClass} space-y-5`}>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-dash-accent to-purple-600 text-2xl">
            🤖
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">
              {locale === 'ru' ? 'AI-Помощник' : 'AI Assistant'}
            </h2>
            <p className="text-sm text-white/50 uppercase tracking-[0.2em]">
              {locale === 'ru' ? 'Анализ ваших финансов' : 'Financial analysis'}
            </p>
          </div>
        </div>

        {advices.length > 0 && (
          <div className="space-y-3">
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/35">
              {locale === 'ru' ? 'Персональные советы' : 'Personal advice'}
            </p>
            {advices.map((advice, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-[#151720] p-4"
              >
                <p className="text-sm text-white/80 leading-relaxed">
                  {advice}
                </p>
              </div>
            ))}
          </div>
        )}

        {comparison && (
          <div className="rounded-2xl border border-white/10 bg-[#151720] p-4">
            <h3 className="mb-4 font-semibold text-white">
              {locale === 'ru' ? 'Сравнение с прошлым месяцем' : 'Comparison with previous month'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-[#1a1c23] p-3">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/40">
                  {locale === 'ru' ? 'Текущий месяц' : 'Current month'}
                </p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {comparison.currentTotal.toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US')} ₽
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#1a1c23] p-3">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/40">
                  {locale === 'ru' ? 'Прошлый месяц' : 'Previous month'}
                </p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {comparison.previousTotal.toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US')} ₽
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-white/10 bg-[#1a1c23] p-3">
              <p className={`text-sm font-semibold ${
                comparison.diff > 0 ? 'text-dash-negative' : 'text-dash-positive'
              }`}>
                {comparison.diff > 0 ? '+' : ''}{comparison.diff.toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US')} ₽
                ({comparison.percentChange > 0 ? '+' : ''}{comparison.percentChange.toFixed(1)}%)
              </p>
            </div>
          </div>
        )}

        {categoryAnalysis && categoryAnalysis.categories.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-[#151720] p-4">
            <h3 className="mb-4 font-semibold text-white">
              {locale === 'ru' ? 'Топ категории расходов' : 'Top expense categories'}
            </h3>
            <div className="space-y-3">
              {categoryAnalysis.categories.slice(0, 5).map((cat, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">
                      {cat.category}
                    </span>
                    <span className="text-sm font-semibold text-white/80">
                      {cat.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#1a1c23]">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-dash-accent to-purple-600 transition-all"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={loadAnalysis}
          className="w-full rounded-2xl bg-gradient-to-r from-dash-accent to-purple-600 py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-lg transition hover:from-dash-accent/90 hover:to-purple-600/90"
        >
          {locale === 'ru' ? 'Обновить анализ' : 'Refresh analysis'}
        </button>
      </section>
    </div>
  )
}

export default AIAssistant

