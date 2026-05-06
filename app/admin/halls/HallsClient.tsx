"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import { useToast } from "@/components/ToastContainer";

interface Hall {
  id: string;
  name: string;
  description: string | null;
  totalSeats: number;
  _count: {
    seats: number;
    sessions: number;
  };
}

interface HallsClientProps {
  initialHalls: Hall[];
}

export default function HallsClient({ initialHalls }: HallsClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  const [hallSeats, setHallSeats] = useState<
    Array<{ id: string; rowNumber: number; seatNumber: number; isActive: boolean; isVip: boolean }>
  >([]);
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleView = async (hall: Hall) => {
    setSelectedHall(hall);
    setIsViewModalOpen(true);
    setIsLoadingSeats(true);
    
    try {
      const response = await fetch(`/api/admin/halls/${hall.id}/seats`);
      if (response.ok) {
        const seats = await response.json();
        setHallSeats(seats);
      }
    } catch (error) {
      console.error("Error loading seats:", error);
    } finally {
      setIsLoadingSeats(false);
    }
  };

  const handleEdit = (hall: Hall) => {
    router.push(`/admin/halls/${hall.id}/edit`);
  };

  const handleDeleteClick = (hall: Hall) => {
    setSelectedHall(hall);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedHall) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/halls?id=${selectedHall.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showToast("Зал успешно удален", "success");
        setIsDeleteModalOpen(false);
        router.refresh();
      } else {
        const data = await response.json();
        showToast(data.error || "Ошибка при удалении зала", "error");
      }
    } catch (error) {
      showToast("Ошибка при удалении зала", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Залы</h2>
          <p className="text-gray-400">Управление залами кинотеатра</p>
        </div>
        <button
          onClick={() => router.push("/admin/halls/create")}
          className="px-6 py-3 bg-[#e50914] hover:bg-[#f40612] text-white font-medium rounded-lg transition-colors"
        >
          + Добавить зал
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialHalls.map((hall) => (
          <div
            key={hall.id}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-all cursor-pointer"
            onClick={() => handleView(hall)}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold mb-1">{hall.name}</h3>
                {hall.description && (
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {hall.description}
                  </p>
                )}
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
                <span className="font-medium">{hall.totalSeats} мест</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Создано мест:</span>
                <span className="font-medium">{hall._count.seats}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Активных сеансов:</span>
                <span className="font-medium">{hall._count.sessions}</span>
              </div>
            </div>

            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => handleEdit(hall)}
                className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors text-sm font-medium"
              >
                Изменить
              </button>
              <button
                onClick={() => handleDeleteClick(hall)}
                className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm font-medium"
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      {initialHalls.length === 0 && (
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
          <p className="text-gray-400 mb-4">Залы не найдены</p>
          <button
            onClick={() => router.push("/admin/halls/create")}
            className="inline-block px-6 py-3 bg-[#e50914] hover:bg-[#f40612] text-white font-medium rounded transition-colors"
          >
            Создать первый зал
          </button>
        </div>
      )}

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setHallSeats([]);
        }}
        title="Информация о зале"
        size="xl"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsViewModalOpen(false);
                setHallSeats([]);
                if (selectedHall) {
                  router.push(`/admin/halls/${selectedHall.id}/edit`);
                }
              }}
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
            >
              Редактировать
            </button>
            <button
              onClick={() => {
                setIsViewModalOpen(false);
                setHallSeats([]);
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Закрыть
            </button>
          </div>
        }
      >
        {selectedHall && (
          <div className="space-y-3">
            <div className="pb-3 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white mb-1">
                {selectedHall.name}
              </h3>
              {selectedHall.description && (
                <p className="text-gray-400 text-sm">{selectedHall.description}</p>
              )}
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-center">
              <div>
                <p className="text-xs text-gray-400">Вместимость</p>
                <p className="text-white text-sm font-semibold">
                  {selectedHall.totalSeats}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Создано</p>
                <p className="text-white text-sm font-semibold">
                  {selectedHall._count.seats}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Сеансов</p>
                <p className="text-white text-sm font-semibold">
                  {selectedHall._count.sessions}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Активных</p>
                <p className="text-white text-sm font-semibold text-green-500">
                  {hallSeats.filter((s) => s.isActive).length}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">VIP</p>
                <p className="text-white text-sm font-semibold text-yellow-500">
                  {hallSeats.filter((s) => s.isActive && s.isVip).length}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Неактивных</p>
                <p className="text-white text-sm font-semibold text-gray-500">
                  {hallSeats.filter((s) => !s.isActive).length}
                </p>
              </div>
            </div>

            {/* Карта зала */}
            {isLoadingSeats ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e50914]"></div>
              </div>
            ) : hallSeats.length > 0 ? (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 border border-gray-800">
                <h4 className="text-lg font-bold mb-3">Карта зала</h4>
                
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
                <div className="overflow-x-auto p-3 bg-gray-900/50 rounded-lg">
                  <div className="flex flex-col items-center gap-1 min-w-max">
                    {(() => {
                      // Группировка мест по рядам
                      const seatsByRow = hallSeats.reduce((acc, seat) => {
                        if (!acc[seat.rowNumber]) {
                          acc[seat.rowNumber] = [];
                        }
                        acc[seat.rowNumber].push(seat);
                        return acc;
                      }, {} as Record<number, typeof hallSeats>);

                      const rows = Object.keys(seatsByRow)
                        .map(Number)
                        .sort((a, b) => a - b);

                      // Находим максимальное количество мест во всех рядах для создания единой сетки
                      const maxSeatsInAnyRow = Math.max(
                        ...Object.values(seatsByRow).map(seats => 
                          Math.max(...seats.map(s => s.seatNumber))
                        )
                      );

                      return rows.map((rowNum) => {
                        // Создаем полную сетку для этого ряда
                        const seatGrid = Array.from({ length: maxSeatsInAnyRow }, (_, index) => {
                          const seatNumber = index + 1;
                          return seatsByRow[rowNum].find(s => s.seatNumber === seatNumber) || null;
                        });

                        return (
                          <div key={rowNum} className="flex items-center gap-2 w-full justify-center">
                            {/* Номер ряда */}
                            <div className="w-6 text-center text-xs font-medium text-gray-400 flex-shrink-0">
                              {rowNum}
                            </div>

                            {/* Места в ряду с фиксированной сеткой */}
                            <div className="flex gap-0.5">
                              {seatGrid.map((seat, index) => {
                                const seatNumber = index + 1;
                                
                                if (!seat) {
                                  // Пустое место (не создано в БД) - невидимый placeholder
                                  return (
                                    <div
                                      key={`empty-${rowNum}-${seatNumber}`}
                                      className="w-[14px] h-[14px]"
                                    />
                                  );
                                }

                                return (
                                  <div
                                    key={seat.id}
                                    className="relative group"
                                  >
                                    {/* Tooltip */}
                                    <div className={`absolute ${seat.rowNumber === 1 ? '-bottom-10' : '-top-10'} left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg pointer-events-none`}>
                                      Ряд {seat.rowNumber} - Место {seat.seatNumber}
                                      {seat.isVip && <span className="text-yellow-400 ml-1">(VIP)</span>}
                                      <div className={`absolute ${seat.rowNumber === 1 ? '-top-1' : '-bottom-1'} left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-700 rotate-45`}></div>
                                    </div>
                                    
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="14"
                                      height="14"
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
                                      className="pointer-events-none"
                                    >
                                      <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
                                      <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" />
                                      <path d="M5 18v2" />
                                      <path d="M19 18v2" />
                                    </svg>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      });
                    })()}
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
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <p className="text-sm">Места для этого зала еще не созданы</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Подтверждение удаления"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Вы уверены, что хотите удалить зал{" "}
            <span className="font-bold text-white">{selectedHall?.name}</span>?
          </p>
          {selectedHall && selectedHall._count.sessions > 0 && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">
                ⚠️ У этого зала есть активные сеансы ({selectedHall._count.sessions}). 
                Удаление невозможно.
              </p>
            </div>
          )}
          {selectedHall && selectedHall._count.sessions === 0 && (
            <p className="text-sm text-gray-400">
              Это действие нельзя отменить. Все связанные места также будут удалены.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              disabled={isLoading}
            >
              Отмена
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading || (selectedHall?._count.sessions ?? 0) > 0}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Удаление..." : "Удалить"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
