import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Проверяем подключение к базе данных
    const result = await sql`
      SELECT 
        p.id,
        p.name,
        p.article,
        p.count,
        p.price,
        pp.name as provider_name
      FROM polina_products p
      LEFT JOIN polina_providers pp ON p.provider_id = pp.id
      ORDER BY p.name
    `;

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: result.rows
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 