'use client';

import { StorageAnalytics } from '@/app/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/ui/card';
import { formatCurrency } from '@/app/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface StorageAnalyticsClientProps {
  analytics: StorageAnalytics;
}

export default function StorageAnalyticsClient({ analytics }: StorageAnalyticsClientProps) {
  console.log('StorageAnalyticsClient rendered with data:', analytics);

  const hasData = analytics.totalProducts > 0 || analytics.topProducts.length > 0;

  if (!hasData) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Нет данных для отображения</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Всего товаров</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.totalProducts}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Общая стоимость</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(analytics.totalValue)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Товары с низким остатком</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.lowStockProducts}</div>
          <p className="text-xs text-muted-foreground">
            Товары с остатком менее 5 единиц
          </p>
        </CardContent>
      </Card>

      {analytics.topProducts.length > 0 && (
        <div className="col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Топ товаров по количеству</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Количество" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {analytics.providerDistribution.length > 0 && (
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Распределение по поставщикам</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.providerDistribution}
                      dataKey="total_value"
                      nameKey="provider_name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {analytics.providerDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {analytics.monthlyMovements.length > 0 && (
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Движение товаров по месяцам</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.monthlyMovements}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('ru-RU', { month: 'short' })}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="total_movements" 
                      stroke="#8884d8" 
                      name="Количество операций"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total_value" 
                      stroke="#82ca9d" 
                      name="Общая стоимость"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 