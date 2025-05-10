'use client';

import { OrderStatus } from "@/app/lib/definitions";

export default function StatusButton({ 
  status
}: { 
  status: OrderStatus;
}) {
  const statusMap: Record<OrderStatus, { label: string; color: string }> = {
    pending: { label: "В ожидании", color: "bg-gray-100 text-gray-800" },
    accepted: { label: "Принят", color: "bg-blue-100 text-blue-800" },
    rejected: { label: "Отклонен", color: "bg-red-100 text-red-800" },
    closed: { label: "Закрыт", color: "bg-green-100 text-green-800" },
  };

  const { label, color } = statusMap[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${color}`}
    >
      {label}
    </span>
  );
}
