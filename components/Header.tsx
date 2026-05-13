'use client'

import LanguageSwitcher from './LanguageSwitcher'
import UserMenu from './UserMenu'
import BurgerMenu from './BurgerMenu'
import { type Locale } from '@/app/i18n/config'

interface HeaderProps {
  translations: any
  locale: Locale
  isAuthenticated?: boolean
}

export default function Header({ translations, locale, isAuthenticated = false }: HeaderProps) {
  const t = translations.header

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Левая часть: Бургер-меню (только для авторизованных на мобильных) + Логотип */}
        <div className="flex items-center gap-3">
          {/* Бургер-меню - показываем только для авторизованных пользователей на мобильных */}
          {isAuthenticated && <BurgerMenu translations={translations} />}
          
          <h1 className="text-[#e50914] text-2xl font-bold tracking-tight">
            {t.logo}
          </h1>
          
          {/* Desktop Navigation - показываем всегда на десктопе */}
          <nav className="hidden md:flex items-center gap-5 ml-8">
            <a href="#" className="text-sm hover:text-gray-300 transition-colors">{t.nav.home}</a>
            <a href="#" className="text-sm text-gray-400 hover:text-gray-300 transition-colors">{t.nav.movies}</a>
            <a href="#" className="text-sm text-gray-400 hover:text-gray-300 transition-colors">{t.nav.new}</a>
            <a href="#" className="text-sm text-gray-400 hover:text-gray-300 transition-colors">{t.nav.myList}</a>
          </nav>
        </div>

        {/* Кнопки авторизации и переключатель языка */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher currentLocale={locale} />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
