'use client';

import { OrderStatus } from "@/app/lib/definitions";

export default function StatusButton({ 
  status
}: { 
  status: OrderStatus | null;
}) {
  const statusMap: Record<OrderStatus, { label: string; color: string }> = {
    pending: { label: "В ожидании", color: "bg-gray-100 text-gray-800" },
    closed: { label: "Доставлен", color: "bg-green-100 text-green-800" },
  };

  if (!status) {
    return (
      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800">
        Не определен
      </span>
    );
  }

  const { label, color } = statusMap[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${color}`}
    >
      {label}
    </span>
  );
}
