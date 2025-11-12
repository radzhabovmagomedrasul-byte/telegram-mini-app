#!/bin/bash

# Скрипт автоматического деплоя на Vercel
# Для Linux/Mac

echo "🚀 Начинаем деплой на Vercel..."

# Проверка авторизации в Vercel
echo ""
echo "📋 Проверка авторизации в Vercel..."
vercel whoami > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Вы не авторизованы в Vercel"
    echo ""
    echo "🔐 Выполняем авторизацию..."
    echo "Откроется браузер для входа в аккаунт Vercel"
    vercel login
    
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ Ошибка авторизации. Пожалуйста, выполните 'vercel login' вручную"
        exit 1
    fi
fi

echo "✅ Авторизация успешна"

# Сборка проекта
echo ""
echo "📦 Сборка проекта..."
npm run build

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Ошибка сборки проекта"
    exit 1
fi

echo "✅ Проект успешно собран"

# Деплой на Vercel
echo ""
echo "🚀 Деплой на Vercel..."
vercel --prod --yes

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Ошибка деплоя"
    exit 1
fi

echo ""
echo "✅ Проект успешно задеплоен!"
echo ""
echo "📝 Следующие шаги:"
echo "1. Скопируйте URL из вывода выше"
echo "2. Откройте @BotFather в Telegram"
echo "3. Выполните команду /newapp"
echo "4. Укажите URL вашего приложения"

