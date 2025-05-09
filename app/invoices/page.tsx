// app/invoices/page.tsx
import Table from "@/app/ui/invoices/table";
import { CreateInvoice } from "@/app/ui/invoices/buttons";
import { ExportButtons } from "@/app/ui/invoices/export-buttons";
import { lusitana } from "@/app/ui/fonts";
import { Metadata } from "next";
import { fetchInvoices } from "../lib/data";

export const metadata: Metadata = {
  title: "Invoices",
};

export default async function Page() {
  const invoices = await fetchInvoices();

  return (
    <main className="flex flex-col gap-4 p-6">
      <div className="flex justify-between items-center">
        <h1 className={`${lusitana.className} text-2xl`}>Накладные</h1>
        <div className="flex gap-4">
          <ExportButtons invoices={invoices} />
          <CreateInvoice />
        </div>
      </div>
      <Table invoices={invoices} />
    </main>
  );
}