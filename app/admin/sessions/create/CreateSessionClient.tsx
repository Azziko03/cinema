"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastContainer";
import Link from "next/link";
import { ChevronDown, ChevronUp, Calendar, Clock, Check, X } from "lucide-react";

interface Movie {
  id: string;
  durationMinutes: number;
  ageRating: string;
  releaseDate: Date;
  status: string;
  translations: Array<{
    language: string;
    title: string;
    description: string;
  }>;
  mediaFiles: Array<{
    type: string;
    url: string;
  }>;
}

interface Hall {
  id: string;
  name: string;
  totalSeats: number;
  seats: Array<{ id: string }>;
}

interface ExistingSession {
  id: string;
  startTime: string;
  endTime: string;
  movieTitle: string;
  hallName: string;
}

interface CreateSessionClientProps {
  movies: Movie[];
  halls: Hall[];
}

export default function CreateSessionClient({
  movies,
  halls,
}: CreateSessionClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  // Шаги процесса
  const [currentStep, setCurrentStep] = useState(1);
  
  // Шаг 1: Выбор фильма
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [isMovieDropdownOpen, setIsMovieDropdownOpen] = useState(false);
  
  // Шаг 2: Выбор зала (только один)
  const [selectedHallId, setSelectedHallId] = useState("");
  const [isHallDropdownOpen, setIsHallDropdownOpen] = useState(false);
  
  // Шаг 3: Даты и время (для всех залов)
  const [hallsData, setHallsData] = useState<Record<string, {
    selectedDates: Date[];
    activeDateForEditing: Date | null;
    rangeStartDate: Date | null;
    existingSessions: Record<string, ExistingSession[]>;
    timeSlotsByDate: Record<string, Array<{id: string, from: string, to: string}>>;
    basePrice: string;
    vipPrice: string;
    language: string;
    format: string;
  }>>({});
  
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Состояние для календаря
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const selectedMovie = movies.find((m) => m.id === selectedMovieId);
  
  // Получаем данные текущего зала
  const currentHallData = selectedHallId ? hallsData[selectedHallId] : null;
  const selectedDates = currentHallData?.selectedDates || [];
  const activeDateForEditing = currentHallData?.activeDateForEditing || null;
  const rangeStartDate = currentHallData?.rangeStartDate || null;
  const existingSessions = currentHallData?.existingSessions || {};
  const timeSlotsByDate = currentHallData?.timeSlotsByDate || {};
  const basePrice = currentHallData?.basePrice || "";
  const vipPrice = currentHallData?.vipPrice || "";
  const language = currentHallData?.language || "original";
  const format = currentHallData?.format || "TWO_D";
  
  // Проверяем, есть ли VIP места в текущем зале
  const currentHall = halls.find(h => h.id === selectedHallId);
  const hasVipSeats = currentHall ? currentHall.seats.length > 0 : false;
  
  // Константа для перерыва между сеансами (20 минут)
  const BREAK_TIME_MINUTES = 20;

  // Загрузка данных из localStorage при монтировании
  useEffect(() => {
    const savedData = localStorage.getItem('cinema_sessions_halls_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Преобразуем строки дат обратно в Date объекты
        const restored: typeof hallsData = {};
        for (const [hallId, data] of Object.entries(parsed)) {
          const hallData = data as any;
          restored[hallId] = {
            ...hallData,
            selectedDates: hallData.selectedDates.map((d: string) => new Date(d)),
            activeDateForEditing: hallData.activeDateForEditing ? new Date(hallData.activeDateForEditing) : null,
            rangeStartDate: hallData.rangeStartDate ? new Date(hallData.rangeStartDate) : null,
          };
        }
        setHallsData(restored);
      } catch (error) {
        console.error('Error loading halls data from localStorage:', error);
      }
    }
  }, []);

  // Сохранение данных в localStorage при изменении
  useEffect(() => {
    if (Object.keys(hallsData).length > 0) {
      // Преобразуем Date объекты в строки для сохранения
      const toSave: any = {};
      for (const [hallId, data] of Object.entries(hallsData)) {
        toSave[hallId] = {
          ...data,
          selectedDates: data.selectedDates.map(d => d.toISOString()),
          activeDateForEditing: data.activeDateForEditing?.toISOString() || null,
          rangeStartDate: data.rangeStartDate?.toISOString() || null,
        };
      }
      localStorage.setItem('cinema_sessions_halls_data', JSON.stringify(toSave));
    }
  }, [hallsData]);

  // Обновление данных текущего зала
  const updateCurrentHallData = (updates: Partial<typeof hallsData[string]>) => {
    if (!selectedHallId) return;
    
    setHallsData(prev => ({
      ...prev,
      [selectedHallId]: {
        selectedDates: prev[selectedHallId]?.selectedDates || [],
        activeDateForEditing: prev[selectedHallId]?.activeDateForEditing || null,
        rangeStartDate: prev[selectedHallId]?.rangeStartDate || null,
        existingSessions: prev[selectedHallId]?.existingSessions || {},
        timeSlotsByDate: prev[selectedHallId]?.timeSlotsByDate || {},
        basePrice: prev[selectedHallId]?.basePrice || "",
        vipPrice: prev[selectedHallId]?.vipPrice || "",
        language: prev[selectedHallId]?.language || "original",
        format: prev[selectedHallId]?.format || "TWO_D",
        ...updates,
      }
    }));
  };

  // Получение постера фильма
  const getPosterUrl = (movie: Movie) => {
    const poster = movie.mediaFiles.find((m) => m.type === "poster");
    return poster?.url || "/placeholder.svg";
  };

  // Получение названия фильма
  const getTitle = (movie: Movie, lang: string = "RU") => {
    const translation = movie.translations.find((t) => t.language === lang);
    return translation?.title || "Без названия";
  };

  // Получение бейджа статуса
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "now_showing":
        return (
          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
            В прокате
          </span>
        );
      case "coming_soon":
        return (
          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">
            Скоро
          </span>
        );
      case "archived":
        return (
          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400">
            Архив
          </span>
        );
      default:
        return null;
    }
  };

  // Загрузка существующих сеансов для выбранных дат и зала
  const loadExistingSessions = async (dates: Date[], hallId: string) => {
    if (!hallId || dates.length === 0) return;
    
    setIsLoadingSessions(true);
    try {
      const sessionsMap: Record<string, ExistingSession[]> = {};
      
      for (const date of dates) {
        const dateStr = date.toISOString().split('T')[0];
        const response = await fetch('/api/admin/sessions/by-date', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: dateStr, hallIds: [hallId] }),
        });
        
        if (response.ok) {
          const data = await response.json();
          sessionsMap[dateStr] = data.sessions || [];
        }
      }
      
      updateCurrentHallData({ existingSessions: sessionsMap });
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Обработчик клика на дату
  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    // Если дата уже выбрана, делаем её активной для редактирования
    if (selectedDates.some(d => d.toISOString().split('T')[0] === dateStr)) {
      updateCurrentHallData({ activeDateForEditing: date });
    }
  };

  // Обработчик двойного клика на дату (выбор/удаление диапазона)
  const handleDateDoubleClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const isAlreadySelected = selectedDates.some(d => d.toISOString().split('T')[0] === dateStr);
    
    // Если дата уже выбрана, удаляем её
    if (isAlreadySelected) {
      removeDate(date);
      updateCurrentHallData({ rangeStartDate: null }); // Сбрасываем начало диапазона
      return;
    }
    
    if (!rangeStartDate) {
      // Первый клик - устанавливаем начало диапазона
      const newDates = [...selectedDates, date];
      const newTimeSlots = {
        ...timeSlotsByDate,
        [dateStr]: [{ id: crypto.randomUUID(), from: '', to: '' }]
      };
      
      updateCurrentHallData({
        rangeStartDate: date,
        selectedDates: newDates,
        timeSlotsByDate: newTimeSlots,
        activeDateForEditing: date,
      });
      
      if (selectedHallId) {
        loadExistingSessions([date], selectedHallId);
      }
    } else {
      // Второй клик - выбираем диапазон
      const start = rangeStartDate < date ? rangeStartDate : date;
      const end = rangeStartDate < date ? date : rangeStartDate;
      
      const datesInRange: Date[] = [];
      const currentDate = new Date(start);
      
      while (currentDate <= end) {
        datesInRange.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Добавляем все даты из диапазона
      const newDates = [...selectedDates];
      const newTimeSlots = { ...timeSlotsByDate };
      
      for (const d of datesInRange) {
        const dStr = d.toISOString().split('T')[0];
        if (!selectedDates.some(sd => sd.toISOString().split('T')[0] === dStr)) {
          newDates.push(d);
          newTimeSlots[dStr] = [{ id: crypto.randomUUID(), from: '', to: '' }];
        }
      }
      
      updateCurrentHallData({
        selectedDates: newDates,
        timeSlotsByDate: newTimeSlots,
        rangeStartDate: null,
        activeDateForEditing: date,
      });
      
      // Загружаем сеансы для всех новых дат
      if (selectedHallId) {
        loadExistingSessions(datesInRange, selectedHallId);
      }
    }
  };

  // Удалить дату из выбранных
  const removeDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    const newDates = selectedDates.filter(d => d.toISOString().split('T')[0] !== dateStr);
    const newTimeSlots = { ...timeSlotsByDate };
    delete newTimeSlots[dateStr];
    
    const newSessions = { ...existingSessions };
    delete newSessions[dateStr];
    
    updateCurrentHallData({
      selectedDates: newDates,
      timeSlotsByDate: newTimeSlots,
      existingSessions: newSessions,
      activeDateForEditing: activeDateForEditing?.toISOString().split('T')[0] === dateStr ? null : activeDateForEditing,
    });
  };

  // Добавить временной слот для конкретной даты
  const addTimeSlot = (dateStr: string) => {
    const newTimeSlots = {
      ...timeSlotsByDate,
      [dateStr]: [...(timeSlotsByDate[dateStr] || []), { id: crypto.randomUUID(), from: '', to: '' }]
    };
    updateCurrentHallData({ timeSlotsByDate: newTimeSlots });
  };

  // Удалить временной слот
  const removeTimeSlot = (dateStr: string, slotId: string) => {
    const newTimeSlots = {
      ...timeSlotsByDate,
      [dateStr]: timeSlotsByDate[dateStr].filter(slot => slot.id !== slotId)
    };
    updateCurrentHallData({ timeSlotsByDate: newTimeSlots });
  };

  // Обновить временной слот
  const updateTimeSlot = (dateStr: string, slotId: string, field: 'from' | 'to', value: string) => {
    const newTimeSlots = {
      ...timeSlotsByDate,
      [dateStr]: timeSlotsByDate[dateStr].map(slot => 
        slot.id === slotId ? { ...slot, [field]: value } : slot
      )
    };
    updateCurrentHallData({ timeSlotsByDate: newTimeSlots });
  };

  // Проверка, полностью ли занят день
  const isDayFullyBooked = (date: Date): boolean => {
    // Для упрощения, пока возвращаем false
    // Можно добавить логику проверки
    return false;
  };

  // Проверка доступности времени для текущего зала
  const isTimeSlotAvailable = (dateStr: string, startTime: string, currentSlotId?: string): boolean => {
    if (!selectedHallId) return true;
    return isTimeSlotAvailableForHall(selectedHallId, dateStr, startTime, currentSlotId);
  };

  // Обработчик отправки формы
  const handleSubmit = async () => {
    // Валидация
    if (!selectedMovieId) {
      showToast("Выберите фильм", "warning");
      return;
    }
    
    // Проверяем, что есть хотя бы один зал с данными
    const hallsWithData = Object.entries(hallsData).filter(([_, data]) => data.selectedDates.length > 0);
    
    if (hallsWithData.length === 0) {
      showToast("Добавьте сеансы хотя бы для одного зала", "warning");
      return;
    }
    
    // Валидация для каждого зала
    for (const [hallId, data] of hallsWithData) {
      const hall = halls.find(h => h.id === hallId);
      const hallName = hall?.name || hallId;
      
      // Проверяем, что для всех дат указано время
      for (const date of data.selectedDates) {
        const dateStr = date.toISOString().split('T')[0];
        const slots = data.timeSlotsByDate[dateStr] || [];
        
        if (slots.length === 0 || slots.some(slot => !slot.from || !slot.to)) {
          showToast(`Укажите время для всех слотов на ${date.toLocaleDateString('ru-RU')} (${hallName})`, "warning");
          return;
        }
        
        // Проверяем доступность всех временных слотов
        for (const slot of slots) {
          if (!isTimeSlotAvailableForHall(hallId, dateStr, slot.from, slot.id)) {
            showToast(`Время ${slot.from} на ${date.toLocaleDateString('ru-RU')} недоступно (${hallName})`, "error");
            return;
          }
        }
      }
      
      if (!data.basePrice) {
        showToast(`Укажите базовую цену для зала ${hallName}`, "warning");
        return;
      }
      
      // Проверяем VIP цену, если в зале есть VIP места
      if (hall && hall.seats.length > 0 && !data.vipPrice) {
        showToast(`Укажите VIP цену для зала ${hallName}`, "warning");
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      const promises: Promise<Response>[] = [];
      
      // Создаем сеансы для каждого зала
      for (const [hallId, data] of hallsWithData) {
        // Создаем сеансы для каждой даты и каждого временного слота
        for (const date of data.selectedDates) {
          const dateStr = date.toISOString().split('T')[0];
          const slots = data.timeSlotsByDate[dateStr] || [];
          
          for (const slot of slots) {
            const [hours, minutes] = slot.from.split(':').map(Number);
            const startTime = new Date(date);
            startTime.setHours(hours, minutes, 0, 0);
            
            const [endHours, endMinutes] = slot.to.split(':').map(Number);
            const endTime = new Date(date);
            endTime.setHours(endHours, endMinutes, 0, 0);
            
            promises.push(
              fetch('/api/admin/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  movieId: selectedMovieId,
                  hallId: hallId,
                  startTime: startTime.toISOString(),
                  endTime: endTime.toISOString(),
                  basePrice: parseFloat(data.basePrice),
                  vipPrice: data.vipPrice ? parseFloat(data.vipPrice) : null,
                  language: data.language,
                  format: data.format,
                }),
              })
            );
          }
        }
      }
      
      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.ok).length;
      const totalCount = results.length;
      
      if (successCount === totalCount) {
        showToast(`Успешно создано ${successCount} сеансов!`, "success");
        // Очищаем localStorage после успешного создания
        localStorage.removeItem('cinema_sessions_halls_data');
        router.push("/admin/sessions");
      } else if (successCount > 0) {
        showToast(`Создано ${successCount} из ${totalCount} сеансов`, "warning");
        // Очищаем localStorage после создания
        localStorage.removeItem('cinema_sessions_halls_data');
        router.push("/admin/sessions");
      } else {
        showToast("Не удалось создать сеансы", "error");
      }
    } catch (error) {
      showToast("Ошибка при создании сеансов", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Проверка доступности времени для конкретного зала
  const isTimeSlotAvailableForHall = (hallId: string, dateStr: string, startTime: string, currentSlotId?: string): boolean => {
    if (!selectedMovie || !startTime) return true;
    
    const hallData = hallsData[hallId];
    if (!hallData) return true;
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + selectedMovie.durationMinutes;
    
    // Проверяем конфликты с существующими сеансами
    const sessions = hallData.existingSessions[dateStr] || [];
    for (const session of sessions) {
      const sessionStart = new Date(session.startTime);
      const sessionEnd = new Date(session.endTime);
      
      const sessionStartMinutes = sessionStart.getHours() * 60 + sessionStart.getMinutes();
      const sessionEndMinutes = sessionEnd.getHours() * 60 + sessionEnd.getMinutes();
      
      // Добавляем перерыв после существующего сеанса
      const sessionEndWithBreak = sessionEndMinutes + BREAK_TIME_MINUTES;
      
      // Проверяем пересечение
      if (
        (startMinutes >= sessionStartMinutes && startMinutes < sessionEndWithBreak) ||
        (endMinutes > sessionStartMinutes && endMinutes <= sessionEndWithBreak) ||
        (startMinutes <= sessionStartMinutes && endMinutes >= sessionEndWithBreak)
      ) {
        return false;
      }
    }
    
    // Проверяем конфликты с другими слотами этой же даты
    const slots = hallData.timeSlotsByDate[dateStr] || [];
    for (const slot of slots) {
      // Пропускаем текущий слот
      if (currentSlotId && slot.id === currentSlotId) continue;
      
      if (!slot.from) continue;
      
      const [slotHours, slotMinutes] = slot.from.split(':').map(Number);
      const slotStartMinutes = slotHours * 60 + slotMinutes;
      const slotEndMinutes = slotStartMinutes + selectedMovie.durationMinutes;
      
      // Добавляем перерыв после слота
      const slotEndWithBreak = slotEndMinutes + BREAK_TIME_MINUTES;
      
      // Проверяем пересечение
      if (
        (startMinutes >= slotStartMinutes && startMinutes < slotEndWithBreak) ||
        (endMinutes > slotStartMinutes && endMinutes <= slotEndWithBreak) ||
        (startMinutes <= slotStartMinutes && endMinutes >= slotEndWithBreak)
      ) {
        return false;
      }
    }
    
    return true;
  };

  // Генерация календаря для выбранного месяца и года
  const generateCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = воскресенье
    
    const days: (Date | null)[] = [];
    
    // Добавляем пустые ячейки для дней предыдущего месяца
    // Преобразуем: 0 (воскресенье) -> 6, 1 (понедельник) -> 0
    const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    for (let i = 0; i < adjustedStartDay; i++) {
      days.push(null);
    }
    
    // Добавляем дни текущего месяца
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentYear, currentMonth, day));
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  // Навигация по месяцам
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  // Проверка, является ли дата прошедшей
  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Названия месяцев
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  // Названия дней недели
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Хлебные крошки */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/admin/sessions" className="hover:text-white transition-colors">
          Сеансы
        </Link>
        <span>/</span>
        <span className="text-white">Добавить сеанс</span>
      </div>

      {/* Заголовок */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Добавить сеанс</h2>
          <p className="text-gray-400">
            Создайте сеанс для выбранного фильма
          </p>
        </div>
        <Link
          href="/admin/sessions"
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
        >
          Отмена
        </Link>
      </div>

      {/* Индикатор процесса */}
      <div className="mb-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-800 p-6">
        <div className="flex items-center justify-between">
          {/* Шаг 1 */}
          <div className="flex items-center gap-3 flex-1">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-colors ${
              currentStep >= 1 ? 'bg-[#e50914] text-white' : 'bg-gray-700 text-gray-400'
            }`}>
              {currentStep > 1 ? <Check className="w-5 h-5" /> : '1'}
            </div>
            <div>
              <p className={`font-medium ${currentStep >= 1 ? 'text-white' : 'text-gray-400'}`}>
                Выбор фильма
              </p>
              <p className="text-xs text-gray-500">Выберите фильм для сеанса</p>
            </div>
          </div>
          
          <div className={`h-0.5 flex-1 mx-4 ${currentStep >= 2 ? 'bg-[#e50914]' : 'bg-gray-700'}`} />
          
          {/* Шаг 2 */}
          <div className="flex items-center gap-3 flex-1">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-colors ${
              currentStep >= 2 ? 'bg-[#e50914] text-white' : 'bg-gray-700 text-gray-400'
            }`}>
              {currentStep > 2 ? <Check className="w-5 h-5" /> : '2'}
            </div>
            <div>
              <p className={`font-medium ${currentStep >= 2 ? 'text-white' : 'text-gray-400'}`}>
                Выбор зала
              </p>
              <p className="text-xs text-gray-500">Выберите зал для сеансов</p>
            </div>
          </div>
          
          <div className={`h-0.5 flex-1 mx-4 ${currentStep >= 3 ? 'bg-[#e50914]' : 'bg-gray-700'}`} />
          
          {/* Шаг 3 */}
          <div className="flex items-center gap-3 flex-1">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-colors ${
              currentStep >= 3 ? 'bg-[#e50914] text-white' : 'bg-gray-700 text-gray-400'
            }`}>
              3
            </div>
            <div>
              <p className={`font-medium ${currentStep >= 3 ? 'text-white' : 'text-gray-400'}`}>
                Дата и время
              </p>
              <p className="text-xs text-gray-500">Укажите расписание</p>
            </div>
          </div>
        </div>
      </div>

      {/* Шаг 1: Выбор фильма */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-800 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Выберите фильм</h3>
          {selectedMovie && (
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 bg-[#e50914] hover:bg-[#c50812] text-white font-medium rounded-lg transition-colors"
            >
              Далее →
            </button>
          )}
        </div>

        {/* Дропдаун фильмов */}
        <div className="relative mb-4">
          <button
            type="button"
            onClick={() => setIsMovieDropdownOpen(!isMovieDropdownOpen)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-left flex items-center justify-between hover:border-gray-600 transition-colors"
          >
            <span className={selectedMovie ? 'text-white' : 'text-gray-400'}>
              {selectedMovie ? getTitle(selectedMovie) : 'Выберите фильм'}
            </span>
            {isMovieDropdownOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {isMovieDropdownOpen && (
            <div className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto">
              {movies.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => {
                    setSelectedMovieId(movie.id);
                    setIsMovieDropdownOpen(false);
                    setCurrentStep(1);
                  }}
                  className={`flex items-center gap-4 p-4 cursor-pointer transition-colors border-b border-gray-700 last:border-b-0 ${
                    selectedMovieId === movie.id
                      ? 'bg-[#e50914]/10 hover:bg-[#e50914]/20'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <img
                    src={getPosterUrl(movie)}
                    alt={getTitle(movie)}
                    className="w-16 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-white mb-1">{getTitle(movie)}</p>
                    <p className="text-sm text-gray-400 mb-2">
                      {movie.durationMinutes} мин • {movie.ageRating}
                    </p>
                    {getStatusBadge(movie.status)}
                  </div>
                  {selectedMovieId === movie.id && (
                    <Check className="w-5 h-5 text-[#e50914]" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Выбранный фильм */}
        {selectedMovie && (
          <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">Выбранный фильм:</p>
            <div className="flex items-center gap-4">
              <img
                src={getPosterUrl(selectedMovie)}
                alt={getTitle(selectedMovie)}
                className="w-20 h-30 object-cover rounded"
              />
              <div>
                <p className="font-semibold text-white text-lg mb-1">{getTitle(selectedMovie)}</p>
                <p className="text-sm text-gray-400 mb-2">
                  Длительность: {selectedMovie.durationMinutes} мин • Возраст: {selectedMovie.ageRating}
                </p>
                {getStatusBadge(selectedMovie.status)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Шаг 2: Выбор зала */}
      {currentStep >= 2 && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-800 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Выберите зал</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                ← Назад
              </button>
              {selectedHallId && (
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 bg-[#e50914] hover:bg-[#c50812] text-white font-medium rounded-lg transition-colors"
                >
                  Далее →
                </button>
              )}
            </div>
          </div>

          {/* Дропдаун зала */}
          <div className="relative mb-4">
            {/* Информационное сообщение */}
            {Object.keys(hallsData).length > 0 && (
              <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-xs text-blue-400">
                   Данные автоматически сохраняются. Вы можете переключаться между залами и заполнять их по очереди.
                </p>
              </div>
            )}
            
            <button
              type="button"
              onClick={() => setIsHallDropdownOpen(!isHallDropdownOpen)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-left flex items-center justify-between hover:border-gray-600 transition-colors"
            >
              <span className={selectedHallId ? 'text-white' : 'text-gray-400'}>
                {selectedHallId 
                  ? halls.find(h => h.id === selectedHallId)?.name || 'Выберите зал'
                  : 'Выберите зал'}
              </span>
              {isHallDropdownOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {isHallDropdownOpen && (
              <div className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
                {halls.map((hall) => {
                  const isSelected = selectedHallId === hall.id;
                  const hasData = hallsData[hall.id] && hallsData[hall.id].selectedDates.length > 0;
                  const sessionsCount = hasData 
                    ? Object.values(hallsData[hall.id].timeSlotsByDate).reduce((sum, slots) => sum + slots.length, 0)
                    : 0;
                  
                  return (
                    <div
                      key={hall.id}
                      onClick={() => {
                        setSelectedHallId(hall.id);
                        setIsHallDropdownOpen(false);
                      }}
                      className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-gray-700 last:border-b-0 ${
                        isSelected
                          ? 'bg-[#e50914]/10 hover:bg-[#e50914]/20'
                          : 'hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{hall.name}</p>
                          {hasData && (
                            <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                              {sessionsCount} {sessionsCount === 1 ? 'сеанс' : sessionsCount < 5 ? 'сеанса' : 'сеансов'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{hall.totalSeats} мест</p>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-[#e50914]" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Выбранный зал */}
          {selectedHallId && (
            <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Выбранный зал:</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white text-lg">
                    {halls.find(h => h.id === selectedHallId)?.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    {halls.find(h => h.id === selectedHallId)?.totalSeats} мест
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Шаг 3: Дата и время */}
      {currentStep >= 3 && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-800 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Выберите дату и время</h3>
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              ← Назад
            </button>
          </div>

          {/* Календарь */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <p className="text-sm font-medium text-gray-300">Выберите дату</p>
              </div>
              
              {/* Навигация по месяцам */}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={goToPreviousMonth}
                  className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
                >
                  <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
                </button>
                
                <div className="flex items-center gap-3">
                  {/* Выбор месяца */}
                  <select
                    value={currentMonth}
                    onChange={(e) => setCurrentMonth(Number(e.target.value))}
                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#e50914]"
                  >
                    {monthNames.map((month, index) => (
                      <option key={index} value={index}>
                        {month}
                      </option>
                    ))}
                  </select>
                  
                  {/* Выбор года */}
                  <select
                    value={currentYear}
                    onChange={(e) => setCurrentYear(Number(e.target.value))}
                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#e50914]"
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  
                  {/* Кнопка "Сегодня" */}
                  <button
                    type="button"
                    onClick={goToToday}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Сегодня
                  </button>
                </div>
                
                <button
                  type="button"
                  onClick={goToNextMonth}
                  className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
                >
                  <ChevronUp className="w-4 h-4 rotate-90" />
                </button>
              </div>
            </div>
            
            {/* Заголовок календаря */}
            <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-t-lg">
              <p className="text-center text-lg font-semibold text-white">
                {monthNames[currentMonth]} {currentYear}
              </p>
            </div>
            
            {/* Дни недели */}
            <div className="grid grid-cols-7 gap-2 p-2 bg-gray-800/30 border-x border-gray-700">
              {dayNames.map((day) => (
                <div key={day} className="text-center py-2">
                  <p className="text-xs font-medium text-gray-400">{day}</p>
                </div>
              ))}
            </div>
            
            {/* Подсказка */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-2">
              <p className="text-xs text-blue-400 text-center">
                 Двойной клик: выбрать диапазон дат или удалить выбранную • Одинарный клик: редактировать выбранную дату
              </p>
            </div>
            
            {/* Дни месяца */}
            <div className="grid grid-cols-7 gap-2 p-2 bg-gray-800/50 border border-gray-700 rounded-b-lg">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="p-3" />;
                }
                
                const dateStr = date.toISOString().split('T')[0];
                const isSelected = selectedDates.some(d => d.toISOString().split('T')[0] === dateStr);
                const isActive = activeDateForEditing?.toISOString().split('T')[0] === dateStr;
                const isRangeStart = rangeStartDate?.toISOString().split('T')[0] === dateStr;
                const isFullyBooked = isDayFullyBooked(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const isPast = isPastDate(date);
                
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => !isFullyBooked && !isPast && handleDateClick(date)}
                    onDoubleClick={() => !isFullyBooked && !isPast && handleDateDoubleClick(date)}
                    disabled={isFullyBooked || isPast}
                    className={`p-3 rounded-lg border transition-all relative ${
                      isActive
                        ? 'bg-[#e50914] border-[#e50914] text-white shadow-lg ring-2 ring-[#e50914] ring-offset-2 ring-offset-gray-900'
                        : isSelected
                        ? 'bg-[#e50914]/70 border-[#e50914]/70 text-white shadow-md'
                        : isRangeStart
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                        : isPast
                        ? 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed'
                        : isFullyBooked
                        ? 'bg-gray-800/50 border-gray-700 text-gray-600 cursor-not-allowed'
                        : 'bg-gray-800 border-gray-700 text-white hover:border-[#e50914] hover:bg-gray-700'
                    } ${isToday && !isSelected && !isActive ? 'border-blue-500 border-2' : ''}`}
                  >
                    <div className="text-center">
                      <p className="text-lg font-semibold">
                        {date.getDate()}
                      </p>
                      {isActive && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1" />
                      )}
                      {isSelected && !isActive && (
                        <Check className="w-4 h-4 mx-auto mt-1" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Информация о выбранных датах */}
          {selectedDates.length > 0 && (
            <div className="space-y-6">
              {/* Временные слоты для активной даты */}
              {!activeDateForEditing ? (
                <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
                  <p className="text-yellow-400 text-sm">
                     Кликните на дату выше, чтобы добавить временные слоты
                  </p>
                </div>
              ) : (
                (() => {
                  const date = activeDateForEditing;
                  const dateStr = date.toISOString().split('T')[0];
                  const slots = timeSlotsByDate[dateStr] || [];
                  const sessions = existingSessions[dateStr] || [];
                  
                  return (
                    <div key={dateStr} className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-white">
                          {date.toLocaleDateString('ru-RU', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long' 
                          })}
                        </h4>
                        <button
                          type="button"
                          onClick={() => addTimeSlot(dateStr)}
                          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1"
                        >
                          <span>+</span> Добавить время
                        </button>
                      </div>

                      {/* Существующие сеансы для этой даты */}
                      {sessions.length > 0 && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <p className="text-xs font-medium text-gray-300 mb-2">
                            Занятые времена:
                          </p>
                          <div className="space-y-1">
                            {sessions.map((session) => {
                              const start = new Date(session.startTime);
                              const end = new Date(session.endTime);
                              const endWithBreak = new Date(end.getTime() + BREAK_TIME_MINUTES * 60000);
                              
                              return (
                                <div key={session.id} className="flex items-center justify-between text-xs">
                                  <span className="text-white">{session.movieTitle}</span>
                                  <span className="text-red-400">
                                    {start.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} - {endWithBreak.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                    <span className="text-gray-500 ml-1">(+20 мин)</span>
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Временные слоты */}
                      <div className="space-y-3">
                        {slots.map((slot, index) => (
                          <div key={slot.id} className="flex items-center gap-3">
                            <span className="text-sm text-gray-400 w-8">{index + 1}.</span>
                            
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">
                                  От <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="time"
                                  value={slot.from}
                                  onChange={(e) => {
                                    const newFromValue = e.target.value;
                                    
                                    // Вычисляем время "до" если есть полное время
                                    let calculatedTimeTo = slot.to;
                                    if (selectedMovie && newFromValue && newFromValue.includes(':')) {
                                      const parts = newFromValue.split(':');
                                      if (parts.length === 2 && parts[0] && parts[1]) {
                                        const hours = parseInt(parts[0]);
                                        const minutes = parseInt(parts[1]);
                                        if (!isNaN(hours) && !isNaN(minutes)) {
                                          const startMinutes = hours * 60 + minutes;
                                          const endMinutes = startMinutes + selectedMovie.durationMinutes;
                                          const endHours = Math.floor(endMinutes / 60);
                                          const endMins = endMinutes % 60;
                                          calculatedTimeTo = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
                                        }
                                      }
                                    }
                                    
                                    // Обновляем оба поля одновременно
                                    const newTimeSlots = {
                                      ...timeSlotsByDate,
                                      [dateStr]: timeSlotsByDate[dateStr].map(s => 
                                        s.id === slot.id ? { ...s, from: newFromValue, to: calculatedTimeTo } : s
                                      )
                                    };
                                    updateCurrentHallData({ timeSlotsByDate: newTimeSlots });
                                  }}
                                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#e50914]"
                                  required
                                />
                              </div>
                              
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">
                                  До <span className="text-gray-500">(авто)</span>
                                </label>
                                <input
                                  type="time"
                                  value={slot.to}
                                  readOnly
                                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 text-sm cursor-not-allowed"
                                />
                              </div>
                            </div>

                            {/* Индикатор доступности */}
                            {slot.from && (
                              <div className="w-8">
                                {isTimeSlotAvailable(dateStr, slot.from, slot.id) ? (
                                  <Check className="w-5 h-5 text-green-400" />
                                ) : (
                                  <X className="w-5 h-5 text-red-400" />
                                )}
                              </div>
                            )}

                            {/* Кнопка удаления */}
                            {slots.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeTimeSlot(dateStr, slot.id)}
                                className="p-2 text-red-400 hover:text-red-300 transition-colors"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Предупреждение о недоступных слотах */}
                      {slots.some(slot => slot.from && !isTimeSlotAvailable(dateStr, slot.from, slot.id)) && (
                        <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <p className="text-xs text-red-400">
                            ⚠️ Некоторые временные слоты недоступны. Учитывайте 20-минутный перерыв.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}

              {/* Дополнительные параметры */}
              <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                <p className="text-sm font-medium text-gray-300 mb-4">Дополнительные параметры</p>
                
                <div className={`grid grid-cols-1 gap-4 ${hasVipSeats ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Базовая цена <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={basePrice}
                      onChange={(e) => updateCurrentHallData({ basePrice: e.target.value })}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#e50914] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      required
                    />
                  </div>
                  
                  {hasVipSeats && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        VIP цена <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={vipPrice}
                        onChange={(e) => updateCurrentHallData({ vipPrice: e.target.value })}
                        placeholder="0"
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#e50914] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        required
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Язык</label>
                    <select
                      value={language}
                      onChange={(e) => updateCurrentHallData({ language: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#e50914]"
                    >
                      <option value="original">Оригинал</option>
                      <option value="dubbed">Дубляж</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Формат</label>
                    <select
                      value={format}
                      onChange={(e) => updateCurrentHallData({ format: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#e50914]"
                    >
                      <option value="TWO_D">2D</option>
                      <option value="THREE_D">3D</option>
                      <option value="IMAX">IMAX</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Кнопка создания */}
              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || Object.keys(hallsData).length === 0}
                  className="px-8 py-3 bg-[#e50914] hover:bg-[#c50812] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Создание...
                    </span>
                  ) : (
                    (() => {
                      // Подсчитываем общее количество слотов для всех залов
                      const totalSlots = Object.values(hallsData).reduce((sum, hallData) => {
                        return sum + Object.values(hallData.timeSlotsByDate).reduce((hallSum, slots) => hallSum + slots.length, 0);
                      }, 0);
                      return `Создать ${totalSlots} ${totalSlots === 1 ? 'сеанс' : totalSlots < 5 ? 'сеанса' : 'сеансов'}`;
                    })()
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
