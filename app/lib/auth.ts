'use server';

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, SignJWT, JWTPayload } from 'jose';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!);

export type UserRole = 'admin' | 'director';

export interface User extends JWTPayload {
  id: string;
  email: string;
  role: UserRole;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function signJWT(payload: User) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as User;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser() {
  const token = cookies().get('token')?.value;
  if (!token) return null;
  return await verifyJWT(token);
}

export async function login(email: string, password: string) {
  try {
    const user = await sql`
      SELECT id, email, password_hash, role 
      FROM polina_users 
      WHERE email = ${email}
    `;

    if (!user.length) return null;

    // In production, use proper password hashing
    const isValid = user[0].password_hash === password;
    if (!isValid) return null;

    const { password_hash: _, ...userWithoutPassword } = user[0];
    const userData: User = {
      id: userWithoutPassword.id,
      email: userWithoutPassword.email,
      role: userWithoutPassword.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
    };
    const token = await signJWT(userData);

    return { user: userData, token };
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

export async function requireAuth(
  request: NextRequest,
  allowedRoles?: UserRole[]
) {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const user = await verifyJWT(token);
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return user;
} 