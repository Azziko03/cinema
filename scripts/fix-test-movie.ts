import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Fixing test movie media files...\n')
  
  // Находим фильм test
  const movie = await prisma.movie.findFirst({
    where: {
      translations: {
        some: {
          title: {
            contains: 'test',
            mode: 'insensitive'
          }
        }
      }
    },
    include: {
      mediaFiles: true
    }
  })
  
  if (!movie) {
    console.log('Movie "test" not found')
    return
  }
  
  console.log(`Found movie: ${movie.id}`)
  
  // Удаляем старые медиафайлы
  await prisma.mediaFile.deleteMany({
    where: {
      movieId: movie.id
    }
  })
  console.log('Deleted old media files')
  
  // Добавляем новые тестовые медиафайлы
  // Используем публичные тестовые изображения
  const poster = await prisma.mediaFile.create({
    data: {
      movieId: movie.id,
      type: 'poster',
      url: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg' // Deadpool & Wolverine poster
    }
  })
  console.log('✅ Added poster:', poster.url)
  
  const trailer = await prisma.mediaFile.create({
    data: {
      movieId: movie.id,
      type: 'trailer',
      url: 'https://www.youtube.com/watch?v=73_1biulkYk' // Deadpool & Wolverine trailer
    }
  })
  console.log('✅ Added trailer:', trailer.url)
  
  console.log('\n✅ Test movie fixed successfully!')
  console.log('\nYou can now:')
  console.log('1. View the movie in the app')
  console.log('2. Replace with your own files through admin panel')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
