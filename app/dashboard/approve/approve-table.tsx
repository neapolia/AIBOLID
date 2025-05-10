'use client';

import { InvoicesTable, OrderStatus, PaymentStatus } from '@/app/lib/definitions';
import { updateInvoiceStatus, getInvoiceDetails } from '@/app/lib/actions';
import { useState } from 'react';
import InvoiceDetailsModal from '@/app/ui/invoices/invoice-details-modal';

type InvoiceDetails = {
  id: string;
  created_at: string;
  provider_name: string;
  status: string;
  payment_status: string;
  products: {
    id: string;
    name: string;
    article: string;
    price: number;
    count: number;
  }[];
  total_amount: number;
};

export default function ApproveTable({ invoices }: { invoices: InvoicesTable[] }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    setIsUpdating(true);
    try {
      await updateInvoiceStatus(id, status, 'pending');
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handlePaymentStatusChange = async (id: string, paymentStatus: PaymentStatus) => {
    setIsUpdating(true);
    try {
      await updateInvoiceStatus(id, 'closed', paymentStatus);
    } catch (error) {
      console.error('Error updating payment status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      const details = await getInvoiceDetails(id);
      setSelectedInvoice(details);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error loading invoice details:', error);
    }
  };

  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">Нет заказов для согласования</p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-6 flow-root">
        <div className="inline-block min-w-full align-middle">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            <table className="min-w-full text-gray-900">
              <thead className="rounded-lg text-left text-sm font-normal">
                <tr>
                  <th scope="col" className="px-4 py-5 font-medium">Номер заказа</th>
                  <th scope="col" className="px-4 py-5 font-medium">Поставщик</th>
                  <th scope="col" className="px-4 py-5 font-medium">Статус доставки</th>
                  <th scope="col" className="px-4 py-5 font-medium">Статус оплаты</th>
                  <th scope="col" className="px-4 py-5 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="w-full border-b py-3 text-sm">
                    <td className="whitespace-nowrap px-3 py-3">{invoice.id}</td>
                    <td className="whitespace-nowrap px-3 py-3">{invoice.provider_name}</td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {invoice.status === 'closed' ? 'Доставлен' : 'Ожидает'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {invoice.payment_status === 'paid' ? 'Оплачен' : 'Не оплачен'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(invoice.id)}
                          className="rounded-md bg-blue-500 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-400"
                        >
                          Детали
                        </button>
                        <select
                          disabled={isUpdating}
                          onChange={(e) => handleStatusChange(invoice.id, e.target.value as OrderStatus)}
                          className="rounded-md border p-2"
                          value={invoice.status || 'pending'}
                        >
                          <option value="pending">Ожидает</option>
                          <option value="closed">Доставлен</option>
                        </select>
                        <select
                          disabled={isUpdating || invoice.status !== 'closed'}
                          onChange={(e) => handlePaymentStatusChange(invoice.id, e.target.value as PaymentStatus)}
                          className="rounded-md border p-2"
                          value={invoice.payment_status || 'pending'}
                        >
                          <option value="pending">Не оплачен</option>
                          <option value="paid">Оплачен</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <InvoiceDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        invoice={selectedInvoice}
      />
    </>
  );
} 