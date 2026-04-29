import { Prisma } from '@prisma/client'

// ============================================
// 🎬 Movie Types
// ============================================

export type MovieWithTranslations = Prisma.MovieGetPayload<{
  include: {
    translations: true
    metadata: true
    genres: {
      include: {
        genre: {
          include: {
            translations: true
          }
        }
      }
    }
    persons: {
      include: {
        person: true
      }
    }
    mediaFiles: true
  }
}>

export type MovieCard = Prisma.MovieGetPayload<{
  include: {
    translations: {
      where: {
        language: 'RU' | 'KG' | 'EN'
      }
    }
    metadata: true
    genres: {
      include: {
        genre: {
          include: {
            translations: true
          }
        }
      }
    }
    mediaFiles: {
      where: {
        type: 'poster'
      }
    }
  }
}>

// ============================================
// 🎭 Session Types
// ============================================

export type SessionWithDetails = Prisma.SessionGetPayload<{
  include: {
    movie: {
      include: {
        translations: true
        mediaFiles: {
          where: {
            type: 'poster'
          }
        }
      }
    }
    hall: {
      include: {
        seats: true
      }
    }
    orderItems: {
      where: {
        order: {
          status: 'paid'
        }
      }
      select: {
        seatId: true
      }
    }
  }
}>

export type SessionWithAvailability = SessionWithDetails & {
  availableSeats: number
  occupiedSeats: string[]
}

// ============================================
// 💰 Order Types
// ============================================

export type OrderWithDetails = Prisma.OrderGetPayload<{
  include: {
    user: true
    items: {
      include: {
        session: {
          include: {
            movie: {
              include: {
                translations: true
              }
            }
            hall: true
          }
        }
        seat: true
        ticket: true
      }
    }
    payments: true
  }
}>

export type OrderItem = Prisma.OrderItemGetPayload<{
  include: {
    session: {
      include: {
        movie: {
          include: {
            translations: true
          }
        }
        hall: true
      }
    }
    seat: true
  }
}>

// ============================================
// 🎫 Ticket Types
// ============================================

export type TicketWithDetails = Prisma.TicketGetPayload<{
  include: {
    orderItem: {
      include: {
        session: {
          include: {
            movie: {
              include: {
                translations: true
              }
            }
            hall: true
          }
        }
        seat: true
        order: {
          include: {
            user: true
          }
        }
      }
    }
  }
}>

// ============================================
// 👤 User Types
// ============================================

export type UserWithOrders = Prisma.UserGetPayload<{
  include: {
    orders: {
      include: {
        items: {
          include: {
            session: {
              include: {
                movie: {
                  include: {
                    translations: true
                  }
                }
              }
            }
            ticket: true
          }
        }
      }
    }
  }
}>

// ============================================
// 🤖 AI Chat Types
// ============================================

export type ChatWithMessages = Prisma.AiChatGetPayload<{
  include: {
    messages: {
      orderBy: {
        createdAt: 'asc'
      }
    }
    user: true
  }
}>

// ============================================
// 🎪 Hall Types
// ============================================

export type HallWithSeats = Prisma.HallGetPayload<{
  include: {
    seats: {
      orderBy: [
        {
          rowNumber: 'asc'
        },
        {
          seatNumber: 'asc'
        }
      ]
    }
  }
}>

// ============================================
// Helper Types
// ============================================

export type Language = 'KG' | 'RU' | 'EN'

export interface SeatMap {
  [key: string]: {
    id: string
    rowNumber: number
    seatNumber: number
    isActive: boolean
    isOccupied: boolean
  }
}

export interface BookingData {
  sessionId: string
  seatIds: string[]
  userId: string
}

export interface PaymentData {
  orderId: string
  amount: number
  provider: 'finik'
  returnUrl: string
  callbackUrl: string
}
