"use server";

import { revalidatePath } from "next/cache";
import postgres from "postgres";
import { updateStorageFromInvoice } from "./storage-actions";

const sql = postgres(process.env.POSTGRES_URL!);

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
  status: boolean | null,
  payment_status: boolean
) {
  try {
    // Получаем текущий статус заказа
    const currentInvoice = await sql`
      SELECT status, payment_status, delivery_date
      FROM polina_invoices
      WHERE id = ${id}
    `;

    // Обновляем статус заказа
    await sql`
      UPDATE polina_invoices
      SET status = ${status}, 
          payment_status = ${payment_status},
          delivery_date = ${status ? new Date().toISOString() : null}
      WHERE id = ${id}
    `;

    // Если заказ оплачен и доставлен, обновляем склад
    if (status && payment_status) {
      await updateStorageFromInvoice(id);
    }

    revalidatePath('/invoices');
    revalidatePath('/dashboard/approve');
    revalidatePath('/storage');
    return { message: 'Статус обновлен' };
  } catch (error) {
    console.error('Error updating invoice status:', error);
    return { message: 'Ошибка при обновлении статуса' };
  }
}
