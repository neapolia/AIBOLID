'use client';

import { useState } from 'react';
import { InvoiceDetails } from '@/app/lib/definitions';
import { getInvoiceDetails } from '@/app/lib/actions';
import InvoiceDetailsModal from './invoice-details-modal';
import { formatCurrency } from '@/app/lib/utils';

export default function InvoicesTable({
  invoices,
}: {
  invoices: {
    id: string;
    created_at: string;
    status: string;
    payment_status: string;
    provider_name: string;
    total_amount: number;
  }[];
}) {
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetails | null>(null);

  const handleViewDetails = async (id: string) => {
    try {
      const details = await getInvoiceDetails(id);
      setSelectedInvoice(details);
    } catch (error) {
      console.error('Error loading invoice details:', error);
      alert('Failed to load invoice details');
    }
  };

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="min-w-full text-gray-900">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium">ID</th>
                <th scope="col" className="px-4 py-5 font-medium">Дата</th>
                <th scope="col" className="px-4 py-5 font-medium">Поставщик</th>
                <th scope="col" className="px-4 py-5 font-medium">Статус</th>
                <th scope="col" className="px-4 py-5 font-medium">Сумма</th>
                <th scope="col" className="px-4 py-5 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {invoices?.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap px-4 py-3">{invoice.id}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {new Date(invoice.created_at).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{invoice.provider_name}</td>
                  <td className="whitespace-nowrap px-4 py-3">{invoice.status}</td>
                  <td className="whitespace-nowrap px-4 py-3">{formatCurrency(invoice.total_amount)}</td>
                  <td className="whitespace-nowrap px-4 py-3">
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
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          isOpen={!!selectedInvoice}
        />
      )}
    </div>
  );
}
