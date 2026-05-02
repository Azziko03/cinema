"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Select from "@/components/Select";

interface Controller {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  image: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ControllersClientProps {
  initialControllers: Controller[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export default function ControllersClient({ 
  initialControllers, 
  totalCount, 
  currentPage, 
  totalPages 
}: ControllersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Фильтры и сортировка из URL
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const status = searchParams.get("status") || "all";
  const emailVerified = searchParams.get("emailVerified") || "all";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  // Обновление URL и данных
  const updateFilters = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== "all") {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    
    // Сброс на первую страницу при изменении фильтров
    if (!params.page) {
      newParams.delete("page");
    }
    
    router.push(`/admin/controllers?${newParams.toString()}`);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    const timeoutId = setTimeout(() => {
      updateFilters({ search: value, page: "1" });
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этого контроллера?")) {
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/controllers?id=${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error deleting controller:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Контроллеры</h1>
        <p className="text-gray-400 mt-1">Управление контроллерами кинотеатра</p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        {/* Search and Add Button */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Поиск по имени или email..."
              className="w-full px-4 py-2.5 pl-10 bg-[#121d2e] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e50914] transition-colors"
            />
            <svg
              className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <Link
            href="/admin/controllers/create"
            className="px-6 py-2.5 bg-[#e50914] hover:bg-[#f40612] text-white font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            + Добавить контроллера
          </Link>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Filter */}
          <Select
            options={[
              { value: "all", label: "Все статусы" },
              { value: "active", label: "Активные" },
              { value: "inactive", label: "Неактивные" },
            ]}
            value={status}
            onChange={(value) => {
              updateFilters({ status: value, page: "1" });
            }}
            placeholder="Статус"
          />

          {/* Email Verified Filter */}
          <Select
            options={[
              { value: "all", label: "Все email" },
              { value: "true", label: "Email подтвержден" },
              { value: "false", label: "Email не подтвержден" },
            ]}
            value={emailVerified}
            onChange={(value) => {
              updateFilters({ emailVerified: value, page: "1" });
            }}
            placeholder="Email подтвержден"
          />

          {/* Sort By */}
          <Select
            options={[
              { value: "createdAt", label: "По дате создания" },
              { value: "updatedAt", label: "По дате обновления" },
              { value: "fullName", label: "По имени" },
              { value: "email", label: "По email" },
            ]}
            value={sortBy}
            onChange={(value) => {
              updateFilters({ sortBy: value });
            }}
            placeholder="Сортировать по"
          />

          {/* Sort Order */}
          <Select
            options={[
              { value: "desc", label: "По убыванию" },
              { value: "asc", label: "По возрастанию" },
            ]}
            value={sortOrder}
            onChange={(value) => {
              updateFilters({ sortOrder: value });
            }}
            placeholder="Порядок"
          />
        </div>
      </div>

      {/* Controllers Table */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Фото</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Имя</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Статус</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email подтвержден</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Дата создания</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Последнее обновление</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {initialControllers.map((controller) => (
                <tr key={controller.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center overflow-hidden">
                      {controller.image ? (
                        <img 
                          src={controller.image} 
                          alt={controller.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-cyan-500 font-semibold text-lg">
                          {controller.fullName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium">{controller.fullName}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {controller.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      controller.status === "active" 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {controller.status === "active" ? "Активен" : "Неактивен"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      controller.emailVerified 
                        ? "bg-blue-500/20 text-blue-400" 
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {controller.emailVerified ? "Да" : "Нет"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {new Date(controller.createdAt).toLocaleString("ru-RU", {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {new Date(controller.updatedAt).toLocaleString("ru-RU", {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/controllers/${controller.id}/edit`}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition-colors"
                        title="Редактировать"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(controller.id)}
                        disabled={isLoading}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors disabled:opacity-50"
                        title="Удалить"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {initialControllers.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <p className="text-gray-400 mb-4">Контроллеров не найдено</p>
              <Link
                href="/admin/controllers/create"
                className="inline-block px-6 py-3 bg-[#e50914] hover:bg-[#f40612] text-white font-medium rounded transition-colors"
              >
                Создать первого контроллера
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Pagination and Total Count */}
      <div className="mt-6 flex items-center justify-between">
        {totalPages > 1 ? (
          <>
            <p className="text-sm text-gray-400">
              Страница {currentPage} из {totalPages}
            </p>
            <div className="flex gap-2">
            <button
              onClick={() => updateFilters({ page: String(currentPage - 1) })}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-[#121d2e] border border-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-600 transition-colors"
            >
              Назад
            </button>
            
            {/* Page Numbers */}
            <div className="flex gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => updateFilters({ page: String(pageNum) })}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      pageNum === currentPage
                        ? "bg-[#e50914] text-white"
                        : "bg-[#121d2e] border border-gray-700 text-white hover:border-gray-600"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => updateFilters({ page: String(currentPage + 1) })}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-[#121d2e] border border-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-600 transition-colors"
            >
              Вперед
            </button>
            </div>
          </>
        ) : (
          <div className="flex-1"></div>
        )}
        <p className="text-sm text-gray-400">
          Всего контроллеров: {totalCount}
        </p>
      </div>
    </div>
  );
}
