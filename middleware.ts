import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|login).*)"
  ]
};

export function middleware(request: NextRequest) {
  const email = request.cookies.get('userEmail')?.value;

  // Если нет email, перенаправляем на страницу входа
  if (!email) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Добавляем email в заголовки для удобства
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-email', email);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}