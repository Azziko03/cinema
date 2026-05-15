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
    const { movieId, hallId, startTime, endTime, basePrice, vipPrice, language, format } = body;

    // Валидация
    if (!movieId || !hallId || !startTime || !endTime || !basePrice) {
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

    // Проверяем, что зал существует
    const hall = await prisma.hall.findUnique({
      where: { id: hallId },
    });

    if (!hall) {
      return NextResponse.json({ error: "Зал не найден" }, { status: 404 });
    }

    // Проверяем, что зал свободен в это время
    // Добавляем 20 минут перерыва к времени окончания для проверки
    const BREAK_TIME_MINUTES = 20;
    const startTimeDate = new Date(startTime);
    const endTimeDate = new Date(endTime);
    const endTimeWithBreak = new Date(endTimeDate.getTime() + BREAK_TIME_MINUTES * 60 * 1000);
    
    const conflictingSessions = await prisma.session.findMany({
      where: {
        hallId,
        OR: [
          {
            AND: [
              { startTime: { lte: startTimeDate } },
              { endTime: { gt: startTimeDate } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTimeWithBreak } },
              { endTime: { gte: endTimeWithBreak } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTimeDate } },
              { endTime: { lte: endTimeWithBreak } },
            ],
          },
        ],
      },
      include: {
        movie: {
          include: {
            translations: true,
          },
        },
      },
    });

    if (conflictingSessions.length > 0) {
      const conflictingSession = conflictingSessions[0];
      const movieTitle = conflictingSession.movie.translations.find(t => t.language === 'RU')?.title 
        || conflictingSession.movie.translations[0]?.title 
        || 'Неизвестный фильм';
      
      const conflictStart = new Date(conflictingSession.startTime).toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      const conflictEnd = new Date(conflictingSession.endTime).toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      return NextResponse.json(
        { 
          error: `Зал занят: "${movieTitle}" (${conflictStart} - ${conflictEnd}). Требуется перерыв ${BREAK_TIME_MINUTES} минут` 
        },
        { status: 400 }
      );
    }

    // Создаем сеанс
    const newSession = await prisma.session.create({
      data: {
        movieId,
        hallId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        basePrice: String(basePrice),
        vipPrice: vipPrice ? String(vipPrice) : null,
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

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Ошибка при создании сеанса" },
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
      return NextResponse.json(
        { error: "ID сеанса обязателен" },
        { status: 400 }
      );
    }

    // Проверяем, что сеанс существует
    const existingSession = await prisma.session.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });

    if (!existingSession) {
      return NextResponse.json({ error: "Сеанс не найден" }, { status: 404 });
    }

    // Проверяем, есть ли проданные билеты
    if (existingSession._count.orderItems > 0) {
      return NextResponse.json(
        { error: "Нельзя удалить сеанс с проданными билетами" },
        { status: 400 }
      );
    }

    // Удаляем сеанс
    await prisma.session.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Сеанс успешно удален" });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Ошибка при удалении сеанса" },
      { status: 500 }
    );
  }
}
