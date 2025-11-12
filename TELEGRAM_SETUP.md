# Инструкция по настройке и тестированию Telegram Mini-App

## 📋 Содержание
1. [Подготовка проекта](#подготовка-проекта)
2. [Создание Telegram бота](#создание-telegram-бота)
3. [Настройка Mini-App](#настройка-mini-app)
4. [Локальное тестирование](#локальное-тестирование)
5. [Развертывание на хостинге](#развертывание-на-хостинге)
6. [Тестирование в Telegram](#тестирование-в-telegram)
7. [Решение проблем](#решение-проблем)

---

## 🚀 Подготовка проекта

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка Supabase

1. Откройте ваш проект Supabase: https://jkbspeccroxmslgzftdf.supabase.co
2. Перейдите в **SQL Editor**
3. Выполните SQL скрипт из файла `supabase-setup.sql`:

```sql
-- Создание таблицы transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включение Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Политики безопасности
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
```

### 3. Проверка подключения

Убедитесь, что в `src/supabaseClient.js` указаны правильные данные:

```javascript
const supabaseUrl = 'https://jkbspeccroxmslgzftdf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

---

## 🤖 Создание Telegram бота

### Шаг 1: Создание бота через BotFather

1. Откройте Telegram и найдите [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newbot`
3. Следуйте инструкциям:
   - Введите имя бота (например: "Мой Финансовый Трекер")
   - Введите username бота (должен заканчиваться на `bot`, например: `my_finance_tracker_bot`)
4. Сохраните **Bot Token**, который выдаст BotFather (он понадобится позже)

### Шаг 2: Настройка команд бота

Отправьте BotFather команду `/setcommands` и выберите вашего бота, затем отправьте:

```
start - Запустить приложение
help - Помощь
```

---

## 📱 Настройка Mini-App

### Вариант 1: Локальное тестирование (через ngrok)

#### 1. Установка ngrok

**Windows:**
```bash
# Скачайте с https://ngrok.com/download
# Или через Chocolatey:
choco install ngrok
```

**macOS:**
```bash
brew install ngrok
```

**Linux:**
```bash
# Скачайте с https://ngrok.com/download
# Или через snap:
snap install ngrok
```

#### 2. Запуск локального сервера

```bash
npm run dev
```

Приложение будет доступно на `http://localhost:3000`

#### 3. Создание туннеля через ngrok

В новом терминале:

```bash
ngrok http 3000
```

Вы получите публичный URL, например: `https://abc123.ngrok.io`

**⚠️ Важно:** Используйте HTTPS URL для Mini-App!

#### 4. Настройка Mini-App в BotFather

1. Откройте [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newapp`
3. Выберите вашего бота
4. Следуйте инструкциям:
   - **Title:** Учет финансов
   - **Short name:** finance (будет использоваться в URL)
   - **Description:** Приложение для учета личных финансов
   - **Photo:** (опционально) Загрузите иконку 640x360px
   - **GIF:** (опционально) Анимированная превью
   - **Web App URL:** `https://abc123.ngrok.io` (ваш ngrok URL)

#### 5. Тестирование

1. Откройте вашего бота в Telegram
2. Нажмите на кнопку "Menu" или отправьте `/start`
3. Нажмите на кнопку с вашим Mini-App
4. Приложение должно открыться!

---

### Вариант 2: Развертывание на хостинге

#### Рекомендуемые платформы:

1. **Vercel** (рекомендуется)
2. **Netlify**
3. **Cloudflare Pages**
4. **GitHub Pages** (только для статики)

#### Развертывание на Vercel:

1. **Установка Vercel CLI:**
```bash
npm i -g vercel
```

2. **Сборка проекта:**
```bash
npm run build
```

3. **Деплой:**
```bash
vercel
```

4. **Получение URL:**
После деплоя вы получите URL вида: `https://your-app.vercel.app`

5. **Настройка в BotFather:**
   - Отправьте `/newapp` в BotFather
   - Укажите URL: `https://your-app.vercel.app`

#### Развертывание на Netlify:

1. **Установка Netlify CLI:**
```bash
npm i -g netlify-cli
```

2. **Сборка и деплой:**
```bash
npm run build
netlify deploy --prod
```

3. **Настройка в BotFather:**
   - Используйте полученный URL

---

## 🧪 Локальное тестирование

### Тестирование без Telegram (браузер)

1. Запустите проект:
```bash
npm run dev
```

2. Откройте `http://localhost:3000` в браузере
3. Приложение будет работать, но без функций Telegram WebApp

### Тестирование с Telegram (через ngrok)

1. Запустите проект:
```bash
npm run dev
```

2. В другом терминале запустите ngrok:
```bash
ngrok http 3000
```

3. Скопируйте HTTPS URL из ngrok
4. Настройте Mini-App в BotFather с этим URL
5. Откройте бота в Telegram и протестируйте

---

## ✅ Тестирование в Telegram

### Чек-лист тестирования:

- [ ] **Авторизация:**
  - Регистрация нового пользователя
  - Вход существующего пользователя
  - Выход из аккаунта

- [ ] **Транзакции:**
  - Добавление дохода
  - Добавление расхода
  - Редактирование транзакции
  - Удаление транзакции

- [ ] **Фильтрация:**
  - Просмотр всех транзакций
  - Фильтр "Доходы"
  - Фильтр "Расходы"

- [ ] **Баланс:**
  - Корректное отображение баланса
  - Обновление баланса после операций

- [ ] **Интерфейс:**
  - Адаптивность на разных устройствах
  - Плавные анимации
  - Корректная работа модальных окон

### Тестирование на разных устройствах:

1. **Android:**
   - Откройте Telegram на Android
   - Найдите вашего бота
   - Откройте Mini-App

2. **iOS:**
   - Откройте Telegram на iOS
   - Найдите вашего бота
   - Откройте Mini-App

3. **Desktop (Telegram Desktop):**
   - Откройте Telegram Desktop
   - Найдите вашего бота
   - Mini-App откроется в браузере

---

## 🔧 Решение проблем

### Проблема: Mini-App не открывается

**Решение:**
1. Проверьте, что URL использует HTTPS (не HTTP)
2. Убедитесь, что URL доступен публично
3. Проверьте консоль браузера на ошибки
4. Убедитесь, что в BotFather указан правильный URL

### Проблема: Ошибки CORS

**Решение:**
1. Убедитесь, что Supabase настроен правильно
2. Проверьте настройки CORS в Supabase Dashboard
3. Добавьте ваш домен в разрешенные источники

### Проблема: Telegram WebApp не инициализируется

**Решение:**
1. Проверьте, что скрипт Telegram WebApp SDK загружен
2. Убедитесь, что приложение открывается через Telegram
3. Проверьте консоль на ошибки JavaScript

### Проблема: База данных не работает

**Решение:**
1. Проверьте выполнение SQL скрипта в Supabase
2. Убедитесь, что RLS политики созданы
3. Проверьте правильность URL и ключа в `supabaseClient.js`

### Проблема: ngrok URL меняется при перезапуске

**Решение:**
1. Зарегистрируйтесь на ngrok.com
2. Получите бесплатный статический домен
3. Используйте команду: `ngrok http 3000 --domain=your-static-domain.ngrok.io`

---

## 📝 Полезные команды

### Разработка:
```bash
# Запуск dev сервера
npm run dev

# Сборка для продакшена
npm run build

# Просмотр сборки
npm run preview
```

### ngrok:
```bash
# Создание туннеля
ngrok http 3000

# Создание туннеля с доменом (требует регистрации)
ngrok http 3000 --domain=your-domain.ngrok.io
```

### Vercel:
```bash
# Деплой
vercel

# Продакшен деплой
vercel --prod
```

---

## 🔐 Безопасность

1. **Никогда не коммитьте:**
   - `.env` файлы
   - Токены ботов
   - Supabase service role keys

2. **Используйте переменные окружения:**
   - Создайте `.env.local` для локальной разработки
   - Используйте переменные окружения на хостинге

3. **Настройте RLS в Supabase:**
   - Убедитесь, что политики безопасности активны
   - Пользователи могут видеть только свои данные

---

## 📚 Дополнительные ресурсы

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Mini Apps](https://core.telegram.org/bots/webapps)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [ngrok Documentation](https://ngrok.com/docs)

---

## 🎉 Готово!

Теперь ваше приложение готово к использованию! Если возникнут вопросы, проверьте раздел "Решение проблем" или обратитесь к документации.

