"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateControllerPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/controllers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка при создании контроллера");
      }

      router.push("/admin/controllers");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/controllers" className="text-gray-400 hover:text-white transition-colors text-sm">
          ← Назад к списку
        </Link>
        <p className="text-gray-400 mt-4">Создайте нового контроллера для управления билетами</p>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-8 border border-gray-800 max-w-2xl">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Полное имя
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Иван Иванов"
              required
              className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e50914] focus:border-transparent transition-all"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-[#e50914] hover:bg-[#f40612] disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded transition-colors"
            >
              {loading ? "Создание..." : "Создать контроллера"}
            </button>
            <Link
              href="/admin/controllers"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded transition-colors text-center"
            >
              Отмена
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
