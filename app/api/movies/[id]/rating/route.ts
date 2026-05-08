import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { rating } = await request.json();

    // Валидация рейтинга
    if (!rating || rating < 1 || rating > 10) {
      return NextResponse.json(
        { error: "Рейтинг должен быть от 1 до 10" },
        { status: 400 }
      );
    }

    // Проверяем существование фильма
    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        metadata: true,
      },
    });

    if (!movie) {
      return NextResponse.json({ error: "Фильм не найден" }, { status: 404 });
    }

    // Здесь можно добавить логику для сохранения пользовательских оценок
    // и вычисления среднего рейтинга
    
    // Пока что просто обновляем рейтинг (в будущем это будет средний рейтинг)
    const updatedMovie = await prisma.movie.update({
      where: { id },
      data: {
        metadata: {
          update: {
            imdbRating: parseFloat(rating),
          },
        },
      },
      include: {
        metadata: true,
      },
    });

    return NextResponse.json({
      success: true,
      newRating: updatedMovie.metadata?.imdbRating,
    });

  } catch (error) {
    console.error("Error updating movie rating:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении рейтинга" },
      { status: 500 }
    );
  }
}