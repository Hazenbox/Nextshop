import { z } from 'zod';

export interface Image {
  id: string;
  url: string;
  description?: string;
  width?: number;
  height?: number;
  storage_path: string;
  board_id: string;
  item_id?: string;
  created_at?: Date;
}

export interface InventoryItem {
  id: string;
  product_id?: string;
  title?: string;
  description?: string;
  board_id: string;
  image_ids: string[];
  category: string;
  label: string;
  sale_status: 'available' | 'pending' | 'sold';
  purchase_price: number;
  listed_price: number;
  sold_at?: number;
  delivery_charges: number;
  profit?: number;
  sale_type: 'online' | 'offline';
  paid_to?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  created_at: Date;
  updated_at: Date;
}

export interface TransactionItem {
  id: string;
  item_id: string;
  quantity: number;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  notes?: string;
  date: string;
  payment_mode: string;
  reference?: string;
  items: TransactionItem[];
  attachments: string[];
  created_at: Date;
  updated_at: Date;
}

export const transactionSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['income', 'expense']),
  amount: z.number().min(0),
  notes: z.string().optional(),
  date: z.string(),
  payment_mode: z.string(),
  reference: z.string().optional(),
  items: z.array(z.object({
    id: z.string(),
    item_id: z.string(),
    quantity: z.number().min(1)
  })),
  attachments: z.array(z.string()),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
});

export type TransactionInput = z.infer<typeof transactionSchema>;