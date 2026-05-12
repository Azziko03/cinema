# Исправление ошибки гидратации

## Проблема
Ошибка гидратации возникала в компоненте `RatingSection` из-за несоответствия данных между сервером и клиентом.

## Причина
1. Использование `toLocaleString()` для форматирования чисел - дает разные результаты на сервере и клиенте
2. Динамическая загрузка данных рейтинга через API после монтирования компонента

## Решение

### 1. Изменен тип данных `totalReviews`
```typescript
// Было:
const [totalReviews, setTotalReviews] = useState<number>(2400)

// Стало:
const [totalReviews, setTotalReviews] = useState<string>('2.4')
```

### 2. Удалено использование `toLocaleString()`
```typescript
// Было:
<p>({totalReviews.toLocaleString()}k reviews)</p>

// Стало:
<p>({totalReviews}k reviews)</p>
```

### 3. Добавлен `suppressHydrationWarning`
Для элементов, которые обновляются после загрузки данных:
```typescript
<div suppressHydrationWarning>{averageRating.toFixed(1)}</div>
<p suppressHydrationWarning>({totalReviews}k reviews)</p>
```

### 4. Упрощена логика загрузки
```typescript
// Загружаем данные всегда, не только для авторизованных
useEffect(() => {
  fetchUserRating()
}, [movieId])
```

## Результат
- ✅ Ошибка гидратации устранена
- ✅ Сборка проходит успешно
- ✅ Данные корректно отображаются на клиенте
- ✅ Рейтинг загружается динамически для всех пользователей
