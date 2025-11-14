import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const LocaleContext = createContext(null)
const STORAGE_KEY = 'financeflow_locale'
const FALLBACK_LOCALE = 'ru'

const translations = {
  ru: {
    brand: {
      name: 'FinanceFlow',
      subtitle: 'Умный контроль финансов',
      welcome: 'С возвращением',
      logout: 'Выйти',
    },
    common: {
      initializing: 'Инициализация',
      loading: 'Загрузка...',
      filtersShow: 'Фильтры',
      filtersHide: 'Скрыть фильтры',
      save: 'Сохранить',
      cancel: 'Отмена',
      edit: 'Редактировать',
      delete: 'Удалить',
      status: 'Статус',
      search: 'Поиск',
      notFound: 'Данные отсутствуют',
    },
    nav: {
      history: 'Главная',
      add: 'Добавить',
      stats: 'Аналитика',
      ai: 'AI',
      settings: 'Настройки',
    },
    balance: {
      total: 'Общий баланс',
      status: 'Статус',
      positive: 'Положительный',
      negative: 'Отрицательный',
    },
    history: {
      title: 'История операций',
      subtitle: 'Последние движения',
      income: 'Доходы',
      expenses: 'Расходы',
      thisMonth: 'Этот месяц',
      quickActions: 'Быстрые действия',
      quickSend: 'Отправить',
      quickSendNote: 'Перевод',
      quickReceive: 'Получить',
      quickReceiveNote: 'Пополнение',
      quickAdd: 'Добавить',
      quickAddNote: 'Новая запись',
      filters: {
        category: 'Категория',
        from: 'От',
        to: 'До',
        search: 'Поиск',
        placeholder: 'Категория или комментарий',
        all: 'Все категории',
      },
      states: {
        loading: 'Загрузка...',
        empty: 'Транзакции не найдены. Попробуйте изменить фильтры.',
      },
      labels: {
        income: 'Доход',
        expense: 'Расход',
        other: 'Прочее',
        generic: 'Транзакция',
      },
      badgeGrowth: 'Рост',
      errors: {
        load: 'Не удалось загрузить транзакции',
      },
      alerts: {
        quickUnavailable: 'Эта операция доступна в Telegram-версии. Пока добавляйте транзакции вручную.',
        updated: 'Транзакция обновлена',
        deleted: 'Транзакция удалена',
        confirmDelete: 'Удалить эту транзакцию?',
      },
    },
    add: {
      title: 'Новая транзакция',
      description: 'Добавьте запись',
      helper: 'Фиксируйте движение средств, чтобы контролировать баланс.',
      type: 'Тип операции',
      expense: 'Расход',
      income: 'Доход',
      amount: 'Сумма',
      category: 'Категория',
      newCategoryPlaceholder: 'Новая категория',
      addCategory: 'Добавить',
      date: 'Дата операции',
      comment: 'Комментарий',
      commentPlaceholder: 'Например: покупка продуктов',
      submit: 'Сохранить',
      saving: 'Сохранение...',
      errors: {
        amount: 'Введите корректную сумму',
        category: 'Выберите или добавьте категорию',
        date: 'Выберите дату',
      },
      success: 'Транзакция успешно добавлена!',
      categoryAdded: 'Категория добавлена!',
    },
    statistics: {
      filters: {
        type: 'Тип',
        category: 'Категория',
        from: 'От',
        to: 'До',
        all: 'Все',
      },
      distributionTitle: 'Распределение по категориям',
      distributionDescription: 'На что уходит большая часть бюджета.',
      timelineTitle: 'Динамика расходов и доходов',
      timelineDescription: 'Как меняются показатели со временем.',
      loading: 'Загрузка...',
      loadError: 'Не удалось загрузить данные для статистики',
    },
    settings: {
      themeTitle: 'Тема интерфейса',
      themeDescription: 'Переключайте светлую или тёмную тему для комфортной работы.',
      autoTheme: 'Автоматическая тема',
      autoThemeDescription: 'Следовать системным настройкам устройства',
      manualTheme: 'Ручное переключение темы',
      manualLight: 'Светлая тема',
      manualDark: 'Тёмная тема',
      toggleTheme: 'Переключить',
      toggleOn: 'Включено',
      toggleOff: 'Выключено',
      notificationsTitle: 'Уведомления',
      notificationsDescription: 'Получайте напоминания о контроле расходов.',
      notificationsOn: 'включены',
      notificationsOff: 'отключены',
      notificationsDisable: 'Отключить',
      notificationsEnable: 'Включить',
      categoriesTitle: 'Категории расходов',
      categoriesDescription: 'Настройте категории под свои привычки.',
      categoriesPlaceholder: 'Новая категория',
      categoriesAdd: 'Добавить',
      categoriesDelete: 'Удалить',
      exportTitle: 'Экспорт и импорт данных',
      exportDescription: 'Сохраняйте резервные копии и восстанавливайте данные.',
      exportJson: '📥 Экспорт JSON',
      exportCsv: '📊 Экспорт CSV',
      importJson: '📤 Импорт JSON',
      importCsv: '📈 Импорт CSV',
      backupTitle: 'Резервное копирование',
      backupDescription: 'Сохраняйте данные в облаке для восстановления.',
      backupButton: '☁️ Создать резервную копию в Firebase',
      dangerTitle: 'Опасная зона',
      dangerDescription: 'Удаление профиля приведёт к потере данных.',
      dangerButton: '🗑️ Удалить профиль',
    },
  },
  en: {
    brand: {
      name: 'FinanceFlow',
      subtitle: 'Smart finance tracking',
      welcome: 'Welcome back',
      logout: 'Logout',
    },
    common: {
      initializing: 'Initializing',
      loading: 'Loading...',
      filtersShow: 'Filters',
      filtersHide: 'Hide filters',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      status: 'Status',
      search: 'Search',
      notFound: 'No data available',
    },
    nav: {
      history: 'Dashboard',
      add: 'Add',
      stats: 'Analytics',
      ai: 'AI',
      settings: 'Settings',
    },
    balance: {
      total: 'Total balance',
      status: 'Status',
      positive: 'Positive',
      negative: 'Negative',
    },
    history: {
      title: 'Transactions',
      subtitle: 'Recent activity',
      income: 'Income',
      expenses: 'Expenses',
      thisMonth: 'This month',
      quickActions: 'Quick actions',
      quickSend: 'Send',
      quickSendNote: 'Transfer',
      quickReceive: 'Receive',
      quickReceiveNote: 'Top up',
      quickAdd: 'Add',
      quickAddNote: 'New entry',
      filters: {
        category: 'Category',
        from: 'From',
        to: 'To',
        search: 'Search',
        placeholder: 'Category or comment',
        all: 'All categories',
      },
      states: {
        loading: 'Loading...',
        empty: 'Transactions not found. Try adjusting filters.',
      },
      labels: {
        income: 'Income',
        expense: 'Expense',
        other: 'Other',
        generic: 'Transaction',
      },
      badgeGrowth: 'Change',
      errors: {
        load: 'Failed to load transactions',
      },
      alerts: {
        quickUnavailable: 'This action is available only inside Telegram for now.',
        updated: 'Transaction updated',
        deleted: 'Transaction deleted',
        confirmDelete: 'Delete this transaction?',
      },
    },
    add: {
      title: 'Add transaction',
      description: 'Create a new entry',
      helper: 'Track every movement to stay on top of your budget.',
      type: 'Type',
      expense: 'Expense',
      income: 'Income',
      amount: 'Amount',
      category: 'Category',
      newCategoryPlaceholder: 'New category',
      addCategory: 'Add',
      date: 'Date',
      comment: 'Comment',
      commentPlaceholder: 'E.g. grocery shopping',
      submit: 'Save',
      saving: 'Saving...',
      errors: {
        amount: 'Enter a valid amount',
        category: 'Choose or add a category',
        date: 'Select a date',
      },
      success: 'Transaction saved successfully!',
      categoryAdded: 'Category added!',
    },
    statistics: {
      filters: {
        type: 'Type',
        category: 'Category',
        from: 'From',
        to: 'To',
        all: 'All',
      },
      distributionTitle: 'Category distribution',
      distributionDescription: 'See where you spend the most money.',
      timelineTitle: 'Income & expense trends',
      timelineDescription: 'Track how your finances change over time.',
      loading: 'Loading...',
      loadError: 'Unable to load analytics data',
    },
    settings: {
      themeTitle: 'Interface theme',
      themeDescription: 'Switch between light and dark modes.',
      autoTheme: 'Automatic theme',
      autoThemeDescription: 'Follow system preferences',
      manualTheme: 'Manual theme toggle',
      manualLight: 'Light theme',
      manualDark: 'Dark theme',
      toggleTheme: 'Toggle',
      toggleOn: 'On',
      toggleOff: 'Off',
      notificationsTitle: 'Notifications',
      notificationsDescription: 'Get reminders to review spending.',
      notificationsOn: 'enabled',
      notificationsOff: 'disabled',
      notificationsDisable: 'Disable',
      notificationsEnable: 'Enable',
      categoriesTitle: 'Expense categories',
      categoriesDescription: 'Customize categories for your habits.',
      categoriesPlaceholder: 'New category',
      categoriesAdd: 'Add',
      categoriesDelete: 'Delete',
      exportTitle: 'Export & import',
      exportDescription: 'Back up and restore your data.',
      exportJson: '📥 Export JSON',
      exportCsv: '📊 Export CSV',
      importJson: '📤 Import JSON',
      importCsv: '📈 Import CSV',
      backupTitle: 'Cloud backup',
      backupDescription: 'Store data in the cloud for recovery.',
      backupButton: '☁️ Create Firebase backup',
      dangerTitle: 'Danger zone',
      dangerDescription: 'Deleting the profile erases all data.',
      dangerButton: '🗑️ Delete profile',
    },
  },
}

const getInitialLocale = () => {
  if (typeof window === 'undefined') {
    return FALLBACK_LOCALE
  }
  return localStorage.getItem(STORAGE_KEY) || FALLBACK_LOCALE
}

const resolvePath = (obj, path) =>
  path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj)

export const LocaleProvider = ({ children }) => {
  const [locale, setLocale] = useState(getInitialLocale)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, locale)
    }
  }, [locale])

  const value = useMemo(() => {
    const t = (key) => {
      const current = resolvePath(translations[locale], key)
      if (current !== undefined) return current
      const fallback = resolvePath(translations[FALLBACK_LOCALE], key)
      return fallback !== undefined ? fallback : key
    }

    const toggleLocale = () => {
      setLocale((prev) => (prev === 'ru' ? 'en' : 'ru'))
    }

    return {
      locale,
      setLocale,
      toggleLocale,
      t,
    }
  }, [locale])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export const useLocale = () => {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return context
}

