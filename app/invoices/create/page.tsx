'use client';

import { createInvoice } from "@/app/lib/actions";
import { fetchProviders, fetchProviderProducts } from "@/app/lib/data";
import Form from "@/app/ui/invoices/form";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { FormattedProviders, Product } from "@/app/lib/definitions";

type Material = {
  id?: string;
  name: string;
  price: number;
};

export default function CreateInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [providers, setProviders] = useState<Omit<FormattedProviders, "inn" | "phone" | "site">[]>([]);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  useEffect(() => {
    const loadProviders = async () => {
      const data = await fetchProviders();
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
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
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
            onMaterialSelect={setSelectedMaterial}
          />
        )}
      </div>
    </main>
  );
}
