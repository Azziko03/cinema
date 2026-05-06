"use client";

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
    rating: string;
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
}: MovieEditFormProps) {
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

      {/* Страна, Год, Рейтинг */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Рейтинг
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              name="rating"
              value={formData.rating}
              onChange={onInputChange}
              min="0"
              max="10"
              step="0.1"
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#e50914]"
            />
            <div className="flex items-center gap-1 min-w-[50px]">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-white text-sm font-medium">{formData.rating}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Постер и Трейлер */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Постер */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Постер <span className="text-red-500">*</span>
          </label>
          <div
            onDrop={onPosterDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingPoster(true);
            }}
            onDragLeave={() => setIsDraggingPoster(false)}
            className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
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
                  className="max-h-40 mx-auto rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPosterFile(null);
                    setPosterPreview("");
                  }}
                  className="absolute top-1 right-1 p-1.5 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <svg
                  className="w-8 h-8 mx-auto mb-2 text-gray-500"
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
                <p className="text-gray-400 text-xs mb-1">
                  Перетащите или{" "}
                  <label className="text-[#e50914] hover:text-[#f40612] cursor-pointer">
                    выберите
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onPosterSelect}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-500">PNG, JPG до 10MB</p>
              </>
            )}
          </div>
        </div>

        {/* Трейлер */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Трейлер (опционально)
          </label>
          <div
            onDrop={onTrailerDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingTrailer(true);
            }}
            onDragLeave={() => setIsDraggingTrailer(false)}
            className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
              isDraggingTrailer
                ? "border-[#e50914] bg-[#e50914]/10"
                : "border-gray-700 bg-gray-800/50"
            }`}
          >
            {trailerFile ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-[#e50914]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-white text-xs font-medium truncate max-w-[120px]">{trailerFile.name}</p>
                    <p className="text-xs text-gray-400">
                      {(trailerFile.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTrailerFile(null)}
                  className="p-1.5 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <svg
                  className="w-8 h-8 mx-auto mb-2 text-gray-500"
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
                <p className="text-gray-400 text-xs mb-1">
                  Перетащите или{" "}
                  <label className="text-[#e50914] hover:text-[#f40612] cursor-pointer">
                    выберите
                    <input
                      type="file"
                      accept="video/*"
                      onChange={onTrailerSelect}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-500">MP4, MOV до 100MB</p>
              </>
            )}
          </div>
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
