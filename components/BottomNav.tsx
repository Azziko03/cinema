'use client'

import { Film, Ticket, Bot, Settings, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    {
      name: 'Фильмы',
      href: '/',
      icon: Film,
    },
    {
      name: 'Билеты',
      href: '/tickets',
      icon: Ticket,
    },
    {
      name: 'AI',
      href: '/ai',
      icon: Bot,
    },
    {
      name: 'Настройки',
      href: '/settings',
      icon: Settings,
    },
    {
      name: 'Профиль',
      href: '/profile',
      icon: User,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-lg border-t border-gray-800 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                isActive
                  ? 'text-[#e50914]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
