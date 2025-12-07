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

  if (loading) {
    return (
      <div className="ios-card mx-4 p-6 animate-fade-in">
        <div className="text-center py-12 text-ios-text-secondary text-[15px]">
          {locale === 'ru' ? 'Анализ данных...' : 'Analyzing data...'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-10 px-4">
      <section className="ios-card p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-ios-lg bg-ios-blue/10 text-3xl">
            🤖
          </div>
          <div>
            <h2 className="text-[28px] font-semibold text-ios-text-primary">
              {locale === 'ru' ? 'AI-Помощник' : 'AI Assistant'}
            </h2>
            <p className="text-[15px] text-ios-text-secondary mt-1">
              {locale === 'ru' ? 'Анализ ваших финансов' : 'Financial analysis'}
            </p>
          </div>
        </div>

        {advices.length > 0 && (
          <div className="space-y-3">
            <p className="text-[15px] font-medium text-ios-text-secondary mb-2">
              {locale === 'ru' ? 'Персональные советы' : 'Personal advice'}
            </p>
            {advices.map((advice, index) => (
              <div
                key={index}
                className="rounded-ios-lg bg-ios-gray-5 p-4"
              >
                <p className="text-[15px] text-ios-text-primary leading-relaxed">
                  {advice}
                </p>
              </div>
            ))}
          </div>
        )}

        {comparison && (
          <div className="rounded-ios-lg bg-ios-gray-5 p-5">
            <h3 className="mb-4 text-[20px] font-semibold text-ios-text-primary">
              {locale === 'ru' ? 'Сравнение с прошлым месяцем' : 'Comparison with previous month'}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-ios-lg bg-ios-bg-tertiary p-4">
                <p className="text-[13px] text-ios-text-secondary mb-2">
                  {locale === 'ru' ? 'Текущий месяц' : 'Current month'}
                </p>
                <p className="text-[24px] font-semibold text-ios-text-primary">
                  {comparison.currentTotal.toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US')} ₽
                </p>
              </div>
              <div className="rounded-ios-lg bg-ios-bg-tertiary p-4">
                <p className="text-[13px] text-ios-text-secondary mb-2">
                  {locale === 'ru' ? 'Прошлый месяц' : 'Previous month'}
                </p>
                <p className="text-[24px] font-semibold text-ios-text-primary">
                  {comparison.previousTotal.toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US')} ₽
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-ios-lg bg-ios-bg-tertiary p-4">
              <p className={`text-[17px] font-semibold ${
                comparison.diff > 0 ? 'text-ios-red' : 'text-ios-green'
              }`}>
                {comparison.diff > 0 ? '+' : ''}{comparison.diff.toLocaleString(locale === 'ru' ? 'ru-RU' : 'en-US')} ₽
                ({comparison.percentChange > 0 ? '+' : ''}{comparison.percentChange.toFixed(1)}%)
              </p>
            </div>
          </div>
        )}

        {categoryAnalysis && categoryAnalysis.categories.length > 0 && (
          <div className="rounded-ios-lg bg-ios-gray-5 p-5">
            <h3 className="mb-4 text-[20px] font-semibold text-ios-text-primary">
              {locale === 'ru' ? 'Топ категории расходов' : 'Top expense categories'}
            </h3>
            <div className="space-y-3">
              {categoryAnalysis.categories.slice(0, 5).map((cat, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] font-medium text-ios-text-primary">
                      {cat.category}
                    </span>
                    <span className="text-[15px] font-semibold text-ios-text-secondary">
                      {cat.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-ios-gray-5">
                    <div
                      className="h-2 rounded-full bg-ios-blue transition-all duration-500"
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
          className="ios-button-press w-full rounded-ios-lg bg-ios-blue py-4 text-[17px] font-semibold text-white shadow-ios-lg"
        >
          {locale === 'ru' ? 'Обновить анализ' : 'Refresh analysis'}
        </button>
      </section>
    </div>
  )
}

export default AIAssistant

