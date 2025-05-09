import { Metadata } from "next";
import { getCurrentUser } from '../lib/auth';
import { redirect } from 'next/navigation';
import Nav from '../ui/nav';

export const metadata: Metadata = {
  title: "Панель управления",
};

export default async function DashboardPage() {
  const email = await getCurrentUser();
  
  if (!email) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Панель управления
          </h1>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              Добро пожаловать, {email}!
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="font-medium text-indigo-900">Статистика</h3>
                <p className="text-indigo-700 mt-2">Здесь будет статистика</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900">Задачи</h3>
                <p className="text-green-700 mt-2">Здесь будут задачи</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-900">Уведомления</h3>
                <p className="text-purple-700 mt-2">Здесь будут уведомления</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 