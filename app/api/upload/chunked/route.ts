import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadFileToS3, validateFileSize, validateFileType } from "@/lib/s3";

interface ChunkInfo {
  chunkIndex: number;
  totalChunks: number;
  fileName: string;
  fileType: string;
  uploadId: string;
}

// Временное хранилище для чанков (в продакшене лучше использовать Redis)
const chunkStorage = new Map<string, Buffer[]>();

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const chunk = formData.get("chunk") as File;
    const chunkIndex = parseInt(formData.get("chunkIndex") as string);
    const totalChunks = parseInt(formData.get("totalChunks") as string);
    const fileName = formData.get("fileName") as string;
    const fileType = formData.get("fileType") as string; // "poster" или "trailer"
    const originalContentType = formData.get("originalContentType") as string; // Оригинальный MIME тип
    const uploadId = formData.get("uploadId") as string;
    const totalSize = parseInt(formData.get("totalSize") as string);

    console.log("Chunked upload request:", {
      chunkIndex,
      totalChunks,
      fileName,
      fileType,
      originalContentType,
      uploadId,
      totalSize,
      chunkSize: chunk?.size,
      hasChunk: !!chunk,
      chunkName: chunk?.name,
      chunkType: chunk?.type
    });

    if (!chunk || isNaN(chunkIndex) || isNaN(totalChunks) || !fileName || !fileType || !uploadId || !originalContentType) {
      console.error("Missing parameters:", {
        hasChunk: !!chunk,
        chunkIndex,
        totalChunks,
        fileName,
        fileType,
        uploadId,
        originalContentType
      });
      return NextResponse.json({ error: "Неверные параметры" }, { status: 400 });
    }

    // Валидация общего размера файла
    const maxSize = fileType === "poster" ? 10 : 200;
    if (!validateFileSize(totalSize, maxSize)) {
      return NextResponse.json(
        { error: `Размер файла не должен превышать ${maxSize}MB` },
        { status: 400 }
      );
    }

    // Валидация типа файла по оригинальному MIME типу
    const allowedTypes = fileType === "poster" ? ["image/"] : ["video/"];
    if (!validateFileType(originalContentType, allowedTypes)) {
      return NextResponse.json(
        { error: `Неподдерживаемый тип файла: ${originalContentType}` },
        { status: 400 }
      );
    }

    // Сохраняем чанк
    const chunkBuffer = Buffer.from(await chunk.arrayBuffer());
    
    if (!chunkStorage.has(uploadId)) {
      chunkStorage.set(uploadId, new Array(totalChunks).fill(undefined));
      console.log(`Created new upload session: ${uploadId} with ${totalChunks} chunks`);
    }
    
    const chunks = chunkStorage.get(uploadId)!;
    chunks[chunkIndex] = chunkBuffer;
    
    console.log(`Stored chunk ${chunkIndex}/${totalChunks - 1}, size: ${chunkBuffer.length} bytes`);

    // Проверяем, все ли чанки загружены
    const allChunksUploaded = chunks.every((chunk, index) => {
      const isUploaded = chunk !== undefined;
      if (!isUploaded) {
        console.log(`Chunk ${index} is missing`);
      }
      return isUploaded;
    });

    console.log(`Upload progress: ${chunks.filter(c => c !== undefined).length}/${totalChunks} chunks uploaded`);

    if (allChunksUploaded) {
      try {
        // Фильтруем undefined элементы и объединяем все чанки
        const validChunks = chunks.filter(chunk => chunk !== undefined);
        console.log(`Concatenating ${validChunks.length} chunks, total size: ${validChunks.reduce((sum, chunk) => sum + chunk.length, 0)} bytes`);
        
        const completeFile = Buffer.concat(validChunks);
        
        // Проверяем размер итогового файла
        if (completeFile.length !== totalSize) {
          console.warn(`File size mismatch: expected ${totalSize}, got ${completeFile.length}`);
        }
        
        console.log(`Final file size: ${completeFile.length} bytes, uploading to S3...`);
        
        // Загружаем в S3 с оригинальным MIME типом
        const result = await uploadFileToS3(completeFile, fileName, originalContentType);
        
        // Очищаем временное хранилище
        chunkStorage.delete(uploadId);
        
        console.log(`✅ Upload completed successfully: ${result.url}`);
        
        const response = {
          success: true,
          completed: true,
          url: result.url,
          key: result.key,
          fileName,
          fileSize: totalSize,
          contentType: originalContentType,
        };
        
        console.log("Sending response:", response);
        
        return NextResponse.json(response);
      } catch (error) {
        // Очищаем временное хранилище в случае ошибки
        chunkStorage.delete(uploadId);
        throw error;
      }
    }

    return NextResponse.json({
      success: true,
      completed: false,
      chunkIndex,
      totalChunks,
      uploadedChunks: chunks.filter(c => c !== undefined).length,
    });

  } catch (error) {
    console.error("Chunked upload error:", error);
    return NextResponse.json(
      { error: "Ошибка при загрузке файла" },
      { status: 500 }
    );
  }
}