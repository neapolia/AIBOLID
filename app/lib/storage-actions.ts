"use server";

import { revalidatePath } from "next/cache";
import postgres from "postgres";
import { StorageHistoryRecord } from "./types";

const sql = postgres(process.env.POSTGRES_URL!);

// Функция для записи истории изменений склада
async function logStorageChange(
  productId: string,
  count: number,
  invoiceId: string,
  operation: 'add' | 'remove'
) {
  try {
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
        ${invoiceId},
        ${operation},
        ${new Date().toISOString()}
      )
    `;
  } catch (error) {
    console.error('Error logging storage change:', error);
  }
}

// Функция для проверки минимального остатка
async function checkMinStock(productId: string, currentCount: number) {
  const MIN_STOCK = 5; // Минимальный остаток для автоматического заказа
  if (currentCount <= MIN_STOCK) {
    // Получаем информацию о товаре
    const product = await sql`
      SELECT name, provider_id FROM polina_products WHERE id = ${productId}
    `;

    if (product.length > 0) {
      // Создаем автоматический заказ
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
          ${product[0].provider_id},
          ${null},
          ${false},
          ${false},
          ${true}
        )
        RETURNING id;
      `;
    }
  }
}

// Функция для обновления количества материалов на складе при закрытии заказа
export async function updateStorageFromInvoice(invoiceId: string) {
  try {
    console.log('Updating storage from invoice:', invoiceId);
    
    // Получаем все товары из заказа
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

    console.log('Found products in invoice:', invoiceProducts.length);

    // Для каждого товара обновляем количество на складе
    for (const product of invoiceProducts) {
      // Обновляем количество в таблице polina_products
      await sql`
        UPDATE polina_products
        SET count = count + ${product.count}
        WHERE id = ${product.product_id}
      `;

      console.log(`Updated product ${product.name} with count ${product.count}`);
    }

    revalidatePath('/storage/products');
    return { success: true, message: 'Склад успешно обновлен' };
  } catch (error) {
    console.error('Error updating storage:', error);
    throw error;
  }
}

// Функция для получения истории изменений склада
export async function getStorageHistory(
  productId?: string,
  startDate?: string,
  endDate?: string
) {
  try {
    console.log('Starting getStorageHistory...');
    
    // Проверяем существование таблицы
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
    
    // Простой запрос без фильтров для отладки
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

    console.log('Raw query result:', result);

    // Проверяем структуру данных
    if (result && result.length > 0) {
      console.log('First record structure:', {
        id: result[0].id,
        product_id: result[0].product_id,
        count: result[0].count,
        operation: result[0].operation,
        created_at: result[0].created_at,
        product_name: result[0].product_name,
        article: result[0].article,
        invoice_id: result[0].invoice_id
      });
    }

    return result as unknown as StorageHistoryRecord[];
  } catch (error) {
    console.error('Error in getStorageHistory:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
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
    console.log('Storage history records count:', historyCount[0].count);

    // Проверяем таблицу polina_products
    const productsCount = await sql`
      SELECT COUNT(*) as count FROM polina_products
    `;
    console.log('Products count:', productsCount[0].count);

    // Проверяем таблицу polina_invoices
    const invoicesCount = await sql`
      SELECT COUNT(*) as count FROM polina_invoices
    `;
    console.log('Invoices count:', invoicesCount[0].count);

    return {
      historyCount: historyCount[0].count,
      productsCount: productsCount[0].count,
      invoicesCount: invoicesCount[0].count
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

    // Проверяем содержимое polina_invoices
    const invoicesData = await sql`
      SELECT * FROM polina_invoices LIMIT 5
    `;
    console.log('Invoices data:', invoicesData);

    // Проверяем связи между таблицами
    const joinedData = await sql`
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
      LIMIT 5
    `;
    console.log('Joined data:', joinedData);

    return {
      historyData,
      productsData,
      invoicesData,
      joinedData
    };
  } catch (error) {
    console.error('Error checking table contents:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
}

// Функция для получения данных о продуктах на складе
export async function getProducts() {
  try {
    console.log('Getting products from storage...');
    
    const products = await sql`
      SELECT 
        id,
        name,
        article,
        price,
        provider_id,
        count
      FROM polina_products
      ORDER BY name ASC
    `;

    console.log('Products retrieved:', products.length);
    return products.map(product => ({
      id: product.id,
      name: product.name,
      article: product.article,
      price: Number(product.price),
      provider_id: product.provider_id,
      count: Number(product.count)
    }));
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
} 