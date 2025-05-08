import postgres from "postgres";
import {
  invoices,
  providers,
  storage,
  products,
} from "../lib/placeholder-data";

const sql = postgres(process.env.POSTGRES_URL!);

async function seedProviders() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS polina_providers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      inn VARCHAR(255) NOT NULL,
      phone VARCHAR(255) NOT NULL,
      site VARCHAR(255) NOT NULL
    );
  `;

  const insertedProviders = await Promise.all(
    providers.map(
      (provider) => sql`
        INSERT INTO polina_providers (id, name, inn, phone, site)
        VALUES (${provider.id}, ${provider.name}, ${provider.inn}, ${provider.phone}, ${provider.site})
        ON CONFLICT (id) DO NOTHING;
      `
    )
  );

  return insertedProviders;
}

async function seedProducts() {
  await sql`
    CREATE TABLE IF NOT EXISTS polina_products (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      provider_id UUID NOT NULL,
      price INT NOT NULL,
      article VARCHAR(255) NOT NULL,
      FOREIGN KEY (provider_id) REFERENCES polina_providers(id)
    );
  `;

  const insertedProducts = await Promise.all(
    products.map(
      (p) => sql`
        INSERT INTO polina_products (id, name, provider_id, price, article)
        VALUES (${p.id}, ${p.name}, ${p.provider_id}, ${p.price}, ${p.article})
        ON CONFLICT (id) DO NOTHING;
      `
    )
  );

  return insertedProducts;
}

async function seedStorage() {
  await sql`
    CREATE TABLE IF NOT EXISTS polina_storage (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      product_id UUID NOT NULL,
      count INT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES polina_products(id)
    );
  `;

  const insertedStorage = await Promise.all(
    storage.map(
      (s) => sql`
        INSERT INTO polina_storage (id, product_id, count)
        VALUES (${s.id}, ${s.product_id}, ${s.count})
        ON CONFLICT (id) DO NOTHING;
      `
    )
  );

  return insertedStorage;
}

async function seedInvoices() {
  await sql`DROP TABLE IF EXISTS polina_invoices_products`;
  await sql`DROP TABLE IF EXISTS polina_invoices`;

  await sql`
    CREATE TABLE IF NOT EXISTS polina_invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      created_at DATE NOT NULL,
      delivery_date DATE,
      provider_id UUID NOT NULL,
      docs_url VARCHAR(255),
      status BOOLEAN,
      payment_status BOOLEAN,
      FOREIGN KEY (provider_id) REFERENCES polina_providers(id)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS polina_invoices_products (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      product_id UUID NOT NULL,
      invoice_id UUID NOT NULL,
      count INT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES polina_products(id),
      FOREIGN KEY (invoice_id) REFERENCES polina_invoices(id)
    );
  `;

  await Promise.all(
    invoices.map(async (invoice) => {
      const response = await sql`
        INSERT INTO polina_invoices (created_at, delivery_date, provider_id, docs_url, status, payment_status)
        VALUES (${invoice.created_at}, ${invoice.delivery_date}, ${invoice.provider_id}, ${invoice.docs_url}, ${invoice.status}, ${invoice.payment_status})
        RETURNING id;
      `;

      await Promise.all(
        invoice.order_details.map(async (od) => {
          await sql`
            INSERT INTO polina_invoices_products (product_id, invoice_id, count)
            VALUES (${od.product_id}, ${response[0].id}, ${od.count})
          `;
        })
      );
    })
  );
}

export async function GET() {
  try {
    await seedProviders();
    await seedProducts();
    await seedStorage();
    await seedInvoices();

    return Response.json({ message: "Database seeded successfully" });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
