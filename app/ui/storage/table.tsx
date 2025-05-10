'use client';

import { useState } from 'react';
import { FormattedStorage } from "@/app/lib/definitions";
import { formatCurrency } from "@/app/lib/utils";
import { updateStorageCount } from "@/app/lib/actions";

export default function StorageTable({
  storage,
}: {
  storage: FormattedStorage[];
}) {
  const [deductAmounts, setDeductAmounts] = useState<Record<string, number>>({});

  const handleDeductChange = (id: string, value: string) => {
    const amount = parseInt(value) || 0;
    setDeductAmounts(prev => ({
      ...prev,
      [id]: amount
    }));
  };

  const handleDeduct = async (id: string, currentCount: number) => {
    const amount = deductAmounts[id];
    if (!amount || amount <= 0) {
      alert('Введите корректное количество для списания');
      return;
    }
    if (amount > currentCount) {
      alert('Нельзя списать больше, чем есть на складе');
      return;
    }

    try {
      await updateStorageCount(id, -amount);
      setDeductAmounts(prev => ({
        ...prev,
        [id]: 0
      }));
    } catch (error) {
      console.error('Error deducting from storage:', error);
      alert('Ошибка при списании товара');
    }
  };

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="min-w-full text-gray-900">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium">Название</th>
                <th scope="col" className="px-4 py-5 font-medium">Артикул</th>
                <th scope="col" className="px-4 py-5 font-medium">Количество</th>
                <th scope="col" className="px-4 py-5 font-medium">Цена</th>
                <th scope="col" className="px-4 py-5 font-medium">Поставщик</th>
                <th scope="col" className="px-4 py-5 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {storage?.map((item) => (
                <tr
                  key={item.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap px-4 py-3">{item.name}</td>
                  <td className="whitespace-nowrap px-4 py-3">{item.article}</td>
                  <td className="whitespace-nowrap px-4 py-3">{item.count}</td>
                  <td className="whitespace-nowrap px-4 py-3">{formatCurrency(Number(item.price))}</td>
                  <td className="whitespace-nowrap px-4 py-3">{item.provider_name}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max={item.count}
                        value={deductAmounts[item.id] || ''}
                        onChange={(e) => handleDeductChange(item.id, e.target.value)}
                        className="w-20 px-2 py-1 border rounded"
                        placeholder="Кол-во"
                      />
                      <button
                        onClick={() => handleDeduct(item.id, item.count)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Списать
                      </button>
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
