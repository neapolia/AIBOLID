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
export async function getInvoiceDetails(invoiceId: string): Promise<InvoiceDetails> {
  try {
    const invoice = await sql<InvoiceDetails[]>`
      SELECT 
        i.id,
        i.created_at,
        i.status,
        pp.name as provider_name,
        COALESCE(SUM(p.price * ip.count), 0) as total_amount,
        COALESCE(
          json_agg(
            json_build_object(
              'id', p.id,
              'name', p.name,
              'article', p.article,
              'price', p.price,
              'count', ip.count
            )
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'
        ) as items
      FROM polina_invoices i
      LEFT JOIN polina_providers pp ON i.provider_id = pp.id
      LEFT JOIN polina_invoices_products ip ON i.id = ip.invoice_id
      LEFT JOIN polina_products p ON ip.product_id = p.id
      WHERE i.id = ${invoiceId}
      GROUP BY i.id, i.created_at, i.status, pp.name
    `;

    if (!invoice[0]) {
      throw new Error('Invoice not found');
    }

    return {
      ...invoice[0],
      items: invoice[0].items || []
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice details');
  }
}
