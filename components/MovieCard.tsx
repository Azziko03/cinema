'use client'

import { Star, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MovieCardProps {
  movieId?: string
  hallId?: string // Добавляем hallId
  title: string
  genre: string
  rating: number
  price: number
  times: Array<{ time: string; sessionId: string }> | string[]
  image?: string
  isAuthenticated?: boolean
  ageRating?: string
}

export default function MovieCard({ movieId, hallId, title, genre, rating, price, times, image, isAuthenticated = false, ageRating }: MovieCardProps) {
  const router = useRouter()

  const handleLoginClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push('/auth/signup')
  }

  const handleCardClick = () => {
    if (movieId) {
      // Передаем hallId в query параметре
      const url = hallId ? `/movies/${movieId}?hallId=${hallId}` : `/movies/${movieId}`
      router.push(url)
    }
  }

  const handleTimeClick = (e: React.MouseEvent, sessionId?: string) => {
    e.stopPropagation()
    if (sessionId && isAuthenticated) {
      router.push(`/booking/${sessionId}`)
    } else if (!isAuthenticated) {
      router.push('/auth/signup')
    }
  }

  // Нормализуем times к единому формату
  const normalizedTimes = times.map(t => 
    typeof t === 'string' ? { time: t, sessionId: undefined } : t
  )

  return (
    <div 
      onClick={handleCardClick}
      className="movie-card group relative bg-black rounded-lg overflow-hidden cursor-pointer border border-gray-900 w-full"
    >
      {/* Постер */}
      <div className="relative aspect-[6/6] bg-gradient-to-br from-gray-900 to-black">
        {image ? (
          <img 
            src={image} 
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-7xl opacity-20">🎬</div>
          </div>
        )}
        
        {/* Hover Overlay - Авторизация (только для неавторизованных) */}
        {!isAuthenticated && (
          <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
            <div className="w-16 h-16 rounded-full bg-[#e50914] flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <p className="text-white text-center font-semibold text-sm">Авторизуйтесь для покупки</p>
            <button 
              onClick={handleLoginClick}
              className="px-6 py-2 bg-white text-black rounded-full font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              Войти
            </button>
          </div>
        )}

        {/* Рейтинг */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/80 backdrop-blur-sm px-2 py-1 rounded">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-semibold">{rating}</span>
        </div>
      </div>

      {/* Информация */}
      <div className="p-3 space-y-2 bg-black">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm line-clamp-1">{title}</h3>
            <p className="text-xs text-gray-400 line-clamp-1">{genre}</p>
          </div>
          {ageRating && (
            <div className="flex-shrink-0 px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-xs font-semibold text-gray-300">
              {ageRating}
            </div>
          )}
        </div>

        {/* Цена */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-900">
          <span className="text-xs text-gray-500">От</span>
          <span className="text-lg font-bold text-[#e50914]">{price}с</span>
        </div>

        {/* Время сеансов */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {normalizedTimes.slice(0, 2).map((timeData, index) => (
            <button
              key={index}
              onClick={(e) => handleTimeClick(e, timeData.sessionId)}
              className="px-2 py-1 text-xs rounded bg-[#1a1a1a] hover:bg-[#e50914] transition-colors border border-gray-900 hover:border-[#e50914]"
            >
              {timeData.time}
            </button>
          ))}
          {normalizedTimes.length > 2 && (
            <button 
              onClick={(e) => e.stopPropagation()}
              className="px-2 py-1 text-xs rounded bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors border border-gray-900"
            >
              +{normalizedTimes.length - 2}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
