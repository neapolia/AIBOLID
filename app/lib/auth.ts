'use server';

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!);

export type UserRole = 'admin' | 'director';

// Простая проверка логина и пароля
export async function login(email: string, password: string) {
  try {
    const user = await sql`
      SELECT id, email, role 
      FROM polina_users 
      WHERE email = ${email} AND password_hash = ${password}
    `;

    if (!user.length) return null;

    // Сохраняем только роль в куки
    cookies().set('userRole', user[0].role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 часа
    });

    return user[0];
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

// Получить текущую роль пользователя
export async function getCurrentRole() {
  return cookies().get('userRole')?.value as UserRole | undefined;
}

// Проверка доступа для защищенных маршрутов
export async function requireAuth(request: NextRequest, allowedRoles?: UserRole[]) {
  const role = request.cookies.get('userRole')?.value as UserRole;
  
  if (!role) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return role;
} 