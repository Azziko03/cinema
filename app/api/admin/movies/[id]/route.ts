import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFileFromS3ByUrl } from "@/lib/s3";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Валидация статуса
    if (!status || !["now_showing", "coming_soon", "archived"].includes(status)) {
      return NextResponse.json(
        { error: "Некорректный статус" },
        { status: 400 }
      );
    }

    // Проверяем существование фильма
    const existingMovie = await prisma.movie.findUnique({
      where: { id },
    });

    if (!existingMovie) {
      return NextResponse.json({ error: "Фильм не найден" }, { status: 404 });
    }

    // Обновляем только статус
    const movie = await prisma.movie.update({
      where: { id },
      data: { status },
      include: {
        translations: true,
        mediaFiles: true,
      },
    });

    return NextResponse.json(movie);
  } catch (error) {
    console.error("Error updating movie status:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении статуса фильма" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const body = await request.json();
    const {
      title,
      description,
      genre,
      durationMinutes,
      ageRating,
      status,
      releaseDate,
      country,
      year,
      posterUrl,
      trailerUrl,
    } = body;

    // Валидация обязательных полей
    if (
      !title ||
      !description ||
      !genre ||
      !durationMinutes ||
      !ageRating ||
      !status ||
      !releaseDate ||
      !country ||
      !year
    ) {
      return NextResponse.json(
        { error: "Все обязательные поля должны быть заполнены" },
        { status: 400 }
      );
    }

    // Проверяем существование фильма
    const existingMovie = await prisma.movie.findUnique({
      where: { id },
      include: {
        genres: true,
        mediaFiles: true,
      },
    });

    if (!existingMovie) {
      return NextResponse.json({ error: "Фильм не найден" }, { status: 404 });
    }

    // Сохраняем старые файлы для удаления из S3
    const oldMediaFiles = existingMovie.mediaFiles;

    // Находим или создаем жанр
    let genreRecord = await prisma.genre.findFirst({
      where: {
        translations: {
          some: {
            title: {
              equals: genre,
              mode: 'insensitive' // Регистронезависимый поиск
            },
            language: "RU",
          },
        },
      },
      include: {
        translations: true,
      },
    });

    if (!genreRecord) {
      // Создаем slug для жанра
      const slug = genre
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^а-яa-z0-9-]/g, "");

      // Проверяем, существует ли жанр с таким slug
      genreRecord = await prisma.genre.findUnique({
        where: { slug },
        include: {
          translations: true,
        },
      });

      // Если жанр с таким slug не существует, создаем новый
      if (!genreRecord) {
        genreRecord = await prisma.genre.create({
          data: {
            slug,
            translations: {
              create: [
                {
                  language: "RU",
                  title: genre,
                },
                {
                  language: "KG",
                  title: genre,
                },
                {
                  language: "EN",
                  title: genre,
                },
              ],
            },
          },
          include: {
            translations: true,
          },
        });
      }
    }

    // Обновляем фильм
    const movie = await prisma.movie.update({
      where: { id },
      data: {
        durationMinutes: parseInt(durationMinutes, 10),
        ageRating,
        releaseDate: new Date(releaseDate),
        status,
        translations: {
          deleteMany: {},
          create: [
            {
              language: "RU",
              title: title,
              description: description,
            },
            {
              language: "KG",
              title: title,
              description: description,
            },
          ],
        },
        metadata: {
          upsert: {
            create: {
              country,
              year: parseInt(year),
              imdbRating: 5.0, // При создании новых метаданных ставим 5.0
              kinopoiskRating: null,
            },
            update: {
              country,
              year: parseInt(year),
              // При обновлении НЕ изменяем рейтинг, оставляем существующий
            },
          },
        },
        genres: {
          deleteMany: {},
          create: {
            genreId: genreRecord.id,
          },
        },
        mediaFiles: {
          deleteMany: {},
          create: [
            ...(posterUrl
              ? [
                  {
                    type: "poster" as const,
                    url: posterUrl,
                  },
                ]
              : []),
            ...(trailerUrl
              ? [
                  {
                    type: "trailer" as const,
                    url: trailerUrl,
                  },
                ]
              : []),
          ],
        },
      },
      include: {
        translations: true,
        metadata: true,
        genres: {
          include: {
            genre: {
              include: {
                translations: true,
              },
            },
          },
        },
        mediaFiles: true,
      },
    });

    // Удаляем старые файлы из S3 (в фоновом режиме)
    if (oldMediaFiles.length > 0) {
      // Не ждем завершения удаления, чтобы не замедлять ответ
      Promise.all(
        oldMediaFiles.map(async (file) => {
          try {
            await deleteFileFromS3ByUrl(file.url);
          } catch (error) {
            console.error(`Failed to delete old file from S3: ${file.url}`, error);
          }
        })
      ).catch(error => {
        console.error("Error deleting old files from S3:", error);
      });
    }

    return NextResponse.json(movie);
  } catch (error) {
    console.error("Error updating movie:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении фильма" },
      { status: 500 }
    );
  }
}
