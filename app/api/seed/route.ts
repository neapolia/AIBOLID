import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Хешируем пароли
    const directorPassword = await bcrypt.hash("director", 10);
    const userPassword = await bcrypt.hash("user", 10);

    // Добавляем пользователей
    await sql`
      INSERT INTO polina_users (name, email, password, role)
      VALUES 
        ('Director', 'director@example.com', ${directorPassword}, 'director'),
        ('User', 'user@example.com', ${userPassword}, 'user')
      ON CONFLICT (email) DO NOTHING;
    `;

    return NextResponse.json({ message: "Users seeded successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error seeding users:", error);
    return NextResponse.json({ error: "Failed to seed users" }, { status: 500 });
  }
} 