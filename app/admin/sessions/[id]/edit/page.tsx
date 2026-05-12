import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditSessionClient from "./EditSessionClient";

export default async function EditSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  // Await params before using
  const { id } = await params;

  // Получаем сеанс для редактирования
  const sessionData = await prisma.session.findUnique({
    where: { id },
    include: {
      movie: {
        include: {
          translations: true,
          mediaFiles: true,
        },
      },
      hall: {
        include: {
          seats: {
            where: { isVip: true, isActive: true },
            select: { id: true },
          },
        },
      },
    },
  });

  if (!sessionData) {
    redirect("/admin/sessions");
  }

  // Преобразуем Decimal в number для клиентского компонента
  const sessionForClient = {
    ...sessionData,
    basePrice: Number(sessionData.basePrice),
    vipPrice: sessionData.vipPrice ? Number(sessionData.vipPrice) : null,
  };

  // Получаем все фильмы
  const movies = await prisma.movie.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      translations: true,
      mediaFiles: true,
    },
  });

  // Получаем все залы с информацией о VIP местах
  const halls = await prisma.hall.findMany({
    orderBy: { name: "asc" },
    include: {
      seats: {
        where: { isVip: true, isActive: true },
        select: { id: true },
      },
    },
  });

  return (
    <EditSessionClient
      session={sessionForClient}
      movies={movies}
      halls={halls}
    />
  );
}
