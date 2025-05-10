"use client";

import React, { ChangeEvent, useEffect, useState } from "react";
import Select from "react-select";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormattedProviders, Product } from "@/app/lib/definitions";
import { formatCurrency } from "@/app/lib/utils";
import Button from "../button";
import { fetchFilteredStorage } from "@/app/lib/data";

type ProviderOption = {
  value: string;
  label: string;
};

type StorageItem = {
  id: string;
  name: string;
  article: string;
  price: number;
  count: number;
};

type MaterialOption = {
  value: string;
  label: string;
  data?: StorageItem;
};

export default function Form({
  providerId,
  providers,
  products,
  onSubmit,
  isSubmitting,
  onMaterialSelect
}: {
  products: Product[] | null;
  providerId: string | null;
  providers: Omit<FormattedProviders, "inn" | "phone" | "site">[];
  onSubmit: (products: Record<string, number>) => void;
  isSubmitting?: boolean;
  onMaterialSelect?: (material: { id?: string; name: string; price: number } | null) => void;
}) {
  const [state, setState] = useState<Record<string, number>>({});
  const [storageItems, setStorageItems] = useState<StorageItem[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<StorageItem | null>(null);
  const [customMaterial, setCustomMaterial] = useState({ name: '', price: 0 });
  const [isCustomMaterial, setIsCustomMaterial] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  useEffect(() => {
    setState({});
    loadStorageItems();
  }, [providerId]);

  const loadStorageItems = async () => {
    try {
      const items = await fetchFilteredStorage('');
      setStorageItems(items.map(item => ({
        ...item,
        price: Number(item.price)
      })));
    } catch (error) {
      console.error('Error loading storage items:', error);
    }
  };

  const params = new URLSearchParams(searchParams.toString());

  const providerOptions = providers.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const selectedProvider = providerId ? providerOptions.find((o) => o.value === providerId) : null;

  const handleProviderChange = (value: string) => {
    params.set("providerId", value);
    replace(`${pathname}?${params.toString()}`);
  };

  const onCountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, [e.target.name]: Number(e.target.value) }));
  };

  const handleMaterialChange = (option: MaterialOption | null) => {
    if (option === null) {
      setSelectedMaterial(null);
      setIsCustomMaterial(false);
      onMaterialSelect?.(null);
    } else if (option.value === 'custom') {
      setIsCustomMaterial(true);
      setSelectedMaterial(null);
      onMaterialSelect?.(null);
    } else {
      setSelectedMaterial(option.data!);
      setIsCustomMaterial(false);
      onMaterialSelect?.(option.data!);
    }
  };

  const handleCustomMaterialChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newCustomMaterial = {
      ...customMaterial,
      [name]: name === 'price' ? Number(value) : value
    };
    setCustomMaterial(newCustomMaterial);
    onMaterialSelect?.(newCustomMaterial);
  };

  const materialOptions = [
    ...storageItems.map(item => ({
      value: item.id,
      label: `${item.name} (${item.article}) - ${formatCurrency(item.price)}`,
      data: item
    })),
    { value: 'custom', label: '+ Добавить новый материал' }
  ];

  const isShowSubmitButton =
    Object.values(state).length &&
    Object.values(state)?.reduce((acc, v) => acc + v) >= 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(state);
  };

  return (
    <section className="w-full pt-6 pb-24">
      <h1 className="text-2xl">Создать новый заказ</h1>
      
      <div className="border-b border-gray-200 py-6">
        <span className="block font-medium text-gray-900 mb-2">
          Выберите поставщика
        </span>

        <Select
          placeholder="Выберите поставщика"
          value={selectedProvider}
          isClearable
          onChange={(v: ProviderOption | null) => handleProviderChange(v?.value || "")}
          options={providerOptions}
          isSearchable={false}
        />
      </div>

      <div className="border-b border-gray-200 py-6">
        <span className="block font-medium text-gray-900 mb-2">
          Выберите материал
        </span>

        <Select
          placeholder="Выберите материал или добавьте новый"
          value={selectedMaterial ? {
            value: selectedMaterial.id,
            label: `${selectedMaterial.name} (${selectedMaterial.article}) - ${formatCurrency(selectedMaterial.price)}`
          } : null}
          isClearable
          onChange={handleMaterialChange}
          options={materialOptions}
          isSearchable
        />

        {isCustomMaterial && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Название материала</label>
              <input
                type="text"
                name="name"
                value={customMaterial.name}
                onChange={handleCustomMaterialChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Цена закупки</label>
              <input
                type="number"
                name="price"
                value={customMaterial.price}
                onChange={handleCustomMaterialChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        )}

        {(selectedMaterial || isCustomMaterial) && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900">Информация о материале</h3>
            <div className="mt-2 space-y-2">
              <p className="text-sm text-gray-600">
                Название: {selectedMaterial?.name || customMaterial.name}
              </p>
              {selectedMaterial && (
                <p className="text-sm text-gray-600">
                  Артикул: {selectedMaterial.article}
                </p>
              )}
              <p className="text-sm text-gray-600">
                Цена закупки: {formatCurrency(selectedMaterial?.price || customMaterial.price)}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5 my-10">
        {products?.map((p) => (
          <div
            className="flex flex-col justify-between p-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            key={p.id}
          >
            <div>Название товара: {p.name}</div>
            <div>Цена за 1ед товара {formatCurrency(p.price)}</div>
            <input
              className="text-black rounded mt-3"
              name={p.id}
              id={p.id}
              type="number"
              defaultValue={0}
              step={5}
              onChange={onCountChange}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-1">
        {isShowSubmitButton ? (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Отправка...' : 'Оформить заказ'}
          </Button>
        ) : null}
        <Link
          href="/invoices"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Отменить
        </Link>
      </div>
    </section>
  );
}
