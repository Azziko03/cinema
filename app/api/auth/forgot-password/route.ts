import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { generateVerificationCode, sendPasswordResetEmail } from "@/lib/email";

const forgotPasswordSchema = z.object({
  email: z.string().email("Неверный формат email"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация
    const validatedData = forgotPasswordSchema.parse(body);

    // Поиск пользователя
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    // Не раскрываем существование пользователя из соображений безопасности
    if (!user) {
      return NextResponse.json(
        {
          message: "Если пользователь с таким email существует, код был отправлен на почту",
          success: true,
        },
        { status: 200 }
      );
    }

    // Проверка, что это не OAuth пользователь
    if (user.googleId && !user.passwordHash) {
      return NextResponse.json(
        { error: "Этот аккаунт использует вход через Google" },
        { status: 400 }
      );
    }

    // Генерация кода сброса пароля
    const resetCode = generateVerificationCode();
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    // Сохранение кода в БД
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode: resetCode,
        codeExpiresAt,
      },
    });

    // Отправка кода на email
    try {
      await sendPasswordResetEmail(user.email, resetCode, user.fullName);
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return NextResponse.json(
        { error: "Не удалось отправить код. Попробуйте позже." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Код для сброса пароля отправлен на email",
        userId: user.id,
        email: user.email,
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

    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Ошибка при обработке запроса" },
      { status: 500 }
    );
  }
}
