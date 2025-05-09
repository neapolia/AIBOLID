import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)"
  ]
};

export function middleware(request: NextRequest) {
  // Временно пропускаем все запросы без проверки авторизации
  return NextResponse.next();
}