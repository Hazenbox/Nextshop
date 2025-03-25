export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string;
          type: 'income' | 'expense';
          amount: number;
          date: string;
          payment_mode: string;
          reference: string | null;
          notes: string | null;
          user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: 'income' | 'expense';
          amount: number;
          date: string;
          payment_mode: string;
          reference?: string | null;
          notes?: string | null;
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: 'income' | 'expense';
          amount?: number;
          date?: string;
          payment_mode?: string;
          reference?: string | null;
          notes?: string | null;
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory_items: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          cost_price: number;
          quantity: number;
          category: string;
          status: 'available' | 'sold' | 'reserved';
          user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          cost_price: number;
          quantity: number;
          category: string;
          status: 'available' | 'sold' | 'reserved';
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          cost_price?: number;
          quantity?: number;
          category?: string;
          status?: 'available' | 'sold' | 'reserved';
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}