import { createInvoice } from "@/app/lib/actions";
import { fetchProviders, fetchProviderProducts } from "@/app/lib/data";
import Form from "@/app/ui/invoices/form";
import { redirect } from "next/navigation";

export default async function Page(props: {
  searchParams?: Promise<{
    providerId?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const providerId = searchParams?.providerId || null;

  const handleCreateInvoice = async (products: Record<string, number>) => {
    "use server";
    await createInvoice(providerId as string, products);
    redirect("/invoices");
  };

  const providers = await fetchProviders();
  const providerProducts = providerId
    ? await fetchProviderProducts(providerId)
    : null;

  return (
    <main className="flex flex-row p-6 gap-10">
      <Form
        onSubmit={handleCreateInvoice}
        providerId={providerId}
        providers={providers}
        products={providerProducts}
      />
    </main>
  );
}
