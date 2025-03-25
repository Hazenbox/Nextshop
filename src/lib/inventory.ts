import { nanoid } from 'nanoid';
import { InventoryItem } from '../types';
import { imageStorage } from './storage';

const STORAGE_KEYS = {
  ITEMS: 'inventory_items',
  CATEGORIES: 'inventory_categories',
  LABELS: 'inventory_labels',
  PAID_TO: 'inventory_paid_to'
};

// Mock data for inventory items
export const mockInventoryItems: InventoryItem[] = [
  {
    id: '1',
    name: 'Smartphone X Pro',
    description: 'Latest smartphone with 6.7" OLED display and 108MP camera',
    price: 65999,
    cost_price: 45000,
    quantity: 10,
    category: 'Electronics',
    status: 'available',
    image_ids: ['img1', 'img2'],
    created_at: new Date('2023-10-15'),
    updated_at: new Date('2023-10-15')
  },
  {
    id: '2',
    name: 'Wireless Earbuds',
    description: 'True wireless earbuds with noise cancellation',
    price: 8999,
    cost_price: 4500,
    quantity: 20,
    category: 'Electronics',
    status: 'available',
    image_ids: ['img3'],
    created_at: new Date('2023-10-20'),
    updated_at: new Date('2023-10-20')
  },
  {
    id: '3',
    name: 'Smartwatch Series 5',
    description: 'Fitness tracker with heart rate monitor and GPS',
    price: 18999,
    cost_price: 12000,
    quantity: 5,
    category: 'Electronics',
    status: 'sold',
    image_ids: [],
    created_at: new Date('2023-09-05'),
    updated_at: new Date('2023-09-25')
  },
  {
    id: '4',
    name: 'Leather Wallet',
    description: 'Genuine leather wallet with multiple card slots',
    price: 1999,
    cost_price: 800,
    quantity: 50,
    category: 'Fashion',
    status: 'available',
    image_ids: ['img4', 'img5'],
    created_at: new Date('2023-11-01'),
    updated_at: new Date('2023-11-01')
  },
  {
    id: '5',
    name: 'Designer Sunglasses',
    description: 'Polarized UV protection sunglasses',
    price: 4999,
    cost_price: 2500,
    quantity: 15,
    category: 'Fashion',
    status: 'reserved',
    image_ids: ['img6'],
    created_at: new Date('2023-11-10'),
    updated_at: new Date('2023-11-11')
  },
  {
    id: '6',
    name: 'Gaming Laptop',
    description: 'High-performance gaming laptop with RTX 3080',
    price: 159999,
    cost_price: 125000,
    quantity: 3,
    category: 'Electronics',
    status: 'available',
    image_ids: ['img7', 'img8', 'img9'],
    created_at: new Date('2023-08-20'),
    updated_at: new Date('2023-08-20')
  }
];

export class InventoryStorage {
  private items: Map<string, InventoryItem> = new Map(
    mockInventoryItems.map(item => [item.id, item])
  );
  private imageToItems: Map<string, string[]> = new Map();

  constructor() {
    // Initialize imageToItems map
    mockInventoryItems.forEach(item => {
      item.image_ids.forEach(imageId => {
        const items = this.imageToItems.get(imageId) || [];
        if (!items.includes(item.id)) {
          items.push(item.id);
          this.imageToItems.set(imageId, items);
        }
      });
    });
  }

  private getStoredItems(): InventoryItem[] {
    const items = localStorage.getItem(STORAGE_KEYS.ITEMS);
    return items ? JSON.parse(items) : [];
  }

  private setStoredItems(items: InventoryItem[]): void {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  }

  private getStoredCategories(): Record<string, string[]> {
    const categories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return categories ? JSON.parse(categories) : {};
  }

  private setStoredCategories(categories: Record<string, string[]>): void {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }

  private getStoredLabels(): Record<string, string[]> {
    const labels = localStorage.getItem(STORAGE_KEYS.LABELS);
    return labels ? JSON.parse(labels) : {};
  }

  private setStoredLabels(labels: Record<string, string[]>): void {
    localStorage.setItem(STORAGE_KEYS.LABELS, JSON.stringify(labels));
  }

  private getStoredPaidTo(): Record<string, string[]> {
    const paidTo = localStorage.getItem(STORAGE_KEYS.PAID_TO);
    return paidTo ? JSON.parse(paidTo) : {};
  }

  private setStoredPaidTo(paidTo: Record<string, string[]>): void {
    localStorage.setItem(STORAGE_KEYS.PAID_TO, JSON.stringify(paidTo));
  }

  getAllItems(): InventoryItem[] {
    return Array.from(this.items.values());
  }

  getItemById(id: string): InventoryItem | undefined {
    return this.items.get(id);
  }

  getItems(boardId: string): InventoryItem[] {
    const items = this.getStoredItems();
    return items.filter(item => item.board_id === boardId);
  }

  getCategories(boardId: string): string[] {
    const categories = this.getStoredCategories();
    return categories[boardId] || [];
  }

  getLabels(boardId: string): string[] {
    const labels = this.getStoredLabels();
    return labels[boardId] || [];
  }

  getPaidToOptions(boardId: string): string[] {
    const paidTo = this.getStoredPaidTo();
    return paidTo[boardId] || [];
  }

  addCategory(boardId: string, category: string): void {
    const categories = this.getStoredCategories();
    if (!categories[boardId]) {
      categories[boardId] = [];
    }
    if (!categories[boardId].includes(category)) {
      categories[boardId].push(category);
      this.setStoredCategories(categories);
    }
  }

  addLabel(boardId: string, label: string): void {
    const labels = this.getStoredLabels();
    if (!labels[boardId]) {
      labels[boardId] = [];
    }
    if (!labels[boardId].includes(label)) {
      labels[boardId].push(label);
      this.setStoredLabels(labels);
    }
  }

  addPaidToOption(boardId: string, paidTo: string): void {
    const paidToOptions = this.getStoredPaidTo();
    if (!paidToOptions[boardId]) {
      paidToOptions[boardId] = [];
    }
    if (!paidToOptions[boardId].includes(paidTo)) {
      paidToOptions[boardId].push(paidTo);
      this.setStoredPaidTo(paidToOptions);
    }
  }

  removeCategory(boardId: string, category: string): void {
    const categories = this.getStoredCategories();
    if (categories[boardId]) {
      categories[boardId] = categories[boardId].filter(c => c !== category);
      this.setStoredCategories(categories);
    }
  }

  removeLabel(boardId: string, label: string): void {
    const labels = this.getStoredLabels();
    if (labels[boardId]) {
      labels[boardId] = labels[boardId].filter(l => l !== label);
      this.setStoredLabels(labels);
    }
  }

  removePaidToOption(boardId: string, paidTo: string): void {
    const paidToOptions = this.getStoredPaidTo();
    if (paidToOptions[boardId]) {
      paidToOptions[boardId] = paidToOptions[boardId].filter(p => p !== paidTo);
      this.setStoredPaidTo(paidToOptions);
    }
  }

  addItem(item: InventoryItem) {
    this.items.set(item.id, item);
    
    // Update image to items mapping
    item.image_ids.forEach(imageId => {
      const items = this.imageToItems.get(imageId) || [];
      if (!items.includes(item.id)) {
        items.push(item.id);
        this.imageToItems.set(imageId, items);
      }
    });
  }

  updateItem(id: string, updates: Partial<InventoryItem>): InventoryItem {
    const items = this.getStoredItems();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Item not found');

    const existingItem = items[index];
    const updatedItem = {
      ...existingItem,
      ...updates,
      image_ids: updates.image_ids || existingItem.image_ids || [],
      updated_at: new Date()
    };
    
    items[index] = updatedItem;
    this.setStoredItems(items);

    // Add new category and label if they don't exist
    if (updates.category && updates.category !== existingItem.category) {
      this.addCategory(existingItem.board_id, updates.category);
    }
    if (updates.label && updates.label !== existingItem.label) {
      this.addLabel(existingItem.board_id, updates.label);
    }
    if (updates.paid_to && updates.paid_to !== existingItem.paid_to) {
      this.addPaidToOption(existingItem.board_id, updates.paid_to);
    }

    return updatedItem;
  }

  async deleteItem(id: string): Promise<void> {
    const items = this.getStoredItems();
    const item = items.find(item => item.id === id);
    
    if (!item) {
      throw new Error('Item not found');
    }

    // Delete associated images
    if (item.image_ids && item.image_ids.length > 0) {
      await Promise.all(
        item.image_ids.map(imageId => imageStorage.deleteImage(imageId))
      );
    }

    // Remove item from storage
    const filteredItems = items.filter(item => item.id !== id);
    this.setStoredItems(filteredItems);
  }

  getItemsByImageId(imageId: string): InventoryItem[] {
    const itemIds = this.imageToItems.get(imageId) || [];
    return itemIds.map(id => this.items.get(id)).filter(Boolean) as InventoryItem[];
  }

  removeImageFromItems(imageId: string) {
    const itemIds = this.imageToItems.get(imageId) || [];
    itemIds.forEach(itemId => {
      const item = this.items.get(itemId);
      if (item) {
        item.image_ids = item.image_ids.filter(id => id !== imageId);
        if (item.image_ids.length > 0) {
          this.items.set(itemId, item);
        } else {
          this.items.delete(itemId);
        }
      }
    });
    this.imageToItems.delete(imageId);
  }
}

export const inventoryStorage = new InventoryStorage();