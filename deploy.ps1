# Скрипт автоматического деплоя на Vercel
# Для Windows PowerShell

Write-Host "🚀 Начинаем деплой на Vercel..." -ForegroundColor Green

# Проверка авторизации в Vercel
Write-Host "`n📋 Проверка авторизации в Vercel..." -ForegroundColor Yellow
$vercelAuth = vercel whoami 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Вы не авторизованы в Vercel" -ForegroundColor Red
    Write-Host "`n🔐 Выполняем авторизацию..." -ForegroundColor Yellow
    Write-Host "Откроется браузер для входа в аккаунт Vercel" -ForegroundColor Cyan
    vercel login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n❌ Ошибка авторизации. Пожалуйста, выполните 'vercel login' вручную" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Авторизация успешна" -ForegroundColor Green

# Сборка проекта
Write-Host "`n📦 Сборка проекта..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Ошибка сборки проекта" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Проект успешно собран" -ForegroundColor Green

# Деплой на Vercel
Write-Host "`n🚀 Деплой на Vercel..." -ForegroundColor Yellow
vercel --prod --yes

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Ошибка деплоя" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Проект успешно задеплоен!" -ForegroundColor Green
Write-Host "`n📝 Следующие шаги:" -ForegroundColor Cyan
Write-Host "1. Скопируйте URL из вывода выше" -ForegroundColor White
Write-Host "2. Откройте @BotFather в Telegram" -ForegroundColor White
Write-Host "3. Выполните команду /newapp" -ForegroundColor White
Write-Host "4. Укажите URL вашего приложения" -ForegroundColor White

