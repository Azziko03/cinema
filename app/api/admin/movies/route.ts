import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFileFromS3ByUrl } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      !year ||
      !posterUrl
    ) {
      return NextResponse.json(
        { error: "Все обязательные поля должны быть заполнены" },
        { status: 400 }
      );
    }

    // Создаем или находим жанр
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

    // Создаем фильм с транзакцией
    const movie = await prisma.movie.create({
      data: {
        durationMinutes: parseInt(durationMinutes),
        ageRating,
        releaseDate: new Date(releaseDate),
        status,
        translations: {
          create: [
            {
              language: "RU",
              title: title,
              description: description,
            },
            {
              language: "KG",
              title: title, // Можно добавить отдельное поле для KG
              description: description,
            },
          ],
        },
        metadata: {
          create: {
            country,
            year: parseInt(year),
            imdbRating: 5.0, // Автоматически устанавливаем рейтинг 5.0
            kinopoiskRating: null,
          },
        },
        genres: {
          create: {
            genreId: genreRecord.id,
          },
        },
        mediaFiles: {
          create: [
            {
              type: "poster",
              url: posterUrl,
            },
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

    return NextResponse.json(movie, { status: 201 });
  } catch (error) {
    console.error("Error creating movie:", error);
    return NextResponse.json(
      { error: "Ошибка при создании фильма" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID не указан" }, { status: 400 });
    }

    // Проверяем, есть ли активные сеансы
    const sessionsCount = await prisma.session.count({
      where: { movieId: id },
    });

    if (sessionsCount > 0) {
      return NextResponse.json(
        { error: "Невозможно удалить фильм с активными сеансами" },
        { status: 400 }
      );
    }

    // Получаем файлы фильма для удаления из S3
    const movieWithFiles = await prisma.movie.findUnique({
      where: { id },
      include: {
        mediaFiles: true,
      },
    });

    if (!movieWithFiles) {
      return NextResponse.json({ error: "Фильм не найден" }, { status: 404 });
    }

    // Удаляем фильм из базы данных
    await prisma.movie.delete({
      where: { id },
    });

    // Удаляем файлы из S3 (в фоновом режиме)
    if (movieWithFiles.mediaFiles.length > 0) {
      Promise.all(
        movieWithFiles.mediaFiles.map(async (file) => {
          try {
            await deleteFileFromS3ByUrl(file.url);
          } catch (error) {
            console.error(`Failed to delete file from S3: ${file.url}`, error);
          }
        })
      ).catch(error => {
        console.error("Error deleting movie files from S3:", error);
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting movie:", error);
    return NextResponse.json(
      { error: "Ошибка при удалении фильма" },
      { status: 500 }
    );
  }
}
