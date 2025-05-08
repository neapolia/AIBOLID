import { Metadata } from "next";
import { fetchFilteredProviders } from "@/app/lib/data";
import ProvidersTable from "@/app/ui/customers/table";

export const metadata: Metadata = {
  title: "Поставшики",
};

export default async function Page(props: {
  searchParams?: Promise<{ query?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";

  const providers = await fetchFilteredProviders(query);

  return (
    <div className="w-full">
      <ProvidersTable providers={providers} />
    </div>
  );
}
