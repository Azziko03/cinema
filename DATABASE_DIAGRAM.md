# 📊 Диаграмма базы данных Cinema

## Визуальная структура

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CINEMA DATABASE SCHEMA                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                              👤 USERS & AUTH                                  │
└──────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────┐
    │      users          │
    ├─────────────────────┤
    │ • id (PK)           │
    │ • email (UNIQUE)    │
    │ • password_hash     │
    │ • full_name         │
    │ • role              │
    │ • status            │
    │ • created_at        │
    │ • updated_at        │
    └─────────────────────┘
            │
            │ 1:N
            ├──────────────────────────┐
            │                          │
            ▼                          ▼
    ┌─────────────┐            ┌─────────────┐
    │   orders    │            │  ai_chats   │
    └─────────────┘            └─────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                              🎬 MOVIES                                        │
└──────────────────────────────────────────────────────────────────────────────┘

                        ┌─────────────────────┐
                        │      movies         │
                        ├─────────────────────┤
                        │ • id (PK)           │
                        │ • duration_minutes  │
                        │ • age_rating        │
                        │ • release_date      │
                        │ • status            │
                        │ • created_at        │
                        │ • updated_at        │
                        └─────────────────────┘
                                 │
                ┌────────────────┼────────────────┬──────────────┐
                │                │                │              │
                │ 1:N            │ 1:1            │ 1:N          │ 1:N
                ▼                ▼                ▼              ▼
    ┌──────────────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────┐
    │movie_translations│  │movie_metadata│  │media_files│ │ sessions │
    ├──────────────────┤  ├──────────────┤  ├──────────┤  └──────────┘
    │• id (PK)         │  │• id (PK)     │  │• id (PK) │
    │• movie_id (FK)   │  │• movie_id(FK)│  │• movie_id│
    │• language        │  │• country     │  │• type    │
    │• title           │  │• year        │  │• url     │
    │• description     │  │• imdb_rating │  └──────────┘
    └──────────────────┘  │• kp_rating   │
                          └──────────────┘

                        ┌─────────────────────┐
                        │   movie_genres      │  (Many-to-Many)
                        ├─────────────────────┤
                        │ • movie_id (FK, PK) │
                        │ • genre_id (FK, PK) │
                        └─────────────────────┘
                                 │
                                 │ N:1
                                 ▼
                        ┌─────────────────────┐
                        │      genres         │
                        ├─────────────────────┤
                        │ • id (PK)           │
                        │ • slug (UNIQUE)     │
                        └─────────────────────┘
                                 │
                                 │ 1:N
                                 ▼
                        ┌─────────────────────┐
                        │ genre_translations  │
                        ├─────────────────────┤
                        │ • id (PK)           │
                        │ • genre_id (FK)     │
                        │ • language          │
                        │ • title             │
                        └─────────────────────┘

                        ┌─────────────────────┐
                        │   movie_persons     │  (Many-to-Many)
                        ├─────────────────────┤
                        │ • movie_id (FK, PK) │
                        │ • person_id (FK,PK) │
                        │ • role_name         │
                        └─────────────────────┘
                                 │
                                 │ N:1
                                 ▼
                        ┌─────────────────────┐
                        │      persons        │
                        ├─────────────────────┤
                        │ • id (PK)           │
                        │ • name              │
                        │ • type              │
                        └─────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                              🎭 CINEMA                                        │
└──────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────┐
    │       halls         │
    ├─────────────────────┤
    │ • id (PK)           │
    │ • name              │
    │ • description       │
    │ • total_seats       │
    └─────────────────────┘
            │
            │ 1:N
            ├──────────────────────────┐
            │                          │
            ▼                          ▼
    ┌─────────────┐            ┌─────────────┐
    │    seats    │            │  sessions   │
    ├─────────────┤            ├─────────────┤
    │• id (PK)    │            │• id (PK)    │
    │• hall_id(FK)│            │• movie_id   │
    │• row_number │            │• hall_id(FK)│
    │• seat_number│            │• start_time │
    │• is_active  │            │• end_time   │
    └─────────────┘            │• base_price │
                               │• language   │
                               │• format     │
                               └─────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                          💰 ORDERS & PAYMENTS                                 │
└──────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────┐
    │      orders         │
    ├─────────────────────┤
    │ • id (PK)           │
    │ • user_id (FK)      │
    │ • status            │
    │ • total_amount      │
    │ • payment_status    │
    │ • created_at        │
    │ • expires_at        │
    └─────────────────────┘
            │
            │ 1:N
            ├──────────────────────────┐
            │                          │
            ▼                          ▼
    ┌─────────────┐            ┌─────────────┐
    │order_items  │            │  payments   │
    ├─────────────┤            ├─────────────┤
    │• id (PK)    │            │• id (PK)    │
    │• order_id   │            │• order_id   │
    │• session_id │            │• provider   │
    │• seat_id    │            │• ext_pay_id │
    │• price      │            │• amount     │
    └─────────────┘            │• status     │
            │                  │• created_at │
            │ 1:1              │• updated_at │
            ▼                  └─────────────┘
    ┌─────────────┐
    │   tickets   │
    ├─────────────┤
    │• id (PK)    │
    │• order_item │
    │• qr_code    │
    │• is_used    │
    │• used_at    │
    └─────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                          🤖 AI CHAT                                           │
└──────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────┐
    │      ai_chats       │
    ├─────────────────────┤
    │ • id (PK)           │
    │ • name              │
    │ • user_id (FK)      │
    │ • created_at        │
    └─────────────────────┘
            │
            │ 1:N
            ▼
    ┌─────────────────────┐
    │    ai_messages      │
    ├─────────────────────┤
    │ • id (PK)           │
    │ • chat_id (FK)      │
    │ • sender            │
    │ • message           │
    │ • created_at        │
    └─────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                          ⚙️ SYSTEM                                            │
└──────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────┐
    │      settings       │
    ├─────────────────────┤
    │ • id (PK)           │
    │ • key (UNIQUE)      │
    │ • value             │
    └─────────────────────┘
```

## Основные связи

### 1. User → Orders → OrderItems → Tickets
Пользователь создает заказы, каждый заказ содержит позиции (билеты), для каждой позиции генерируется электронный билет с QR-кодом.

### 2. Movie → Sessions → OrderItems
Фильм имеет множество сеансов, на каждый сеанс можно забронировать места через позиции заказа.

### 3. Hall → Seats & Sessions
Зал содержит места и в нем проходят сеансы.

### 4. Movie ↔ Genres (Many-to-Many)
Фильм может иметь несколько жанров, жанр может быть у нескольких фильмов.

### 5. Movie ↔ Persons (Many-to-Many)
Фильм может иметь несколько актеров/режиссеров, персона может участвовать в нескольких фильмах.

## Ключевые особенности

### 🌐 Мультиязычность
- `movie_translations` - переводы фильмов (KG, RU, EN)
- `genre_translations` - переводы жанров (KG, RU, EN)

### 🔐 Безопасность
- Пароли хешируются с bcrypt
- UUID для всех ID
- Каскадные удаления для целостности данных

### 📊 Оптимизация
- Индексы на всех FK
- Уникальные индексы (email, qr_code, slug)
- Составные индексы для мультиязычности

### 🎫 Бронирование
- Проверка доступности мест через `order_items`
- Время истечения брони (`expires_at`)
- Статусы заказов (paid, cancelled, expired)

### 💳 Платежи
- Интеграция с Finik через `payments`
- Отслеживание статуса платежа
- Webhook для обновления статуса

## Типы данных

### Enums

```typescript
// User
UserRole: admin | user | controller
UserStatus: active | inactive

// Movie
MovieStatus: now_showing | coming_soon | archived
Language: KG | RU | EN

// Media
MediaType: poster | trailer | gallery
PersonType: actor | director

// Session
SessionLanguage: original | dubbed
SessionFormat: 2D | 3D | IMAX

// Order
OrderStatus: paid | cancelled | expired
PaymentStatus: success | failed

// Chat
MessageSender: user | ai
```

## Индексы

### Автоматические
- Все Primary Keys (PK)
- Все Foreign Keys (FK)
- Все UNIQUE поля

### Рекомендуемые дополнительные
```sql
CREATE INDEX idx_sessions_start_time ON sessions(start_time);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_movies_status ON movies(status);
CREATE INDEX idx_movie_translations_language ON movie_translations(language);
```

## Размеры таблиц (примерная оценка)

| Таблица | Строк | Размер |
|---------|-------|--------|
| users | 10,000 | ~2 MB |
| movies | 500 | ~100 KB |
| movie_translations | 1,500 | ~500 KB |
| sessions | 5,000 | ~1 MB |
| orders | 50,000 | ~10 MB |
| order_items | 100,000 | ~20 MB |
| tickets | 100,000 | ~25 MB |
| seats | 500 | ~50 KB |

**Общий размер БД:** ~60-80 MB (без медиафайлов)

## Backup стратегия

### Ежедневный backup
```bash
pg_dump cinema > backup_$(date +%Y%m%d).sql
```

### Восстановление
```bash
psql cinema < backup_20260424.sql
```

## Миграции

### Создание миграции
```bash
npx prisma migrate dev --name add_feature_name
```

### Применение в продакшене
```bash
npx prisma migrate deploy
```

## Мониторинг

### Полезные запросы

```sql
-- Размер таблиц
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Активные подключения
SELECT count(*) FROM pg_stat_activity;

-- Медленные запросы
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```
