# Компоненты Cinema

## Структура

### Header
Верхний хедер с:
- Логотипом Cinema
- Переключателем языка (RU/KG/EN)
- Переключателем темы (светлая/темная)
- Кнопкой профиля

### Carousel
Карусель с автопрокруткой:
- 3 слайда с промо-контентом
- Автоматическая смена каждые 5 секунд
- Навигация стрелками
- Индикаторы слайдов

### SessionFilter
Фильтр сеансов:
- Кнопки "Сегодня" / "Завтра"
- Поиск по названию фильма
- Кнопка дополнительных фильтров

### MovieCard
Карточка фильма:
- Постер (placeholder)
- Название и жанр
- Рейтинг со звездой
- Цена билета
- Время сеансов (кликабельные кнопки)
- Кнопка "Купить билет"

### BottomNav
Нижняя навигация с 5 разделами:
1. Фильмы (Film icon)
2. Мои билеты (Ticket icon)
3. AI (Bot icon)
4. Настройки (Settings icon)
5. Профиль (User icon)

## Использование

```tsx
import Header from '@/components/Header'
import Carousel from '@/components/Carousel'
import SessionFilter from '@/components/SessionFilter'
import MovieCard from '@/components/MovieCard'
import BottomNav from '@/components/BottomNav'

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <Carousel />
        <SessionFilter />
        <MovieCard
          title="Название фильма"
          genre="Жанр"
          rating={8.5}
          price={350}
          times={['10:00', '13:00', '16:00']}
        />
      </main>
      <BottomNav />
    </>
  )
}
```

## Стилизация

Все компоненты используют:
- Tailwind CSS для стилей
- Lucide React для иконок
- Градиенты purple-to-cyan для акцентов
- Поддержка темной темы через `dark:` классы
- Плавные переходы и анимации
