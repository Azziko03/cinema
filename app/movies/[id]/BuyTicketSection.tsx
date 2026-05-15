'use client'

import { useState } from 'react'
import { Calendar, Clock, MapPin, Film } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Session {
  id: string
  startTime: Date
  endTime: Date
  basePrice: number
  vipPrice: number | null
  language: string
  format: string
  hall: {
    id: string
    name: string
  }
}

interface BuyTicketSectionProps {
  movieId: string
  movieTitle: string
  sessions: Session[]
  isAuthenticated: boolean
}

export default function BuyTicketSection({ 
  movieId, 
  movieTitle,
  sessions,
  isAuthenticated 
}: BuyTicketSectionProps) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSession, setSelectedSession] = useState<string | null>(null)

  // Проверяем, все ли сеансы из одного зала
  const uniqueHalls = [...new Set(sessions.map(s => s.hall.id))]
  const isSingleHall = uniqueHalls.length === 1
  const hallName = isSingleHall && sessions.length > 0 ? sessions[0].hall.name : null

  // Группируем сеансы по датам
  const sessionsByDate = sessions.reduce((acc, session) => {
    const date = new Date(session.startTime).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(session)
    return acc
  }, {} as Record<string, Session[]>)

  const dates = Object.keys(sessionsByDate)

  const handleBuyTicket = () => {
    if (!isAuthenticated) {
      router.push('/auth/signup')
      return
    }

    if (selectedSession) {
      router.push(`/booking/${selectedSession}`)
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatLanguage = (lang: string) => {
    const languages: Record<string, string> = {
      'original': 'Оригинал',
      'dubbed': 'Дубляж'
    }
    return languages[lang] || lang
  }

  const formatFormat = (format: string) => {
    const formats: Record<string, string> = {
      'TWO_D': '2D',
      'THREE_D': '3D',
      'IMAX': 'IMAX'
    }
    return formats[format] || format
  }

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <div className="w-1.5 h-8 bg-[#e50914] rounded-full" />
        Купить билет
      </h2>

      {sessions.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-800">
          <Film className="w-20 h-20 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-xl">Сеансы пока не запланированы</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Выбор даты */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-[#e50914]" />
              Выберите дату
            </h3>
            <div className="flex flex-wrap gap-3">
              {dates.map((date) => (
                <button
                  key={date}
                  onClick={() => {
                    setSelectedDate(date)
                    setSelectedSession(null)
                  }}
                  className={`
                    px-6 py-3 rounded-lg font-semibold transition-all text-base
                    ${
                      selectedDate === date
                        ? 'bg-[#e50914] text-white shadow-lg shadow-[#e50914]/50'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
                    }
                  `}
                >
                  {date}
                </button>
              ))}
            </div>
          </div>

          {/* Выбор сеанса */}
          {selectedDate && (
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-[#e50914]" />
                Выберите время
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessionsByDate[selectedDate].map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setSelectedSession(session.id)}
                    className={`
                      p-5 rounded-xl border-2 transition-all text-left group
                      ${
                        selectedSession === session.id
                          ? 'border-[#e50914] bg-[#e50914]/10 shadow-lg shadow-[#e50914]/20'
                          : 'border-gray-700 bg-gray-800/30 hover:border-gray-600 hover:bg-gray-800/50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl font-bold">
                        {formatTime(session.startTime)}
                      </span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#e50914]">
                          {session.basePrice}с
                        </div>
                        {session.vipPrice && (
                          <div className="text-sm text-yellow-400 font-semibold">
                            VIP: {session.vipPrice}с
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 text-sm text-gray-400">
                      {!isSingleHall && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{session.hall.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Film className="w-4 h-4" />
                        <span>{formatLanguage(session.language)} • {formatFormat(session.format)}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Кнопка покупки */}
          {selectedSession && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleBuyTicket}
                className="w-full md:w-auto px-16 py-4 bg-[#e50914] text-white rounded-xl font-bold text-lg hover:bg-[#c50812] transition-all shadow-lg shadow-[#e50914]/50 hover:shadow-xl hover:shadow-[#e50914]/60 hover:scale-105"
              >
                {isAuthenticated ? 'Выбрать места' : 'Войти и купить билет'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
