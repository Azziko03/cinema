"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import { useToast } from "@/components/ToastContainer";
import MovieEditForm from "./MovieEditForm";

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
  metadata: {
    country: string;
    year: number;
    imdbRating: number | null;
    kinopoiskRating: number | null;
  } | null;
  genres: Array<{
    genre: {
      translations: Array<{
        language: string;
        title: string;
      }>;
    };
  }>;
  mediaFiles: Array<{
    type: string;
    url: string;
  }>;
}

interface MoviesClientProps {
  initialMovies: Movie[];
}

export default function MoviesClient({ initialMovies }: MoviesClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Форма для добавления/редактирования фильма
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    genre: "",
    customGenre: "",
    durationMinutes: "",
    ageRating: "",
    status: "now_showing",
    releaseDate: "",
    country: "",
    year: "",
  });

  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [trailerFile, setTrailerFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string>("");
  const [isDraggingPoster, setIsDraggingPoster] = useState(false);
  const [isDraggingTrailer, setIsDraggingTrailer] = useState(false);

  // Новые состояния для S3 загрузки
  const [posterUrl, setPosterUrl] = useState<string>("");
  const [trailerUrl, setTrailerUrl] = useState<string>("");
  const [posterKey, setPosterKey] = useState<string>("");
  const [trailerKey, setTrailerKey] = useState<string>("");

  const genres = [
    "Боевик",
    "Комедия",
    "Драма",
    "Триллер",
    "Ужасы",
    "Фантастика",
    "Фэнтези",
    "Приключения",
    "Детектив",
    "Мелодрама",
    "Военный",
    "Исторический",
    "Биография",
    "Документальный",
    "Мультфильм",
    "Семейный",
    "Криминал",
    "Вестерн",
    "Мюзикл",
    "Спорт",
    "Другое",
  ];

  // Инициализация формы для редактирования
  const initializeEditForm = (movie: Movie) => {
    const translation = movie.translations.find((t) => t.language === "RU");
    
    // Получаем все жанры фильма
    const movieGenres = movie.genres
      .map((g) => {
        const genreTranslation = g.genre.translations.find((t) => t.language === "RU");
        return genreTranslation?.title || "";
      })
      .filter(Boolean);
    
    // Берем первый жанр
    const firstGenre = movieGenres[0] || "";
    
    // Проверяем, есть ли жанр в списке предустановленных
    const isPresetGenre = genres.includes(firstGenre);
    
    const poster = movie.mediaFiles.find((m) => m.type === "poster");
    const trailer = movie.mediaFiles.find((m) => m.type === "trailer");

    setFormData({
      title: translation?.title || "",
      description: translation?.description || "",
      genre: isPresetGenre ? firstGenre : "Другое",
      customGenre: isPresetGenre ? "" : firstGenre,
      durationMinutes: movie.durationMinutes.toString(),
      ageRating: movie.ageRating,
      status: movie.status,
      releaseDate: new Date(movie.releaseDate).toISOString().split("T")[0],
      country: movie.metadata?.country || "",
      year: movie.metadata?.year.toString() || "",
    });
    
    // Устанавливаем URL файлов для отображения
    setPosterUrl(poster?.url || "");
    setTrailerUrl(trailer?.url || "");
    setPosterPreview(poster?.url || "");
    
    // Сбрасываем локальные файлы
    setPosterFile(null);
    setTrailerFile(null);
    setPosterKey("");
    setTrailerKey("");
  };

  // Сброс формы
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      genre: "",
      customGenre: "",
      durationMinutes: "",
      ageRating: "",
      status: "now_showing",
      releaseDate: "",
      country: "",
      year: "",
    });
    setPosterFile(null);
    setTrailerFile(null);
    setPosterPreview("");
    setPosterUrl("");
    setTrailerUrl("");
    setPosterKey("");
    setTrailerKey("");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Обработчики для S3 загрузки
  const handlePosterUpload = (url: string, key: string) => {
    console.log("MoviesClient: Poster upload success", { url, key });
    setPosterUrl(url);
    setPosterKey(key);
    setPosterPreview(url);
    showToast("Постер успешно загружен", "success");
  };

  const handleTrailerUpload = (url: string, key: string) => {
    console.log("MoviesClient: Trailer upload success", { url, key });
    setTrailerUrl(url);
    setTrailerKey(key);
    showToast("Трейлер успешно загружен", "success");
  };

  const handlePosterRemove = () => {
    setPosterUrl("");
    setPosterKey("");
    setPosterPreview("");
  };

  const handleTrailerRemove = () => {
    setTrailerUrl("");
    setTrailerKey("");
  };

  // Обработка drag and drop для постера
  const handlePosterDrop = (e: React.DragEvent) => {
    // Удалено - теперь обрабатывается в FileUpload компоненте
  };

  const handlePosterSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Удалено - теперь обрабатывается в FileUpload компоненте
  };

  // Обработка drag and drop для трейлера
  const handleTrailerDrop = (e: React.DragEvent) => {
    // Удалено - теперь обрабатывается в FileUpload компоненте
  };

  const handleTrailerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Удалено - теперь обрабатывается в FileUpload компоненте
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Проверяем наличие постера
      if (!posterUrl) {
        showToast("Постер обязателен для заполнения", "error");
        setIsLoading(false);
        return;
      }

      const finalGenre = formData.genre === "Другое" ? formData.customGenre : formData.genre;

      const url = selectedMovie
        ? `/api/admin/movies/${selectedMovie.id}`
        : "/api/admin/movies";
      const method = selectedMovie ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          genre: finalGenre,
          posterUrl,
          trailerUrl,
        }),
      });

      if (response.ok) {
        showToast(
          selectedMovie ? "Фильм успешно обновлен" : "Фильм успешно добавлен",
          "success"
        );
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        resetForm();
        setSelectedMovie(null);
        router.refresh();
      } else {
        const data = await response.json();
        showToast(
          data.error || `Ошибка при ${selectedMovie ? "обновлении" : "добавлении"} фильма`,
          "error"
        );
      }
    } catch (error) {
      showToast(`Ошибка при ${selectedMovie ? "обновлении" : "добавлении"} фильма`, "error");
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

  const getGenres = (movie: Movie) => {
    return movie.genres
      .map((g) => {
        const translation = g.genre.translations.find((t) => t.language === "RU");
        return translation?.title || "";
      })
      .filter(Boolean)
      .join(", ");
  };

  const getRating = (movie: Movie) => {
    return movie.metadata?.imdbRating || movie.metadata?.kinopoiskRating || 0;
  };

  const handleEdit = (movie: Movie) => {
    setSelectedMovie(movie);
    initializeEditForm(movie);
    setIsEditModalOpen(true);
  };

  const handleView = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedMovie) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/movies?id=${selectedMovie.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showToast("Фильм успешно удален", "success");
        setIsDeleteModalOpen(false);
        setSelectedMovie(null);
        router.refresh();
      } else {
        const data = await response.json();
        showToast(data.error || "Ошибка при удалении фильма", "error");
      }
    } catch (error) {
      showToast("Ошибка при удалении фильма", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Фильмы</h2>
          <p className="text-gray-400">Управление фильмами в кинотеатре</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3 bg-[#e50914] hover:bg-[#f40612] text-white font-medium rounded-lg transition-colors"
        >
          + Добавить фильм
        </button>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Название</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Жанр</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Длительность</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Рейтинг</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Статус</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {initialMovies.map((movie) => (
                <tr
                  key={movie.id}
                  onClick={() => handleView(movie)}
                  className="hover:bg-gray-800/30 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={getPosterUrl(movie)}
                        alt={getTitle(movie)}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{getTitle(movie, "RU")}</p>
                        <p className="text-sm text-gray-400">{getTitle(movie, "KG")}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{getGenres(movie)}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{movie.durationMinutes} мин</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-sm">
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {getRating(movie)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        movie.status === "now_showing"
                          ? "bg-green-500/20 text-green-400"
                          : movie.status === "coming_soon"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {movie.status === "now_showing"
                        ? "В прокате"
                        : movie.status === "coming_soon"
                        ? "Скоро"
                        : "Архив"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleEdit(movie)}
                      className="text-blue-400 hover:text-blue-300 mr-3"
                    >
                      Изменить
                    </button>
                    <button
                      onClick={() => handleDeleteClick(movie)}
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

      {initialMovies.length === 0 && (
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
              d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
            />
          </svg>
          <p className="text-gray-400 mb-4">Фильмы не найдены</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-block px-6 py-3 bg-[#e50914] hover:bg-[#f40612] text-white font-medium rounded transition-colors"
          >
            Добавить первый фильм
          </button>
        </div>
      )}


      {/* Add Movie Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title="Добавить фильм"
        size="xl"
      >
        <MovieEditForm
          formData={formData}
          posterPreview={posterPreview}
          trailerFile={trailerFile}
          isDraggingPoster={isDraggingPoster}
          isDraggingTrailer={isDraggingTrailer}
          isLoading={isLoading}
          genres={genres}
          onInputChange={handleInputChange}
          onPosterDrop={handlePosterDrop}
          onPosterSelect={handlePosterSelect}
          onTrailerDrop={handleTrailerDrop}
          onTrailerSelect={handleTrailerSelect}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsAddModalOpen(false);
            resetForm();
          }}
          setIsDraggingPoster={setIsDraggingPoster}
          setIsDraggingTrailer={setIsDraggingTrailer}
          setPosterFile={setPosterFile}
          setPosterPreview={setPosterPreview}
          setTrailerFile={setTrailerFile}
          // Новые пропсы для S3 загрузки
          posterUrl={posterUrl}
          trailerUrl={trailerUrl}
          onPosterUpload={handlePosterUpload}
          onTrailerUpload={handleTrailerUpload}
          onPosterRemove={handlePosterRemove}
          onTrailerRemove={handleTrailerRemove}
        />
      </Modal>
      {/* View Movie Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedMovie(null);
        }}
        title="Информация о фильме"
        size="xl"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsViewModalOpen(false);
                if (selectedMovie) {
                  handleEdit(selectedMovie);
                }
              }}
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
            >
              Редактировать
            </button>
            <button
              onClick={() => {
                setIsViewModalOpen(false);
                setSelectedMovie(null);
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Закрыть
            </button>
          </div>
        }
      >
        {selectedMovie && (
          <div className="space-y-4">
            {/* Постер и основная информация */}
            <div className="flex gap-6">
              <img
                src={getPosterUrl(selectedMovie)}
                alt={getTitle(selectedMovie)}
                className="w-48 h-72 object-cover rounded-lg"
              />
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {getTitle(selectedMovie, "RU")}
                  </h3>
                  <p className="text-gray-400">{getTitle(selectedMovie, "KG")}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400">Жанр</p>
                    <p className="text-white font-medium">{getGenres(selectedMovie)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Длительность</p>
                    <p className="text-white font-medium">{selectedMovie.durationMinutes} мин</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Возрастной рейтинг</p>
                    <p className="text-white font-medium">{selectedMovie.ageRating}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Рейтинг</p>
                    <p className="text-white font-medium flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {getRating(selectedMovie)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Статус</p>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        selectedMovie.status === "now_showing"
                          ? "bg-green-500/20 text-green-400"
                          : selectedMovie.status === "coming_soon"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {selectedMovie.status === "now_showing"
                        ? "В прокате"
                        : selectedMovie.status === "coming_soon"
                        ? "Скоро"
                        : "Архив"}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Дата выхода</p>
                    <p className="text-white font-medium">
                      {new Date(selectedMovie.releaseDate).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                </div>

                {selectedMovie.metadata && (
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-700">
                    <div>
                      <p className="text-xs text-gray-400">Страна</p>
                      <p className="text-white font-medium">{selectedMovie.metadata.country}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Год</p>
                      <p className="text-white font-medium">{selectedMovie.metadata.year}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Описание */}
            <div className="pt-4 border-t border-gray-700">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Описание</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                {selectedMovie.translations.find((t) => t.language === "RU")?.description}
              </p>
            </div>
          </div>
        )}
      </Modal>


      {/* Edit Movie Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMovie(null);
          resetForm();
        }}
        title="Редактировать фильм"
        size="xl"
      >
        <MovieEditForm
          formData={formData}
          posterPreview={posterPreview}
          trailerFile={trailerFile}
          isDraggingPoster={isDraggingPoster}
          isDraggingTrailer={isDraggingTrailer}
          isLoading={isLoading}
          genres={genres}
          onInputChange={handleInputChange}
          onPosterDrop={handlePosterDrop}
          onPosterSelect={handlePosterSelect}
          onTrailerDrop={handleTrailerDrop}
          onTrailerSelect={handleTrailerSelect}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedMovie(null);
            resetForm();
          }}
          setIsDraggingPoster={setIsDraggingPoster}
          setIsDraggingTrailer={setIsDraggingTrailer}
          setPosterFile={setPosterFile}
          setPosterPreview={setPosterPreview}
          setTrailerFile={setTrailerFile}
          // Новые пропсы для S3 загрузки
          posterUrl={posterUrl}
          trailerUrl={trailerUrl}
          onPosterUpload={handlePosterUpload}
          onTrailerUpload={handleTrailerUpload}
          onPosterRemove={handlePosterRemove}
          onTrailerRemove={handleTrailerRemove}
        />
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedMovie(null);
        }}
        title="Подтверждение удаления"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Вы уверены, что хотите удалить фильм{" "}
            <span className="font-bold text-white">
              {selectedMovie && getTitle(selectedMovie, "RU")}
            </span>
            ?
          </p>
          <p className="text-sm text-gray-400">
            Это действие нельзя отменить. Все связанные данные (сеансы, билеты) также будут удалены.
          </p>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedMovie(null);
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
