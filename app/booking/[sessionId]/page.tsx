import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import BookingClient from './BookingClient'

async function getSessionDetails(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      movie: {
        include: {
          translations: true,
          mediaFiles: true,
        }
      },
      hall: {
        include: {
          seats: {
            orderBy: [
              { rowNumber: 'asc' },
              { seatNumber: 'asc' }
            ]
          }
        }
      },
      orderItems: {
        where: {
          order: {
            status: {
              in: ['paid']
            }
          }
        },
        select: {
          seatId: true
        }
      }
    }
  })

  if (!session) {
    return null
  }

  // Проверяем, что сеанс еще не начался
  if (new Date(session.startTime) < new Date()) {
    return null
  }

  // Сериализуем данные для клиента
  return {
    ...session,
    basePrice: Number(session.basePrice),
    vipPrice: session.vipPrice ? Number(session.vipPrice) : null,
    bookedSeatIds: session.orderItems.map(item => item.seatId)
  }
}

export default async function BookingPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params
  const userSession = await auth()

  // Проверяем авторизацию
  if (!userSession?.user) {
    redirect('/auth/signup')
  }

  const session = await getSessionDetails(sessionId)
  
  if (!session) {
    notFound()
  }

  return <BookingClient session={session} />
}
