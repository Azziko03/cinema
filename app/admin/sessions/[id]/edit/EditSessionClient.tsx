"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastContainer";
import Link from "next/link";
import { ChevronDown, ChevronUp, Check, X, Plus, Trash2 } from "lucide-react";

interface Movie {
  id: string;
  durationMinutes: number;
  ageRating: string;
  releaseDate: Date;
  status: string;
  translations: Array<{
    language: string;
    title: string;
    description: string;
  }>;
  mediaFiles: Array<{
    type: string;
    url: string;
  }>;
}

interface Hall {
  id: string;
  name: string;
  totalSeats: number;
  seats: Array<{ id: string }>;
}

interface Session {
  id: string;
  movieId: string;
  hallId: string;
  startTime: Date;
  endTime: Date;
  basePrice: number;
  vipPrice?: number | null;
  language: string;
  format: string;
  movie: Movie;
  hall: Hall;
}

interface ExistingSession {
  id: string;
  startTime: string;
  endTime: string;
  movieTitle: string;
  hallName: string;
}

interface TimeSlot {
  id: string;
  from: string;
  to: string;
  sessionId?: string; // ID существующего сеанса, если это редактирование
}

interface EditSessionClientProps {
  session: Session;
  movies: Movie[];
  halls: Hall[];
}

export default function EditSessionClient({
  session,
  movies,
  halls,
}: EditSessionClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const BREAK_TIME_MINUTES = 20;

  // Основные данные
  const [selectedMovieId, setSelectedMovieId] = useState(session.movieId);
  const [selectedHallId, setSelectedHallId] = useState(session.hallId);
  const startDate = new Date(session.startTime);
  const [selectedDate] = useState(startDate.toISOString().split("T")[0]);
  
  // Временные слоты
  const initialTime = startDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endDate = new Date(session.endTime);
  // Добавляем 20 минут перерыва к отображаемому времени окончания
  const endDateWithBreak = new Date(endDate.getTime() + 20 * 60 * 1000);
  const initialEndTime = endDateWithBreak.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    {
      id: crypto.randomUUID(),
      from: initialTime,
      to: initialEndTime,
      sessionId: session.id,
    },
  ]);
  
  // Дополнительные параметры
  const [basePrice, setBasePrice] = useState(String(session.basePrice));
  const [vipPrice, setVipPrice] = useState(
    session.vipPrice ? String(session.vipPrice) : ""
  );
  const [language, setLanguage] = useState(session.language);
  const [format, setFormat] = useState(session.format);
  
  // Существующие сеансы в этом зале на эту дату
  const [existingSessions, setExistingSessions] = useState<ExistingSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  
  // UI состояния
  const [isMovieDropdownOpen, setIsMovieDropdownOpen] = useState(false);
  const [isHallDropdownOpen, setIsHallDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedMovie = movies.find((m) => m.id === selectedMovieId);
  const selectedHall = halls.find((h) => h.id === selectedHallId);
  const hasVipSeats = selectedHall ? selectedHall.seats.length > 0 : false;

  // Пересчитываем время окончания при изменении фильма
  useEffect(() => {
    if (selectedMovie && timeSlots.length > 0) {
      setTimeSlots(timeSlots.map(slot => {
        if (slot.from) {
          const parts = slot.from.split(':');
          if (parts.length === 2 && parts[0] && parts[1]) {
            const hours = parseInt(parts[0]);
            const minutes = parseInt(parts[1]);
            if (!isNaN(hours) && !isNaN(minutes)) {
              const startMinutes = hours * 60 + minutes;
              const endMinutes = startMinutes + selectedMovie.durationMinutes + BREAK_TIME_MINUTES;
              const endHours = Math.floor(endMinutes / 60) % 24;
              const endMins = endMinutes % 60;
              const calculatedTimeTo = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
              return { ...slot, to: calculatedTimeTo };
            }
          }
        }
        return slot;
      }));
    }
  }, [selectedMovieId]);

  // Загрузка существующих сеансов
  useEffect(() => {
    loadExistingSessions();
  }, [selectedHallId, selectedDate]);

  const loadExistingSessions = async () => {
    if (!selectedHallId || !selectedDate) return;
    
    setIsLoadingSessions(true);
    try {
      const response = await fetch('/api/admin/sessions/by-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          date: selectedDate, 
          hallIds: [selectedHallId] 
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Исключаем текущий редактируемый сеанс
        const filtered = (data.sessions || []).filter(
          (s: any) => s.id !== session.id
        );
        setExistingSessions(filtered);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Добавить временной слот
  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { id: crypto.randomUUID(), from: '', to: '' }]);
  };

  // Удалить временной слот
  const removeTimeSlot = (slotId: string) => {
    if (timeSlots.length === 1) {
      showToast("Должен быть хотя бы один временной слот", "warning");
      return;
    }
    setTimeSlots(timeSlots.filter(slot => slot.id !== slotId));
  };

  // Обновить временной слот
  const updateTimeSlot = (slotId: string, field: 'from' | 'to', value: string) => {
    setTimeSlots(timeSlots.map(slot => {
      if (slot.id === slotId && field === 'from') {
        // Автоматически вычисляем время окончания (длительность фильма + 20 минут перерыва)
        let calculatedTimeTo = slot.to;
        if (selectedMovie && value && value.includes(':')) {
          const parts = value.split(':');
          if (parts.length === 2 && parts[0] && parts[1]) {
            const hours = parseInt(parts[0]);
            const minutes = parseInt(parts[1]);
            if (!isNaN(hours) && !isNaN(minutes)) {
              const startMinutes = hours * 60 + minutes;
              const endMinutes = startMinutes + selectedMovie.durationMinutes + BREAK_TIME_MINUTES;
              const endHours = Math.floor(endMinutes / 60) % 24;
              const endMins = endMinutes % 60;
              calculatedTimeTo = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
            }
          }
        }
        return { ...slot, from: value, to: calculatedTimeTo };
      }
      return slot.id === slotId ? { ...slot, [field]: value } : slot;
    }));
  };

  // Проверка доступности времени
  const isTimeSlotAvailable = (startTime: string, currentSlotId?: string): boolean => {
    if (!selectedMovie || !startTime) return true;
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + selectedMovie.durationMinutes;
    
    // Проверяем конфликты с существующими сеансами
    for (const session of existingSessions) {
      const sessionStart = new Date(session.startTime);
      const sessionEnd = new Date(session.endTime);
      
      const sessionStartMinutes = sessionStart.getHours() * 60 + sessionStart.getMinutes();
      const sessionEndMinutes = sessionEnd.getHours() * 60 + sessionEnd.getMinutes();
      const sessionEndWithBreak = sessionEndMinutes + BREAK_TIME_MINUTES;
      
      if (
        (startMinutes >= sessionStartMinutes && startMinutes < sessionEndWithBreak) ||
        (endMinutes > sessionStartMinutes && endMinutes <= sessionEndWithBreak) ||
        (startMinutes <= sessionStartMinutes && endMinutes >= sessionEndWithBreak)
      ) {
        return false;
      }
    }
    
    // Проверяем конфликты с другими слотами
    for (const slot of timeSlots) {
      if (currentSlotId && slot.id === currentSlotId) continue;
      if (!slot.from) continue;
      
      const [slotHours, slotMinutes] = slot.from.split(':').map(Number);
      const slotStartMinutes = slotHours * 60 + slotMinutes;
      const slotEndMinutes = slotStartMinutes + selectedMovie.durationMinutes;
      const slotEndWithBreak = slotEndMinutes + BREAK_TIME_MINUTES;
      
      if (
        (startMinutes >= slotStartMinutes && startMinutes < slotEndWithBreak) ||
        (endMinutes > slotStartMinutes && endMinutes <= slotEndWithBreak) ||
        (startMinutes <= slotStartMinutes && endMinutes >= slotEndWithBreak)
      ) {
        return false;
      }
    }
    
    return true;
  };

  // Получение постера фильма
  const getPosterUrl = (movie: Movie) => {
    const poster = movie.mediaFiles.find((m) => m.type === "poster");
    return poster?.url || "/placeholder.svg";
  };

  // Получение названия фильма
  const getTitle = (movie: Movie, lang: string = "RU") => {
    const translation = movie.translations.find((t) => t.language === lang);
    return translation?.title || "Без названия";
  };

  // Получение бейджа статуса
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "now_showing":
        return (
          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
            В прокате
          </span>
        );
      case "coming_soon":
        return (
          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">
            Скоро
          </span>
        );
      case "archived":
        return (
          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400">
            Архив
          </span>
        );
      default:
        return null;
    }
  };

  // Обработчик отправки формы
  const handleSubmit = async () => {
    // Валидация
    if (!selectedMovieId) {
      showToast("Выберите фильм", "warning");
      return;
    }

    if (!selectedHallId) {
      showToast("Выберите зал", "warning");
      return;
    }

    if (!selectedDate) {
      showToast("Укажите дату", "warning");
      return;
    }

    // Проверяем все временные слоты
    for (const slot of timeSlots) {
      if (!slot.from || !slot.to) {
        showToast("Укажите время для всех слотов", "warning");
        return;
      }
      
      if (!isTimeSlotAvailable(slot.from, slot.id)) {
        showToast(`Время ${slot.from} недоступно`, "error");
        return;
      }
    }

    if (!basePrice) {
      showToast("Укажите базовую цену", "warning");
      return;
    }

    if (hasVipSeats && !vipPrice) {
      showToast("Укажите VIP цену", "warning");
      return;
    }

    setIsSubmitting(true);

    try {
      const promises: Promise<Response>[] = [];
      
      // Обрабатываем каждый временной слот
      for (const slot of timeSlots) {
        const [hours, minutes] = slot.from.split(':').map(Number);
        const startTime = new Date(selectedDate);
        startTime.setHours(hours, minutes, 0, 0);
        
        // Время окончания = время начала + длительность фильма (БЕЗ перерыва, перерыв добавляется на бэкенде для проверки конфликтов)
        const movieDuration = selectedMovie?.durationMinutes || 0;
        const endTime = new Date(startTime.getTime() + movieDuration * 60 * 1000);
        
        if (slot.sessionId) {
          // Обновляем существующий сеанс
          promises.push(
            fetch(`/api/admin/sessions/${slot.sessionId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                movieId: selectedMovieId,
                hallId: selectedHallId,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                basePrice: parseFloat(basePrice),
                vipPrice: vipPrice ? parseFloat(vipPrice) : null,
                language,
                format,
              }),
            })
          );
        } else {
          // Создаем новый сеанс
          promises.push(
            fetch('/api/admin/sessions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                movieId: selectedMovieId,
                hallId: selectedHallId,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                basePrice: parseFloat(basePrice),
                vipPrice: vipPrice ? parseFloat(vipPrice) : null,
                language,
                format,
              }),
            })
          );
        }
      }
      
      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.ok).length;
      const totalCount = results.length;
      
      if (successCount === totalCount) {
        showToast(`Успешно сохранено ${successCount} сеансов!`, "success");
        router.refresh();
        router.push("/admin/sessions");
      } else if (successCount > 0) {
        showToast(`Сохранено ${successCount} из ${totalCount} сеансов`, "warning");
        router.refresh();
        router.push("/admin/sessions");
      } else {
        showToast("Не удалось сохранить сеансы", "error");
      }
    } catch (error) {
      showToast("Ошибка при сохранении сеансов", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Хлебные крошки */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/admin/sessions" className="hover:text-white transition-colors">
          Сеансы
        </Link>
        <span>/</span>
        <span className="text-white">Редактировать сеанс</span>
      </div>

      {/* Заголовок */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Редактировать сеанс</h2>
          <p className="text-gray-400">
            Измените параметры сеанса
          </p>
        </div>
        <Link
          href="/admin/sessions"
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
        >
          Отмена
        </Link>
      </div>

      {/* Индикатор процесса */}
      <div className="mb-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-800 p-6">
        <div className="flex items-center justify-between">
          {/* Шаг 1 */}
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-full font-bold bg-[#e50914] text-white">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-white">
                Выбор фильма
              </p>
              <p className="text-xs text-gray-500">Выберите фильм для сеанса</p>
            </div>
          </div>
          
          <div className="h-0.5 flex-1 mx-4 bg-[#e50914]" />
          
          {/* Шаг 2 */}
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-full font-bold bg-[#e50914] text-white">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-white">
                Выбор зала
              </p>
              <p className="text-xs text-gray-500">Выберите зал для сеансов</p>
            </div>
          </div>
          
          <div className="h-0.5 flex-1 mx-4 bg-[#e50914]" />
          
          {/* Шаг 3 */}
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-full font-bold bg-[#e50914] text-white">
              3
            </div>
            <div>
              <p className="font-medium text-white">
                Дата и время
              </p>
              <p className="text-xs text-gray-500">Укажите расписание</p>
            </div>
          </div>
        </div>
      </div>

      {/* Шаг 1: Выбор фильма */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-800 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Выберите фильм</h3>
        </div>

        {/* Дропдаун фильмов */}
        <div className="relative mb-4">
          <button
            type="button"
            onClick={() => setIsMovieDropdownOpen(!isMovieDropdownOpen)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-left flex items-center justify-between hover:border-gray-600 transition-colors"
          >
            <span className={selectedMovie ? 'text-white' : 'text-gray-400'}>
              {selectedMovie ? getTitle(selectedMovie) : 'Выберите фильм'}
            </span>
            {isMovieDropdownOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {isMovieDropdownOpen && (
            <div className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto">
              {movies.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => {
                    setSelectedMovieId(movie.id);
                    setIsMovieDropdownOpen(false);
                  }}
                  className={`flex items-center gap-4 p-4 cursor-pointer transition-colors border-b border-gray-700 last:border-b-0 ${
                    selectedMovieId === movie.id
                      ? 'bg-[#e50914]/10 hover:bg-[#e50914]/20'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <img
                    src={getPosterUrl(movie)}
                    alt={getTitle(movie)}
                    className="w-16 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-white mb-1">{getTitle(movie)}</p>
                    <p className="text-sm text-gray-400 mb-2">
                      {movie.durationMinutes} мин • {movie.ageRating}
                    </p>
                    {getStatusBadge(movie.status)}
                  </div>
                  {selectedMovieId === movie.id && (
                    <Check className="w-5 h-5 text-[#e50914]" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Выбранный фильм */}
        {selectedMovie && (
          <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">Выбранный фильм:</p>
            <div className="flex items-center gap-4">
              <img
                src={getPosterUrl(selectedMovie)}
                alt={getTitle(selectedMovie)}
                className="w-20 h-30 object-cover rounded"
              />
              <div>
                <p className="font-semibold text-white text-lg mb-1">{getTitle(selectedMovie)}</p>
                <p className="text-sm text-gray-400 mb-2">
                  Длительность: {selectedMovie.durationMinutes} мин • Возраст: {selectedMovie.ageRating}
                </p>
                {getStatusBadge(selectedMovie.status)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Шаг 2: Выбор зала */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-800 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Выберите зал</h3>
        </div>

        {/* Дропдаун зала */}
        <div className="relative mb-4">
          <button
            type="button"
            onClick={() => setIsHallDropdownOpen(!isHallDropdownOpen)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-left flex items-center justify-between hover:border-gray-600 transition-colors"
          >
            <span className={selectedHallId ? 'text-white' : 'text-gray-400'}>
              {selectedHallId 
                ? halls.find(h => h.id === selectedHallId)?.name || 'Выберите зал'
                : 'Выберите зал'}
            </span>
            {isHallDropdownOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {isHallDropdownOpen && (
            <div className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
              {halls.map((hall) => {
                const isSelected = selectedHallId === hall.id;
                return (
                  <div
                    key={hall.id}
                    onClick={() => {
                      setSelectedHallId(hall.id);
                      setIsHallDropdownOpen(false);
                    }}
                    className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-gray-700 last:border-b-0 ${
                      isSelected
                        ? 'bg-[#e50914]/10 hover:bg-[#e50914]/20'
                        : 'hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-white">{hall.name}</p>
                      <p className="text-sm text-gray-400">{hall.totalSeats} мест</p>
                      {hall.seats.length > 0 && (
                        <p className="text-xs text-yellow-500 mt-1">
                          VIP места: {hall.seats.length}
                        </p>
                      )}
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-[#e50914]" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Выбранный зал */}
        {selectedHallId && (
          <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">Выбранный зал:</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white text-lg">
                  {halls.find(h => h.id === selectedHallId)?.name}
                </p>
                <p className="text-sm text-gray-400">
                  {halls.find(h => h.id === selectedHallId)?.totalSeats} мест
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Шаг 3: Дата и время */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-800 p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Дата и время</h3>

        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">
            Дата <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={selectedDate}
            disabled
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Дата не может быть изменена при редактировании</p>
        </div>

        {/* Временные слоты */}
        <div className="space-y-4 mb-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm text-gray-400">
              Временные слоты <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={addTimeSlot}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Добавить слот
            </button>
          </div>

          {timeSlots.map((slot, index) => {
            const isAvailable = isTimeSlotAvailable(slot.from, slot.id);
            
            return (
              <div key={slot.id} className="flex items-center gap-3">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Время начала
                    </label>
                    <input
                      type="time"
                      value={slot.from}
                      onChange={(e) => updateTimeSlot(slot.id, 'from', e.target.value)}
                      className={`w-full px-4 py-2.5 bg-gray-800 border rounded-lg text-white focus:outline-none ${
                        !isAvailable && slot.from
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-gray-700 focus:border-[#e50914]'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Время окончания <span className="text-gray-600">(с перерывом 20 мин)</span>
                    </label>
                    <input
                      type="time"
                      value={slot.to}
                      disabled
                      className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Индикатор доступности */}
                <div className="flex items-center gap-2">
                  {slot.from && (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isAvailable ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}
                      title={isAvailable ? 'Время доступно' : 'Время занято'}
                    >
                      {isAvailable ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <X className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  )}

                  {/* Кнопка удаления */}
                  {timeSlots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(slot.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      title="Удалить слот"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Информация о фильме */}
        {selectedMovie && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-4">
            <p className="text-sm text-blue-400">
              Длительность фильма: {selectedMovie.durationMinutes} минут
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Между сеансами автоматически добавляется перерыв {BREAK_TIME_MINUTES} минут
            </p>
          </div>
        )}

        {/* Существующие сеансы в этом зале */}
        {existingSessions.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-400 mb-2">
              Существующие сеансы в этом зале на эту дату <span className="text-gray-500">(время окончания + 20 мин перерыв):</span>
            </p>
            <div className="space-y-2">
              {existingSessions.map((session) => {
                const start = new Date(session.startTime);
                const end = new Date(session.endTime);
                // Добавляем 20 минут перерыва к отображаемому времени окончания
                const endWithBreak = new Date(end.getTime() + BREAK_TIME_MINUTES * 60 * 1000);
                return (
                  <div
                    key={session.id}
                    className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
                  >
                    <p className="text-sm text-yellow-400">
                      {start.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} - {endWithBreak.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      {' • '}
                      {session.movieTitle}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isLoadingSessions && (
          <div className="flex items-center justify-center py-4">
            <svg className="animate-spin h-6 w-6 text-[#e50914]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}
      </div>

      {/* Дополнительные параметры */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-800 p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Дополнительные параметры</h3>

        <div className={`grid grid-cols-1 gap-4 ${hasVipSeats ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Базовая цена <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#e50914] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              required
            />
          </div>

          {hasVipSeats && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                VIP цена <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={vipPrice}
                onChange={(e) => setVipPrice(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#e50914] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-2">Язык</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#e50914]"
            >
              <option value="original">Оригинал</option>
              <option value="dubbed">Дубляж</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Формат
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#e50914]"
            >
              <option value="TWO_D">2D</option>
              <option value="THREE_D">3D</option>
              <option value="IMAX">IMAX</option>
            </select>
          </div>
        </div>
      </div>

      {/* Кнопка сохранения */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-8 py-3 bg-[#e50914] hover:bg-[#c50812] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Сохранение...
            </span>
          ) : (
            "Сохранить изменения"
          )}
        </button>
      </div>
    </div>
  );
}
