import { Metadata } from "next";
import { getCurrentUser } from '../lib/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: "Панель управления",
};

export default async function DashboardPage() {
  const email = await getCurrentUser();
  
  if (!email) {
    redirect('/login');
  }

  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-52">
        <h1 className="text-2xl font-bold text-white">Панель управления</h1>
      </div>
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
          <p className="text-xl text-gray-800 md:text-3xl md:leading-normal">
            Добро пожаловать в систему управления складом
          </p>
        </div>
      </div>
    </main>
  );
} 