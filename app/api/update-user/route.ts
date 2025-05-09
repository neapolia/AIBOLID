import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Генерируем хеш пароля
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Обновляем пароль пользователя
    const result = await sql`
      UPDATE polina_users 
      SET 
        password = ${hashedPassword}
      WHERE email = 'director@example.com'
      RETURNING id, email, role;
    `;

    if (!result || result.length === 0) {
      throw new Error('Пользователь не найден');
    }

    return NextResponse.json({ 
      success: true, 
      message: "Пароль успешно обновлен",
      user: result[0]
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Ошибка при обновлении пароля",
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 