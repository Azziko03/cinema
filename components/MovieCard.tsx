'use client'

import { Star, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MovieCardProps {
  movieId?: string
  title: string
  genre: string
  rating: number
  price: number
  times: string[]
  image?: string
  isAuthenticated?: boolean
  ageRating?: string
}

export default function MovieCard({ movieId, title, genre, rating, price, times, image, isAuthenticated = false, ageRating }: MovieCardProps) {
  const router = useRouter()

  const handleLoginClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push('/auth/signup')
  }

  const handleCardClick = () => {
    if (movieId) {
      router.push(`/movies/${movieId}`)
    }
  }

  return (
    <div 
      onClick={handleCardClick}
      className="movie-card group relative bg-black rounded-lg overflow-hidden cursor-pointer border border-gray-900 w-full"
    >
      {/* Постер */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-900 to-black">
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
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/80 backdrop-blur-sm px-2.5 py-1.5 rounded">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-semibold">{rating}</span>
        </div>
      </div>

      {/* Информация */}
      <div className="p-4 space-y-3 bg-black">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base line-clamp-1">{title}</h3>
            <p className="text-sm text-gray-400 line-clamp-1">{genre}</p>
          </div>
          {ageRating && (
            <div className="flex-shrink-0 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs font-semibold text-gray-300">
              {ageRating}
            </div>
          )}
        </div>

        {/* Цена */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-900">
          <span className="text-xs text-gray-500">От</span>
          <span className="text-xl font-bold text-[#e50914]">{price}с</span>
        </div>

        {/* Время сеансов */}
        <div className="flex flex-wrap gap-2 pt-2">
          {times.slice(0, 3).map((time, index) => (
            <button
              key={index}
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1.5 text-xs rounded bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors border border-gray-900"
            >
              {time}
            </button>
          ))}
          {times.length > 3 && (
            <button 
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1.5 text-xs rounded bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors border border-gray-900"
            >
              +{times.length - 3}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
