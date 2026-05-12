import { prisma } from '../lib/prisma';

interface FileCheckResult {
  url: string;
  type: string;
  movieTitle: string;
  status: 'ok' | 'error' | 'forbidden' | 'not_found';
  statusCode?: number;
  contentType?: string;
  size?: number;
  error?: string;
}

async function checkS3Files() {
  console.log('🔍 Проверка файлов в S3...\n');

  const mediaFiles = await prisma.mediaFile.findMany({
    include: {
      movie: {
        include: {
          translations: true
        }
      }
    }
  });

  console.log(`Найдено файлов: ${mediaFiles.length}\n`);

  const results: FileCheckResult[] = [];

  for (const file of mediaFiles) {
    const movieTitle = file.movie.translations[0]?.title || 'Unknown';
    
    try {
      const response = await fetch(file.url, { method: 'HEAD' });
      
      const result: FileCheckResult = {
        url: file.url,
        type: file.type,
        movieTitle,
        status: response.ok ? 'ok' : 
                response.status === 403 ? 'forbidden' : 
                response.status === 404 ? 'not_found' : 'error',
        statusCode: response.status,
        contentType: response.headers.get('content-type') || undefined,
        size: parseInt(response.headers.get('content-length') || '0')
      };

      results.push(result);

      const icon = response.ok ? '✅' : '❌';
      console.log(`${icon} [${file.type}] ${movieTitle}`);
      console.log(`   URL: ${file.url}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Content-Type: ${result.contentType}`);
      console.log(`   Size: ${(result.size! / 1024 / 1024).toFixed(2)} MB\n`);

    } catch (error) {
      const result: FileCheckResult = {
        url: file.url,
        type: file.type,
        movieTitle,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      results.push(result);

      console.log(`❌ [${file.type}] ${movieTitle}`);
      console.log(`   URL: ${file.url}`);
      console.log(`   Error: ${result.error}\n`);
    }
  }

  // Статистика
  console.log('\n📊 Статистика:');
  console.log(`Всего файлов: ${results.length}`);
  console.log(`✅ Доступны: ${results.filter(r => r.status === 'ok').length}`);
  console.log(`❌ Ошибки: ${results.filter(r => r.status === 'error').length}`);
  console.log(`🚫 Forbidden: ${results.filter(r => r.status === 'forbidden').length}`);
  console.log(`❓ Not Found: ${results.filter(r => r.status === 'not_found').length}`);

  // Проблемные файлы
  const problematic = results.filter(r => r.status !== 'ok');
  if (problematic.length > 0) {
    console.log('\n⚠️  Проблемные файлы:');
    problematic.forEach(file => {
      console.log(`\n- ${file.movieTitle} (${file.type})`);
      console.log(`  URL: ${file.url}`);
      console.log(`  Проблема: ${file.status} ${file.statusCode ? `(${file.statusCode})` : ''}`);
      if (file.error) console.log(`  Ошибка: ${file.error}`);
    });
  }

  await prisma.$disconnect();
}

checkS3Files().catch(console.error);
