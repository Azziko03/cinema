"use client";

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Финансы и отчёты</h1>
        <div className="flex gap-3">
          <select className="px-4 py-2 bg-[#121d2e] border border-gray-800 rounded-lg">
            <option>За день</option>
            <option>За неделю</option>
            <option>За месяц</option>
            <option>За год</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Экспорт отчёта
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#121d2e] p-6 rounded-lg border border-gray-800">
          <h3 className="text-lg font-semibold mb-2">Выручка за день</h3>
          <p className="text-3xl font-bold text-green-400">₽ 45,670</p>
          <p className="text-sm text-gray-400 mt-1">+12% к вчера</p>
        </div>
        <div className="bg-[#121d2e] p-6 rounded-lg border border-gray-800">
          <h3 className="text-lg font-semibold mb-2">Выручка за неделю</h3>
          <p className="text-3xl font-bold text-blue-400">₽ 287,340</p>
          <p className="text-sm text-gray-400 mt-1">+8% к прошлой неделе</p>
        </div>
        <div className="bg-[#121d2e] p-6 rounded-lg border border-gray-800">
          <h3 className="text-lg font-semibold mb-2">Выручка за месяц</h3>
          <p className="text-3xl font-bold text-purple-400">₽ 1,234,560</p>
          <p className="text-sm text-gray-400 mt-1">+15% к прошлому месяцу</p>
        </div>
        <div className="bg-[#121d2e] p-6 rounded-lg border border-gray-800">
          <h3 className="text-lg font-semibold mb-2">Средний чек</h3>
          <p className="text-3xl font-bold text-yellow-400">₽ 450</p>
          <p className="text-sm text-gray-400 mt-1">+5% к прошлому месяцу</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#121d2e] rounded-lg border border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-semibold">Популярные фильмы</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Аватар 3</p>
                  <p className="text-sm text-gray-400">234 билета</p>
                </div>
                <p className="text-green-400 font-semibold">₽ 105,300</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Дюна 3</p>
                  <p className="text-sm text-gray-400">187 билета</p>
                </div>
                <p className="text-green-400 font-semibold">₽ 84,150</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Человек-паук 4</p>
                  <p className="text-sm text-gray-400">156 билета</p>
                </div>
                <p className="text-green-400 font-semibold">₽ 70,200</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#121d2e] rounded-lg border border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-semibold">Загрузка залов</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Зал 1 (IMAX)</p>
                  <p className="text-sm text-gray-400">150 мест</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">87%</p>
                  <div className="w-20 h-2 bg-gray-700 rounded-full mt-1">
                    <div className="w-[87%] h-full bg-green-400 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Зал 2 (VIP)</p>
                  <p className="text-sm text-gray-400">80 мест</p>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-semibold">65%</p>
                  <div className="w-20 h-2 bg-gray-700 rounded-full mt-1">
                    <div className="w-[65%] h-full bg-yellow-400 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Зал 3 (Стандарт)</p>
                  <p className="text-sm text-gray-400">120 мест</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-400 font-semibold">72%</p>
                  <div className="w-20 h-2 bg-gray-700 rounded-full mt-1">
                    <div className="w-[72%] h-full bg-blue-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#121d2e] rounded-lg border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold">Детальная статистика</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">1,234</p>
              <p className="text-sm text-gray-400">Билетов продано</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">₽ 555,600</p>
              <p className="text-sm text-gray-400">Общая выручка</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">78%</p>
              <p className="text-sm text-gray-400">Средняя загрузка</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}