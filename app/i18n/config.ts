export const i18n = {
  defaultLocale: 'ru',
  locales: ['ru', 'kg'],
} as const

export type Locale = (typeof i18n)['locales'][number]

export const localeNames: Record<Locale, string> = {
  ru: 'Русский',
  kg: 'Кыргызча',
}
