'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import MovieCard from './MovieCard'

interface Movie {
  id: string
  title: string
  genre: string
  rating: number
  price: number
  times: string[]
  image?: string
  ageRating?: string
}

interface MovieRowProps {
  title: string
  movies: Movie[]
  isAuthenticated?: boolean
}

export default function MovieRow({ title, movies, isAuthenticated = false }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -800 : 800
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="space-y-3 group/row">
      <h2 className="text-xl md:text-2xl font-bold text-center md:text-left px-4 md:px-0">{title}</h2>
      
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-black to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center hover:scale-110"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        {/* Movies Container */}
        <div
          ref={rowRef}
          className="flex gap-4 md:gap-5 overflow-x-auto hide-scrollbar px-4 md:px-0 scroll-smooth"
        >
          {movies.map((movie) => (
            <div key={movie.id} className="flex-none w-[220px] md:w-[280px] lg:w-[320px]">
              <MovieCard
                movieId={movie.id}
                title={movie.title}
                genre={movie.genre}
                rating={movie.rating}
                price={movie.price}
                times={movie.times}
                image={movie.image}
                isAuthenticated={isAuthenticated}
                ageRating={movie.ageRating}
              />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-black to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center hover:scale-110"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  )
}
