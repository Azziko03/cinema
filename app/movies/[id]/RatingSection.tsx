'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface RatingSectionProps {
  movieId: string
  imdbRating: number | null
  kinopoiskRating: number | null
  isAuthenticated: boolean
}

export default function RatingSection({ 
  movieId, 
  imdbRating, 
  kinopoiskRating,
  isAuthenticated 
}: RatingSectionProps) {
  const router = useRouter()
  const [userRating, setUserRating] = useState<number | null>(null)
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [averageRating, setAverageRating] = useState<number>(0)
  const [totalVotes, setTotalVotes] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Загружаем рейтинг
  useEffect(() => {
    fetchRating()
  }, [movieId])

  const fetchRating = async () => {
    try {
      const response = await fetch(`/api/movies/${movieId}/rating`)
      if (response.ok) {
        const data = await response.json()
        setUserRating(data.userRating)
        setAverageRating(data.averageRating || 0)
        setTotalVotes(data.totalVotes || 0)
        setIsLoaded(true)
      }
    } catch (error) {
      console.error('Error fetching rating:', error)
      setIsLoaded(true)
    }
  }

  const handleRatingSelect = (rating: number) => {
    if (!isAuthenticated) {
      router.push('/auth/signup')
      return
    }
    setSelectedRating(rating)
  }

  const handleSubmitRating = async () => {
    if (!isAuthenticated || !selectedRating || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/movies/${movieId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating: selectedRating }),
      })

      if (response.ok) {
        const data = await response.json()
        setUserRating(selectedRating)
        setAverageRating(data.averageRating)
        setTotalVotes(data.totalVotes)
        setSelectedRating(null)
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Вычисляем процент заполнения звезды (из 10)
  const fillPercentage = (averageRating / 10) * 100

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 px-4 lg:px-0">Рейтинг</h2>
      
      {/* Mobile Version */}
      <div className="lg:hidden px-4">
        <div className="space-y-6">
          {/* Текущий рейтинг - одна большая звезда */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
                {/* Фоновая звезда (серая) */}
                <Star className="absolute inset-0 w-full h-full text-gray-600" />
                {/* Заполненная звезда (желтая) */}
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - fillPercentage}% 0 0)` }}
                >
                  <Star className="w-full h-full text-yellow-400 fill-yellow-400" />
                </div>
              </div>
            </div>
            <div className="text-5xl font-bold mb-2" suppressHydrationWarning>
              {averageRating > 0 ? averageRating.toFixed(1) : '—'}
            </div>
            <p className="text-gray-400 text-sm" suppressHydrationWarning>
              {totalVotes > 0 ? `${totalVotes} ${totalVotes === 1 ? 'голос' : totalVotes < 5 ? 'голоса' : 'голосов'}` : 'Нет оценок'}
            </p>
          </div>

          {/* Оценить фильм */}
          <div className="border-2 border-[#e50914] rounded-lg p-4">
            <h3 className="text-base font-semibold mb-3 text-center">
              {userRating ? `Ваша оценка: ${userRating}` : 'Оцените фильм'}
            </h3>
            
            <div className="flex justify-center gap-1.5 mb-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRatingSelect(rating)}
                  disabled={isSubmitting || !!userRating}
                  className={`
                    w-8 h-8 rounded-md font-bold text-sm transition-all
                    ${
                      selectedRating === rating
                        ? 'bg-[#e50914] text-white scale-105'
                        : userRating === rating
                        ? 'bg-[#e50914] text-white'
                        : 'bg-gray-800 text-gray-400'
                    }
                    ${(isSubmitting || userRating) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
                  `}
                >
                  {rating}
                </button>
              ))}
            </div>

            {selectedRating && !userRating && (
              <button
                onClick={handleSubmitRating}
                disabled={isSubmitting}
                className="w-full py-2 bg-[#e50914] text-white rounded-lg font-semibold hover:bg-[#c50812] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Отправка...' : 'Оценить'}
              </button>
            )}

            {!isAuthenticated && (
              <p className="text-center text-xs text-gray-400 mt-3">
                Войдите, чтобы оценить фильм
              </p>
            )}
          </div>

          {/* Внешние рейтинги - только Кинопоиск */}
          {kinopoiskRating && (
            <div className="flex justify-center pt-4 border-t border-gray-800">
              <div className="text-center">
                <div className="text-orange-400 font-bold text-sm mb-1">Кинопоиск</div>
                <div className="text-2xl font-semibold">{kinopoiskRating.toFixed(1)}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Version */}
      <div className="hidden lg:block">
        {/* Основной рейтинг - одна большая звезда по центру */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              {/* Фоновая звезда (серая) */}
              <Star className="absolute inset-0 w-full h-full text-gray-600" />
              {/* Заполненная звезда (желтая) */}
              <div 
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - fillPercentage}% 0 0)` }}
              >
                <Star className="w-full h-full text-yellow-400 fill-yellow-400" />
              </div>
            </div>
            <div>
              <div className="text-6xl font-bold mb-2" suppressHydrationWarning>
                {averageRating > 0 ? averageRating.toFixed(1) : '—'}
              </div>
              <p className="text-gray-400" suppressHydrationWarning>
                {totalVotes > 0 ? `${totalVotes} ${totalVotes === 1 ? 'голос' : totalVotes < 5 ? 'голоса' : 'голосов'}` : 'Нет оценок'}
              </p>
            </div>
          </div>

          {/* Внешние рейтинги - только Кинопоиск */}
          {kinopoiskRating && (
            <div className="mt-6 pt-4 border-t border-gray-800">
              <div className="flex items-center gap-2 justify-center">
                <span className="text-orange-400 font-bold">Кинопоиск</span>
                <span className="text-xl font-semibold">{kinopoiskRating.toFixed(1)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Оценить фильм */}
        <div className="mt-8 p-6 border-2 border-[#e50914] rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-center">
            {userRating ? `Ваша оценка: ${userRating}` : 'Оцените фильм'}
          </h3>
          
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingSelect(rating)}
                disabled={isSubmitting || !!userRating}
                className={`
                  w-12 h-12 rounded-lg font-bold text-lg transition-all
                  ${
                    selectedRating === rating
                      ? 'bg-[#e50914] text-white scale-110'
                      : userRating === rating
                      ? 'bg-[#e50914] text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }
                  ${(isSubmitting || userRating) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {rating}
              </button>
            ))}
          </div>

          {selectedRating && !userRating && (
            <div className="flex justify-center">
              <button
                onClick={handleSubmitRating}
                disabled={isSubmitting}
                className="px-8 py-3 bg-[#e50914] text-white rounded-lg font-semibold hover:bg-[#c50812] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Отправка...' : 'Оценить'}
              </button>
            </div>
          )}

          {!isAuthenticated && (
            <p className="text-center text-sm text-gray-400 mt-4">
              Войдите, чтобы оценить фильм
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
