"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastContainer";
import Link from "next/link";
import { ChevronDown, ChevronUp, Check } from "lucide-react";

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

  // Шаги процесса
  const [currentStep, setCurrentStep] = useState(3); // Сразу на шаге 3, так как все уже выбрано
  
  // Шаг 1: Выбор фильма
  const [selectedMovieId, setSelectedMovieId] = useState(session.movieId);
  const [isMovieDropdownOpen, setIsMovieDropdownOpen] = useState(false);
  
  // Шаг 2: Выбор зала
  const [selectedHallId, setSelectedHallId] = useState(session.hallId);
  const [isHallDropdownOpen, setIsHallDropdownOpen] = useState(false);
  
  // Шаг 3: Дата и время
  const startDate = new Date(session.startTime);
  const [selectedDate, setSelectedDate] = useState(
    startDate.toISOString().split("T")[0]
  );
  const [selectedTime, setSelectedTime] = useState(
    startDate.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
  
  // Дополнительные параметры
  const [basePrice, setBasePrice] = useState(String(session.basePrice));
  const [vipPrice, setVipPrice] = useState(
    session.vipPrice ? String(session.vipPrice) : ""
  );
  const [language, setLanguage] = useState(session.language);
  const [format, setFormat] = useState(session.format);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedMovie = movies.find((m) => m.id === selectedMovieId);
  const selectedHall = halls.find((h) => h.id === selectedHallId);
  const hasVipSeats = selectedHall ? selectedHall.seats.length > 0 : false;

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

    if (!selectedDate || !selectedTime) {
      showToast("Укажите дату и время", "warning");
      return;
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
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const sessionStartTime = new Date(selectedDate);
      sessionStartTime.setHours(hours, minutes, 0, 0);

      const movie = movies.find((m) => m.id === selectedMovieId);
      if (!movie) {
        showToast("Фильм не найден", "error");
        return;
      }

      const endMinutes =
        sessionStartTime.getHours() * 60 +
        sessionStartTime.getMinutes() +
        movie.durationMinutes;
      const sessionEndTime = new Date(sessionStartTime);
      sessionEndTime.setHours(
        Math.floor(endMinutes / 60),
        endMinutes % 60,
        0,
        0
      );

      const response = await fetch(`/api/admin/sessions/${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: selectedMovieId,
          hallId: selectedHallId,
          startTime: sessionStartTime.toISOString(),
          endTime: sessionEndTime.toISOString(),
          basePrice: parseFloat(basePrice),
          vipPrice: vipPrice ? parseFloat(vipPrice) : null,
          language,
          format,
        }),
      });

      if (response.ok) {
        showToast("Сеанс успешно обновлен!", "success");
        router.push("/admin/sessions");
      } else {
        const data = await response.json();
        showToast(data.error || "Не удалось обновить сеанс", "error");
      }
    } catch (error) {
      showToast("Ошибка при обновлении сеанса", "error");
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Дата <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#e50914]"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Время начала <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#e50914]"
              required
            />
          </div>
        </div>

        {selectedMovie && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-400">
              Длительность фильма: {selectedMovie.durationMinutes} минут
            </p>
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
