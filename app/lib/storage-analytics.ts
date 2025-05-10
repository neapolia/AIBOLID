"use server";

import postgres from "postgres";
import { StorageAnalytics } from "./types";

const sql = postgres(process.env.POSTGRES_URL!);

export async function getStorageAnalytics(): Promise<StorageAnalytics> {
  try {
    // Получаем общую статистику, объединяя products и storage
    const totalStats = await sql`
      SELECT 
        COUNT(DISTINCT p.id) as total_products,
        SUM(CASE WHEN COALESCE(s.count, 0) <= 5 THEN 1 ELSE 0 END) as low_stock_products,
        SUM(p.price * COALESCE(s.count, 0)) as total_value
      FROM polina_products p
      LEFT JOIN polina_storage s ON p.id = s.product_id
    `;

    // Получаем топ продуктов по количеству
    const topProducts = await sql`
      SELECT 
        p.id,
        p.name,
        p.article,
        p.price,
        COALESCE(s.count, 0) as count,
        pp.name as provider_name
      FROM polina_products p
      LEFT JOIN polina_storage s ON p.id = s.product_id
      LEFT JOIN polina_providers pp ON p.provider_id = pp.id
      ORDER BY COALESCE(s.count, 0) DESC
      LIMIT 5
    `;

    // Получаем распределение по поставщикам
    const providerDistribution = await sql`
      SELECT 
        pp.name as provider_name,
        COUNT(DISTINCT p.id) as product_count,
        SUM(p.price * COALESCE(s.count, 0)) as total_value
      FROM polina_products p
      LEFT JOIN polina_storage s ON p.id = s.product_id
      JOIN polina_providers pp ON p.provider_id = pp.id
      GROUP BY pp.name
      ORDER BY product_count DESC
    `;

    // Движение товаров по месяцам из истории
    const monthlyMovements = await sql`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as total_movements,
        SUM(count) as total_value
      FROM polina_storage_history
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
      LIMIT 12
    `;

    if (!totalStats || totalStats.length === 0) {
      throw new Error('Failed to fetch total statistics');
    }

    return {
      totalProducts: Number(totalStats[0].total_products),
      lowStockProducts: Number(totalStats[0].low_stock_products),
      totalValue: Number(totalStats[0].total_value),
      topProducts: topProducts.map(p => ({
        id: p.id,
        name: p.name,
        article: p.article,
        count: Number(p.count),
        price: Number(p.price),
        provider_name: p.provider_name
      })),
      providerDistribution: providerDistribution.map(p => ({
        provider_name: p.provider_name,
        product_count: Number(p.product_count),
        total_value: Number(p.total_value)
      })),
      monthlyMovements: monthlyMovements?.map(row => ({
        month: row.month?.toISOString() || new Date().toISOString(),
        total_movements: Number(row.total_movements || 0),
        total_value: Number(row.total_value || 0)
      })) || []
    };
  } catch (error) {
    console.error('Error fetching storage analytics:', error);
    return {
      totalProducts: 0,
      lowStockProducts: 0,
      totalValue: 0,
      topProducts: [],
      providerDistribution: [],
      monthlyMovements: []
    };
  }
} 