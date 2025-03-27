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
      profiles: {
        Row: {
          id: string;
          email: string | null;
          business_name: string | null;
          phone: string | null;
          address: string | null;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          business_name?: string | null;
          phone?: string | null;
          address?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          business_name?: string | null;
          phone?: string | null;
          address?: string | null;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          user_id?: string;
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
          status: 'available' | 'sold' | 'reserved' | 'active' | 'low stock' | 'out of stock';
          image_ids: string[];
          user_id: string;
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
          status: 'available' | 'sold' | 'reserved' | 'active' | 'low stock' | 'out of stock';
          image_ids?: string[];
          user_id: string;
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
          status?: 'available' | 'sold' | 'reserved' | 'active' | 'low stock' | 'out of stock';
          image_ids?: string[];
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      item_media: {
        Row: {
          id: string;
          item_id: string;
          type: 'image' | 'video';
          url: string;
          storage_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          type: 'image' | 'video';
          url: string;
          storage_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          item_id?: string;
          type?: 'image' | 'video';
          url?: string;
          storage_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      item_to_media: {
        Row: {
          item_id: string;
          media_id: string;
        };
        Insert: {
          item_id: string;
          media_id: string;
        };
        Update: {
          item_id?: string;
          media_id?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          type: 'income' | 'expense';
          amount: number;
          date: string;
          payment_mode: string;
          reference: string | null;
          notes: string | null;
          user_id: string;
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
          user_id: string;
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
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      transaction_items: {
        Row: {
          id: string;
          transaction_id: string;
          item_id: string | null;
          quantity: number;
          price: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          item_id?: string | null;
          quantity: number;
          price: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          item_id?: string | null;
          quantity?: number;
          price?: number;
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
  storage: {
    Tables: {
      buckets: {
        Row: {
          id: string;
          name: string;
          owner: string | null;
          created_at: string | null;
          updated_at: string | null;
          public: boolean | null;
          avif_autodetection: boolean | null;
          file_size_limit: number | null;
          allowed_mime_types: string[] | null;
          owner_id: string | null;
        };
        Insert: {
          id: string;
          name: string;
          owner?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          public?: boolean | null;
          avif_autodetection?: boolean | null;
          file_size_limit?: number | null;
          allowed_mime_types?: string[] | null;
          owner_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          owner?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          public?: boolean | null;
          avif_autodetection?: boolean | null;
          file_size_limit?: number | null;
          allowed_mime_types?: string[] | null;
          owner_id?: string | null;
        };
      };
      objects: {
        Row: {
          id: string;
          bucket_id: string;
          name: string;
          owner: string | null;
          created_at: string | null;
          updated_at: string | null;
          last_accessed_at: string | null;
          metadata: Json | null;
          path_tokens: string[] | null;
          version: string | null;
          owner_id: string | null;
        };
        Insert: {
          id?: string;
          bucket_id: string;
          name: string;
          owner?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          path_tokens?: string[] | null;
          version?: string | null;
          owner_id?: string | null;
        };
        Update: {
          id?: string;
          bucket_id?: string;
          name?: string;
          owner?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          path_tokens?: string[] | null;
          version?: string | null;
          owner_id?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      foldername: {
        Args: {
          name: string;
        };
        Returns: string[];
      };
      extension: {
        Args: {
          name: string;
        };
        Returns: string;
      };
      filename: {
        Args: {
          name: string;
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
  auth: {
    Tables: {
      audit_log_entries: {
        Row: {
          instance_id: string | null;
          id: string;
          payload: Json | null;
          created_at: string | null;
          ip_address: string;
        };
        Insert: {
          instance_id?: string | null;
          id: string;
          payload?: Json | null;
          created_at?: string | null;
          ip_address?: string;
        };
        Update: {
          instance_id?: string | null;
          id?: string;
          payload?: Json | null;
          created_at?: string | null;
          ip_address?: string;
        };
      };
      flow_state: {
        Row: {
          id: string;
          user_id: string | null;
          auth_code: string;
          code_challenge_method: string;
          code_challenge: string;
          provider_type: string;
          provider_access_token: string | null;
          provider_refresh_token: string | null;
          created_at: string | null;
          updated_at: string | null;
          authentication_method: string;
        };
        Insert: {
          id: string;
          user_id?: string | null;
          auth_code: string;
          code_challenge_method: string;
          code_challenge: string;
          provider_type: string;
          provider_access_token?: string | null;
          provider_refresh_token?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          authentication_method: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          auth_code?: string;
          code_challenge_method?: string;
          code_challenge?: string;
          provider_type?: string;
          provider_access_token?: string | null;
          provider_refresh_token?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          authentication_method?: string;
        };
      };
      users: {
        Row: {
          instance_id: string | null;
          id: string;
          aud: string | null;
          role: string | null;
          email: string | null;
          encrypted_password: string | null;
          email_confirmed_at: string | null;
          invited_at: string | null;
          confirmation_token: string | null;
          confirmation_sent_at: string | null;
          recovery_token: string | null;
          recovery_sent_at: string | null;
          email_change_token_new: string | null;
          email_change: string | null;
          email_change_sent_at: string | null;
          last_sign_in_at: string | null;
          raw_app_meta_data: Json | null;
          raw_user_meta_data: Json | null;
          is_super_admin: boolean | null;
          created_at: string | null;
          updated_at: string | null;
          phone: string | null;
          phone_confirmed_at: string | null;
          phone_change: string | null;
          phone_change_token: string | null;
          phone_change_sent_at: string | null;
          confirmed_at: string | null;
          email_change_token_current: string | null;
          email_change_confirm_status: number | null;
          banned_until: string | null;
          reauthentication_token: string | null;
          reauthentication_sent_at: string | null;
          is_sso_user: boolean;
          deleted_at: string | null;
        };
        Insert: {
          instance_id?: string | null;
          id: string;
          aud?: string | null;
          role?: string | null;
          email?: string | null;
          encrypted_password?: string | null;
          email_confirmed_at?: string | null;
          invited_at?: string | null;
          confirmation_token?: string | null;
          confirmation_sent_at?: string | null;
          recovery_token?: string | null;
          recovery_sent_at?: string | null;
          email_change_token_new?: string | null;
          email_change?: string | null;
          email_change_sent_at?: string | null;
          last_sign_in_at?: string | null;
          raw_app_meta_data?: Json | null;
          raw_user_meta_data?: Json | null;
          is_super_admin?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          phone?: string | null;
          phone_confirmed_at?: string | null;
          phone_change?: string | null;
          phone_change_token?: string | null;
          phone_change_sent_at?: string | null;
          confirmed_at?: string | null;
          email_change_token_current?: string | null;
          email_change_confirm_status?: number | null;
          banned_until?: string | null;
          reauthentication_token?: string | null;
          reauthentication_sent_at?: string | null;
          is_sso_user?: boolean;
          deleted_at?: string | null;
        };
        Update: {
          instance_id?: string | null;
          id?: string;
          aud?: string | null;
          role?: string | null;
          email?: string | null;
          encrypted_password?: string | null;
          email_confirmed_at?: string | null;
          invited_at?: string | null;
          confirmation_token?: string | null;
          confirmation_sent_at?: string | null;
          recovery_token?: string | null;
          recovery_sent_at?: string | null;
          email_change_token_new?: string | null;
          email_change?: string | null;
          email_change_sent_at?: string | null;
          last_sign_in_at?: string | null;
          raw_app_meta_data?: Json | null;
          raw_user_meta_data?: Json | null;
          is_super_admin?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
          phone?: string | null;
          phone_confirmed_at?: string | null;
          phone_change?: string | null;
          phone_change_token?: string | null;
          phone_change_sent_at?: string | null;
          confirmed_at?: string | null;
          email_change_token_current?: string | null;
          email_change_confirm_status?: number | null;
          banned_until?: string | null;
          reauthentication_token?: string | null;
          reauthentication_sent_at?: string | null;
          is_sso_user?: boolean;
          deleted_at?: string | null;
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