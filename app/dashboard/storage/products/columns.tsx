'use client';

import { ColumnDef } from "@tanstack/react-table";
import Button from "@/app/ui/button";
import { Input } from "@/app/ui/input";
import { useState } from "react";
import { updateProductCount } from "@/app/lib/storage-actions";
import { toast } from "sonner";
import { formatCurrency } from '@/app/lib/utils';

export type Product = {
  id: string;
  name: string;
  article: string;
  price: number;
  count: number;
  provider_id: string;
  provider_name: string;
};

function ActionsCell({ product }: { product: Product }) {
  const [deductAmount, setDeductAmount] = useState(1);

  const handleDeduct = async () => {
    try {
      const response = await fetch('/api/storage/deduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          amount: deductAmount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to deduct product');
      }

      // Обновляем страницу после успешного списания
      window.location.reload();
    } catch (error) {
      console.error('Error deducting product:', error);
      alert('Ошибка при списании товара');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="1"
        max={product.count}
        value={deductAmount}
        onChange={(e) => setDeductAmount(Math.min(Number(e.target.value), product.count))}
        className="w-20 px-2 py-1 border rounded"
      />
      <Button
        onClick={handleDeduct}
        disabled={deductAmount < 1 || deductAmount > product.count}
        variant="outline"
        className="text-red-600 border-red-600 hover:bg-red-50"
      >
        Списать
      </Button>
    </div>
  );
}

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Название",
  },
  {
    accessorKey: "article",
    header: "Артикул",
  },
  {
    accessorKey: "price",
    header: "Цена",
    cell: ({ row }) => formatCurrency(row.getValue("price")),
  },
  {
    accessorKey: "count",
    header: "Количество",
  },
  {
    accessorKey: "provider_name",
    header: "Поставщик",
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell product={row.original} />,
  },
]; 