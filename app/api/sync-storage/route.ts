import { NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!);

export async function GET() {
  try {
    // 1. Сначала обновим количество в polina_products из polina_storage
    await sql`
      UPDATE polina_products p
      SET count = COALESCE(
        (SELECT s.count 
         FROM polina_storage s 
         WHERE s.product_id = p.id), 
        0
      );
    `;

    // 2. Затем обновим polina_storage из polina_products
    await sql`
      INSERT INTO polina_storage (product_id, count)
      SELECT id, count
      FROM polina_products p
      WHERE NOT EXISTS (
        SELECT 1 
        FROM polina_storage s 
        WHERE s.product_id = p.id
      );
    `;

    // 3. Обновим существующие записи в polina_storage
    await sql`
      UPDATE polina_storage s
      SET count = p.count
      FROM polina_products p
      WHERE s.product_id = p.id;
    `;

    // 4. Проверим результат
    const products = await sql`
      SELECT 
        p.id,
        p.name,
        p.count as product_count,
        s.count as storage_count
      FROM polina_products p
      LEFT JOIN polina_storage s ON p.id = s.product_id
      ORDER BY p.name;
    `;

    return NextResponse.json({
      success: true,
      message: 'Storage synchronized successfully',
      data: products
    });
  } catch (error) {
    console.error('Error synchronizing storage:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 