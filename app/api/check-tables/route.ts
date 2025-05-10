import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

interface TableResult {
  exists: boolean;
  count?: number;
  error?: string;
}

interface TableResults {
  [key: string]: TableResult;
}

export async function GET() {
  try {
    const results: TableResults = {};

    // Проверяем таблицу products
    try {
      const productsCount = await sql`
        SELECT COUNT(*) as count FROM polina_products
      `;
      results.polina_products = {
        exists: true,
        count: Number(productsCount.rows[0].count)
      };
    } catch (error) {
      results.polina_products = {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Проверяем таблицу providers
    try {
      const providersCount = await sql`
        SELECT COUNT(*) as count FROM polina_providers
      `;
      results.polina_providers = {
        exists: true,
        count: Number(providersCount.rows[0].count)
      };
    } catch (error) {
      results.polina_providers = {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Проверяем таблицу storage_history
    try {
      const historyCount = await sql`
        SELECT COUNT(*) as count FROM polina_storage_history
      `;
      results.polina_storage_history = {
        exists: true,
        count: Number(historyCount.rows[0].count)
      };
    } catch (error) {
      results.polina_storage_history = {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    return NextResponse.json({
      success: true,
      tables: results
    });
  } catch (error) {
    console.error('Error checking tables:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 