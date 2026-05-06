"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastContainer";

interface SeatPosition {
  row: number;
  seat: number;
  isActive: boolean;
  isVip: boolean;
}

export default function CreateHallClient() {
  const router = useRouter();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    rows: "",
    seatsPerRow: "",
  });

  const [seats, setSeats] = useState<SeatPosition[]>([]);
  const [isMapGenerated, setIsMapGenerated] = useState(false);

  // Загрузка данных из localStorage при монтировании
  useEffect(() => {
    const savedData = localStorage.getItem('hallCreationData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed.formData || {
          name: "",
          description: "",
          rows: "",
          seatsPerRow: "",
        });
        setSeats(parsed.seats || []);
        setIsMapGenerated(parsed.isMapGenerated || false);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Сохранение данных в localStorage при изменении
  useEffect(() => {
    const dataToSave = {
      formData,
      seats,
      isMapGenerated,
    };
    localStorage.setItem('hallCreationData', JSON.stringify(dataToSave));
  }, [formData, seats, isMapGenerated]);

  // Генерация карты зала
  const handleGenerateMap = () => {
    const rows = parseInt(formData.rows);
    const seatsPerRow = parseInt(formData.seatsPerRow);

    if (isNaN(rows) || isNaN(seatsPerRow) || rows < 1 || seatsPerRow < 1) {
      showToast("Введите корректное количество рядов и мест", "error");
      return;
    }

    if (rows > 20 || seatsPerRow > 30) {
      showToast("Максимум 20 рядов и 30 мест в ряду", "error");
      return;
    }

    const newSeats: SeatPosition[] = [];
    for (let row = 1; row <= rows; row++) {
      for (let seat = 1; seat <= seatsPerRow; seat++) {
        newSeats.push({ row, seat, isActive: true, isVip: false });
      }
    }

    setSeats(newSeats);
    setIsMapGenerated(true);
    showToast("Карта зала сгенерирована", "success");
  };

  // Переключение активности места (одинарный клик)
  const toggleSeat = (row: number, seat: number) => {
    setSeats((prev) =>
      prev.map((s) =>
        s.row === row && s.seat === seat ? { ...s, isActive: !s.isActive } : s
      )
    );
  };

  // Переключение VIP статуса (двойной клик)
  const toggleVipSeat = (row: number, seat: number) => {
    setSeats((prev) =>
      prev.map((s) =>
        s.row === row && s.seat === seat ? { ...s, isVip: !s.isVip, isActive: true } : s
      )
    );
  };

  // Сохранение зала
  const handleSave = async () => {
    if (!formData.name.trim()) {
      showToast("Введите название зала", "error");
      return;
    }

    if (!isMapGenerated || seats.length === 0) {
      showToast("Сгенерируйте карту зала", "error");
      return;
    }

    const activeSeats = seats.filter((s) => s.isActive);
    if (activeSeats.length === 0) {
      showToast("Должно быть хотя бы одно активное место", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/halls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          totalSeats: activeSeats.length,
          seats: seats.map((s) => ({
            rowNumber: s.row,
            seatNumber: s.seat,
            isActive: s.isActive,
            isVip: s.isVip,
          })),
        }),
      });

      if (response.ok) {
        showToast("Зал успешно создан", "success");
        // Очистить localStorage после успешного сохранения
        localStorage.removeItem('hallCreationData');
        router.push("/admin/halls");
      } else {
        const data = await response.json();
        showToast(data.error || "Ошибка при создании зала", "error");
      }
    } catch (error) {
      showToast("Ошибка при создании зала", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Группировка мест по рядам
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<number, SeatPosition[]>);

  const rows = Object.keys(seatsByRow)
    .map(Number)
    .sort((a, b) => a - b);

  const activeSeatsCount = seats.filter((s) => s.isActive).length;
  const vipSeatsCount = seats.filter((s) => s.isActive && s.isVip).length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Назад к списку залов
        </button>
        <h2 className="text-3xl font-bold mb-2">Создать новый зал</h2>
        <p className="text-gray-400">
          Заполните информацию о зале и создайте карту мест
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Левая колонка - Форма */}
        <div className="space-y-6">
          {/* Основная информация */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-800">
            <h3 className="text-xl font-bold mb-4">Основная информация</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Название зала <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Зал 1"
                  className="w-full px-4 py-2 bg-[#0c1321] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#e50914]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Описание
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Большой зал с панорамным экраном"
                  rows={3}
                  className="w-full px-4 py-2 bg-[#0c1321] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#e50914] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Конфигурация мест */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-800">
            <h3 className="text-xl font-bold mb-4">Конфигурация мест</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Количество рядов <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.rows}
                    onChange={(e) =>
                      setFormData({ ...formData, rows: e.target.value })
                    }
                    placeholder="10"
                    min="1"
                    max="20"
                    disabled={isMapGenerated}
                    className="w-full px-4 py-2 bg-[#0c1321] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#e50914] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Мест в ряду <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.seatsPerRow}
                    onChange={(e) =>
                      setFormData({ ...formData, seatsPerRow: e.target.value })
                    }
                    placeholder="12"
                    min="1"
                    max="30"
                    disabled={isMapGenerated}
                    className="w-full px-4 py-2 bg-[#0c1321] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#e50914] disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {!isMapGenerated ? (
                <button
                  onClick={handleGenerateMap}
                  className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                >
                  Сгенерировать карту зала
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSeats([]);
                    setIsMapGenerated(false);
                  }}
                  className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                >
                  Сбросить карту
                </button>
              )}

              {isMapGenerated && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-400 mb-1">
                    <strong>Как использовать:</strong>
                  </p>
                  <p className="text-xs text-blue-300">
                    Наведите курсор на кресло, чтобы увидеть номер ряда и места. Кликните по креслу, чтобы деактивировать его (серое кресло = неактивное место).
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Статистика */}
          {isMapGenerated && (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-bold mb-4">Статистика</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Всего мест</p>
                  <p className="text-2xl font-bold">{seats.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Активных мест</p>
                  <p className="text-2xl font-bold text-green-500">
                    {activeSeatsCount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">VIP мест</p>
                  <p className="text-2xl font-bold text-yellow-500">
                    {vipSeatsCount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Неактивных мест</p>
                  <p className="text-2xl font-bold text-gray-500">
                    {seats.length - activeSeatsCount}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Кнопки действий */}
          <div className="flex gap-4">
            <button
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              disabled={isLoading}
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !isMapGenerated}
              className="flex-1 px-6 py-3 bg-[#e50914] hover:bg-[#f40612] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Сохранение..." : "Сохранить зал"}
            </button>
          </div>
        </div>

        {/* Правая колонка - Карта зала */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-800">
          <h3 className="text-xl font-bold mb-4">Карта зала</h3>

          {!isMapGenerated ? (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <svg
                className="w-20 h-20 text-gray-600 mb-4"
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
              <p className="text-gray-400 mb-2">Карта зала не создана</p>
              <p className="text-sm text-gray-500">
                Заполните количество рядов и мест, затем нажмите
                &quot;Сгенерировать карту зала&quot;
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Экран с эффектом перспективы */}
              <div className="relative w-full overflow-hidden pt-2 pb-6">
                <div 
                  className="w-full h-12 bg-black rounded mx-auto relative overflow-hidden"
                  style={{
                    transform: 'perspective(400px) rotateX(-40deg)',
                    transformOrigin: 'center top',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                  }}
                >
                  <video
                    width="50%"
                    height="100%"
                    src="https://stream.vidhosting.in/videos/2b05f82f.mov"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/2 h-full object-cover pointer-events-none"
                  />
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-wider text-center mt-1">
                  Экран
                </p>
              </div>

              {/* Места */}
              <div className="p-3 bg-gray-900/50 rounded-lg">
                <div className="flex flex-col items-center gap-1">
                  {rows.map((rowNum) => (
                    <div key={rowNum} className="flex items-center gap-2">
                      {/* Номер ряда */}
                      <div className="w-6 text-center text-xs font-medium text-gray-400">
                        {rowNum}
                      </div>

                      {/* Места в ряду */}
                      <div className="flex gap-0">
                        {seatsByRow[rowNum]
                          .sort((a, b) => a.seat - b.seat)
                          .map((seat) => (
                            <button
                              key={`${seat.row}-${seat.seat}`}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleSeat(seat.row, seat.seat);
                              }}
                              onDoubleClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleVipSeat(seat.row, seat.seat);
                              }}
                              className="relative group transition-all cursor-pointer"
                            >
                              {/* Tooltip */}
                              <div className={`absolute ${seat.row === 1 ? '-bottom-8' : '-top-8'} left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg pointer-events-none`}>
                                Ряд {seat.row} - Место {seat.seat}
                                {seat.isVip && <span className="text-yellow-400 ml-1">(VIP)</span>}
                                <div className={`absolute ${seat.row === 1 ? '-top-1' : '-bottom-1'} left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-700 rotate-45`}></div>
                              </div>
                              
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke={
                                  !seat.isActive 
                                    ? "rgb(139 139 139)" 
                                    : seat.isVip 
                                      ? "rgb(234 179 8)" 
                                      : "rgb(34 197 94)"
                                }
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="transition-all hover:stroke-[rgb(184,184,184)] pointer-events-none"
                              >
                                <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
                                <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" />
                                <path d="M5 18v2" />
                                <path d="M19 18v2" />
                              </svg>
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Легенда */}
              <div className="flex items-center justify-center gap-4 pt-3 mt-3 border-t border-gray-700">
                <div className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgb(34 197 94)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
                    <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" />
                    <path d="M5 18v2" />
                    <path d="M19 18v2" />
                  </svg>
                  <span className="text-xs text-gray-400">Обычное</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgb(234 179 8)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
                    <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" />
                    <path d="M5 18v2" />
                    <path d="M19 18v2" />
                  </svg>
                  <span className="text-xs text-gray-400">VIP</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgb(139 139 139)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
                    <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" />
                    <path d="M5 18v2" />
                    <path d="M19 18v2" />
                  </svg>
                  <span className="text-xs text-gray-400">Неактивное</span>
                </div>
              </div>

              {/* Инструкции */}
              {isMapGenerated && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg mt-3">
                  <p className="text-sm text-blue-400 mb-1">
                    <strong>Как использовать:</strong>
                  </p>
                  <p className="text-xs text-blue-300 mb-1">
                    • <strong>Одинарный клик</strong> - деактивировать/активировать место
                  </p>
                  <p className="text-xs text-blue-300">
                    • <strong>Двойной клик</strong> - сделать место VIP (желтое)
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
