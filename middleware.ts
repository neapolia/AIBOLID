import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Явно указываем использование Node.js runtime
export const runtime = 'nodejs';

// Конфигурация для middleware
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)"
  ]
};

// Middleware для проверки аутентификации
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/login');

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL('/', req.url));
      }
      return null;
    }

    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    // Проверка роли для страницы approval
    if (req.nextUrl.pathname.startsWith('/approval')) {
      if (token?.role !== 'director') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);