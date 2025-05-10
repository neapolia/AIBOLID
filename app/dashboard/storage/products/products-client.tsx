'use client';

import { getProducts } from '@/app/lib/storage-actions';
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

interface Product {
  id: string;
  name: string;
  article: string;
  price: number;
  provider_id: string;
  count: number;
}

export default function ProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Loading products...');
      const data = await getProducts();
      console.log('Received data:', data);
      
      if (!data) {
        throw new Error('No data received from server');
      }
      
      setProducts(data);
    } catch (error) {
      console.error('Error in loadProducts:', error);
      setError(error instanceof Error ? error.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = () => {
    const data = products.map(product => ({
      'Товар': product.name,
      'Артикул': product.article,
      'Цена': product.price,
      'Количество': product.count
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Склад');
    XLSX.writeFile(wb, 'storage.xlsx');
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.article.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="p-6">
      <h1 className="mb-4 text-xl md:text-2xl">Склад</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-bold">Ошибка:</p>
          <p>{error}</p>
          <button
            onClick={loadProducts}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Попробовать снова
          </button>
        </div>
      )}
      
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Поиск</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск по названию или артикулу..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={exportToExcel}
            disabled={isLoading || products.length === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            Экспорт в Excel
          </button>
        </div>
      </div>

      <div className="mt-6 flow-root">
        <div className="inline-block min-w-full align-middle">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            {isLoading ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Загрузка данных...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Нет данных для отображения</p>
              </div>
            ) : (
              <table className="min-w-full text-gray-900">
                <thead className="rounded-lg text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="px-4 py-5 font-medium">Товар</th>
                    <th scope="col" className="px-4 py-5 font-medium">Артикул</th>
                    <th scope="col" className="px-4 py-5 font-medium">Цена</th>
                    <th scope="col" className="px-4 py-5 font-medium">Количество</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="w-full border-b py-3 text-sm">
                      <td className="whitespace-nowrap px-3 py-3">{product.name}</td>
                      <td className="whitespace-nowrap px-3 py-3">{product.article}</td>
                      <td className="whitespace-nowrap px-3 py-3">{product.price} ₽</td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.count <= 5 ? 'bg-red-100 text-red-800' :
                          product.count <= 10 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {product.count}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 