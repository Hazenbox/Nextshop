// Mock Supabase client - no actual API calls
// This file provides mock data and functions to allow the app to run without real Supabase credentials

import { Transaction } from '../types';
import { createClient } from '@supabase/supabase-js';
import { InventoryItem, Media } from '../types';
import { Database } from '../types/supabase';

// Define types from the Database interface
type Profile = Database['public']['Tables']['profiles']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type TransactionItem = Database['public']['Tables']['transaction_items']['Row'];
type ItemMedia = Database['public']['Tables']['item_media']['Row'];

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Enable development mode when VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not available
const DEV_MODE = !supabaseUrl || !supabaseAnonKey;

// If in dev mode, log a message
if (DEV_MODE) {
  console.warn('Running in development mode with mock data. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to connect to Supabase.');
}

// Create the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Create a mock user for demo purposes
const MOCK_USER = {
  id: 'mock-user-id',
  email: 'demo@example.com',
  aud: 'authenticated',
  role: 'authenticated',
  email_confirmed_at: new Date().toISOString(),
  confirmation_sent_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  app_metadata: { provider: 'email' },
  user_metadata: {},
  identities: []
};

// Create a mock user session for demo purposes
const MOCK_SESSION = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: MOCK_USER
};

// Create a mock profile for the demo user
export const MOCK_PROFILE: Profile = {
  id: MOCK_USER.id,
  email: MOCK_USER.email,
  business_name: 'Demo Business',
  phone: '123-456-7890',
  address: '123 Main St, Demo City',
  currency: 'USD',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Storage services
export async function uploadImage(file: File, path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(import.meta.env.VITE_STORAGE_BUCKET || 'inventory-images')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from(import.meta.env.VITE_STORAGE_BUCKET || 'inventory-images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function deleteImage(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(import.meta.env.VITE_STORAGE_BUCKET || 'inventory-images')
    .remove([path]);

  if (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

// Profile services
export const profileService = {
  getProfile: async (userId: string): Promise<Profile | null> => {
    if (DEV_MODE) {
      console.log('Using mock profile in dev mode');
      return MOCK_PROFILE;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching profile:', error);
      throw error;
    }

    return data;
  },

  updateProfile: async (userId: string, updates: Partial<Omit<Profile, 'id'>>): Promise<Profile> => {
    if (DEV_MODE) {
      console.log('Using mock profile update in dev mode');
      return {
        ...MOCK_PROFILE,
        ...updates,
        updated_at: new Date().toISOString()
      };
    }
    
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: now
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    return data;
  },

  createProfile: async (profile: Profile): Promise<Profile> => {
    if (DEV_MODE) {
      console.log('Using mock profile creation in dev mode');
      return {
        ...MOCK_PROFILE,
        ...profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
    
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        ...profile,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      throw error;
    }

    return data;
  }
};

// Category services
export const categoryService = {
  getCategories: async (userId: string): Promise<Category[]> => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return data;
  },

  createCategory: async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> => {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('categories')
      .insert({
        ...category,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }

    return data;
  },

  updateCategory: async (id: string, updates: Partial<Omit<Category, 'id' | 'created_at'>>): Promise<Category> => {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('categories')
      .update({
        ...updates,
        updated_at: now
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }

    return data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
};

// Transaction service
export const transactionService = {
  getTransactions: async (userId: string): Promise<Transaction[]> => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }

    return data;
  },

  getTransaction: async (id: string): Promise<Transaction | null> => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching transaction:', error);
      throw error;
    }

    return data;
  },

  getTransactionWithItems: async (id: string): Promise<Transaction & { items: TransactionItem[] }> => {
    // First get the transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (txError) {
      console.error('Error fetching transaction:', txError);
      throw txError;
    }

    // Then get the items
    const { data: items, error: itemsError } = await supabase
      .from('transaction_items')
      .select('*')
      .eq('transaction_id', id);

    if (itemsError) {
      console.error('Error fetching transaction items:', itemsError);
      throw itemsError;
    }

    return {
      ...transaction,
      items: items || []
    };
  },

  createTransaction: async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>, 
                           items: Omit<TransactionItem, 'id' | 'created_at' | 'updated_at' | 'transaction_id'>[]): Promise<Transaction> => {
    // Start a Supabase transaction
    const now = new Date().toISOString();
    
    // First insert the transaction
    const { data: txData, error: txError } = await supabase
      .from('transactions')
      .insert({
        ...transaction,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (txError) {
      console.error('Error creating transaction:', txError);
      throw txError;
    }

    // Then insert the items if there are any
    if (items.length > 0) {
      const itemsWithTxId = items.map(item => ({
        ...item,
        transaction_id: txData.id,
        created_at: now,
        updated_at: now
      }));

      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(itemsWithTxId);

      if (itemsError) {
        console.error('Error creating transaction items:', itemsError);
        throw itemsError;
      }
    }

    return txData;
  },

  updateTransaction: async (id: string, updates: Partial<Omit<Transaction, 'id' | 'created_at'>>): Promise<Transaction> => {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('transactions')
      .update({
        ...updates,
        updated_at: now
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }

    return data;
  },

  deleteTransaction: async (id: string): Promise<void> => {
    // First delete all items associated with this transaction
    const { error: itemsError } = await supabase
      .from('transaction_items')
      .delete()
      .eq('transaction_id', id);

    if (itemsError) {
      console.error('Error deleting transaction items:', itemsError);
      throw itemsError;
    }

    // Then delete the transaction itself
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }
};

// Inventory service
export const inventoryService = {
  getInventoryItems: async (userId: string): Promise<InventoryItem[]> => {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (error) {
      console.error('Error fetching inventory items:', error);
      throw error;
    }

    return data;
  },

  getInventoryItem: async (id: string): Promise<InventoryItem | null> => {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching inventory item:', error);
      throw error;
    }

    return data;
  },

  getInventoryItemWithMedia: async (id: string): Promise<InventoryItem & { media: ItemMedia[] }> => {
    // First get the item
    const { data: item, error: itemError } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', id)
      .single();

    if (itemError) {
      console.error('Error fetching inventory item:', itemError);
      throw itemError;
    }

    // Then get the media
    const { data: media, error: mediaError } = await supabase
      .from('item_media')
      .select('*')
      .eq('item_id', id);

    if (mediaError) {
      console.error('Error fetching item media:', mediaError);
      throw mediaError;
    }

    return {
      ...item,
      media: media || []
    };
  },

  createInventoryItem: async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItem> => {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('inventory_items')
      .insert({
        ...item,
        image_ids: item.image_ids || [],
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating inventory item:', error);
      throw error;
    }

    return data;
  },

  updateInventoryItem: async (id: string, updates: Partial<Omit<InventoryItem, 'id' | 'created_at'>>): Promise<InventoryItem> => {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('inventory_items')
      .update({
        ...updates,
        updated_at: now
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }

    return data;
  },

  deleteInventoryItem: async (id: string): Promise<void> => {
    // First delete all media associated with this item
    const { error: mediaError } = await supabase
      .from('item_media')
      .delete()
      .eq('item_id', id);

    if (mediaError) {
      console.error('Error deleting item media:', mediaError);
      throw mediaError;
    }

    // Also delete any transaction items that reference this inventory item
    const { error: txItemsError } = await supabase
      .from('transaction_items')
      .delete()
      .eq('item_id', id);

    if (txItemsError) {
      console.error('Error deleting transaction items:', txItemsError);
      throw txItemsError;
    }

    // Then delete the item itself
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  },

  // Media related functions
  addMedia: async (itemId: string, media: Omit<ItemMedia, 'id' | 'created_at' | 'updated_at'>): Promise<ItemMedia> => {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('item_media')
      .insert({
        ...media,
        item_id: itemId,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding media:', error);
      throw error;
    }

    // Also update the image_ids array in the inventory item
    const { data: item } = await supabase
      .from('inventory_items')
      .select('image_ids')
      .eq('id', itemId)
      .single();

    if (item) {
      const updatedImageIds = [...(item.image_ids || []), data.id];
      
      await supabase
        .from('inventory_items')
        .update({
          image_ids: updatedImageIds,
          updated_at: now
        })
        .eq('id', itemId);
    }

    return data;
  },

  deleteMedia: async (mediaId: string, itemId: string): Promise<void> => {
    // First get the media item to get the storage path
    const { data: media } = await supabase
      .from('item_media')
      .select('storage_path')
      .eq('id', mediaId)
      .single();

    // Delete the file from storage if there's a storage path
    if (media?.storage_path) {
      await deleteImage(media.storage_path);
    }

    // Delete the media record
    const { error } = await supabase
      .from('item_media')
      .delete()
      .eq('id', mediaId);

    if (error) {
      console.error('Error deleting media:', error);
      throw error;
    }

    // Also update the image_ids array in the inventory item
    const { data: item } = await supabase
      .from('inventory_items')
      .select('image_ids')
      .eq('id', itemId)
      .single();

    if (item && item.image_ids) {
      const updatedImageIds = item.image_ids.filter((id: string) => id !== mediaId);
      
      await supabase
        .from('inventory_items')
        .update({
          image_ids: updatedImageIds,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);
    }
  }
};

// Auth service additions - add this before the export of mockTransactions
export const authService = {
  mockSignIn: async () => {
    // Return a mock user and session
    return {
      data: {
        user: MOCK_USER,
        session: MOCK_SESSION
      },
      error: null
    };
  },
  
  mockSignUp: async () => {
    // Return a mock user and session
    return {
      data: {
        user: MOCK_USER,
        session: MOCK_SESSION
      },
      error: null
    };
  },
  
  mockSignInWithOtp: async () => {
    // Return success for magic link
    return {
      data: {},
      error: null
    };
  }
};

// Override Supabase auth methods in development mode
if (DEV_MODE) {
  console.log('DEV MODE: Overriding Supabase client with mock implementations');
  
  // Enhanced mock sign up that works with localStorage stored user data
  // @ts-ignore - for development mode only
  supabase.auth.signUp = async (credentials) => {
    console.log('DEV MODE: Mock signup with:', credentials);
    
    // If we have stored user data, use that email
    const storedUserData = localStorage.getItem('devModeUserData');
    // Safe access to email using type casting or optional chaining
    const credentialEmail = typeof credentials === 'object' && credentials && 'email' in credentials 
      ? credentials.email as string 
      : 'demo@example.com';
    
    let email = credentialEmail;
    
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        email = userData.email || email;
      } catch (e) {
        // Ignore parsing errors
      }
    }
    
    // Create a mock user with the provided or stored email
    const mockUser = {
      ...MOCK_USER,
      email: email
    };
    
    // Return a successful response
    return {
      data: {
        user: mockUser,
        session: {...MOCK_SESSION, user: mockUser}
      },
      error: null
    };
  };
  
  // @ts-ignore - for development mode only
  supabase.auth.signInWithPassword = async (credentials) => {
    console.log('DEV MODE: Mock sign in with credentials');
    
    // Safe access to email with type casting
    const credentialEmail = typeof credentials === 'object' && credentials && 'email' in credentials
      ? credentials.email as string
      : 'demo@example.com';
    
    // Create a mock user with the provided email
    const mockUser = {
      ...MOCK_USER,
      email: credentialEmail
    };
    
    // Return a successful response
    return {
      data: {
        user: mockUser,
        session: {...MOCK_SESSION, user: mockUser}
      },
      error: null
    };
  };
  
  // @ts-ignore - for development mode only
  supabase.auth.signInWithOtp = authService.mockSignInWithOtp;
  
  // Enhanced mock getSession that uses localStorage
  // @ts-ignore - for development mode only
  supabase.auth.getSession = async () => {
    // Check if we have stored user data
    const storedUserData = localStorage.getItem('devModeUserData');
    let email = MOCK_USER.email;
    
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        email = userData.email || email;
      } catch (e) {
        // Ignore parsing errors
      }
    }
    
    // Create a mock user with the stored email
    const mockUser = {
      ...MOCK_USER,
      email: email
    };
    
    return {
      data: { 
        session: {...MOCK_SESSION, user: mockUser} 
      },
      error: null
    };
  };
  
  // Enhanced mock onAuthStateChange
  // @ts-ignore - for development mode only
  supabase.auth.onAuthStateChange = (callback) => {
    // Immediately call the callback with the mock session
    setTimeout(() => {
      // Check if we have stored user data
      const storedUserData = localStorage.getItem('devModeUserData');
      let email = MOCK_USER.email;
      
      if (storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          email = userData.email || email;
        } catch (e) {
          // Ignore parsing errors
        }
      }
      
      // Create a mock user with the stored email
      const mockUser = {
        ...MOCK_USER,
        email: email
      };
      
      callback('SIGNED_IN', {...MOCK_SESSION, user: mockUser});
    }, 0);
    
    // Return a mock subscription that does nothing on unsubscribe
    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    };
  };
  
  // Mock signOut that clears localStorage user data
  // @ts-ignore - for development mode only
  supabase.auth.signOut = async () => {
    console.log('DEV MODE: Mock sign out');
    localStorage.removeItem('devModeUserData');
    return { error: null };
  };
  
  // Mock resetPasswordForEmail
  // @ts-ignore - for development mode only
  supabase.auth.resetPasswordForEmail = async () => {
    console.log('DEV MODE: Mock password reset email sent');
    return { 
      data: { user: null },
      error: null 
    };
  };
  
  // Mock updateUser
  // @ts-ignore - for development mode only
  supabase.auth.updateUser = async () => {
    console.log('DEV MODE: Mock update user');
    return { 
      data: { user: MOCK_USER },
      error: null 
    };
  };
}

// Mock transaction data
export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 25000,
    date: new Date('2023-10-15').toISOString(),
    payment_mode: 'cash',
    reference: 'INV-001',
    notes: 'Laptop sale',
    user_id: 'user-1',
    created_at: new Date('2023-10-15').toISOString(),
    updated_at: new Date('2023-10-15').toISOString()
  },
  {
    id: '2',
    type: 'expense',
    amount: 12500,
    date: new Date('2023-10-12').toISOString(),
    payment_mode: 'bank_transfer',
    reference: 'PO-001',
    notes: 'Inventory purchase',
    user_id: 'user-1',
    created_at: new Date('2023-10-12').toISOString(),
    updated_at: new Date('2023-10-12').toISOString()
  },
  {
    id: '3',
    type: 'income',
    amount: 15000,
    date: new Date('2023-10-10').toISOString(),
    payment_mode: 'upi',
    reference: 'INV-002',
    notes: 'Monitor sale',
    user_id: 'user-1',
    created_at: new Date('2023-10-10').toISOString(),
    updated_at: new Date('2023-10-10').toISOString()
  },
  {
    id: '4',
    type: 'expense',
    amount: 5000,
    date: new Date('2023-10-08').toISOString(),
    payment_mode: 'credit_card',
    reference: 'RENT-OCT',
    notes: 'Office rent',
    user_id: 'user-1',
    created_at: new Date('2023-10-08').toISOString(),
    updated_at: new Date('2023-10-08').toISOString()
  },
  {
    id: '5',
    type: 'income',
    amount: 8000,
    date: new Date('2023-10-05').toISOString(),
    payment_mode: 'cash',
    reference: 'INV-003',
    notes: 'Keyboard sale',
    user_id: 'user-1',
    created_at: new Date('2023-10-05').toISOString(),
    updated_at: new Date('2023-10-05').toISOString()
  },
  {
    id: '6',
    type: 'expense',
    amount: 2000,
    date: new Date('2023-10-03').toISOString(),
    payment_mode: 'upi',
    reference: 'UTIL-OCT',
    notes: 'Utilities',
    user_id: 'user-1',
    created_at: new Date('2023-10-03').toISOString(),
    updated_at: new Date('2023-10-03').toISOString()
  },
  {
    id: '7',
    type: 'income',
    amount: 35000,
    date: new Date('2023-10-01').toISOString(),
    payment_mode: 'bank_transfer',
    reference: 'INV-004',
    notes: 'PC sale',
    user_id: 'user-1',
    created_at: new Date('2023-10-01').toISOString(),
    updated_at: new Date('2023-10-01').toISOString()
  }
];

// Mock database queries for development mode
if (DEV_MODE) {
  // Mock for profiles table
  // @ts-ignore - for development mode only
  const mockProfilesFrom = {
    select: () => ({
      eq: () => ({
        single: async () => ({
          data: MOCK_PROFILE,
          error: null
        })
      }),
      order: () => ({
        data: [MOCK_PROFILE],
        error: null
      })
    }),
    insert: () => ({
      select: () => ({
        single: async () => ({
          data: MOCK_PROFILE,
          error: null
        })
      })
    }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: async () => ({
            data: MOCK_PROFILE,
            error: null
          })
        })
      })
    }),
    upsert: () => ({
      select: () => ({
        single: async () => ({
          data: MOCK_PROFILE,
          error: null
        })
      })
    })
  };

  // Create mock response for .from() queries
  const mockFrom = (tableName: string) => {
    if (tableName === 'profiles') {
      return mockProfilesFrom;
    }
    
    // Default implementation for other tables
    return {
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: null,
            error: null
          }),
          data: [],
          error: null
        }),
        order: () => ({
          data: [],
          error: null
        })
      }),
      insert: () => ({
        select: () => ({
          single: async () => ({
            data: null,
            error: null
          })
        })
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: async () => ({
              data: null,
              error: null
            })
          })
        })
      }),
      delete: () => ({
        eq: () => ({
          data: null,
          error: null
        })
      })
    };
  };

  // Override supabase.from
  // @ts-ignore - for development mode only
  supabase.from = mockFrom;
  
  // Mock storage
  // @ts-ignore - for development mode only
  supabase.storage = {
    from: () => ({
      upload: async () => ({
        data: { path: 'mock-path' },
        error: null
      }),
      getPublicUrl: () => ({
        data: { publicUrl: 'https://example.com/mock-image.jpg' }
      }),
      remove: async () => ({
        data: null,
        error: null
      })
    })
  };
}