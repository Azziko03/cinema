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
    const { movieId, hallIds, selectedDates, timeSlots, durationMinutes } = body;

    // Валидация
    if (!movieId || !hallIds || hallIds.length === 0 || !selectedDates || selectedDates.length === 0 || !timeSlots || timeSlots.length === 0 || !durationMinutes) {
      return NextResponse.json(
        { error: "Все поля обязательны для заполнения" },
        { status: 400 }
      );
    }

    // Преобразуем строки дат в объекты Date
    const dates: Date[] = selectedDates.map((dateStr: string) => new Date(dateStr));

    // Получаем все существующие сеансы для выбранных залов в указанном диапазоне
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    const existingSessions = await prisma.session.findMany({
      where: {
        hallId: { in: hallIds },
        startTime: {
          gte: minDate,
          lte: new Date(maxDate.getTime() + 24 * 60 * 60 * 1000), // +1 день
        },
      },
      include: {
        hall: true,
      },
    });

    // Проверяем доступность для каждой комбинации
    const availableSlots: any[] = [];
    const conflicts: any[] = [];
    let totalRequested = 0;

    for (const date of dates) {
      for (const time of timeSlots) {
        for (const hallId of hallIds) {
          totalRequested++;

          // Создаем DateTime для начала и конца сеанса
          const [hours, minutes] = time.split(':').map(Number);
          const startTime = new Date(date);
          startTime.setHours(hours, minutes, 0, 0);
          
          const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

          // Проверяем конфликты
          const hasConflict = existingSessions.some((existingSession) => {
            if (existingSession.hallId !== hallId) return false;

            const existingStart = new Date(existingSession.startTime);
            const existingEnd = new Date(existingSession.endTime);

            // Проверка пересечения временных интервалов
            return (
              (startTime >= existingStart && startTime < existingEnd) ||
              (endTime > existingStart && endTime <= existingEnd) ||
              (startTime <= existingStart && endTime >= existingEnd)
            );
          });

          const hall = await prisma.hall.findUnique({ where: { id: hallId } });

          if (hasConflict) {
            conflicts.push({
              hallId,
              hallName: hall?.name || 'Неизвестный зал',
              date: date.toLocaleDateString('ru-RU'),
              time,
              startTime: startTime.toISOString(),
              endTime: endTime.toISOString(),
            });
          } else {
            availableSlots.push({
              hallId,
              hallName: hall?.name || 'Неизвестный зал',
              date: date.toLocaleDateString('ru-RU'),
              time,
              startTime: startTime.toISOString(),
              endTime: endTime.toISOString(),
            });
          }
        }
      }
    }

    return NextResponse.json({
      totalRequested,
      totalAvailable: availableSlots.length,
      totalConflicts: conflicts.length,
      availableSlots,
      conflicts,
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    return NextResponse.json(
      { error: "Ошибка при проверке доступности" },
      { status: 500 }
    );
  }
}
