import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ControllerDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "controller") {
    redirect("/controller/login");
  }

  return (
    <div className="min-h-screen bg-[#0c1321] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Панель контроллера</h1>
            <p className="text-gray-400 mt-1">Добро пожаловать, {session.user.name}</p>
          </div>
          <form
            action={async () => {
              "use server";
              const { signOut } = await import("@/lib/auth");
              await signOut({ redirectTo: "/controller/login" });
            }}
          >
            <button
              type="submit"
              className="px-6 py-3 bg-[#e50914] hover:bg-[#f40612] text-white font-medium rounded-lg transition-colors"
            >
              Выйти
            </button>
          </form>
        </div>

        {/* Content */}
        <div className="bg-[#121d2e] border border-gray-700 rounded-lg p-8">
          <h2 className="text-xl font-bold mb-4">Функционал контроллера</h2>
          <p className="text-gray-400">
            Здесь будет функционал для контроллеров (сканирование билетов, проверка и т.д.)
          </p>
        </div>
      </div>
    </div>
  );
}
