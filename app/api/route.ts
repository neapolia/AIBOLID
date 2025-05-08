// Явно указываем использование Node.js runtime для всех API роутов
export const runtime = 'nodejs';

// Пустой обработчик, так как это только для конфигурации
export async function GET() {
  return new Response('API route');
}

// Добавляем обработчик для POST запросов
export async function POST() {
  return new Response('API route');
} 