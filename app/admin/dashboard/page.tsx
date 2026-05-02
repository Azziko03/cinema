import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  // Получаем статистику
  const [usersCount, moviesCount, ordersCount, totalRevenue] = await Promise.all([
    prisma.user.count(),
    prisma.movie.count(),
    prisma.order.count({ where: { status: "paid" } }),
    prisma.order.aggregate({
      where: { status: "paid" },
      _sum: { totalAmount: true },
    }),
  ]);

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Добро пожаловать, {session.user.name}</h2>
        <p className="text-gray-400">Управляйте вашим кинотеатром</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{usersCount}</p>
          <p className="text-sm text-gray-400">Пользователей</p>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{moviesCount}</p>
          <p className="text-sm text-gray-400">Фильмов</p>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{ordersCount}</p>
          <p className="text-sm text-gray-400">Заказов</p>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{totalRevenue._sum.totalAmount?.toNumber() || 0} сом</p>
          <p className="text-sm text-gray-400">Выручка</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-2xl font-bold mb-6">Быстрые действия</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <a
            href="/admin/movies"
            className="group bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-800 hover:border-[#e50914] transition-all text-center"
          >
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors mx-auto">
              <svg
                className="w-6 h-6 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                />
              </svg>
            </div>
            <h4 className="text-lg font-semibold mb-2">Фильмы</h4>
            <p className="text-sm text-gray-400">Управление фильмами</p>
          </a>

          <a
            href="/admin/sessions"
            className="group bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-800 hover:border-[#e50914] transition-all text-center"
          >
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors mx-auto">
              <svg
                className="w-6 h-6 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h4 className="text-lg font-semibold mb-2">Сеансы</h4>
            <p className="text-sm text-gray-400">Расписание показов</p>
          </a>

          <a
            href="/admin/halls"
            className="group bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-800 hover:border-[#e50914] transition-all text-center"
          >
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500/30 transition-colors mx-auto">
              <svg
                className="w-6 h-6 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h4 className="text-lg font-semibold mb-2">Залы</h4>
            <p className="text-sm text-gray-400">Управление залами</p>
          </a>

          <a
            href="/admin/controllers"
            className="group bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-800 hover:border-[#e50914] transition-all text-center"
          >
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-500/30 transition-colors mx-auto">
              <svg
                className="w-6 h-6 text-cyan-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h4 className="text-lg font-semibold mb-2">Контроллеры</h4>
            <p className="text-sm text-gray-400">Управление контроллерами</p>
          </a>

          <a
            href="/admin/users"
            className="group bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-800 hover:border-[#e50914] transition-all text-center"
          >
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500/30 transition-colors mx-auto">
              <svg
                className="w-6 h-6 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h4 className="text-lg font-semibold mb-2">Пользователи</h4>
            <p className="text-sm text-gray-400">Управление пользователями</p>
          </a>
        </div>
      </div>
    </div>
  );
}
