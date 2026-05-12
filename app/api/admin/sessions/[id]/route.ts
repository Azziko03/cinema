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

    // Маппинг формата для базы данных
    const formatMap: Record<string, string> = {
      'TWO_D': '2D',
      'THREE_D': '3D',
      'IMAX': 'IMAX'
    };
    const dbFormat = formatMap[format] || format;

    // Обновляем сеанс с использованием executeRaw для обновления внешних ключей
    if (vipPrice) {
      await prisma.$executeRaw`
        UPDATE sessions 
        SET 
          movie_id = ${movieId}::uuid,
          hall_id = ${hallId}::uuid,
          start_time = ${new Date(startTime)},
          end_time = ${new Date(endTime)},
          base_price = ${String(basePrice)}::decimal,
          vip_price = ${String(vipPrice)}::decimal,
          language = ${language}::"SessionLanguage",
          format = ${dbFormat}::"SessionFormat"
        WHERE id = ${id}::uuid
      `;
    } else {
      await prisma.$executeRaw`
        UPDATE sessions 
        SET 
          movie_id = ${movieId}::uuid,
          hall_id = ${hallId}::uuid,
          start_time = ${new Date(startTime)},
          end_time = ${new Date(endTime)},
          base_price = ${String(basePrice)}::decimal,
          vip_price = NULL,
          language = ${language}::"SessionLanguage",
          format = ${dbFormat}::"SessionFormat"
        WHERE id = ${id}::uuid
      `;
    }

    // Получаем обновленный сеанс
    const updatedSession = await prisma.session.findUnique({
      where: { id },
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

    // Очищаем кеш для главной страницы и страницы сеансов
    revalidatePath('/');
    revalidatePath('/admin/sessions');

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
