export const dynamic = 'force-dynamic';

'use client';

import { useEffect, useState } from 'react';
import { fetchInvoices } from '@/app/lib/data';
import { InvoicesTable } from '@/app/lib/definitions';
import ApproveTable from './approve-table';

export default function Page() {
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
    return <div>Loading...</div>;
  }

  return <ApproveTable invoices={invoices} />;
} 