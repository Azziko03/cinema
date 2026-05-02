import nodemailer from "nodemailer";

// Создаем транспортер для отправки email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Генерация 6-значного кода
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Отправка кода верификации
export async function sendVerificationEmail(
  email: string,
  code: string,
  fullName: string
): Promise<void> {
  const mailOptions = {
    from: `"Cinema App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Код подтверждения регистрации",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 10px;
              padding: 30px;
              color: white;
            }
            .code-box {
              background: white;
              color: #333;
              font-size: 32px;
              font-weight: bold;
              text-align: center;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              letter-spacing: 8px;
            }
            .footer {
              margin-top: 20px;
              font-size: 14px;
              opacity: 0.9;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Добро пожаловать, ${fullName}!</h1>
            <p>Спасибо за регистрацию в Cinema App. Для завершения регистрации введите код подтверждения:</p>
            <div class="code-box">${code}</div>
            <p>Код действителен в течение 10 минут.</p>
            <div class="footer">
              <p>Если вы не регистрировались в Cinema App, просто проигнорируйте это письмо.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Отправка кода для сброса пароля
export async function sendPasswordResetEmail(
  email: string,
  code: string,
  fullName: string
): Promise<void> {
  const mailOptions = {
    from: `"Cinema App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Сброс пароля",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              border-radius: 10px;
              padding: 30px;
              color: white;
            }
            .code-box {
              background: white;
              color: #333;
              font-size: 32px;
              font-weight: bold;
              text-align: center;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              letter-spacing: 8px;
            }
            .footer {
              margin-top: 20px;
              font-size: 14px;
              opacity: 0.9;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Здравствуйте, ${fullName}!</h1>
            <p>Вы запросили сброс пароля для вашего аккаунта в Cinema App. Используйте код ниже для подтверждения:</p>
            <div class="code-box">${code}</div>
            <p>Код действителен в течение 10 минут.</p>
            <div class="footer">
              <p>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо. Ваш пароль останется без изменений.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}
