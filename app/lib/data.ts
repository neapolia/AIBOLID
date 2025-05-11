import postgres, { Row } from "postgres";
import {
  FormattedProviders,
  FormattedStorage,
  InvoiceInfo,
  InvoicesTable,
  LatestInvoice,
  Product,
} from "./definitions";

const sql = postgres(process.env.POSTGRES_URL!);

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

export async function fetchLatestInvoices() {
  try {
    const data = await sql<LatestInvoice[]>`
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
      LIMIT 5`;

    return data;
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

    const data = await Promise.all([
      invoiceCountPromise,
      providerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0][0].count ?? "0");
    const numberOfProviders = Number(data[1][0].count ?? "0");
    const closedInvoices = Number(data[2][0].closed ?? "0");
    const pendingInvoices = Number(data[2][0].pending ?? "0");

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
    const invoices = await sql<InvoicesTable[]>`
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

    return invoices;
  } catch (error) {
    console.error("DB (fetchInvoices):", error);
    throw new Error("Failed to fetch invoices");
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const invoice = await sql<InvoiceInfo[]>`
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

    return invoice[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoice.");
  }
}

export async function fetchFilteredProviders(query: string) {
  try {
    const data = await sql<FormattedProviders[]>`
		SELECT
		  id,
		  name,
		  inn,
		  phone,
      site
		FROM polina_providers
		WHERE
		  ${query ? sql`name ILIKE ${`%${query}%`} OR
      site ILIKE ${`%${query}%`} OR
      phone ILIKE ${`%${query}%`}` : sql`TRUE`}
		ORDER BY name ASC
	  `;

    return data;
  } catch (err) {
    console.error("Database Error:", err);
    return [];
  }
}

export async function fetchFilteredStorage(query: string) {
  try {
    const data = await sql<FormattedStorage[]>`
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

    return data;
  } catch (error) {
    console.error("DB (fetchFilteredStorage):", error);
    return [];
  }
}

export async function fetchProviders() {
  try {
    console.log('Fetching providers...');
    const providers = await sql`
      SELECT id, name FROM polina_providers ORDER BY name
    `;
    console.log('Raw providers data:', providers);
    const formattedProviders = (Array.isArray(providers) ? providers : []).map((p: Row) => ({
      id: String(p.id),
      name: String(p.name),
    }));
    console.log('Formatted providers:', formattedProviders);
    return formattedProviders;
  } catch (error) {
    console.error("DB (fetchProviders):", error);
    return [];
  }
}

export async function fetchProviderProducts(providerId: string) {
  try {
    const products = await sql`
      SELECT * FROM polina_products
      WHERE provider_id = ${providerId}
    `;
    return (Array.isArray(products) ? products : []).map((p: Row) => ({
      id: String(p.id),
      name: String(p.name),
      provider_id: String(p.provider_id),
      price: Number(p.price),
      article: String(p.article),
    }));
  } catch (error) {
    console.error("Database Error:", error);
    return [];
  }
}

export async function checkProvidersTable() {
  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM polina_providers
    `;
    console.log('Providers count:', result[0].count);
    return Number(result[0].count);
  } catch (error) {
    console.error("DB (checkProvidersTable):", error);
    return 0;
  }
}
