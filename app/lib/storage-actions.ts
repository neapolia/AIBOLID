"use server";

import { revalidatePath } from "next/cache";
import { sql } from '@vercel/postgres';
import { StorageHistoryRecord, Product } from "./types";

type ProductRow = {
  id: string;
  name: string;
  article: string;
  price: number;
  provider_id: string;
  count: number;
  provider_name?: string;
};

type StorageRow = {
  count: number;
};

type HistoryRow = {
  id: string;
  product_id: string;
  count: number;
  operation: 'add' | 'remove';
  created_at: string;
  product_name: string;
  article: string;
  invoice_id: string | null;
};

type QueryResultRow = {
  [key: string]: unknown;
};

// Функция для создания таблицы истории склада
async function createStorageHistoryTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS polina_storage_history (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID NOT NULL REFERENCES polina_products(id),
        count INTEGER NOT NULL,
        operation VARCHAR(10) NOT NULL CHECK (operation IN ('add', 'remove')),
        invoice_id UUID REFERENCES polina_invoices(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
  } catch (error) {
    console.error('Error creating storage history table:', error);
    throw new Error('Failed to create storage history table');
  }
}

// Функция для записи истории изменений склада
async function logStorageChange(
  productId: string,
  count: number,
  invoiceId: string | 'manual',
  operation: 'add' | 'remove'
) {
  try {
    await createStorageHistoryTable();
    
    await sql`
      INSERT INTO polina_storage_history (
        product_id,
        count,
        invoice_id,
        operation,
        created_at
      )
      VALUES (
        ${productId},
        ${count},
        ${invoiceId === 'manual' ? null : invoiceId},
        ${operation},
        ${new Date().toISOString()}
      )
    `;
  } catch (error) {
    console.error('Error logging storage change:', error);
    throw new Error('Failed to log storage change');
  }
}

// Функция для проверки минимального остатка
async function checkMinStock(productId: string, currentCount: number) {
  const MIN_STOCK = 5;
  if (currentCount <= MIN_STOCK) {
    try {
      const product = await sql`
        SELECT name, provider_id FROM polina_products WHERE id = ${productId}
      `;

      if (product.rows.length > 0) {
        await sql`
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
            ${product.rows[0].provider_id},
            ${null},
            'pending',
            'pending',
            ${true}
          )
          RETURNING id;
        `;
      }
    } catch (error) {
      console.error('Error creating auto order:', error);
      throw new Error('Failed to create auto order');
    }
  }
}

// Функция для обновления количества материалов на складе при закрытии заказа
export async function updateStorageFromInvoice(invoiceId: string) {
  try {
    const invoiceProducts = await sql`
      SELECT 
        ip.product_id,
        ip.count,
        p.name,
        p.article,
        p.price
      FROM polina_invoices_products ip
      JOIN polina_products p ON ip.product_id = p.id
      WHERE ip.invoice_id = ${invoiceId}
    `;

    for (const product of invoiceProducts.rows) {
      // Check if product exists in storage
      const existingStorage = await sql`
        SELECT count FROM polina_storage WHERE product_id = ${product.product_id}
      `;

      if (existingStorage.rows.length > 0) {
        // Update existing storage record
        await sql`
          UPDATE polina_storage
          SET count = count + ${product.count}
          WHERE product_id = ${product.product_id}
        `;
      } else {
        // Create new storage record
        await sql`
          INSERT INTO polina_storage (product_id, count)
          VALUES (${product.product_id}, ${product.count})
        `;
      }

      await logStorageChange(
        product.product_id,
        product.count,
        invoiceId,
        'add'
      );
    }

    revalidatePath('/storage/products');
    return { success: true, message: 'Склад успешно обновлен' };
  } catch (error) {
    console.error('Error updating storage:', error);
    throw new Error('Failed to update storage from invoice');
  }
}

// Функция для получения истории изменений склада
export async function getStorageHistory(): Promise<StorageHistoryRecord[]> {
  try {
    await createStorageHistoryTable();
    
    const result = await sql`
      SELECT 
        sh.id,
        sh.product_id,
        sh.count,
        sh.operation,
        sh.created_at,
        p.name as product_name,
        p.article,
        i.id as invoice_id
      FROM polina_storage_history sh
      JOIN polina_products p ON sh.product_id = p.id
      LEFT JOIN polina_invoices i ON sh.invoice_id = i.id
      ORDER BY sh.created_at DESC
    `;

    return result.rows.map((row: QueryResultRow) => ({
      id: String(row.id),
      product_id: String(row.product_id),
      count: Number(row.count),
      operation: row.operation as 'add' | 'remove',
      created_at: row.created_at as string,
      product_name: String(row.product_name),
      article: String(row.article),
      invoice_id: row.invoice_id ? String(row.invoice_id) : undefined
    }));
  } catch (error) {
    console.error('Error in getStorageHistory:', error);
    throw new Error('Failed to get storage history');
  }
}

// Функция для получения данных о продуктах на складе
export async function getProducts(): Promise<Product[]> {
  try {
    console.log('Fetching products from database...');
    
    const products = await sql`
      SELECT 
        p.id,
        p.name,
        p.article,
        p.price,
        p.provider_id,
        pp.name as provider_name,
        COALESCE(s.count, 0) as count
      FROM polina_products p
      LEFT JOIN polina_providers pp ON p.provider_id = pp.id
      LEFT JOIN polina_storage s ON p.id = s.product_id
      ORDER BY p.name ASC
    `;
    console.log('Products data:', products);

    const result = products.rows.map((row: QueryResultRow) => ({
      id: String(row.id),
      name: String(row.name),
      article: String(row.article),
      price: Number(row.price),
      count: Number(row.count),
      provider_id: String(row.provider_id),
      provider_name: String(row.provider_name)
    }));

    console.log('Final result:', result);
    return result;
  } catch (error) {
    console.error('Error in getProducts:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    throw new Error('Failed to get products');
  }
}

export async function fetchFilteredStorage(query: string): Promise<Product[]> {
  try {
    const result = await sql`
      SELECT 
        p.id,
        p.name,
        p.article,
        p.price,
        p.count,
        p.provider_id,
        pp.name as provider_name
      FROM polina_products p
      LEFT JOIN polina_providers pp ON p.provider_id = pp.id
      WHERE 
        p.name ILIKE ${`%${query}%`} OR 
        p.article ILIKE ${`%${query}%`}
      ORDER BY p.name ASC
    `;

    return result.rows.map((row: QueryResultRow) => ({
      id: String(row.id),
      name: String(row.name),
      article: String(row.article),
      price: Number(row.price),
      count: Number(row.count),
      provider_id: String(row.provider_id),
      provider_name: String(row.provider_name)
    }));
  } catch (error) {
    console.error('Error fetching filtered storage:', error);
    throw new Error('Failed to fetch filtered storage');
  }
}

export async function updateProductCount(productId: string, newCount: number) {
  try {
    // Проверяем существование продукта
    const product = await sql`
      SELECT id FROM polina_products WHERE id = ${productId}
    `;
    
    if (product.rows.length === 0) {
      throw new Error('Product not found');
    }

    // Получаем текущее количество из polina_storage
    const currentStorage = await sql`
      SELECT count FROM polina_storage WHERE product_id = ${productId}
    `;
    
    const currentCount = currentStorage.rows.length > 0 ? Number(currentStorage.rows[0].count) : 0;
    const difference = newCount - currentCount;

    // Обновляем или создаем запись в polina_storage
    if (currentStorage.rows.length > 0) {
      await sql`
        UPDATE polina_storage
        SET count = ${newCount}
        WHERE product_id = ${productId}
      `;
    } else {
      await sql`
        INSERT INTO polina_storage (product_id, count)
        VALUES (${productId}, ${newCount})
      `;
    }

    // Записываем изменение в историю
    await logStorageChange(
      productId,
      Math.abs(difference),
      'manual',
      difference > 0 ? 'add' : 'remove'
    );

    // Проверяем минимальный остаток
    await checkMinStock(productId, newCount);

    revalidatePath('/storage/products');
    return { success: true, message: 'Количество успешно обновлено' };
  } catch (error) {
    console.error('Error updating product count:', error);
    throw new Error('Failed to update product count');
  }
}

// Функция для проверки существования таблиц и данных
export async function checkTables() {
  try {
    console.log('Checking tables...');
    
    // Проверяем таблицу polina_storage_history
    const historyCount = await sql`
      SELECT COUNT(*) as count FROM polina_storage_history
    `;
    console.log('Storage history records count:', historyCount.rows[0].count);

    // Проверяем таблицу polina_products
    const productsCount = await sql`
      SELECT COUNT(*) as count FROM polina_products
    `;
    console.log('Products count:', productsCount.rows[0].count);

    // Проверяем таблицу polina_invoices
    const invoicesCount = await sql`
      SELECT COUNT(*) as count FROM polina_invoices
    `;
    console.log('Invoices count:', invoicesCount.rows[0].count);

    return {
      historyCount: historyCount.rows[0].count,
      productsCount: productsCount.rows[0].count,
      invoicesCount: invoicesCount.rows[0].count
    };
  } catch (error) {
    console.error('Error checking tables:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
}

// Функция для проверки содержимого таблиц
export async function checkTableContents() {
  try {
    console.log('Checking table contents...');
    
    // Проверяем содержимое polina_storage_history
    const historyData = await sql`
      SELECT * FROM polina_storage_history LIMIT 5
    `;
    console.log('Storage history data:', historyData);

    // Проверяем содержимое polina_products
    const productsData = await sql`
      SELECT * FROM polina_products LIMIT 5
    `;
    console.log('Products data:', productsData);

    return {
      historyData,
      productsData
    };
  } catch (error) {
    console.error('Error checking table contents:', error);
    throw error;
  }
}