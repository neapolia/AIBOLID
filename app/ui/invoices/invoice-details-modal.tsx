'use client';

import { InvoiceDetails } from "@/app/lib/definitions";
import { formatCurrency } from "@/app/lib/utils";

interface InvoiceDetailsModalProps {
  invoice: InvoiceDetails | null;
  onClose: () => void;
  isOpen: boolean;
}

export default function InvoiceDetailsModal({ invoice, onClose, isOpen }: InvoiceDetailsModalProps) {
  if (!invoice || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Детали заказа #{invoice.id}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Дата создания</p>
              <p className="font-medium">{new Date(invoice.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Статус</p>
              <p className="font-medium">{invoice.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Статус оплаты</p>
              <p className="font-medium">{invoice.payment_status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Поставщик</p>
              <p className="font-medium">{invoice.provider_name}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Товары</h3>
            <div className="space-y-2">
              {invoice.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">Количество: {item.count}</p>
                  </div>
                  <p className="font-medium">{formatCurrency(item.price)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <p className="font-medium">Итого:</p>
              <p className="text-xl font-bold">{formatCurrency(invoice.total_amount)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
