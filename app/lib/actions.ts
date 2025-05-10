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
    // Проверяем, нет ли уже такого заказа
    const existingInvoice = await sql`
      SELECT id FROM polina_invoices 
      WHERE provider_id = ${providerId} 
      AND status = 'pending'
      AND created_at > NOW() - INTERVAL '5 minutes'
    `;

    if (existingInvoice && existingInvoice.length > 0) {
      return { success: false, error: 'Заказ уже создан' };
    }

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

    revalidatePath("/dashboard/approve");
    return { success: true, invoiceId };
  } catch (error) {
    console.error('Error creating invoice:', error);
    return { success: false, error: 'Failed to create invoice' };
  }
}

export async function updateInvoiceStatus(
  invoiceId: string,
  status: 'pending' | 'delivered' | 'closed',
  paymentStatus: 'pending' | 'paid'
) {
  try {
    console.log('Updating invoice status:', { invoiceId, status, paymentStatus });
    
    // Обновляем статус заказа и статус оплаты
    await sql`
      UPDATE polina_invoices
      SET 
        status = ${status},
        payment_status = ${paymentStatus}
      WHERE id = ${invoiceId}
    `;

    // Если заказ доставлен и оплачен, обновляем склад
    if (status === 'closed' && paymentStatus === 'paid') {
      await updateStorageFromInvoice(invoiceId);
    }

    revalidatePath('/dashboard/approve');
    return { success: true };
  } catch (error) {
    console.error('Error updating invoice status:', error);
    throw error;
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
  items: {
    id: string;
    name: string;
    article: string;
    price: number;
    count: number;
  }[];
};

// Функция для получения деталей заказа
export async function getInvoiceDetails(id: string): Promise<InvoiceDetails> {
  try {
    const invoice = await sql`
      SELECT 
        i.id,
        i.created_at,
        i.status,
        i.payment_status,
        p.name as provider_name,
        i.total_amount
      FROM polina_invoices i
      LEFT JOIN polina_providers p ON i.provider_id = p.id
      WHERE i.id = ${id}
    `;

    if (!invoice[0]) {
      throw new Error('Invoice not found');
    }

    const items = await sql`
      SELECT 
        pi.id,
        pi.product_id,
        p.name,
        p.article,
        pi.count,
        p.price
      FROM polina_invoice_items pi
      LEFT JOIN polina_products p ON pi.product_id = p.id
      WHERE pi.invoice_id = ${id}
    `;

    return {
      id: invoice[0].id,
      created_at: invoice[0].created_at,
      status: invoice[0].status,
      payment_status: invoice[0].payment_status,
      provider_name: invoice[0].provider_name,
      total_amount: Number(invoice[0].total_amount),
      products: items.map(item => ({
        id: String(item.id),
        name: String(item.name),
        article: String(item.article),
        count: Number(item.count),
        price: Number(item.price)
      })),
      items: items.map(item => ({
        id: String(item.id),
        name: String(item.name),
        article: String(item.article),
        count: Number(item.count),
        price: Number(item.price)
      }))
    };
  } catch (error) {
    console.error('Error fetching invoice details:', error);
    throw error;
  }
}

export async function updateStorageCount(id: string, amount: number) {
  try {
    await sql`
      UPDATE polina_storage
      SET count = count + ${amount}
      WHERE id = ${id}
    `;
    revalidatePath('/storage');
  } catch (error) {
    console.error('Error updating storage count:', error);
    throw error;
  }
}
