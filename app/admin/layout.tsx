"use client";

import { SessionProvider } from "next-auth/react";
import { useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [locale, setLocale] = useState<"ru" | "kg">("ru");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Если это страница логина, не показываем layout
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Проверка авторизации
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050a12]">
        <div className="text-white">Загрузка...</div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  const menuItems = [
    {
      name: "Дашборд",
      nameKg: "Башкы бет",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      href: "/admin/dashboard",
    },
    {
      name: "Фильмы",
      nameKg: "Кинолор",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      ),
      href: "/admin/movies",
    },
    {
      name: "Сеансы",
      nameKg: "Сеанстар",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      href: "/admin/sessions",
    },
    {
      name: "Залы",
      nameKg: "Залдар",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      href: "/admin/halls",
    },
    {
      name: "Контроллеры",
      nameKg: "Контроллерлер",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      href: "/admin/controllers",
    },
    {
      name: "Пользователи",
      nameKg: "Колдонуучулар",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      href: "/admin/users",
    },
  ];

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Простой поиск по меню
    const results = menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.nameKg.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
    setShowSearchResults(true);
  };

  const bgClass = theme === "dark" ? "bg-[#0c1321]" : "bg-white";
  const textClass = theme === "dark" ? "text-white" : "text-gray-900";
  const borderClass = theme === "dark" ? "border-gray-800" : "border-gray-200";
  const cardBgClass = theme === "dark" ? "bg-[#121d2e]" : "bg-gray-100";

  return (
    <div className={`min-h-screen ${bgClass} ${textClass}`}>
      {/* Header - Full Width */}
      <header className={`fixed top-0 left-0 right-0 z-50 ${theme === "dark" ? "bg-[#121d2e]/95" : "bg-gray-50"} backdrop-blur-sm border-b ${borderClass}`}>
        <div className="h-20 px-6 flex items-center justify-between">
          {/* Left: Logo */}
          <h1 className="text-[#e50914] text-2xl font-bold tracking-tight">Cinema Admin</h1>

          {/* Center: Search */}
          <div className="flex-1 max-w-2xl mx-8 relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                placeholder={locale === "ru" ? "Поиск..." : "Издөө..."}
                className={`w-full px-4 py-2 pl-10 ${cardBgClass} border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e50914]`}
              />
              <svg
                className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className={`absolute top-full mt-2 w-full ${cardBgClass} border ${borderClass} rounded-lg shadow-xl overflow-hidden`}>
                {searchResults.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      setShowSearchResults(false);
                      setSearchQuery("");
                    }}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-[#e50914]/10 transition-colors`}
                  >
                    {item.icon}
                    <span>{locale === "ru" ? item.name : item.nameKg}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right: Theme + Language + User */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`p-2 rounded-lg hover:${cardBgClass} transition-colors`}
              title={theme === "dark" ? "Светлая тема" : "Темная тема"}
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => setLocale(locale === "ru" ? "kg" : "ru")}
              className={`px-3 py-2 rounded-lg hover:${cardBgClass} transition-colors font-medium text-sm`}
            >
              {locale === "ru" ? "RU" : "KG"}
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-700">
              <span className="text-sm hidden sm:block">{session.user.name}</span>
              <form
                action={async () => {
                  const { signOut } = await import("next-auth/react");
                  await signOut({ callbackUrl: "/admin/login" });
                }}
              >
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#e50914] hover:bg-[#f40612] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {locale === "ru" ? "Выйти" : "Чыгуу"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="pt-20">
        {/* Sidebar */}
        <aside className={`fixed left-6 top-28 bottom-4 w-56 z-40 ${cardBgClass} border ${borderClass} rounded-2xl`}>
          <nav className="p-4 space-y-2 mt-3">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-[#e50914] text-white"
                      : `hover:${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{locale === "ru" ? item.name : item.nameKg}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="pt-8 ml-72 mr-6 pb-4">
          {children}
        </main>
      </div>

      {/* Click outside to close search results */}
      {showSearchResults && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowSearchResults(false)}
        />
      )}
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SessionProvider>
  );
}
