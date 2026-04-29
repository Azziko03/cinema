# Локализация (i18n)

Структура папок для многоязычной поддержки приложения.

## Структура

```
app/i18n/
├── config.ts           # Конфигурация языков
├── index.ts            # Утилиты для работы с переводами
├── README.md           # Документация
└── locales/            # Переводы
    ├── ru/             # Русский язык
    │   ├── landing.json
    │   └── movies.json
    └── kg/             # Кыргызский язык
        ├── landing.json
        └── movies.json
```

## Поддерживаемые языки

- **ru** - Русский (по умолчанию)
- **kg** - Кыргызча (Кыргызский)

## Файлы переводов

### landing.json
Переводы для главной страницы:
- Заголовок (Header)
- Карусель (Carousel)
- Фильтр сеансов (SessionFilter)
- Ряды фильмов (MovieRows)
- Карточки фильмов (MovieCard)
- Нижняя навигация (BottomNav)
- Метаданные страницы

### movies.json
Переводы для фильмов:
- Жанры
- Названия фильмов
- Описания

## Использование

### В серверных компонентах

```tsx
import { getTranslations } from '@/app/i18n'

export default async function Page() {
  const t = await getTranslations('ru', 'landing')
  
  return (
    <div>
      <h1>{t.header.logo}</h1>
      <p>{t.metadata.description}</p>
    </div>
  )
}
```

### В клиентских компонентах

```tsx
'use client'

import { useTranslations } from '@/app/i18n'

export default function Component({ translations }: { translations: any }) {
  const { t } = useTranslations(translations)
  
  return (
    <div>
      <h1>{t('header.logo')}</h1>
      <p>{t('metadata.description')}</p>
    </div>
  )
}
```

### Получение вложенных значений

```tsx
// Прямой доступ
const title = translations.header.nav.home

// Через функцию с fallback
const title = t('header.nav.home', 'Главная')
```

## Добавление нового языка

1. Создайте папку в `locales/` с кодом языка (например, `en`)
2. Скопируйте JSON файлы из существующей локали
3. Переведите все строки
4. Добавьте язык в `config.ts`:

```ts
export const i18n = {
  defaultLocale: 'ru',
  locales: ['ru', 'kg', 'en'], // добавьте новый язык
} as const

export const localeNames: Record<Locale, string> = {
  ru: 'Русский',
  kg: 'Кыргызча',
  en: 'English', // добавьте название
}
```

## Добавление новой страницы переводов

1. Создайте новый JSON файл в каждой папке локали (например, `profile.json`)
2. Добавьте тип в `index.ts`:

```ts
type TranslationKeys = {
  landing: any
  movies: any
  profile: any // добавьте новый тип
}
```

3. Используйте в компонентах:

```ts
const t = await getTranslations('ru', 'profile')
```

## Рекомендации

- Используйте понятные ключи на английском языке
- Группируйте переводы по компонентам/секциям
- Избегайте дублирования переводов
- Добавляйте fallback значения для безопасности
- Проверяйте все языки при добавлении новых ключей
