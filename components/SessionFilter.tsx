'use client'

import { useState } from 'react'
import { Search, ChevronDown } from 'lucide-react'

interface SessionFilterProps {
  translations: any
  activeDay: 'today' | 'tomorrow'
  onDayChange: (day: 'today' | 'tomorrow') => void
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
  selectedYear: string
  onYearChange: (year: string) => void
}

export default function SessionFilter({ 
  translations,
  activeDay,
  onDayChange,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedYear,
  onYearChange
}: SessionFilterProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isYearOpen, setIsYearOpen] = useState(false)
  const t = translations.sessionFilter

  const categories = [
    { id: 'all', label: t.categories?.all || 'Все категории' },
    { id: 'action', label: t.categories?.action || 'Боевик' },
    { id: 'comedy', label: t.categories?.comedy || 'Комедия' },
    { id: 'drama', label: t.categories?.drama || 'Драма' },
    { id: 'fantasy', label: t.categories?.fantasy || 'Фантастика' },
    { id: 'horror', label: t.categories?.horror || 'Ужасы' },
    { id: 'thriller', label: t.categories?.thriller || 'Триллер' },
  ]

  const years = [
    { id: 'all', label: t.years?.all || 'Все годы' },
    { id: '2026', label: '2026' },
    { id: '2025', label: '2025' },
    { id: '2024', label: '2024' },
    { id: '2023', label: '2023' },
    { id: '2022', label: '2022' },
    { id: '2021', label: '2021' },
  ]

  const selectedCategoryLabel = categories.find(c => c.id === selectedCategory)?.label || categories[0].label
  const selectedYearLabel = years.find(y => y.id === selectedYear)?.label || years[0].label

  return (
    <div className="space-y-4">
      {/* Кнопки дней */}
      <div className="flex gap-3">
        <button
          onClick={() => onDayChange('today')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeDay === 'today'
              ? 'bg-[#e50914] text-white'
              : 'bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white border border-gray-800'
          }`}
        >
          {t.today}
        </button>
        <button
          onClick={() => onDayChange('tomorrow')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            activeDay === 'tomorrow'
              ? 'bg-[#e50914] text-white'
              : 'bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white border border-gray-800'
          }`}
        >
          {t.tomorrow}
        </button>
      </div>

      {/* Поиск с фильтрами справа */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Поле поиска */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-[#1a1a1a] border border-gray-800 focus:outline-none focus:border-[#e50914] transition-colors text-white placeholder-gray-500"
          />
        </div>

        {/* Фильтры справа */}
        <div className="flex gap-3">
          {/* Dropdown категорий */}
          <div className="relative">
            <button
              onClick={() => {
                setIsCategoryOpen(!isCategoryOpen)
                setIsYearOpen(false)
              }}
              className="h-full px-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-lg hover:bg-[#2a2a2a] transition-colors text-white flex items-center gap-2 whitespace-nowrap min-w-[160px]"
            >
              <span className="text-sm">{selectedCategoryLabel}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCategoryOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsCategoryOpen(false)}
                />
                <div className="absolute top-full mt-2 right-0 w-48 bg-[#1a1a1a] border border-gray-800 rounded-lg shadow-xl z-50 overflow-hidden">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        onCategoryChange(category.id)
                        setIsCategoryOpen(false)
                      }}
                      className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-[#e50914] text-white font-semibold'
                          : 'hover:bg-[#2a2a2a] text-gray-300'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Dropdown годов */}
          <div className="relative">
            <button
              onClick={() => {
                setIsYearOpen(!isYearOpen)
                setIsCategoryOpen(false)
              }}
              className="h-full px-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-lg hover:bg-[#2a2a2a] transition-colors text-white flex items-center gap-2 whitespace-nowrap min-w-[120px]"
            >
              <span className="text-sm">{selectedYearLabel}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isYearOpen ? 'rotate-180' : ''}`} />
            </button>

            {isYearOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsYearOpen(false)}
                />
                <div className="absolute top-full mt-2 right-0 w-36 bg-[#1a1a1a] border border-gray-800 rounded-lg shadow-xl z-50 overflow-hidden">
                  {years.map((year) => (
                    <button
                      key={year.id}
                      onClick={() => {
                        onYearChange(year.id)
                        setIsYearOpen(false)
                      }}
                      className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                        selectedYear === year.id
                          ? 'bg-[#e50914] text-white font-semibold'
                          : 'hover:bg-[#2a2a2a] text-gray-300'
                      }`}
                    >
                      {year.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
