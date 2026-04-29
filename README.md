# 🎬 Cinema - Современный сайт кинотеатра

Полнофункциональный веб-сайт кинотеатра с онлайн-бронированием билетов, мультиязычностью и интеграцией платежной системы Finik.

## ✨ Основные возможности

- 🎥 **Афиша фильмов** - актуальная информация о фильмах с постерами, трейлерами и описаниями
- 📅 **Расписание сеансов** - удобный просмотр расписания по датам и залам
- 🎫 **Онлайн-бронирование** - интерактивная схема зала и выбор мест
- 💳 **Онлайн-оплата** - интеграция с платежной системой Finik
- 📱 **Электронные билеты** - QR-коды для быстрого входа
- 🌐 **Мультиязычность** - поддержка кыргызского, русского и английского языков
- 🤖 **AI-чат** - помощник для пользователей
- 👤 **Личный кабинет** - история заказов и управление профилем
- 🛠️ **Админ-панель** - управление фильмами, расписанием и заказами

## 🚀 Быстрый старт

```bash
# 1. Установите зависимости
npm install

# 2. Настройте .env файл
cp .env.example .env
# Отредактируйте .env с вашими данными

# 3. Создайте базу данных
createdb cinema

# 4. Примените схему и заполните данными
npm run db:push
npm run db:generate
npm run db:seed

# 5. Запустите проект
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

📖 **Подробная инструкция:** [QUICKSTART.md](./QUICKSTART.md)

## 🛠️ Технологии

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** JWT (планируется)
- **Payments:** Finik Payment Gateway
- **Deployment:** Vercel / Custom VPS

## 📁 Структура проекта

```
cinema/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   ├── (auth)/            # Страницы авторизации
│   ├── (main)/            # Основные страницы
│   └── admin/             # Админ-панель
├── components/            # React компоненты
│   ├── ui/               # UI компоненты
│   ├── movies/           # Компоненты фильмов
│   └── booking/          # Компоненты бронирования
├── lib/                   # Утилиты и хелперы
│   ├── prisma.ts         # Prisma Client
│   ├── types.ts          # TypeScript типы
│   └── utils.ts          # Вспомогательные функции
├── prisma/               # Prisma схема и миграции
│   ├── schema.prisma     # Схема БД
│   └── seed.ts           # Начальные данные
├── public/               # Статические файлы
└── styles/               # Глобальные стили
```

## 📊 База данных

Проект использует PostgreSQL с Prisma ORM. Схема включает:

- 👤 Пользователи и авторизация
- 🎬 Фильмы с мультиязычными переводами
- 🎭 Залы и места
- 📅 Сеансы
- 💰 Заказы и платежи
- 🎫 Электронные билеты
- 🤖 AI-чат

**Полная документация:** [DATABASE.md](./DATABASE.md)

## 🔧 Доступные команды

```bash
# Разработка
npm run dev              # Запуск dev сервера
npm run build            # Сборка для продакшена
npm run start            # Запуск продакшен сервера
npm run lint             # Проверка кода

# База данных
npm run db:generate      # Генерация Prisma Client
npm run db:push          # Синхронизация схемы с БД
npm run db:migrate       # Создание миграции
npm run db:studio        # Открыть Prisma Studio
npm run db:seed          # Заполнить БД данными
```

## 📚 Документация

- [QUICKSTART.md](./QUICKSTART.md) - Быстрый старт
- [DATABASE.md](./DATABASE.md) - Документация базы данных
- [ТЗ.md](./ТЗ.md) - Техническое задание
- [prisma/README.md](./prisma/README.md) - Примеры работы с Prisma

## 🔐 Безопасность

- Хеширование паролей с bcrypt
- HTTPS для всех запросов
- Защита от SQL-инъекций (Prisma)
- CSRF и XSS защита
- Валидация всех входных данных
- Безопасное хранение API ключей

## 🌐 API Endpoints (планируется)

```
GET    /api/movies              # Список фильмов
GET    /api/movies/:id          # Детали фильма
GET    /api/sessions            # Расписание сеансов
POST   /api/orders              # Создание заказа
POST   /api/payments            # Инициация платежа
POST   /api/webhooks/finik      # Webhook от Finik
GET    /api/tickets/:id         # Получение билета
POST   /api/tickets/:id/verify  # Проверка билета
```

## 🎨 Дизайн

- Современный минималистичный дизайн
- Темная тема с неоновыми акцентами
- Полностью адаптивная верстка (mobile, tablet, desktop)
- Поддержка Retina дисплеев
- Accessibility (WCAG 2.1)

## 🚧 Roadmap

- [x] Схема базы данных
- [x] Prisma setup
- [ ] API endpoints
- [ ] Аутентификация
- [ ] Страницы фильмов
- [ ] Система бронирования
- [ ] Интеграция Finik
- [ ] Генерация QR-кодов
- [ ] Админ-панель
- [ ] AI-чат
- [ ] PWA
- [ ] Тесты

## 👥 Команда

Разработано для кинотеатра «Cinema»

## 📄 Лицензия

Proprietary - Все права защищены

## 🤝 Поддержка

Для вопросов и поддержки:
- Email: support@cinema.kg
- Telegram: @cinema_support

---

**Сделано с ❤️ для любителей кино**
