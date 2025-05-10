import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await sql`
      SELECT 
        i.id,
        i.created_at,
        p.name as provider_name,
        i.status,
        i.payment_status,
        i.total_amount,
        json_agg(
          json_build_object(
            'id', ip.product_id,
            'name', pr.name,
            'article', pr.article,
            'price', ip.price,
            'count', ip.count
          )
        ) as products
      FROM polina_invoices i
      JOIN polina_providers p ON i.provider_id = p.id
      JOIN polina_invoice_products ip ON i.id = ip.invoice_id
      JOIN polina_products pr ON ip.product_id = pr.id
      WHERE i.id = ${id}
      GROUP BY i.id, i.created_at, p.name, i.status, i.payment_status, i.total_amount
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 