"use client";

import FileUpload from "@/components/FileUpload";
import { useToast } from "@/components/ToastContainer";

interface MovieEditFormProps {
  formData: {
    title: string;
    description: string;
    genre: string;
    customGenre: string;
    durationMinutes: string;
    ageRating: string;
    status: string;
    releaseDate: string;
    country: string;
    year: string;
  };
  posterPreview: string;
  trailerFile: File | null;
  isDraggingPoster: boolean;
  isDraggingTrailer: boolean;
  isLoading: boolean;
  genres: string[];
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onPosterDrop: (e: React.DragEvent) => void;
  onPosterSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTrailerDrop: (e: React.DragEvent) => void;
  onTrailerSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  setIsDraggingPoster: (value: boolean) => void;
  setIsDraggingTrailer: (value: boolean) => void;
  setPosterFile: (file: File | null) => void;
  setPosterPreview: (url: string) => void;
  setTrailerFile: (file: File | null) => void;
  // Новые пропсы для S3 загрузки
  posterUrl: string;
  trailerUrl: string;
  onPosterUpload: (url: string, key: string) => void;
  onTrailerUpload: (url: string, key: string) => void;
  onPosterRemove: () => void;
  onTrailerRemove: () => void;
}

export default function MovieEditForm({
  formData,
  posterPreview,
  trailerFile,
  isDraggingPoster,
  isDraggingTrailer,
  isLoading,
  genres,
  onInputChange,
  onPosterDrop,
  onPosterSelect,
  onTrailerDrop,
  onTrailerSelect,
  onSubmit,
  onCancel,
  setIsDraggingPoster,
  setIsDraggingTrailer,
  setPosterFile,
  setPosterPreview,
  setTrailerFile,
  // Новые пропсы для S3 загрузки
  posterUrl,
  trailerUrl,
  onPosterUpload,
  onTrailerUpload,
  onPosterRemove,
  onTrailerRemove,
}: MovieEditFormProps) {
  const { showToast } = useToast();
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Название и Описание */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Название <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={onInputChange}
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#e50914] transition-colors"
            placeholder="Введите название фильма"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Описание <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onInputChange}
            required
            rows={3}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#e50914] transition-colors resize-none"
            placeholder="Введите описание фильма"
          />
        </div>
      </div>

      {/* Жанр */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Жанр <span className="text-red-500">*</span>
          </label>
          <select
            name="genre"
            value={formData.genre}
            onChange={onInputChange}
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#e50914] transition-colors"
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
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Укажите жанр <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="customGenre"
              value={formData.customGenre}
              onChange={onInputChange}
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#e50914] transition-colors"
              placeholder="Введите название жанра"
            />
          </div>
        )}
      </div>

      {/* Длительность, Возрастной рейтинг, Статус, Дата */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Длительность (мин) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="durationMinutes"
            value={formData.durationMinutes}
            onChange={onInputChange}
            onWheel={(e) => e.currentTarget.blur()}
            required
            min="1"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#e50914] transition-colors"
            placeholder="120"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Возраст <span className="text-red-500">*</span>
          </label>
          <select
            name="ageRating"
            value={formData.ageRating}
            onChange={onInputChange}
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#e50914] transition-colors"
          >
            <option value="">Выбрать</option>
            <option value="0+">0+</option>
            <option value="6+">6+</option>
            <option value="12+">12+</option>
            <option value="14+">14+</option>
            <option value="16+">16+</option>
            <option value="18+">18+</option>
            <option value="21+">21+</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Статус <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={onInputChange}
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#e50914] transition-colors"
          >
            <option value="now_showing">В прокате</option>
            <option value="coming_soon">Скоро</option>
            <option value="archived">Архив</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Дата выхода <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="releaseDate"
            value={formData.releaseDate}
            onChange={onInputChange}
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#e50914] transition-colors"
          />
        </div>
      </div>

      {/* Страна, Год */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Страна <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={onInputChange}
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#e50914] transition-colors"
            placeholder="США"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Год <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={onInputChange}
            onWheel={(e) => e.currentTarget.blur()}
            required
            min="1900"
            max="2100"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#e50914] transition-colors"
            placeholder="2024"
          />
        </div>
      </div>

      {/* Постер и Трейлер */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Постер */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Постер <span className="text-red-500">*</span>
          </label>
          <FileUpload
            type="poster"
            currentFile={posterUrl}
            onUploadSuccess={onPosterUpload}
            onUploadError={(error) => showToast(error, "error")}
            onRemove={onPosterRemove}
            disabled={isLoading}
          />
        </div>

        {/* Трейлер */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Трейлер (опционально)
          </label>
          <FileUpload
            type="trailer"
            currentFile={trailerUrl}
            onUploadSuccess={onTrailerUpload}
            onUploadError={(error) => showToast(error, "error")}
            onRemove={onTrailerRemove}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Кнопки */}
      <div className="flex justify-end gap-3 pt-3 border-t border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
          disabled={isLoading}
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2 bg-[#e50914] hover:bg-[#f40612] text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Сохранение..." : "Сохранить"}
        </button>
      </div>
    </form>
  );
}
