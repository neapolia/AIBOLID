'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/app/lib/utils';
import { cookies } from 'next/headers';

export function Nav() {
  const pathname = usePathname();

  const handleLogout = () => {
    document.cookie = 'user_email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-800">
                AIBOLID
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/dashboard/storage/history"
                className={cn(
                  'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                  pathname === '/dashboard/storage/history'
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                )}
              >
                Склад
              </Link>
              <Link
                href="/providers"
                className={cn(
                  'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                  pathname === '/providers'
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                )}
              >
                Поставщики
              </Link>
              <Link
                href="/dashboard/approve"
                className={cn(
                  'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                  pathname === '/dashboard/approve'
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                )}
              >
                Заказы
              </Link>
              <Link
                href="/dashboard/statistics"
                className={cn(
                  'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                  pathname === '/dashboard/statistics'
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                )}
              >
                Статистика
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 