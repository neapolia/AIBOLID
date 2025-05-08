import { Metadata } from "next";
import { fetchInvoiceById } from "@/app/lib/data";
import { formatCurrency } from "@/app/lib/utils";

export const metadata: Metadata = {
  title: "Информация о заказе",
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  const invoiceInfo = await fetchInvoiceById(id);

  return (
    <div className="w-full">
      <h1 className="text-2xl">Информация о заказе</h1>
      <span>
        Дата создания: {new Date(invoiceInfo.created_at).toLocaleDateString()}
      </span>

      <div className="flex flex-col gap-5 my-10">
        {invoiceInfo.products.map((p) => (
          <div
            className="flex flex-col justify-between p-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            key={p.name}
          >
            <div>Название товара: {p.name}</div>
            <div>Кол-во: {p.count} шт</div>
            <div>Цена за 1ед товара {formatCurrency(p.price)}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-end">
        <h1 className="text-xl">
          Итого: {formatCurrency(Number(invoiceInfo.total_amount))}
        </h1>
      </div>
    </div>
  );
}
