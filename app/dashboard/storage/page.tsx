import ProductsClient from './products/products-client';

export const dynamic = 'force-dynamic';

export default async function StoragePage() {
  return <ProductsClient />;
} 