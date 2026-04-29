# 📊 База данных Cinema

## Установка и настройка

### 1. Установите зависимости
```bash
npm install
```

### 2. Настройте переменные окружения
Скопируйте `.env.example` в `.env` и заполните данные:
```bash
cp .env.example .env
```

Отредактируйте `DATABASE_URL` в `.env`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/cinema?schema=public"
```

### 3. Создайте базу данных
```bash
# Создайте базу данных в PostgreSQL
createdb cinema

# Или через psql
psql -U postgres
CREATE DATABASE cinema;
```

### 4. Примените схему к базе данных
```bash
# Для разработки (быстрый способ)
npm run db:push

# Или создайте миграцию (рекомендуется для продакшена)
npm run db:migrate
```

### 5. Сгенерируйте Prisma Client
```bash
npm run db:generate
```

### 6. Заполните базу начальными данными
```bash
npm run db:seed
```

## Команды для работы с БД

| Команда | Описание |
|---------|----------|
| `npm run db:generate` | Генерирует Prisma Client |
| `npm run db:push` | Синхронизирует схему с БД (для разработки) |
| `npm run db:migrate` | Создает и применяет миграции |
| `npm run db:studio` | Открывает Prisma Studio (GUI для БД) |
| `npm run db:seed` | Заполняет БД начальными данными |

## Структура базы данных

### 👤 Пользователи и авторизация
- **users** - пользователи системы

### 🎬 Фильмы
- **movies** - основная информация о фильмах
- **movie_translations** - переводы названий и описаний
- **movie_metadata** - метаданные (страна, год, рейтинги)
- **genres** - жанры
- **genre_translations** - переводы жанров
- **movie_genres** - связь фильмов и жанров
- **persons** - актеры и режиссеры
- **movie_persons** - связь фильмов и персон
- **media_files** - постеры, трейлеры, галерея

### 🎭 Кинотеатр
- **halls** - залы кинотеатра
- **seats** - места в залах
- **sessions** - сеансы фильмов

### 💰 Заказы и платежи
- **orders** - заказы билетов
- **order_items** - позиции заказа (билеты)
- **payments** - платежи через Finik
- **tickets** - электронные билеты с QR-кодами

### ⚙️ Система
- **settings** - настройки системы

### 🤖 AI Чат
- **ai_chats** - чаты с AI
- **ai_messages** - сообщения в чатах

## Примеры использования

### Получение фильмов с переводами
```typescript
import { prisma } from '@/lib/prisma'

const movies = await prisma.movie.findMany({
  include: {
    translations: {
      where: { language: 'RU' }
    },
    metadata: true,
    genres: {
      include: {
        genre: {
          include: {
            translations: {
              where: { language: 'RU' }
            }
          }
        }
      }
    },
    mediaFiles: {
      where: { type: 'poster' }
    }
  },
  where: {
    status: 'now_showing'
  }
})
```

### Создание заказа
```typescript
const order = await prisma.order.create({
  data: {
    userId: user.id,
    status: 'paid',
    totalAmount: 500,
    paymentStatus: 'success',
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 минут
    items: {
      create: [
        {
          sessionId: session.id,
          seatId: seat.id,
          price: 500
        }
      ]
    }
  },
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
        },
        seat: true
      }
    }
  }
})
```

### Получение расписания сеансов
```typescript
const sessions = await prisma.session.findMany({
  where: {
    startTime: {
      gte: new Date(),
      lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // следующие 7 дней
    }
  },
  include: {
    movie: {
      include: {
        translations: {
          where: { language: 'RU' }
        },
        mediaFiles: {
          where: { type: 'poster' }
        }
      }
    },
    hall: true,
    orderItems: {
      where: {
        order: {
          status: 'paid'
        }
      },
      select: {
        seatId: true
      }
    }
  },
  orderBy: {
    startTime: 'asc'
  }
})
```

## Миграции

### Создание новой миграции
```bash
npx prisma migrate dev --name add_new_feature
```

### Применение миграций в продакшене
```bash
npx prisma migrate deploy
```

### Сброс базы данных (ОСТОРОЖНО!)
```bash
npx prisma migrate reset
```

## Prisma Studio

Откройте визуальный редактор базы данных:
```bash
npm run db:studio
```

Откроется браузер на `http://localhost:5555`

## Полезные ссылки

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
