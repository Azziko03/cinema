import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AdminSessionsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  const sessions = await prisma.session.findMany({
    include: {
      movie: true,
      hall: true,
    },
    orderBy: { startTime: "asc" },
    take: 20,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Сеансы</h2>
          <p className="text-gray-400">Управление расписанием показов</p>
        </div>
        <button className="px-6 py-3 bg-[#e50914] hover:bg-[#f40612] text-white font-medium rounded-lg transition-colors">
          + Добавить сеанс
        </button>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Фильм</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Зал</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Дата и время</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Цена</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Занято мест</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={s.movie.posterUrl || "/placeholder.jpg"}
                        alt={s.movie.title}
                        className="w-10 h-14 object-cover rounded"
                      />
                      <span className="font-medium">{s.movie.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{s.hall.name}</td>
                  <td className="px-6 py-4 text-sm">
                    <div>
                      <p className="font-medium">
                        {new Date(s.startTime).toLocaleDateString("ru-RU")}
                      </p>
                      <p className="text-gray-400">
                        {new Date(s.startTime).toLocaleTimeString("ru-RU", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{s.price} сом</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2 max-w-[100px]">
                        <div
                          className="bg-[#e50914] h-2 rounded-full"
                          style={{
                            width: `${(s.bookedSeats / s.hall.capacity) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-400">
                        {s.bookedSeats}/{s.hall.capacity}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-400 hover:text-blue-300 mr-3">Изменить</button>
                    <button className="text-red-400 hover:text-red-300">Удалить</button>
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
