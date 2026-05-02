import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/lib/auth";

const createControllerSchema = z.object({
  fullName: z.string().min(2, "Имя должно содержать минимум 2 символа"),
});

export async function POST(request: NextRequest) {
  try {
    // Проверка авторизации
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Валидация
    const validatedData = createControllerSchema.parse(body);

    // Создание контроллера без email и пароля
    const controller = await prisma.user.create({
      data: {
        email: `controller_${Date.now()}@cinema.kg`, // Временный email
        fullName: validatedData.fullName,
        role: "controller",
        status: "active",
        emailVerified: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
      },
    });

    return NextResponse.json(
      {
        message: "Контроллер успешно создан",
        controller,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Create controller error:", error);
    return NextResponse.json(
      { error: "Ошибка при создании контроллера" },
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
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting controller:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
