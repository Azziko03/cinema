'use client'

import { useState, useEffect } from 'react'
import { Menu, X, Home, Film, Sparkles, Bookmark, TrendingUp, Calendar, Star, Clock } from 'lucide-react'

interface BurgerMenuProps {
  translations: any
}

export default function BurgerMenu({ translations }: BurgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const t = translations.header

  // Блокируем скролл когда меню открыто
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const menuItems = [
    { id: 'home', label: t.nav.home, icon: Home },
    { id: 'movies', label: t.nav.movies, icon: Film },
    { id: 'new', label: t.nav.new, icon: Sparkles },
    { id: 'myList', label: t.nav.myList, icon: Bookmark },
  ]

  const additionalItems = [
    { id: 'trending', label: 'Популярное', icon: TrendingUp },
    { id: 'schedule', label: 'Расписание', icon: Calendar },
    { id: 'top', label: 'Топ рейтинг', icon: Star },
    { id: 'soon', label: 'Скоро', icon: Clock },
  ]

  return (
    <>
      {/* Кнопка бургер-меню - видна только на мобильных */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
        aria-label="Меню"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Боковое меню */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-[#141414] z-50 transform transition-transform duration-300 ease-in-out md:hidden overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Заголовок меню */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-[#e50914] text-xl font-bold">{t.logo}</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Закрыть меню"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Основная навигация */}
        <nav className="p-4 space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
            Меню
          </h3>
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <a
                key={item.id}
                href="#"
                className="flex items-center gap-3 px-3 py-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </a>
            )
          })}
        </nav>

        {/* Дополнительные разделы */}
        <nav className="p-4 pt-0 space-y-2 border-t border-gray-800 mt-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3 pt-4">
            Разделы
          </h3>
          {additionalItems.map((item) => {
            const Icon = item.icon
            return (
              <a
                key={item.id}
                href="#"
                className="flex items-center gap-3 px-3 py-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </a>
            )
          })}
        </nav>
      </div>
    </>
  )
}
