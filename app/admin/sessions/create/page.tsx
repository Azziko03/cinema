import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CreateSessionClient from "./CreateSessionClient";

export default async function CreateSessionPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  // Получаем фильмы
  const movies = await prisma.movie.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      translations: true,
      mediaFiles: true,
    },
  });

  // Получаем залы с информацией о VIP местах
  const halls = await prisma.hall.findMany({
    orderBy: { name: "asc" },
    include: {
      seats: {
        where: { isVip: true, isActive: true },
        select: { id: true },
      },
    },
  });

  return <CreateSessionClient movies={movies} halls={halls} />;
}
