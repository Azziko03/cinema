# 🚀 Быстрый старт - Cinema Project

## Шаг 1: Установка зависимостей

```bash
npm install
```

## Шаг 2: Настройка базы данных

### 2.1 Создайте PostgreSQL базу данных

```bash
# Через psql
psql -U postgres
CREATE DATABASE cinema;
\q

# Или через createdb
createdb cinema
```

### 2.2 Настройте переменные окружения

```bash
# Скопируйте пример
cp .env.example .env

# Отредактируйте .env и укажите ваши данные
nano .env
```

Пример `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/cinema?schema=public"
FINIK_API_KEY="your_api_key"
FINIK_SECRET_KEY="your_secret_key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Шаг 3: Инициализация базы данных

```bash
# Применить схему к базе данных
npm run db:push

# Сгенерировать Prisma Client
npm run db:generate

# Заполнить начальными данными
npm run db:seed
```

## Шаг 4: Запуск проекта

```bash
# Режим разработки
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## 🎉 Готово!

### Тестовые данные после seed:

**Администратор:**
- Email: `admin@cinema.kg`
- Пароль: `admin123`

**Созданы:**
- 8 жанров с переводами (KG, RU, EN)
- 3 зала с местами
- Системные настройки

---

## 📊 Полезные команды

```bash
# Открыть Prisma Studio (GUI для БД)
npm run db:studio

# Создать новую миграцию
npm run db:migrate

# Пересоздать БД (ОСТОРОЖНО!)
npx prisma migrate reset
```

---

## 📚 Документация

- [DATABASE.md](./DATABASE.md) - полная документация по БД
- [prisma/README.md](./prisma/README.md) - примеры использования Prisma
- [ТЗ.md](./ТЗ.md) - техническое задание проекта

---

## 🛠️ Структура проекта

```
cinema/
├── app/                    # Next.js App Router
│   ├── layout.tsx
│   └── page.tsx
├── lib/                    # Утилиты и хелперы
│   ├── prisma.ts          # Prisma Client
│   └── types.ts           # TypeScript типы
├── prisma/                # Prisma схема и миграции
│   ├── schema.prisma      # Схема БД
│   ├── seed.ts            # Начальные данные
│   └── README.md          # Документация Prisma
├── public/                # Статические файлы
├── .env                   # Переменные окружения (не в Git)
├── .env.example           # Пример переменных
├── DATABASE.md            # Документация БД
└── package.json           # Зависимости
```

---

## ❓ Возможные проблемы

### Ошибка подключения к PostgreSQL

```bash
# Проверьте, запущен ли PostgreSQL
pg_isready

# Запустите PostgreSQL (macOS)
brew services start postgresql@14

# Запустите PostgreSQL (Linux)
sudo systemctl start postgresql
```

### Ошибка "relation does not exist"

```bash
# Пересоздайте схему
npm run db:push
```

### Prisma Client не найден

```bash
# Сгенерируйте клиент заново
npm run db:generate
```

---

## 🔗 Следующие шаги

1. Изучите [DATABASE.md](./DATABASE.md) для понимания структуры БД
2. Посмотрите примеры в [prisma/README.md](./prisma/README.md)
3. Начните разработку API endpoints в `app/api/`
4. Создайте компоненты для отображения фильмов
5. Реализуйте систему бронирования билетов

---

## 💡 Полезные ссылки

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
