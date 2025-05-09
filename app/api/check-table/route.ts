import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Получаем структуру таблицы
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'polina_users'
      ORDER BY ordinal_position;
    `;

    // Получаем существующих пользователей
    const users = await sql`
      SELECT id, email, role, created_at
      FROM polina_users;
    `;

    return NextResponse.json({
      success: true,
      tableStructure: tableInfo,
      existingUsers: users
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка при проверке таблицы",
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 