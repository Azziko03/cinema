'use client'

import { Home, Film, Sparkles, Bookmark, TrendingUp, Calendar, Star, Clock } from 'lucide-react'
import { useState } from 'react'

interface SidebarProps {
  translations: any
}

export default function Sidebar({ translations }: SidebarProps) {
  const [activeTab, setActiveTab] = useState('home')
  const t = translations.header

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
    <aside className="hidden lg:block fixed left-6 top-28 bottom-4 w-64 bg-[#141414] border border-gray-800 rounded-2xl z-40">
      <nav className="p-5 space-y-2 mt-3">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
            Меню
          </h3>
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-[#e50914] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-base font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* Дополнительные разделы */}
        <div className="pt-4 border-t border-gray-800">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
            Разделы
          </h3>
          {additionalItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-[#e50914] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-base font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}
