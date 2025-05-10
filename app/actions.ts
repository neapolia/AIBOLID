// app/actions.ts
"use server";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!);

export async function getData() {
    const data = await sql`SELECT * FROM polina_providers`;
    return data;
}