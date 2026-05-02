import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AdminMoviesPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  const movies = await prisma.movie.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Фильмы</h2>
          <p className="text-gray-400">Управление фильмами в кинотеатре</p>
        </div>
        <button className="px-6 py-3 bg-[#e50914] hover:bg-[#f40612] text-white font-medium rounded-lg transition-colors">
          + Добавить фильм
        </button>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Название</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Жанр</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Длительность</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Рейтинг</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Статус</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {movies.map((movie) => (
                <tr key={movie.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={movie.posterUrl || "/placeholder.jpg"}
                        alt={movie.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{movie.title}</p>
                        <p className="text-sm text-gray-400">{movie.titleKg}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{movie.genre}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{movie.duration} мин</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-sm">
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {movie.rating}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      movie.status === "active" 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-gray-500/20 text-gray-400"
                    }`}>
                      {movie.status === "active" ? "Активен" : "Неактивен"}
                    </span>
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
