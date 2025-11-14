# Telegram Mini-App для учета личных финансов

Современное приложение для учета доходов и расходов, созданное как Telegram Mini-App с локальным хранением данных и синхронизацией через Firebase.

## Функционал

- ✅ **Локальное хранение данных** - все данные хранятся локально в браузере
- ✅ **Автоматический ID пользователя** - создается при первом запуске
- ✅ **Синхронизация с Firebase** - резервное копирование и восстановление данных
- ✅ **Учет доходов и расходов** - полный CRUD для транзакций
- ✅ **Фильтрация и поиск** - по категориям, датам и типу операций
- ✅ **Отображение баланса** - автоматический расчет доходов и расходов
- ✅ **AI-помощник** - анализ трат и персональные советы по оптимизации бюджета
- ✅ **Расширенная аналитика** - графики и диаграммы по категориям и времени
- ✅ **Экспорт/Импорт данных** - поддержка форматов JSON и CSV
- ✅ **Резервное копирование** - автоматическое и ручное в Firebase
- ✅ **Удаление профиля** - вручную или автоматически через 1 год неактивности
- ✅ **Темная/Светлая тема** - автоматическое определение по системным настройкам
- ✅ **Настройка категорий** - добавление и удаление категорий расходов
- ✅ **Современный интерфейс** - glassmorphism эффекты и градиенты

## Технологический стек

- **React** + **Vite** - фронтенд фреймворк и сборщик
- **Telegram WebApp SDK** - интеграция с Telegram
- **Firebase Realtime Database** - синхронизация и резервное копирование
- **localStorage** - локальное хранение данных
- **Tailwind CSS** - стилизация
- **Recharts** - графики и диаграммы
- **PapaParse** - парсинг CSV файлов
- **date-fns** - работа с датами

## Настройка проекта

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка Firebase

1. Создайте проект на [Firebase Console](https://console.firebase.google.com)
2. Включите **Realtime Database** в вашем проекте
3. Настройте правила безопасности (для тестирования можно использовать):

```json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "$userId === auth.uid || true",
        ".write": "$userId === auth.uid || true"
      }
    }
  }
}
```

4. Создайте файл `.env` в корне проекта:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com/
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. Запуск проекта

```bash
# Режим разработки
npm run dev

# Сборка для продакшена
npm run build

# Просмотр собранного проекта
npm run preview
```

## Структура проекта

```
├── src/
│   ├── components/
│   │   ├── ai/
│   │   │   └── AIAssistant.jsx          # AI-помощник для анализа трат
│   │   ├── navigation/
│   │   │   └── TabNavigation.jsx        # Нижняя навигация
│   │   ├── statistics/
│   │   │   ├── CategoryDistribution.jsx  # График по категориям
│   │   │   └── TimelineChart.jsx        # График по времени
│   │   ├── Balance.jsx                  # Компонент баланса
│   │   ├── Header.jsx                   # Шапка приложения
│   │   └── ...
│   ├── context/
│   │   └── ThemeContext.jsx             # Контекст темы
│   ├── hooks/
│   │   ├── useCategories.js             # Хук для категорий
│   │   └── useLocalStorage.js           # Хук для localStorage
│   ├── pages/
│   │   ├── AddTransactionPage.jsx       # Добавление транзакции
│   │   ├── HistoryPage.jsx              # История транзакций
│   │   ├── StatisticsPage.jsx           # Статистика и аналитика
│   │   └── SettingsPage.jsx             # Настройки
│   ├── services/
│   │   ├── aiAssistantService.js        # AI-анализ трат
│   │   ├── dataSyncService.js           # Синхронизация с Firebase
│   │   ├── exportImportService.js       # Экспорт/импорт данных
│   │   ├── firebaseService.js           # Работа с Firebase
│   │   ├── localStorageService.js       # Локальное хранение
│   │   └── transactionService.js        # CRUD транзакций
│   ├── utils/
│   │   └── telegram.js                  # Утилиты Telegram WebApp
│   ├── App.jsx                          # Главный компонент
│   ├── main.jsx                         # Точка входа
│   └── index.css                        # Глобальные стили
├── .env.example                         # Пример конфигурации
├── package.json
├── vite.config.js
└── README.md
```

## Основные функции

### Локальное хранение

Все данные хранятся в `localStorage` браузера:
- Транзакции
- Категории
- Настройки
- Профиль пользователя

### Синхронизация с Firebase

- Автоматическая синхронизация каждые 5 минут (если включена)
- Ручное создание резервной копии
- Восстановление данных из облака

### Экспорт и импорт

- **JSON** - полный экспорт всех данных
- **CSV** - экспорт транзакций для работы в Excel/Google Sheets
- Импорт данных из ранее экспортированных файлов

### AI-помощник

Анализирует ваши траты и предоставляет:
- Сравнение с предыдущим месяцем
- Анализ по категориям
- Персональные советы по оптимизации бюджета

### Удаление профиля

- **Вручную** - через настройки
- **Автоматически** - через 1 год неактивности (выполняется на сервере)

## Деплой на Vercel

1. Установите Vercel CLI:
```bash
npm install -g vercel
```

2. Задеплойте проект:
```bash
vercel --prod
```

3. Настройте переменные окружения в Vercel Dashboard:
   - Все переменные из `.env` файла

4. Подключите к Telegram Bot через BotFather:
   - Используйте URL вашего Vercel проекта

## Обновление проекта

После внесения изменений:

```bash
npm run build
vercel --prod
```

## Лицензия

MIT
