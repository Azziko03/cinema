"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [locale, setLocale] = useState<"ru" | "kg">("ru");
  const [translations, setTranslations] = useState<any>(null);
  const [step, setStep] = useState<"login" | "verify">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Загрузка переводов
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const response = await fetch(`/api/translations?locale=${locale}&namespace=auth`);
        const data = await response.json();
        setTranslations(data);
      } catch (err) {
        console.error("Failed to load translations:", err);
      }
    };
    loadTranslations();
  }, [locale]);

  const t = (key: string) => {
    if (!translations) return key;
    const keys = key.split(".");
    let value = translations;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  if (!translations) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="text-white">Загрузка...</div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("errors.loginError"));
      }

      if (data.requiresTwoFactor) {
        setUserId(data.userId);
        setStep("verify");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("admin.invalidCode"));
      }

      // Авторизуем через NextAuth с admin-credentials provider
      const result = await signIn("admin-credentials", {
        userId: data.user.id,
        verified: "true",
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Перенаправляем в админ-панель
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("admin.telegramError"));
      }

      alert(t("admin.codeSent"));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setLocale(locale === "ru" ? "kg" : "ru")}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded transition-colors border border-white/20"
        >
          {locale === "ru" ? "KG" : "RU"}
        </button>
      </div>

      <div className="max-w-md w-full">
        {step === "login" ? (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-8 border border-gray-800">
            <div className="text-center mb-8">
              <h1 className="text-[#e50914] text-3xl font-bold tracking-tight mb-2">
                Cinema Admin
              </h1>
              <p className="text-gray-400">{t("admin.subtitle")}</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("admin.email")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("admin.emailPlaceholder")}
                  required
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e50914] focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("admin.password")}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("admin.passwordPlaceholder")}
                  required
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e50914] focus:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#e50914] hover:bg-[#f40612] disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded transition-colors"
              >
                {loading ? t("admin.submitting") : t("admin.submit")}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-8 border border-gray-800">
            <div className="text-center mb-8">
              <h1 className="text-[#e50914] text-3xl font-bold tracking-tight mb-2">
                {t("admin.verifyTitle")}
              </h1>
              <p className="text-gray-400 mb-2">{t("admin.verifySubtitle")}</p>
              <p className="text-sm text-green-400">{t("admin.codeSent")}</p>
              <p className="text-xs text-gray-500 mt-1">
                {t("admin.codeExpires")}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("admin.code")}
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder={t("admin.codePlaceholder")}
                  maxLength={6}
                  required
                  className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded text-white text-center text-2xl tracking-widest placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e50914] focus:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full py-3 px-4 bg-[#e50914] hover:bg-[#f40612] disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded transition-colors"
              >
                {loading ? t("admin.verifySubmitting") : t("admin.verifySubmit")}
              </button>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
                >
                  {t("admin.resendCode")}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("login");
                    setCode("");
                    setError("");
                  }}
                  className="w-full py-2 px-4 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                >
                  {t("admin.backToLogin")}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
