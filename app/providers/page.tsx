// app/providers/page.tsx
import { Metadata } from "next";
import { fetchFilteredProviders } from "@/app/lib/data";
import ProvidersTable from "@/app/ui/customers/table";

// Метаданные страницы
export const metadata: Metadata = {
  title: "Поставщики",
};

// Компонент страницы
export default async function Page({
  searchParams,
}: {
  searchParams?: { query?: string };
}) {
  const query = searchParams?.query ?? "";

  // Серверная загрузка поставщиков
  const providers = await fetchFilteredProviders(query);

  return (
    <div className="w-full">
      <ProvidersTable providers={providers} />
    </div>
  );
}
