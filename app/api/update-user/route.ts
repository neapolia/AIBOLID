import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Генерируем хеш нового пароля
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Обновляем данные пользователя
    await sql`
      UPDATE polina_users 
      SET 
        email = 'admin',
        password = ${hashedPassword}
      WHERE email = 'director@example.com'
    `;

    return NextResponse.json({ 
      success: true, 
      message: "Данные пользователя успешно обновлены" 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, message: "Ошибка при обновлении данных пользователя" },
      { status: 500 }
    );
  }
} 