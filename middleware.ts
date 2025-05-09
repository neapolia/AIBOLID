import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from './app/lib/auth';

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ]
};

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  // Allow access to login page and API routes
  if (request.nextUrl.pathname.startsWith('/login') || 
      request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const user = await verifyJWT(token);
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Add user info to request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', user.id);
  requestHeaders.set('x-user-role', user.role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}