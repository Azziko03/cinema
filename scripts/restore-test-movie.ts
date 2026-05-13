import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Restoring original test movie media files...\n')
  
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
  
  // Удаляем текущие медиафайлы
  await prisma.mediaFile.deleteMany({
    where: {
      movieId: movie.id
    }
  })
  console.log('Deleted current media files')
  
  // Восстанавливаем оригинальные файлы
  const poster = await prisma.mediaFile.create({
    data: {
      movieId: movie.id,
      type: 'poster',
      url: 'https://s3.twcstorage.ru/cinema/posters/1778579009880_pr1cdzi2du_______________2026-05-06___22.10.00.png'
    }
  })
  console.log('✅ Restored poster:', poster.url)
  
  const trailer = await prisma.mediaFile.create({
    data: {
      movieId: movie.id,
      type: 'trailer',
      url: 'https://s3.twcstorage.ru/cinema/trailers/1778579017208_43txfmf5lzp______.mov'
    }
  })
  console.log('✅ Restored trailer:', trailer.url)
  
  console.log('\n✅ Original files restored!')
  console.log('\n⚠️  Note: These files may still be inaccessible (403) if S3 permissions are not configured.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
