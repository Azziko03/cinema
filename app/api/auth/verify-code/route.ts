import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const verifySchema = z.object({
  userId: z.string().uuid(),
  code: z.string().min(6).max(6, "Код должен содержать 6 цифр"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация
    const validatedData = verifySchema.parse(body);

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

    // Подтверждение email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationCode: null,
        codeExpiresAt: null,
      },
    });

    return NextResponse.json(
      {
        message: "Email успешно подтвержден",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Ошибка при подтверждении кода" },
      { status: 500 }
    );
  }
}
