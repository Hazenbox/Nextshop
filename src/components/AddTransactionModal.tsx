import React, { useState, useEffect } from 'react';
import { X, IndianRupee, Upload, Trash2, Plus, Minus, Paperclip } from 'lucide-react';
import { inventoryStorage } from '../lib/inventory';
import { InventoryItem } from '../types';
import { imageStorage } from '../lib/storage';
import { nanoid } from 'nanoid';
import { supabase } from '../lib/supabase';
import { useTransactionStore } from '../stores/transactionStore';
import { TransactionInput } from '../types';
import { Notification } from './Notification';

const formStyles = {
  input: "w-full h-9 px-3 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent",
  label: "block text-xs font-medium text-gray-700 mb-1.5",
  inputWithIcon: "w-full h-9 pl-7 pr-3 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
  button: {
    primary: "h-9 px-4 text-xs font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "h-9 px-4 text-xs font-medium text-gray-700 hover:text-gray-800 transition-colors"
  }
};

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId?: string | null;
}

interface SelectedInventoryItem {
  id: string;
  quantity: number;
  availableQuantity: number;
}

interface TransactionForm {
  type: 'income' | 'expense';
  amount: number;
  notes: string;
  date: string;
  paymentMode: string;
  reference: string;
  attachments: File[];
  inventoryItems: SelectedInventoryItem[];
}

const initialForm: TransactionForm = {
  type: 'income',
  amount: 0,
  notes: '',
  date: new Date().toISOString().split('T')[0],
  paymentMode: 'cash',
  reference: '',
  attachments: [],
  inventoryItems: []
};

const paymentModes = [
  'Cash',
  'UPI',
  'Bank Transfer',
  'Credit Card',
  'Debit Card',
  'Check',
];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  transactionId
}) => {
  const [form, setForm] = useState<TransactionForm>(initialForm);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<Record<string, string>>({});
  const [showInventoryMenu, setShowInventoryMenu] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    const loadData = async () => {
      if (!isOpen) return;

      try {
        setLoading(true);
        setError(null);

        // Load inventory items
        const items = inventoryStorage.getItems('default');
        const availableItems = items.filter(item => 
          item.sale_status === 'available' && 
          (item.quantity || 0) > 0
        );
        setInventoryItems(availableItems);

        // Load images for items
        const boardImages = await imageStorage.getImages('default');
        const imageMap: Record<string, string> = {};
        
        availableItems.forEach(item => {
          if (item.image_ids[0]) {
            const image = boardImages.find(img => img.id === item.image_ids[0]);
            if (image) {
              imageMap[item.id] = image.url;
            }
          }
        });

        setImages(imageMap);
      } catch (error) {
        console.error('Error loading inventory data:', error);
        setError('Failed to load inventory items');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setForm(initialForm);
      setError(null);
    }
  }, [isOpen]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, message, type });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      const transactionData: TransactionInput = {
        type: form.type,
        amount: form.amount,
        notes: form.notes,
        date: form.date,
        payment_mode: form.paymentMode,
        reference: form.reference,
        items: form.inventoryItems.map(item => ({
          id: nanoid(),
          item_id: item.id,
          quantity: item.quantity
        })),
        attachments: []
      };

      // Upload attachments if any
      if (form.attachments.length > 0) {
        const uploadPromises = form.attachments.map(async file => {
          const path = `transactions/${nanoid()}/${file.name}`;
          const { data, error } = await supabase.storage
            .from('inventory-images')
            .upload(path, file);

          if (error) throw error;

          const { data: { publicUrl } } = supabase.storage
            .from('inventory-images')
            .getPublicUrl(data.path);

          return publicUrl;
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        transactionData.attachments = uploadedUrls;
      }

      await useTransactionStore.getState().addTransaction(transactionData);
      
      showNotification('Transaction added successfully');
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      showNotification('Failed to save transaction', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInventoryChange = (itemId: string) => {
    const item = inventoryItems.find(i => i.id === itemId);
    if (!item) return;

    const availableQuantity = item.quantity || 0;
    if (availableQuantity <= 0) return;

    setForm(prev => ({
      ...prev,
      inventoryItems: [
        ...prev.inventoryItems,
        {
          id: itemId,
          quantity: 1,
          availableQuantity
        }
      ]
    }));
    setShowInventoryMenu(false);
  };

  const handleRemoveInventoryItem = (itemId: string) => {
    setForm(prev => ({
      ...prev,
      inventoryItems: prev.inventoryItems.filter(item => item.id !== itemId)
    }));
  };

  const handleQuantityChange = (itemId: string, change: number) => {
    setForm(prev => ({
      ...prev,
      inventoryItems: prev.inventoryItems.map(item => {
        if (item.id === itemId) {
          const newQuantity = Math.max(1, Math.min(item.quantity + change, item.availableQuantity));
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    }));
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setForm(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const handleRemoveAttachment = (index: number) => {
    setForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white w-full h-full md:h-auto md:max-w-md md:rounded-xl md:shadow-xl mx-auto flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Add Transaction</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-auto">
            <div className="p-6 space-y-4">
              {/* Transaction Type */}
              <div className="space-y-1.5">
                <label className={formStyles.label}>Transaction Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="income"
                      checked={form.type === 'income'}
                      onChange={(e) => setForm({ ...form, type: e.target.value as 'income' | 'expense' })}
                      className="h-3.5 w-3.5 text-green-500 focus:ring-green-500"
                    />
                    <span className="ml-2 text-xs text-gray-700">Income</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="expense"
                      checked={form.type === 'expense'}
                      onChange={(e) => setForm({ ...form, type: e.target.value as 'income' | 'expense' })}
                      className="h-3.5 w-3.5 text-red-500 focus:ring-red-500"
                    />
                    <span className="ml-2 text-xs text-gray-700">Expense</span>
                  </label>
                </div>
              </div>

              {/* Amount and Date side by side */}
              <div className="grid grid-cols-2 gap-4">
                {/* Amount */}
                <div>
                  <label className={formStyles.label}>Amount</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500">
                      <IndianRupee className="h-3.5 w-3.5" />
                    </span>
                    <input
                      type="number"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                      className={formStyles.inputWithIcon}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className={formStyles.label}>Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className={formStyles.input}
                    required
                  />
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label className={formStyles.label}>Payment Mode</label>
                <select
                  value={form.paymentMode}
                  onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
                  className={formStyles.input}
                  required
                >
                  {paymentModes.map((mode) => (
                    <option key={mode} value={mode.toLowerCase()}>{mode}</option>
                  ))}
                </select>
              </div>

              {/* Related Inventory Items */}
              <div>
                <label className={formStyles.label}>Related Inventory Items</label>
                
                {form.inventoryItems.length > 0 && (
                  <div className="mb-2 space-y-2">
                    {form.inventoryItems.map((selectedItem) => {
                      const item = inventoryItems.find(i => i.id === selectedItem.id);
                      if (!item) return null;

                      return (
                        <div key={item.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                          {images[item.id] && (
                            <img
                              src={images[item.id]}
                              alt=""
                              className="h-8 w-8 rounded object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">
                              {item.title || item.product_id}
                            </p>
                            <p className="text-xs text-gray-500">
                              Available: {selectedItem.availableQuantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.id, -1)}
                              className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                              disabled={selectedItem.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-xs w-4 text-center">
                              {selectedItem.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                              disabled={selectedItem.quantity >= selectedItem.availableQuantity}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveInventoryItem(item.id)}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowInventoryMenu(!showInventoryMenu)}
                    className={formStyles.input + " text-left relative bg-white"}
                  >
                    <span className="text-gray-500">Select item</span>
                  </button>

                  {showInventoryMenu && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-60 overflow-auto">
                      {inventoryItems
                        .filter(item => 
                          !form.inventoryItems.some(selected => selected.id === item.id) &&
                          (item.quantity || 0) > 0
                        )
                        .map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleInventoryChange(item.id)}
                            className="w-full px-2 py-1.5 hover:bg-gray-50 flex items-center gap-2"
                          >
                            {images[item.id] && (
                              <img
                                src={images[item.id]}
                                alt=""
                                className="h-8 w-8 rounded object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-xs font-medium text-gray-900 truncate">
                                {item.title || item.product_id}
                              </p>
                              <p className="text-xs text-gray-500">
                                Available: {item.quantity || 0}
                              </p>
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={formStyles.label}>Notes</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className={formStyles.input}
                  placeholder="Add notes"
                />
              </div>

              {/* Reference */}
              <div>
                <label className={formStyles.label}>Reference Number</label>
                <input
                  type="text"
                  value={form.reference}
                  onChange={(e) => setForm({ ...form, reference: e.target.value })}
                  className={formStyles.input}
                  placeholder="Enter reference number (optional)"
                />
              </div>

              {/* Attachments */}
              <div>
                <label className={formStyles.label}>Attachments</label>
                
                {form.attachments.length > 0 && (
                  <div className="mb-2 space-y-2">
                    {form.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Paperclip className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-900 truncate">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(index)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <input
                    type="file"
                    onChange={handleAttachmentChange}
                    multiple
                    className="hidden"
                    id="attachments"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  />
                  <label
                    htmlFor="attachments"
                    className="flex items-center justify-center w-full px-4 py-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-xs text-gray-500">Upload files</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 px-6 py-4 bg-white border-t border-gray-100 mt-auto">
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className={formStyles.button.secondary}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={formStyles.button.primary}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Add Transaction'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
      />
    </>
  );
};