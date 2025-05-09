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
import { formatCurrency } from '@/app/lib/utils';
import {
  getMonthlyExpenses,
  getProviderExpenses,
  getTopProducts,
  getTotalExpenses,
  MonthlyExpenses,
  ProviderExpenses,
  ProductAnalytics
} from '@/app/lib/analytics';
import { fetchInvoices } from '@/app/lib/data';
import { InvoicesTable } from '@/app/lib/definitions';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default async function StatisticsPage() {
  // Получаем все данные на сервере
  const [monthlyExpenses, providerExpenses, topProducts, totalExpenses, invoices] = await Promise.all([
    getMonthlyExpenses(),
    getProviderExpenses(),
    getTopProducts(),
    getTotalExpenses(),
    fetchInvoices()
  ]);

  // Статистика по накладным
  const totalInvoices = invoices.length;
  const deliveredInvoices = invoices.filter(i => i.status === true).length;
  const paidInvoices = invoices.filter(i => i.payment_status === true).length;
  const inProgressInvoices = invoices.filter(i => i.status === false).length;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Аналитика закупок</h1>

      {/* Карточки статистики */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Всего накладных</h3>
          <p className="text-2xl font-bold">{totalInvoices}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Выполненные</h3>
          <p className="text-2xl font-bold">{deliveredInvoices}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Оплаченные</h3>
          <p className="text-2xl font-bold">{paidInvoices}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">В процессе</h3>
          <p className="text-2xl font-bold">{inProgressInvoices}</p>
        </div>
      </div>

      {/* Общая сумма расходов */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Общая сумма расходов</h2>
        <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalExpenses)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* График расходов по месяцам */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Расходы по месяцам</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyExpenses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#8884d8" name="Сумма расходов" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Расходы по поставщикам */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Расходы по поставщикам</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={providerExpenses}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {providerExpenses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Топ товаров */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Топ товаров по количеству закупок</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar yAxisId="left" dataKey="totalAmount" fill="#8884d8" name="Общая сумма" />
              <Bar yAxisId="right" dataKey="totalQuantity" fill="#82ca9d" name="Количество" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Таблица с детальной информацией о товарах */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Детальная информация о товарах</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Товар</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Количество</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Общая сумма</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Средняя цена</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topProducts.map((product) => (
                <tr key={product.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.totalQuantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(product.totalAmount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(product.averagePrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
} 