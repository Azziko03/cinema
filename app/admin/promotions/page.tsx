"use client";

export default function PromotionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Акции и промокоды</h1>
        <button className="px-4 py-2 bg-[#e50914] hover:bg-[#f40612] text-white rounded-lg transition-colors">
          Создать промокод
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#121d2e] p-6 rounded-lg border border-gray-800">
          <h3 className="text-lg font-semibold mb-2">Активные промокоды</h3>
          <p className="text-3xl font-bold text-green-400">12</p>
          <p className="text-sm text-gray-400 mt-1">Действующие</p>
        </div>
        <div className="bg-[#121d2e] p-6 rounded-lg border border-gray-800">
          <h3 className="text-lg font-semibold mb-2">Использовано сегодня</h3>
          <p className="text-3xl font-bold text-blue-400">47</p>
          <p className="text-sm text-gray-400 mt-1">Применений</p>
        </div>
        <div className="bg-[#121d2e] p-6 rounded-lg border border-gray-800">
          <h3 className="text-lg font-semibold mb-2">Экономия клиентов</h3>
          <p className="text-3xl font-bold text-purple-400">₽ 8,450</p>
          <p className="text-sm text-gray-400 mt-1">За сегодня</p>
        </div>
      </div>

      <div className="bg-[#121d2e] rounded-lg border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold">Список промокодов</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4">Код</th>
                  <th className="text-left py-3 px-4">Тип скидки</th>
                  <th className="text-left py-3 px-4">Размер</th>
                  <th className="text-left py-3 px-4">Использовано</th>
                  <th className="text-left py-3 px-4">Лимит</th>
                  <th className="text-left py-3 px-4">Срок действия</th>
                  <th className="text-left py-3 px-4">Статус</th>
                  <th className="text-left py-3 px-4">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-800/50">
                  <td className="py-3 px-4 font-mono">WELCOME2026</td>
                  <td className="py-3 px-4">Процент</td>
                  <td className="py-3 px-4">20%</td>
                  <td className="py-3 px-4">23</td>
                  <td className="py-3 px-4">100</td>
                  <td className="py-3 px-4">31.12.2026</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-sm">
                      Активен
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button className="text-blue-400 hover:text-blue-300 text-sm">
                        Редактировать
                      </button>
                      <button className="text-red-400 hover:text-red-300 text-sm">
                        Деактивировать
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-800/50">
                  <td className="py-3 px-4 font-mono">STUDENT50</td>
                  <td className="py-3 px-4">Фиксированная</td>
                  <td className="py-3 px-4">₽ 50</td>
                  <td className="py-3 px-4">156</td>
                  <td className="py-3 px-4">∞</td>
                  <td className="py-3 px-4">30.06.2026</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-sm">
                      Активен
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button className="text-blue-400 hover:text-blue-300 text-sm">
                        Редактировать
                      </button>
                      <button className="text-red-400 hover:text-red-300 text-sm">
                        Деактивировать
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-800/50">
                  <td className="py-3 px-4 font-mono">FRIDAY30</td>
                  <td className="py-3 px-4">Процент</td>
                  <td className="py-3 px-4">30%</td>
                  <td className="py-3 px-4">89</td>
                  <td className="py-3 px-4">200</td>
                  <td className="py-3 px-4">15.05.2026</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded text-sm">
                      Скоро истекает
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button className="text-blue-400 hover:text-blue-300 text-sm">
                        Редактировать
                      </button>
                      <button className="text-green-400 hover:text-green-300 text-sm">
                        Продлить
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-[#121d2e] rounded-lg border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold">Быстрое создание промокода</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Код промокода</label>
              <input
                type="text"
                placeholder="NEWPROMO"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e50914]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Тип скидки</label>
              <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e50914]">
                <option>Процент</option>
                <option>Фиксированная сумма</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Размер скидки</label>
              <input
                type="number"
                placeholder="10"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e50914]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Лимит использований</label>
              <input
                type="number"
                placeholder="100"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e50914]"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="px-6 py-2 bg-[#e50914] hover:bg-[#f40612] text-white rounded-lg transition-colors">
              Создать промокод
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}