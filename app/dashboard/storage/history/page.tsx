'use client';

import { getStorageHistory } from '@/app/lib/storage-actions';
import { StorageHistoryRecord } from '@/app/lib/types';
import { auth } from '@/app/auth';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

export default function StorageHistoryPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [history, setHistory] = useState<StorageHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await getStorageHistory();
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = async () => {
    setIsLoading(true);
    try {
      const filteredHistory = await getStorageHistory(undefined, startDate, endDate);
      setHistory(filteredHistory);
    } catch (error) {
      console.error('Error filtering history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = () => {
    const data = history.map(record => ({
      'Товар': record.product_name,
      'Артикул': record.article,
      'Количество': record.count,
      'Операция': record.operation === 'add' ? 'Поступление' : 'Списание',
      'Заказ': record.invoice_id ? `Заказ #${record.invoice_id}` : 'Автоматический заказ',
      'Дата': new Date(record.created_at).toLocaleString()
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'История склада');
    XLSX.writeFile(wb, 'storage_history.xlsx');
  };

  return (
    <main className="p-6">
      <h1 className="mb-4 text-xl md:text-2xl">История изменений склада</h1>
      
      {/* Фильтры */}
      <div className="mb-4 flex gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700">Начальная дата</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Конечная дата</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <button
          onClick={handleFilter}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Загрузка...' : 'Применить фильтр'}
        </button>
        <button
          onClick={exportToExcel}
          disabled={isLoading || history.length === 0}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          Экспорт в Excel
        </button>
      </div>

      <div className="mt-6 flow-root">
        <div className="inline-block min-w-full align-middle">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            {isLoading ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Загрузка данных...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Нет данных для отображения</p>
              </div>
            ) : (
              <table className="min-w-full text-gray-900">
                <thead className="rounded-lg text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="px-4 py-5 font-medium">Товар</th>
                    <th scope="col" className="px-4 py-5 font-medium">Артикул</th>
                    <th scope="col" className="px-4 py-5 font-medium">Количество</th>
                    <th scope="col" className="px-4 py-5 font-medium">Операция</th>
                    <th scope="col" className="px-4 py-5 font-medium">Заказ</th>
                    <th scope="col" className="px-4 py-5 font-medium">Дата</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {history.map((record) => (
                    <tr key={record.id} className="w-full border-b py-3 text-sm">
                      <td className="whitespace-nowrap px-3 py-3">{record.product_name}</td>
                      <td className="whitespace-nowrap px-3 py-3">{record.article}</td>
                      <td className="whitespace-nowrap px-3 py-3">{record.count}</td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {record.operation === 'add' ? 'Поступление' : 'Списание'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {record.invoice_id ? `Заказ #${record.invoice_id}` : 'Автоматический заказ'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        {new Date(record.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 