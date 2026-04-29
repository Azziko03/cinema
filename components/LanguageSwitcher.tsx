'use client'

import { useState, useTransition } from 'react'
import { Globe } from 'lucide-react'
import { type Locale, localeNames } from '@/app/i18n/config'
import { setClientLocale } from '@/app/i18n/client-cookies'
import { changeLocale } from '@/app/actions/locale'

interface LanguageSwitcherProps {
  currentLocale: Locale
}

export default function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleLocaleChange = (locale: Locale) => {
    setClientLocale(locale)
    startTransition(async () => {
      await changeLocale(locale)
      window.location.reload()
    })
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 hover:text-gray-300 transition-colors"
        disabled={isPending}
      >
        <Globe className="w-5 h-5" />
        <span className="text-sm font-medium uppercase">{currentLocale}</span>
      </button>

      {isOpen && (
        <>
          {/* Overlay для закрытия при клике вне */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown меню */}
          <div className="absolute right-0 top-full mt-2 w-40 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl z-50 overflow-hidden">
            {Object.entries(localeNames).map(([locale, name]) => (
              <button
                key={locale}
                onClick={() => handleLocaleChange(locale as Locale)}
                disabled={isPending}
                className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                  currentLocale === locale
                    ? 'bg-[#e50914] text-white font-semibold'
                    : 'hover:bg-[#2a2a2a] text-gray-300'
                } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
