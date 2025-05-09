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
  id: number;
  product_name: string;
  article: string;
  count: number;
  operation: 'add' | 'remove';
  invoice_id: string | null;
  created_at: string;
} 