'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/Header'
import Carousel from '@/components/Carousel'
import SessionFilter from '@/components/SessionFilter'
import MovieRow from '@/components/MovieRow'
import Footer from '@/components/Footer'
import BottomNav from '@/components/BottomNav'
import { type Locale } from '@/app/i18n/config'

interface HomeClientProps {
  moviesData: any[]
  translations: any
  locale: Locale
  session: any
}

export default function HomeClient({ moviesData, translations, locale, session }: HomeClientProps) {
  const [activeDay, setActiveDay] = useState<'today' | 'tomorrow'>('today')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')

  // Подготовка данных для карусели сеансов
  const carouselSessions = useMemo(() => {
    if (!session) return []
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return moviesData
      .flatMap(movie => {
        const translation = movie.translations.find((t: any) => t.language === locale.toUpperCase()) 
          || movie.translations[0]
        
        const poster = movie.mediaFiles?.find((m: any) => m.type === 'poster')
        
        return movie.sessions
          .filter((s: any) => {
            const sessionDate = new Date(s.startTime)
            return sessionDate >= today && sessionDate < tomorrow
          })
          .map((s: any) => ({
            id: s.id,
            movieTitle: translation?.title || 'Без названия',
            posterUrl: poster?.url,
            startTime: new Date(s.startTime),
            basePrice: s.basePrice
          }))
      })
      .slice(0, 10) // Ограничиваем количество слайдов
  }, [moviesData, locale, session])

  // Форматирование и фильтрация фильмов
  const filteredMovies = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const dayAfterTomorrow = new Date(tomorrow)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

    return moviesData
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
        const targetDate = activeDay === 'today' ? today : tomorrow
        const nextDate = activeDay === 'today' ? tomorrow : dayAfterTomorrow
        
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
          return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
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
          image: poster?.url
        }
      })
      .filter((movie): movie is NonNullable<typeof movie> => movie !== null) // Убираем null с правильной типизацией
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
        // Фильтр по категории
        if (selectedCategory !== 'all') {
          const genreLower = movie.genre.toLowerCase()
          
          // Маппинг категорий на жанры (поддержка русского и английского)
          const categoryMap: Record<string, string[]> = {
            'action': ['боевик', 'action'],
            'comedy': ['комедия', 'comedy'],
            'drama': ['драма', 'drama'],
            'fantasy': ['фантастика', 'fantasy', 'sci-fi', 'научная фантастика'],
            'horror': ['ужасы', 'horror'],
            'thriller': ['триллер', 'thriller']
          }
          
          const searchTerms = categoryMap[selectedCategory] || [selectedCategory]
          return searchTerms.some(term => genreLower.includes(term.toLowerCase()))
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
  }, [moviesData, locale, activeDay, searchQuery, selectedCategory, selectedYear])

  // Разделяем фильмы по категориям
  // Если выбрана конкретная категория, показываем только одну секцию с этими фильмами
  const popularMovies = selectedCategory === 'all' ? filteredMovies.slice(0, 6) : []
  const comingSoonMovies = selectedCategory === 'all' ? filteredMovies.slice(6, 12) : []
  
  // Боевики - только если не выбрана другая категория
  const actionMovies = selectedCategory === 'all' 
    ? filteredMovies.filter(m => {
        const genreLower = m.genre.toLowerCase()
        return genreLower.includes('боевик') || genreLower.includes('action')
      }).slice(0, 6)
    : []
  
  // Комедии
  const comedyMovies = selectedCategory === 'all'
    ? filteredMovies.filter(m => {
        const genreLower = m.genre.toLowerCase()
        return genreLower.includes('комедия') || genreLower.includes('comedy')
      }).slice(0, 6)
    : []
  
  // Ужасы
  const horrorMovies = selectedCategory === 'all'
    ? filteredMovies.filter(m => {
        const genreLower = m.genre.toLowerCase()
        return genreLower.includes('ужасы') || genreLower.includes('horror')
      }).slice(0, 6)
    : []
  
  // Если выбрана категория, показываем все отфильтрованные фильмы в одной секции
  const categoryFilteredMovies = selectedCategory !== 'all' ? filteredMovies : []
  
  // Маппинг названий категорий для отображения
  const categoryNames: Record<string, string> = {
    'action': translations.sessionFilter?.categories?.action || 'Боевики',
    'comedy': translations.sessionFilter?.categories?.comedy || 'Комедии',
    'drama': translations.sessionFilter?.categories?.drama || 'Драмы',
    'fantasy': translations.sessionFilter?.categories?.fantasy || 'Фантастика',
    'horror': translations.sessionFilter?.categories?.horror || 'Ужасы',
    'thriller': translations.sessionFilter?.categories?.thriller || 'Триллеры'
  }
  
  const selectedCategoryName = categoryNames[selectedCategory] || selectedCategory

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <Header translations={translations} locale={locale} isAuthenticated={!!session} />

      {/* Hero Section - Full Screen Centered */}
      <Carousel translations={translations} isAuthenticated={!!session} sessions={carouselSessions} />

      {/* Main Content */}
      <main className="pb-12 md:pb-12">
        <div className="container mx-auto space-y-12 md:space-y-16 py-12 mb-16 md:mb-0">
          {/* Session Filter - Centered */}
          <div className="max-w-6xl mx-auto px-4">
            <SessionFilter 
              translations={translations}
              activeDay={activeDay}
              onDayChange={setActiveDay}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />
          </div>

          {/* Movie Rows */}
          {filteredMovies.length > 0 ? (
            <>
              {/* Если выбрана категория, показываем одну секцию */}
              {categoryFilteredMovies.length > 0 ? (
                <MovieRow 
                  title={selectedCategoryName} 
                  movies={categoryFilteredMovies} 
                  isAuthenticated={!!session} 
                />
              ) : (
                <>
                  {/* Иначе показываем все секции */}
                  {popularMovies.length > 0 && (
                    <MovieRow title={translations.movieRows.popularToday} movies={popularMovies} isAuthenticated={!!session} />
                  )}
                  {comingSoonMovies.length > 0 && (
                    <MovieRow title={translations.movieRows.comingSoon} movies={comingSoonMovies} isAuthenticated={!!session} />
                  )}
                  {/* Показываем секцию "Боевики" только если есть боевики */}
                  {actionMovies.length > 0 && (
                    <MovieRow title={translations.movieRows.action} movies={actionMovies} isAuthenticated={!!session} />
                  )}
                  {/* Показываем секцию "Комедии" только если есть комедии */}
                  {comedyMovies.length > 0 && (
                    <MovieRow title={translations.sessionFilter?.categories?.comedy || 'Комедии'} movies={comedyMovies} isAuthenticated={!!session} />
                  )}
                  {/* Показываем секцию "Ужасы" только если есть ужасы */}
                  {horrorMovies.length > 0 && (
                    <MovieRow title={translations.sessionFilter?.categories?.horror || 'Ужасы'} movies={horrorMovies} isAuthenticated={!!session} />
                  )}
                </>
              )}
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
      </main>

      {/* Footer - только для неавторизованных пользователей */}
      {!session && <Footer />}

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav />
    </div>
  )
}
