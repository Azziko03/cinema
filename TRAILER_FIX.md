# Исправление трейлера и навигации

## Проблемы
1. ❌ При клике на трейлер начиналась загрузка видео
2. ❌ Нет кнопки "Назад" для возврата на главную

## Решения

### 1. Трейлер воспроизводится на месте

**Было:**
```tsx
<iframe src={trailer.url} />
```
Проблема: Если `trailer.url` - это обычная YouTube ссылка (например, `https://www.youtube.com/watch?v=VIDEO_ID`), браузер пытается загрузить страницу YouTube.

**Стало:**
```tsx
<iframe src={getYouTubeEmbedUrl(trailer.url)} />
```

**Функция конвертации:**
```typescript
function getYouTubeEmbedUrl(url: string): string {
  // Если это уже embed URL, возвращаем как есть
  if (url.includes('youtube.com/embed/')) {
    return url
  }
  
  let videoId = ''
  
  // Поддерживаемые форматы:
  // https://www.youtube.com/watch?v=VIDEO_ID
  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('watch?v=')[1]?.split('&')[0] || ''
  }
  // https://youtu.be/VIDEO_ID
  else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || ''
  }
  // https://www.youtube.com/v/VIDEO_ID
  else if (url.includes('youtube.com/v/')) {
    videoId = url.split('youtube.com/v/')[1]?.split('?')[0] || ''
  }
  
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
  }
  
  return url
}
```

**Параметры embed URL:**
- `autoplay=1` - автоматическое воспроизведение при загрузке
- `rel=0` - не показывать похожие видео в конце

### 2. Кнопка "Назад"

#### Mobile версия
```tsx
<div className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm">
  <button onClick={() => router.back()}>
    <svg>← Стрелка назад</svg>
  </button>
  <h1>{title}</h1>
</div>
```

**Особенности:**
- `sticky top-0` - прилипает к верху при скролле
- `z-50` - поверх всех элементов
- `backdrop-blur-sm` - размытие фона
- Круглая кнопка с иконкой стрелки

#### Desktop версия
```tsx
<button onClick={() => router.back()}>
  <svg>←</svg>
  <span>Назад</span>
</button>
```

**Особенности:**
- Текст + иконка
- Hover эффект (серый → белый)
- Расположена перед контентом

### 3. Кнопка закрытия трейлера

Добавлена кнопка "X" для закрытия трейлера:

```tsx
{showTrailer && (
  <button
    onClick={() => setShowTrailer(false)}
    className="absolute top-2 right-2 ..."
  >
    <svg>✕</svg>
  </button>
)}
```

**Расположение:**
- Mobile: `top-2 right-2` (маленькая кнопка)
- Desktop: `top-4 right-4` (большая кнопка)

## Как это работает

### Сценарий использования:

1. **Пользователь видит превью трейлера** (постер + кнопка Play)
2. **Клик на Play** → `setShowTrailer(true)`
3. **Трейлер загружается** через YouTube embed API
4. **Видео воспроизводится на месте** (не переход в YouTube)
5. **Клик на X** → `setShowTrailer(false)` → возврат к превью

### Преимущества:

✅ Нет загрузки файла - используется YouTube embed  
✅ Нет перехода на YouTube - воспроизведение на месте  
✅ Автоматическое воспроизведение при открытии  
✅ Кнопка закрытия для возврата к превью  
✅ Кнопка "Назад" для возврата на главную  

## Поддерживаемые форматы URL

Функция `getYouTubeEmbedUrl` поддерживает:

1. `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
2. `https://youtu.be/dQw4w9WgXcQ`
3. `https://www.youtube.com/v/dQw4w9WgXcQ`
4. `https://www.youtube.com/embed/dQw4w9WgXcQ` (уже embed)

Все конвертируются в:
```
https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0
```

## Навигация

### Mobile
```
┌─────────────────────────────┐
│ [←] Название фильма         │ ← Sticky header
├─────────────────────────────┤
│ Контент...                  │
└─────────────────────────────┘
```

### Desktop
```
[← Назад]
┌─────────────────────────────┐
│ Контент...                  │
└─────────────────────────────┘
```

## Результат

✅ Трейлер воспроизводится на месте (YouTube embed)  
✅ Нет загрузки видео файла  
✅ Кнопка "Назад" на mobile и desktop  
✅ Кнопка закрытия трейлера (X)  
✅ Sticky header на mobile  
✅ Автоматическое воспроизведение
