"use server";

import { revalidatePath } from "next/cache";
import postgres from "postgres";
import { OrderStatus, PaymentStatus } from "./definitions";
import { updateStorageFromInvoice } from "./storage-actions";

const sql = postgres(process.env.POSTGRES_URL!);

type InvoiceItem = {
  id: string;
  name: string;
  article: string;
  count: number;
  price: number;
};

type InvoiceRow = {
  id: string;
  created_at: string;
  status: string;
  payment_status: string;
  provider_name: string;
  total_amount: number;
};

type InvoiceProductRow = {
  id: string;
  name: string;
  article: string;
  count: number;
  price: number;
};

type QueryResultRow = {
  [key: string]: unknown;
};

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
        COALESCE(SUM(ip.count * pr.price), 0) as total_amount
      FROM polina_invoices i
      LEFT JOIN polina_providers p ON i.provider_id = p.id
      LEFT JOIN polina_invoices_products ip ON i.id = ip.invoice_id
      LEFT JOIN polina_products pr ON ip.product_id = pr.id
      WHERE i.id = ${id}
      GROUP BY i.id, i.created_at, i.status, i.payment_status, p.name
    `;

    if (!invoice[0]) {
      throw new Error('Invoice not found');
    }

    const items = await sql`
      SELECT 
        ip.id,
        ip.product_id,
        p.name,
        p.article,
        ip.count,
        p.price
      FROM polina_invoices_products ip
      LEFT JOIN polina_products p ON ip.product_id = p.id
      WHERE ip.invoice_id = ${id}
    `;

    return {
      id: String(invoice[0].id),
      created_at: String(invoice[0].created_at),
      status: String(invoice[0].status),
      payment_status: String(invoice[0].payment_status),
      provider_name: String(invoice[0].provider_name),
      total_amount: Number(invoice[0].total_amount),
      items: items.map((item: QueryResultRow) => ({
        id: String(item.id),
        name: String(item.name),
        article: String(item.article),
        count: Number(item.count),
        price: Number(item.price)
      })),
      products: items.map((item: QueryResultRow) => ({
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
