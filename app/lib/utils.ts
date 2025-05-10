import clsx from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: (string | Record<string, boolean | null | undefined> | undefined | null)[]) {
  return twMerge(clsx(...inputs.filter(Boolean) as (string | Record<string, boolean | null | undefined>)[]))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
} 