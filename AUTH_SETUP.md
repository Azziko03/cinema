# Настройка системы аутентификации

## ✅ Что реализовано

### 1. Регистрация и вход
- ✅ Обычная регистрация с email и паролем
- ✅ Вход с email и паролем
- ✅ Вход через Google OAuth
- ✅ Автоматическое создание пользователя при входе через Google
- ✅ Хеширование паролей с bcrypt
- ✅ Валидация данных с Zod

### 2. Управление сессиями
- ✅ JWT токены для сессий
- ✅ Хранение токенов в cookies
- ✅ Автоматическое обновление сессии
- ✅ Защита роутов с middleware

### 3. UI компоненты
- ✅ Страница входа `/auth/signin`
- ✅ Страница регистрации `/auth/signup`
- ✅ Страница ошибок `/auth/error`
- ✅ Страница профиля `/profile`
- ✅ Компонент UserMenu в Header
- ✅ Адаптивный дизайн

### 4. API endpoints
- ✅ `POST /api/auth/register` - регистрация
- ✅ `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints
- ✅ `GET /api/user` - получение текущего пользователя

### 5. База данных
- ✅ Обновлена схема User для OAuth
- ✅ Добавлены поля: `googleId`, `image`
- ✅ `passwordHash` теперь опциональный (для OAuth пользователей)
- ✅ Миграция применена

## 🔧 Настройка Google OAuth

### Шаг 1: Создание проекта в Google Cloud Console

1. Перейдите на https://console.cloud.google.com/
2. Создайте новый проект или выберите существующий
3. Перейдите в "APIs & Services" > "Credentials"

### Шаг 2: Настройка OAuth consent screen

1. Нажмите "OAuth consent screen"
2. Выберите "External" (для тестирования)
3. Заполните обязательные поля:
   - App name: Cinema
   - User support email: ваш email
   - Developer contact: ваш email
4. Нажмите "Save and Continue"
5. На странице "Scopes" нажмите "Add or Remove Scopes"
6. Выберите:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
7. Нажмите "Save and Continue"
8. Добавьте тестовых пользователей (ваш email)

### Шаг 3: Создание OAuth Client ID

1. Перейдите в "Credentials"
2. Нажмите "Create Credentials" > "OAuth client ID"
3. Выберите "Web application"
4. Заполните:
   - Name: Cinema Web Client
   - Authorized JavaScript origins:
     - `http://localhost:3000`
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
5. Нажмите "Create"
6. Скопируйте Client ID и Client Secret

### Шаг 4: Обновление .env файла

Откройте `.env` и замените значения:

\`\`\`env
# Google OAuth
GOOGLE_CLIENT_ID="ваш-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="ваш-client-secret"

# NextAuth Secret (сгенерируйте новый)
NEXTAUTH_SECRET="ваш-секретный-ключ"
\`\`\`

Для генерации NEXTAUTH_SECRET выполните:
\`\`\`bash
openssl rand -base64 32
\`\`\`

## 🚀 Запуск

1. Убедитесь, что PostgreSQL запущен
2. Примените миграции (уже применено):
   \`\`\`bash
   npm run db:migrate
   \`\`\`

3. Запустите dev сервер:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Откройте http://localhost:3000

## 📝 Использование

### Регистрация
1. Перейдите на `/auth/signup`
2. Заполните форму или нажмите "Зарегистрироваться через Google"
3. После успешной регистрации вы будете автоматически авторизованы

### Вход
1. Перейдите на `/auth/signin`
2. Введите email и пароль или войдите через Google
3. После входа вы будете перенаправлены на главную страницу

### Профиль
1. После авторизации нажмите на аватар в Header
2. Выберите "Профиль"
3. Просмотрите информацию о вашем аккаунте

### Выход
1. Нажмите на аватар в Header
2. Выберите "Выйти"

## 🔒 Защищенные роуты

Следующие роуты требуют авторизации:
- `/profile` - профиль пользователя
- `/settings` - настройки
- `/orders` - заказы
- `/tickets` - билеты
- `/admin/*` - админ панель (только для роли admin)

## 🛠 API для разработчиков

### Получение текущего пользователя (серверный компонент)
\`\`\`typescript
import { getCurrentUser } from "@/lib/session";

const user = await getCurrentUser();
if (user) {
  console.log(user.email, user.role);
}
\`\`\`

### Требование авторизации
\`\`\`typescript
import { requireAuth } from "@/lib/session";

const user = await requireAuth(); // редирект на /auth/signin если не авторизован
\`\`\`

### Требование роли админа
\`\`\`typescript
import { requireAdmin } from "@/lib/session";

const admin = await requireAdmin(); // редирект на / если не админ
\`\`\`

### Использование в клиентских компонентах
\`\`\`typescript
"use client";
import { useSession } from "next-auth/react";

export default function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <div>Загрузка...</div>;
  if (!session) return <div>Не авторизован</div>;
  
  return <div>Привет, {session.user.name}!</div>;
}
\`\`\`

## 📦 Установленные пакеты

- `next-auth@beta` - аутентификация для Next.js 15
- `@auth/prisma-adapter` - адаптер Prisma для NextAuth
- `bcryptjs` - хеширование паролей
- `zod` - валидация данных
- `jose` - работа с JWT

## 🎨 Дизайн

Все страницы аутентификации выполнены в едином стиле:
- Темная тема с градиентами
- Glassmorphism эффекты
- Адаптивный дизайн
- Анимации и transitions
- Иконки от lucide-react

## 🔐 Безопасность

- ✅ Пароли хешируются с bcrypt (10 раундов)
- ✅ JWT токены подписываются секретным ключом
- ✅ CSRF защита встроена в NextAuth
- ✅ Валидация всех входных данных
- ✅ Защита от SQL инъекций (Prisma)
- ✅ Middleware для защиты роутов
- ✅ Проверка статуса пользователя (active/inactive)

## 🐛 Troubleshooting

### Ошибка "OAuthAccountNotLinked"
Это означает, что email уже используется с другим методом входа. Войдите через оригинальный метод.

### Ошибка "Configuration"
Проверьте, что все переменные окружения установлены правильно в `.env`.

### Ошибка "CredentialsSignin"
Неверный email или пароль. Проверьте правильность ввода.

### Google OAuth не работает
1. Проверьте, что Client ID и Secret правильно скопированы
2. Убедитесь, что redirect URI точно совпадает
3. Проверьте, что ваш email добавлен в тестовые пользователи

## 📚 Дополнительные ресурсы

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
