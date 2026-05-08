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
    const { movieId, hallId, startTime, endTime, basePrice, language, format } = body;

    // Валидация
    if (!movieId || !hallId || !startTime || !endTime || !basePrice) {
      return NextResponse.json(
        { error: "Все поля обязательны для заполнения" },
        { status: 400 }
      );
    }

    // Проверяем, что сеанс существует
    const existingSession = await prisma.session.findUnique({
      where: { id },
    });

    if (!existingSession) {
      return NextResponse.json({ error: "Сеанс не найден" }, { status: 404 });
    }

    // Проверяем, что фильм существует
    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      return NextResponse.json({ error: "Фильм не найден" }, { status: 404 });
    }

    // Проверяем, что зал существует
    const hall = await prisma.hall.findUnique({
      where: { id: hallId },
    });

    if (!hall) {
      return NextResponse.json({ error: "Зал не найден" }, { status: 404 });
    }

    // Проверяем, что зал свободен в это время (исключая текущий сеанс)
    const conflictingSessions = await prisma.session.findMany({
      where: {
        hallId,
        id: { not: id },
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(startTime) } },
              { endTime: { gt: new Date(startTime) } },
            ],
          },
          {
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gte: new Date(endTime) } },
            ],
          },
          {
            AND: [
              { startTime: { gte: new Date(startTime) } },
              { endTime: { lte: new Date(endTime) } },
            ],
          },
        ],
      },
    });

    if (conflictingSessions.length > 0) {
      return NextResponse.json(
        { error: "Зал занят в это время" },
        { status: 400 }
      );
    }

    // Обновляем сеанс
    const updatedSession = await prisma.session.update({
      where: { id },
      data: {
        movieId,
        hallId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        basePrice,
        language,
        format,
      },
      include: {
        movie: {
          include: {
            translations: true,
            mediaFiles: true,
          },
        },
        hall: true,
      },
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении сеанса" },
      { status: 500 }
    );
  }
}
