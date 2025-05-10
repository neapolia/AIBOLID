"use client";

import React, { ChangeEvent, useEffect, useState } from "react";
import { Select } from "@/app/ui/select";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormattedProviders, Product } from "@/app/lib/definitions";
import { formatCurrency } from "@/app/lib/utils";
import Button from "../button";

type ProviderOption = {
  id: string;
  name: string;
};

type StorageItem = {
  id: string;
  name: string;
  article: string;
  count: number;
  price: number;
};

type MaterialOption = {
  id: string;
  name: string;
  price: number;
};

interface FormProps {
  providerId: string | null;
  providers: ProviderOption[];
  products: Product[] | null;
  onSubmit: (products: Record<string, number>) => void;
  isSubmitting: boolean;
}

export default function Form({ providerId, providers, products, onSubmit, isSubmitting }: FormProps) {
  const [selectedMaterials, setSelectedMaterials] = useState<Record<string, number>>({});
  const [customMaterials, setCustomMaterials] = useState<MaterialOption[]>([]);
  const [storageItems, setStorageItems] = useState<StorageItem[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  useEffect(() => {
    setSelectedMaterials({});
    setError(null);
  }, [providerId]);

  const params = new URLSearchParams(searchParams.toString());

  const handleProviderChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newProviderId = e.target.value;
    if (newProviderId) {
      params.set("providerId", newProviderId);
      replace(`${pathname}?${params.toString()}`);
    } else {
      params.delete("providerId");
      replace(`${pathname}?${params.toString()}`);
    }
  };

  const handleMaterialSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const materialId = e.target.value;
    setSelectedMaterial(materialId);
    if (materialId === 'new') {
      const newMaterial: MaterialOption = {
        id: `custom-${Date.now()}`,
        name: '',
        price: 0
      };
      setCustomMaterials([...customMaterials, newMaterial]);
      setSelectedMaterials({ ...selectedMaterials, [newMaterial.id]: 0 });
    } else if (materialId) {
      setSelectedMaterials({ ...selectedMaterials, [materialId]: 0 });
    }
  };

  const handleQuantityChange = (materialId: string, quantity: number) => {
    setSelectedMaterials({ ...selectedMaterials, [materialId]: quantity });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validProducts = Object.entries(selectedMaterials)
      .filter(([_, count]) => count > 0)
      .reduce((acc, [id, count]) => ({ ...acc, [id]: count }), {});
    
    onSubmit(validProducts);
  };

  return (
    <section className="w-full pt-6 pb-24">
      <h1 className="text-2xl">Создать новый заказ</h1>
      
      {showSuccessMessage && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          Заказ успешно отправлен поставщику
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="border-b border-gray-200 py-6">
        <span className="block font-medium text-gray-900 mb-2">
          Выберите поставщика
        </span>

        <Select
          id="provider"
          name="provider"
          value={providerId || ''}
          onChange={handleProviderChange}
          className="mt-1 block w-full"
        >
          <option value="">Выберите поставщика</option>
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </Select>
      </div>

      {providerId && (
        <div className="border-b border-gray-200 py-6">
          <span className="block font-medium text-gray-900 mb-2">
            Выберите материал
          </span>

          <Select
            id="material"
            name="material"
            value={selectedMaterial}
            onChange={handleMaterialSelect}
            className="mt-1 block w-full"
          >
            <option value="">Выберите материал</option>
            {products?.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.article})
              </option>
            ))}
            <option value="new">+ Добавить новый материал</option>
          </Select>
        </div>
      )}

      {Object.entries(selectedMaterials).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Выбранные материалы</h3>
          {Object.entries(selectedMaterials).map(([materialId, quantity]) => {
            const material = products?.find(p => p.id === materialId) || 
                           customMaterials.find(m => m.id === materialId);
            if (!material) return null;

            return (
              <div key={materialId} className="flex items-center space-x-4">
                <span className="flex-1">{material.name}</span>
                <input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(materialId, parseInt(e.target.value) || 0)}
                  className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-end gap-1">
        <Link
          href="/dashboard/approve"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Отмена
        </Link>
        <Button onClick={handleSubmit} disabled={isSubmitting || Object.values(selectedMaterials).every(count => count === 0)}>
          {isSubmitting ? 'Создание...' : 'Создать заказ'}
        </Button>
      </div>
    </section>
  );
}
