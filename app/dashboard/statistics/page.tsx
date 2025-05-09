'use client';

import { useEffect, useState } from 'react';
import { fetchInvoices } from '@/app/lib/data';
import { InvoicesTable } from '@/app/lib/definitions';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface MonthlyData {
  name: string;
  value: number;
}

export default function StatisticsPage() {
  const [invoices, setInvoices] = useState<InvoicesTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const data = await fetchInvoices();
        setInvoices(data);
      } catch (error) {
        console.error('Error loading invoices:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoices();
  }, []);

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  // Подготовка данных для графика по месяцам
  const monthlyData = invoices.reduce((acc: MonthlyData[], invoice) => {
    const date = new Date(invoice.created_at);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    
    const existingMonth = acc.find(item => item.name === monthYear);
    if (existingMonth) {
      existingMonth.value++;
    } else {
      acc.push({ name: monthYear, value: 1 });
    }
    
    return acc;
  }, []).sort((a, b) => {
    const [aMonth, aYear] = a.name.split('/').map(Number);
    const [bMonth, bYear] = b.name.split('/').map(Number);
    return aYear === bYear ? aMonth - bMonth : aYear - bYear;
  });

  // Подготовка данных для круговой диаграммы статусов
  const statusData = [
    {
      name: 'Выполненные',
      value: invoices.filter(invoice => invoice.status).length
    },
    {
      name: 'В процессе',
      value: invoices.filter(invoice => !invoice.status).length
    },
    {
      name: 'Оплаченные',
      value: invoices.filter(invoice => invoice.payment_status).length
    },
    {
      name: 'Ожидают оплаты',
      value: invoices.filter(invoice => !invoice.payment_status).length
    }
  ];

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Статистика накладных</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* График по месяцам */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Количество накладных по месяцам</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Количество накладных" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Круговая диаграмма статусов */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Статусы накладных</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Общая статистика */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Всего накладных</h3>
          <p className="text-2xl font-bold">{invoices.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Выполненные</h3>
          <p className="text-2xl font-bold">{invoices.filter(invoice => invoice.status).length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Оплаченные</h3>
          <p className="text-2xl font-bold">{invoices.filter(invoice => invoice.payment_status).length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">В процессе</h3>
          <p className="text-2xl font-bold">{invoices.filter(invoice => !invoice.status).length}</p>
        </div>
      </div>
    </main>
  );
} 