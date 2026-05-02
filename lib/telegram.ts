import { prisma } from "./prisma";

/**
 * Генерирует 6-значный код для 2FA
 */
export function generateTelegramCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Отправляет код через Telegram Bot
 */
export async function sendTelegramCode(
  code: string,
  userName: string
): Promise<boolean> {
  try {
    // Получаем настройки из БД
    const [botToken, userId] = await Promise.all([
      prisma.setting.findUnique({
        where: { key: "ADMIN_TELEGRAM_BOT_TOKEN" },
      }),
      prisma.setting.findUnique({
        where: { key: "ADMIN_TELEGRAM_USER_ID" },
      }),
    ]);

    if (!botToken?.value || !userId?.value) {
      console.error("Telegram settings not found in database");
      return false;
    }

    const message = `🔐 *Код для входа в админ-панель*\n\nПользователь: ${userName}\nКод: \`${code}\`\n\nКод действителен 5 минут.`;

    const response = await fetch(
      `https://api.telegram.org/bot${botToken.value}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: userId.value,
          text: message,
          parse_mode: "Markdown",
        }),
      }
    );

    const data = await response.json();

    if (!data.ok) {
      console.error("Telegram API error:", data);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending Telegram code:", error);
    return false;
  }
}

/**
 * Сохраняет код 2FA в БД
 */
export async function saveTelegramCode(
  userId: string,
  code: string
): Promise<void> {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 минут

  await prisma.user.update({
    where: { id: userId },
    data: {
      verificationCode: code,
      codeExpiresAt: expiresAt,
    },
  });
}

/**
 * Проверяет код 2FA
 */
export async function verifyTelegramCode(
  userId: string,
  code: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      verificationCode: true,
      codeExpiresAt: true,
    },
  });

  if (!user || !user.verificationCode || !user.codeExpiresAt) {
    return false;
  }

  // Проверка срока действия
  if (new Date() > user.codeExpiresAt) {
    return false;
  }

  // Проверка кода
  if (user.verificationCode !== code) {
    return false;
  }

  // Очищаем код после успешной проверки
  await prisma.user.update({
    where: { id: userId },
    data: {
      verificationCode: null,
      codeExpiresAt: null,
    },
  });

  return true;
}
