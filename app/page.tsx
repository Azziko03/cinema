import HomeClient from './HomeClient'
import { getLocale } from '@/app/i18n/cookies'
import { getTranslations } from '@/app/i18n'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getMoviesWithSessions() {
  // Получаем текущую дату
  const now = new Date();
  
  const movies = await prisma.movie.findMany({
    where: {
      // Показываем фильмы, у которых есть сеансы в будущем
      sessions: {
        some: {
          startTime: {
            gte: now
          }
        }
      }
    },
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
            gte: now
          }
        },
        orderBy: {
          startTime: 'asc'
        }
      },
      ratings: true // Добавляем рейтинги пользователей
    },
    take: 50
  })

  // Сериализуем данные для клиента
  return movies.map(movie => {
    // Вычисляем средний рейтинг пользователей
    const averageRating = movie.ratings.length > 0
      ? movie.ratings.reduce((sum, r) => sum + r.rating, 0) / movie.ratings.length
      : 0

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
      })),
      averageRating: Number(averageRating.toFixed(1)),
      totalVotes: movie.ratings.length,
      ratings: undefined // Убираем детальные рейтинги из ответа
    }
  })
}

export default async function Home() {
  const locale = await getLocale()
  const translations = await getTranslations(locale, 'landing')
  const moviesData = await getMoviesWithSessions()
  const session = await auth()

  return (
    <HomeClient 
      moviesData={moviesData} 
      translations={translations} 
      locale={locale}
      session={session}
    />
  )
}
