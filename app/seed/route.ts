import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { providers, products, storage, invoices } from "../lib/placeholder-data";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // 1. Добавляем пользователей
    const directorPassword = await bcrypt.hash("director", 10);
    const userPassword = await bcrypt.hash("user", 10);
    await sql`
      INSERT INTO polina_users (name, email, password, role)
      VALUES 
        ('Director', 'director@example.com', ${directorPassword}, 'director'),
        ('User', 'user@example.com', ${userPassword}, 'user')
      ON CONFLICT (email) DO NOTHING;
    `;

    // 2. Добавляем поставщиков
    for (const provider of providers) {
      await sql`
        INSERT INTO polina_providers (id, name, inn, phone, site)
        VALUES (${provider.id}, ${provider.name}, ${provider.inn}, ${provider.phone}, ${provider.site})
        ON CONFLICT (id) DO NOTHING;
      `;
    }

    // 3. Добавляем продукты
    for (const product of products) {
      await sql`
        INSERT INTO polina_products (id, name, provider_id, price, article)
        VALUES (${product.id}, ${product.name}, ${product.provider_id}, ${product.price}, ${product.article})
        ON CONFLICT (id) DO NOTHING;
      `;
    }

    // 4. Добавляем склад
    for (const s of storage) {
      await sql`
        INSERT INTO polina_storage (id, product_id, count)
        VALUES (${s.id}, ${s.product_id}, ${s.count})
        ON CONFLICT (id) DO NOTHING;
      `;
    }

    // 5. Добавляем накладные и их продукты
    for (const invoice of invoices) {
      const response = await sql`
        INSERT INTO polina_invoices (created_at, delivery_date, provider_id, docs_url, status, payment_status)
        VALUES (${invoice.created_at}, ${invoice.delivery_date}, ${invoice.provider_id}, ${invoice.docs_url}, ${invoice.status}, ${invoice.payment_status})
        RETURNING id;
      `;
      const invoiceId = response[0].id;
      for (const od of invoice.order_details) {
        await sql`
          INSERT INTO polina_invoices_products (product_id, invoice_id, count)
          VALUES (${od.product_id}, ${invoiceId}, ${od.count})
        `;
      }
    }

    return NextResponse.json({ message: "All data seeded successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error seeding data:", error);
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 });
  }
}