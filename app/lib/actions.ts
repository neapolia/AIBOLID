"use server";

import { revalidatePath } from "next/cache";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!); 

export async function createInvoice(
  providerId: string,
  products: Record<string, number>
) {
  try {
    const response = await sql`
        INSERT INTO polina_invoices (created_at, delivery_date, provider_id, docs_url, status, payment_status)
        VALUES (${new Date().toISOString()}, ${null}, ${providerId}, ${null}, ${false}, ${false})
        RETURNING id;
      `;

    await Promise.all(
      Object.keys(products).map(async (productId) => {
        await sql`
            INSERT INTO polina_invoices_products (product_id, invoice_id, count)
            VALUES (${productId}, ${response[0].id}, ${products[productId]})
          `;
      })
    );
  } catch (err) {
    console.error(err);
    throw new Error("Failed to Update Checklist step");
  }
  revalidatePath("/invoices");
}

export async function updateInvoiceStatus(
  id: string,
  status: string,
  paymentStatus: string
) {
  try {
    await sql`
      UPDATE polina_invoices
      SET status = ${status},
          payment_status = ${paymentStatus}
      WHERE id = ${id}
    `;

    revalidatePath('/dashboard');
    return { message: 'Статус заказа обновлен' };
  } catch (error) {
    console.error('Error updating invoice status:', error);
    return { message: 'Ошибка при обновлении статуса заказа' };
  }
}
