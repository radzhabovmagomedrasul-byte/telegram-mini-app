# Telegram Mini-App для учета личных финансов

Современное приложение для учета доходов и расходов, созданное как Telegram Mini-App.

## Функционал

- ✅ Авторизация через Supabase (email + password)
- ✅ Учет доходов и расходов
- ✅ Добавление, редактирование и удаление транзакций (полный CRUD)
- ✅ Фильтрация по типу (доход / расход)
- ✅ Отображение итогового баланса
- ✅ Современный минималистичный интерфейс

## Технологический стек

- **React** + **Vite** - фронтенд фреймворк и сборщик
- **Telegram WebApp SDK** - интеграция с Telegram
- **Supabase** - база данных и аутентификация
- **Tailwind CSS** - стилизация

## Настройка проекта

### 1. Установка зависимостей

```bash
npm install
```

### 2. Подключение к Supabase

Проект уже настроен с вашими данными Supabase:
- **Project URL:** `https://jkbspeccroxmslgzftdf.supabase.co`
- **Anon Key:** Настроен в `src/supabaseClient.js`

Если нужно использовать переменные окружения, создайте файл `.env`:

```env
VITE_SUPABASE_URL=https://jkbspeccroxmslgzftdf.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Настройка Supabase

1. Создайте проект на [supabase.com](https://supabase.com)
2. Перейдите в SQL Editor и выполните следующий SQL для создания таблицы транзакций:

```sql
-- Создание таблицы transactions
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включение Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Политика: пользователи могут видеть только свои транзакции
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Политика: пользователи могут добавлять только свои транзакции
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Политика: пользователи могут удалять только свои транзакции
CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Создание индекса для быстрого поиска
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
```

3. Выполните SQL скрипт из файла `supabase-setup.sql` в SQL Editor

### 4. Запуск проекта локально

```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:3000`

### 5. Сборка для продакшена

```bash
npm run build
```

Собранные файлы будут в папке `dist/`

## 📱 Настройка Telegram Mini-App

**Подробная инструкция по настройке и тестированию Mini-App находится в файле [TELEGRAM_SETUP.md](./TELEGRAM_SETUP.md)**

Краткая версия:

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Используйте команду `/newapp` для создания Mini-App
3. Укажите URL вашего приложения (локально через ngrok или развернутое на хостинге)
4. Откройте бота в Telegram и протестируйте приложение

## Развертывание в Telegram

1. Соберите проект: `npm run build`
2. Загрузите содержимое папки `dist/` на хостинг (например, Vercel, Netlify, или любой другой)
3. Создайте бота через [@BotFather](https://t.me/BotFather) в Telegram
4. Используйте команду `/newapp` в BotFather и укажите URL вашего приложения
5. Готово! Ваше приложение доступно через бота

## Структура проекта

```
├── src/
│   ├── components/
│   │   ├── Auth.jsx              # Компонент авторизации
│   │   ├── Header.jsx            # Шапка приложения
│   │   ├── Balance.jsx           # Отображение баланса
│   │   ├── TransactionsList.jsx  # Список транзакций
│   │   ├── AddTransaction.jsx    # Форма добавления транзакции
│   │   └── EditTransaction.jsx   # Форма редактирования транзакции
│   ├── services/
│   │   └── transactionService.js # Сервис для работы с транзакциями
│   ├── utils/
│   │   └── telegram.js           # Утилиты для Telegram WebApp
│   ├── App.jsx                    # Главный компонент
│   ├── main.jsx                  # Точка входа
│   ├── supabaseClient.js         # Клиент Supabase
│   └── index.css                 # Глобальные стили
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Использование

1. **Регистрация/Вход**: При первом запуске зарегистрируйтесь или войдите с существующим аккаунтом
2. **Добавление транзакции**: Нажмите кнопку "+" в правом нижнем углу
3. **Редактирование транзакции**: Нажмите "Редактировать" на любой транзакции
4. **Фильтрация**: Используйте кнопки "Все", "Доходы", "Расходы" для фильтрации
5. **Удаление**: Нажмите "Удалить" на любой транзакции
6. **Выход**: Нажмите кнопку "Выйти" в правом нижнем углу

## API Функции

Проект использует централизованный сервис для работы с транзакциями (`src/services/transactionService.js`):

- `getTransactions(userId, filter)` - Получение всех транзакций пользователя
- `addTransaction(userId, type, amount, description)` - Добавление новой транзакции
- `updateTransaction(transactionId, updates)` - Обновление транзакции
- `deleteTransaction(transactionId)` - Удаление транзакции
- `getBalance(userId)` - Подсчёт баланса пользователя

## Лицензия

MIT

