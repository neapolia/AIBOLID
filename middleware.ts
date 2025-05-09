import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|login).*)"
  ]
};

export function middleware(request: NextRequest) {
  const role = request.cookies.get('userRole')?.value;

  // Если нет роли, перенаправляем на страницу входа
  if (!role) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Добавляем роль в заголовки для удобства
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-role', role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}