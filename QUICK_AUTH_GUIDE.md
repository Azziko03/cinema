# 🚀 Быстрый старт системы аутентификации

## ⚡ Что уже работает

✅ Регистрация и вход с email/паролем  
✅ Вход через Google OAuth  
✅ Защита роутов  
✅ Профиль пользователя  
✅ Управление сессиями через cookies  

## 🔑 Настройка за 3 шага

### 1️⃣ Настройте Google OAuth (опционально)

Если хотите вход через Google:

1. Перейдите на https://console.cloud.google.com/
2. Создайте OAuth Client ID
3. Добавьте redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Скопируйте Client ID и Secret в `.env`:

\`\`\`env
GOOGLE_CLIENT_ID="ваш-client-id"
GOOGLE_CLIENT_SECRET="ваш-client-secret"
\`\`\`

### 2️⃣ Сгенерируйте секретный ключ

\`\`\`bash
openssl rand -base64 32
\`\`\`

Добавьте в `.env`:
\`\`\`env
NEXTAUTH_SECRET="сгенерированный-ключ"
\`\`\`

### 3️⃣ Запустите приложение

\`\`\`bash
npm run dev
\`\`\`

## 📍 Доступные страницы

- **Регистрация**: http://localhost:3000/auth/signup
- **Вход**: http://localhost:3000/auth/signin
- **Профиль**: http://localhost:3000/profile (требует авторизации)

## 🧪 Тестирование

### Тест обычной регистрации:
1. Откройте `/auth/signup`
2. Заполните форму
3. Нажмите "Зарегистрироваться"
4. Вы будете автоматически авторизованы

### Тест входа через Google:
1. Откройте `/auth/signin`
2. Нажмите "Войти через Google"
3. Выберите Google аккаунт
4. Пользователь будет создан автоматически

## 🔒 Защита роутов

Роуты автоматически защищены через middleware:

- `/profile` - требует авторизации
- `/settings` - требует авторизации
- `/orders` - требует авторизации
- `/admin/*` - требует роль admin

## 💡 Использование в коде

### Серверный компонент:
\`\`\`typescript
import { getCurrentUser } from "@/lib/session";

const user = await getCurrentUser();
\`\`\`

### Клиентский компонент:
\`\`\`typescript
"use client";
import { useSession } from "next-auth/react";

const { data: session } = useSession();
\`\`\`

## 📝 Структура БД

Таблица `users` содержит:
- `email` - email пользователя
- `passwordHash` - хеш пароля (опционально для OAuth)
- `fullName` - полное имя
- `role` - роль (user, admin, controller)
- `status` - статус (active, inactive)
- `googleId` - ID Google аккаунта (для OAuth)
- `image` - URL аватара

## 🎯 Что дальше?

Система готова к использованию! Можете:
- Добавить страницу настроек
- Реализовать восстановление пароля
- Добавить двухфакторную аутентификацию
- Интегрировать с системой заказов билетов

Подробная документация в `AUTH_SETUP.md`
