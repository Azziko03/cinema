'use server'

import { cookies } from 'next/headers'
import { type Locale } from '@/app/i18n/config'

/**
 * Server Action для изменения языка
 */
export async function changeLocale(locale: Locale) {
  const cookieStore = await cookies()
  cookieStore.set('locale', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 год
  })
}
