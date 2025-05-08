'use client';

import { updateInvoiceStatus } from '@/app/lib/actions';
import { useState, useEffect } from 'react';

type OrderStatus = 'created' | 'approved' | 'cancelled' | 'delivering' | 'delivered';

export default function StatusButton({
  id,
  currentStatus,
  currentPaymentStatus,
}: {
  id: string;
  currentStatus: boolean | null;
  currentPaymentStatus: boolean | null;
}) {
  // Конвертируем старый формат статуса в новый
  const getInitialStatus = (status: boolean | null): OrderStatus => {
    if (status === null) return 'cancelled';
    if (status === false) return 'created';
    return 'delivered';
  };

  const [status, setStatus] = useState<OrderStatus>(getInitialStatus(currentStatus));
  const [paymentStatus, setPaymentStatus] = useState<boolean | null>(currentPaymentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  // Конвертируем новый формат статуса в старый для API
  const convertStatusToApi = (status: OrderStatus): boolean | null => {
    if (status === 'cancelled') return null;
    if (status === 'created') return false;
    return true;
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      setIsUpdating(true);
      
      // Обновляем статус оплаты в зависимости от нового статуса заказа
      let newPaymentStatus = paymentStatus;
      if (newStatus === 'cancelled') {
        newPaymentStatus = null; // Прочерк
      } else if (newStatus === 'created') {
        newPaymentStatus = false; // Только "Не оплачено"
      }

      await updateInvoiceStatus(id, convertStatusToApi(newStatus), newPaymentStatus ?? false);
      setStatus(newStatus);
      setPaymentStatus(newPaymentStatus);
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePaymentStatusChange = async (newPaymentStatus: boolean) => {
    if (status === 'cancelled' || status === 'created') return;

    try {
      setIsUpdating(true);
      await updateInvoiceStatus(id, convertStatusToApi(status), newPaymentStatus);
      setPaymentStatus(newPaymentStatus);
    } catch (error) {
      console.error('Ошибка при обновлении статуса оплаты:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <label className="text-sm">Статус заказа:</label>
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
          disabled={isUpdating}
          className="rounded-md border p-1 text-sm"
        >
          <option value="created">Создан</option>
          <option value="approved">Согласован</option>
          <option value="cancelled">Отменен</option>
          <option value="delivering">Доставляется</option>
          <option value="delivered">Доставлен</option>
        </select>
      </div>
      
      <div className="flex items-center gap-2">
        <label className="text-sm">Статус оплаты:</label>
        {status === 'cancelled' ? (
          <span className="text-gray-500">-</span>
        ) : (
          <select
            value={paymentStatus === null ? 'false' : paymentStatus.toString()}
            onChange={(e) => handlePaymentStatusChange(e.target.value === 'true')}
            disabled={isUpdating || status === 'created'}
            className={`rounded-md border p-1 text-sm ${
              status === 'created' ? 'bg-gray-100 text-gray-500' : ''
            }`}
          >
            <option value="false">Не оплачено</option>
            <option value="true">Оплачено</option>
          </select>
        )}
      </div>
      {status === 'created' && (
        <p className="text-xs text-gray-500">
          Статус оплаты можно изменить только после согласования заказа
        </p>
      )}
    </div>
  );
} 