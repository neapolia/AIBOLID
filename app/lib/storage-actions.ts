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

export async function updateStorageFromInvoice(invoiceId: string) {
  try {
    // Получаем все товары из заказа
    const invoiceProducts = await sql`
      SELECT ip.product_id, ip.count, p.name, p.article, p.price, p.provider_id
      FROM polina_invoices_products ip
      JOIN polina_products p ON ip.product_id = p.id
      WHERE ip.invoice_id = ${invoiceId}
    `;

    // Для каждого товара обновляем количество на складе
    for (const product of invoiceProducts) {
      // Проверяем, есть ли уже такой товар на складе
      const existingProduct = await sql`
        SELECT id, count FROM polina_storage 
        WHERE product_id = ${product.product_id}
      `;

      if (existingProduct.length > 0) {
        // Если товар уже есть на складе, обновляем количество
        const newCount = existingProduct[0].count + product.count;
        await sql`
          UPDATE polina_storage
          SET count = ${newCount}
          WHERE product_id = ${product.product_id}
        `;
        
        // Записываем изменение в историю
        await logStorageChange(product.product_id, product.count, invoiceId, 'add');
        
        // Проверяем минимальный остаток
        await checkMinStock(product.product_id, newCount);
      } else {
        // Если товара нет на складе, создаем новую запись
        await sql`
          INSERT INTO polina_storage (product_id, count, name, article, price, provider_id)
          VALUES (
            ${product.product_id},
            ${product.count},
            ${product.name},
            ${product.article},
            ${product.price},
            ${product.provider_id}
          )
        `;
        
        // Записываем изменение в историю
        await logStorageChange(product.product_id, product.count, invoiceId, 'add');
        
        // Проверяем минимальный остаток
        await checkMinStock(product.product_id, product.count);
      }
    }

    revalidatePath('/storage');
    return { message: 'Склад успешно обновлен' };
  } catch (error) {
    console.error('Error updating storage:', error);
    return { message: 'Ошибка при обновлении склада' };
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
    throw error; // Пробрасываем ошибку дальше для отладки
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