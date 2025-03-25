import { create } from 'zustand';
import { mockTransactions } from '../lib/supabase';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  payment_mode: string;
  reference?: string;
  notes?: string;
  items?: any[];
  attachments?: any[];
  createdAt: Date;
}

interface TransactionStore {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  getTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<Transaction>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  loading: false,
  error: null,

  getTransactions: async () => {
    set({ loading: true, error: null });
    
    try {
      // In a real app, you would fetch from Supabase here
      // For now, use the mock data
      set({ transactions: mockTransactions });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Error fetching transactions:', error);
    } finally {
      set({ loading: false });
    }
  },

  addTransaction: async (transaction) => {
    set({ loading: true, error: null });
    
    try {
      // Create a new transaction object with id and createdAt
      const newTransaction: Transaction = {
        ...transaction,
        id: Date.now().toString(),
        createdAt: new Date()
      };
      
      // Add it to the store
      set(state => ({
        transactions: [newTransaction, ...state.transactions]
      }));
      
      return newTransaction;
    } catch (error: any) {
      set({ error: error.message });
      console.error('Error adding transaction:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateTransaction: async (id, transaction) => {
    set({ loading: true, error: null });
    
    try {
      set(state => ({
        transactions: state.transactions.map(t => 
          t.id === id ? { ...t, ...transaction } : t
        )
      }));
    } catch (error: any) {
      set({ error: error.message });
      console.error('Error updating transaction:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteTransaction: async (id) => {
    set({ loading: true, error: null });
    
    try {
      set(state => ({
        transactions: state.transactions.filter(t => t.id !== id)
      }));
    } catch (error: any) {
      set({ error: error.message });
      console.error('Error deleting transaction:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));