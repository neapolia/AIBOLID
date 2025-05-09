// app/invoices/page.tsx
import Table from "@/app/ui/invoices/table";
import { CreateInvoice } from "@/app/ui/invoices/buttons";
import { lusitana } from "@/app/ui/fonts";
import { Metadata } from "next";
import { fetchInvoices } from "../lib/data";

export const metadata: Metadata = {
  title: "Invoices",
};

export default async function Page() {
  try {
    const invoices = await fetchInvoices();
    return (
      <div className="w-full">
        <div className="flex w-full items-center justify-between">
          <h1 className={`${lusitana.className} text-2xl`}>Заказы</h1>
        </div>
        <div className="mt-4 flex justify-end md:mt-8">
          <CreateInvoice />
        </div>
        <Table invoices={invoices} />
      </div>
    );
  } catch (error) {
    console.error("Ошибка при загрузке инвойсов:", error);
    return (
      <div className="w-full">
        <h1 className={`${lusitana.className} text-2xl`}>Ошибка загрузки данных</h1>
      </div>
    );
  }
}