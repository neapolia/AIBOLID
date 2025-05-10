import { NextResponse } from 'next/server';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!);

export async function GET() {
  try {
    // Добавляем поле count, если его нет
    await sql`
      ALTER TABLE polina_products 
      ADD COLUMN IF NOT EXISTS count INTEGER NOT NULL DEFAULT 0;
    `;

    // Обновляем количество для всех продуктов
    await sql`
      UPDATE polina_products p
      SET count = COALESCE(
        (SELECT s.count 
         FROM polina_storage s 
         WHERE s.product_id = p.id), 
        0
      );
    `;

    return NextResponse.json({
      success: true,
      message: 'Products updated successfully'
    });
  } catch (error) {
    console.error('Error updating products:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 