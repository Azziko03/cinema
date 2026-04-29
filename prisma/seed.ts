import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...')

  // Создаем администратора
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cinema.kg' },
    update: {},
    create: {
      email: 'admin@cinema.kg',
      passwordHash: adminPassword,
      fullName: 'Администратор',
      role: 'admin',
      status: 'active',
    },
  })
  console.log('✅ Администратор создан:', admin.email)

  // Создаем жанры
  const genres = [
    { slug: 'action', translations: { KG: 'Аракет', RU: 'Боевик', EN: 'Action' } },
    { slug: 'comedy', translations: { KG: 'Комедия', RU: 'Комедия', EN: 'Comedy' } },
    { slug: 'drama', translations: { KG: 'Драма', RU: 'Драма', EN: 'Drama' } },
    { slug: 'horror', translations: { KG: 'Коркунуч', RU: 'Ужасы', EN: 'Horror' } },
    { slug: 'sci-fi', translations: { KG: 'Фантастика', RU: 'Фантастика', EN: 'Sci-Fi' } },
    { slug: 'thriller', translations: { KG: 'Триллер', RU: 'Триллер', EN: 'Thriller' } },
    { slug: 'romance', translations: { KG: 'Романтика', RU: 'Романтика', EN: 'Romance' } },
    { slug: 'animation', translations: { KG: 'Мультфильм', RU: 'Мультфильм', EN: 'Animation' } },
  ]

  for (const genre of genres) {
    const createdGenre = await prisma.genre.upsert({
      where: { slug: genre.slug },
      update: {},
      create: { slug: genre.slug },
    })

    for (const [lang, title] of Object.entries(genre.translations)) {
      await prisma.genreTranslation.upsert({
        where: {
          genreId_language: {
            genreId: createdGenre.id,
            language: lang as 'KG' | 'RU' | 'EN',
          },
        },
        update: {},
        create: {
          genreId: createdGenre.id,
          language: lang as 'KG' | 'RU' | 'EN',
          title,
        },
      })
    }
  }
  console.log('✅ Жанры созданы')

  // Создаем залы
  const halls = [
    { name: 'Зал 1', description: 'Большой зал с экраном IMAX', totalSeats: 150 },
    { name: 'Зал 2', description: 'Средний зал для 3D фильмов', totalSeats: 100 },
    { name: 'Зал 3', description: 'Малый VIP зал', totalSeats: 50 },
  ]

  for (const hallData of halls) {
    const hall = await prisma.hall.upsert({
      where: { id: 'temp-id-' + hallData.name },
      update: {},
      create: hallData,
    })

    // Создаем места для зала
    const rows = Math.ceil(hallData.totalSeats / 10)
    const seatsPerRow = 10

    for (let row = 1; row <= rows; row++) {
      for (let seat = 1; seat <= seatsPerRow; seat++) {
        if ((row - 1) * seatsPerRow + seat <= hallData.totalSeats) {
          await prisma.seat.create({
            data: {
              hallId: hall.id,
              rowNumber: row,
              seatNumber: seat,
              isActive: true,
            },
          })
        }
      }
    }
  }
  console.log('✅ Залы и места созданы')

  // Создаем настройки системы
  const settings = [
    { key: 'site_name', value: 'Cinema' },
    { key: 'site_description', value: 'Современный кинотеатр в вашем городе' },
    { key: 'booking_timeout_minutes', value: '15' },
    { key: 'max_tickets_per_order', value: '10' },
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }
  console.log('✅ Настройки системы созданы')

  console.log('🎉 Заполнение базы данных завершено!')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
