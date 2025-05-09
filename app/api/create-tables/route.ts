import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Создаем расширение для UUID
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`;

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
        status BOOLEAN DEFAULT false,
        payment_status BOOLEAN DEFAULT false,
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