export type Language = 'RU' | 'KG' | 'EN'
export type Theme = 'light' | 'dark'

export interface Movie {
  id: number
  title: string
  genre: string
  rating: number
  price: number
  times: string[]
  image?: string
}

export interface Session {
  id: string
  movieId: string
  time: string
  price: number
  availableSeats: number
}
