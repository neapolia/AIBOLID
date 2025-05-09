export const dynamic = 'force-dynamic';
import { Metadata } from "next";
import { fetchFilteredStorage } from "@/app/lib/data";
import StorageTable from "@/app/ui/storage/table";
import { auth } from '@/app/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: "Склад",
};

export const runtime = 'nodejs';

export default async function Page(props: {
  searchParams?: Promise<{ query?: string }>;
}) {
  const session = await auth();
  
  // Проверяем авторизацию
  if (!session?.user) {
    redirect('/login');
  }

  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";

  const storage = await fetchFilteredStorage(query);

  return (
    <div className="w-full">
      <StorageTable storage={storage} />
    </div>
  );
} 