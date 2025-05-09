import postgres from "postgres";
import {
  FormattedProviders,
  FormattedStorage,
  InvoiceInfo,
  InvoicesTable,
  LatestInvoiceRaw,
  Product,
} from "./definitions";
import { formatCurrency } from "./utils";

const sql = postgres(process.env.POSTGRES_URL!);

export async function fetchLatestInvoices() {
  try {
    const data = await sql<LatestInvoiceRaw[]>`
      SELECT 
        i.id,
        pp.name,
        pp.email,
        SUM(p.price * ip.count) as amount
      FROM polina_invoices i
      JOIN polina_invoices_products ip ON i.id = ip.invoice_id
      JOIN polina_products p ON ip.product_id = p.id
      JOIN polina_providers pp ON p.provider_id = pp.id
      GROUP BY i.id, pp.name, pp.email
      ORDER BY i.created_at DESC
      LIMIT 5`;

    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
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
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS "delivered",
        SUM(CASE WHEN status = 'created' THEN 1 ELSE 0 END) AS "created"
      FROM polina_invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      providerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0][0].count ?? "0");
    const numberOfProviders = Number(data[1][0].count ?? "0");
    const deliveredInvoices = Number(data[2][0].delivered ?? "0");
    const createdInvoices = Number(data[2][0].created ?? "0");

    return {
      numberOfProviders,
      numberOfInvoices,
      deliveredInvoices,
      createdInvoices,
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
        pp.name as provider_name
      FROM polina_invoices as i
      LEFT JOIN polina_providers AS pp ON i.provider_id = pp.id
      ORDER BY i.created_at DESC
    `;

    console.log(invoices);

    return invoices;
  } catch (error) {
    console.error("DB (fetchInvoices):", error);
    return []; 
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const invoice = await sql<InvoiceInfo[]>`
      SELECT
        i.id,
        i.created_at,
        json_agg(
          json_build_object(
            'price', pp.price,
            'name', pp.name,
            'count', pip.count
          )
        ) AS products,
        SUM(pp.price * pip.count) AS total_amount
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
		  name ILIKE ${`%${query}%`} OR
      site ILIKE ${`%${query}%`} OR
      phone ILIKE ${`%${query}%`}
		ORDER BY name ASC
	  `;

    return data;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch customer table.");
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
  }
}

export async function fetchProviders() {
  try {
    const providers = await sql<
      Omit<FormattedProviders, "inn" | "phone" | "site">[]
    >`
      SELECT name, id FROM polina_providers
    `;

    return Array.from(providers);
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch storage data.");
  }
}

export async function fetchProviderProducts(providerId: string) {
  try {
    const products = await sql<Product[]>`
      SELECT * FROM polina_products
      WHERE provider_id = ${providerId}
    `;

    return Array.from(products);
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch storage data.");
  }
}
