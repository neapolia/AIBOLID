export const dynamic = "force-dynamic"; // 

import { redirect } from 'next/navigation';
import { getCurrentUser } from './lib/auth';

export default async function Home() {
  const email = await getCurrentUser();
  
  if (email) {
    redirect('/dashboard');
  }

  redirect('/login');
}
