import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTransactionStore } from '../stores/transactionStore';
import { TransactionInput } from '../types';
import { Notification } from '../components/Notification';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId?: string | null;
}

export function AddTransactionModal({ isOpen, onClose, transactionId }: AddTransactionModalProps) {
  const { addTransaction, updateTransaction, transactions } = useTransactionStore();
  
  const [formData, setFormData] = useState<TransactionInput>({
    type: 'income',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    payment_mode: 'Cash',
    reference: '',
    notes: '',
    items: [],
    attachments: []
  });

  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Load transaction data if editing
  useEffect(() => {
    if (transactionId) {
      const transaction = transactions.find(t => t.id === transactionId);
      if (transaction) {
        setFormData({
          type: transaction.type,
          amount: transaction.amount,
          date: new Date(transaction.date).toISOString().split('T')[0],
          payment_mode: transaction.payment_mode,
          reference: transaction.reference || '',
          notes: transaction.notes || '',
          items: transaction.items || [],
          attachments: transaction.attachments || []
        });
      }
    } else {
      // Reset form for new transaction
      setFormData({
        type: 'income',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        payment_mode: 'Cash',
        reference: '',
        notes: '',
        items: [],
        attachments: []
      });
    }
  }, [transactionId, transactions, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (transactionId) {
        // Update existing transaction
        await updateTransaction(transactionId, formData);
        showNotification('Transaction updated successfully');
      } else {
        // Add new transaction
        await addTransaction(formData);
        showNotification('Transaction added successfully');
      }
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      showNotification('Failed to save transaction', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {transactionId ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Mode
              </label>
              <select
                name="payment_mode"
                value={formData.payment_mode}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference
              </label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                placeholder="Invoice number, bill number, etc."
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Add additional details here..."
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
            >
              {transactionId ? 'Update' : 'Add'} Transaction
            </button>
          </div>
        </form>
      </div>

      <Notification 
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
}