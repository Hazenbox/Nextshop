import { z } from 'zod';
import { Database } from './supabase';

// Type aliases from the Supabase schema
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type InventoryItem = Database['public']['Tables']['inventory_items']['Row'];
export type ItemMedia = Database['public']['Tables']['item_media']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type TransactionItem = Database['public']['Tables']['transaction_items']['Row'];

// Additional utility types
export type StatusType = 'available' | 'sold' | 'reserved' | 'active' | 'low stock' | 'out of stock';
export type TransactionType = 'income' | 'expense';
export type MediaType = 'image' | 'video';

// Application-specific interfaces (that might extend the database types)
export interface InventoryItemWithMedia extends Omit<InventoryItem, 'image_ids'> {
  media?: ItemMedia[];
}

export interface TransactionWithItems extends Transaction {
  items?: TransactionItem[];
}

// Zod schema for validation
export const profileSchema = z.object({
  id: z.string().optional(),
  email: z.string().email().nullable(),
  business_name: z.string().min(1).nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  currency: z.string().default('USD'),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  user_id: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export const inventoryItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().nullable(),
  price: z.number().min(0),
  cost_price: z.number().min(0),
  quantity: z.number().min(0),
  category: z.string(),
  status: z.enum(['available', 'sold', 'reserved', 'active', 'low stock', 'out of stock']),
  image_ids: z.array(z.string()).optional(),
  user_id: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export const itemMediaSchema = z.object({
  id: z.string().optional(),
  item_id: z.string(),
  type: z.enum(['image', 'video']),
  url: z.string().url(),
  storage_path: z.string().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export const transactionSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['income', 'expense']),
  amount: z.number().min(0),
  date: z.string(),
  payment_mode: z.string(),
  reference: z.string().nullable(),
  notes: z.string().nullable(),
  user_id: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export const transactionItemSchema = z.object({
  id: z.string().optional(),
  transaction_id: z.string(),
  item_id: z.string().nullable(),
  quantity: z.number().min(1),
  price: z.number().min(0),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export type TransactionInput = z.infer<typeof transactionSchema>;
export type InventoryItemInput = z.infer<typeof inventoryItemSchema>;
export type ItemMediaInput = z.infer<typeof itemMediaSchema>;
export type TransactionItemInput = z.infer<typeof transactionItemSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;

// UI-related types
export interface TableSortState {
  column: string;
  direction: 'asc' | 'desc';
}

export interface TableFilterState {
  column: string;
  value: string;
}

export interface TablePaginationState {
  page: number;
  pageSize: number;
}

export interface AppSettings {
  currency: string;
  businessName: string;
  darkMode: boolean;
}

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

// Form state types
export interface InventoryFormState {
  name: string;
  description: string;
  price: number;
  costPrice: number;
  quantity: number;
  category: string;
  status: StatusType;
  images: File[];
}

export interface TransactionFormState {
  type: TransactionType;
  amount: number;
  date: Date;
  paymentMode: string;
  reference: string;
  notes: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
}

export interface UserFormState {
  email: string;
  password: string;
  businessName: string;
  phone: string;
  address: string;
  currency: string;
}