"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    Configuration: "Ошибка конфигурации сервера",
    AccessDenied: "Доступ запрещен",
    Verification: "Ошибка верификации",
    OAuthSignin: "Ошибка при входе через OAuth",
    OAuthCallback: "Ошибка обратного вызова OAuth",
    OAuthCreateAccount: "Не удалось создать аккаунт OAuth",
    EmailCreateAccount: "Не удалось создать аккаунт",
    Callback: "Ошибка обратного вызова",
    OAuthAccountNotLinked: "Email уже используется с другим провайдером",
    EmailSignin: "Ошибка при отправке email",
    CredentialsSignin: "Неверный email или пароль",
    SessionRequired: "Требуется авторизация",
    Default: "Произошла ошибка при авторизации",
  };

  const message = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-gray-700 text-center">
        <div>
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10 border border-red-500">
            <svg
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-white">
            Ошибка авторизации
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {message}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Link
            href="/auth/signin"
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
          >
            Попробовать снова
          </Link>
          <Link
            href="/"
            className="w-full flex justify-center py-3 px-4 border border-gray-600 text-sm font-medium rounded-lg text-white bg-gray-700/50 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-white">Загрузка...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
