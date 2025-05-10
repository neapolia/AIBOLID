import { NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!);

export async function GET() {
  try {
    // Создаем расширение для UUID
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`;

    // Создаем таблицу polina_providers
    await sql`
      CREATE TABLE IF NOT EXISTS polina_providers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        inn VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        site VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Создаем таблицу polina_products
    await sql`
      CREATE TABLE IF NOT EXISTS polina_products (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        provider_id UUID NOT NULL REFERENCES polina_providers(id),
        price INTEGER NOT NULL,
        article VARCHAR(255) NOT NULL,
        count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Создаем таблицу polina_storage
    await sql`
      CREATE TABLE IF NOT EXISTS polina_storage (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        product_id UUID NOT NULL REFERENCES polina_products(id),
        count INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Создаем таблицу polina_users
    await sql`
      CREATE TABLE IF NOT EXISTS polina_users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Создаем таблицу polina_invoices
    await sql`
      CREATE TABLE IF NOT EXISTS polina_invoices (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        delivery_date TIMESTAMP WITH TIME ZONE,
        docs_url VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        payment_status VARCHAR(50) DEFAULT 'pending',
        provider_id UUID REFERENCES polina_providers(id)
      );
    `;

    // Создаем таблицу polina_invoices_products
    await sql`
      CREATE TABLE IF NOT EXISTS polina_invoices_products (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        invoice_id UUID NOT NULL REFERENCES polina_invoices(id),
        product_id UUID NOT NULL REFERENCES polina_products(id),
        count INTEGER NOT NULL
      );
    `;

    return NextResponse.json({ message: "Tables created successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error creating tables:", error);
    return NextResponse.json({ error: "Failed to create tables" }, { status: 500 });
  }
} 