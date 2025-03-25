// Mock Supabase client - no actual API calls
// This file provides mock data and functions to allow the app to run without real Supabase credentials

import { Transaction } from '../types';

// Mock transaction data - consolidated declaration
export const mockTransactions: Transaction[] = [
  { 
    id: 'tx001', 
    date: new Date(2023, 2, 20), // March 20, 2023
    type: 'income', 
    amount: 5000, 
    payment_mode: 'Cash',
    reference: 'Sale #001',
    notes: 'Sale of electronics',
    created_at: new Date(2023, 2, 20).toISOString(),
    updated_at: new Date(2023, 2, 20).toISOString()
  },
  { 
    id: 'tx002', 
    date: new Date(2023, 2, 20), // March 20, 2023
    type: 'expense', 
    amount: 2500, 
    payment_mode: 'Bank Transfer',
    reference: 'Purchase #001',
    notes: 'Office supplies',
    created_at: new Date(2023, 2, 20).toISOString(),
    updated_at: new Date(2023, 2, 20).toISOString()
  },
  { 
    id: 'tx003', 
    date: new Date(2023, 2, 18), // March 18, 2023
    type: 'income', 
    amount: 8750, 
    payment_mode: 'UPI',
    reference: 'Sale #002',
    notes: 'Sale of furniture',
    created_at: new Date(2023, 2, 18).toISOString(),
    updated_at: new Date(2023, 2, 18).toISOString()
  },
  { 
    id: 'tx004', 
    date: new Date(2023, 2, 15), // March 15, 2023
    type: 'expense', 
    amount: 1200, 
    payment_mode: 'Cash',
    reference: 'Purchase #002',
    notes: 'Stationery items',
    created_at: new Date(2023, 2, 15).toISOString(),
    updated_at: new Date(2023, 2, 15).toISOString()
  },
  { 
    id: 'tx005', 
    date: new Date(2023, 2, 10), // March 10, 2023
    type: 'income', 
    amount: 12500, 
    payment_mode: 'Bank Transfer',
    reference: 'Sale #003',
    notes: 'Services provided',
    created_at: new Date(2023, 2, 10).toISOString(),
    updated_at: new Date(2023, 2, 10).toISOString()
  }
];

// Mock supabase client with no-op methods
export const supabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ data: null, error: null }),
    signUp: () => Promise.resolve({ data: null, error: null }),
    signOut: () => Promise.resolve({ error: null })
  },
  storage: {
    listBuckets: () => Promise.resolve({ data: [], error: null }),
    createBucket: () => Promise.resolve({ data: null, error: null }),
    from: () => ({
      upload: () => Promise.resolve({ data: { path: 'mock-path' }, error: null }),
      remove: () => Promise.resolve({ data: null, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/mock-image.jpg' } })
    })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: null }),
        order: () => ({
          then: (callback: Function) => callback({ data: [], error: null })
        })
      })
    }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => ({
      eq: () => Promise.resolve({ data: null, error: null })
    }),
    delete: () => ({
      eq: () => Promise.resolve({ data: null, error: null })
    })
  })
};

// Mock upload function
export async function uploadImage(file: File, path: string) {
  // Generate a fake URL for the uploaded file
  return URL.createObjectURL(file);
}

// Mock delete function
export async function deleteImage(path: string) {
  // No-op function
  return;
}

// Transaction service using the mock transactions
export const transactionService = {
  getTransactions: async (): Promise<Transaction[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTransactions;
  },

  getTransaction: async (id: string): Promise<Transaction | undefined> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockTransactions.find(tx => tx.id === id);
  },

  createTransaction: async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const now = new Date().toISOString();
    const newTransaction: Transaction = {
      ...transaction,
      id: `tx${mockTransactions.length + 1}`.padStart(5, '0'),
      created_at: now,
      updated_at: now
    };
    
    // In a real app, this would add to a database
    mockTransactions.push(newTransaction);
    
    return newTransaction;
  },

  updateTransaction: async (id: string, updates: Partial<Omit<Transaction, 'id' | 'created_at'>>): Promise<Transaction> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const index = mockTransactions.findIndex(tx => tx.id === id);
    if (index === -1) {
      throw new Error('Transaction not found');
    }
    
    const updatedTransaction = {
      ...mockTransactions[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    // In a real app, this would update a database record
    mockTransactions[index] = updatedTransaction;
    
    return updatedTransaction;
  },

  deleteTransaction: async (id: string): Promise<void> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = mockTransactions.findIndex(tx => tx.id === id);
    if (index === -1) {
      throw new Error('Transaction not found');
    }
    
    // In a real app, this would delete from a database
    mockTransactions.splice(index, 1);
  }
};