import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)"
  ]
};

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/login');

    // Если пользователь авторизован и на странице логина — редирект на главную
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Если пользователь не авторизован и НЕ на странице логина — редирект на логин
    if (!isAuth && !isAuthPage) {
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

    // Если всё ок — пропускаем дальше
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);