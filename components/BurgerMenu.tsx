'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

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
        className={`fixed top-0 left-0 h-full w-64 bg-[#141414] z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
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

        {/* Навигационные ссылки */}
        <nav className="flex flex-col p-4 space-y-2">
          <a
            href="#"
            className="px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            {t.nav.home}
          </a>
          <a
            href="#"
            className="px-4 py-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            {t.nav.movies}
          </a>
          <a
            href="#"
            className="px-4 py-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            {t.nav.new}
          </a>
          <a
            href="#"
            className="px-4 py-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            {t.nav.myList}
          </a>
        </nav>
      </div>
    </>
  )
}
