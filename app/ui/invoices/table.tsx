'use client';

import { useState } from 'react';
import type { InvoicesTable, InvoiceDetails } from "@/app/lib/definitions";
import { formatCurrency } from "@/app/lib/utils";
import StatusButton from "./status-button";
import InvoiceDetailsModal from "./invoice-details-modal";
import { getInvoiceDetails } from "@/app/lib/actions";

export default function InvoicesTable({
  invoices,
}: {
  invoices: InvoicesTable[];
}) {
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = async (invoiceId: string) => {
    try {
      const details = await getInvoiceDetails(invoiceId);
      setSelectedInvoice(details);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      alert('Ошибка при загрузке деталей заказа');
    }
  };

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {invoices?.map((invoice) => (
              <div
                key={invoice.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <p>{invoice.provider_name}</p>
                    </div>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xl font-medium">
                      {formatCurrency(invoice.total_amount)}
                    </p>
                    <p>{new Date(invoice.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <StatusButton 
                      status={invoice.status || 'pending'}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Поставщик
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Сумма
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Дата
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Статус
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {invoices?.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p>{invoice.provider_name}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatCurrency(invoice.total_amount)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {new Date(invoice.created_at).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <StatusButton 
                      status={invoice.status || 'pending'}
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <button
                      onClick={() => handleViewDetails(invoice.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Просмотр
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInvoice && (
        <InvoiceDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          invoice={selectedInvoice}
        />
      )}
    </div>
  );
}
