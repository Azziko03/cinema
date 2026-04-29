import { cookies } from 'next/headers'
import { i18n, type Locale } from './config'

const LOCALE_COOKIE_NAME = 'locale'

/**
 * Получает текущую локаль из cookies (серверная сторона)
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const locale = cookieStore.get(LOCALE_COOKIE_NAME)?.value as Locale
  
  if (locale && i18n.locales.includes(locale)) {
    return locale
  }
  
  return i18n.defaultLocale
}

/**
 * Устанавливает локаль в cookies (серверная сторона)
 */
export async function setLocale(locale: Locale) {
  const cookieStore = await cookies()
  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 год
  })
}
