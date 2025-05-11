'use client';

import { createInvoice } from "@/app/lib/actions";
import { fetchProviders, fetchProviderProducts, checkProvidersTable } from "@/app/lib/data";
import Form from "@/app/ui/invoices/form";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { FormattedProviders, Product } from "@/app/lib/definitions";

type Material = {
  id?: string;
  name: string;
  price: number;
};

function CreateInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [providers, setProviders] = useState<Array<{ id: string; name: string }>>([]);
  const [products, setProducts] = useState<Array<{
    id: string;
    name: string;
    provider_id: string;
    price: number;
    article: string;
  }> | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  useEffect(() => {
    const loadProviders = async () => {
      console.log('Loading providers in component...');
      const count = await checkProvidersTable();
      console.log('Providers count in table:', count);
      const data = await fetchProviders();
      console.log('Received providers data:', data);
      setProviders(data);
    };
    loadProviders();
  }, []);

  useEffect(() => {
    const providerId = searchParams.get('providerId');
    if (providerId) {
      const loadProducts = async () => {
        const data = await fetchProviderProducts(providerId);
        setProducts(data);
      };
      loadProducts();
    } else {
      setProducts(null);
    }
  }, [searchParams]);

  const handleCreateInvoice = async (products: Record<string, number>) => {
    try {
      setIsSubmitting(true);
      const providerId = searchParams.get('providerId');
      if (!providerId) {
        throw new Error('Provider ID is required');
      }

      const result = await createInvoice({
        providerId,
        products,
        material: selectedMaterial
      });

      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/approve');
        }, 2000);
      } else {
        throw new Error(result.error || 'Failed to create invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
      <h1 className="text-4xl font-bold mb-8">Create New Order</h1>
      {showSuccess ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          Order has been sent to the supplier!
        </div>
      ) : (
        <Form
          providerId={searchParams.get('providerId')}
          providers={providers}
          products={products}
          onSubmit={handleCreateInvoice}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}

export default function CreateInvoicePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Suspense fallback={<div>Loading...</div>}>
        <CreateInvoiceContent />
      </Suspense>
    </main>
  );
}
