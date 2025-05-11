'use client';

import { createInvoice } from "@/app/lib/actions";
import { fetchProviders, fetchProviderProducts, checkProvidersTable, checkDatabaseConnection } from "@/app/lib/data";
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProviders = async () => {
      console.log('Loading providers in component...');
      
      // Проверяем подключение к базе данных
      const dbCheck = await checkDatabaseConnection();
      console.log('Database check result:', dbCheck);
      
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

  const handleSubmit = async (products: Record<string, number>) => {
    setIsSubmitting(true);
    setError(null);
    try {
      console.log('Submitting order with products:', products);
      const providerId = searchParams.get('providerId');
      if (!providerId) {
        throw new Error('Provider ID is required');
      }

      const result = await createInvoice({
        providerId,
        products,
      });
      console.log('Create invoice result:', result);

      if (!result.success) {
        setError(result.error || 'Ошибка при создании заказа');
        return;
      }

      // Перенаправляем на страницу подтверждения
      router.push('/dashboard/approve');
    } catch (error) {
      console.error('Error submitting order:', error);
      setError('Произошла ошибка при создании заказа');
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
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={error}
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
