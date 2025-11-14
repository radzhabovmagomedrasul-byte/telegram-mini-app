import { useState, useEffect } from 'react'
import { AIAssistant as AIService } from '../../services/aiAssistantService'
import { showAlert } from '../../utils/telegram'

const AIAssistant = () => {
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
      showAlert('Ошибка при загрузке анализа')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-slate-700/50 p-6 animate-fade-in">
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Анализ данных...
        </div>
      </div>
    )
  }

  return (
    <div className="pb-24 space-y-6">
      <section className="mx-4 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-indigo-200/30 dark:border-indigo-700/50 p-6 space-y-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl">
            🤖
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              AI-Помощник
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Анализ ваших финансов и персональные советы
            </p>
          </div>
        </div>

        {advices.length > 0 && (
          <div className="space-y-3">
            {advices.map((advice, index) => (
              <div
                key={index}
                className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 border border-indigo-100 dark:border-slate-700"
              >
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {advice}
                </p>
              </div>
            ))}
          </div>
        )}

        {comparison && (
          <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 border border-indigo-100 dark:border-slate-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Сравнение с прошлым месяцем
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Текущий месяц</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {comparison.currentTotal.toLocaleString('ru-RU')} ₽
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Прошлый месяц</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {comparison.previousTotal.toLocaleString('ru-RU')} ₽
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
              <p className={`text-sm font-semibold ${
                comparison.diff > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
              }`}>
                {comparison.diff > 0 ? '+' : ''}{comparison.diff.toLocaleString('ru-RU')} ₽
                ({comparison.percentChange > 0 ? '+' : ''}{comparison.percentChange.toFixed(1)}%)
              </p>
            </div>
          </div>
        )}

        {categoryAnalysis && categoryAnalysis.categories.length > 0 && (
          <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-4 border border-indigo-100 dark:border-slate-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Топ категории расходов
            </h3>
            <div className="space-y-2">
              {categoryAnalysis.categories.slice(0, 5).map((cat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {cat.category}
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {cat.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={loadAnalysis}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-bold shadow-lg hover:shadow-xl transition-all"
        >
          Обновить анализ
        </button>
      </section>
    </div>
  )
}

export default AIAssistant

