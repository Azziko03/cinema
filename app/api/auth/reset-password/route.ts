import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const resetPasswordSchema = z.object({
  userId: z.string().uuid(),
  code: z.string().length(6, "Код должен содержать 6 цифр"),
  newPassword: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация
    const validatedData = resetPasswordSchema.parse(body);

    // Поиск пользователя
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    // Проверка кода
    if (user.verificationCode !== validatedData.code) {
      return NextResponse.json(
        { error: "Неверный код подтверждения" },
        { status: 400 }
      );
    }

    // Проверка срока действия кода
    if (!user.codeExpiresAt || user.codeExpiresAt < new Date()) {
      return NextResponse.json(
        { error: "Код подтверждения истек. Запросите новый код." },
        { status: 400 }
      );
    }

    // Хеширование нового пароля
    const passwordHash = await bcrypt.hash(validatedData.newPassword, 10);

    // Обновление пароля и очистка кода
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        verificationCode: null,
        codeExpiresAt: null,
      },
    });

    return NextResponse.json(
      {
        message: "Пароль успешно изменен",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Ошибка при сбросе пароля" },
      { status: 500 }
    );
  }
}
