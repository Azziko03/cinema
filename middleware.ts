import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Публичные роуты
  const isPublicRoute = 
    pathname === "/" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/admin/login") ||
    pathname.startsWith("/api/admin/verify-code") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/public");

  // Роуты авторизации для обычных пользователей
  const isUserAuthRoute = 
    pathname.startsWith("/auth/signin") ||
    pathname.startsWith("/auth/signup") ||
    pathname.startsWith("/auth/verify") ||
    pathname.startsWith("/auth/forgot-password") ||
    pathname.startsWith("/auth/reset-password");

  // Роут авторизации для админов
  const isAdminLoginRoute = pathname === "/admin/login";

  // Защищенные роуты для обычных пользователей
  const isUserProtectedRoute = 
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/tickets");

  // Админские роуты (кроме логина)
  const isAdminRoute = pathname.startsWith("/admin") && !isAdminLoginRoute;

  // Если админ авторизован
  if (isLoggedIn && userRole === "admin") {
    // Админ не может заходить на страницы обычных пользователей
    if (isUserAuthRoute || isUserProtectedRoute) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    // Если админ авторизован и пытается зайти на страницу логина админа
    if (isAdminLoginRoute) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    // Если админ на главной странице, перенаправляем в админку
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  }

  // Если обычный пользователь авторизован
  if (isLoggedIn && userRole === "user") {
    // Обычный пользователь не может заходить на админские страницы
    if (isAdminRoute || isAdminLoginRoute) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    // Если пользователь авторизован и пытается зайти на страницы auth
    if (isUserAuthRoute) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Если пользователь не авторизован
  if (!isLoggedIn) {
    // Пытается зайти на защищенные роуты пользователя
    if (isUserProtectedRoute) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
    // Пытается зайти на админские роуты
    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
