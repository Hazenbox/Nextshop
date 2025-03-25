import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { Plus, Download, Edit, Trash2, Eye, Search, X, ChevronDown, Check, Filter, ArrowUpRight, ArrowDownLeft, Calendar } from 'lucide-react';
import { transactionService, mockTransactions } from '../lib/supabase';
import { Transaction } from '../types';
import { AddTransactionSideSheet } from '../components/AddTransactionSideSheet';
import { ResponsiveView, DataCard } from '../components/ResponsiveView';

export function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isTransactionSideSheetOpen, setIsTransactionSideSheetOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await transactionService.getTransactions();
        setTransactions(data);
      } catch (err) {
        console.error('Error loading transactions:', err);
        setError('Failed to load transactions. Please try again.');
        setTransactions(mockTransactions); // Fallback to mock data
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  // Click outside handler to close the menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    // Add event listener when menu is open
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Clean up the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionService.deleteTransaction(id);
        setTransactions(prev => prev.filter(tx => tx.id !== id));
      } catch (err) {
        console.error('Error deleting transaction:', err);
        alert('Failed to delete transaction. Please try again.');
      }
    }
  };

  const handleEdit = (transaction: Transaction) => {
    // Open the side sheet for editing the transaction
    // In a real implementation, we would set the transaction to edit
    console.log('Edit transaction:', transaction);
    setIsTransactionSideSheetOpen(true);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleExport = () => {
    try {
      // Create CSV content
      const headers = ['Date', 'Type', 'Amount', 'Payment Mode', 'Reference', 'Notes'];
      const csvContent = [
        headers.join(','),
        ...transactions.map(tx => {
          const row = [
            `"${new Date(tx.date).toLocaleDateString()}"`,
            `"${tx.type}"`,
            tx.amount,
            `"${tx.payment_mode}"`,
            `"${tx.reference || ''}"`,
            `"${tx.notes || ''}"`,
          ];
          return row.join(',');
        })
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting transactions:', error);
      alert('Failed to export transaction data');
    }
  };

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(tx => {
      if (selectedType !== 'all' && tx.type !== selectedType) {
        return false;
      }
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const amount = tx.amount.toString();
        const date = new Date(tx.date).toLocaleDateString();
        const paymentMode = tx.payment_mode.toLowerCase();
        const reference = tx.reference?.toLowerCase() || '';
        const notes = tx.notes?.toLowerCase() || '';
        
        return (
          amount.includes(searchLower) ||
          date.includes(searchLower) ||
          paymentMode.includes(searchLower) ||
          reference.includes(searchLower) ||
          notes.includes(searchLower)
        );
      }
      
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
    
  const totalExpense = filteredTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
    
  const netAmount = totalIncome - totalExpense;

  // Render transaction cards for mobile view
  const renderTransactionCards = () => {
    return (
      <div className="grid grid-cols-1 gap-3 p-4">
        {filteredTransactions.map(transaction => (
          <div 
            key={transaction.id} 
            className="bg-surface rounded-lg p-4 border border-outline/5 shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <div className={`mr-3 p-2 rounded-full ${
                  transaction.type === 'income' 
                    ? 'bg-primary-container' 
                    : 'bg-error-container'
                }`}>
                  {transaction.type === 'income' ? (
                    <ArrowUpRight className={`h-5 w-5 text-on-primary-container`} />
                  ) : (
                    <ArrowDownLeft className={`h-5 w-5 text-on-error-container`} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-on-surface">
                    {transaction.type === 'income' ? 'Income' : 'Expense'}
                  </p>
                  <p className="text-xs text-on-surface-variant">{transaction.payment_mode}</p>
                </div>
              </div>
              <span className={`text-sm font-medium ${
                transaction.type === 'income' ? 'text-primary' : 'text-error'
              }`}>
                ₹{transaction.amount.toLocaleString()}
              </span>
            </div>
            
            <div className="text-xs text-on-surface-variant mb-2 flex items-center">
              <Calendar size={14} className="mr-1" />
              {new Date(transaction.date).toLocaleDateString('en-US', {
                year: 'numeric', 
                month: 'short', 
                day: 'numeric'
              })}
            </div>
            
            {(transaction.reference || transaction.notes) && (
              <div className="text-xs text-on-surface-variant mt-2 pt-2 border-t border-outline/10">
                {transaction.reference && (
                  <p><span className="font-medium">Reference:</span> {transaction.reference}</p>
                )}
                {transaction.notes && (
                  <p><span className="font-medium">Notes:</span> {transaction.notes}</p>
                )}
              </div>
            )}
            
            <div className="flex justify-end mt-3 pt-2 border-t border-outline/10">
              <button
                onClick={() => handleEdit(transaction)}
                className="p-1.5 rounded-full text-primary hover:bg-primary/5"
                aria-label="Edit transaction"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => handleDelete(transaction.id)}
                className="p-1.5 rounded-full text-error hover:bg-error/5 ml-2"
                aria-label="Delete transaction"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render transaction table for desktop view
  const renderTransactionTable = () => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-outline/10 bg-surface-container-low">
              <th className="py-3 px-4 text-left text-xs font-medium text-on-surface-variant whitespace-nowrap">
                <div className="flex items-center">
                  Date
                  <ChevronDown size={14} className="ml-1 opacity-50" />
                </div>
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-on-surface-variant whitespace-nowrap">
                <div className="flex items-center">
                  Type
                  <ChevronDown size={14} className="ml-1 opacity-50" />
                </div>
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-on-surface-variant whitespace-nowrap">
                <div className="flex items-center">
                  Amount
                  <ChevronDown size={14} className="ml-1 opacity-50" />
                </div>
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-on-surface-variant whitespace-nowrap">
                <div className="flex items-center">
                  Payment Mode
                  <ChevronDown size={14} className="ml-1 opacity-50" />
                </div>
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-on-surface-variant whitespace-nowrap">Reference</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-on-surface-variant whitespace-nowrap">Notes</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-on-surface-variant whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(transaction => (
              <tr key={transaction.id} className="border-b border-outline/10 hover:bg-surface-container-lowest transition-colors">
                <td className="py-3 px-4 whitespace-nowrap text-sm text-on-surface-variant">
                  {new Date(transaction.date).toLocaleDateString('en-US', {
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric'
                  })}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                    transaction.type === 'income' 
                      ? 'bg-primary-container text-on-primary-container' 
                      : 'bg-error-container text-on-error-container'
                  }`}>
                    {transaction.type === 'income' ? 'Income' : 'Expense'}
                  </span>
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-sm font-medium">
                  <span className={transaction.type === 'income' ? 'text-primary' : 'text-error'}>
                    ₹{transaction.amount.toLocaleString()}
                  </span>
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-sm text-on-surface">
                  {transaction.payment_mode}
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-sm text-on-surface">
                  {transaction.reference || '—'}
                </td>
                <td className="py-3 px-4 whitespace-nowrap text-sm text-on-surface max-w-xs truncate">
                  {transaction.notes || '—'}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="p-1.5 rounded-full text-primary hover:bg-primary/5 mr-1"
                      aria-label="Edit transaction"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="p-1.5 rounded-full text-error hover:bg-error/5"
                      aria-label="Delete transaction"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6 bg-background min-h-screen">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-on-surface mb-2">Transactions</h1>
          <p className="text-on-surface-variant">Manage your income and expenses, and track your financial activity.</p>
        </div>
        
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-surface p-4 rounded-xl shadow-sm border border-outline/5">
            <h3 className="text-sm font-medium text-on-surface-variant mb-1">Income</h3>
            <p className="text-2xl font-medium text-primary flex items-center">
              <ArrowUpRight size={20} className="mr-2" />
              ₹{totalIncome.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-surface p-4 rounded-xl shadow-sm border border-outline/5">
            <h3 className="text-sm font-medium text-on-surface-variant mb-1">Expense</h3>
            <p className="text-2xl font-medium text-error flex items-center">
              <ArrowDownLeft size={20} className="mr-2" />
              ₹{totalExpense.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-surface p-4 rounded-xl shadow-sm border border-outline/5">
            <h3 className="text-sm font-medium text-on-surface-variant mb-1">Net Balance</h3>
            <p className={`text-2xl font-medium ${netAmount >= 0 ? 'text-primary' : 'text-error'}`}>
              ₹{netAmount.toLocaleString()}
            </p>
          </div>
        </div>
        
        {/* Filters and Actions Row */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-outline/20 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
              {searchTerm && (
                <button 
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Type Filter */}
            <div className="relative w-48" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-lg border border-outline/20 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 flex justify-between items-center"
              >
                <span>
                  {selectedType === 'all' ? 'All Types' : 
                   selectedType === 'income' ? 'Income' : 'Expense'}
                </span>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
              </button>
              
              {menuOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-surface rounded-lg shadow-lg border border-outline/10 z-10 overflow-hidden">
                  {['all', 'income', 'expense'].map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedType(type as any);
                        setMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm ${
                        selectedType === type
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      {type === 'all' ? 'All Types' : 
                       type === 'income' ? 'Income' : 'Expense'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button 
              className="px-4 py-2.5 flex items-center gap-2 rounded-lg border border-outline/20 bg-surface text-on-surface hover:bg-surface-container-high"
              onClick={handleExport}
            >
              <Download size={18} />
              <span>Export</span>
            </button>
            <button 
              className="px-4 py-2.5 flex items-center gap-2 rounded-lg bg-primary text-on-primary hover:bg-primary/90"
              onClick={() => setIsTransactionSideSheetOpen(true)}
            >
              <Plus size={18} />
              <span>Add Transaction</span>
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="bg-surface rounded-xl overflow-hidden border border-outline/10 shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-2 border-primary/20 rounded-full border-t-primary"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-error">
              <p>{error}</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant">
              <p className="mb-2">No transactions found.</p>
              <p>Try adjusting your filters or add a new transaction.</p>
            </div>
          ) : (
            <>
              {/* Desktop view */}
              <div className="hidden md:block">
                {renderTransactionTable()}
              </div>
              
              {/* Mobile view */}
              <div className="md:hidden">
                {renderTransactionCards()}
              </div>
            </>
          )}
        </div>
        
        {/* Transaction Side Sheet */}
        <AddTransactionSideSheet
          isOpen={isTransactionSideSheetOpen}
          onClose={() => setIsTransactionSideSheetOpen(false)}
        />
      </div>
    </Layout>
  );
}