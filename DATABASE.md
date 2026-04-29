# 📊 Документация базы данных Cinema

## Обзор

База данных спроектирована для полнофункционального сайта кинотеатра с поддержкой:
- Мультиязычности (KG, RU, EN)
- Онлайн-бронирования и оплаты
- Электронных билетов с QR-кодами
- AI-чата для поддержки
- Административной панели

## Технологии

- **СУБД**: PostgreSQL
- **ORM**: Prisma
- **Язык**: TypeScript
- **Framework**: Next.js

---

## 📋 Структура таблиц

### 👤 USERS & AUTH

#### users
Основная таблица пользователей системы.

**Поля:**
- `id` (UUID, PK) - уникальный идентификатор
- `email` (VARCHAR, UNIQUE) - email для входа
- `password_hash` (TEXT) - хеш пароля (bcrypt)
- `full_name` (VARCHAR) - полное имя
- `role` (ENUM) - роль: admin, user, controller
- `status` (ENUM) - статус: active, inactive
- `created_at`, `updated_at` (TIMESTAMP) - временные метки

**Связи:**
- `orders` → Order[] (один ко многим)
- `aiChats` → AiChat[] (один ко многим)

---

### 🎬 MOVIES

#### movies
Основная информация о фильмах.

**Поля:**
- `id` (UUID, PK)
- `duration_minutes` (INT) - длительность в минутах
- `age_rating` (VARCHAR) - возрастной рейтинг (0+, 6+, 12+, 16+, 18+)
- `release_date` (DATE) - дата выхода
- `status` (ENUM) - now_showing, coming_soon, archived
- `created_at`, `updated_at` (TIMESTAMP)

**Связи:**
- `translations` → MovieTranslation[] (один ко многим)
- `metadata` → MovieMetadata (один к одному)
- `genres` → MovieGenre[] (многие ко многим через связующую таблицу)
- `persons` → MoviePerson[] (многие ко многим)
- `mediaFiles` → MediaFile[] (один ко многим)
- `sessions` → Session[] (один ко многим)

#### movie_translations
Переводы названий и описаний фильмов.

**Поля:**
- `id` (UUID, PK)
- `movie_id` (UUID, FK → movies)
- `language` (ENUM) - KG, RU, EN
- `title` (VARCHAR) - название фильма
- `description` (TEXT) - описание

**Уникальный индекс:** (movie_id, language)

#### movie_metadata
Дополнительные метаданные о фильме.

**Поля:**
- `id` (UUID, PK)
- `movie_id` (UUID, FK → movies, UNIQUE)
- `country` (VARCHAR) - страна производства
- `year` (INT) - год выпуска
- `imdb_rating` (DECIMAL 3,1) - рейтинг IMDb
- `kinopoisk_rating` (DECIMAL 3,1) - рейтинг Кинопоиск

#### genres
Справочник жанров.

**Поля:**
- `id` (UUID, PK)
- `slug` (VARCHAR, UNIQUE) - URL-friendly идентификатор

**Связи:**
- `translations` → GenreTranslation[]
- `movies` → MovieGenre[]

#### genre_translations
Переводы названий жанров.

**Поля:**
- `id` (UUID, PK)
- `genre_id` (UUID, FK → genres)
- `language` (ENUM) - KG, RU, EN
- `title` (VARCHAR) - название жанра

**Уникальный индекс:** (genre_id, language)

#### movie_genres
Связующая таблица фильмов и жанров (многие ко многим).

**Поля:**
- `movie_id` (UUID, FK → movies)
- `genre_id` (UUID, FK → genres)

**Составной PK:** (movie_id, genre_id)

#### persons
Актеры и режиссеры.

**Поля:**
- `id` (UUID, PK)
- `name` (VARCHAR) - имя
- `type` (ENUM) - actor, director

**Связи:**
- `movies` → MoviePerson[]

#### movie_persons
Связь фильмов с актерами/режиссерами.

**Поля:**
- `movie_id` (UUID, FK → movies)
- `person_id` (UUID, FK → persons)
- `role_name` (VARCHAR, nullable) - название роли (для актеров)

**Составной PK:** (movie_id, person_id)

#### media_files
Медиафайлы фильмов (постеры, трейлеры, галерея).

**Поля:**
- `id` (UUID, PK)
- `movie_id` (UUID, FK → movies)
- `type` (ENUM) - poster, trailer, gallery
- `url` (TEXT) - ссылка на файл

---

### 🎭 CINEMA

#### halls
Залы кинотеатра.

**Поля:**
- `id` (UUID, PK)
- `name` (VARCHAR) - название зала
- `description` (TEXT, nullable) - описание
- `total_seats` (INT) - общее количество мест

**Связи:**
- `seats` → Seat[]
- `sessions` → Session[]

#### seats
Места в залах.

**Поля:**
- `id` (UUID, PK)
- `hall_id` (UUID, FK → halls)
- `row_number` (INT) - номер ряда
- `seat_number` (INT) - номер места
- `is_active` (BOOLEAN) - активно ли место

**Уникальный индекс:** (hall_id, row_number, seat_number)

**Связи:**
- `hall` → Hall
- `orderItems` → OrderItem[]

#### sessions
Сеансы фильмов.

**Поля:**
- `id` (UUID, PK)
- `movie_id` (UUID, FK → movies)
- `hall_id` (UUID, FK → halls)
- `start_time` (TIMESTAMP) - время начала
- `end_time` (TIMESTAMP) - время окончания
- `base_price` (DECIMAL 10,2) - базовая цена билета
- `language` (ENUM) - original, dubbed
- `format` (ENUM) - 2D, 3D, IMAX

**Связи:**
- `movie` → Movie
- `hall` → Hall
- `orderItems` → OrderItem[]

---

### 💰 ORDERS & PAYMENTS

#### orders
Заказы билетов.

**Поля:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → users)
- `status` (ENUM) - paid, cancelled, expired
- `total_amount` (DECIMAL 10,2) - общая сумма
- `payment_status` (ENUM) - success, failed
- `created_at` (TIMESTAMP) - время создания
- `expires_at` (TIMESTAMP) - время истечения брони

**Связи:**
- `user` → User
- `items` → OrderItem[]
- `payments` → Payment[]

#### order_items
Позиции заказа (отдельные билеты).

**Поля:**
- `id` (UUID, PK)
- `order_id` (UUID, FK → orders)
- `session_id` (UUID, FK → sessions)
- `seat_id` (UUID, FK → seats)
- `price` (DECIMAL 10,2) - цена билета

**Связи:**
- `order` → Order
- `session` → Session
- `seat` → Seat
- `ticket` → Ticket (один к одному)

#### payments
Платежи через платежные системы (Finik).

**Поля:**
- `id` (UUID, PK)
- `order_id` (UUID, FK → orders)
- `provider` (VARCHAR) - название провайдера (finik)
- `external_payment_id` (VARCHAR) - ID платежа у провайдера
- `amount` (DECIMAL 10,2) - сумма платежа
- `status` (ENUM) - success, failed
- `created_at`, `updated_at` (TIMESTAMP)

**Связи:**
- `order` → Order

#### tickets
Электронные билеты с QR-кодами.

**Поля:**
- `id` (UUID, PK)
- `order_item_id` (UUID, FK → order_items, UNIQUE)
- `qr_code` (TEXT, UNIQUE) - QR-код билета
- `is_used` (BOOLEAN) - использован ли билет
- `used_at` (TIMESTAMP, nullable) - время использования

**Связи:**
- `orderItem` → OrderItem

---

### ⚙️ SYSTEM

#### settings
Настройки системы (ключ-значение).

**Поля:**
- `id` (UUID, PK)
- `key` (VARCHAR, UNIQUE) - ключ настройки
- `value` (TEXT) - значение

**Примеры настроек:**
- `site_name` - название сайта
- `booking_timeout_minutes` - время резервации билетов
- `max_tickets_per_order` - максимум билетов в заказе

---

### 🤖 AI CHAT

#### ai_chats
Чаты с AI-ассистентом.

**Поля:**
- `id` (UUID, PK)
- `name` (VARCHAR) - название чата
- `user_id` (UUID, FK → users, nullable) - пользователь (null для анонимных)
- `created_at` (TIMESTAMP)

**Связи:**
- `user` → User (nullable)
- `messages` → AiMessage[]

#### ai_messages
Сообщения в чатах.

**Поля:**
- `id` (UUID, PK)
- `chat_id` (UUID, FK → ai_chats)
- `sender` (ENUM) - user, ai
- `message` (TEXT) - текст сообщения
- `created_at` (TIMESTAMP)

**Связи:**
- `chat` → AiChat

---

## 🔐 Безопасность

### Хеширование паролей
Пароли хешируются с использованием **bcrypt** с cost factor 10.

### Cascade Delete
Настроены каскадные удаления для поддержания целостности данных:
- При удалении фильма удаляются все связанные переводы, метаданные, связи с жанрами и персонами
- При удалении заказа удаляются все позиции заказа и билеты
- При удалении зала удаляются все места

### Set Null
При удалении пользователя его чаты сохраняются, но `user_id` устанавливается в NULL.

---

## 📊 Индексы

Автоматически создаются индексы для:
- Всех первичных ключей (PK)
- Всех внешних ключей (FK)
- Уникальных полей (email, slug, qr_code)
- Составных уникальных ключей (movie_id + language)

Рекомендуется добавить дополнительные индексы для:
- `sessions.start_time` - для быстрого поиска по расписанию
- `orders.created_at` - для сортировки заказов
- `movies.status` - для фильтрации по статусу

---

## 🚀 Производительность

### Рекомендации по запросам

1. **Используйте include с осторожностью**
   ```typescript
   // ❌ Плохо - загружает все связи
   const movie = await prisma.movie.findUnique({
     where: { id },
     include: { translations: true, metadata: true, genres: true, ... }
   })
   
   // ✅ Хорошо - загружает только нужное
   const movie = await prisma.movie.findUnique({
     where: { id },
     include: {
       translations: { where: { language: 'RU' } },
       metadata: true
     }
   })
   ```

2. **Используйте select для оптимизации**
   ```typescript
   // Загружаем только нужные поля
   const movies = await prisma.movie.findMany({
     select: {
       id: true,
       translations: {
         where: { language: 'RU' },
         select: { title: true }
       }
     }
   })
   ```

3. **Пагинация для больших списков**
   ```typescript
   const movies = await prisma.movie.findMany({
     take: 20,
     skip: page * 20,
     orderBy: { releaseDate: 'desc' }
   })
   ```

---

## 🔄 Миграции

### Workflow разработки

1. Изменяете `schema.prisma`
2. Создаете миграцию: `npm run db:migrate`
3. Prisma автоматически применяет миграцию и генерирует клиент

### Workflow продакшена

1. Коммитите миграции в Git
2. На сервере: `npx prisma migrate deploy`
3. Генерируете клиент: `npx prisma generate`

---

## 📝 Примеры запросов

См. файл `prisma/README.md` для подробных примеров использования.

---

## 🔗 Связи

### Типы связей в схеме

- **Один к одному**: Movie ↔ MovieMetadata
- **Один ко многим**: Movie → MovieTranslation, User → Order
- **Многие ко многим**: Movie ↔ Genre (через MovieGenre)

### Диаграмма основных связей

```
User
  ├─→ Order
  │     ├─→ OrderItem
  │     │     ├─→ Session
  │     │     │     ├─→ Movie
  │     │     │     └─→ Hall
  │     │     ├─→ Seat
  │     │     └─→ Ticket
  │     └─→ Payment
  └─→ AiChat
        └─→ AiMessage

Movie
  ├─→ MovieTranslation
  ├─→ MovieMetadata
  ├─→ MovieGenre → Genre
  ├─→ MoviePerson → Person
  ├─→ MediaFile
  └─→ Session
```

---

## 📚 Дополнительные ресурсы

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)
- [Database Design Patterns](https://www.postgresql.org/docs/current/ddl.html)
