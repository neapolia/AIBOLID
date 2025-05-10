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
          <div className="text-2xl font-bold">{analytics.lowStockProducts.length}</div>
          <p className="text-xs text-muted-foreground">
            {analytics.lowStockProducts.map(p => p.name).join(", ")}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Топ поставщиков</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.providerDistribution.slice(0, 3).map(provider => (
              <div key={provider.provider_id} className="flex justify-between">
                <span className="text-sm">{provider.provider_name}</span>
                <span className="text-sm font-medium">{formatCurrency(provider.totalValue)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 