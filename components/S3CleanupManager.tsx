"use client";

import { useState } from "react";
import { useToast } from "@/components/ToastContainer";

interface CleanupStats {
  totalS3Files: number;
  totalDbFiles: number;
  unusedFiles: number;
  deletedFiles: number;
  errors: number;
}

interface CleanupResult {
  success: boolean;
  dryRun: boolean;
  stats: CleanupStats;
  unusedFiles: string[];
  deletedFiles: string[];
  errors: string[];
}

export default function S3CleanupManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<CleanupResult | null>(null);
  const { showToast } = useToast();

  const runCleanup = async (dryRun: boolean = true) => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/admin/cleanup-s3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dryRun }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка при очистке S3");
      }

      const result: CleanupResult = await response.json();
      setLastResult(result);

      if (dryRun) {
        showToast(
          `Найдено ${result.stats.unusedFiles} неиспользуемых файлов`,
          result.stats.unusedFiles > 0 ? "warning" : "success"
        );
      } else {
        showToast(
          `Удалено ${result.stats.deletedFiles} файлов`,
          "success"
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ошибка при очистке S3";
      showToast(errorMessage, "error");
      console.error("Cleanup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileTypeFromKey = (key: string): string => {
    if (key.startsWith("posters/")) return "Постер";
    if (key.startsWith("trailers/")) return "Трейлер";
    return "Файл";
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Очистка S3 хранилища</h3>
          <p className="text-gray-400 text-sm">
            Удаление неиспользуемых файлов из облачного хранилища
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => runCleanup(true)}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Сканирование..." : "Сканировать"}
          </button>
          <button
            onClick={() => runCleanup(false)}
            disabled={isLoading || !lastResult || lastResult.stats.unusedFiles === 0}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Удаление..." : "Удалить"}
          </button>
        </div>
      </div>

      {/* Статистика */}
      {lastResult && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-2xl font-bold text-white">{lastResult.stats.totalS3Files}</p>
            <p className="text-xs text-gray-400">Файлов в S3</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-2xl font-bold text-white">{lastResult.stats.totalDbFiles}</p>
            <p className="text-xs text-gray-400">Используется</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-2xl font-bold text-orange-400">{lastResult.stats.unusedFiles}</p>
            <p className="text-xs text-gray-400">Неиспользуемых</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-2xl font-bold text-green-400">{lastResult.stats.deletedFiles}</p>
            <p className="text-xs text-gray-400">Удалено</p>
          </div>
        </div>
      )}

      {/* Список неиспользуемых файлов */}
      {lastResult && lastResult.unusedFiles.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3">
            Неиспользуемые файлы ({lastResult.unusedFiles.length})
          </h4>
          <div className="bg-gray-800/30 rounded-lg max-h-60 overflow-y-auto">
            {lastResult.unusedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border-b border-gray-700 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <div>
                    <p className="text-white text-sm font-medium">{file.split('/').pop()}</p>
                    <p className="text-gray-400 text-xs">{getFileTypeFromKey(file)}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {file}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Список удаленных файлов */}
      {lastResult && lastResult.deletedFiles.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3">
            Удаленные файлы ({lastResult.deletedFiles.length})
          </h4>
          <div className="bg-gray-800/30 rounded-lg max-h-60 overflow-y-auto">
            {lastResult.deletedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border-b border-gray-700 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div>
                    <p className="text-white text-sm font-medium">{file.split('/').pop()}</p>
                    <p className="text-gray-400 text-xs">{getFileTypeFromKey(file)}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  ✅ Удален
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ошибки */}
      {lastResult && lastResult.errors.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-red-400 mb-3">
            Ошибки ({lastResult.errors.length})
          </h4>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            {lastResult.errors.map((error, index) => (
              <p key={index} className="text-red-400 text-sm mb-1 last:mb-0">
                {error}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Предупреждение */}
      <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-yellow-400 text-sm font-medium mb-1">Внимание!</p>
            <p className="text-yellow-300 text-xs">
              Сначала выполните сканирование, чтобы увидеть какие файлы будут удалены. 
              Удаление необратимо - восстановить файлы будет невозможно.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}