import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { movieId, availableSlots, basePrice, language, format } = body;

    // Валидация
    if (!movieId || !availableSlots || availableSlots.length === 0 || !basePrice) {
      return NextResponse.json(
        { error: "Все поля обязательны для заполнения" },
        { status: 400 }
      );
    }

    // Проверяем, что фильм существует
    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      return NextResponse.json({ error: "Фильм не найден" }, { status: 404 });
    }

    // Создаем сеансы массово
    const createdSessions = [];
    const errors = [];

    for (const slot of availableSlots) {
      try {
        // Еще раз проверяем конфликты перед созданием (на случай параллельных запросов)
        const conflictingSessions = await prisma.session.findMany({
          where: {
            hallId: slot.hallId,
            OR: [
              {
                AND: [
                  { startTime: { lte: new Date(slot.startTime) } },
                  { endTime: { gt: new Date(slot.startTime) } },
                ],
              },
              {
                AND: [
                  { startTime: { lt: new Date(slot.endTime) } },
                  { endTime: { gte: new Date(slot.endTime) } },
                ],
              },
              {
                AND: [
                  { startTime: { gte: new Date(slot.startTime) } },
                  { endTime: { lte: new Date(slot.endTime) } },
                ],
              },
            ],
          },
        });

        if (conflictingSessions.length > 0) {
          errors.push({
            slot,
            error: "Конфликт расписания",
          });
          continue;
        }

        // Создаем сеанс
        const newSession = await prisma.session.create({
          data: {
            movieId,
            hallId: slot.hallId,
            startTime: new Date(slot.startTime),
            endTime: new Date(slot.endTime),
            basePrice: String(basePrice),
            language,
            format,
          },
        });

        createdSessions.push(newSession);
      } catch (error) {
        console.error("Error creating session:", error);
        errors.push({
          slot,
          error: "Ошибка при создании",
        });
      }
    }

    return NextResponse.json({
      total: availableSlots.length,
      created: createdSessions.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    }, { status: 201 });
  } catch (error) {
    console.error("Error bulk creating sessions:", error);
    return NextResponse.json(
      { error: "Ошибка при массовом создании сеансов" },
      { status: 500 }
    );
  }
}
