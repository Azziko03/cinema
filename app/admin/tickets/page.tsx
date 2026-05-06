"use client";

export default function TicketsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Билеты</h1>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Экспорт
          </button>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            Фильтры
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#121d2e] p-6 rounded-lg border border-gray-800">
          <h3 className="text-lg font-semibold mb-2">Всего билетов</h3>
          <p className="text-3xl font-bold text-blue-400">1,234</p>
          <p className="text-sm text-gray-400 mt-1">За все время</p>
        </div>
        <div className="bg-[#121d2e] p-6 rounded-lg border border-gray-800">
          <h3 className="text-lg font-semibold mb-2">Оплачено</h3>
          <p className="text-3xl font-bold text-green-400">1,156</p>
          <p className="text-sm text-gray-400 mt-1">93.7%</p>
        </div>
        <div className="bg-[#121d2e] p-6 rounded-lg border border-gray-800">
          <h3 className="text-lg font-semibold mb-2">Использовано</h3>
          <p className="text-3xl font-bold text-purple-400">987</p>
          <p className="text-sm text-gray-400 mt-1">85.4%</p>
        </div>
        <div className="bg-[#121d2e] p-6 rounded-lg border border-gray-800">
          <h3 className="text-lg font-semibold mb-2">Отменено</h3>
          <p className="text-3xl font-bold text-red-400">78</p>
          <p className="text-sm text-gray-400 mt-1">6.3%</p>
        </div>
      </div>

      <div className="bg-[#121d2e] rounded-lg border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold">Список билетов</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4">ID</th>
                  <th className="text-left py-3 px-4">Фильм</th>
                  <th className="text-left py-3 px-4">Зал</th>
                  <th className="text-left py-3 px-4">Место</th>
                  <th className="text-left py-3 px-4">Дата</th>
                  <th className="text-left py-3 px-4">Статус</th>
                  <th className="text-left py-3 px-4">QR-код</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-800/50">
                  <td className="py-3 px-4">#12345</td>
                  <td className="py-3 px-4">Аватар 3</td>
                  <td className="py-3 px-4">Зал 1</td>
                  <td className="py-3 px-4">Ряд 5, Место 12</td>
                  <td className="py-3 px-4">06.05.2026 19:00</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-sm">
                      Оплачен
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-blue-400 hover:text-blue-300">
                      Показать QR
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-gray-800/50">
                  <td className="py-3 px-4">#12346</td>
                  <td className="py-3 px-4">Дюна 3</td>
                  <td className="py-3 px-4">Зал 2</td>
                  <td className="py-3 px-4">Ряд 3, Место 8</td>
                  <td className="py-3 px-4">07.05.2026 21:30</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-sm">
                      Использован
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-blue-400 hover:text-blue-300">
                      Показать QR
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}