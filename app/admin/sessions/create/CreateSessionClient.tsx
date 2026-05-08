"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastContainer";
import Link from "next/link";

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
}

interface TimeSlot {
  time: string;
  id: string;
}

interface CreateSessionClientProps {
  movies: Movie[];
  halls: Hall[];
}

export default function CreateSessionClient({
  movies,
  halls,
}: CreateSessionClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityResults, setAvailabilityResults] = useState<any>(null);

  // Форма
  const [formData, setFormData] = useState({
    movieId: "",
    hallIds: [] as string[], // Множественный выбор залов
    startDate: "",
    endDate: "", // Для диапазона дат
    basePrice: "",
    language: "original",
    format: "TWO_D",
  });

  // Временные слоты (можно добавлять несколько)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { time: "", id: crypto.randomUUID() },
  ]);

  // Выбранные даты (для исключения)
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [generatedDates, setGeneratedDates] = useState<Date[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Генерируем даты при изменении диапазона
    if (name === "startDate" || name === "endDate") {
      generateDates(
        name === "startDate" ? value : formData.startDate,
        name === "endDate" ? value : formData.endDate
      );
    }
  };

  // Генерация дат в диапазоне
  const generateDates = (start: string, end: string) => {
    if (!start) {
      setGeneratedDates([]);
      setSelectedDates([]);
      return;
    }

    const dates: Date[] = [];
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date(start);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }

    setGeneratedDates(dates);
    // По умолчанию все даты выбраны
    setSelectedDates(dates.map(d => d.toISOString().split('T')[0]));
  };

  // Переключение выбора даты
  const toggleDate = (dateStr: string) => {
    setSelectedDates(prev => 
      prev.includes(dateStr)
        ? prev.filter(d => d !== dateStr)
        : [...prev, dateStr]
    );
    setAvailabilityResults(null);
  };

  // Быстрые действия с датами
  const selectAllDates = () => {
    setSelectedDates(generatedDates.map(d => d.toISOString().split('T')[0]));
    setAvailabilityResults(null);
  };

  const deselectAllDates = () => {
    setSelectedDates([]);
    setAvailabilityResults(null);
  };

  const selectWeekdays = () => {
    const weekdays = generatedDates.filter(d => {
      const day = d.getDay();
      return day !== 0 && day !== 6; // Не воскресенье и не суббота
    });
    setSelectedDates(weekdays.map(d => d.toISOString().split('T')[0]));
    setAvailabilityResults(null);
  };

  const selectWeekends = () => {
    const weekends = generatedDates.filter(d => {
      const day = d.getDay();
      return day === 0 || day === 6; // Воскресенье или суббота
    });
    setSelectedDates(weekends.map(d => d.toISOString().split('T')[0]));
    setAvailabilityResults(null);
  };

  const handleHallToggle = (hallId: string) => {
    setFormData((prev) => ({
      ...prev,
      hallIds: prev.hallIds.includes(hallId)
        ? prev.hallIds.filter((id) => id !== hallId)
        : [...prev.hallIds, hallId],
    }));
  };

  const addTimeSlot = () => {
    setTimeSlots((prev) => [...prev, { time: "", id: crypto.randomUUID() }]);
  };

  const removeTimeSlot = (id: string) => {
    if (timeSlots.length > 1) {
      setTimeSlots((prev) => prev.filter((slot) => slot.id !== id));
    }
  };

  const updateTimeSlot = (id: string, time: string) => {
    setTimeSlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, time } : slot))
    );
  };

  const handleMovieStatusChange = async (movieId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/movies/${movieId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        showToast("Статус фильма успешно обновлен", "success");
        router.refresh();
      } else {
        const data = await response.json();
        showToast(data.error || "Ошибка при обновлении статуса", "error");
      }
    } catch (error) {
      showToast("Ошибка при обновлении статуса", "error");
    }
  };

  // Проверка доступности залов
  const checkAvailability = async () => {
    // Валидация
    if (!formData.movieId) {
      showToast("Пожалуйста, выберите фильм", "warning");
      return;
    }
    
    if (formData.hallIds.length === 0) {
      showToast("Пожалуйста, выберите хотя бы один зал", "warning");
      return;
    }
    
    if (!formData.startDate) {
      showToast("Пожалуйста, укажите дату начала", "warning");
      return;
    }

    if (selectedDates.length === 0) {
      showToast("Пожалуйста, выберите хотя бы одну дату", "warning");
      return;
    }
    
    if (timeSlots.some(slot => !slot.time)) {
      showToast("Пожалуйста, укажите время для всех слотов", "warning");
      return;
    }

    setIsCheckingAvailability(true);

    try {
      const movie = movies.find((m) => m.id === formData.movieId);
      if (!movie) {
        showToast("Выбранный фильм не найден", "error");
        return;
      }

      const response = await fetch("/api/admin/sessions/check-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: formData.movieId,
          hallIds: formData.hallIds,
          selectedDates: selectedDates, // Отправляем только выбранные даты
          timeSlots: timeSlots.map((slot) => slot.time),
          durationMinutes: movie.durationMinutes,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAvailabilityResults(data);
        
        if (data.totalAvailable === 0) {
          showToast(
            "Все выбранные временные слоты заняты. Выберите другое время или дату.",
            "warning"
          );
        } else if (data.totalConflicts === 0) {
          showToast(
            `Отлично! Все ${data.totalAvailable} слотов доступны для создания сеансов.`,
            "success"
          );
        } else {
          showToast(
            `Доступно ${data.totalAvailable} из ${data.totalRequested} слотов. ${data.totalConflicts} слотов заняты.`,
            "info"
          );
        }
      } else {
        const data = await response.json();
        showToast(data.error || "Не удалось проверить доступность. Попробуйте еще раз.", "error");
      }
    } catch (error) {
      showToast("Произошла ошибка при проверке доступности. Проверьте подключение к интернету.", "error");
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!availabilityResults) {
      showToast("Пожалуйста, сначала проверьте доступность залов", "warning");
      return;
    }

    if (availabilityResults.totalAvailable === 0) {
      showToast("Нет доступных слотов для создания сеансов", "error");
      return;
    }

    if (!formData.basePrice) {
      showToast("Укажите базовую цену билета", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/sessions/bulk-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: formData.movieId,
          availableSlots: availabilityResults.availableSlots,
          basePrice: parseFloat(formData.basePrice),
          language: formData.language,
          format: formData.format,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.failed > 0) {
          showToast(
            `Создано ${data.created} из ${data.total} сеансов. ${data.failed} не удалось создать из-за конфликтов.`,
            "warning"
          );
        } else {
          showToast(
            `Успешно создано ${data.created} ${data.created === 1 ? 'сеанс' : data.created < 5 ? 'сеанса' : 'сеансов'}!`,
            "success"
          );
        }
        
        router.push("/admin/sessions");
      } else {
        const data = await response.json();
        showToast(data.error || "Не удалось создать сеансы. Попробуйте еще раз.", "error");
      }
    } catch (error) {
      showToast("Произошла ошибка при создании сеансов. Проверьте подключение к интернету.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const getPosterUrl = (movie: Movie) => {
    const poster = movie.mediaFiles.find((m) => m.type === "poster");
    return poster?.url || "/placeholder.svg";
  };

  const getTitle = (movie: Movie, lang: string = "RU") => {
    const translation = movie.translations.find((t) => t.language === lang);
    return translation?.title || "Без названия";
  };

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

  const selectedMovie = movies.find((m) => m.id === formData.movieId);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Хлебные крошки */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/admin/sessions" className="hover:text-white transition-colors">
          Сеансы
        </Link>
        <span>/</span>
        <span className="text-white">Добавить сеанс</span>
      </div>

      {/* Заголовок */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Добавить сеанс</h2>
          <p className="text-gray-400">
            Создайте несколько сеансов одновременно для выбранного фильма
          </p>
        </div>
        <Link
          href="/admin/sessions"
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
        >
          Отмена
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Шаг 1: Выбор фильма */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-800 p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#e50914] text-white text-sm font-bold">
              1
            </span>
            Выберите фильм
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className={`flex flex-col gap-3 p-4 rounded-lg border transition-all cursor-pointer ${
                  formData.movieId === movie.id
                    ? "border-[#e50914] bg-[#e50914]/10"
                    : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
                }`}
                onClick={() => {
                  setFormData((prev) => ({ ...prev, movieId: movie.id }));
                  setAvailabilityResults(null); // Сбрасываем результаты при смене фильма
                }}
              >
                <img
                  src={getPosterUrl(movie)}
                  alt={getTitle(movie)}
                  className="w-full h-48 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-medium text-white mb-1">{getTitle(movie)}</p>
                  <p className="text-sm text-gray-400 mb-2">
                    {movie.durationMinutes} мин • {movie.ageRating}
                  </p>
                  <div className="flex items-center justify-between">
                    {getStatusBadge(movie.status)}
                    <select
                      value={movie.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleMovieStatusChange(movie.id, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-[#e50914]"
                    >
                      <option value="now_showing">В прокате</option>
                      <option value="coming_soon">Скоро</option>
                      <option value="archived">Архив</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Шаг 2: Выбор залов */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-800 p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#e50914] text-white text-sm font-bold">
              2
            </span>
            Выберите залы
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {halls.map((hall) => (
              <div
                key={hall.id}
                className={`flex items-center gap-3 p-4 rounded-lg border transition-all cursor-pointer ${
                  formData.hallIds.includes(hall.id)
                    ? "border-[#e50914] bg-[#e50914]/10"
                    : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
                }`}
                onClick={() => {
                  handleHallToggle(hall.id);
                  setAvailabilityResults(null); // Сбрасываем результаты при смене залов
                }}
              >
                <div
                  className={`flex items-center justify-center w-6 h-6 rounded border-2 transition-colors ${
                    formData.hallIds.includes(hall.id)
                      ? "border-[#e50914] bg-[#e50914]"
                      : "border-gray-600"
                  }`}
                >
                  {formData.hallIds.includes(hall.id) && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">{hall.name}</p>
                  <p className="text-sm text-gray-400">{hall.totalSeats} мест</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Шаг 3: Даты и время */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-800 p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#e50914] text-white text-sm font-bold">
              3
            </span>
            Укажите даты и время
          </h3>

          <div className="space-y-6">
            {/* Диапазон дат */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Дата начала <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={(e) => {
                    handleInputChange(e);
                    setAvailabilityResults(null);
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#e50914]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Дата окончания{" "}
                  <span className="text-gray-500 text-xs">(опционально)</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={(e) => {
                    handleInputChange(e);
                    setAvailabilityResults(null);
                  }}
                  min={formData.startDate}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#e50914]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Оставьте пустым для одного дня
                </p>
              </div>
            </div>

            {/* Выбор конкретных дат */}
            {generatedDates.length > 0 && (
              <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Выберите даты для создания сеансов
                  </label>
                  <span className="text-xs text-gray-400">
                    Выбрано: {selectedDates.length} из {generatedDates.length}
                  </span>
                </div>

                {/* Быстрые действия */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    type="button"
                    onClick={selectAllDates}
                    className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    Выбрать все
                  </button>
                  <button
                    type="button"
                    onClick={deselectAllDates}
                    className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                  >
                    Снять все
                  </button>
                  <button
                    type="button"
                    onClick={selectWeekdays}
                    className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                  >
                    Только будни
                  </button>
                  <button
                    type="button"
                    onClick={selectWeekends}
                    className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                  >
                    Только выходные
                  </button>
                </div>

                {/* Список дат */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                  {generatedDates.map((date) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const isSelected = selectedDates.includes(dateStr);
                    const dayOfWeek = date.toLocaleDateString('ru-RU', { weekday: 'short' });
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                    return (
                      <div
                        key={dateStr}
                        onClick={() => toggleDate(dateStr)}
                        className={`flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#e50914] bg-[#e50914]/10"
                            : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors flex-shrink-0 ${
                            isSelected
                              ? "border-[#e50914] bg-[#e50914]"
                              : "border-gray-600"
                          }`}
                        >
                          {isSelected && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {date.toLocaleDateString('ru-RU', { 
                              day: '2-digit', 
                              month: '2-digit' 
                            })}
                          </p>
                          <p className={`text-xs ${
                            isWeekend ? 'text-purple-400' : 'text-gray-400'
                          }`}>
                            {dayOfWeek}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedDates.length === 0 && (
                  <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-center">
                    <p className="text-sm text-yellow-400">
                      ⚠️ Выберите хотя бы одну дату
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Временные слоты */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">
                  Время показов <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={addTimeSlot}
                  className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  + Добавить время
                </button>
              </div>

              <div className="space-y-2">
                {timeSlots.map((slot, index) => (
                  <div key={slot.id} className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 w-8">{index + 1}.</span>
                    <input
                      type="time"
                      value={slot.time}
                      onChange={(e) => {
                        updateTimeSlot(slot.id, e.target.value);
                        setAvailabilityResults(null);
                      }}
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#e50914]"
                      required
                    />
                    {timeSlots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          removeTimeSlot(slot.id);
                          setAvailabilityResults(null);
                        }}
                        className="px-3 py-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Кнопка проверки доступности */}
            <div className="pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={checkAvailability}
                disabled={isCheckingAvailability}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingAvailability ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Проверка доступности...
                  </span>
                ) : (
                  "Проверить доступность залов"
                )}
              </button>
            </div>

            {/* Результаты проверки */}
            {availabilityResults && (
              <div className="mt-4 space-y-4">
                {/* Общая статистика */}
                <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <svg
                      className={`w-5 h-5 ${
                        availabilityResults.totalAvailable > 0
                          ? "text-green-400"
                          : "text-yellow-400"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Результаты проверки доступности
                  </h4>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-gray-900/50 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Всего проверено</p>
                      <p className="text-2xl font-bold text-white">
                        {availabilityResults.totalRequested}
                      </p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                      <p className="text-xs text-green-400 mb-1">Доступно</p>
                      <p className="text-2xl font-bold text-green-400">
                        {availabilityResults.totalAvailable}
                      </p>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                      <p className="text-xs text-red-400 mb-1">Недоступно</p>
                      <p className="text-2xl font-bold text-red-400">
                        {availabilityResults.totalConflicts}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Недоступные слоты */}
                {availabilityResults.conflicts.length > 0 && (
                  <div className="p-4 bg-orange-500/5 border border-orange-500/30 rounded-lg">
                    <div className="flex items-start gap-3 mb-3">
                      <svg
                        className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <div className="flex-1">
                        <h5 className="font-semibold text-orange-400 mb-1">
                          Недоступные временные слоты
                        </h5>
                        <p className="text-sm text-orange-300/80 mb-3">
                          Следующие залы заняты в указанное время. Выберите другое время или дату для этих слотов.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {availabilityResults.conflicts.map((conflict: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 bg-gray-900/50 rounded border border-orange-500/20 hover:border-orange-500/40 transition-colors"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <svg
                                className="w-4 h-4 text-orange-400 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                              </svg>
                              <span className="font-medium text-white truncate">
                                {conflict.hallName}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                {conflict.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                {conflict.time}
                              </span>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                              Занят
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {availabilityResults.conflicts.length > 5 && (
                      <div className="mt-3 pt-3 border-t border-orange-500/20">
                        <p className="text-xs text-orange-300/60 text-center">
                          Показано {Math.min(availabilityResults.conflicts.length, 100)} из{" "}
                          {availabilityResults.conflicts.length} недоступных слотов
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Успешное сообщение если все доступно */}
                {availabilityResults.totalAvailable > 0 &&
                  availabilityResults.totalConflicts === 0 && (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <svg
                          className="w-6 h-6 text-green-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div>
                          <p className="font-semibold text-green-400 mb-1">
                            Отлично! Все слоты доступны
                          </p>
                          <p className="text-sm text-green-300/80">
                            Все выбранные временные слоты свободны. Вы можете продолжить создание сеансов.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Частичная доступность */}
                {availabilityResults.totalAvailable > 0 &&
                  availabilityResults.totalConflicts > 0 && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <svg
                          className="w-6 h-6 text-blue-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div>
                          <p className="font-semibold text-blue-400 mb-1">
                            Частичная доступность
                          </p>
                          <p className="text-sm text-blue-300/80">
                            Из {availabilityResults.totalRequested} проверенных слотов доступно{" "}
                            <span className="font-bold text-blue-400">
                              {availabilityResults.totalAvailable}
                            </span>
                            . Недоступные слоты будут пропущены при создании.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Нет доступных слотов */}
                {availabilityResults.totalAvailable === 0 && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-6 h-6 text-red-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <p className="font-semibold text-red-400 mb-1">
                          Нет доступных слотов
                        </p>
                        <p className="text-sm text-red-300/80">
                          Все выбранные временные слоты заняты. Пожалуйста, выберите другое время, дату или залы.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Шаг 4: Дополнительные параметры */}
        {availabilityResults && availabilityResults.totalAvailable > 0 && (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-800 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#e50914] text-white text-sm font-bold">
                4
              </span>
              Дополнительные параметры
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Цена */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Базовая цена (сом) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={handleInputChange}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="Например: 300"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#e50914]"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Язык */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Язык
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#e50914]"
                >
                  <option value="original">Оригинал</option>
                  <option value="dubbed">Дубляж</option>
                </select>
              </div>

              {/* Формат */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Формат
                </label>
                <select
                  name="format"
                  value={formData.format}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#e50914]"
                >
                  <option value="TWO_D">2D</option>
                  <option value="THREE_D">3D</option>
                  <option value="IMAX">IMAX</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Кнопки действий */}
        {availabilityResults && availabilityResults.totalAvailable > 0 && (
          <div className="flex justify-end gap-4">
            <Link
              href="/admin/sessions"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              Отмена
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-[#e50914] hover:bg-[#f40612] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Создание сеансов...
                </span>
              ) : (
                `Создать ${availabilityResults.totalAvailable} сеансов`
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
