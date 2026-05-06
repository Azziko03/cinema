import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateHallClient from "./CreateHallClient";

export default async function CreateHallPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  return <CreateHallClient />;
}
