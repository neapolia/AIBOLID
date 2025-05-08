import { lusitana } from "@/app/ui/fonts";
import Search from "@/app/ui/search";
import { FormattedProviders } from "@/app/lib/definitions";

export default async function ProvidersTable({
  providers,
}: {
  providers: FormattedProviders[];
}) {
  return (
    <div className="w-full">
      <h1 className={`${lusitana.className} mb-8 text-xl md:text-2xl`}>
        Поставщики
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
                      Наименование поставщика
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      ИНН
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Номер телефона
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Сайт
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {providers.map((provider) => (
                    <tr key={provider.id} className="group">
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {provider.name}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {provider.inn}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {provider.phone}
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm group-first-of-type:rounded-md group-last-of-type:rounded-md">
                        {provider.site}
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
