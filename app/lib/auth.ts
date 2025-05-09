'use server';

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Тестовый пользователь
const TEST_USER = {
  email: 'test@example.com',
  password: 'test123'
};

export async function login(email: string, password: string) {
  try {
    console.log('Attempting login with:', { email, password });
    
    // Простая проверка email и пароля
    if (email === TEST_USER.email && password === TEST_USER.password) {
      // Сохраняем email в куки
      cookies().set('userEmail', email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 часа
      });

      console.log('Login successful, cookie set');
      return { email };
    }

    console.log('Invalid credentials');
    return null;
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