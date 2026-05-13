'use client'

import { useState } from 'react'
import { Star, Clock, Calendar, Globe, Film, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'
import RatingSection from './RatingSection'
import BuyTicketSection from './BuyTicketSection'

interface MovieDetailClientProps {
  movie: any
  session: any
  locale: string
}

// Функция для определения типа трейлера
function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

// Функция для конвертации YouTube URL в embed формат
function getYouTubeEmbedUrl(url: string): string {
  // Если это уже embed URL, возвращаем как есть
  if (url.includes('youtube.com/embed/')) {
    return url
  }
  
  // Извлекаем video ID из различных форматов YouTube URL
  let videoId = ''
  
  // https://www.youtube.com/watch?v=VIDEO_ID
  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('watch?v=')[1]?.split('&')[0] || ''
  }
  // https://youtu.be/VIDEO_ID
  else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || ''
  }
  // https://www.youtube.com/v/VIDEO_ID
  else if (url.includes('youtube.com/v/')) {
    videoId = url.split('youtube.com/v/')[1]?.split('?')[0] || ''
  }
  
  // Если нашли video ID, возвращаем embed URL
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
  }
  
  // Если это не YouTube URL или не удалось распарсить, возвращаем оригинальный URL
  return url
}

export default function MovieDetailClient({ movie, session, locale }: MovieDetailClientProps) {
  const router = useRouter()
  const [showTrailer, setShowTrailer] = useState(false)

  // Получаем перевод для текущего языка
  const translation = movie.translations.find((t: any) => t.language === locale.toUpperCase()) 
    || movie.translations[0]

  // Получаем постер
  const poster = movie.mediaFiles.find((m: any) => m.type === 'poster')
  
  // Получаем трейлер
  const trailer = movie.mediaFiles.find((m: any) => m.type === 'trailer')

  // Получаем жанры
  const genres = movie.genres.map((mg: any) => {
    const genreTranslation = mg.genre.translations.find((t: any) => t.language === locale.toUpperCase())
      || mg.genre.translations[0]
    return genreTranslation?.title || ''
  }).filter(Boolean).join(', ')

  // Форматируем дату
  const releaseDate = new Date(movie.releaseDate).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Mobile Hero Section */}
      <div className="lg:hidden">
        {/* Header с кнопкой назад */}
        <div className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-gray-800">
          <div className="flex items-center gap-4 p-4">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold line-clamp-1 flex-1">{translation?.title}</h1>
          </div>
        </div>

        {/* Постер и основная информация в один ряд */}
        <div className="p-4">
          <div className="flex gap-4">
            {/* Постер слева - маленький */}
            <div className="flex-shrink-0 w-32">
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 to-black">
                {poster ? (
                  <img 
                    src={poster.url} 
                    alt={translation?.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Film className="w-12 h-12 text-gray-700" />
                  </div>
                )}
              </div>
            </div>

            {/* Информация справа */}
            <div className="flex-1 flex flex-col justify-between min-h-[192px]">
              {/* Название */}
              <div>
                <h2 className="text-xl font-bold mb-2 line-clamp-2">{translation?.title}</h2>
                
                {/* Метаданные */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Длительность:</span>
                    <span className="text-gray-300">{movie.durationMinutes} мин</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Режиссер:</span>
                    <span className="text-gray-300">Шон Леви</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Возраст:</span>
                    <span className="px-2 py-0.5 bg-gray-800 rounded text-xs">{movie.ageRating}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 flex-shrink-0">Жанр:</span>
                    <span className="text-gray-300 line-clamp-2">{genres || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Watch Trailer */}
        {trailer && (
          <div className="px-4 py-4">
            <h2 className="text-xl font-bold mb-3">Смотреть трейлер</h2>
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
              {showTrailer ? (
                <div className="relative w-full h-full">
                  {isYouTubeUrl(trailer.url) ? (
                    // YouTube трейлер
                    <iframe
                      src={getYouTubeEmbedUrl(trailer.url)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    // Локальное видео из S3
                    <video
                      className="w-full h-full"
                      controls
                      autoPlay
                      playsInline
                    >
                      <source src={trailer.url} type="video/mp4" />
                      <source src={trailer.url} type="video/quicktime" />
                      <source src={trailer.url} type="video/webm" />
                      Ваш браузер не поддерживает воспроизведение видео.
                    </video>
                  )}
                  <button
                    onClick={() => setShowTrailer(false)}
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/70 hover:bg-black/90 transition-colors z-10"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div 
                  className="relative w-full h-full cursor-pointer group"
                  onClick={() => setShowTrailer(true)}
                >
                  {poster && (
                    <img 
                      src={poster.url} 
                      alt="Trailer preview"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-16 h-16 rounded-full bg-[#e50914] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white ml-1" fill="white" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Synopsis */}
        <div className="px-4 py-4">
          <h2 className="text-xl font-bold mb-3">Описание</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            {translation?.description || 'Описание отсутствует'}
          </p>
        </div>

        {/* Rating */}
        <RatingSection 
          movieId={movie.id}
          imdbRating={movie.metadata?.imdbRating}
          kinopoiskRating={movie.metadata?.kinopoiskRating}
          isAuthenticated={!!session}
        />

        {/* Buy Ticket Section - Mobile */}
        <div className="px-4 py-4">
          <BuyTicketSection 
            movieId={movie.id}
            movieTitle={translation?.title}
            sessions={movie.sessions}
            isAuthenticated={!!session}
          />
        </div>
      </div>

      {/* Desktop Version */}
      <div className="hidden lg:block container mx-auto px-4 py-8">
        {/* Кнопка назад для desktop */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Назад</span>
        </button>

        {/* Основная информация */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Постер */}
          <div className="lg:col-span-1">
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 to-black">
              {poster ? (
                <img 
                  src={poster.url} 
                  alt={translation?.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Film className="w-24 h-24 text-gray-700" />
                </div>
              )}
            </div>
          </div>

          {/* Информация о фильме */}
          <div className="lg:col-span-2 space-y-6">
            {/* Название */}
            <h1 className="text-4xl md:text-5xl font-bold">{translation?.title}</h1>

            {/* Метаданные */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-400">Длительность</p>
                  <p className="font-semibold">{movie.durationMinutes} мин</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-400">Возраст</p>
                  <p className="font-semibold">{movie.ageRating}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-400">Страна</p>
                  <p className="font-semibold">{movie.metadata?.country || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-400">Год</p>
                  <p className="font-semibold">{movie.metadata?.year || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-400">Дата выхода</p>
                  <p className="font-semibold">{releaseDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-400">Жанр</p>
                  <p className="font-semibold">{genres || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Трейлер */}
        {trailer && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Смотреть трейлер</h2>
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
              {showTrailer ? (
                <div className="relative w-full h-full">
                  {isYouTubeUrl(trailer.url) ? (
                    // YouTube трейлер
                    <iframe
                      src={getYouTubeEmbedUrl(trailer.url)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    // Локальное видео из S3
                    <video
                      className="w-full h-full"
                      controls
                      autoPlay
                      playsInline
                    >
                      <source src={trailer.url} type="video/mp4" />
                      <source src={trailer.url} type="video/quicktime" />
                      <source src={trailer.url} type="video/webm" />
                      Ваш браузер не поддерживает воспроизведение видео.
                    </video>
                  )}
                  <button
                    onClick={() => setShowTrailer(false)}
                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-black/70 hover:bg-black/90 transition-colors z-10"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div 
                  className="relative w-full h-full cursor-pointer group"
                  onClick={() => setShowTrailer(true)}
                >
                  {poster && (
                    <img 
                      src={poster.url} 
                      alt="Trailer preview"
                      className="w-full h-full object-cover opacity-50"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-[#e50914] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-10 h-10 text-white ml-1" fill="white" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Описание */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Описание</h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            {translation?.description || 'Описание отсутствует'}
          </p>
        </div>

        {/* Рейтинг */}
        <RatingSection 
          movieId={movie.id}
          imdbRating={movie.metadata?.imdbRating}
          kinopoiskRating={movie.metadata?.kinopoiskRating}
          isAuthenticated={!!session}
        />

        {/* Купить билет */}
        <BuyTicketSection 
          movieId={movie.id}
          movieTitle={translation?.title}
          sessions={movie.sessions}
          isAuthenticated={!!session}
        />
      </div>
    </div>
  )
}
