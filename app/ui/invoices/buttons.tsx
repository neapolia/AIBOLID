import { PlusIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export function CreateInvoice() {
  return (
    <Link
      href="/invoices/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">Создать новый заказ</span>{" "}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function InvoiceInfo({ id }: { id: string }) {
  return (
    <Link href={`/invoices/${id}`} className="rounded-md p-2">
      <InformationCircleIcon className="w-5" />
    </Link>
  );
}
