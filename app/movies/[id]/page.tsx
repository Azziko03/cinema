import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { getLocale } from '@/app/i18n/cookies'
import MovieDetailClient from './MovieDetailClient'

async function getMovieDetails(id: string) {
  const movie = await prisma.movie.findUnique({
    where: { id },
    include: {
      translations: true,
      metadata: true,
      mediaFiles: true,
      genres: {
        include: {
          genre: {
            include: {
              translations: true
            }
          }
        }
      },
      sessions: {
        where: {
          startTime: {
            gte: new Date()
          }
        },
        orderBy: {
          startTime: 'asc'
        },
        include: {
          hall: true
        }
      }
    }
  })

  if (!movie) {
    return null
  }

  // Сериализуем данные для клиента
  return {
    ...movie,
    metadata: movie.metadata ? {
      ...movie.metadata,
      imdbRating: movie.metadata.imdbRating ? Number(movie.metadata.imdbRating) : null,
      kinopoiskRating: movie.metadata.kinopoiskRating ? Number(movie.metadata.kinopoiskRating) : null,
    } : null,
    sessions: movie.sessions.map(session => ({
      ...session,
      basePrice: Number(session.basePrice),
      vipPrice: session.vipPrice ? Number(session.vipPrice) : null,
    }))
  }
}

export default async function MovieDetailPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>
  searchParams: Promise<{ hallId?: string }>
}) {
  const { id } = await params
  const { hallId } = await searchParams
  
  const movie = await getMovieDetails(id)
  
  if (!movie) {
    notFound()
  }

  const session = await auth()
  const locale = await getLocale()

  return <MovieDetailClient movie={movie} session={session} locale={locale} hallId={hallId} />
}
