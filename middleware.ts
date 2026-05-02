import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Публичные роуты
  const isPublicRoute = 
    pathname.startsWith("/auth") ||
    pathname === "/" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/public");

  // Защищенные роуты (требуют авторизации)
  const isProtectedRoute = 
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/tickets");

  // Админские роуты
  const isAdminRoute = pathname.startsWith("/admin");

  // Если пользователь не авторизован и пытается зайти на защищенный роут
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  // Если пользователь авторизован и пытается зайти на страницы auth
  if (isLoggedIn && pathname.startsWith("/auth/signin")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isLoggedIn && pathname.startsWith("/auth/signup")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Проверка прав доступа для админских роутов
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
    if (req.auth?.user?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
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
