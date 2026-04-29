'use client'

import { useState } from 'react'
import { Film, Ticket, Bot, Settings, User } from 'lucide-react'

type NavItem = 'movies' | 'tickets' | 'ai' | 'settings' | 'profile'

export default function BottomNav() {
  const [active, setActive] = useState<NavItem>('movies')

  const navItems = [
    { id: 'movies' as NavItem, icon: Film, label: 'Фильмы' },
    { id: 'tickets' as NavItem, icon: Ticket, label: 'Билеты' },
    { id: 'ai' as NavItem, icon: Bot, label: 'AI' },
    { id: 'settings' as NavItem, icon: Settings, label: 'Настройки' },
    { id: 'profile' as NavItem, icon: User, label: 'Профиль' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-[#2a2a2a]">
      <div className="container mx-auto px-2">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = active === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-all ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className={`text-[10px] ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
