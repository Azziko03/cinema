import HomeClient from './HomeClient'
import { getLocale } from '@/app/i18n/cookies'
import { getTranslations } from '@/app/i18n'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getMoviesWithSessionsByHalls() {
  // Получаем текущую дату
  const now = new Date();
  
  // Получаем все залы
  const halls = await prisma.hall.findMany({
    orderBy: {
      name: 'asc'
    }
  });
  
  // Получаем фильмы с сеансами
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
        include: {
          hall: true
        },
        orderBy: {
          startTime: 'asc'
        }
      },
      ratings: true
    }
  });

  // Группируем фильмы по залам
  const moviesByHall = halls.map(hall => {
    // Находим все уникальные фильмы для этого зала
    const hallMovies = movies
      .filter(movie => movie.sessions.some(session => session.hallId === hall.id))
      .map(movie => {
        // Вычисляем средний рейтинг
        const averageRating = movie.ratings.length > 0
          ? movie.ratings.reduce((sum, r) => sum + r.rating, 0) / movie.ratings.length
          : 0;

        // Фильтруем сеансы только для этого зала
        const hallSessions = movie.sessions
          .filter(session => session.hallId === hall.id)
          .map(session => ({
            ...session,
            basePrice: Number(session.basePrice),
            vipPrice: session.vipPrice ? Number(session.vipPrice) : null,
            hall: undefined // Убираем hall из сеанса, так как он уже известен
          }));

        return {
          ...movie,
          metadata: movie.metadata ? {
            ...movie.metadata,
            imdbRating: movie.metadata.imdbRating ? Number(movie.metadata.imdbRating) : null,
            kinopoiskRating: movie.metadata.kinopoiskRating ? Number(movie.metadata.kinopoiskRating) : null,
          } : null,
          sessions: hallSessions,
          averageRating: Number(averageRating.toFixed(1)),
          totalVotes: movie.ratings.length,
          ratings: undefined
        };
      });

    return {
      hall: {
        id: hall.id,
        name: hall.name,
        description: hall.description,
        totalSeats: hall.totalSeats
      },
      movies: hallMovies
    };
  }).filter(hallData => hallData.movies.length > 0); // Показываем только залы с фильмами

  return moviesByHall;
}

export default async function Home() {
  const locale = await getLocale()
  const translations = await getTranslations(locale, 'landing')
  const moviesByHall = await getMoviesWithSessionsByHalls()
  const session = await auth()

  return (
    <HomeClient 
      moviesByHall={moviesByHall} 
      translations={translations} 
      locale={locale}
      session={session}
    />
  )
}
