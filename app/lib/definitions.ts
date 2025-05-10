// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  image_url: string;
};

export type Revenue = {
  month: string;
  revenue: number;
};

export type OrderStatus = 'pending' | 'closed';
export type PaymentStatus = 'pending' | 'paid';

export type LatestInvoice = {
  id: string;
  provider_name: string;
  total_amount: number;
  created_at: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
};

export type InvoicesTable = {
  id: string;
  provider_name: string;
  provider_email: string;
  total_amount: number;
  created_at: string;
  delivery_date: string | null;
  status: OrderStatus | null;
  payment_status: PaymentStatus | null;
  docs_url: string | null;
};

export type FormattedProviders = {
  id: string;
  name: string;
  inn: string;
  phone: string;
  site: string;
};

export type FormattedStorage = {
  id: string;
  name: string;
  product_id: string;
  count: number;
  article: string;
  price: string;
  provider_name: string;
};

export type Product = {
  id: string;
  name: string;
  provider_id: string;
  price: number;
  article: string;
};

export type NewInvoiceProduct = Product & {
  count: number;
};

export type InvoiceInfo = {
  id: string;
  created_at: string;
  total_amount: number;
  products: Omit<NewInvoiceProduct, "id" | "provider_id" | "article">[];
};
