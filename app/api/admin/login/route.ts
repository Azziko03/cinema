import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  generateTelegramCode,
  sendTelegramCode,
  saveTelegramCode,
} from "@/lib/telegram";

const loginSchema = z.object({
  email: z.string().email("Неверный формат email"),
  password: z.string().min(1, "Пароль обязателен"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Валидация
    const validatedData = loginSchema.parse(body);

    // Поиск пользователя
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 401 }
      );
    }

    // Проверка роли
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Доступ запрещен. Только для администраторов." },
        { status: 403 }
      );
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 401 }
      );
    }

    // Проверка статуса
    if (user.status !== "active") {
      return NextResponse.json(
        { error: "Аккаунт заблокирован" },
        { status: 403 }
      );
    }

    // Генерация и отправка кода через Telegram
    const code = generateTelegramCode();
    await saveTelegramCode(user.id, code);

    const sent = await sendTelegramCode(code, user.fullName);

    if (!sent) {
      return NextResponse.json(
        { error: "Не удалось отправить код. Проверьте настройки Telegram." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Код отправлен в Telegram",
      userId: user.id,
      requiresTwoFactor: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Ошибка при входе" },
      { status: 500 }
    );
  }
}
