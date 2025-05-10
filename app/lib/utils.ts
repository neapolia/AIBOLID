import { twMerge } from 'tailwind-merge';

export function cn(...classes: (string | undefined | null)[]) {
  return twMerge(classes.filter(Boolean).join(' '));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
} 