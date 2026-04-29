import Header from '@/components/Header'
import Carousel from '@/components/Carousel'
import SessionFilter from '@/components/SessionFilter'
import MovieRow from '@/components/MovieRow'
import { getLocale } from '@/app/i18n/cookies'
import { getTranslations } from '@/app/i18n'

// Моковые данные для демонстрации
const popularMovies = [
  {
    id: 1,
    title: 'Интерстеллар',
    genre: 'Фантастика, Драма',
    rating: 8.6,
    price: 350,
    times: ['10:00', '13:30', '17:00', '20:30'],
  },
  {
    id: 2,
    title: 'Начало',
    genre: 'Фантастика, Триллер',
    rating: 8.8,
    price: 400,
    times: ['11:00', '14:00', '18:30', '21:00'],
  },
  {
    id: 3,
    title: 'Темный рыцарь',
    genre: 'Боевик, Криминал',
    rating: 9.0,
    price: 380,
    times: ['12:00', '15:30', '19:00', '22:00'],
  },
  {
    id: 4,
    title: 'Форрест Гамп',
    genre: 'Драма, Мелодрама',
    rating: 8.8,
    price: 320,
    times: ['10:30', '14:30', '18:00', '21:30'],
  },
  {
    id: 5,
    title: 'Матрица',
    genre: 'Фантастика, Боевик',
    rating: 8.7,
    price: 370,
    times: ['11:30', '15:00', '19:30', '22:30'],
  },
  {
    id: 6,
    title: 'Побег из Шоушенка',
    genre: 'Драма',
    rating: 9.3,
    price: 340,
    times: ['09:30', '13:00', '16:30', '20:00'],
  },
]

const comingSoon = [
  {
    id: 7,
    title: 'Дюна: Часть 2',
    genre: 'Фантастика, Приключения',
    rating: 8.9,
    price: 450,
    times: ['10:00', '14:00', '18:00', '21:00'],
  },
  {
    id: 8,
    title: 'Оппенгеймер',
    genre: 'Биография, Драма',
    rating: 8.7,
    price: 420,
    times: ['11:00', '15:00', '19:00', '22:00'],
  },
  {
    id: 9,
    title: 'Барби',
    genre: 'Комедия, Приключения',
    rating: 7.8,
    price: 380,
    times: ['10:30', '13:30', '16:30', '19:30'],
  },
  {
    id: 10,
    title: 'Килеры цветочной луны',
    genre: 'Криминал, Драма',
    rating: 8.2,
    price: 400,
    times: ['12:00', '16:00', '20:00'],
  },
  {
    id: 11,
    title: 'Наполеон',
    genre: 'Биография, Драма',
    rating: 7.5,
    price: 390,
    times: ['11:30', '15:30', '19:30'],
  },
  {
    id: 12,
    title: 'Бедные-несчастные',
    genre: 'Комедия, Драма',
    rating: 8.4,
    price: 410,
    times: ['10:00', '14:00', '18:00', '21:00'],
  },
]

const actionMovies = [
  {
    id: 13,
    title: 'Джон Уик 4',
    genre: 'Боевик, Триллер',
    rating: 8.5,
    price: 400,
    times: ['11:00', '14:30', '18:00', '21:30'],
  },
  {
    id: 14,
    title: 'Миссия невыполнима',
    genre: 'Боевик, Приключения',
    rating: 8.3,
    price: 420,
    times: ['10:30', '14:00', '17:30', '21:00'],
  },
  {
    id: 15,
    title: 'Форсаж 10',
    genre: 'Боевик, Криминал',
    rating: 7.2,
    price: 380,
    times: ['12:00', '15:30', '19:00', '22:00'],
  },
  {
    id: 16,
    title: 'Аватар: Путь воды',
    genre: 'Фантастика, Боевик',
    rating: 8.1,
    price: 450,
    times: ['10:00', '14:00', '18:00', '21:30'],
  },
  {
    id: 17,
    title: 'Человек-паук',
    genre: 'Боевик, Приключения',
    rating: 8.7,
    price: 400,
    times: ['11:00', '14:30', '18:00', '21:00'],
  },
  {
    id: 18,
    title: 'Бэтмен',
    genre: 'Боевик, Криминал',
    rating: 8.4,
    price: 390,
    times: ['10:30', '14:00', '17:30', '21:00'],
  },
]

export default async function Home() {
  const locale = await getLocale()
  const translations = await getTranslations(locale, 'landing')

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <Header translations={translations} locale={locale} />

      {/* Hero Section - Full Screen Centered */}
      <Carousel translations={translations} />

      {/* Main Content */}
      <main className="pb-12">
        <div className="container mx-auto space-y-12 md:space-y-16 py-12">
          {/* Session Filter - Centered */}
          <div className="max-w-2xl mx-auto px-4">
            <SessionFilter translations={translations} />
          </div>

          {/* Movie Rows */}
          <MovieRow title={translations.movieRows.popularToday} movies={popularMovies} />
          <MovieRow title={translations.movieRows.comingSoon} movies={comingSoon} />
          <MovieRow title={translations.movieRows.action} movies={actionMovies} />
        </div>
      </main>
    </div>
  )
}
