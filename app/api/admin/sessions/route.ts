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
    const { movieId, hallId, startTime, endTime, basePrice, language, format } = body;

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
    const conflictingSessions = await prisma.session.findMany({
      where: {
        hallId,
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

    // Создаем сеанс
    const newSession = await prisma.session.create({
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
