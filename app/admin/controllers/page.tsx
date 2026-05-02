import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ControllersClient from "./ControllersClient";

const ITEMS_PER_PAGE = 50;

export default async function AdminControllersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  // Await searchParams
  const params = await searchParams;

  // Получение параметров из URL
  const search = typeof params.search === "string" ? params.search : "";
  const status = typeof params.status === "string" ? params.status : "all";
  const emailVerified = typeof params.emailVerified === "string" ? params.emailVerified : "all";
  const sortBy = typeof params.sortBy === "string" ? params.sortBy : "createdAt";
  const sortOrder = typeof params.sortOrder === "string" ? params.sortOrder : "desc";
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;

  // Построение фильтров для Prisma
  const where: any = {
    role: "controller",
  };

  // Поиск по имени или email
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  // Фильтр по статусу
  if (status !== "all") {
    where.status = status;
  }

  // Фильтр по подтверждению email
  if (emailVerified !== "all") {
    where.emailVerified = emailVerified === "true";
  }

  // Сортировка
  const orderBy: any = {};
  if (sortBy === "createdAt" || sortBy === "updatedAt" || sortBy === "fullName" || sortBy === "email") {
    orderBy[sortBy] = sortOrder;
  }

  // Получение общего количества
  const totalCount = await prisma.user.count({ where });

  // Вычисление пагинации
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const currentPage = Math.max(1, Math.min(page, totalPages || 1));
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // Получение контроллеров
  const controllers = await prisma.user.findMany({
    where,
    orderBy,
    skip,
    take: ITEMS_PER_PAGE,
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      status: true,
      image: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Создаем уникальный ключ на основе параметров для принудительного ре-рендера
  const key = `${search}-${status}-${emailVerified}-${sortBy}-${sortOrder}-${currentPage}`;

  return (
    <ControllersClient
      key={key}
      initialControllers={controllers}
      totalCount={totalCount}
      currentPage={currentPage}
      totalPages={totalPages}
    />
  );
}
