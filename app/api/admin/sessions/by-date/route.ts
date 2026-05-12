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
    const { date, hallIds } = body;

    if (!date || !hallIds || hallIds.length === 0) {
      return NextResponse.json(
        { error: "Дата и залы обязательны" },
        { status: 400 }
      );
    }

    // Получаем начало и конец дня
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Получаем все сеансы для выбранных залов на эту дату
    const sessions = await prisma.session.findMany({
      where: {
        hallId: { in: hallIds },
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        startTime: 'asc',
      },
      include: {
        movie: {
          include: {
            translations: true,
          },
        },
        hall: true,
      },
    });

    return NextResponse.json({
      sessions: sessions.map(s => ({
        id: s.id,
        startTime: s.startTime.toISOString(),
        endTime: s.endTime.toISOString(),
        movieTitle: s.movie.translations.find(t => t.language === 'RU')?.title || 'Без названия',
        hallName: s.hall.name,
      })),
    });
  } catch (error) {
    console.error("Error fetching sessions by date:", error);
    return NextResponse.json(
      { error: "Ошибка при получении сеансов" },
      { status: 500 }
    );
  }
}
