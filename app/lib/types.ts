export type UserRole = "director" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Request {
  id: string;
  userId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

export interface StorageHistoryRecord {
  id: string;
  product_id: string;
  count: number;
  operation: 'add' | 'remove';
  created_at: string;
  product_name?: string;
  article?: string;
  invoice_id?: string;
}

export interface Product {
  id: string;
  name: string;
  article: string;
  price: number;
  count: number;
  provider_id: string;
  provider_name: string;
}

export interface Provider {
  id: string;
  name: string;
  contact_info?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  created_at: string;
  delivery_date: string | null;
  provider_id: string;
  docs_url: string | null;
  status: 'pending' | 'delivered' | 'closed';
  payment_status: 'pending' | 'paid';
  is_auto_order: boolean;
}

export interface InvoiceProduct {
  id: string;
  invoice_id: string;
  product_id: string;
  count: number;
  price: number;
  product_name?: string;
  article?: string;
}

export interface StorageAnalytics {
  totalProducts: number;
  totalValue: number;
  lowStockProducts: {
    id: string;
    name: string;
    article: string;
    count: number;
  }[];
  topProducts: {
    id: string;
    name: string;
    article: string;
    count: number;
  }[];
  providerDistribution: {
    provider_id: string;
    provider_name: string;
    productCount: number;
    totalValue: number;
  }[];
  monthlyMovements: {
    month: string;
    additions: number;
    removals: number;
  }[];
} 