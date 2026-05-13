'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Session {
  id: string
  movieTitle: string
  posterUrl?: string
  startTime: Date
  basePrice: number
}

interface CarouselProps {
  translations: any
  isAuthenticated?: boolean
  sessions?: Session[]
}

export default function Carousel({ translations, isAuthenticated = false, sessions = [] }: CarouselProps) {
  const [current, setCurrent] = useState(0)
  const router = useRouter()
  const t = translations.carousel

  const slides = [
    {
      id: 1,
      title: t.slides.interstellar.title,
      description: t.slides.interstellar.description,
      rating: '8.6',
      year: t.slides.interstellar.year,
      duration: t.slides.interstellar.duration,
    },
    {
      id: 2,
      title: t.slides.inception.title,
      description: t.slides.inception.description,
      rating: '8.8',
      year: t.slides.inception.year,
      duration: t.slides.inception.duration,
    },
    {
      id: 3,
      title: t.slides.darkKnight.title,
      description: t.slides.darkKnight.description,
      rating: '9.0',
      year: t.slides.darkKnight.year,
      duration: t.slides.darkKnight.duration,
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      if (isAuthenticated && sessions.length > 0) {
        setCurrent((prev) => (prev + 1) % sessions.length)
      } else {
        setCurrent((prev) => (prev + 1) % slides.length)
      }
    }, 7000)
    return () => clearInterval(timer)
  }, [isAuthenticated, sessions.length])

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
  }

  const handleLoginClick = () => {
    router.push('/auth/signup')
  }

  const nextSlide = () => {
    if (isAuthenticated && sessions.length > 0) {
      setCurrent((prev) => (prev + 1) % sessions.length)
    } else {
      setCurrent((prev) => (prev + 1) % slides.length)
    }
  }

  const prevSlide = () => {
    if (isAuthenticated && sessions.length > 0) {
      setCurrent((prev) => (prev - 1 + sessions.length) % sessions.length)
    } else {
      setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
    }
  }

  // Если пользователь авторизован, показываем карусель с постерами сеансов
  if (isAuthenticated && sessions.length > 0) {
    const session = sessions[current]
    
    return (
      <div className="relative w-full h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Фоновое изображение постера на весь экран */}
        {session.posterUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${session.posterUrl})` }}
          >
            <div className="absolute inset-0 bg-black/40" />
          </div>
        )}
        {!session.posterUrl && <div className="absolute inset-0 bg-black" />}

        {/* Кнопки навигации */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          aria-label="Предыдущий слайд"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          aria-label="Следующий слайд"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Индикаторы */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2.5 z-20">
          {sessions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === current
                  ? 'bg-white w-10'
                  : 'bg-gray-600 w-2.5 hover:bg-gray-400'
              }`}
              aria-label={`Перейти к слайду ${index + 1}`}
            />
          ))}
        </div>

        {/* Scroll Down Indicator */}
        <button
          onClick={scrollToContent}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce z-20"
          aria-label={t.scrollDown}
        >
          <ChevronDown className="w-9 h-9 md:w-10 md:h-10 text-gray-400" />
        </button>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </div>
    )
  }

  // Для неавторизованных пользователей показываем оригинальную карусель
  const slide = slides[current]

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Pure Black Background */}
      <div className="absolute inset-0 bg-black" />

      {/* Floating Cards - Top Left */}
      <div className="absolute left-12 md:left-24 lg:left-46 top-20 md:top-34 hidden lg:block">
        <div className="backdrop-blur-md bg-white/5 rounded-2xl p-4 w-56 border border-white/10 shadow-2xl opacity-60">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🎬</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm mb-1">Интерстеллар</h3>
              <p className="text-xs text-gray-400 mb-2">Фантастика, Драма</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">350 сом</span>
                <span className="text-gray-500">2 часа</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Cards - Bottom Left */}
      <div className="absolute left-12 md:left-24 lg:left-76 bottom-32 md:bottom-63 hidden lg:block">
        <div className="backdrop-blur-md bg-white/5 rounded-2xl p-4 w-56 border border-white/10 shadow-2xl opacity-60">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🎭</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm mb-1">Начало</h3>
              <p className="text-xs text-gray-400 mb-2">Фантастика, Триллер</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">400 сом</span>
                <span className="text-gray-500">2.5 часа</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Cards - Top Right */}
      <div className="absolute right-12 md:right-24 lg:right-44 top-20 md:top-32 hidden lg:block">
        <div className="backdrop-blur-md bg-white/5 rounded-2xl p-4 w-56 border border-white/10 shadow-2xl opacity-60">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🎪</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm mb-1">Темный рыцарь</h3>
              <p className="text-xs text-gray-400 mb-2">Боевик, Криминал</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">380 сом</span>
                <span className="text-gray-500">2.5 часа</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Cards - Bottom Right */}
      <div className="absolute right-12 md:right-24 lg:right-80 bottom-32 md:bottom-64 hidden lg:block">
        <div className="backdrop-blur-md bg-white/5 rounded-2xl p-4 w-56 border border-white/10 shadow-2xl opacity-60">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🎯</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm mb-1">Матрица</h3>
              <p className="text-xs text-gray-400 mb-2">Фантастика, Боевик</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">370 сом</span>
                <span className="text-gray-500">2 часа</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Centered Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto space-y-10">
        {/* Main Title */}
        <div className="space-y-5">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight">
            {slide.title}
          </h1>
          
          {/* Meta Info */}
          <div className="flex items-center justify-center gap-5 text-base md:text-lg text-gray-400">
            <span className="text-green-500 font-semibold text-xl md:text-2xl">{slide.rating} ★</span>
            <span className="text-lg">•</span>
            <span className="text-lg">{slide.year}</span>
            <span className="text-lg">•</span>
            <span className="text-lg">{slide.duration}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          {slide.description}
        </p>

        {/* CTA Button */}
        {!isAuthenticated && (
          <div className="pt-6">
            <button 
              onClick={handleLoginClick}
              className="group inline-flex items-center gap-3 px-10 md:px-14 py-4 md:py-6 bg-white text-black hover:bg-gray-100 rounded-full transition-all transform hover:scale-105 shadow-2xl"
            >
              <span className="text-lg md:text-xl lg:text-2xl font-semibold">{t.cta}</span>
            </button>
          </div>
        )}

        {/* Indicators */}
        <div className="flex items-center justify-center gap-2.5 pt-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === current
                  ? 'bg-white w-10'
                  : 'bg-gray-600 w-2.5 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce"
        aria-label={t.scrollDown}
      >
        <ChevronDown className="w-9 h-9 md:w-10 md:h-10 text-gray-400" />
      </button>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </div>
  )
}
