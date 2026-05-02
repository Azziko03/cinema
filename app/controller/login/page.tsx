"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastContainer";

export default function ControllerLoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("controller-credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        showToast(result.error, "error");
      } else {
        showToast("Вход выполнен успешно", "success");
        router.push("/controller/dashboard");
        router.refresh();
      }
    } catch (error) {
      showToast("Произошла ошибка при входе", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c1321] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#e50914] mb-2">Cinema</h1>
          <p className="text-gray-400">Вход для контроллеров</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#121d2e] border border-gray-700 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 bg-[#0c1321] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#e50914]"
                placeholder="controller@cinema.kg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Пароль
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full px-4 py-3 bg-[#0c1321] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#e50914]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#e50914] hover:bg-[#f40612] text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? "Вход..." : "Войти"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
