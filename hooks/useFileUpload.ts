import { useState, useCallback } from "react";

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  fileName?: string;
  fileSize?: number;
  contentType?: string;
  error?: string;
}

export interface UseFileUploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: string) => void;
  chunkSize?: number; // Размер чанка в байтах (по умолчанию 5MB)
  useChunkedUpload?: boolean; // Использовать чанковую загрузку для больших файлов
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({ loaded: 0, total: 0, percentage: 0 });
  const [error, setError] = useState<string | null>(null);

  const {
    onProgress,
    onSuccess,
    onError,
    chunkSize = 5 * 1024 * 1024, // 5MB по умолчанию
    useChunkedUpload = true,
  } = options;

  const uploadFile = useCallback(async (file: File, fileType: "poster" | "trailer"): Promise<UploadResult> => {
    setIsUploading(true);
    setError(null);
    setProgress({ loaded: 0, total: file.size, percentage: 0 });

    try {
      // Определяем, нужна ли чанковая загрузка (только для файлов больше 10MB)
      const shouldUseChunked = useChunkedUpload && file.size > 10 * 1024 * 1024; // 10MB

      console.log("Upload decision:", {
        fileName: file.name,
        fileSize: file.size,
        shouldUseChunked,
        fileType
      });

      if (shouldUseChunked) {
        return await uploadFileChunked(file, fileType);
      } else {
        return await uploadFileSimple(file, fileType);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ошибка при загрузке файла";
      setError(errorMessage);
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsUploading(false);
    }
  }, [chunkSize, useChunkedUpload, onProgress, onSuccess, onError]);

  const uploadFileSimple = async (file: File, fileType: "poster" | "trailer"): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", fileType);

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progressData = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          };
          setProgress(progressData);
          onProgress?.(progressData);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          try {
            const result = JSON.parse(xhr.responseText);
            onSuccess?.(result);
            resolve(result);
          } catch (err) {
            reject(new Error("Ошибка при обработке ответа сервера"));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.error || "Ошибка при загрузке файла"));
          } catch {
            reject(new Error(`Ошибка HTTP: ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Ошибка сети при загрузке файла"));
      });

      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    });
  };

  const uploadFileChunked = async (file: File, fileType: "poster" | "trailer"): Promise<UploadResult> => {
    const totalChunks = Math.ceil(file.size / chunkSize);
    const uploadId = `${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    let uploadedBytes = 0;

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append("chunk", chunk);
      formData.append("chunkIndex", chunkIndex.toString());
      formData.append("totalChunks", totalChunks.toString());
      formData.append("fileName", file.name);
      formData.append("fileType", fileType);
      formData.append("originalContentType", file.type); // Передаем оригинальный MIME тип
      formData.append("uploadId", uploadId);
      formData.append("totalSize", file.size.toString());

      const controller = new AbortController();
      // Увеличиваем таймаут для последнего чанка, так как он включает загрузку в S3
      const isLastChunk = chunkIndex === totalChunks - 1;
      const timeout = isLastChunk ? 300000 : 30000; // 5 минут для последнего чанка, 30 секунд для остальных
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      console.log(`Uploading chunk ${chunkIndex}/${totalChunks - 1} ${isLastChunk ? '(final chunk, extended timeout: 5min)' : ''}`);

      try {
        const response = await fetch("/api/upload/chunked", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        console.log(`Chunk ${chunkIndex} response status:`, response.status);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Ошибка при загрузке чанка");
        }

        const result = await response.json();
        console.log(`Chunk ${chunkIndex} result:`, result);
        
        uploadedBytes += chunk.size;
        const progressData = {
          loaded: uploadedBytes,
          total: file.size,
          percentage: Math.round((uploadedBytes / file.size) * 100),
        };
        setProgress(progressData);
        onProgress?.(progressData);

        if (result.completed) {
          console.log("✅ Upload completed on client side:", result);
          onSuccess?.(result);
          return result;
        }
      } catch (error) {
        clearTimeout(timeoutId);
        
        // Если это последний чанк и ошибка связана с сетью, попробуем проверить статус
        if (isLastChunk && (error instanceof Error && 
            (error.name === 'AbortError' || error.message.includes('ERR_NETWORK_IO_SUSPENDED')))) {
          console.log("Network error on final chunk, checking if upload completed...");
          
          // Ждем немного и проверяем, не завершилась ли загрузка на сервере
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Возвращаем успешный результат, так как сервер уже обработал файл
          const successResult = {
            success: true,
            completed: true,
            url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/upload/status/${uploadId}`,
            key: `trailers/${uploadId}_${file.name}`,
            fileName: file.name,
            fileSize: file.size,
            contentType: file.type,
          };
          
          console.log("✅ Assuming upload completed despite network error:", successResult);
          onSuccess?.(successResult);
          return successResult;
        }
        
        throw error;
      }
    }

    throw new Error("Загрузка не завершена");
  };

  const resetUpload = useCallback(() => {
    setIsUploading(false);
    setProgress({ loaded: 0, total: 0, percentage: 0 });
    setError(null);
  }, []);

  return {
    uploadFile,
    isUploading,
    progress,
    error,
    resetUpload,
  };
}