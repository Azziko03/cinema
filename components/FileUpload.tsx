"use client";

import { useState, useRef, useCallback } from "react";
import { useFileUpload, UploadProgress } from "@/hooks/useFileUpload";

interface FileUploadProps {
  type: "poster" | "trailer";
  onUploadSuccess: (url: string, key: string) => void;
  onUploadError?: (error: string) => void;
  currentFile?: string;
  onRemove?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function FileUpload({
  type,
  onUploadSuccess,
  onUploadError,
  currentFile,
  onRemove,
  className = "",
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string>(currentFile || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, isUploading, progress, error } = useFileUpload({
    chunkSize: 1 * 1024 * 1024, // Уменьшаем до 1MB для отладки
    onProgress: (progress: UploadProgress) => {
      // Прогресс обновляется автоматически через хук
    },
    onSuccess: (result) => {
      console.log("FileUpload: Upload success callback triggered", result);
      if (result.url && result.key) {
        setPreview(result.url);
        onUploadSuccess(result.url, result.key);
      }
    },
    onError: (error) => {
      console.error("FileUpload: Upload error callback triggered", error);
      onUploadError?.(error);
    },
  });

  const handleFileSelect = useCallback(async (file: File) => {
    if (disabled || isUploading) return;

    // Валидация типа файла на клиенте
    const isValidType = type === "poster" 
      ? file.type.startsWith("image/")
      : file.type.startsWith("video/");

    if (!isValidType) {
      const expectedType = type === "poster" ? "изображение" : "видео";
      onUploadError?.(`Пожалуйста, выберите файл ${expectedType}`);
      return;
    }

    // Валидация размера файла
    const maxSize = type === "poster" ? 10 : 200; // MB
    const maxSizeBytes = maxSize * 1024 * 1024;
    
    if (file.size > maxSizeBytes) {
      onUploadError?.(`Размер файла не должен превышать ${maxSize}MB`);
      return;
    }

    // Создаем превью для изображений
    if (type === "poster" && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else if (type === "trailer") {
      setPreview("uploading"); // Специальное значение для индикации загрузки видео
    }

    try {
      // Начинаем загрузку
      await uploadFile(file, type);
    } catch (error) {
      // Сбрасываем превью в случае ошибки
      setPreview(currentFile || "");
      console.error("Upload error:", error);
    }
  }, [type, disabled, isUploading, uploadFile, onUploadError, onUploadSuccess, currentFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, isUploading, handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleRemove = useCallback(() => {
    setPreview("");
    onRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onRemove]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getAcceptedTypes = () => {
    return type === "poster" ? "image/*" : "video/*";
  };

  const getMaxSize = () => {
    return type === "poster" ? "10MB" : "200MB";
  };

  const getFileTypeText = () => {
    return type === "poster" ? "изображение" : "видео";
  };

  return (
    <div className={`relative ${className}`}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 min-h-[160px] flex items-center justify-center
          ${isDragging && !disabled && !isUploading
            ? "border-[#e50914] bg-[#e50914]/10"
            : "border-gray-700 bg-gray-800/50"
          }
          ${disabled || isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        {/* Прогресс загрузки */}
        {isUploading && (
          <div className="absolute inset-0 bg-gray-900/80 rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-sm font-medium mb-2">
                {progress.percentage >= 99 && type === "trailer" 
                  ? "Загрузка в облако..." 
                  : "Загрузка..."
                }
              </p>
              <p className="text-gray-400 text-xs mb-3">
                {progress.percentage >= 99 && type === "trailer" 
                  ? "Это может занять несколько минут для больших файлов"
                  : `${progress.percentage}% (${formatFileSize(progress.loaded)} / ${formatFileSize(progress.total)})`
                }
              </p>
              {progress.percentage < 99 && (
                <div className="w-48 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-[#e50914] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Превью файла */}
        {preview && type === "poster" && !isUploading && (
          <div className="relative">
            <img
              src={preview}
              alt="Предпросмотр"
              className="max-h-40 mx-auto rounded"
            />
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="absolute top-1 right-1 p-1.5 bg-red-500 hover:bg-red-600 rounded-full transition-colors disabled:opacity-50"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Информация о загруженном видео */}
        {preview && preview !== "uploading" && type === "trailer" && !isUploading && (
          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-[#e50914]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              <div className="text-left">
                <p className="text-white text-sm font-medium">Трейлер загружен</p>
                <p className="text-xs text-gray-400">Видео файл успешно загружен</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Зона загрузки */}
        {(!preview || preview === "uploading") && !isUploading && (
          <div className="flex flex-col items-center justify-center">
            <svg
              className="w-10 h-10 mx-auto mb-3 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {type === "poster" ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              )}
            </svg>
            <p className="text-gray-400 text-sm mb-2">
              Перетащите или{" "}
              <label className="text-[#e50914] hover:text-[#f40612] cursor-pointer">
                выберите {getFileTypeText()}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={getAcceptedTypes()}
                  onChange={handleInputChange}
                  disabled={disabled || isUploading}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-xs text-gray-500">
              {type === "poster" ? "PNG, JPG" : "MP4, MOV"} до {getMaxSize()}
            </p>
          </div>
        )}

        {/* Ошибка */}
        {error && (
          <div className="mt-3 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}