import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { generateVerificationCode, sendVerificationEmail } from "@/lib/email";

const resendSchema = z.object({
  userId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация
    const validatedData = resendSchema.parse(body);

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

    // Проверка, что пользователь еще не верифицирован
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email уже подтвержден" },
        { status: 400 }
      );
    }

    // Генерация нового кода
    const verificationCode = generateVerificationCode();
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    // Обновление кода в БД
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode,
        codeExpiresAt,
      },
    });

    // Отправка нового кода
    try {
      await sendVerificationEmail(user.email, verificationCode, user.fullName);
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return NextResponse.json(
        { error: "Не удалось отправить код. Попробуйте позже." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Новый код отправлен на email",
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

    console.error("Resend code error:", error);
    return NextResponse.json(
      { error: "Ошибка при отправке кода" },
      { status: 500 }
    );
  }
}
