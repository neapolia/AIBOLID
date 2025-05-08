// В файле status-button.tsx

'use client';

import { useState } from 'react';
import { updateInvoiceStatus } from '@/app/lib/actions';

export type OrderStatus = 'created' | 'approved' | 'cancelled' | 'delivering' | 'delivered';
export type PaymentStatus = 'pending' | 'paid' | 'cancelled';

export default function StatusButton({
  id,
  currentStatus,
  currentPaymentStatus,
}: {
  id: string;
  currentStatus: OrderStatus;
  currentPaymentStatus: PaymentStatus;
}) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(currentPaymentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      await updateInvoiceStatus(id, newStatus, paymentStatus);
      setStatus(newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePaymentStatusChange = async (newStatus: PaymentStatus) => {
    setIsUpdating(true);
    try {
      await updateInvoiceStatus(id, status, newStatus);
      setPaymentStatus(newStatus);
    } catch (error) {
      console.error('Error updating payment status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
        disabled={isUpdating}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm"
      >
        <option value="created">Создан</option>
        <option value="approved">Согласован</option>
        <option value="cancelled">Отменен</option>
        <option value="delivering">В доставке</option>
        <option value="delivered">Доставлен</option>
      </select>

      <select
        value={paymentStatus}
        onChange={(e) => handlePaymentStatusChange(e.target.value as PaymentStatus)}
        disabled={isUpdating}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm"
      >
        <option value="pending">Ожидает оплаты</option>
        <option value="paid">Оплачен</option>
        <option value="cancelled">Отменен</option>
      </select>
    </div>
  );
}
