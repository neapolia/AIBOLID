import { fetchInvoices } from '@/app/lib/data';
import ApproveTable from './approve-table';

export const dynamic = 'force-dynamic';

export default async function Page() {
  try {
    const invoices = await fetchInvoices();
    return <ApproveTable invoices={invoices} />;
  } catch (error) {
    console.error('Error loading invoices:', error);
    return (
      <div className="text-center py-4">
        <p className="text-red-500">Ошибка при загрузке заказов</p>
      </div>
    );
  }
} 