import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Конфигурация S3 клиента для Timeweb
const s3Client = new S3Client({
  region: "ru-1", // Регион Timeweb
  endpoint: process.env.S3_URL,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // Важно для совместимости с Timeweb
  requestHandler: {
    requestTimeout: 300000, // 5 минут для больших файлов
    connectionTimeout: 10000, // 10 секунд на подключение
  },
});

const BUCKET_NAME = process.env.BUCKET_NAME!;

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Генерирует уникальное имя файла
 */
export function generateFileName(originalName: string, prefix: string = ""): string {
  if (!originalName) {
    originalName = "file";
  }
  
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  return prefix 
    ? `${prefix}/${timestamp}_${randomString}_${cleanName}`
    : `${timestamp}_${randomString}_${cleanName}`;
}

/**
 * Загружает файл в S3 с retry логикой
 */
export async function uploadFileToS3(
  file: Buffer,
  fileName: string,
  contentType: string,
  maxRetries: number = 3
): Promise<UploadResult> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`S3 upload attempt ${attempt}/${maxRetries} for file: ${fileName}`);
      
      const key = generateFileName(fileName, getFilePrefix(contentType));
      
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: contentType,
        ACL: "public-read", // Делаем файл публично доступным
      });

      await s3Client.send(command);

      const url = `${process.env.S3_URL}/${BUCKET_NAME}/${key}`;
      
      console.log(`✅ S3 upload successful on attempt ${attempt}: ${url}`);
      return { url, key };
      
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ S3 upload attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        const delay = attempt * 2000; // Увеличиваем задержку с каждой попыткой
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error("All S3 upload attempts failed:", lastError);
  throw new Error("Ошибка при загрузке файла в S3");
}

/**
 * Удаляет файл из S3
 */
export async function deleteFileFromS3(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    console.log(`✅ Deleted file from S3: ${key}`);
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    throw new Error("Ошибка при удалении файла");
  }
}

/**
 * Удаляет файл из S3 по URL
 */
export async function deleteFileFromS3ByUrl(url: string): Promise<void> {
  const key = extractKeyFromUrl(url);
  if (key) {
    await deleteFileFromS3(key);
  }
}

/**
 * Генерирует подписанный URL для загрузки
 */
export async function generatePresignedUrl(
  fileName: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<{ url: string; key: string }> {
  try {
    const key = generateFileName(fileName, getFilePrefix(contentType));
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      ACL: "public-read",
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    
    return { url: signedUrl, key };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw new Error("Ошибка при генерации URL для загрузки");
  }
}

/**
 * Определяет префикс папки по типу контента
 */
function getFilePrefix(contentType: string): string {
  if (contentType.startsWith("image/")) {
    return "posters";
  } else if (contentType.startsWith("video/")) {
    return "trailers";
  }
  return "misc";
}

/**
 * Валидирует размер файла
 */
export function validateFileSize(size: number, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return size <= maxSizeBytes;
}

/**
 * Валидирует тип файла
 */
export function validateFileType(contentType: string, allowedTypes: string[]): boolean {
  return allowedTypes.some(type => contentType.startsWith(type));
}

/**
 * Извлекает ключ из URL S3
 */
export function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    // Убираем первый пустой элемент и название bucket
    return pathParts.slice(2).join('/');
  } catch {
    return null;
  }
}