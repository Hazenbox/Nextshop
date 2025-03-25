import React, { useState } from 'react';
import { X, Plus, Minus, Upload, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import { inventoryStorage } from '../lib/inventory';
import { InventoryItem } from '../types';

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (item: InventoryItem) => void;
  editItem?: InventoryItem | null;
}

export function AddInventoryModal({ isOpen, onClose, onSuccess, editItem }: AddInventoryModalProps) {
  const [name, setName] = useState(editItem?.name || '');
  const [description, setDescription] = useState(editItem?.description || '');
  const [category, setCategory] = useState(editItem?.category || '');
  const [price, setPrice] = useState(editItem?.price?.toString() || '');
  const [costPrice, setCostPrice] = useState(editItem?.cost_price?.toString() || '');
  const [quantity, setQuantity] = useState(editItem?.quantity?.toString() || '1');
  const [status, setStatus] = useState<'available' | 'sold' | 'reserved'>(editItem?.status || 'available');
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (!name.trim()) throw new Error('Name is required');
      if (!price.trim() || isNaN(Number(price))) throw new Error('Valid price is required');
      if (!costPrice.trim() || isNaN(Number(costPrice))) throw new Error('Valid cost price is required');
      if (!quantity.trim() || isNaN(Number(quantity))) throw new Error('Valid quantity is required');
      if (!category.trim()) throw new Error('Category is required');

      // Create or update the item
      const itemData: InventoryItem = {
        id: editItem?.id || nanoid(),
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        cost_price: Number(costPrice),
        quantity: Number(quantity),
        category: category.trim(),
        status,
        image_ids: editItem?.image_ids || [],
        created_at: editItem?.created_at || new Date(),
        updated_at: new Date()
      };

      if (editItem) {
        // Update existing item
        inventoryStorage.updateItem(editItem.id, itemData);
      } else {
        // Add new item
        inventoryStorage.addItem(itemData);
      }

      if (onSuccess) {
        onSuccess(itemData);
      }
      
      onClose();
      
      // Reset form
      if (!editItem) {
        setName('');
        setDescription('');
        setPrice('');
        setCostPrice('');
        setQuantity('1');
        setStatus('available');
        setImages([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImages(Array.from(e.target.files));
    }
  };

  if (!isOpen) return null;

  const formStyles = {
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(1, 1fr)',
      gap: '24px',
    },
    fullWidth: {
      gridColumn: '1 / -1',
    },
    inputGroup: {
      marginBottom: '16px',
    },
    quantityControls: {
      display: 'flex',
      alignItems: 'center',
    },
    quantityButton: {
      padding: '8px',
      backgroundColor: 'var(--md-surface-variant)',
      border: '1px solid var(--md-outline)',
      color: 'var(--md-on-surface-variant)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    imageGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
      marginTop: '24px',
    },
    imageItem: {
      position: 'relative',
      aspectRatio: '1/1',
      borderRadius: 'var(--md-shape-corner-medium)',
      overflow: 'hidden',
      boxShadow: 'var(--md-elevation-1)',
    },
    deleteButton: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      backgroundColor: 'var(--md-error)',
      color: 'var(--md-on-error)',
      borderRadius: '50%',
      width: '28px',
      height: '28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: 'var(--md-elevation-1)',
      border: 'none',
      cursor: 'pointer',
    }
  };

  return (
    <div className="md-dialog-backdrop">
      <div className="md-dialog" style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="md-dialog-header">
          <h2 className="md-headline-small">
            {editItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
          </h2>
          <button 
            onClick={onClose}
            className="md-icon-button md-state-layer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="md-dialog-content">
          {error && (
            <div style={{ 
              marginBottom: '16px', 
              padding: '16px', 
              backgroundColor: 'rgba(var(--md-error-rgb), 0.1)', 
              color: 'var(--md-error)', 
              borderRadius: 'var(--md-shape-corner-small)'
            }}>
              {error}
            </div>
          )}

          <div style={formStyles.grid}>
            <div style={formStyles.fullWidth}>
              <div className="md-text-field-container">
                <label className="md-text-field-label">
                  Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Item name"
                  className="md-text-field"
                  required
                />
              </div>
            </div>

            <div style={formStyles.fullWidth}>
              <div className="md-text-field-container">
                <label className="md-text-field-label">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Item description"
                  className="md-text-field"
                />
              </div>
            </div>

            <div>
              <div className="md-text-field-container">
                <label className="md-text-field-label">
                  Category *
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Electronics, Clothing"
                  className="md-text-field"
                  required
                />
              </div>
            </div>

            <div>
              <div className="md-text-field-container">
                <label className="md-text-field-label">
                  Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'available' | 'sold' | 'reserved')}
                  className="md-select"
                >
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
            </div>

            <div>
              <div className="md-text-field-container">
                <label className="md-text-field-label">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="md-text-field"
                  required
                />
              </div>
            </div>

            <div>
              <div className="md-text-field-container">
                <label className="md-text-field-label">
                  Cost Price (₹) *
                </label>
                <input
                  type="number"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="md-text-field"
                  required
                />
              </div>
            </div>

            <div>
              <div className="md-text-field-container">
                <label className="md-text-field-label">
                  Quantity *
                </label>
                <div style={formStyles.quantityControls}>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, Number(quantity) - 1).toString())}
                    style={{
                      ...formStyles.quantityButton,
                      borderRadius: 'var(--md-shape-corner-small) 0 0 var(--md-shape-corner-small)',
                    }}
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      padding: '8px',
                      backgroundColor: 'var(--md-surface-container-high)',
                      border: '1px solid var(--md-outline)',
                      borderLeft: 'none',
                      borderRight: 'none',
                      outline: 'none',
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((Number(quantity) + 1).toString())}
                    style={{
                      ...formStyles.quantityButton,
                      borderRadius: '0 var(--md-shape-corner-small) var(--md-shape-corner-small) 0',
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div style={formStyles.fullWidth}>
              <div className="md-text-field-container">
                <label className="md-text-field-label">
                  Images
                </label>
                <div style={{
                  border: '2px dashed var(--md-outline)',
                  borderRadius: 'var(--md-shape-corner-medium)',
                  padding: '24px',
                  backgroundColor: 'rgba(var(--md-surface-variant-rgb), 0.3)',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <label style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      padding: '16px',
                      borderRadius: '50%',
                    }} className="md-state-layer">
                      <Upload size={32} color="var(--md-primary)" />
                      <span style={{
                        marginTop: '8px',
                        fontSize: '14px',
                        color: 'var(--md-on-surface-variant)',
                      }}>Click to upload images</span>
                      <input
                        type="file"
                        style={{ display: 'none' }}
                        accept="image/*"
                        multiple
                        onChange={handleUploadImages}
                      />
                    </label>
                  </div>
                  {images.length > 0 && (
                    <div style={formStyles.imageGrid}>
                      {Array.from(images).map((image, index) => (
                        <div key={index} style={formStyles.imageItem}>
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Upload ${index + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <button
                            type="button"
                            onClick={() => setImages(images.filter((_, i) => i !== index))}
                            style={formStyles.deleteButton}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className="md-dialog-footer">
          <button
            type="button"
            onClick={onClose}
            className="md-button md-button-outlined md-state-layer"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="md-button md-button-filled md-state-layer"
            disabled={loading}
          >
            {loading ? 'Saving...' : (editItem ? 'Update Item' : 'Add Item')}
          </button>
        </div>
      </div>
    </div>
  );
} 