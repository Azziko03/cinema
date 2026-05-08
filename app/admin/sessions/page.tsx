import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SessionsClient from "./SessionsClient";

export default async function AdminSessionsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  // Получаем сеансы с детальной информацией о местах
  const sessionsRaw = await prisma.session.findMany({
    include: {
      movie: {
        include: {
          mediaFiles: true,
          translations: true,
        },
      },
      hall: {
        include: {
          seats: true,
        },
      },
      orderItems: {
        include: {
          seat: true,
        },
      },
    },
    orderBy: { startTime: "asc" },
    take: 50,
  });

  // Получаем фильмы для модалки
  const movies = await prisma.movie.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      translations: true,
      mediaFiles: true,
    },
  });

  // Получаем залы
  const halls = await prisma.hall.findMany({
    orderBy: { name: "asc" },
  });

  // Преобразуем данные и добавляем статистику по местам
  const sessions = sessionsRaw.map((s) => {
    // Подсчитываем VIP и обычные места в зале
    const vipSeatsTotal = s.hall.seats.filter(seat => seat.isVip && seat.isActive).length;
    const regularSeatsTotal = s.hall.seats.filter(seat => !seat.isVip && seat.isActive).length;
    
    // Подсчитываем занятые VIP и обычные места
    const occupiedVipSeats = s.orderItems.filter(item => item.seat.isVip).length;
    const occupiedRegularSeats = s.orderItems.filter(item => !item.seat.isVip).length;

    return {
      id: s.id,
      startTime: s.startTime,
      endTime: s.endTime,
      basePrice: Number(s.basePrice),
      language: s.language,
      format: s.format,
      movie: s.movie,
      hall: {
        id: s.hall.id,
        name: s.hall.name,
        totalSeats: s.hall.totalSeats,
      },
      seatsInfo: {
        vipSeatsTotal,
        regularSeatsTotal,
        occupiedVipSeats,
        occupiedRegularSeats,
        totalOccupied: s.orderItems.length,
      },
    };
  });

  return (
    <SessionsClient
      initialSessions={sessions}
      movies={movies}
      halls={halls}
    />
  );
}
