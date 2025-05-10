"use server";

import postgres from "postgres";
import { StorageAnalytics } from "./types";

const sql = postgres(process.env.POSTGRES_URL!);

export async function getStorageAnalytics(): Promise<StorageAnalytics> {
  try {
    // Общая статистика
    const totalStats = await sql`
      SELECT 
        COUNT(*) as total_products,
        COALESCE(SUM(price * count), 0) as total_value
      FROM polina_products
    `;

    // Товары с низким остатком
    const lowStockProducts = await sql`
      SELECT 
        id,
        name,
        article,
        count
      FROM polina_products
      WHERE count <= 5
      ORDER BY count ASC
    `;

    // Топ товаров по количеству
    const topProducts = await sql`
      SELECT 
        id,
        name,
        article,
        count
      FROM polina_products
      ORDER BY count DESC
      LIMIT 5
    `;

    // Распределение по поставщикам
    const providerDistribution = await sql`
      SELECT 
        p.provider_id,
        pp.name as provider_name,
        COUNT(*) as product_count,
        COALESCE(SUM(p.price * p.count), 0) as total_value
      FROM polina_products p
      JOIN polina_providers pp ON p.provider_id = pp.id
      GROUP BY p.provider_id, pp.name
      ORDER BY total_value DESC
    `;

    // Движение товаров по месяцам
    const monthlyMovements = await sql`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COALESCE(SUM(CASE WHEN operation = 'add' THEN count ELSE 0 END), 0) as additions,
        COALESCE(SUM(CASE WHEN operation = 'remove' THEN count ELSE 0 END), 0) as removals
      FROM polina_storage_history
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
      LIMIT 12
    `;

    if (!totalStats || totalStats.length === 0) {
      throw new Error('Failed to fetch total statistics');
    }

    return {
      totalProducts: Number(totalStats[0]?.total_products || 0),
      totalValue: Number(totalStats[0]?.total_value || 0),
      lowStockProducts: lowStockProducts?.map(row => ({
        id: row.id,
        name: row.name,
        article: row.article,
        count: Number(row.count || 0)
      })) || [],
      topProducts: topProducts?.map(row => ({
        id: row.id,
        name: row.name,
        article: row.article,
        count: Number(row.count || 0)
      })) || [],
      providerDistribution: providerDistribution?.map(row => ({
        provider_id: row.provider_id,
        provider_name: row.provider_name,
        productCount: Number(row.product_count || 0),
        totalValue: Number(row.total_value || 0)
      })) || [],
      monthlyMovements: monthlyMovements?.map(row => ({
        month: row.month?.toISOString() || new Date().toISOString(),
        additions: Number(row.additions || 0),
        removals: Number(row.removals || 0)
      })) || []
    };
  } catch (error) {
    console.error('Error fetching storage analytics:', error);
    // Возвращаем пустые данные вместо ошибки
    return {
      totalProducts: 0,
      totalValue: 0,
      lowStockProducts: [],
      topProducts: [],
      providerDistribution: [],
      monthlyMovements: []
    };
  }
} 