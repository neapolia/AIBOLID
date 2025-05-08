import { Metadata } from "next";
import { fetchFilteredProviders } from "@/app/lib/data";
import ProvidersTable from "@/app/ui/customers/table";

// Настройка метаданных страницы
export const metadata: Metadata = {
  title: "Поставщики",
};

// Получение данных на сервере (если нужно использовать query)
export async function getServerSideProps(context: { query: { query?: string } }) {
  const query = context.query.query || ""; // Получаем query из URL, если есть

  // Получаем данные поставщиков
  const providers = await fetchFilteredProviders(query);

  // Возвращаем данные как props
  return {
    props: {
      providers, // Поставщики будут переданы в компонент
    },
  };
}

// Компонент страницы, который отображает таблицу
export default function Page({ providers }: { providers: any[] }) {
  return (
    <div className="w-full">
      {/* Отображаем таблицу с поставщиками */}
      <ProvidersTable providers={providers} />
    </div>
  );
}
