import { Metadata } from "next";
import { getInvoiceDetails } from "@/app/lib/actions";
import { formatCurrency } from "@/app/lib/utils";
import { notFound } from "next/navigation";
import { InvoiceDetails } from "@/app/lib/definitions";

export const metadata: Metadata = {
  title: "Детали заказа",
};

export default async function Page({ params }: { params: { id: string } }) {
  const invoice = await getInvoiceDetails(params.id) as InvoiceDetails;

  if (!invoice) {
    notFound();
  }

  return (
    <main className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Детали заказа #{params.id}</h1>
        <div className="flex gap-2">
          <span className="px-2 py-1 rounded bg-gray-100 text-gray-800">
            {invoice.status}
          </span>
          <span className="px-2 py-1 rounded bg-gray-100 text-gray-800">
            {invoice.payment_status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Информация о заказе</h2>
          <div className="space-y-2">
            <p>Поставщик: {invoice.provider_name}</p>
            <p>Дата создания: {new Date(invoice.created_at).toLocaleDateString()}</p>
            <p>Статус: {invoice.status}</p>
            <p>Статус оплаты: {invoice.payment_status}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Товары</h2>
          <div className="space-y-4">
            {invoice.items.map((product) => (
              <div key={product.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-500">Артикул: {product.article}</p>
                </div>
                <div className="text-right">
                  <p>{product.count} шт.</p>
                  <p className="text-sm text-gray-500">{formatCurrency(product.price)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-lg font-semibold">
              Итого: {formatCurrency(invoice.total_amount)}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
} 