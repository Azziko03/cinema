import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AdminHallsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  const halls = await prisma.hall.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Залы</h2>
          <p className="text-gray-400">Управление залами кинотеатра</p>
        </div>
        <button className="px-6 py-3 bg-[#e50914] hover:bg-[#f40612] text-white font-medium rounded-lg transition-colors">
          + Добавить зал
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {halls.map((hall) => (
          <div
            key={hall.id}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1">{hall.name}</h3>
                <p className="text-sm text-gray-400">{hall.nameKg}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
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
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Вместимость:</span>
                <span className="font-medium">{hall.capacity} мест</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Рядов:</span>
                <span className="font-medium">{hall.rows}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Мест в ряду:</span>
                <span className="font-medium">{hall.seatsPerRow}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors text-sm font-medium">
                Изменить
              </button>
              <button className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm font-medium">
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      {halls.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-600"
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
          <p className="text-gray-400">Залы не найдены</p>
        </div>
      )}
    </div>
  );
}
