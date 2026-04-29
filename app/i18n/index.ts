import { i18n, type Locale } from './config'

// Типы для переводов
type TranslationKeys = {
  landing: any
  movies: any
}

// Кэш для загруженных переводов
const translationsCache: Map<string, any> = new Map()

/**
 * Загружает переводы для указанной локали и страницы
 */
export async function getTranslations(
  locale: Locale,
  page: keyof TranslationKeys
): Promise<any> {
  const cacheKey = `${locale}-${page}`
  
  if (translationsCache.has(cacheKey)) {
    return translationsCache.get(cacheKey)
  }

  try {
    const translations = await import(`./locales/${locale}/${page}.json`)
    translationsCache.set(cacheKey, translations.default)
    return translations.default
  } catch (error) {
    console.error(`Failed to load translations for ${locale}/${page}:`, error)
    // Возвращаем переводы по умолчанию
    if (locale !== i18n.defaultLocale) {
      return getTranslations(i18n.defaultLocale, page)
    }
    return {}
  }
}

/**
 * Получает значение из объекта переводов по пути (например, "header.nav.home")
 */
export function getNestedTranslation(
  translations: any,
  path: string,
  fallback?: string
): string {
  const keys = path.split('.')
  let value = translations

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key]
    } else {
      return fallback || path
    }
  }

  return typeof value === 'string' ? value : fallback || path
}

/**
 * Хук для использования переводов в клиентских компонентах
 */
export function useTranslations(translations: any) {
  return {
    t: (path: string, fallback?: string) =>
      getNestedTranslation(translations, path, fallback),
    translations,
  }
}

export { i18n, type Locale } from './config'
