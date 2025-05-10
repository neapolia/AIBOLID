import { NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!);

export async function GET() {
  try {
    // Проверяем подключение к базе данных
    const products = await sql`
      SELECT 
        p.id,
        p.name,
        p.article,
        p.price,
        p.count,
        p.provider_id,
        pp.name as provider_name
      FROM polina_products p
      LEFT JOIN polina_providers pp ON p.provider_id = pp.id
      ORDER BY p.name ASC
    `;

    return NextResponse.json({
      success: true,
      products: products,
      count: products.length
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 