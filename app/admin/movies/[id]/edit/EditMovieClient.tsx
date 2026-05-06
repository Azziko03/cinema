"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

interface EditMovieClientProps {
  movie: Movie;
}

export default function EditMovieClient({ movie }: EditMovieClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const getTitle = (lang: string = "RU") => {
    const translation = movie.translations.find((t) => t.language === lang);
    return translation?.title || "";
  };

  const getDescription = (lang: string = "RU") => {
    const translation = movie.translations.find((t) => t.language === lang);
    return translation?.description || "";
  };

  const getGenre = () => {
    const genre = movie.genres[0]?.genre.translations.find((t) => t.language === "RU");
    return genre?.title || "";
  };

  const getPosterUrl = () => {
    const poster = movie.mediaFiles.find((m) => m.type === "poster");
    return poster?.url || "";
  };

  const getTrailerUrl = () => {
    const trailer = movie.mediaFiles.find((m) => m.type === "trailer");
    return trailer?.url || "";
  };

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
    rating: "5.0",
  });

  // Инициализируем форму после загрузки данных
  useEffect(() => {
    setFormData({
      title: getTitle(),
      description: getDescription(),
      genre: getGenre(),
      customGenre: "",
      durationMinutes: movie.durationMinutes.toString(),
      ageRating: movie.ageRating,
      status: movie.status,
      releaseDate: new Date(movie.releaseDate).toISOString().split("T")[0],
      country: movie.metadata?.country || "",
      year: movie.metadata?.year.toString() || "",
      rating: (movie.metadata?.imdbRating || 5.0).toString(),
    });
    setPosterPreview(getPosterUrl());
  }, [movie]);

  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [trailerFile, setTrailerFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string>("");
  const [isDraggingPoster, setIsDraggingPoster] = useState(false);
  const [isDraggingTrailer, setIsDraggingTrailer] = useState(false);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePosterDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPoster(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setPosterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePosterSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPosterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTrailerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingTrailer(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      setTrailerFile(file);
    }
  };

  const handleTrailerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTrailerFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const posterUrl = posterPreview || "";
      const trailerUrl = trailerFile ? URL.createObjectURL(trailerFile) : getTrailerUrl();

      const finalGenre = formData.genre === "Другое" ? formData.customGenre : formData.genre;

      const dataToSend = {
        ...formData,
        genre: finalGenre,
        posterUrl,
        trailerUrl,
      };

      const response = await fetch(`/api/admin/movies/${movie.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        showToast("Фильм успешно обновлен", "success");
        router.push("/admin/movies");
        router.refresh();
      } else {
        const data = await response.json();
        showToast(data.error || "Ошибка при обновлении фильма", "error");
      }
    } catch (error) {
      showToast("Ошибка при обновлении фильма", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Назад
        </button>
        <h2 className="text-3xl font-bold mb-2">Редактировать фильм</h2>
        <p className="text-gray-400">Обновите информацию о фильме</p>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Название */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Название <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#e50914] transition-colors"
              placeholder="Введите название фильма"
            />
          </div>

          {/* Описание */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Описание <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#e50914] transition-colors resize-none"
              placeholder="Введите описание фильма"
            />
          </div>

          {/* Жанр */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Жанр <span className="text-red-500">*</span>
            </label>
            <select
              name="genre"
              value={formData.genre}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#e50914] transition-colors"
            >
              <option value="">Выберите жанр</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          {formData.genre === "Другое" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Укажите жанр <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="customGenre"
                value={formData.customGenre}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#e50914] transition-colors"
                placeholder="Введите название жанра"
              />
            </div>
          )}

          {/* Длительность, Возрастной рейтинг */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Длительность (мин) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="durationMinutes"
                value={formData.durationMinutes}
                onChange={handleInputChange}
                required
                min="1"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#e50914] transition-colors"
                placeholder="120"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Возрастной рейтинг <span className="text-red-500">*</span>
              </label>
              <select
                name="ageRating"
                value={formData.ageRating}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#e50914] transition-colors"
              >
                <option value="">Выберите</option>
                <option value="0+">0+ (Для всех)</option>
                <option value="6+">6+ (Детям старше 6 лет)</option>
                <option value="12+">12+ (Детям старше 12 лет)</option>
                <option value="14+">14+ (Детям старше 14 лет)</option>
                <option value="16+">16+ (Детям старше 16 лет)</option>
                <option value="18+">18+ (Только для взрослых)</option>
                <option value="21+">21+ (Только для взрослых 21+)</option>
              </select>
            </div>
          </div>

          {/* Статус, Дата выхода */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Статус <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#e50914] transition-colors"
              >
                <option value="now_showing">В прокате</option>
                <option value="coming_soon">Скоро</option>
                <option value="archived">Архив</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Дата выхода <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#e50914] transition-colors"
              />
            </div>
          </div>

          {/* Страна, Год */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Страна <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#e50914] transition-colors"
                placeholder="США"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Год <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                required
                min="1900"
                max="2100"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#e50914] transition-colors"
                placeholder="2024"
              />
            </div>
          </div>

          {/* Рейтинг */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Рейтинг
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                min="0"
                max="10"
                step="0.1"
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#e50914]"
              />
              <div className="flex items-center gap-1 min-w-[60px]">
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-white font-medium">{formData.rating}</span>
              </div>
            </div>
          </div>

          {/* Постер */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Постер <span className="text-red-500">*</span>
            </label>
            <div
              onDrop={handlePosterDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingPoster(true);
              }}
              onDragLeave={() => setIsDraggingPoster(false)}
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDraggingPoster
                  ? "border-[#e50914] bg-[#e50914]/10"
                  : "border-gray-700 bg-gray-800/50"
              }`}
            >
              {posterPreview ? (
                <div className="relative">
                  <img
                    src={posterPreview}
                    alt="Предпросмотр постера"
                    className="max-h-64 mx-auto rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPosterFile(null);
                      setPosterPreview("");
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <svg
                    className="w-12 h-12 mx-auto mb-3 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-400 mb-2">
                    Перетащите изображение сюда или{" "}
                    <label className="text-[#e50914] hover:text-[#f40612] cursor-pointer">
                      выберите файл
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePosterSelect}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, WEBP до 10MB</p>
                </>
              )}
            </div>
          </div>

          {/* Трейлер */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Трейлер (опционально)
            </label>
            <div
              onDrop={handleTrailerDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingTrailer(true);
              }}
              onDragLeave={() => setIsDraggingTrailer(false)}
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDraggingTrailer
                  ? "border-[#e50914] bg-[#e50914]/10"
                  : "border-gray-700 bg-gray-800/50"
              }`}
            >
              {trailerFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="w-8 h-8 text-[#e50914]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                    <div className="text-left">
                      <p className="text-white font-medium">{trailerFile.name}</p>
                      <p className="text-xs text-gray-400">
                        {(trailerFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTrailerFile(null)}
                    className="p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <svg
                    className="w-12 h-12 mx-auto mb-3 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-gray-400 mb-2">
                    Перетащите видео сюда или{" "}
                    <label className="text-[#e50914] hover:text-[#f40612] cursor-pointer">
                      выберите файл
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleTrailerSelect}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-xs text-gray-500">MP4, MOV, AVI до 100MB</p>
                </>
              )}
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              disabled={isLoading}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-[#e50914] hover:bg-[#f40612] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Сохранение..." : "Сохранить изменения"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
