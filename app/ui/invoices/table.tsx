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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = async (id: string) => {
    try {
      const details = await getInvoiceDetails(id);
      setSelectedInvoice(details);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error loading invoice details:', error);
      alert('Failed to load invoice details');
    }
  };

  const getStatusBadgeClass = (status: string, paymentStatus: string) => {
    if (status === 'closed' && paymentStatus === 'paid') {
      return 'bg-green-100 text-green-800';
    } else if (status === 'delivered') {
      return 'bg-blue-100 text-blue-800';
    } else if (paymentStatus === 'paid') {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string, paymentStatus: string) => {
    if (status === 'closed' && paymentStatus === 'paid') {
      return 'Закрыт и оплачен';
    } else if (status === 'delivered') {
      return paymentStatus === 'paid' ? 'Доставлен и оплачен' : 'Доставлен';
    } else if (paymentStatus === 'paid') {
      return 'Оплачен';
    }
    return 'В ожидании';
  };

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="min-w-full text-gray-900">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium">Заказ</th>
                <th scope="col" className="px-4 py-5 font-medium">Дата</th>
                <th scope="col" className="px-4 py-5 font-medium">Поставщик</th>
                <th scope="col" className="px-4 py-5 font-medium">Сумма</th>
                <th scope="col" className="px-4 py-5 font-medium">Статус</th>
                <th scope="col" className="px-4 py-5 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {invoices?.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap px-4 py-3">#{invoice.id.slice(0, 8)}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {new Date(invoice.created_at).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{invoice.provider_name}</td>
                  <td className="whitespace-nowrap px-4 py-3">{formatCurrency(invoice.total_amount)}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(invoice.status, invoice.payment_status)}`}>
                      {getStatusText(invoice.status, invoice.payment_status)}
                    </span>
                  </td>
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
          onClose={() => {
            setSelectedInvoice(null);
            setIsModalOpen(false);
          }}
          isOpen={isModalOpen}
        />
      )}
    </div>
  );
}
