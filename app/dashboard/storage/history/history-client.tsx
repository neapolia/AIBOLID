'use client';

import { useState, useEffect } from 'react';
import { getStorageHistory } from '@/app/lib/storage-actions';
import { StorageHistoryRecord } from '@/app/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/ui/table';
import { formatCurrency } from '@/app/lib/utils';

export default function HistoryClient() {
  const [history, setHistory] = useState<StorageHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('HistoryClient mounted');
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      console.log('Starting to load history...');
      setIsLoading(true);
      const data = await getStorageHistory();
      console.log('History loaded successfully:', data);
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
      setError('Ошибка при загрузке истории');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Загрузка...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={loadHistory}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Повторить
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>История изменений склада</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Товар</TableHead>
                  <TableHead>Артикул</TableHead>
                  <TableHead>Операция</TableHead>
                  <TableHead>Количество</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      История изменений пуста
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {new Date(record.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>{record.product_name}</TableCell>
                      <TableCell>{record.article}</TableCell>
                      <TableCell>
                        <span className={record.operation === 'add' ? 'text-green-600' : 'text-red-600'}>
                          {record.operation === 'add' ? 'Поступление' : 'Списание'}
                        </span>
                      </TableCell>
                      <TableCell>{record.count}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 