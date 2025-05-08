import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
  }
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