import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Сначала удалим старого пользователя
    await sql`
      DELETE FROM polina_users 
      WHERE email = 'director@example.com'
    `;

    // Генерируем хеш пароля
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Создаем нового пользователя
    const result = await sql`
      INSERT INTO polina_users (
        id,
        name,
        email,
        password,
        role,
        created_at,
        updated_at
      ) VALUES (
        uuid_generate_v4(),
        'Admin',
        'admin',
        ${hashedPassword},
        'director',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING id, email, role
    `;

    return NextResponse.json({ 
      success: true, 
      message: "Пользователь успешно создан",
      user: result[0]
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Ошибка при создании пользователя",
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 