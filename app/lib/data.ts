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
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0][0].count ?? "0");
    const numberOfCustomers = Number(data[1][0].count ?? "0");
    const totalPaidInvoices = formatCurrency(data[2][0].paid ?? "0");
    const totalPendingInvoices = formatCurrency(data[2][0].pending ?? "0");

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
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
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
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
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch customer table.");
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
