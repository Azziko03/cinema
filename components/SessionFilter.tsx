'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

interface SessionFilterProps {
  translations: any
}

export default function SessionFilter({ translations }: SessionFilterProps) {
  const [activeDay, setActiveDay] = useState<'today' | 'tomorrow'>('today')
  const [searchQuery, setSearchQuery] = useState('')
  const t = translations.sessionFilter

  return (
    <div className="space-y-4">
      {/* Кнопки дней */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveDay('today')}
          className={`px-6 py-2 rounded font-medium transition-all ${
            activeDay === 'today'
              ? 'bg-white text-black'
              : 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white'
          }`}
        >
          {t.today}
        </button>
        <button
          onClick={() => setActiveDay('tomorrow')}
          className={`px-6 py-2 rounded font-medium transition-all ${
            activeDay === 'tomorrow'
              ? 'bg-white text-black'
              : 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white'
          }`}
        >
          {t.tomorrow}
        </button>
      </div>

      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded bg-[#2a2a2a] border border-[#3a3a3a] focus:outline-none focus:border-white transition-colors text-white placeholder-gray-500"
        />
      </div>
    </div>
  )
}
