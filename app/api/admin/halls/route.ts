import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - получить все залы
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const halls = await prisma.hall.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            seats: true,
            sessions: true,
          },
        },
      },
    });

    return NextResponse.json(halls);
  } catch (error) {
    console.error("Error fetching halls:", error);
    return NextResponse.json(
      { error: "Failed to fetch halls" },
      { status: 500 }
    );
  }
}

// POST - создать новый зал
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, totalSeats, seats } = body;

    // Валидация
    if (!name || !totalSeats) {
      return NextResponse.json(
        { error: "Name and totalSeats are required" },
        { status: 400 }
      );
    }

    if (totalSeats < 1) {
      return NextResponse.json(
        { error: "Total seats must be at least 1" },
        { status: 400 }
      );
    }

    // Проверка на дубликат имени
    const existingHall = await prisma.hall.findFirst({
      where: { name },
    });

    if (existingHall) {
      return NextResponse.json(
        { error: "Hall with this name already exists" },
        { status: 400 }
      );
    }

    // Создание зала с местами в транзакции
    const hall = await prisma.$transaction(async (tx) => {
      // Создаем зал
      const newHall = await tx.hall.create({
        data: {
          name,
          description: description || null,
          totalSeats,
        },
      });

      // Если переданы места, создаем их
      if (seats && Array.isArray(seats) && seats.length > 0) {
        await tx.seat.createMany({
          data: seats.map((seat: { rowNumber: number; seatNumber: number; isActive?: boolean; isVip?: boolean }) => ({
            hallId: newHall.id,
            rowNumber: seat.rowNumber,
            seatNumber: seat.seatNumber,
            isActive: seat.isActive !== undefined ? seat.isActive : true,
            isVip: seat.isVip || false,
          })),
        });
      }

      return newHall;
    });

    return NextResponse.json(hall, { status: 201 });
  } catch (error) {
    console.error("Error creating hall:", error);
    return NextResponse.json(
      { error: "Failed to create hall" },
      { status: 500 }
    );
  }
}

// PATCH - обновить зал
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description, totalSeats, seats } = body;

    if (!id) {
      return NextResponse.json({ error: "Hall ID is required" }, { status: 400 });
    }

    // Проверка существования зала
    const existingHall = await prisma.hall.findUnique({
      where: { id },
    });

    if (!existingHall) {
      return NextResponse.json({ error: "Hall not found" }, { status: 404 });
    }

    // Проверка на дубликат имени (если имя изменилось)
    if (name && name !== existingHall.name) {
      const duplicateHall = await prisma.hall.findFirst({
        where: { 
          name,
          id: { not: id }
        },
      });

      if (duplicateHall) {
        return NextResponse.json(
          { error: "Hall with this name already exists" },
          { status: 400 }
        );
      }
    }

    // Валидация totalSeats
    if (totalSeats !== undefined && totalSeats < 1) {
      return NextResponse.json(
        { error: "Total seats must be at least 1" },
        { status: 400 }
      );
    }

    // Обновление зала с местами в транзакции
    const updatedHall = await prisma.$transaction(async (tx) => {
      // Обновляем зал
      const hall = await tx.hall.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(totalSeats && { totalSeats }),
        },
      });

      // Если переданы места, обновляем их
      if (seats && Array.isArray(seats)) {
        // Удаляем все существующие места
        await tx.seat.deleteMany({
          where: { hallId: id },
        });

        // Создаем новые места
        if (seats.length > 0) {
          await tx.seat.createMany({
            data: seats.map((seat: { 
              id?: string; 
              rowNumber: number; 
              seatNumber: number; 
              isActive?: boolean;
              isVip?: boolean 
            }) => ({
              hallId: id,
              rowNumber: seat.rowNumber,
              seatNumber: seat.seatNumber,
              isActive: seat.isActive !== undefined ? seat.isActive : true,
              isVip: seat.isVip || false,
            })),
          });
        }
      }

      return hall;
    });

    // Получаем обновленный зал с подсчетами
    const hallWithCounts = await prisma.hall.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            seats: true,
            sessions: true,
          },
        },
      },
    });

    return NextResponse.json(hallWithCounts);
  } catch (error) {
    console.error("Error updating hall:", error);
    return NextResponse.json(
      { error: "Failed to update hall" },
      { status: 500 }
    );
  }
}

// DELETE - удалить зал
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Hall ID is required" }, { status: 400 });
    }

    // Проверка существования зала
    const existingHall = await prisma.hall.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            sessions: true,
          },
        },
      },
    });

    if (!existingHall) {
      return NextResponse.json({ error: "Hall not found" }, { status: 404 });
    }

    // Проверка на активные сеансы
    if (existingHall._count.sessions > 0) {
      return NextResponse.json(
        { error: "Cannot delete hall with existing sessions" },
        { status: 400 }
      );
    }

    await prisma.hall.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting hall:", error);
    return NextResponse.json(
      { error: "Failed to delete hall" },
      { status: 500 }
    );
  }
}
