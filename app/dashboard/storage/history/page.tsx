import { auth } from '@/app/auth';
import { redirect } from 'next/navigation';
import HistoryClient from './history-client';

export default async function StorageHistoryPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  return <HistoryClient />;
} 