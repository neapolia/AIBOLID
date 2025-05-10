"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createInvoice } from '@/app/lib/actions';
import Button from '@/app/ui/button';
import { Input } from '@/app/ui/input';
import { FormattedProviders, Product } from '@/app/lib/definitions';

type FormProps = {
  providerId: string | null;
  providers: Omit<FormattedProviders, "inn" | "phone" | "site">[];
  products: Product[] | null;
  onSubmit: (products: Record<string, number>) => void;
  isSubmitting?: boolean;
  onMaterialSelect?: (material: { id?: string; name: string; price: number } | null) => void;
};

export default function Form({ providerId, providers, products, onSubmit, isSubmitting, onMaterialSelect }: FormProps) {
  const router = useRouter();
  const [providerName, setProviderName] = useState('');
  const [items, setItems] = useState([{ name: '', count: 1, price: 0 }]);
  const [isLoading, setIsLoading] = useState(false);

  const addItem = () => {
    setItems([...items, { name: '', count: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const products = items.reduce((acc, item) => ({
        ...acc,
        [item.name]: item.count
      }), {});

      await createInvoice({
        providerId: providerName,
        products,
        material: {
          name: items[0].name,
          price: items[0].price
        }
      });

      router.push('/dashboard/invoices');
      router.refresh();
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Ошибка при создании заказа');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="provider" className="block text-sm font-medium text-gray-700">
          Поставщик
        </label>
        <Input
          id="provider"
          value={providerName}
          onChange={(e) => setProviderName(e.target.value)}
          placeholder="Введите название поставщика"
          required
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Товары</h3>
          <Button type="button" onClick={addItem} variant="outline">
            Добавить товар
          </Button>
        </div>

        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700">Название</label>
              <Input
                value={item.name}
                onChange={(e) => updateItem(index, 'name', e.target.value)}
                placeholder="Название товара"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Количество</label>
              <Input
                type="number"
                min="1"
                value={item.count}
                onChange={(e) => updateItem(index, 'count', parseInt(e.target.value) || 0)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Цена</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={item.price}
                onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                onClick={() => removeItem(index)}
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Удалить
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Создание...' : 'Создать заказ'}
        </Button>
      </div>
    </form>
  );
}
