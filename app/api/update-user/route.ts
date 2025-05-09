import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    console.log('Starting user update process...');
    
    // Проверяем подключение к базе данных
    try {
      await sql`SELECT 1`;
      console.log('Database connection successful');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      throw new Error('Failed to connect to database');
    }

    // Проверяем существование таблицы
    try {
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'polina_users'
        );
      `;
      console.log('Table check result:', tableCheck);
    } catch (tableError) {
      console.error('Table check error:', tableError);
      throw new Error('Failed to check table existence');
    }

    // Удаляем старого пользователя
    try {
      const deleteResult = await sql`
        DELETE FROM polina_users 
        WHERE email = 'director@example.com'
        RETURNING id;
      `;
      console.log('Delete result:', deleteResult);
    } catch (deleteError) {
      console.error('Delete error:', deleteError);
      throw new Error('Failed to delete old user');
    }

    // Генерируем хеш пароля
    try {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      console.log('Password hashed successfully');

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
        RETURNING id, email, role;
      `;
      console.log('Insert result:', result);

      return NextResponse.json({ 
        success: true, 
        message: "Пользователь успешно создан",
        user: result[0]
      });
    } catch (insertError) {
      console.error('Insert error:', insertError);
      throw new Error('Failed to create new user');
    }
  } catch (error) {
    console.error('Detailed error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Ошибка при создании пользователя",
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 