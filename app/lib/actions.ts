"use server";

import { revalidatePath } from "next/cache";
import postgres from "postgres";
import { OrderStatus, PaymentStatus } from "./definitions";
import { updateStorageFromInvoice } from "./storage-actions";

const sql = postgres(process.env.POSTGRES_URL!);

type CreateInvoiceParams = {
  providerId: string;
  products: Record<string, number>;
  material?: {
    id?: string;
    name: string;
    price: number;
  } | null;
};

type CreateInvoiceResult = {
  success: boolean;
  invoiceId?: string;
  error?: string;
};

export async function createInvoice({ providerId, products, material }: CreateInvoiceParams): Promise<CreateInvoiceResult> {
  if (!providerId) {
    return { success: false, error: 'Provider ID is required' };
  }

  if (!products || Object.keys(products).length === 0) {
    return { success: false, error: 'Products are required' };
  }

  try {
    console.log('Creating invoice with:', { providerId, products, material });

    const result = await sql`
      INSERT INTO polina_invoices (
        provider_id,
        status,
        payment_status,
        material_name,
        material_price,
        is_auto_order
      ) VALUES (
        ${providerId},
        'pending',
        'pending',
        ${material?.name || null},
        ${material?.price || null},
        false
      )
      RETURNING id;
    `;

    const invoiceId = result[0].id;

    // Insert products
    for (const [productId, count] of Object.entries(products)) {
      if (count > 0) {
        await sql`
          INSERT INTO polina_invoices_products (
            invoice_id,
            product_id,
            count
          ) VALUES (
            ${invoiceId},
            ${productId},
            ${count}
          );
        `;
      }
    }

    console.log('Invoice created successfully:', invoiceId);
    revalidatePath("/dashboard/approve");
    return { success: true, invoiceId };
  } catch (error) {
    console.error('Error creating invoice:', error);
    return { success: false, error: 'Failed to create invoice' };
  }
}

export async function updateInvoiceStatus(
  id: string,
  status: OrderStatus,
  paymentStatus: PaymentStatus
) {
  try {
    // Обновляем статус заказа
    await sql`
      UPDATE polina_invoices
      SET status = ${status},
          payment_status = ${paymentStatus}
      WHERE id = ${id}
    `;

    // Если заказ доставлен и оплачен, перемещаем товары на склад
    if (status === 'closed' && paymentStatus === 'paid') {
      await updateStorageFromInvoice(id);
    }

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
