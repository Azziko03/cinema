import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

const createControllerSchema = z.object({
  fullName: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  email: z.string().email("Неверный формат email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  status: z.enum(["active", "inactive"]).optional(),
  emailVerified: z.boolean().optional(),
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

    // Проверка уникальности email
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email уже используется" },
        { status: 400 }
      );
    }

    // Хеширование пароля
    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    // Создание контроллера
    const controller = await prisma.user.create({
      data: {
        email: validatedData.email,
        fullName: validatedData.fullName,
        passwordHash,
        role: "controller",
        status: validatedData.status || "active",
        emailVerified: validatedData.emailVerified || false,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        emailVerified: true,
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

    // Вместо удаления меняем статус на inactive
    await prisma.user.update({
      where: { id },
      data: { status: "inactive" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deactivating controller:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, fullName, email, status, password } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Проверка уникальности email
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id },
        },
      });

      if (existingUser) {
        return NextResponse.json({ error: "Email уже используется" }, { status: 400 });
      }
    }

    // Подготовка данных для обновления
    const updateData: any = {
      ...(fullName && { fullName }),
      ...(email && { email }),
      ...(status && { status }),
    };

    // Если передан пароль, хешируем его
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      updateData.passwordHash = passwordHash;
    }

    const updatedController = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, controller: updatedController });
  } catch (error) {
    console.error("Error updating controller:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
