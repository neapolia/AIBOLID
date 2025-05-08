import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import clsx from 'clsx';

export default function NavLinks() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const links = [
    { name: 'Обзор', href: '/dashboard' },
    { name: 'Заказы', href: '/dashboard/invoices' },
    { name: 'Склад', href: '/dashboard/storage' },
    { name: 'Поставщики', href: '/dashboard/providers' },
  ];

  // Добавляем ссылку на согласование только для директора
  if (session?.user?.role === 'director') {
    links.push({ name: 'Согласование', href: '/dashboard/approve' });
  }

  return (
    <>
      {links.map((link) => {
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-gray-100 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-gray-100': pathname === link.href,
              },
            )}
          >
            {link.name}
          </Link>
        );
      })}
    </>
  );
} 