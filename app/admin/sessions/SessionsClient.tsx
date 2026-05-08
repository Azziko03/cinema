"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Modal from "@/components/Modal";
import { useToast } from "@/components/ToastContainer";

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

interface Session {
  id: string;
  startTime: Date;
  endTime: Date;
  basePrice: number;
  language: string;
  format: string;
  movie: Movie;
  hall: Hall;
  seatsInfo: {
    vipSeatsTotal: number;
    regularSeatsTotal: number;
    occupiedVipSeats: number;
    occupiedRegularSeats: number;
    totalOccupied: number;
  };
}

interface SessionsClientProps {
  initialSessions: Session[];
  movies: Movie[];
  halls: Hall[];
}

export default function SessionsClient({
  initialSessions,
  movies,
  halls,
}: SessionsClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Форма для редактирования сеанса
  const [formData, setFormData] = useState({
    movieId: "",
    hallId: "",
    startDate: "",
    startTime: "",
    basePrice: "",
    language: "original",
    format: "TWO_D",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMovieStatusChange = async (movieId: string, newStatus: string) => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSession) {
      showToast("Сеанс не выбран", "error");
      return;
    }

    setIsLoading(true);

    try {
      // Валидация
      if (!formData.movieId || !formData.hallId || !formData.startDate || !formData.startTime || !formData.basePrice) {
        showToast("Заполните все обязательные поля", "error");
        setIsLoading(false);
        return;
      }

      // Объединяем дату и время
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      
      // Находим фильм для получения длительности
      const movie = movies.find(m => m.id === formData.movieId);
      if (!movie) {
        showToast("Фильм не найден", "error");
        setIsLoading(false);
        return;
      }

      // Вычисляем время окончания
      const endDateTime = new Date(startDateTime.getTime() + movie.durationMinutes * 60000);

      const response = await fetch(`/api/admin/sessions/${selectedSession.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: formData.movieId,
          hallId: formData.hallId,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          basePrice: parseFloat(formData.basePrice),
          language: formData.language,
          format: formData.format,
        }),
      });

      if (response.ok) {
        showToast("Сеанс успешно обновлен", "success");
        setIsEditModalOpen(false);
        resetForm();
        setSelectedSession(null);
        router.refresh();
      } else {
        const data = await response.json();
        showToast(data.error || "Ошибка при обновлении сеанса", "error");
      }
    } catch (error) {
      showToast("Ошибка при обновлении сеанса", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      movieId: "",
      hallId: "",
      startDate: "",
      startTime: "",
      basePrice: "",
      language: "original",
      format: "TWO_D",
    });
  };

  const initializeEditForm = (session: Session) => {
    const startDate = new Date(session.startTime);
    setFormData({
      movieId: session.movie.id,
      hallId: session.hall.id,
      startDate: startDate.toISOString().split("T")[0],
      startTime: startDate.toTimeString().slice(0, 5),
      basePrice: session.basePrice.toString(),
      language: session.language,
      format: session.format,
    });
  };

  const handleEdit = (session: Session) => {
    setSelectedSession(session);
    initializeEditForm(session);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (session: Session) => {
    setSelectedSession(session);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedSession) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/sessions?id=${selectedSession.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showToast("Сеанс успешно удален", "success");
        setIsDeleteModalOpen(false);
        setSelectedSession(null);
        router.refresh();
      } else {
        const data = await response.json();
        showToast(data.error || "Ошибка при удалении сеанса", "error");
      }
    } catch (error) {
      showToast("Ошибка при удалении сеанса", "error");
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

  const renderSessionForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Выбор фильма с возможностью изменения статуса */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Фильм <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className={`flex items-center gap-4 p-3 rounded-lg border transition-all cursor-pointer ${
                formData.movieId === movie.id
                  ? "border-[#e50914] bg-[#e50914]/10"
                  : "border-gray-700 hover:border-gray-600 bg-gray-800/50"
              }`}
              onClick={() => {
                setFormData((prev) => ({ ...prev, movieId: movie.id }));
              }}
            >
              <img
                src={getPosterUrl(movie)}
                alt={getTitle(movie)}
                className="w-12 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-medium text-white">{getTitle(movie)}</p>
                <p className="text-sm text-gray-400">
                  {movie.durationMinutes} мин • {movie.ageRating}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(movie.status)}
                <select
                  value={movie.status}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleMovieStatusChange(movie.id, e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-[#e50914]"
                  disabled={isLoading}
                >
                  <option value="now_showing">В прокате</option>
                  <option value="coming_soon">Скоро</option>
                  <option value="archived">Архив</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Выбор зала */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Зал <span className="text-red-500">*</span>
        </label>
        <select
          name="hallId"
          value={formData.hallId}
          onChange={handleInputChange}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#e50914]"
          required
        >
          <option value="">Выберите зал</option>
          {halls.map((hall) => (
            <option key={hall.id} value={hall.id}>
              {hall.name} ({hall.totalSeats} мест)
            </option>
          ))}
        </select>
      </div>

      {/* Дата и время */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Дата <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#e50914]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Время <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#e50914]"
            required
          />
        </div>
      </div>

      {/* Цена - БЕЗ СКРОЛЛА */}
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

      {/* Язык и формат */}
      <div className="grid grid-cols-2 gap-4">
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

      {/* Кнопки */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => {
            setIsEditModalOpen(false);
            resetForm();
            setSelectedSession(null);
          }}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          disabled={isLoading}
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-[#e50914] hover:bg-[#f40612] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Обновление..." : "Обновить сеанс"}
        </button>
      </div>
    </form>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Сеансы</h2>
          <p className="text-gray-400">Управление расписанием показов</p>
        </div>
        <Link
          href="/admin/sessions/create"
          className="px-6 py-3 bg-[#e50914] hover:bg-[#f40612] text-white font-medium rounded-lg transition-colors"
        >
          + Добавить сеанс
        </Link>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Фильм</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Зал</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Дата и время</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Цена</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Занято мест</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {initialSessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={getPosterUrl(session.movie)}
                        alt={getTitle(session.movie)}
                        className="w-10 h-14 object-cover rounded"
                      />
                      <span className="font-medium">{getTitle(session.movie)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{session.hall.name}</td>
                  <td className="px-6 py-4 text-sm">
                    <div>
                      <p className="font-medium">
                        {new Date(session.startTime).toLocaleDateString("ru-RU")}
                      </p>
                      <p className="text-gray-400">
                        {new Date(session.startTime).toLocaleTimeString("ru-RU", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {Number(session.basePrice)} сом
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {/* VIP места */}
                      {session.seatsInfo.vipSeatsTotal > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 min-w-[60px]">
                            <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-xs text-yellow-500 font-medium">VIP:</span>
                          </div>
                          <div className="flex-1 bg-gray-700 rounded-full h-2 max-w-[80px]">
                            <div
                              className="bg-yellow-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${
                                  session.seatsInfo.vipSeatsTotal > 0
                                    ? (session.seatsInfo.occupiedVipSeats / session.seatsInfo.vipSeatsTotal) * 100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 min-w-[45px]">
                            {session.seatsInfo.occupiedVipSeats}/{session.seatsInfo.vipSeatsTotal}
                          </span>
                        </div>
                      )}
                      
                      {/* Обычные места */}
                      {session.seatsInfo.regularSeatsTotal > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 min-w-[60px]">
                            <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs text-blue-400 font-medium">Обычн:</span>
                          </div>
                          <div className="flex-1 bg-gray-700 rounded-full h-2 max-w-[80px]">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${
                                  session.seatsInfo.regularSeatsTotal > 0
                                    ? (session.seatsInfo.occupiedRegularSeats / session.seatsInfo.regularSeatsTotal) * 100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 min-w-[45px]">
                            {session.seatsInfo.occupiedRegularSeats}/{session.seatsInfo.regularSeatsTotal}
                          </span>
                        </div>
                      )}
                      
                      {/* Общее */}
                      <div className="flex items-center gap-2 pt-1 border-t border-gray-700">
                        <span className="text-xs text-gray-300 font-medium min-w-[60px]">Всего:</span>
                        <div className="flex-1 bg-gray-700 rounded-full h-2 max-w-[80px]">
                          <div
                            className="bg-[#e50914] h-2 rounded-full transition-all"
                            style={{
                              width: `${
                                session.hall.totalSeats > 0
                                  ? (session.seatsInfo.totalOccupied / session.hall.totalSeats) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-white font-medium min-w-[45px]">
                          {session.seatsInfo.totalOccupied}/{session.hall.totalSeats}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEdit(session)}
                      className="text-blue-400 hover:text-blue-300 mr-3"
                    >
                      Изменить
                    </button>
                    <button
                      onClick={() => handleDeleteClick(session)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {initialSessions.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-600"
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
          <p className="text-gray-400 mb-4">Сеансы не найдены</p>
          <Link
            href="/admin/sessions/create"
            className="inline-block px-6 py-3 bg-[#e50914] hover:bg-[#f40612] text-white font-medium rounded transition-colors"
          >
            Добавить первый сеанс
          </Link>
        </div>
      )}

      {/* Edit Session Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSession(null);
          resetForm();
        }}
        title="Редактировать сеанс"
        size="lg"
      >
        {renderSessionForm()}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedSession(null);
        }}
        title="Подтверждение удаления"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Вы уверены, что хотите удалить сеанс фильма{" "}
            <span className="font-bold text-white">
              {selectedSession && getTitle(selectedSession.movie, "RU")}
            </span>
            ?
          </p>
          <p className="text-sm text-gray-400">
            Это действие нельзя отменить. Все связанные данные будут удалены.
          </p>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedSession(null);
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              disabled={isLoading}
            >
              Отмена
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Удаление..." : "Удалить"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
