import React, { useState } from 'react';
import { Plus, IndianRupee, Package } from 'lucide-react';
import { AddItemModal } from './AddItemModal';
import { AddTransactionModal } from './AddTransactionModal';
import { inventoryStorage } from '../lib/inventory';
import { useTransactionStore } from '../stores/transactionStore';

export function FabMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  const handleAddInventory = () => {
    setShowAddItemModal(true);
    setIsOpen(false);
  };

  const handleAddTransaction = () => {
    setShowTransactionModal(true);
    setIsOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-20 right-6 flex flex-col items-end gap-3 z-50">
        {/* Menu Items */}
        {isOpen && (
          <div className="flex flex-col items-end gap-3 mb-4 animate-fade-in">
            {/* Add Transaction */}
            <button
              onClick={handleAddTransaction}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium">Add Transaction</span>
              <IndianRupee className="h-5 w-5" />
            </button>

            {/* Add Inventory Item */}
            <button
              onClick={handleAddInventory}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium">Add Inventory</span>
              <Package className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Main FAB Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-4 bg-primary-500 rounded-full text-white shadow-lg hover:bg-primary-600 transition-all duration-200 ${
            isOpen ? 'rotate-45' : ''
          }`}
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* Modals */}
      <AddItemModal
        isOpen={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        onAdd={async (itemData, imageFiles) => {
          try {
            const uploadedImages = await Promise.all(
              imageFiles.map(file => imageStorage.addImage('default', file))
            );
            
            const newItem = {
              ...itemData,
              board_id: 'default',
              image_ids: uploadedImages.map(img => img.id),
            };
            
            inventoryStorage.addItem(newItem);
            setShowAddItemModal(false);
          } catch (error) {
            console.error('Error adding item:', error);
          }
        }}
        categories={[]}
        labels={[]}
        paidToOptions={[]}
        onAddCategory={() => {}}
        onRemoveCategory={() => {}}
        onAddLabel={() => {}}
        onRemoveLabel={() => {}}
        onAddPaidTo={() => {}}
        onRemovePaidTo={() => {}}
      />

      <AddTransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
      />
    </>
  );
}