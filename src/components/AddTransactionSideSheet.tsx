import React, { useState } from 'react';
import { SideSheet } from './SideSheet';
import { Package, Plus, DollarSign, Calendar } from 'lucide-react';
import { useTransactionStore } from '../stores/transactionStore';
import { InventoryItem } from '../types';
import { inventoryStorage } from '../lib/inventory';

interface AddTransactionSideSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTransactionSideSheet({
  isOpen,
  onClose
}: AddTransactionSideSheetProps) {
  const addTransaction = useTransactionStore(state => state.addTransaction);
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [paidTo, setPaidTo] = useState('');
  const [category, setCategory] = useState('');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load inventory items
  React.useEffect(() => {
    if (isOpen) {
      try {
        const items = inventoryStorage.getAllItems();
        setInventoryItems(items.filter(item => item.status === 'available'));
      } catch (error) {
        console.error('Error loading inventory items:', error);
      }
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (!date) newErrors.date = 'Date is required';
    if (type === 'expense' && !paidTo) newErrors.paidTo = 'Paid to is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Create transaction
    const transaction = {
      id: `tx-${Date.now()}`,
      type,
      amount: Number(amount),
      date: date,
      description,
      paidTo: type === 'expense' ? paidTo : '',
      category,
      payment_mode: paymentMode,
      relatedItemIds: selectedItems,
      createdAt: new Date()
    };
    
    // Add to transaction store
    addTransaction(transaction);
    
    // Reset form
    setType('income');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setPaidTo('');
    setCategory('');
    setPaymentMode('cash');
    setSelectedItems([]);
    setErrors({});
    
    // Close the side sheet
    onClose();
  };
  
  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  return (
    <SideSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Add Transaction"
      variant="standard"
      width="480px"
    >
      <form onSubmit={handleSubmit}>
        {/* Transaction Type */}
        <div style={{ marginBottom: '24px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--md-on-surface-variant)'
            }}
          >
            Transaction Type
          </label>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              type="button"
              onClick={() => setType('income')}
              style={{
                flex: 1,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: type === 'income' ? 'rgba(76, 175, 80, 0.1)' : 'var(--md-surface-variant)',
                border: `2px solid ${type === 'income' ? '#4CAF50' : 'transparent'}`,
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: type === 'income' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: type === 'income' ? '#4CAF50' : 'var(--md-on-surface-variant)'
              }}>
                <Plus size={24} />
              </div>
              <span style={{ 
                color: type === 'income' ? '#4CAF50' : 'var(--md-on-surface-variant)',
                fontWeight: '500'
              }}>
                Income
              </span>
            </button>
            
            <button
              type="button"
              onClick={() => setType('expense')}
              style={{
                flex: 1,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: type === 'expense' ? 'rgba(244, 67, 54, 0.1)' : 'var(--md-surface-variant)',
                border: `2px solid ${type === 'expense' ? '#F44336' : 'transparent'}`,
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: type === 'expense' ? 'rgba(244, 67, 54, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: type === 'expense' ? '#F44336' : 'var(--md-on-surface-variant)'
              }}>
                <DollarSign size={24} />
              </div>
              <span style={{ 
                color: type === 'expense' ? '#F44336' : 'var(--md-on-surface-variant)',
                fontWeight: '500'
              }}>
                Expense
              </span>
            </button>
          </div>
        </div>
        
        {/* Amount and Date */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <label 
              htmlFor="amount"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--md-on-surface-variant)'
              }}
            >
              Amount (₹) <span style={{ color: '#F44336' }}>*</span>
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                border: `1px solid ${errors.amount ? '#F44336' : 'var(--md-outline)'}`,
                borderRadius: '4px',
                backgroundColor: 'var(--md-surface)',
                color: 'var(--md-on-surface)'
              }}
            />
            {errors.amount && (
              <p style={{ color: '#F44336', fontSize: '12px', margin: '4px 0 0' }}>
                {errors.amount}
              </p>
            )}
          </div>
          
          <div style={{ flex: 1 }}>
            <label 
              htmlFor="date"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--md-on-surface-variant)'
              }}
            >
              Date <span style={{ color: '#F44336' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '16px',
                  border: `1px solid ${errors.date ? '#F44336' : 'var(--md-outline)'}`,
                  borderRadius: '4px',
                  backgroundColor: 'var(--md-surface)',
                  color: 'var(--md-on-surface)'
                }}
              />
              <Calendar 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  right: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--md-on-surface-variant)',
                  pointerEvents: 'none'
                }} 
              />
            </div>
            {errors.date && (
              <p style={{ color: '#F44336', fontSize: '12px', margin: '4px 0 0' }}>
                {errors.date}
              </p>
            )}
          </div>
        </div>
        
        {/* Description */}
        <div style={{ marginBottom: '16px' }}>
          <label 
            htmlFor="description"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--md-on-surface-variant)'
            }}
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter transaction details"
            rows={3}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              border: '1px solid var(--md-outline)',
              borderRadius: '4px',
              backgroundColor: 'var(--md-surface)',
              color: 'var(--md-on-surface)',
              resize: 'vertical'
            }}
          />
        </div>
        
        {/* Paid To (for expenses) */}
        {type === 'expense' && (
          <div style={{ marginBottom: '16px' }}>
            <label 
              htmlFor="paidTo"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--md-on-surface-variant)'
              }}
            >
              Paid To <span style={{ color: '#F44336' }}>*</span>
            </label>
            <input
              id="paidTo"
              type="text"
              value={paidTo}
              onChange={(e) => setPaidTo(e.target.value)}
              placeholder="Enter recipient name"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                border: `1px solid ${errors.paidTo ? '#F44336' : 'var(--md-outline)'}`,
                borderRadius: '4px',
                backgroundColor: 'var(--md-surface)',
                color: 'var(--md-on-surface)'
              }}
            />
            {errors.paidTo && (
              <p style={{ color: '#F44336', fontSize: '12px', margin: '4px 0 0' }}>
                {errors.paidTo}
              </p>
            )}
          </div>
        )}
        
        {/* Category */}
        <div style={{ marginBottom: '16px' }}>
          <label 
            htmlFor="category"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--md-on-surface-variant)'
            }}
          >
            Category
          </label>
          <input
            id="category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Enter transaction category"
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              border: '1px solid var(--md-outline)',
              borderRadius: '4px',
              backgroundColor: 'var(--md-surface)',
              color: 'var(--md-on-surface)'
            }}
          />
        </div>
        
        {/* Payment Mode */}
        <div style={{ marginBottom: '24px' }}>
          <label 
            htmlFor="paymentMode"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: 'var(--md-on-surface-variant)'
            }}
          >
            Payment Mode
          </label>
          <select
            id="paymentMode"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              border: '1px solid var(--md-outline)',
              borderRadius: '4px',
              backgroundColor: 'var(--md-surface)',
              color: 'var(--md-on-surface)'
            }}
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        {/* Item Selection (for incomes) */}
        {type === 'income' && inventoryItems.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '12px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--md-on-surface-variant)'
              }}
            >
              Related Inventory Items
            </label>
            <div style={{ 
              maxHeight: '200px', 
              overflowY: 'auto',
              border: '1px solid var(--md-outline)',
              borderRadius: '4px'
            }}>
              {inventoryItems.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--md-outline-variant)',
                    backgroundColor: selectedItems.includes(item.id) 
                      ? 'rgba(76, 175, 80, 0.1)' 
                      : 'transparent'
                  }}
                >
                  <input
                    type="checkbox"
                    id={`item-${item.id}`}
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleItemSelection(item.id)}
                    style={{ marginRight: '12px' }}
                  />
                  <label 
                    htmlFor={`item-${item.id}`}
                    style={{ 
                      flex: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <span>{item.name}</span>
                    <span style={{ fontWeight: '500' }}>₹{item.price}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 24px',
              fontSize: '16px',
              fontWeight: '500',
              border: 'none',
              borderRadius: '100px',
              backgroundColor: 'transparent',
              color: type === 'income' ? '#4CAF50' : '#F44336',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: '10px 24px',
              fontSize: '16px',
              fontWeight: '500',
              border: 'none',
              borderRadius: '100px',
              backgroundColor: type === 'income' ? '#4CAF50' : '#F44336',
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
          >
            Add Transaction
          </button>
        </div>
      </form>
    </SideSheet>
  );
} 