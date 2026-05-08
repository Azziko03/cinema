# Обновления страницы Сеансы

## Реализованные правки

### ✅ 1. Детальное отображение занятых мест

**Было:** Простой прогресс-бар с общим количеством занятых мест

**Стало:** Детальная статистика с разделением по типам мест:

```
🌟 VIP:      [████████░░] 8/10
👤 Обычн:    [██████░░░░] 15/25
━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Всего:    [███████░░░] 23/35
```

**Особенности:**
- Отдельный прогресс-бар для VIP мест (желтый цвет, иконка звезды)
- Отдельный прогресс-бар для обычных мест (синий цвет, иконка пользователя)
- Итоговый прогресс-бар (красный цвет)
- Числовые показатели рядом с каждым прогресс-баром
- Визуальное разделение между категориями

**Изменения в коде:**
- `app/admin/sessions/page.tsx`: Добавлен подсчет VIP и обычных мест через Prisma
- `app/admin/sessions/SessionsClient.tsx`: Обновлен интерфейс Session с полем seatsInfo
- Добавлена детальная разметка в колонке "Занято мест"

---

### ✅ 2. Защита от изменения при скролле

**Проблема:** При скролле мышью над полем "Базовая цена" значение случайно изменялось

**Решение:** Добавлен обработчик `onWheel` который убирает фокус с поля при попытке скролла

```tsx
<input
  type="number"
  name="basePrice"
  value={formData.basePrice}
  onChange={handleInputChange}
  onWheel={(e) => e.currentTarget.blur()}  // ← Защита от скролла
  className="..."
  required
  min="0"
  step="0.01"
/>
```

**Результат:** Невозможно случайно изменить цену при скролле страницы

---

### ✅ 3. Кнопки изменить и удалить работают как в странице фильмы

**Добавлено:**

#### Редактирование сеанса:
- Кнопка "Изменить" открывает модальное окно
- Форма предзаполняется данными выбранного сеанса
- Можно изменить все параметры (фильм, зал, время, цену, язык, формат)
- Проверка на конфликты расписания при обновлении
- API endpoint: `PUT /api/admin/sessions/{id}`

#### Удаление сеанса:
- Кнопка "Удалить" открывает модальное окно подтверждения
- Показывается название фильма и предупреждение
- Защита от удаления сеансов с проданными билетами
- Информативные сообщения об ошибках

**Новые файлы:**
- `app/api/admin/sessions/[id]/route.ts` - API для редактирования сеанса

**Обновленные состояния в SessionsClient:**
```tsx
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const [selectedSession, setSelectedSession] = useState<Session | null>(null);
```

---

## Технические детали

### Структура данных seatsInfo

```typescript
interface Session {
  // ... другие поля
  seatsInfo: {
    vipSeatsTotal: number;           // Всего VIP мест в зале
    regularSeatsTotal: number;       // Всего обычных мест в зале
    occupiedVipSeats: number;        // Занято VIP мест
    occupiedRegularSeats: number;    // Занято обычных мест
    totalOccupied: number;           // Всего занято мест
  };
}
```

### Запрос к базе данных

```typescript
const sessionsRaw = await prisma.session.findMany({
  include: {
    movie: { include: { mediaFiles: true, translations: true } },
    hall: { include: { seats: true } },  // ← Загружаем все места
    orderItems: { include: { seat: true } },  // ← Загружаем проданные билеты
  },
  orderBy: { startTime: "asc" },
});

// Подсчет статистики
const vipSeatsTotal = s.hall.seats.filter(seat => seat.isVip && seat.isActive).length;
const occupiedVipSeats = s.orderItems.filter(item => item.seat.isVip).length;
```

---

## Результат

Все три правки успешно реализованы:
1. ✅ Детальная статистика по VIP и обычным местам
2. ✅ Защита от случайного изменения цены при скролле
3. ✅ Полнофункциональные кнопки редактирования и удаления

Код успешно скомпилирован и готов к использованию!
