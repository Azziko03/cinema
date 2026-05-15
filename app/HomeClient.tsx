'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import Carousel from '@/components/Carousel'
import SessionFilter from '@/components/SessionFilter'
import MovieRow from '@/components/MovieRow'
import Footer from '@/components/Footer'
import BottomNav from '@/components/BottomNav'
import { type Locale } from '@/app/i18n/config'

interface HomeClientProps {
  moviesByHall: Array<{
    hall: {
      id: string
      name: string
      description: string | null
      totalSeats: number
    }
    movies: any[]
  }>
  translations: any
  locale: Locale
  session: any
}

export default function HomeClient({ moviesByHall, translations, locale, session }: HomeClientProps) {
  const [activeDay, setActiveDay] = useState<'today' | 'tomorrow'>('today')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedYear, setSelectedYear] = useState('all')

  // Карусель показываем только для неавторизованных пользователей
  const carouselSessions: any[] = []

  // Форматирование и фильтрация фильмов по залам
  const filteredMoviesByHall = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const dayAfterTomorrow = new Date(tomorrow)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

    const targetDate = activeDay === 'today' ? today : tomorrow
    const nextDate = activeDay === 'today' ? tomorrow : dayAfterTomorrow

    return moviesByHall.map(hallData => {
      const filteredMovies = hallData.movies
        .map(movie => {
          const translation = movie.translations.find((t: any) => t.language === locale.toUpperCase()) 
            || movie.translations[0]
          
          const genres = movie.genres
            .map((mg: any) => {
              const genreTranslation = mg.genre.translations.find((t: any) => t.language === locale.toUpperCase())
                || mg.genre.translations[0]
              return genreTranslation?.title
            })
            .filter(Boolean)
            .join(', ')

          // Фильтруем сеансы по выбранному дню
          const filteredSessions = movie.sessions.filter((session: any) => {
            const sessionDate = new Date(session.startTime)
            return sessionDate >= targetDate && sessionDate < nextDate
          })

          // Если нет сеансов на выбранный день, пропускаем фильм
          if (filteredSessions.length === 0) {
            return null
          }

          const times = filteredSessions.map((session: any) => {
            const date = new Date(session.startTime)
            return {
              time: date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
              sessionId: session.id
            }
          })

          const minPrice = Math.min(...filteredSessions.map((s: any) => Number(s.basePrice)))

          // Получаем постер фильма
          const poster = movie.mediaFiles?.find((m: any) => m.type === 'poster')

          return {
            id: movie.id,
            title: translation?.title || 'Без названия',
            genre: genres || 'Без жанра',
            rating: movie.averageRating || 0,
            price: minPrice,
            times: times,
            year: movie.metadata?.year || new Date(movie.releaseDate).getFullYear(),
            image: poster?.url,
            ageRating: movie.ageRating,
            hallId: hallData.hall.id // Добавляем ID зала
          }
        })
        .filter((movie): movie is NonNullable<typeof movie> => movie !== null)
        .filter(movie => {
          // Фильтр по поиску
          if (searchQuery) {
            const query = searchQuery.toLowerCase()
            return movie.title.toLowerCase().includes(query) || 
                   movie.genre.toLowerCase().includes(query)
          }
          return true
        })
        .filter(movie => {
          // Фильтр по году
          if (selectedYear !== 'all') {
            return movie.year.toString() === selectedYear
          }
          return true
        })

      return {
        hall: hallData.hall,
        movies: filteredMovies
      }
    }).filter(hallData => hallData.movies.length > 0) // Показываем только залы с фильмами
  }, [moviesByHall, locale, activeDay, searchQuery, selectedYear])

  // Проверяем, есть ли хоть один фильм
  const hasAnyMovies = filteredMoviesByHall.some(hallData => hallData.movies.length > 0)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <Header translations={translations} locale={locale} isAuthenticated={!!session} />

      {/* Sidebar - только для авторизованных */}
      {session && <Sidebar translations={translations} />}

      {/* Hero Section - только для неавторизованных */}
      {!session && <Carousel translations={translations} isAuthenticated={false} sessions={[]} />}

      {/* Main Content */}
      <main className={`pb-12 md:pb-12 ${session ? 'lg:ml-[304px] lg:mr-6' : ''}`}>
        <div className={`${session ? 'pt-24' : 'py-12'} mb-16 md:mb-0`}>
          {/* Session Filter */}
          <div className="max-w-full px-4 lg:px-0">
            <SessionFilter 
              translations={translations}
              activeDay={activeDay}
              onDayChange={setActiveDay}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory="all"
              onCategoryChange={() => {}} // Больше не используется
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              hideCategories={true} // Скрываем фильтр по категориям
            />
          </div>

          {/* Movie Rows by Halls */}
          <div className="space-y-6 mt-6">
            {hasAnyMovies ? (
              <>
                {filteredMoviesByHall.map((hallData, index) => (
                  <div key={hallData.hall.id}>
                    <MovieRow 
                      title={hallData.hall.name}
                      movies={hallData.movies} 
                      isAuthenticated={!!session} 
                    />
                    {index < filteredMoviesByHall.length - 1 && (
                      <hr className="border-gray-800 my-4" />
                    )}
                  </div>
                ))}
              </>
            ) : (
              /* Если нет фильмов, показываем сообщение */
              <div className="text-center py-20">
                <p className="text-2xl text-gray-400">
                  {activeDay === 'today' ? 'Нет сеансов на сегодня' : 'Нет сеансов на завтра'}
                </p>
                <p className="text-gray-500 mt-2">Попробуйте выбрать другой день</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer - только для неавторизованных пользователей */}
      {!session && <Footer />}

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav />
    </div>
  )
}
