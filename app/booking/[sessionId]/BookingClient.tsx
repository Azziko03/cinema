'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, MapPin, Film, ArrowLeft } from 'lucide-react'

interface Seat {
  id: string
  rowNumber: number
  seatNumber: number
  isActive: boolean
  isVip: boolean
}

interface Hall {
  id: string
  name: string
  seats: Seat[]
}

interface Movie {
  id: string
  translations: Array<{
    language: string
    title: string
  }>
  mediaFiles: Array<{
    type: string
    url: string
  }>
}

interface Session {
  id: string
  startTime: Date
  endTime: Date
  basePrice: number
  vipPrice: number | null
  language: string
  format: string
  movie: Movie
  hall: Hall
  bookedSeatIds: string[]
}

interface BookingClientProps {
  session: Session
}

export default function BookingClient({ session }: BookingClientProps) {
  const router = useRouter()
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])

  // Получаем название фильма на русском
  const movieTitle = session.movie.translations.find(t => t.language === 'RU')?.title || 
                     session.movie.translations[0]?.title || 'Фильм'

  // Получаем постер
  const poster = session.movie.mediaFiles.find(m => m.type === 'poster')?.url

  // Группируем места по рядам
  const seatsByRow = session.hall.seats.reduce((acc, seat) => {
    if (!acc[seat.rowNumber]) {
      acc[seat.rowNumber] = []
    }
    acc[seat.rowNumber].push(seat)
    return acc
  }, {} as Record<number, Seat[]>)

  const rows = Object.keys(seatsByRow)
    .map(Number)
    .sort((a, b) => a - b)

  // Переключение выбора места
  const toggleSeat = (seatId: string) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId)
      } else {
        return [...prev, seatId]
      }
    })
  }

  // Проверка, забронировано ли место
  const isSeatBooked = (seatId: string) => {
    return session.bookedSeatIds.includes(seatId)
  }

  // Проверка, выбрано ли место
  const isSeatSelected = (seatId: string) => {
    return selectedSeats.includes(seatId)
  }

  // Получаем выбранные места с деталями
  const selectedSeatsDetails = selectedSeats.map(seatId => {
    const seat = session.hall.seats.find(s => s.id === seatId)
    return seat
  }).filter(Boolean) as Seat[]

  // Подсчет общей стоимости
  const totalPrice = selectedSeatsDetails.reduce((sum, seat) => {
    const price = seat.isVip && session.vipPrice ? session.vipPrice : session.basePrice
    return sum + price
  }, 0)

  // Форматирование времени
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
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
    <div className="min-h-screen bg-[#0c1321] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Назад
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка - Информация о сеансе (только на десктопе) */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            {/* Постер и информация о фильме */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-800">
              {poster && (
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-4">
                  <img 
                    src={poster} 
                    alt={movieTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <h1 className="text-2xl font-bold mb-4">{movieTitle}</h1>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-gray-400">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>{formatDate(session.startTime)}</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-400">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>{formatTime(session.startTime)}</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-400">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>{session.hall.name}</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-400">
                  <Film className="w-4 h-4 flex-shrink-0" />
                  <span>{formatLanguage(session.language)} • {formatFormat(session.format)}</span>
                </div>
              </div>
            </div>

            {/* Цены */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-bold mb-4">Цены</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Обычное место</span>
                  <span className="text-xl font-bold text-green-500">{session.basePrice}с</span>
                </div>
                {session.vipPrice && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">VIP место</span>
                    <span className="text-xl font-bold text-yellow-500">{session.vipPrice}с</span>
                  </div>
                )}
              </div>
            </div>

            {/* Выбранные места и итого */}
            {selectedSeats.length > 0 && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-800">
                <h3 className="text-lg font-bold mb-4">Выбранные места</h3>
                
                <div className="space-y-2 mb-4">
                  {selectedSeatsDetails.map(seat => {
                    const price = seat.isVip && session.vipPrice ? session.vipPrice : session.basePrice
                    return (
                      <div key={seat.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">
                          Ряд {seat.rowNumber}, Место {seat.seatNumber}
                          {seat.isVip && <span className="text-yellow-400 ml-1">(VIP)</span>}
                        </span>
                        <span className="font-semibold">{price}с</span>
                      </div>
                    )
                  })}
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold">Итого:</span>
                    <span className="text-2xl font-bold text-[#e50914]">{totalPrice}с</span>
                  </div>

                  <button
                    onClick={() => {
                      // TODO: Переход на страницу оплаты
                      console.log('Переход на оплату', { selectedSeats, totalPrice })
                    }}
                    className="w-full px-6 py-3 bg-[#e50914] hover:bg-[#c50812] text-white font-bold rounded-lg transition-colors"
                  >
                    Купить ({selectedSeats.length} {selectedSeats.length === 1 ? 'место' : 'места'})
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Правая колонка - Карта зала */}
          <div className="lg:col-span-2">
            {/* Мобильная версия - Информация о фильме */}
            <div className="lg:hidden mb-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border border-gray-800">
              <div className="flex gap-4">
                {poster && (
                  <div className="relative w-24 h-32 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={poster} 
                      alt={movieTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold mb-3 line-clamp-2">{movieTitle}</h1>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{formatDate(session.startTime)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span>{formatTime(session.startTime)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{session.hall.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-400">
                      <Film className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{formatLanguage(session.language)} • {formatFormat(session.format)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-800">
              <h2 className="text-2xl font-bold mb-6">Выберите места</h2>

              <div className="space-y-6">
                {/* Экран */}
                <div className="relative w-full overflow-hidden pt-4 pb-8">
                  <div 
                    className="w-full h-16 bg-black rounded mx-auto relative overflow-hidden"
                    style={{
                      transform: 'perspective(600px) rotateX(-50deg)',
                      transformOrigin: 'center top',
                      boxShadow: '0 15px 30px rgba(0,0,0,0.4)',
                    }}
                  >
                    <video
                      width="50%"
                      height="100%"
                      src="https://stream.vidhosting.in/videos/2b05f82f.mov"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/2 h-full object-cover pointer-events-none"
                    />
                  </div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider text-center mt-2">
                    Экран
                  </p>
                </div>

                {/* Места */}
                <div className="overflow-x-auto overflow-y-auto max-h-[600px] p-6 bg-gray-900/50 rounded-lg">
                  <div className="flex flex-col items-center gap-3 min-w-max">
                    {(() => {
                      // Находим максимальное количество мест во всех рядах
                      const maxSeatsInAnyRow = Math.max(
                        ...Object.values(seatsByRow).map(seats => 
                          Math.max(...seats.map(s => s.seatNumber))
                        )
                      )

                      return rows.map((rowNum) => {
                        // Создаем полную сетку для этого ряда
                        const seatGrid = Array.from({ length: maxSeatsInAnyRow }, (_, index) => {
                          const seatNumber = index + 1
                          return seatsByRow[rowNum].find(s => s.seatNumber === seatNumber) || null
                        })

                        return (
                          <div key={rowNum} className="flex items-center gap-4 w-full justify-center">
                            {/* Номер ряда */}
                            <div className="w-10 text-center text-sm font-medium text-gray-400 flex-shrink-0">
                              {rowNum}
                            </div>

                            {/* Места в ряду */}
                            <div className="flex gap-2">
                              {seatGrid.map((seat, index) => {
                                const seatNumber = index + 1
                                
                                if (!seat || !seat.isActive) {
                                  // Пустое или неактивное место
                                  return (
                                    <div
                                      key={`empty-${rowNum}-${seatNumber}`}
                                      className="w-[28px] h-[28px]"
                                    />
                                  )
                                }

                                const isBooked = isSeatBooked(seat.id)
                                const isSelected = isSeatSelected(seat.id)

                                return (
                                  <button
                                    key={seat.id}
                                    type="button"
                                    onClick={() => !isBooked && toggleSeat(seat.id)}
                                    disabled={isBooked}
                                    className="relative group transition-all"
                                  >
                                    {/* Tooltip */}
                                    <div className={`absolute ${rowNum === 1 ? '-bottom-12' : '-top-12'} left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg pointer-events-none`}>
                                      Ряд {seat.rowNumber} - Место {seat.seatNumber}
                                      {seat.isVip && <span className="text-yellow-400 ml-1">(VIP)</span>}
                                      {isBooked && <span className="text-red-400 ml-1">(Занято)</span>}
                                      <div className={`absolute ${rowNum === 1 ? '-top-1' : '-bottom-1'} left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-700 rotate-45`}></div>
                                    </div>
                                    
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="28"
                                      height="28"
                                      viewBox="0 0 24 24"
                                      fill={isSelected ? (seat.isVip ? "rgb(234 179 8)" : "rgb(34 197 94)") : "none"}
                                      stroke={
                                        isBooked 
                                          ? "rgb(107 114 128)" 
                                          : isSelected 
                                            ? (seat.isVip ? "rgb(234 179 8)" : "rgb(34 197 94)")
                                            : seat.isVip 
                                              ? "rgb(234 179 8)" 
                                              : "rgb(34 197 94)"
                                      }
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className={`transition-all ${!isBooked && 'hover:scale-110 cursor-pointer'} ${isBooked && 'opacity-30 cursor-not-allowed'}`}
                                    >
                                      <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
                                      <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" />
                                      <path d="M5 18v2" />
                                      <path d="M19 18v2" />
                                    </svg>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>

                {/* Легенда */}
                <div className="flex items-center justify-center gap-6 pt-6 border-t border-gray-700 flex-wrap">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgb(34 197 94)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
                      <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" />
                      <path d="M5 18v2" />
                      <path d="M19 18v2" />
                    </svg>
                    <span className="text-sm text-gray-400">Доступно</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="rgb(34 197 94)"
                      stroke="rgb(34 197 94)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
                      <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" />
                      <path d="M5 18v2" />
                      <path d="M19 18v2" />
                    </svg>
                    <span className="text-sm text-gray-400">Выбрано</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgb(234 179 8)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
                      <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" />
                      <path d="M5 18v2" />
                      <path d="M19 18v2" />
                    </svg>
                    <span className="text-sm text-gray-400">VIP</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgb(107 114 128)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-30"
                    >
                      <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
                      <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" />
                      <path d="M5 18v2" />
                      <path d="M19 18v2" />
                    </svg>
                    <span className="text-sm text-gray-400">Занято</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Мобильная версия - Цены (после карты зала) */}
            <div className="lg:hidden mt-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border border-gray-800">
              <h3 className="text-lg font-bold mb-4">Цены</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Обычное место</span>
                  <span className="text-xl font-bold text-green-500">{session.basePrice}с</span>
                </div>
                {session.vipPrice && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">VIP место</span>
                    <span className="text-xl font-bold text-yellow-500">{session.vipPrice}с</span>
                  </div>
                )}
              </div>
            </div>

            {/* Мобильная версия - Выбранные места и итого (после карты зала) */}
            {selectedSeats.length > 0 && (
              <div className="lg:hidden mt-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border border-gray-800">
                <h3 className="text-lg font-bold mb-4">Выбранные места</h3>
                
                <div className="space-y-2 mb-4">
                  {selectedSeatsDetails.map(seat => {
                    const price = seat.isVip && session.vipPrice ? session.vipPrice : session.basePrice
                    return (
                      <div key={seat.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">
                          Ряд {seat.rowNumber}, Место {seat.seatNumber}
                          {seat.isVip && <span className="text-yellow-400 ml-1">(VIP)</span>}
                        </span>
                        <span className="font-semibold">{price}с</span>
                      </div>
                    )
                  })}
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold">Итого:</span>
                    <span className="text-2xl font-bold text-[#e50914]">{totalPrice}с</span>
                  </div>

                  <button
                    onClick={() => {
                      // TODO: Переход на страницу оплаты
                      console.log('Переход на оплату', { selectedSeats, totalPrice })
                    }}
                    className="w-full px-6 py-3 bg-[#e50914] hover:bg-[#c50812] text-white font-bold rounded-lg transition-colors"
                  >
                    Купить ({selectedSeats.length} {selectedSeats.length === 1 ? 'место' : 'места'})
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
