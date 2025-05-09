'use client';

import { FormattedProviders } from "@/app/lib/definitions";
import * as XLSX from 'xlsx';

export function ExportButton({ providers }: { providers: FormattedProviders[] }) {
  const exportToExcel = () => {
    const data = providers.map(provider => ({
      'Наименование поставщика': provider.name,
      'ИНН': provider.inn,
      'Номер телефона': provider.phone,
      'Сайт': provider.site
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Поставщики');
    XLSX.writeFile(wb, 'providers.xlsx');
  };

  return (
    <button
      onClick={exportToExcel}
      className="rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
    >
      Экспорт в Excel
    </button>
  );
} 