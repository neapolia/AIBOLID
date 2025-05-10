"use client";

import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
  ArchiveBoxIcon,
  PlusIcon,
  ClockIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { 
    name: "Склад", 
    href: "/dashboard/storage", 
    icon: ArchiveBoxIcon,
    subLinks: [
      {
        name: "Материалы",
        href: "/dashboard/storage",
      },
      {
        name: "История",
        href: "/dashboard/storage/history",
      },
      {
        name: "Аналитика",
        href: "/dashboard/storage/analytics",
      }
    ]
  },
  {
    name: "Заказы",
    href: "/dashboard/approve",
    icon: DocumentDuplicateIcon,
  },
  {
    name: "Новый заказ",
    href: "/invoices/create",
    icon: PlusIcon,
  },
  { 
    name: "Поставщики", 
    href: "/providers", 
    icon: UserGroupIcon 
  },
  { 
    name: "Статистика", 
    href: "/dashboard/statistics", 
    icon: ChartBarIcon 
  },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive = link.subLinks 
          ? link.subLinks.some(subLink => pathname === subLink.href)
          : pathname === link.href;

        return (
          <div key={link.name} className="space-y-1">
            <Link
              href={link.href}
              className={clsx(
                "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3",
                {
                  "bg-sky-100 text-blue-600": isActive,
                }
              )}
            >
              <LinkIcon className="w-6" />
              <p className="hidden md:block">{link.name}</p>
            </Link>
            {link.subLinks && isActive && (
              <div className="ml-6 space-y-1">
                {link.subLinks.map((subLink) => (
                  <Link
                    key={subLink.name}
                    href={subLink.href}
                    className={clsx(
                      "block px-3 py-2 text-sm font-medium rounded-md",
                      {
                        "bg-sky-100 text-blue-600": pathname === subLink.href,
                        "text-gray-600 hover:bg-gray-50 hover:text-gray-900": pathname !== subLink.href,
                      }
                    )}
                  >
                    {subLink.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
