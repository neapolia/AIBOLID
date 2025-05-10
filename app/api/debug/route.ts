import { NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!);

export async function GET() {
  try {
    // Проверяем подключение к базе данных
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

    // Проверяем данные в таблице поставщиков
    const providers = await sql`
      SELECT * FROM polina_providers
    `;

    // Проверяем данные в таблице продуктов
    const products = await sql`
      SELECT * FROM polina_products
    `;

    return NextResponse.json({
      success: true,
      tables: tables.map(t => t.table_name),
      providers,
      products,
      dbUrl: process.env.POSTGRES_URL ? 'URL is set' : 'URL is not set'
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      dbUrl: process.env.POSTGRES_URL ? 'URL is set' : 'URL is not set'
    }, { status: 500 });
  }
} 