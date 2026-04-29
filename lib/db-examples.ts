/**
 * Примеры использования Prisma для работы с базой данных Cinema
 * Эти функции можно использовать в API routes или Server Components
 */

import { prisma } from './prisma'
import type { Language } from './types'

// ============================================
// 🎬 MOVIES - Работа с фильмами
// ============================================

/**
 * Получить список фильмов в прокате с переводами
 */
export async function getMoviesNowShowing(language: Language = 'RU') {
  return await prisma.movie.findMany({
    where: {
      status: 'now_showing',
    },
    include: {
      translations: {
        where: { language },
      },
      metadata: true,
      genres: {
        include: {
          genre: {
            include: {
              translations: {
                where: { language },
              },
            },
          },
        },
      },
      mediaFiles: {
        where: { type: 'poster' },
      },
    },
    orderBy: {
      releaseDate: 'desc',
    },
  })
}

/**
 * Получить детальную информацию о фильме
 */
export async function getMovieById(movieId: string, language: Language = 'RU') {
  return await prisma.movie.findUnique({
    where: { id: movieId },
    include: {
      translations: {
        where: { language },
      },
      metadata: true,
      genres: {
        include: {
          genre: {
            include: {
              translations: {
                where: { language },
              },
            },
          },
        },
      },
      persons: {
        include: {
          person: true,
        },
      },
      mediaFiles: true,
    },
  })
}

/**
 * Поиск фильмов по названию
 */
export async function searchMovies(query: string, language: Language = 'RU') {
  return await prisma.movie.findMany({
    where: {
      translations: {
        some: {
          language,
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
      },
    },
    include: {
      translations: {
        where: { language },
      },
      metadata: true,
      mediaFiles: {
        where: { type: 'poster' },
      },
    },
  })
}

/**
 * Получить фильмы по жанру
 */
export async function getMoviesByGenre(genreSlug: string, language: Language = 'RU') {
  return await prisma.movie.findMany({
    where: {
      genres: {
        some: {
          genre: {
            slug: genreSlug,
          },
        },
      },
      status: 'now_showing',
    },
    include: {
      translations: {
        where: { language },
      },
      metadata: true,
      mediaFiles: {
        where: { type: 'poster' },
      },
    },
  })
}

// ============================================
// 📅 SESSIONS - Работа с сеансами
// ============================================

/**
 * Получить расписание сеансов на определенную дату
 */
export async function getSessionsByDate(date: Date, language: Language = 'RU') {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  return await prisma.session.findMany({
    where: {
      startTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      movie: {
        include: {
          translations: {
            where: { language },
          },
          metadata: true,
          mediaFiles: {
            where: { type: 'poster' },
          },
        },
      },
      hall: true,
      orderItems: {
        where: {
          order: {
            status: 'paid',
          },
        },
        select: {
          seatId: true,
        },
      },
    },
    orderBy: {
      startTime: 'asc',
    },
  })
}

/**
 * Получить сеансы конкретного фильма
 */
export async function getSessionsByMovie(movieId: string) {
  const now = new Date()
  
  return await prisma.session.findMany({
    where: {
      movieId,
      startTime: {
        gte: now,
      },
    },
    include: {
      hall: true,
      orderItems: {
        where: {
          order: {
            status: 'paid',
          },
        },
        select: {
          seatId: true,
        },
      },
    },
    orderBy: {
      startTime: 'asc',
    },
  })
}

/**
 * Получить информацию о сеансе с доступными местами
 */
export async function getSessionWithAvailability(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      hall: {
        include: {
          seats: {
            where: { isActive: true },
            orderBy: [
              { rowNumber: 'asc' },
              { seatNumber: 'asc' },
            ],
          },
        },
      },
      orderItems: {
        where: {
          order: {
            status: 'paid',
          },
        },
        select: {
          seatId: true,
        },
      },
    },
  })

  if (!session) return null

  const occupiedSeatIds = session.orderItems.map(item => item.seatId)
  const availableSeats = session.hall.seats.filter(
    seat => !occupiedSeatIds.includes(seat.id)
  )

  return {
    ...session,
    availableSeats: availableSeats.length,
    occupiedSeats: occupiedSeatIds,
  }
}

// ============================================
// 🎫 BOOKING - Бронирование билетов
// ============================================

/**
 * Создать заказ с билетами
 */
export async function createOrder(
  userId: string,
  sessionId: string,
  seatIds: string[]
) {
  // Проверяем доступность мест
  const occupiedSeats = await prisma.orderItem.findMany({
    where: {
      sessionId,
      seatId: { in: seatIds },
      order: {
        status: 'paid',
      },
    },
  })

  if (occupiedSeats.length > 0) {
    throw new Error('Некоторые места уже заняты')
  }

  // Получаем информацию о сеансе
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  })

  if (!session) {
    throw new Error('Сеанс не найден')
  }

  // Рассчитываем общую стоимость
  const totalAmount = session.basePrice.toNumber() * seatIds.length

  // Создаем заказ с билетами
  const order = await prisma.order.create({
    data: {
      userId,
      status: 'paid',
      totalAmount,
      paymentStatus: 'success',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 минут
      items: {
        create: seatIds.map(seatId => ({
          sessionId,
          seatId,
          price: session.basePrice,
        })),
      },
    },
    include: {
      items: {
        include: {
          session: {
            include: {
              movie: {
                include: {
                  translations: true,
                },
              },
              hall: true,
            },
          },
          seat: true,
        },
      },
    },
  })

  // Генерируем билеты с QR-кодами
  for (const item of order.items) {
    const qrCode = `CINEMA-${order.id}-${item.id}-${Date.now()}`
    
    await prisma.ticket.create({
      data: {
        orderItemId: item.id,
        qrCode,
        isUsed: false,
      },
    })
  }

  return order
}

/**
 * Получить заказы пользователя
 */
export async function getUserOrders(userId: string, language: Language = 'RU') {
  return await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          session: {
            include: {
              movie: {
                include: {
                  translations: {
                    where: { language },
                  },
                },
              },
              hall: true,
            },
          },
          seat: true,
          ticket: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

/**
 * Получить билет по QR-коду
 */
export async function getTicketByQR(qrCode: string, language: Language = 'RU') {
  return await prisma.ticket.findUnique({
    where: { qrCode },
    include: {
      orderItem: {
        include: {
          session: {
            include: {
              movie: {
                include: {
                  translations: {
                    where: { language },
                  },
                },
              },
              hall: true,
            },
          },
          seat: true,
          order: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  })
}

/**
 * Использовать билет (отметить как использованный)
 */
export async function useTicket(ticketId: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  })

  if (!ticket) {
    throw new Error('Билет не найден')
  }

  if (ticket.isUsed) {
    throw new Error('Билет уже использован')
  }

  return await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      isUsed: true,
      usedAt: new Date(),
    },
  })
}

// ============================================
// 👤 USERS - Работа с пользователями
// ============================================

/**
 * Создать нового пользователя
 */
export async function createUser(
  email: string,
  passwordHash: string,
  fullName: string
) {
  return await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      role: 'user',
      status: 'active',
    },
  })
}

/**
 * Найти пользователя по email
 */
export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  })
}

// ============================================
// 🤖 AI CHAT - Работа с чатом
// ============================================

/**
 * Создать новый чат
 */
export async function createChat(name: string, userId?: string) {
  return await prisma.aiChat.create({
    data: {
      name,
      userId,
    },
  })
}

/**
 * Добавить сообщение в чат
 */
export async function addMessage(
  chatId: string,
  sender: 'user' | 'ai',
  message: string
) {
  return await prisma.aiMessage.create({
    data: {
      chatId,
      sender,
      message,
    },
  })
}

/**
 * Получить историю чата
 */
export async function getChatHistory(chatId: string) {
  return await prisma.aiChat.findUnique({
    where: { id: chatId },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })
}

// ============================================
// ⚙️ SETTINGS - Настройки системы
// ============================================

/**
 * Получить настройку по ключу
 */
export async function getSetting(key: string) {
  const setting = await prisma.setting.findUnique({
    where: { key },
  })
  return setting?.value
}

/**
 * Установить настройку
 */
export async function setSetting(key: string, value: string) {
  return await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })
}
