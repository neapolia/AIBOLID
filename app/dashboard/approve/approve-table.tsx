'use client';

import { updateInvoiceStatus } from '@/app/lib/actions';
import InvoiceDetailsModal from '@/app/ui/invoices/invoice-details-modal';
import { useState } from 'react';

interface Invoice {
  id: string;
  created_at: string;
  status: 'pending' | 'delivered' | 'closed';
  payment_status: 'pending' | 'paid';
  provider_name: string;
  total_amount: number;
  products: Array<{
    id: string;
    name: string;
    article: string;
    price: number;
    count: number;
  }>;
}

interface ApproveTableProps {
  invoices: Invoice[];
}

export default function ApproveTable({ invoices }: ApproveTableProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleViewDetails = async (invoice: Invoice) => {
    try {
      const response = await fetch(`/api/invoices/${invoice.id}`);
      const data = await response.json();
      setSelectedInvoice(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      alert('Ошибка при загрузке деталей заказа');
    }
  };

  const handleStatusUpdate = async (invoiceId: string, status: 'pending' | 'delivered' | 'closed', paymentStatus: 'pending' | 'paid') => {
    try {
      setIsUpdating(true);
      await updateInvoiceStatus(invoiceId, status, paymentStatus);
      // Обновляем страницу после изменения статуса
      window.location.reload();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Ошибка при обновлении статуса заказа');
    } finally {
      setIsUpdating(false);
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
      return 'Доставлен';
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
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="w-full border-b py-3 text-sm">
                  <td className="whitespace-nowrap px-3 py-3">#{invoice.id.slice(0, 8)}</td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {new Date(invoice.created_at).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">{invoice.provider_name}</td>
                  <td className="whitespace-nowrap px-3 py-3">{invoice.total_amount} ₽</td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(invoice.status, invoice.payment_status)}`}>
                      {getStatusText(invoice.status, invoice.payment_status)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(invoice)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Просмотр
                      </button>
                      {invoice.status !== 'closed' && (
                        <>
                          {invoice.status === 'pending' && (
                            <button
                              onClick={() => handleStatusUpdate(invoice.id, 'delivered', invoice.payment_status)}
                              disabled={isUpdating}
                              className="text-green-600 hover:text-green-800 disabled:opacity-50"
                            >
                              Отметить как доставленный
                            </button>
                          )}
                          {invoice.status === 'delivered' && invoice.payment_status === 'paid' && (
                            <button
                              onClick={() => handleStatusUpdate(invoice.id, 'closed', 'paid')}
                              disabled={isUpdating}
                              className="text-purple-600 hover:text-purple-800 disabled:opacity-50"
                            >
                              Закрыть заказ
                            </button>
                          )}
                        </>
                      )}
                      {invoice.payment_status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(invoice.id, invoice.status, 'paid')}
                          disabled={isUpdating}
                          className="text-yellow-600 hover:text-yellow-800 disabled:opacity-50"
                        >
                          Отметить как оплаченный
                        </button>
                      )}
                    </div>
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