/**
 * Схемы валидации для Cinema API
 * Используйте эти функции для валидации входных данных
 */

// ============================================
// 📧 Email & Password
// ============================================

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Пароль должен содержать минимум 8 символов')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну заглавную букву')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну строчную букву')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну цифру')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// ============================================
// 🎬 Movie Validation
// ============================================

export interface CreateMovieInput {
  durationMinutes: number
  ageRating: string
  releaseDate: Date
  translations: {
    language: 'KG' | 'RU' | 'EN'
    title: string
    description: string
  }[]
  metadata: {
    country: string
    year: number
    imdbRating?: number
    kinopoiskRating?: number
  }
}

export function validateMovie(data: CreateMovieInput): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Duration
  if (data.durationMinutes < 1 || data.durationMinutes > 500) {
    errors.push('Длительность должна быть от 1 до 500 минут')
  }

  // Age rating
  const validRatings = ['0+', '6+', '12+', '16+', '18+']
  if (!validRatings.includes(data.ageRating)) {
    errors.push('Некорректный возрастной рейтинг')
  }

  // Translations
  if (!data.translations || data.translations.length === 0) {
    errors.push('Необходим хотя бы один перевод')
  }

  data.translations?.forEach((t, index) => {
    if (!t.title || t.title.trim().length === 0) {
      errors.push(`Перевод ${index + 1}: название обязательно`)
    }
    if (!t.description || t.description.trim().length === 0) {
      errors.push(`Перевод ${index + 1}: описание обязательно`)
    }
  })

  // Metadata
  if (data.metadata.year < 1900 || data.metadata.year > new Date().getFullYear() + 5) {
    errors.push('Некорректный год выпуска')
  }

  if (data.metadata.imdbRating && (data.metadata.imdbRating < 0 || data.metadata.imdbRating > 10)) {
    errors.push('Рейтинг IMDb должен быть от 0 до 10')
  }

  if (data.metadata.kinopoiskRating && (data.metadata.kinopoiskRating < 0 || data.metadata.kinopoiskRating > 10)) {
    errors.push('Рейтинг Кинопоиск должен быть от 0 до 10')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// ============================================
// 📅 Session Validation
// ============================================

export interface CreateSessionInput {
  movieId: string
  hallId: string
  startTime: Date
  endTime: Date
  basePrice: number
  language: 'original' | 'dubbed'
  format: '2D' | '3D' | 'IMAX'
}

export function validateSession(data: CreateSessionInput): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  
  if (!uuidRegex.test(data.movieId)) {
    errors.push('Некорректный ID фильма')
  }

  if (!uuidRegex.test(data.hallId)) {
    errors.push('Некорректный ID зала')
  }

  // Time validation
  const now = new Date()
  if (data.startTime < now) {
    errors.push('Время начала не может быть в прошлом')
  }

  if (data.endTime <= data.startTime) {
    errors.push('Время окончания должно быть позже времени начала')
  }

  // Price validation
  if (data.basePrice < 0) {
    errors.push('Цена не может быть отрицательной')
  }

  if (data.basePrice > 10000) {
    errors.push('Цена слишком высокая')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// ============================================
// 🎫 Booking Validation
// ============================================

export interface CreateBookingInput {
  sessionId: string
  seatIds: string[]
  userId: string
}

export function validateBooking(data: CreateBookingInput): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  if (!uuidRegex.test(data.sessionId)) {
    errors.push('Некорректный ID сеанса')
  }

  if (!uuidRegex.test(data.userId)) {
    errors.push('Некорректный ID пользователя')
  }

  if (!data.seatIds || data.seatIds.length === 0) {
    errors.push('Необходимо выбрать хотя бы одно место')
  }

  if (data.seatIds.length > 10) {
    errors.push('Максимум 10 билетов за один заказ')
  }

  data.seatIds.forEach((seatId, index) => {
    if (!uuidRegex.test(seatId)) {
      errors.push(`Место ${index + 1}: некорректный ID`)
    }
  })

  // Check for duplicates
  const uniqueSeats = new Set(data.seatIds)
  if (uniqueSeats.size !== data.seatIds.length) {
    errors.push('Обнаружены дублирующиеся места')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// ============================================
// 🏛️ Hall & Seat Validation
// ============================================

export interface CreateHallInput {
  name: string
  description?: string
  totalSeats: number
}

export function validateHall(data: CreateHallInput): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Название зала обязательно')
  }

  if (data.name.length > 100) {
    errors.push('Название зала слишком длинное (макс. 100 символов)')
  }

  if (data.totalSeats < 1 || data.totalSeats > 500) {
    errors.push('Количество мест должно быть от 1 до 500')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// ============================================
// 🤖 AI Chat Validation
// ============================================

export interface CreateChatInput {
  name: string
  userId?: string
}

export interface AddMessageInput {
  chatId: string
  sender: 'user' | 'ai'
  message: string
}

export function validateChatMessage(data: AddMessageInput): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  if (!uuidRegex.test(data.chatId)) {
    errors.push('Некорректный ID чата')
  }

  if (!['user', 'ai'].includes(data.sender)) {
    errors.push('Некорректный отправитель')
  }

  if (!data.message || data.message.trim().length === 0) {
    errors.push('Сообщение не может быть пустым')
  }

  if (data.message.length > 5000) {
    errors.push('Сообщение слишком длинное (макс. 5000 символов)')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// ============================================
// 🔧 Helper Functions
// ============================================

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export function isValidLanguage(lang: string): lang is 'KG' | 'RU' | 'EN' {
  return ['KG', 'RU', 'EN'].includes(lang)
}

export function sanitizeString(str: string): string {
  return str.trim().replace(/\s+/g, ' ')
}

export function isValidDate(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime())
}

export function isValidPhoneNumber(phone: string): boolean {
  // Кыргызстан: +996 XXX XXX XXX
  const phoneRegex = /^\+996\d{9}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// ============================================
// 📊 Response Helpers
// ============================================

export interface ValidationError {
  field?: string
  message: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  errors?: ValidationError[]
  message?: string
}

export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  }
}

export function errorResponse(errors: string[] | ValidationError[], message?: string): ApiResponse {
  const formattedErrors = errors.map(error => 
    typeof error === 'string' ? { message: error } : error
  )

  return {
    success: false,
    errors: formattedErrors,
    message: message || 'Ошибка валидации',
  }
}
