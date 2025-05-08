import { auth } from "./auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Настраиваем matcher для middleware
export const config = {
  matcher: [
    // Исключаем API роуты и статические файлы
    "/((?!api|_next/static|_next/image|favicon.ico).*)"
  ]
};

// Middleware для проверки аутентификации
export default auth((req: NextRequest & { auth?: { user?: { role?: string } } }) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isOnApprove = req.nextUrl.pathname.startsWith("/dashboard/approve");

  if (isOnApprove) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
    if (req.auth?.user?.role !== "director") {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
  }

  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
});