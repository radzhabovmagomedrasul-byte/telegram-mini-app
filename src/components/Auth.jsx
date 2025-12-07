import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useLocale } from '../context/LocaleContext.jsx'

const Auth = ({ onAuthSuccess }) => {
  const { t, locale } = useLocale()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        // Вход
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) {
          console.error('Sign in error:', error)
          throw error
        }
        
        if (data.user) {
          // onAuthSuccess будет вызван через onAuthStateChange в App.jsx
        }
      } else {
        // Регистрация
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        
        if (error) {
          console.error('Sign up error:', error)
          throw error
        }
        
        if (data.user) {
          // Если сессия создана сразу (email подтверждение отключено в Supabase)
          if (data.session) {
            // Автоматически входим - состояние обновится через onAuthStateChange
            // Небольшая задержка для гарантии обновления состояния
            setTimeout(() => {
              onAuthSuccess?.()
            }, 100)
          } else {
            // Требуется подтверждение email
            const message = locale === 'ru' 
              ? 'Регистрация успешна! Проверьте email для подтверждения аккаунта, затем войдите.' 
              : 'Registration successful! Please check your email to confirm your account, then sign in.'
            setError(message)
            setIsLogin(true)
            setEmail('')
            setPassword('')
          }
        } else {
          throw new Error(locale === 'ru' ? 'Не удалось создать пользователя' : 'Failed to create user')
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      // Более детальная обработка ошибок
      let errorMessage = error.message || (locale === 'ru' ? 'Произошла ошибка' : 'An error occurred')
      
      // Специфичные сообщения для разных типов ошибок
      if (error.message?.includes('email') || error.message?.includes('Email')) {
        errorMessage = locale === 'ru' 
          ? 'Ошибка с email адресом. Проверьте правильность ввода.'
          : 'Email error. Please check your email address.'
      } else if (error.message?.includes('password') || error.message?.includes('Password')) {
        errorMessage = locale === 'ru'
          ? 'Ошибка с паролем. Пароль должен содержать минимум 6 символов.'
          : 'Password error. Password must be at least 6 characters.'
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = locale === 'ru'
          ? 'Ошибка сети. Проверьте подключение к интернету.'
          : 'Network error. Please check your internet connection.'
      } else if (error.message?.includes('Load Failed') || error.message?.includes('Failed to load')) {
        errorMessage = locale === 'ru'
          ? 'Ошибка подключения к серверу. Проверьте настройки Supabase или попробуйте позже.'
          : 'Connection error. Please check Supabase settings or try again later.'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      style={{ 
        background: '#120F25'
      }}
      className="min-h-screen flex items-center justify-center p-4 relative"
    >
      {/* Decorative blurred circles for glass effect */}
      <div className="absolute top-20 left-10 size-64 bg-purple-600/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 right-10 size-72 bg-indigo-600/30 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 bg-violet-600/20 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-indigo-500/10 pointer-events-none"></div>
          <div className="relative mb-8 text-center">
            <h2 className="text-3xl font-semibold text-white mb-2">
              {isLogin ? (locale === 'ru' ? 'Вход' : 'Sign In') : (locale === 'ru' ? 'Регистрация' : 'Sign Up')}
            </h2>
            <p className="text-sm text-white/60 uppercase tracking-[0.2em]">
              {locale === 'ru' ? 'Добро пожаловать' : 'Welcome'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5 relative">
            <div>
              <label className="block text-[0.65rem] uppercase tracking-[0.3em] text-white/50 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border-2 border-white/10 text-white placeholder-white/30 focus:border-purple-500/50 focus:outline-none transition"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-[0.65rem] uppercase tracking-[0.3em] text-white/50 mb-2">
                {locale === 'ru' ? 'Пароль' : 'Password'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border-2 border-white/10 text-white placeholder-white/30 focus:border-purple-500/50 focus:outline-none transition"
                placeholder="••••••"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-dash-accent to-purple-600 text-white py-3.5 rounded-2xl font-semibold uppercase tracking-[0.2em] text-sm hover:from-dash-accent/90 hover:to-purple-600/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading 
                ? (locale === 'ru' ? 'Загрузка...' : 'Loading...') 
                : isLogin 
                  ? (locale === 'ru' ? 'Войти' : 'Sign In') 
                  : (locale === 'ru' ? 'Зарегистрироваться' : 'Sign Up')
              }
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError(null)
              }}
              className="text-sm text-white/60 hover:text-white transition uppercase tracking-[0.15em]"
            >
              {isLogin 
                ? (locale === 'ru' ? 'Нет аккаунта? Зарегистрироваться' : "Don't have an account? Sign Up")
                : (locale === 'ru' ? 'Уже есть аккаунт? Войти' : 'Already have an account? Sign In')
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth

