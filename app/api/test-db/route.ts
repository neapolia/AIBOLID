import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

interface TableExists {
  exists: boolean;
}

interface ProductCount {
  count: string;
}

interface Product {
  id: string;
  name: string;
  provider_id: string;
  price: number;
  article: string;
  count: number;
}

export async function GET() {
  try {
    // Проверяем подключение к базе данных
    await sql`SELECT 1`;
    console.log('Checking database connection...');

    // Проверяем существование таблицы
    const tableExists = await sql<TableExists>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'polina_products'
      );
    `;
    console.log('Table exists:', tableExists.rows[0].exists);

    // Получаем количество продуктов
    const productCount = await sql<ProductCount>`
      SELECT COUNT(*) as count FROM polina_products;
    `;
    console.log('Number of products:', productCount.rows[0].count);

    // Получаем примеры продуктов с количеством из polina_storage
    const products = await sql<Product>`
      SELECT 
        p.id,
        p.name,
        p.provider_id,
        p.price,
        p.article,
        COALESCE(s.count, 0) as count
      FROM polina_products p
      LEFT JOIN polina_storage s ON p.id = s.product_id
      ORDER BY p.name
      LIMIT 5;
    `;
    console.log('Sample products:', products.rows);

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      data: {
        tableExists: tableExists.rows[0].exists,
        productCount: productCount.rows[0].count,
        products: products.rows
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 