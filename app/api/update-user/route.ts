import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Проверяем существование пользователя
    const existingUser = await sql`
      SELECT * FROM polina_users 
      WHERE email = 'director@example.com'
    `;

    if (!existingUser || existingUser.length === 0) {
      console.error('User not found');
      return NextResponse.json(
        { success: false, message: "Пользователь не найден" },
        { status: 404 }
      );
    }

    // Генерируем хеш нового пароля
    const hashedPassword = await bcrypt.hash("admin123", 10);
    console.log('Password hashed successfully');

    // Обновляем данные пользователя
    const result = await sql`
      UPDATE polina_users 
      SET 
        email = 'admin',
        password = ${hashedPassword}
      WHERE email = 'director@example.com'
      RETURNING *
    `;

    console.log('Update result:', result);

    if (!result || result.length === 0) {
      throw new Error('Failed to update user');
    }

    return NextResponse.json({ 
      success: true, 
      message: "Данные пользователя успешно обновлены",
      user: {
        email: result[0].email,
        // Не возвращаем пароль в ответе
      }
    });
  } catch (error) {
    console.error('Detailed error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Ошибка при обновлении данных пользователя",
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 