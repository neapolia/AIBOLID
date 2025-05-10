'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/app/lib/types';
import { getProducts, updateProductCount } from '@/app/lib/storage-actions';
import { Input } from "@/app/ui/input";
import Button from "@/app/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/ui/table";
import { toast } from "sonner";

export default function ProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('ProductsClient mounted');
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      console.log('Starting to load products...');
      setIsLoading(true);
      const productsData = await getProducts();
      console.log('Products loaded successfully:', productsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
      setError('Ошибка при загрузке данных');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountUpdate = async (productId: string, newCount: number) => {
    try {
      console.log('Updating product count:', { productId, newCount });
      await updateProductCount(productId, newCount);
      console.log('Product count updated successfully');
      await loadProducts();
      toast.success("Количество успешно обновлено");
    } catch (err) {
      console.error('Error updating product count:', err);
      toast.error("Не удалось обновить количество");
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
          <CardTitle>Материалы на складе</CardTitle>
        </CardHeader>
        <CardContent>
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