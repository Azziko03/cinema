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
      {/* Mobile Version - только кнопка Book Now уже есть в MovieDetailClient */}
      
      {/* Desktop Version */}
      <div className="hidden lg:block">
        <h2 className="text-2xl font-bold mb-6">Купить билет</h2>

        {sessions.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 rounded-lg">
            <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Сеансы пока не запланированы</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Выбор даты */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#e50914]" />
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
                      px-6 py-3 rounded-lg font-semibold transition-all
                      ${
                        selectedDate === date
                          ? 'bg-[#e50914] text-white'
                          : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
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
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#e50914]" />
                  Выберите время
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sessionsByDate[selectedDate].map((session) => (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSession(session.id)}
                      className={`
                        p-4 rounded-lg border-2 transition-all text-left
                        ${
                          selectedSession === session.id
                            ? 'border-[#e50914] bg-[#e50914]/10'
                            : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-bold">
                          {formatTime(session.startTime)}
                        </span>
                        <span className="text-xl font-bold text-[#e50914]">
                          {session.basePrice}с
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{session.hall.name}</span>
                        </div>
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
              <div className="flex justify-center pt-6">
                <button
                  onClick={handleBuyTicket}
                  className="px-12 py-4 bg-[#e50914] text-white rounded-lg font-bold text-lg hover:bg-[#c50812] transition-colors"
                >
                  {isAuthenticated ? 'Выбрать места' : 'Войти и купить билет'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
