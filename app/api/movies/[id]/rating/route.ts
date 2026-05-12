import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET - Получить рейтинг фильма
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id: movieId } = await params

    // Получаем все рейтинги фильма
    const ratings = await prisma.movieRating.findMany({
      where: { movieId }
    })

    // Вычисляем средний рейтинг
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0

    // Вычисляем распределение рейтингов
    const distribution = Array(10).fill(0)
    ratings.forEach(r => {
      distribution[r.rating - 1]++
    })

    // Получаем рейтинг текущего пользователя
    let userRating = null
    if (session?.user?.id) {
      const userRatingRecord = await prisma.movieRating.findUnique({
        where: {
          movieId_userId: {
            movieId,
            userId: session.user.id
          }
        }
      })
      userRating = userRatingRecord?.rating || null
    }

    return NextResponse.json({
      averageRating: Number(averageRating.toFixed(1)),
      totalVotes: ratings.length,
      userRating
    })
  } catch (error) {
    console.error('Error fetching rating:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rating' },
      { status: 500 }
    )
  }
}

// POST - Оценить фильм
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: movieId } = await params
    const { rating } = await request.json()

    // Валидация рейтинга
    if (!rating || rating < 1 || rating > 10) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 10' },
        { status: 400 }
      )
    }

    // Проверяем существование фильма
    const movie = await prisma.movie.findUnique({
      where: { id: movieId }
    })

    if (!movie) {
      return NextResponse.json(
        { error: 'Movie not found' },
        { status: 404 }
      )
    }

    // Создаем или обновляем рейтинг
    await prisma.movieRating.upsert({
      where: {
        movieId_userId: {
          movieId,
          userId: session.user.id
        }
      },
      update: {
        rating
      },
      create: {
        movieId,
        userId: session.user.id,
        rating
      }
    })

    // Получаем обновленную статистику
    const ratings = await prisma.movieRating.findMany({
      where: { movieId }
    })

    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length

    return NextResponse.json({
      success: true,
      averageRating: Number(averageRating.toFixed(1)),
      totalVotes: ratings.length
    })
  } catch (error) {
    console.error('Error submitting rating:', error)
    return NextResponse.json(
      { error: 'Failed to submit rating' },
      { status: 500 }
    )
  }
}
