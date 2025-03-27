export interface Image {
  id: string;
  name: string;
  url: string;
  description?: string;
  width?: number;
  height?: number;
  storage_path: string;
  board_id: string;
  item_id?: string;
  created_at?: Date;
  createdAt: Date;
}

export interface Board {
  id: string;
  editKey?: string;
  images: Image[];
  createdAt: Date;
}

export interface ImageViewerProps {
  images: Image[];
  currentIndex: number;
  onClose: () => void;
  onDelete: (id: string) => void;
  onReplace: (id: string) => void;
  onNavigate: (index: number) => void;
}

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  cost_price: number;
  quantity: number;
  status: 'active' | 'low stock' | 'out of stock';
  image_ids: string[];
  created_at: string;
  updated_at: string;
  image?: string;
  currency?: string;
  media?: Media[];
}

export interface Media {
  type: 'image' | 'video';
  url: string;
}

export interface CustomField {
  id: string;
  board_id: string;
  name: string;
  field_type: 'text' | 'number' | 'date' | 'boolean';
  created_at: Date;
}

export interface FieldValue {
  id: string;
  item_id: string;
  field_id: string;
  value: string;
  created_at: Date;
  updated_at: Date;
}

export interface TransactionInput {
  type: 'income' | 'expense';
  amount: number;
  date: string;
  payment_mode: string;
  reference?: string;
  notes?: string;
  items?: any[];
  attachments?: any[];
}

export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  amount: number;
  payment_mode: string;
  reference?: string;
  notes?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  business_name: string | null;
  phone: string | null;
  address: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  item_id: string | null;
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface ItemMedia {
  id: string;
  item_id: string;
  type: 'image' | 'video';
  url: string;
  storage_path: string | null;
  created_at: string;
  updated_at: string;
}