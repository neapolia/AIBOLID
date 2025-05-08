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

export type Invoice = {
  id: string;
  customer_id: string;
  amount: number;
  date: string;
  // In TypeScript, this is called a string union type.
  // It means that the "status" property can only be one of the two strings: 'pending' or 'paid'.
  status: "pending" | "paid";
};

export type Revenue = {
  month: string;
  revenue: number;
};

export type LatestInvoice = {
  id: string;
  name: string;
  image_url: string;
  email: string;
  amount: string;
};

// The database returns a number for amount, but we later format it to a string with the formatCurrency function
export type LatestInvoiceRaw = Omit<LatestInvoice, "amount"> & {
  amount: number;
};

export type InvoicesTable = {
  id: string;
  created_at: string;
  delivery_date: string | null;
  docs_url: string | null;
  status: boolean | null;
  payment_status: boolean | null;
  provider_name: string;
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
