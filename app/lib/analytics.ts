import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export interface MonthlyExpenses {
  month: string;
  total: number;
}

export interface ProviderExpenses {
  name: string;
  total: number;
}

export interface ProductAnalytics {
  name: string;
  totalQuantity: number;
  totalAmount: number;
  averagePrice: number;
}

export async function getMonthlyExpenses(): Promise<MonthlyExpenses[]> {
  try {
    const data = await sql`
      SELECT 
        DATE_TRUNC('month', i.created_at) as month,
        SUM(p.price * ip.count) as total
      FROM polina_invoices i
      JOIN polina_invoices_products ip ON i.id = ip.invoice_id
      JOIN polina_products p ON ip.product_id = p.id
      GROUP BY DATE_TRUNC('month', i.created_at)
      ORDER BY month DESC
      LIMIT 12
    `;
    
    return data.map(item => ({
      month: new Date(item.month).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }),
      total: Number(item.total)
    }));
  } catch (error) {
    console.error('Error fetching monthly expenses:', error);
    return [];
  }
}

export async function getProviderExpenses(): Promise<ProviderExpenses[]> {
  try {
    const data = await sql`
      SELECT 
        pr.name,
        SUM(p.price * ip.count) as total
      FROM polina_invoices i
      JOIN polina_invoices_products ip ON i.id = ip.invoice_id
      JOIN polina_products p ON ip.product_id = p.id
      JOIN polina_providers pr ON p.provider_id = pr.id
      GROUP BY pr.name
      ORDER BY total DESC
      LIMIT 5
    `;
    
    return data.map(item => ({
      name: item.name,
      total: Number(item.total)
    }));
  } catch (error) {
    console.error('Error fetching provider expenses:', error);
    return [];
  }
}

export async function getTopProducts(): Promise<ProductAnalytics[]> {
  try {
    const data = await sql`
      SELECT 
        p.name,
        SUM(ip.count) as total_quantity,
        SUM(p.price * ip.count) as total_amount,
        AVG(p.price) as average_price
      FROM polina_invoices_products ip
      JOIN polina_products p ON ip.product_id = p.id
      GROUP BY p.name
      ORDER BY total_quantity DESC
      LIMIT 10
    `;
    
    return data.map(item => ({
      name: item.name,
      totalQuantity: Number(item.total_quantity),
      totalAmount: Number(item.total_amount),
      averagePrice: Number(item.average_price)
    }));
  } catch (error) {
    console.error('Error fetching top products:', error);
    return [];
  }
}

export async function getTotalExpenses(): Promise<number> {
  try {
    const data = await sql`
      SELECT SUM(p.price * ip.count) as total
      FROM polina_invoices_products ip
      JOIN polina_products p ON ip.product_id = p.id
    `;
    
    return Number(data[0]?.total || 0);
  } catch (error) {
    console.error('Error fetching total expenses:', error);
    return 0;
  }
} 