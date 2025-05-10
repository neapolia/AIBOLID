"use server";

import { revalidatePath } from "next/cache";
import postgres from "postgres";
import { OrderStatus, PaymentStatus } from "./definitions";

const sql = postgres(process.env.POSTGRES_URL!);

export async function createInvoice(
  providerId: string,
  products: Record<string, number>
) {
  if (!providerId) {
    throw new Error("Не выбран поставщик");
  }

  if (!products || Object.keys(products).length === 0) {
    throw new Error("Не выбраны товары");
  }

  try {
    console.log('Creating invoice for provider:', providerId);
    console.log('Products:', products);

    // Создаем заказ
    const response = await sql`
      INSERT INTO polina_invoices (
        created_at, 
        delivery_date, 
        provider_id, 
        docs_url, 
        status, 
        payment_status,
        is_auto_order
      )
      VALUES (
        ${new Date().toISOString()}, 
        ${null}, 
        ${providerId}, 
        ${null}, 
        'pending', 
        'pending',
        ${false}
      )
      RETURNING id;
    `;

    console.log('Created invoice with ID:', response[0].id);

    // Добавляем товары в заказ
    await Promise.all(
      Object.entries(products).map(async ([productId, count]) => {
        if (count > 0) {
          console.log(`Adding product ${productId} with count ${count}`);
          await sql`
            INSERT INTO polina_invoices_products (product_id, invoice_id, count)
            VALUES (${productId}, ${response[0].id}, ${count})
          `;
        }
      })
    );

    console.log('Successfully created invoice');
    revalidatePath("/dashboard/approve");
    return { success: true, invoiceId: response[0].id };
  } catch (err) {
    console.error('Error creating invoice:', err);
    throw new Error("Не удалось создать заказ");
  }
}

export async function updateInvoiceStatus(
  id: string,
  status: OrderStatus,
  paymentStatus: PaymentStatus
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

type InvoiceDetails = {
  id: string;
  created_at: string;
  status: string;
  payment_status: string;
  provider_name: string;
  products: {
    id: string;
    name: string;
    article: string;
    price: number;
    count: number;
  }[];
  total_amount: number;
};

// Функция для получения деталей заказа
export async function getInvoiceDetails(invoiceId: string): Promise<InvoiceDetails> {
  try {
    // Получаем основную информацию о заказе
    const invoice = await sql`
      SELECT 
        i.id,
        i.created_at,
        i.status,
        i.payment_status,
        p.name as provider_name
      FROM polina_invoices i
      JOIN polina_providers p ON i.provider_id = p.id
      WHERE i.id = ${invoiceId}
    `;

    if (!invoice || invoice.length === 0) {
      throw new Error('Заказ не найден');
    }

    // Получаем товары заказа
    const products = await sql`
      SELECT 
        p.id,
        p.name,
        p.article,
        p.price,
        ip.count
      FROM polina_invoices_products ip
      JOIN polina_products p ON ip.product_id = p.id
      WHERE ip.invoice_id = ${invoiceId}
    `;

    // Вычисляем общую сумму
    const total_amount = products.reduce((sum, product) => sum + (product.price * product.count), 0);

    return {
      ...invoice[0],
      products: products as unknown as InvoiceDetails['products'],
      total_amount
    } as InvoiceDetails;
  } catch (error) {
    console.error('Error getting invoice details:', error);
    throw error;
  }
}
