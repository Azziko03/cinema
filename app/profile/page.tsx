import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { User, Mail, Calendar, Shield } from "lucide-react";

export default async function ProfilePage() {
  const currentUser = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      status: true,
      googleId: true,
      image: true,
      createdAt: true,
      _count: {
        select: {
          orders: true,
        },
      },
    },
  });

  if (!user) {
    return <div>Пользователь не найден</div>;
  }

  const roleLabels = {
    admin: "Администратор",
    user: "Пользователь",
    controller: "Контроллер",
  };

  const statusLabels = {
    active: "Активен",
    inactive: "Неактивен",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12">
            <div className="flex items-center gap-6">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.fullName}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-gray-800 font-bold text-3xl border-4 border-white shadow-lg">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-white">{user.fullName}</h1>
                <p className="text-blue-100 mt-1">{user.email}</p>
                <div className="flex gap-2 mt-3">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full">
                    {roleLabels[user.role]}
                  </span>
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    user.status === "active" 
                      ? "bg-green-500/20 text-green-300" 
                      : "bg-red-500/20 text-red-300"
                  }`}>
                    {statusLabels[user.status]}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            <h2 className="text-xl font-semibold text-white mb-6">Информация о профиле</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-4 bg-gray-700/30 rounded-lg">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Полное имя</p>
                  <p className="text-white font-medium mt-1">{user.fullName}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-700/30 rounded-lg">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Mail className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white font-medium mt-1">{user.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-700/30 rounded-lg">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Дата регистрации</p>
                  <p className="text-white font-medium mt-1">
                    {new Date(user.createdAt).toLocaleDateString("ru-RU", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-700/30 rounded-lg">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Shield className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Роль</p>
                  <p className="text-white font-medium mt-1">{roleLabels[user.role]}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8 pt-8 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Статистика</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-gray-400">Всего заказов</p>
                  <p className="text-3xl font-bold text-white mt-2">{user._count.orders}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg">
                  <p className="text-sm text-gray-400">Метод входа</p>
                  <p className="text-lg font-semibold text-white mt-2">
                    {user.googleId ? "Google" : "Email"}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-gray-400">Статус аккаунта</p>
                  <p className="text-lg font-semibold text-white mt-2">
                    {statusLabels[user.status]}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
