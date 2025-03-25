import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { InventoryItem } from '../types';
import { inventoryStorage } from '../lib/inventory';

const chevronSvg = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#6B7280" viewBox="0 0 256 256"><path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path></svg>')}`;

const selectStyles = `w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 appearance-none pr-8 bg-[url('${chevronSvg}')] bg-[position:right_0.75rem_center] bg-no-repeat bg-[length:12px]`;

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose, boardId }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadInventoryData();
    }
  }, [isOpen, boardId]);

  const loadInventoryData = () => {
    try {
      setLoading(true);
      const storedItems = inventoryStorage.getItems(boardId);
      setItems(storedItems);
    } catch (error) {
      console.error('Error loading inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = (id: string, updates: Partial<InventoryItem>) => {
    try {
      inventoryStorage.updateItem(id, updates);
      loadInventoryData();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl mx-4 h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-900">Inventory Management</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Color
                    </th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purchase Price
                    </th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Listed Price
                    </th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sold At
                    </th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivery
                    </th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profit
                    </th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sale Type
                    </th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paid To
                    </th>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
                        No inventory items yet. Upload images to add items to inventory.
                      </td>
                    </tr>
                  ) : (
                    items.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden">
                            {/* We'll add image preview later */}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="text"
                            value={item.category}
                            onChange={(e) => handleUpdateItem(item.id, { category: e.target.value })}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="text"
                            value={item.color}
                            onChange={(e) => handleUpdateItem(item.id, { color: e.target.value })}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <select
                            value={item.sale_status}
                            onChange={(e) => handleUpdateItem(item.id, { sale_status: e.target.value as any })}
                            className={selectStyles}
                          >
                            <option value="available">Available</option>
                            <option value="pending">Pending</option>
                            <option value="sold">Sold</option>
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            value={item.purchase_price}
                            onChange={(e) => handleUpdateItem(item.id, { purchase_price: parseFloat(e.target.value) })}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            value={item.listed_price}
                            onChange={(e) => handleUpdateItem(item.id, { listed_price: parseFloat(e.target.value) })}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            value={item.sold_at || ''}
                            onChange={(e) => handleUpdateItem(item.id, { sold_at: parseFloat(e.target.value) })}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            value={item.delivery_charges}
                            onChange={(e) => handleUpdateItem(item.id, { delivery_charges: parseFloat(e.target.value) })}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-gray-900">
                            {item.sold_at ? (item.sold_at - item.purchase_price - item.delivery_charges).toFixed(2) : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <select
                            value={item.sale_type}
                            onChange={(e) => handleUpdateItem(item.id, { sale_type: e.target.value as any })}
                            className={selectStyles}
                          >
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="text"
                            value={item.paid_to || ''}
                            onChange={(e) => handleUpdateItem(item.id, { paid_to: e.target.value })}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => {
                              // TODO: Add customer details modal
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};