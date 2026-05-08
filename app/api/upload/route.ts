import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadFileToS3, validateFileSize, validateFileType } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fileType = formData.get("type") as string; // "poster" или "trailer"

    console.log("Simple upload request:", {
      fileName: file?.name,
      fileSize: file?.size,
      fileType,
      hasFile: !!file
    });

    if (!file) {
      return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
    }

    if (!fileType || !["poster", "trailer"].includes(fileType)) {
      return NextResponse.json({ error: "Неверный тип файла" }, { status: 400 });
    }

    // Валидация размера файла
    const maxSize = fileType === "poster" ? 10 : 200; // 10MB для постеров, 200MB для трейлеров
    if (!validateFileSize(file.size, maxSize)) {
      return NextResponse.json(
        { error: `Размер файла не должен превышать ${maxSize}MB` },
        { status: 400 }
      );
    }

    // Валидация типа файла
    const allowedTypes = fileType === "poster" ? ["image/"] : ["video/"];
    if (!validateFileType(file.type, allowedTypes)) {
      return NextResponse.json(
        { error: `Неподдерживаемый тип файла: ${file.type}` },
        { status: 400 }
      );
    }

    // Конвертируем файл в Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Загружаем в S3
    const result = await uploadFileToS3(buffer, file.name, file.type);

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type,
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Ошибка при загрузке файла" },
      { status: 500 }
    );
  }
}