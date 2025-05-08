import { InvoicesTable } from "@/app/lib/definitions";
import { InvoiceInfo } from "./buttons";
import StatusButton from "./status-button";

export default async function StorageTable({
  invoices,
}: {
  invoices: InvoicesTable[];
}) {
  return (
    <div className="w-full">
      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
              <table className="hidden min-w-full rounded-md text-gray-900 md:table">
                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Номер заказа
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Поставщик
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Дата создания
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Документы
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Дата доставки
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Статус
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Статус оплаты
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {invoices.map((i) => (
                    <tr key={i.id} className="group">
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        <b>{`${i.id.slice(0, 5)}...${i.id.slice(-5)}`}</b>
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {i.provider_name}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {new Date(i.created_at).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {i.docs_url || "-"}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm group-first-of-type:rounded-md group-last-of-type:rounded-md">
                        {i.delivery_date
                          ? new Date(i.delivery_date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        <StatusButton
                          id={i.id}
                          currentStatus={i.status}
                          currentPaymentStatus={i.payment_status}
                        />
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        <InvoiceInfo id={i.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
