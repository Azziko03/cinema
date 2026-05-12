# Проблемы с файлами из S3

## Возможные причины повреждения файлов

### 1. **Проблемы с Content-Type**
Если Content-Type установлен неправильно, браузер может не распознать файл.

**Проверка:**
```bash
curl -I https://your-s3-url.com/bucket/file.jpg
```

Должно быть:
- Изображения: `Content-Type: image/jpeg`, `image/png`, `image/webp`
- Видео: `Content-Type: video/mp4`, `video/webm`

**Решение:**
Убедитесь что при загрузке передается правильный `contentType`:
```typescript
const command = new PutObjectCommand({
  ContentType: file.type, // Должен быть правильный MIME type
})
```

### 2. **Проблемы с ACL (доступом)**
Файлы могут быть недоступны из-за неправильных прав доступа.

**Текущая настройка:**
```typescript
ACL: "public-read" // Файлы публично доступны
```

**Проверка:**
Откройте URL файла в браузере. Если получаете 403 Forbidden - проблема с правами.

**Решение:**
1. Проверьте настройки bucket в Timeweb
2. Убедитесь что bucket policy разрешает публичное чтение
3. Проверьте CORS настройки

### 3. **Повреждение при загрузке**
Файл может повредиться при конвертации в Buffer.

**Текущий код:**
```typescript
const bytes = await file.arrayBuffer();
const buffer = Buffer.from(bytes);
```

**Проверка:**
Сравните размер загруженного файла с оригиналом:
```typescript
console.log('Original size:', file.size);
console.log('Buffer size:', buffer.length);
```

### 4. **Проблемы с кодировкой имени файла**
Специальные символы в имени могут вызвать проблемы.

**Текущая защита:**
```typescript
const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
```

### 5. **Таймаут при загрузке больших файлов**
Большие файлы могут не успеть загрузиться.

**Текущие настройки:**
```typescript
requestHandler: {
  requestTimeout: 300000, // 5 минут
  connectionTimeout: 10000, // 10 секунд
}
```

### 6. **Проблемы с CORS**
Браузер может блокировать загрузку из-за CORS.

**Проверка в консоли браузера:**
```
Access to image at 'https://...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Решение:**
Настройте CORS в Timeweb S3:
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

## Диагностика конкретного файла

### Шаг 1: Проверьте URL
```typescript
// В консоли браузера
const url = "https://your-s3-url.com/bucket/file.jpg";
fetch(url)
  .then(r => console.log('Status:', r.status, 'Type:', r.headers.get('content-type')))
  .catch(e => console.error('Error:', e));
```

### Шаг 2: Проверьте размер
```typescript
fetch(url)
  .then(r => r.blob())
  .then(b => console.log('Size:', b.size, 'Type:', b.type));
```

### Шаг 3: Проверьте заголовки
```bash
curl -I https://your-s3-url.com/bucket/file.jpg
```

Должны быть:
```
HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Length: 123456
Access-Control-Allow-Origin: *
```

## Решения

### Решение 1: Переза грузите поврежденные файлы
1. Удалите поврежденный файл из админки
2. Загрузите заново
3. Проверьте что файл открывается

### Решение 2: Проверьте настройки S3
В Timeweb панели:
1. Bucket → Настройки → ACL → Публичный доступ
2. Bucket → CORS → Добавьте правило
3. Bucket → Политика → Разрешите публичное чтение

### Решение 3: Добавьте валидацию после загрузки
```typescript
// После загрузки проверяем файл
const response = await fetch(result.url);
if (!response.ok) {
  throw new Error('Uploaded file is not accessible');
}
```

### Решение 4: Используйте chunked upload для больших файлов
Для файлов > 100MB используйте multipart upload:
```typescript
// См. /app/api/upload/chunked/route.ts
```

## Проверка текущих файлов

### SQL запрос для проверки всех медиа файлов:
```sql
SELECT 
  m.id,
  m.title,
  mf.type,
  mf.url,
  LENGTH(mf.url) as url_length
FROM movies m
JOIN media_files mf ON m.id = mf.movie_id
ORDER BY m.created_at DESC;
```

### Скрипт для проверки доступности:
```typescript
// Создайте файл: scripts/check-s3-files.ts
import { prisma } from '@/lib/prisma';

async function checkFiles() {
  const files = await prisma.mediaFile.findMany();
  
  for (const file of files) {
    try {
      const response = await fetch(file.url, { method: 'HEAD' });
      console.log(`${file.url}: ${response.ok ? '✅' : '❌'} (${response.status})`);
    } catch (error) {
      console.log(`${file.url}: ❌ Error`);
    }
  }
}

checkFiles();
```

## Превентивные меры

### 1. Добавьте проверку после загрузки
```typescript
async function uploadWithVerification(file: Buffer, fileName: string, contentType: string) {
  const result = await uploadFileToS3(file, fileName, contentType);
  
  // Проверяем что файл доступен
  const response = await fetch(result.url, { method: 'HEAD' });
  if (!response.ok) {
    await deleteFileFromS3(result.key);
    throw new Error('File upload verification failed');
  }
  
  return result;
}
```

### 2. Добавьте логирование
```typescript
console.log('Upload details:', {
  fileName: file.name,
  fileSize: file.size,
  contentType: file.type,
  bufferSize: buffer.length,
  url: result.url
});
```

### 3. Добавьте retry логику
Уже реализовано в `uploadFileToS3` с 3 попытками.

## Частые ошибки

### Ошибка: "Failed to load resource: net::ERR_FAILED"
**Причина:** Файл недоступен или поврежден  
**Решение:** Перезагрузите файл

### Ошибка: "403 Forbidden"
**Причина:** Нет прав доступа  
**Решение:** Проверьте ACL и bucket policy

### Ошибка: "CORS policy"
**Причина:** CORS не настроен  
**Решение:** Добавьте CORS правила в S3

### Ошибка: Изображение не отображается
**Причина:** Неправильный Content-Type  
**Решение:** Проверьте что Content-Type = image/jpeg (или другой правильный)

## Рекомендации

1. ✅ Всегда проверяйте файл после загрузки
2. ✅ Логируйте все операции с S3
3. ✅ Используйте retry логику (уже есть)
4. ✅ Валидируйте размер и тип файла (уже есть)
5. ✅ Настройте CORS в S3
6. ✅ Используйте chunked upload для больших файлов
7. ✅ Регулярно проверяйте доступность файлов
