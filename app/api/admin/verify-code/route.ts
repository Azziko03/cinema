import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { verifyTelegramCode } from "@/lib/telegram";
import { signIn } from "@/lib/auth";

const verifySchema = z.object({
  userId: z.string().uuid("Неверный ID пользователя"),
  code: z.string().min(6).max(6, "Код должен содержать 6 цифр"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Валидация
    const validatedData = verifySchema.parse(body);

    // Проверка кода
    const isValid = await verifyTelegramCode(
      validatedData.userId,
      validatedData.code
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Неверный или истекший код" },
        { status: 401 }
      );
    }

    // Получаем данные пользователя
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        image: true,
      },
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Пользователь не найден или не является администратором" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Код подтвержден",
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Admin verify code error:", error);
    return NextResponse.json(
      { error: "Ошибка при проверке кода" },
      { status: 500 }
    );
  }
}
