import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
      rating,
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

    // Находим или создаем жанр
    let genreRecord = await prisma.genre.findFirst({
      where: {
        translations: {
          some: {
            title: genre,
            language: "RU",
          },
        },
      },
    });

    if (!genreRecord) {
      // Создаем slug для жанра
      const slug = genre
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      // Проверяем, существует ли жанр с таким slug
      genreRecord = await prisma.genre.findUnique({
        where: { slug },
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
              ],
            },
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
              imdbRating: rating ? parseFloat(rating) : 5.0,
              kinopoiskRating: null,
            },
            update: {
              country,
              year: parseInt(year),
              imdbRating: rating ? parseFloat(rating) : 5.0,
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

    return NextResponse.json(movie);
  } catch (error) {
    console.error("Error updating movie:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении фильма" },
      { status: 500 }
    );
  }
}
