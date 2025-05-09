'use client';

import { InvoicesTable } from "@/app/lib/definitions";
import { jsPDF } from "jspdf";
import * as XLSX from 'xlsx';

interface ExportButtonsProps {
  invoices: InvoicesTable[];
}

export function ExportButtons({ invoices }: ExportButtonsProps) {
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Заголовок
    doc.setFontSize(16);
    doc.text('Отчет по накладным', 14, 15);
    
    // Заголовки колонок
    doc.setFontSize(10);
    const headers = ['ID', 'Дата создания', 'Дата доставки', 'Статус', 'Статус оплаты', 'Поставщик'];
    let y = 30;
    
    headers.forEach((header, i) => {
      doc.text(header, 14 + (i * 35), y);
    });
    
    // Данные
    y += 10;
    invoices.forEach((invoice) => {
      doc.text(invoice.id.slice(0, 8), 14, y);
      doc.text(new Date(invoice.created_at).toLocaleDateString(), 49, y);
      doc.text(invoice.delivery_date ? new Date(invoice.delivery_date).toLocaleDateString() : '-', 84, y);
      doc.text(invoice.status ? 'Выполнен' : 'В процессе', 119, y);
      doc.text(invoice.payment_status ? 'Оплачен' : 'Ожидает', 154, y);
      doc.text(invoice.provider_name, 189, y);
      y += 7;
    });
    
    doc.save('invoices-report.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      invoices.map(invoice => ({
        'ID': invoice.id,
        'Дата создания': new Date(invoice.created_at).toLocaleDateString(),
        'Дата доставки': invoice.delivery_date ? new Date(invoice.delivery_date).toLocaleDateString() : '-',
        'Статус': invoice.status ? 'Выполнен' : 'В процессе',
        'Статус оплаты': invoice.payment_status ? 'Оплачен' : 'Ожидает',
        'Поставщик': invoice.provider_name
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Накладные');
    XLSX.writeFile(workbook, 'invoices-report.xlsx');
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={exportToPDF}
        className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
      >
        Экспорт в PDF
      </button>
      <button
        onClick={exportToExcel}
        className="rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
      >
        Экспорт в Excel
      </button>
    </div>
  );
} 