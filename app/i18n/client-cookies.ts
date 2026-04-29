'use client'

import { type Locale } from './config'

const LOCALE_COOKIE_NAME = 'locale'

/**
 * Получает текущую локаль из cookies (клиентская сторона)
 */
export function getClientLocale(): Locale | null {
  if (typeof document === 'undefined') return null
  
  const cookies = document.cookie.split('; ')
  const localeCookie = cookies.find(c => c.startsWith(`${LOCALE_COOKIE_NAME}=`))
  
  if (localeCookie) {
    return localeCookie.split('=')[1] as Locale
  }
  
  return null
}

/**
 * Устанавливает локаль в cookies (клиентская сторона)
 */
export function setClientLocale(locale: Locale) {
  const maxAge = 60 * 60 * 24 * 365 // 1 год
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${maxAge}`
}
