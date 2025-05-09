'use server';

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!);

export async function login(email: string, password: string) {
  try {
    console.log('Attempting login with:', { email, password });
    
    const user = await sql`
      SELECT id, email 
      FROM polina_users 
      WHERE email = ${email} AND password_hash = ${password}
    `;

    console.log('Query result:', user);

    if (!user.length) {
      console.log('No user found');
      return null;
    }

    // Сохраняем только email в куки
    cookies().set('userEmail', user[0].email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 часа
    });

    console.log('Login successful, cookie set');
    return user[0];
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

export async function getCurrentUser() {
  return cookies().get('userEmail')?.value;
}

export async function requireAuth(request: NextRequest) {
  const email = request.cookies.get('userEmail')?.value;
  
  if (!email) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return email;
} 