# Исправление ошибки Prisma Client

## Проблема
```
Error submitting rating: TypeError: Cannot read properties of undefined (reading 'upsert')
at POST (app/api/movies/[id]/rating/route.ts:97:30)
```

## Причина
После добавления новой модели `MovieRating` в `schema.prisma` и выполнения миграции, Prisma Client не был обновлен. Поэтому `prisma.movieRating` был `undefined`.

## Решение
Выполнить команду для генерации Prisma Client:

```bash
npx prisma generate
```

## Когда нужно запускать `prisma generate`

1. **После изменения schema.prisma** - добавление/изменение моделей
2. **После миграции** - `npx prisma migrate dev`
3. **После клонирования проекта** - для установки Prisma Client
4. **После обновления Prisma** - для синхронизации версий

## Автоматизация

В некоторых случаях `prisma generate` запускается автоматически:
- При выполнении `npm install` (если настроено в postinstall)
- При выполнении `npx prisma migrate dev`

Но иногда требуется запустить вручную.

## Проверка

После выполнения `npx prisma generate`:
1. ✅ Prisma Client обновлен
2. ✅ Модель `MovieRating` доступна
3. ✅ Методы `prisma.movieRating.*` работают
4. ✅ TypeScript типы обновлены

## Перезапуск сервера

После генерации Prisma Client рекомендуется перезапустить dev сервер:
```bash
npm run dev
```

## Результат
✅ Ошибка исправлена  
✅ API рейтингов работает  
✅ Оценки сохраняются в БД
