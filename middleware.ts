import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Helper функция для создания redirect с ngrok заголовками
function createRedirect(url: string, req: any) {
  const redirectResponse = NextResponse.redirect(new URL(url, req.url));
  redirectResponse.headers.set('ngrok-skip-browser-warning', 'true');
  redirectResponse.headers.set('x-middleware-rewrite', new URL(url, req.url).toString());
  return redirectResponse;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Логирование для отладки
  console.log(`[Middleware] ${pathname} - User: ${isLoggedIn ? userRole : 'guest'}`);

  // Создаем response
  const response = NextResponse.next();

  // Добавляем заголовки для ngrok
  response.headers.set('ngrok-skip-browser-warning', 'true');
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Публичные роуты
  const isPublicRoute = 
    pathname === "/" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/admin/login") ||
    pathname.startsWith("/api/admin/verify-code") ||
    pathname.startsWith("/api/movies") ||
    pathname.startsWith("/api/translations") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/public") ||
    pathname.includes(".");  // Файлы с расширениями (изображения, шрифты и т.д.)

  // Роуты авторизации для обычных пользователей
  const isUserAuthRoute = 
    pathname.startsWith("/auth/signin") ||
    pathname.startsWith("/auth/signup") ||
    pathname.startsWith("/auth/verify") ||
    pathname.startsWith("/auth/forgot-password") ||
    pathname.startsWith("/auth/reset-password");

  // Роут авторизации для админов
  const isAdminLoginRoute = pathname === "/admin/login";

  // Роут авторизации для контроллеров
  const isControllerLoginRoute = pathname === "/controller/login";

  // Защищенные роуты для обычных пользователей
  const isUserProtectedRoute = 
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/tickets");

  // Админские роуты (кроме логина)
  const isAdminRoute = pathname.startsWith("/admin") && !isAdminLoginRoute;

  // Роуты контроллеров (кроме логина)
  const isControllerRoute = pathname.startsWith("/controller") && !isControllerLoginRoute;

  // Если админ авторизован
  if (isLoggedIn && userRole === "admin") {
    // Админ не может заходить на страницы обычных пользователей (кроме AI) и контроллеров
    if (isUserAuthRoute || isControllerRoute || isControllerLoginRoute) {
      console.log('[Middleware] Admin redirect from user/controller route');
      return createRedirect("/admin/dashboard", req);
    }
    // Если админ авторизован и пытается зайти на страницу логина админа
    if (isAdminLoginRoute) {
      console.log('[Middleware] Admin redirect from login');
      return createRedirect("/admin/dashboard", req);
    }
    // ВРЕМЕННО ОТКЛЮЧЕНО: Если админ на главной странице, перенаправляем в админку
    // if (pathname === "/") {
    //   console.log('[Middleware] Admin redirect from home');
    //   return createRedirect("/admin/dashboard", req);
    // }
  }

  // Если контроллер авторизован
  if (isLoggedIn && userRole === "controller") {
    // Контроллер не может заходить на страницы пользователей (кроме AI) и админов
    if (isUserAuthRoute || isAdminRoute || isAdminLoginRoute) {
      console.log('[Middleware] Controller redirect from user/admin route');
      return createRedirect("/controller/dashboard", req);
    }
    // Если контроллер авторизован и пытается зайти на страницу логина контроллера
    if (isControllerLoginRoute) {
      console.log('[Middleware] Controller redirect from login');
      return createRedirect("/controller/dashboard", req);
    }
    // ВРЕМЕННО ОТКЛЮЧЕНО: Если контроллер на главной странице, перенаправляем в панель контроллера
    // if (pathname === "/") {
    //   console.log('[Middleware] Controller redirect from home');
    //   return createRedirect("/controller/dashboard", req);
    // }
  }

  // Если обычный пользователь авторизован
  if (isLoggedIn && userRole === "user") {
    // Обычный пользователь не может заходить на админские страницы и страницы контроллеров
    if (isAdminRoute || isAdminLoginRoute || isControllerRoute || isControllerLoginRoute) {
      return createRedirect("/", req);
    }
    // Если пользователь авторизован и пытается зайти на страницы auth
    if (isUserAuthRoute) {
      return createRedirect("/", req);
    }
  }

  // Если пользователь не авторизован
  if (!isLoggedIn) {
    // Пытается зайти на защищенные роуты пользователя
    if (isUserProtectedRoute) {
      return createRedirect("/auth/signin", req);
    }
    // Пытается зайти на админские роуты
    if (isAdminRoute) {
      return createRedirect("/admin/login", req);
    }
    // Пытается зайти на роуты контроллеров
    if (isControllerRoute) {
      return createRedirect("/controller/login", req);
    }
  }

  return response;
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
