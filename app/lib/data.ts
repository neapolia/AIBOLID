import { sql } from '@vercel/postgres';
import {
  FormattedProviders,
  FormattedStorage,
  InvoiceInfo,
  InvoicesTable,
  LatestInvoice,
  Product,
} from "./definitions";

// Инициализируем подключение к базе данных
const db = sql;

if (!process.env.POSTGRES_URL) {
  console.error('POSTGRES_URL is not defined in environment variables');
}

type ProviderRow = {
  id: string | number;
  name: string;
};

type ProductRow = {
  id: string | number;
  name: string;
  provider_id: string | number;
  price: number | string;
  article: string;
};

type InvoiceRow = {
  id: string;
  provider_name: string;
  created_at: string;
  status: string;
  payment_status: string;
  total_amount: number;
};

type QueryResultRow = {
  [key: string]: unknown;
};

export async function fetchLatestInvoices() {
  try {
    const result = await sql`
      SELECT 
        i.id,
        pp.name as provider_name,
        i.created_at,
        i.status,
        i.payment_status,
        COALESCE(SUM(p.price * ip.count), 0) as total_amount
      FROM polina_invoices i
      JOIN polina_invoices_products ip ON i.id = ip.invoice_id
      JOIN polina_products p ON ip.product_id = p.id
      JOIN polina_providers pp ON p.provider_id = pp.id
      GROUP BY i.id, pp.name, i.created_at, i.status, i.payment_status
      ORDER BY i.created_at DESC
      LIMIT 5
    `;

    return result.rows.map((row: QueryResultRow) => ({
      id: String(row.id),
      provider_name: String(row.provider_name),
      created_at: row.created_at as string,
      status: row.status as string,
      payment_status: row.payment_status as string,
      total_amount: Number(row.total_amount),
    }));
  } catch (error) {
    console.error("Database Error:", error);
    return [];
  }
}

export async function fetchCardData() {
  try {
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM polina_invoices`;
    const providerCountPromise = sql`SELECT COUNT(*) FROM polina_providers`;
    const invoiceStatusPromise = sql`
      SELECT
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) AS "closed",
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS "pending"
      FROM polina_invoices`;

    const [invoiceCount, providerCount, invoiceStatus] = await Promise.all([
      invoiceCountPromise,
      providerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(invoiceCount.rows[0].count ?? "0");
    const numberOfProviders = Number(providerCount.rows[0].count ?? "0");
    const closedInvoices = Number(invoiceStatus.rows[0].closed ?? "0");
    const pendingInvoices = Number(invoiceStatus.rows[0].pending ?? "0");

    return {
      numberOfProviders,
      numberOfInvoices,
      deliveredInvoices: closedInvoices,
      createdInvoices: pendingInvoices,
    };
  } catch (error) {
    console.error("DB (fetchCardData):", error);
    return {
      numberOfProviders: 0,
      numberOfInvoices: 0,
      deliveredInvoices: 0,
      createdInvoices: 0,
    };
  }
}

export async function fetchInvoices() {
  try {
    const result = await sql`
      SELECT
        i.id,
        i.created_at,
        i.delivery_date,
        i.docs_url,
        i.status,
        i.payment_status,
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
        ) as products
      FROM polina_invoices as i
      LEFT JOIN polina_providers AS pp ON i.provider_id = pp.id
      LEFT JOIN polina_invoices_products ip ON i.id = ip.invoice_id
      LEFT JOIN polina_products p ON ip.product_id = p.id
      GROUP BY i.id, i.created_at, i.delivery_date, i.docs_url, i.status, i.payment_status, pp.name
      ORDER BY i.created_at DESC
    `;

    return result.rows.map((row: QueryResultRow) => ({
      id: String(row.id),
      created_at: row.created_at as string,
      delivery_date: row.delivery_date as string | null,
      docs_url: row.docs_url as string | null,
      status: row.status as 'pending' | 'delivered' | 'closed',
      payment_status: row.payment_status as 'pending' | 'paid',
      provider_name: String(row.provider_name),
      total_amount: Number(row.total_amount),
      products: row.products as Array<{
        id: string;
        name: string;
        article: string;
        price: number;
        count: number;
      }>,
    }));
  } catch (error) {
    console.error("DB (fetchInvoices):", error);
    throw new Error("Failed to fetch invoices");
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const result = await sql`
      SELECT
        i.id,
        i.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'price', pp.price,
              'name', pp.name,
              'count', pip.count
            )
          ) FILTER (WHERE pp.id IS NOT NULL),
          '[]'
        ) AS products,
        COALESCE(SUM(pp.price * pip.count), 0) AS total_amount
      FROM polina_invoices i
      LEFT JOIN polina_invoices_products pip ON i.id = pip.invoice_id
      LEFT JOIN polina_products pp ON pip.product_id = pp.id
      WHERE i.id = ${id}
      GROUP BY i.id, i.created_at;
    `;

    if (!result.rows[0]) {
      throw new Error('Invoice not found');
    }

    return {
      id: String(result.rows[0].id),
      created_at: result.rows[0].created_at,
      products: result.rows[0].products,
      total_amount: Number(result.rows[0].total_amount),
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoice.");
  }
}

export async function fetchFilteredProviders(query: string) {
  try {
    const data = await sql`
      SELECT
        id,
        name,
        inn,
        phone,
        site
      FROM polina_providers
      WHERE
        name ILIKE ${`%${query}%`} OR
        site ILIKE ${`%${query}%`} OR
        phone ILIKE ${`%${query}%`}
      ORDER BY name ASC
    `;

    return data.rows.map((row: QueryResultRow) => ({
      id: String(row.id),
      name: String(row.name),
      inn: String(row.inn),
      phone: String(row.phone),
      site: String(row.site)
    }));
  } catch (err) {
    console.error("Database Error:", err);
    return [];
  }
}

export async function fetchFilteredStorage(query: string) {
  try {
    const data = await sql`
      SELECT
        storage.id,
        storage.product_id,
        storage.count,
        products.article,
        products.price,
        products.name,
        products.id AS product_id,
        providers.name AS provider_name
      FROM polina_storage as storage
      LEFT JOIN polina_products as products ON products.id = storage.product_id
      LEFT JOIN polina_providers as providers ON providers.id = products.provider_id
      WHERE
        products.name ILIKE ${`%${query}%`}
      ORDER BY products.name ASC
    `;

    return data.rows;
  } catch (error) {
    console.error("DB (fetchFilteredStorage):", error);
    return [];
  }
}

export async function fetchProviders() {
  try {
    console.log('Fetching providers...');
    console.log('POSTGRES_URL exists:', !!process.env.POSTGRES_URL);
    
    const result = await db`
      SELECT id, name FROM polina_providers ORDER BY name
    `;
    console.log('Raw providers data:', result);
    
    if (!result.rows || result.rows.length === 0) {
      console.log('No providers found in database');
      return [];
    }
    
    const formattedProviders = result.rows.map((p: QueryResultRow) => ({
      id: String(p.id),
      name: String(p.name),
    }));
    console.log('Formatted providers:', formattedProviders);
    return formattedProviders;
  } catch (error) {
    console.error("DB (fetchProviders):", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    return [];
  }
}

export async function fetchProviderProducts(providerId: string) {
  try {
    const result = await sql`
      SELECT id, name, article, price
      FROM polina_products
      WHERE provider_id = ${providerId}
      ORDER BY name
    `;
    return result.rows.map((p: QueryResultRow) => ({
      id: String(p.id),
      name: String(p.name),
      article: String(p.article),
      price: Number(p.price),
      provider_id: providerId,
    }));
  } catch (error) {
    console.error("DB (fetchProviderProducts):", error);
    return [];
  }
}

export async function checkProvidersTable() {
  try {
    if (!process.env.POSTGRES_URL) {
      throw new Error('POSTGRES_URL is not defined');
    }
    const result = await db`
      SELECT COUNT(*) as count FROM polina_providers
    `;
    console.log('Providers count:', result.rows[0].count);
    return Number(result.rows[0].count);
  } catch (error) {
    console.error("DB (checkProvidersTable):", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    return 0;
  }
}

export async function checkDatabaseConnection() {
  try {
    console.log('Checking database connection...');
    console.log('POSTGRES_URL:', process.env.POSTGRES_URL ? 'exists' : 'missing');
    
    // Проверяем структуру таблицы
    const tableInfo = await db`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'polina_providers'
    `;
    console.log('Table structure:', tableInfo.rows);

    // Проверяем наличие данных
    const providers = await db`
      SELECT * FROM polina_providers
    `;
    console.log('All providers:', providers.rows);

    return {
      tableStructure: tableInfo.rows,
      providers: providers.rows
    };
  } catch (error) {
    console.error("DB (checkDatabaseConnection):", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    return null;
  }
}
