'use client';

import { fetchInvoices } from '@/app/lib/data';
import { auth } from '@/app/auth';
import { redirect } from 'next/navigation';
import ApproveTable from './approve-table';

export default async function ApprovePage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  // Проверяем, является ли пользователь директором
  if (session.user.role !== 'director') {
    redirect('/dashboard');
  }

  const invoices = await fetchInvoices();

  return (
    <main className="p-6">
      <h1 className="mb-4 text-xl md:text-2xl">Согласование заказов</h1>
      <ApproveTable invoices={invoices} />
    </main>
  );
} 