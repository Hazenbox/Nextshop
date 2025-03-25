import React, { useState, useEffect, useCallback } from 'react';
import { imageStorage } from '../lib/storage';
import { inventoryStorage } from '../lib/inventory';
import { downloadCSV } from '../lib/export';
import { CategoryManager } from './CategoryManager';
import { AddItemModal } from './AddItemModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { Layout } from './Layout';
import { InventoryItem, Image } from '../types';
import { Pencil, Trash2, Search, Download, Plus } from 'lucide-react';
import { Notification } from './Notification';

interface InventoryProps {
  boardId: string;
  onBack: () => void;
}

export const Inventory: React.FC<InventoryProps> = ({ boardId, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [showPaidToModal, setShowPaidToModal] = useState(false);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [paidToOptions, setPaidToOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });

  const handleRowClick = (e: React.MouseEvent, item: InventoryItem) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'SELECT' ||
      target.closest('button')
    ) {
      return;
    }

    setItemToEdit(item);
    setShowAddItemModal(true);
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, message, type });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const loadInventoryData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const storedItems = inventoryStorage.getItems(boardId);
      const boardImages = await imageStorage.getImages(boardId);
      
      const storedCategories = inventoryStorage.getCategories(boardId);
      const storedLabels = inventoryStorage.getLabels(boardId);
      const storedPaidToOptions = inventoryStorage.getPaidToOptions(boardId);
      
      setItems(storedItems);
      setImages(boardImages);
      setCategories(storedCategories);
      setLabels(storedLabels);
      setPaidToOptions(storedPaidToOptions);
    } catch (error) {
      console.error('Error loading inventory data:', error);
      setError('Failed to load inventory data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    loadInventoryData();
  }, [loadInventoryData]);

  const handleAddItem = async (
    itemData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>,
    imageFiles: File[]
  ) => {
    try {
      setLoading(true);
      
      const uploadedImages = await Promise.all(
        imageFiles.map(file => imageStorage.addImage(boardId, file))
      );
      
      const newItem = {
        ...itemData,
        board_id: boardId,
        image_ids: uploadedImages.map(img => img.id),
      };
      
      const createdItem = inventoryStorage.addItem(newItem);
      
      setItems(prev => [...prev, createdItem]);
      setImages(prev => [...prev, ...uploadedImages]);
      
      showNotification('Item added successfully');
      setShowAddItemModal(false);
    } catch (error) {
      console.error('Error adding item:', error);
      showNotification('Failed to add item', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      setLoading(true);
      await inventoryStorage.deleteItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
      showNotification('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      showNotification('Failed to delete item', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const updatedItem = inventoryStorage.updateItem(id, updates);
      setItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      showNotification('Item updated successfully');
    } catch (error) {
      console.error('Error updating item:', error);
      showNotification('Failed to update item', 'error');
    }
  };

  const handleEditItem = async (
    itemData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>,
    imageFiles: File[]
  ) => {
    if (!itemToEdit) return;

    try {
      setLoading(true);
      
      const uploadedImages = await Promise.all(
        imageFiles.map(file => imageStorage.addImage(boardId, file))
      );
      
      const updatedItem = {
        ...itemData,
        board_id: boardId,
        image_ids: [
          ...itemToEdit.image_ids,
          ...uploadedImages.map(img => img.id)
        ],
      };
      
      const savedItem = inventoryStorage.updateItem(itemToEdit.id, updatedItem);
      
      setItems(prev => prev.map(item => 
        item.id === itemToEdit.id ? savedItem : item
      ));
      
      if (uploadedImages.length > 0) {
        setImages(prev => [...prev, ...uploadedImages]);
      }
      
      showNotification('Item updated successfully');
      setShowAddItemModal(false);
      setItemToEdit(null);
    } catch (error) {
      console.error('Error updating item:', error);
      showNotification('Failed to update item', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (itemId: string, value: string) => {
    if (value === '__new__') {
      setShowCategoryModal(true);
    } else {
      handleUpdateItem(itemId, { category: value });
    }
  };

  const handleLabelChange = (itemId: string, value: string) => {
    if (value === '__new__') {
      setShowLabelModal(true);
    } else {
      handleUpdateItem(itemId, { label: value });
    }
  };

  const handleExport = () => {
    try {
      downloadCSV(items);
      showNotification('Export completed successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      showNotification('Failed to export data', 'error');
    }
  };

  const handleCloseModal = () => {
    setItemToEdit(null);
    setShowAddItemModal(false);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = searchTerm.toLowerCase().split(' ').every(term =>
      item.category?.toLowerCase().includes(term) ||
      item.label?.toLowerCase().includes(term) ||
      item.customer_name?.toLowerCase().includes(term) ||
      item.product_id?.toLowerCase().includes(term)
    );

    const matchesStatus = selectedStatus === 'all' || item.sale_status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadInventoryData}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      onInventory={onBack}
    >
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Inventory</h1>
              <p className="text-sm text-gray-500">
                {typeof filteredItems?.length === 'number' && `${filteredItems.length} items`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by category, label, or customer name..."
                  className="w-64 h-7 pl-8 pr-3 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-7 px-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-[100px] bg-white"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="sold">Sold</option>
              </select>

              <button 
                onClick={handleExport}
                className="h-7 px-2 text-gray-500 hover:text-gray-700 transition-colors" 
                title="Export as CSV"
              >
                <Download className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => {
                  setItemToEdit(null);
                  setShowAddItemModal(true);
                }}
                className="h-7 px-3 bg-primary-500 text-white text-xs font-medium rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            <table className="w-full border-collapse bg-white">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="bg-gray-50">
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">#</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">ID</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Purchase Price</th>
                  <th className="px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Listed Price</th>
                  <th className="px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Sold At</th>
                  <th className="px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
                  <th className="px-2 py-2 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map((item, index) => (
                  <tr 
                    key={item.id} 
                    className="group hover:bg-gray-50/50 cursor-pointer"
                    onClick={(e) => handleRowClick(e, item)}
                  >
                    <td className="px-2 py-2 text-xs font-medium text-gray-500 whitespace-nowrap">
                      {index + 1}
                    </td>
                    <td className="px-2 py-2 text-xs font-medium text-gray-900">
                      <div 
                        className="truncate max-w-[120px]" 
                        title={item.product_id || item.id}
                      >
                        {item.product_id || item.id}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="h-10 w-10 rounded bg-gray-100 overflow-hidden ring-1 ring-gray-200">
                        {item.image_ids[0] && (
                          <img
                            src={images.find(img => img.id === item.image_ids[0])?.url}
                            alt="Product"
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <select
                        value={item.category || ''}
                        onChange={(e) => handleCategoryChange(item.id, e.target.value)}
                        className="h-7 text-xs border-transparent hover:border-gray-200 rounded focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="__new__" className="text-primary-600 font-medium">+ Add New Category</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <select
                        value={item.label || ''}
                        onChange={(e) => handleLabelChange(item.id, e.target.value)}
                        className="h-7 text-xs border-transparent hover:border-gray-200 rounded focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="">Select label</option>
                        {labels.map(label => (
                          <option key={label} value={label}>{label}</option>
                        ))}
                        <option value="__new__" className="text-primary-600 font-medium">+ Add New Label</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <select
                        value={item.sale_status}
                        onChange={(e) => handleUpdateItem(item.id, { sale_status: e.target.value as any })}
                        className="h-7 text-xs border-transparent hover:border-gray-200 rounded focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="available">Available</option>
                        <option value="pending">Pending</option>
                        <option value="sold">Sold</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={item.purchase_price}
                        onChange={(e) => handleUpdateItem(item.id, { purchase_price: parseFloat(e.target.value) })}
                        className="h-7 w-20 text-[11px] border-transparent hover:border-gray-200 rounded focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={item.listed_price}
                        onChange={(e) => handleUpdateItem(item.id, { listed_price: parseFloat(e.target.value) })}
                        className="h-7 w-20 text-[11px] border-transparent hover:border-gray-200 rounded focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={item.sold_at || ''}
                        onChange={(e) => handleUpdateItem(item.id, { sold_at: parseFloat(e.target.value) })}
                        className="h-7 w-20 text-[11px] border-transparent hover:border-gray-200 rounded focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        value={item.delivery_charges}
                        onChange={(e) => handleUpdateItem(item.id, { delivery_charges: parseFloat(e.target.value) })}
                        className="h-7 w-20 text-[11px] border-transparent hover:border-gray-200 rounded focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span className={`text-[11px] ${
                        item.sold_at 
                          ? (item.sold_at - item.purchase_price - item.delivery_charges > 0 
                            ? 'text-green-600' 
                            : 'text-red-600')
                          : 'text-gray-500'
                      }`}>
                        {item.sold_at 
                          ? `₹${(item.sold_at - item.purchase_price - item.delivery_charges).toFixed(2)}` 
                          : '-'
                        }
                      </span>
                    </td>
                    <td className="px-2 py-2" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setItemToEdit(item);
                            setShowAddItemModal(true);
                          }}
                          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setItemToDelete(item.id)}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CategoryManager
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        categories={categories}
        onAddCategory={(category) => {
          inventoryStorage.addCategory(boardId, category);
          setCategories(prev => [...prev, category]);
        }}
        onRemoveCategory={(category) => {
          inventoryStorage.removeCategory(boardId, category);
          setCategories(prev => prev.filter(c => c !== category));
        }}
        title="Manage Categories"
        addLabel="Add new category"
        searchPlaceholder="Search categories..."
      />

      <CategoryManager
        isOpen={showLabelModal}
        onClose={() => setShowLabelModal(false)}
        categories={labels}
        onAddCategory={(label) => {
          inventoryStorage.addLabel(boardId, label);
          setLabels(prev => [...prev, label]);
        }}
        onRemoveCategory={(label) => {
          inventoryStorage.removeLabel(boardId, label);
          setLabels(prev => prev.filter(l => l !== label));
        }}
        title="Manage Labels"
        addLabel="Add new label"
        searchPlaceholder="Search labels..."
      />

      <CategoryManager
        isOpen={showPaidToModal}
        onClose={() => setShowPaidToModal(false)}
        categories={paidToOptions}
        onAddCategory={(paidTo) => {
          inventoryStorage.addPaidToOption(boardId, paidTo);
          setPaidToOptions(prev => [...prev, paidTo]);
        }}
        onRemoveCategory={(paidTo) => {
          inventoryStorage.removePaidToOption(boardId, paidTo);
          setPaidToOptions(prev => prev.filter(p => p !== paidTo));
        }}
        title="Manage Recipients"
        addLabel="Add new recipient"
        searchPlaceholder="Search recipients..."
      />

      <AddItemModal
        isOpen={showAddItemModal}
        onClose={handleCloseModal}
        onAdd={itemToEdit ? handleEditItem : handleAddItem}
        categories={categories}
        labels={labels}
        paidToOptions={paidToOptions}
        onAddCategory={(category) => {
          inventoryStorage.addCategory(boardId, category);
          setCategories(prev => [...prev, category]);
        }}
        onRemoveCategory={(category) => {
          inventoryStorage.removeCategory(boardId, category);
          setCategories(prev => prev.filter(c => c !== category));
        }}
        onAddLabel={(label) => {
          inventoryStorage.addLabel(boardId, label);
          setLabels(prev => [...prev, label]);
        }}
        onRemoveLabel={(label) => {
          inventoryStorage.removeLabel(boardId, label);
          setLabels(prev => prev.filter(l => l !== label));
        }}
        onAddPaidTo={(paidTo) => {
          inventoryStorage.addPaidToOption(boardId, paidTo);
          setPaidToOptions(prev => [...prev, paidTo]);
        }}
        onRemovePaidTo={(paidTo) => {
          inventoryStorage.removePaidToOption(boardId, paidTo);
          setPaidToOptions(prev => prev.filter(p => p !== paidTo));
        }}
        editItem={itemToEdit}
      />

      <DeleteConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) {
            handleDeleteItem(itemToDelete);
            setItemToDelete(null);
          }
        }}
      />

      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
      />
    </Layout>
  );
};