import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import HallsClient from "./HallsClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminHallsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  const halls = await prisma.hall.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          seats: true,
          sessions: true,
        },
      },
    },
  });

  return <HallsClient initialHalls={halls} />;
}
