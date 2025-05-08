'use client';

import { InvoicesTable } from '@/app/lib/definitions';
import { updateInvoiceStatus } from '@/app/lib/actions';
import { useState } from 'react';

export default function ApproveTable({ invoices }: { invoices: InvoicesTable[] }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (id: string, status: boolean) => {
    setIsUpdating(true);
    try {
      await updateInvoiceStatus(id, status, false);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePaymentStatusChange = async (id: string, paymentStatus: boolean) => {
    setIsUpdating(true);
    try {
      await updateInvoiceStatus(id, true, paymentStatus);
    } catch (error) {
      console.error('Error updating payment status:', error);
    } finally {
      setIsUpdating(false);
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
                    {invoice.status ? 'Доставлен' : 'Ожидает'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {invoice.payment_status ? 'Оплачен' : 'Не оплачен'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <div className="flex gap-2">
                      <select
                        disabled={isUpdating}
                        onChange={(e) => handleStatusChange(invoice.id, e.target.value === 'true')}
                        className="rounded-md border p-2"
                        defaultValue={String(invoice.status)}
                      >
                        <option value="false">Ожидает</option>
                        <option value="true">Доставлен</option>
                      </select>
                      <select
                        disabled={isUpdating || !invoice.status}
                        onChange={(e) => handlePaymentStatusChange(invoice.id, e.target.value === 'true')}
                        className="rounded-md border p-2"
                        defaultValue={String(invoice.payment_status)}
                      >
                        <option value="false">Не оплачен</option>
                        <option value="true">Оплачен</option>
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
  );
} 