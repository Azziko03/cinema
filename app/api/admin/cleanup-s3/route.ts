import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
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

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { dryRun = true } = await request.json();

    console.log(`Starting S3 cleanup (dry run: ${dryRun})...`);

    // 1. Получаем все файлы из базы данных
    const mediaFiles = await prisma.mediaFile.findMany({
      select: {
        url: true,
        type: true,
      },
    });

    // Извлекаем ключи файлов из URL
    const usedKeys = new Set<string>();
    mediaFiles.forEach(file => {
      const key = extractKeyFromUrl(file.url);
      if (key) {
        usedKeys.add(key);
      }
    });

    console.log(`Found ${usedKeys.size} files in database`);

    // 2. Получаем все файлы из S3
    const s3Files: string[] = [];
    
    // Получаем файлы из папки posters
    const postersCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: "posters/",
    });
    
    const postersResponse = await s3Client.send(postersCommand);
    if (postersResponse.Contents) {
      s3Files.push(...postersResponse.Contents.map(obj => obj.Key!).filter(Boolean));
    }

    // Получаем файлы из папки trailers
    const trailersCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: "trailers/",
    });
    
    const trailersResponse = await s3Client.send(trailersCommand);
    if (trailersResponse.Contents) {
      s3Files.push(...trailersResponse.Contents.map(obj => obj.Key!).filter(Boolean));
    }

    console.log(`Found ${s3Files.length} files in S3`);

    // 3. Находим неиспользуемые файлы
    const unusedFiles = s3Files.filter(key => !usedKeys.has(key));
    
    console.log(`Found ${unusedFiles.length} unused files:`, unusedFiles);

    // 4. Удаляем неиспользуемые файлы (если не dry run)
    const deletedFiles: string[] = [];
    const errors: string[] = [];

    if (!dryRun && unusedFiles.length > 0) {
      for (const key of unusedFiles) {
        try {
          const deleteCommand = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
          });
          
          await s3Client.send(deleteCommand);
          deletedFiles.push(key);
          console.log(`✅ Deleted: ${key}`);
        } catch (error) {
          const errorMsg = `Failed to delete ${key}: ${error}`;
          errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      dryRun,
      stats: {
        totalS3Files: s3Files.length,
        totalDbFiles: usedKeys.size,
        unusedFiles: unusedFiles.length,
        deletedFiles: deletedFiles.length,
        errors: errors.length,
      },
      unusedFiles,
      deletedFiles,
      errors,
    });

  } catch (error) {
    console.error("S3 cleanup error:", error);
    return NextResponse.json(
      { error: "Ошибка при очистке S3" },
      { status: 500 }
    );
  }
}

// Извлекает ключ из URL S3
function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    // Убираем первый пустой элемент и название bucket
    return pathParts.slice(2).join('/');
  } catch {
    return null;
  }
}