import { NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!);

export async function GET() {
  try {
    // Проверяем подключение к базе данных
    console.log('Checking database connection...');
    
    // Проверяем существование таблицы polina_products
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'polina_products'
      );
    `;
    console.log('Table exists:', tableExists[0].exists);

    if (tableExists[0].exists) {
      // Получаем количество записей в таблице
      const count = await sql`
        SELECT COUNT(*) FROM polina_products;
      `;
      console.log('Number of products:', count[0].count);

      // Получаем первые 5 записей
      const products = await sql`
        SELECT * FROM polina_products LIMIT 5;
      `;
      console.log('Sample products:', products);

      return NextResponse.json({
        success: true,
        tableExists: true,
        count: count[0].count,
        sampleProducts: products
      });
    }

    return NextResponse.json({
      success: true,
      tableExists: false,
      message: 'Table polina_products does not exist'
    });
  } catch (error) {
    console.error('Database check error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 