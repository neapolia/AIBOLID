export const dynamic = 'force-dynamic';

import StatisticsClient from './StatisticsClient';
import {
  getMonthlyExpenses,
  getProviderExpenses,
  getTopProducts,
  getTotalExpenses
} from '@/app/lib/analytics';
import { fetchInvoices } from '@/app/lib/data';

// Получаем статистику по заказам
export default async function StatisticsPage() {
  // Получаем все данные на сервере
  const [monthlyExpenses, providerExpenses, topProducts, totalExpenses, invoices] = await Promise.all([
    getMonthlyExpenses(),
    getProviderExpenses(),
    getTopProducts(),
    getTotalExpenses(),
    fetchInvoices()
  ]);

  // Статистика по накладным
  const totalInvoices = invoices.length;
  const deliveredInvoices = invoices.filter(i => i.status === 'closed').length;
  const paidInvoices = invoices.filter(i => i.payment_status === 'paid').length;
  const inProgressInvoices = invoices.filter(i => i.status === 'pending').length;

  return (
    <StatisticsClient
      monthlyExpenses={monthlyExpenses}
      providerExpenses={providerExpenses}
      topProducts={topProducts}
      totalExpenses={totalExpenses}
      totalInvoices={totalInvoices}
      deliveredInvoices={deliveredInvoices}
      paidInvoices={paidInvoices}
      inProgressInvoices={inProgressInvoices}
    />
  );
} 