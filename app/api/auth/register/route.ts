import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { generateVerificationCode, sendVerificationEmail } from "@/lib/email";

const registerSchema = z.object({
  email: z.string().email("Неверный формат email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  fullName: z.string().min(2, "Имя должно содержать минимум 2 символа"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация
    const validatedData = registerSchema.parse(body);

    // Проверка существующего пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 400 }
      );
    }

    // Хеширование пароля
    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    // Генерация кода верификации
    const verificationCode = generateVerificationCode();
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    // Создание пользователя (не верифицирован)
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash,
        fullName: validatedData.fullName,
        role: "user",
        status: "active",
        emailVerified: false,
        verificationCode,
        codeExpiresAt,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });

    // Отправка кода на email
    try {
      await sendVerificationEmail(
        validatedData.email,
        verificationCode,
        validatedData.fullName
      );
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // Удаляем пользователя если не удалось отправить email
      await prisma.user.delete({ where: { id: user.id } });
      return NextResponse.json(
        { error: "Не удалось отправить код подтверждения. Попробуйте позже." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Код подтверждения отправлен на email",
        userId: user.id,
        email: user.email,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Ошибка при регистрации" },
      { status: 500 }
    );
  }
}
