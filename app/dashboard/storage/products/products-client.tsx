'use client';

import { useState, useEffect } from 'react';
import { Product, StorageAnalytics } from '@/app/lib/types';
import { getProducts, fetchFilteredStorage, updateProductCount } from '@/app/lib/storage-actions';
import { getStorageAnalytics } from '@/app/lib/storage-analytics';
import StorageAnalyticsClient from '../analytics/storage-analytics-client';
import { formatCurrency } from '@/app/lib/utils';
import { Input } from "@/app/ui/input";
import Button from "@/app/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/ui/table";
import { toast } from "sonner";

export default function StorageClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState<StorageAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [newCount, setNewCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, analyticsData] = await Promise.all([
          getProducts(),
          getStorageAnalytics()
        ]);
        setProducts(productsData);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filteredProducts = await fetchFilteredStorage(query);
      setProducts(filteredProducts);
    } else {
      const allProducts = await getProducts();
      setProducts(allProducts);
    }
  };

  const startEditing = (product: Product) => {
    setEditingProduct(product.id);
    setNewCount(product.count);
    setError(null);
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setNewCount(0);
    setError(null);
  };

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setNewCount(value);
      setError(null);
    } else {
      setError('Количество должно быть положительным числом');
    }
  };

  const adjustCount = (amount: number) => {
    const newValue = newCount + amount;
    if (newValue >= 0) {
      setNewCount(newValue);
      setError(null);
    }
  };

  const handleCountUpdate = async (productId: string, newCount: number) => {
    try {
      setError(null);
      await updateProductCount(productId, newCount);
      await loadProducts();
      toast.success("Количество успешно обновлено");
    } catch (err) {
      setError("Ошибка при обновлении количества");
      toast.error("Не удалось обновить количество");
    }
  };

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError("Ошибка при загрузке данных");
      toast.error("Не удалось загрузить данные о продуктах");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Загрузка...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={loadProducts}>Повторить</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Склад</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Input
              placeholder="Поиск по названию или артикулу..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className="max-w-sm"
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Артикул</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead>Количество</TableHead>
                  <TableHead>Поставщик</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.article}</TableCell>
                    <TableCell>{product.price} ₽</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          value={product.count}
                          onChange={(e) => {
                            const newCount = parseInt(e.target.value);
                            if (!isNaN(newCount) && newCount >= 0) {
                              handleCountUpdate(product.id, newCount);
                            }
                          }}
                          className="w-20"
                        />
                      </div>
                    </TableCell>
                    <TableCell>{product.provider_name}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newCount = product.count + 1;
                          handleCountUpdate(product.id, newCount);
                        }}
                      >
                        +1
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 