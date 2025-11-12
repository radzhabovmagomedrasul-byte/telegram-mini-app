# 🚀 Быстрый деплой на Vercel

## Вариант 1: Деплой через Vercel CLI (Рекомендуется)

### Шаг 1: Авторизация в Vercel

Выполните команду в терминале:

```bash
vercel login
```

Эта команда откроет браузер для авторизации. Войдите в свой аккаунт Vercel (или создайте новый на https://vercel.com).

### Шаг 2: Деплой проекта

После авторизации выполните:

```bash
vercel --prod
```

Или используйте автоматический скрипт:

```bash
npm run deploy
```

---

## Вариант 2: Деплой через веб-интерфейс Vercel

### Шаг 1: Подготовка репозитория GitHub

1. Создайте репозиторий на GitHub
2. Загрузите код в репозиторий:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

### Шаг 2: Импорт проекта в Vercel

1. Откройте https://vercel.com
2. Нажмите "Add New..." → "Project"
3. Импортируйте ваш GitHub репозиторий
4. Vercel автоматически определит настройки проекта
5. Нажмите "Deploy"

### Шаг 3: Получение URL

После деплоя вы получите URL вида: `https://your-app.vercel.app`

---

## Вариант 3: Быстрый деплой через скрипт

Используйте готовый скрипт `deploy.ps1` (для Windows) или `deploy.sh` (для Linux/Mac):

### Windows (PowerShell):

```powershell
.\deploy.ps1
```

### Linux/Mac (Bash):

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📝 После деплоя

### 1. Получите URL приложения

После успешного деплоя вы получите URL вида:
- `https://your-app.vercel.app` (продакшен)
- `https://your-app-git-main.vercel.app` (превью)

### 2. Настройте Telegram Bot

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте команду `/newapp`
3. Выберите вашего бота
4. Укажите:
   - **Title:** Учет финансов
   - **Short name:** finance
   - **Web App URL:** `https://your-app.vercel.app`

### 3. Проверьте работу

1. Откройте вашего бота в Telegram
2. Нажмите на кнопку с Mini-App
3. Приложение должно открыться!

---

## 🔧 Настройка переменных окружения (опционально)

Если вы используете переменные окружения, добавьте их в Vercel:

1. Откройте проект в Vercel Dashboard
2. Перейдите в Settings → Environment Variables
3. Добавьте переменные:
   - `VITE_SUPABASE_URL` (если используете)
   - `VITE_SUPABASE_ANON_KEY` (если используете)

**Примечание:** В проекте уже настроены значения по умолчанию в `supabaseClient.js`, поэтому это необязательно.

---

## ✅ Готово!

Ваше приложение задеплоено и готово к использованию!

