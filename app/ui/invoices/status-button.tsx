// В файле status-button.tsx

'use client';

import { OrderStatus } from "@/app/lib/definitions";

export default function StatusButton({ 
  currentStatus
}: { 
  currentStatus: OrderStatus;
}) {
  const statusMap: Record<OrderStatus, { label: string; color: string }> = {
    created: { label: "Создан", color: "bg-gray-100 text-gray-800" },
    approved: { label: "Одобрен", color: "bg-blue-100 text-blue-800" },
    delivered: { label: "Доставлен", color: "bg-green-100 text-green-800" },
  };

  const { label, color } = statusMap[currentStatus];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${color}`}
    >
      {label}
    </span>
  );
}
