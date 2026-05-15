import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
    const { movieId, hallId, startTime, endTime, basePrice, vipPrice, language, format } = body;

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
    // Добавляем 20 минут перерыва к времени окончания для проверки
    const BREAK_TIME_MINUTES = 20;
    const startTimeDate = new Date(startTime);
    const endTimeDate = new Date(endTime);
    const endTimeWithBreak = new Date(endTimeDate.getTime() + BREAK_TIME_MINUTES * 60 * 1000);
    
    const conflictingSessions = await prisma.session.findMany({
      where: {
        hallId,
        id: { not: id },
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

    // Маппинг формата для базы данных (для совместимости со старым кодом)
    // Prisma enum использует TWO_D, THREE_D, IMAX
    const formatMap: Record<string, string> = {
      '2D': 'TWO_D',
      '3D': 'THREE_D',
      'IMAX': 'IMAX',
      'TWO_D': 'TWO_D',
      'THREE_D': 'THREE_D',
    };
    const prismaFormat = formatMap[format] || format;

    // Обновляем сеанс через Prisma update
    const updatedSession = await prisma.session.update({
      where: { id },
      data: {
        movieId,
        hallId,
        startTime: startTimeDate,
        endTime: endTimeDate,
        basePrice: String(basePrice),
        vipPrice: vipPrice ? String(vipPrice) : null,
        language: language as any,
        format: prismaFormat as any,
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

    // Очищаем кеш для всех связанных страниц
    revalidatePath('/');
    revalidatePath('/admin/sessions');
    revalidatePath(`/admin/sessions/${id}/edit`);

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении сеанса" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(request, { params });
}
