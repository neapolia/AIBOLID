'use client';

import { lusitana } from "@/app/ui/fonts";
import Search from "@/app/ui/search";
import { FormattedStorage } from "@/app/lib/definitions";
import { formatCurrency } from "@/app/lib/utils";
export default function StorageTable({
  storage,
}: {
  storage: FormattedStorage[];
}) {
  return (
    <div className="w-full">
      <h1 className={`${lusitana.className} mb-8 text-xl md:text-2xl`}>
        Склад
      </h1>
      <Search placeholder="Поиск поставщика..." />
      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
              <table className="hidden min-w-full rounded-md text-gray-900 md:table">
                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Наименование
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Артикул
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Поставщик
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Кол-во
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Закупочная цена
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {storage.map((s) => (
                    <tr key={s.id} className="group">
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {s.name}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {s.article}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {s.provider_name}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm group-first-of-type:rounded-md group-last-of-type:rounded-md">
                        {s.count} шт.
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm group-first-of-type:rounded-md group-last-of-type:rounded-md">
                        {formatCurrency(Number(s.price))}
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
