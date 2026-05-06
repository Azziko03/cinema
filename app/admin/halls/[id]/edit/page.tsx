import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditHallClient from "./EditHallClient";

export default async function EditHallPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  const { id } = await params;

  // Получаем данные зала
  const hall = await prisma.hall.findUnique({
    where: { id },
    include: {
      seats: {
        orderBy: [{ rowNumber: "asc" }, { seatNumber: "asc" }],
      },
    },
  });

  if (!hall) {
    redirect("/admin/halls");
  }

  return <EditHallClient hall={hall} />;
}