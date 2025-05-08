import { Metadata } from "next";
import { fetchFilteredStorage } from "@/app/lib/data";
import StorageTable from "@/app/ui/storage/table";
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: "Склад",
};

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