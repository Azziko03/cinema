import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Пользователи</h2>
          <p className="text-gray-400">Управление пользователями системы</p>
        </div>
        <button className="px-6 py-3 bg-[#e50914] hover:bg-[#f40612] text-white font-medium rounded-lg transition-colors">
          + Добавить пользователя
        </button>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Пользователь</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Роль</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Статус</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Дата регистрации</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {user.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{user.fullName}</p>
                        {user.googleId && (
                          <p className="text-xs text-gray-400">Google аккаунт</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === "admin"
                          ? "bg-purple-500/20 text-purple-400"
                          : user.role === "controller"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {user.role === "admin"
                        ? "Администратор"
                        : user.role === "controller"
                        ? "Контроллер"
                        : "Пользователь"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        user.status === "active"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {user.status === "active" ? "Активен" : "Заблокирован"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-400 hover:text-blue-300 mr-3">
                      Изменить
                    </button>
                    {user.status === "active" ? (
                      <button className="text-red-400 hover:text-red-300">
                        Заблокировать
                      </button>
                    ) : (
                      <button className="text-green-400 hover:text-green-300">
                        Разблокировать
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
