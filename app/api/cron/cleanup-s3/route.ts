import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Конфигурация S3 клиента
const s3Client = new S3Client({
  region: "ru-1",
  endpoint: process.env.S3_URL,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.BUCKET_NAME!;

// Этот endpoint можно вызывать через cron job
export async function GET(request: NextRequest) {
  try {
    // Проверяем секретный ключ для безопасности
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting automated S3 cleanup...");

    // Получаем все используемые файлы из базы данных
    const mediaFiles = await prisma.mediaFile.findMany({
      select: { url: true },
    });

    const usedKeys = new Set<string>();
    mediaFiles.forEach(file => {
      const key = extractKeyFromUrl(file.url);
      if (key) usedKeys.add(key);
    });

    // Получаем все файлы из S3
    const s3Files: string[] = [];
    
    // Получаем файлы из папки posters
    const postersResponse = await s3Client.send(new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: "posters/",
    }));
    
    if (postersResponse.Contents) {
      s3Files.push(...postersResponse.Contents.map(obj => obj.Key!).filter(Boolean));
    }

    // Получаем файлы из папки trailers
    const trailersResponse = await s3Client.send(new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: "trailers/",
    }));
    
    if (trailersResponse.Contents) {
      s3Files.push(...trailersResponse.Contents.map(obj => obj.Key!).filter(Boolean));
    }

    // Находим и удаляем неиспользуемые файлы
    const unusedFiles = s3Files.filter(key => !usedKeys.has(key));
    const deletedFiles: string[] = [];
    const errors: string[] = [];

    for (const key of unusedFiles) {
      try {
        await s3Client.send(new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
        }));
        deletedFiles.push(key);
        console.log(`✅ Deleted unused file: ${key}`);
      } catch (error) {
        const errorMsg = `Failed to delete ${key}: ${error}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        totalS3Files: s3Files.length,
        totalDbFiles: usedKeys.size,
        unusedFiles: unusedFiles.length,
        deletedFiles: deletedFiles.length,
        errors: errors.length,
      },
      deletedFiles,
      errors,
    };

    console.log("Automated S3 cleanup completed:", result.stats);

    return NextResponse.json(result);

  } catch (error) {
    console.error("Automated S3 cleanup error:", error);
    return NextResponse.json(
      { error: "Ошибка при автоматической очистке S3" },
      { status: 500 }
    );
  }
}

function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    return pathParts.slice(2).join('/');
  } catch {
    return null;
  }
}