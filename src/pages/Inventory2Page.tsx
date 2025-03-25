import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Download, 
  ChevronDown, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  X, 
  Check, 
  ArrowUpDown
} from 'lucide-react';
import { inventoryStorage, mockInventoryItems } from '../lib/inventory';
import { InventoryItem } from '../types';
import { nanoid } from 'nanoid';

export function Inventory2Page() {
  // State management
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof InventoryItem | 'created_at',
    direction: 'asc' | 'desc'
  }>({
    key: 'created_at',
    direction: 'desc'
  });

  // Load inventory items
  useEffect(() => {
    setLoading(true);
    try {
      // Try to get items from storage
      const items = inventoryStorage.getAllItems();
      if (items && items.length > 0) {
        setInventoryItems(items);
      } else {
        // Fallback to mock data if storage is empty
        setInventoryItems(mockInventoryItems);
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
      setInventoryItems(mockInventoryItems);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and sort items when dependencies change
  useEffect(() => {
    let result = [...inventoryItems];
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter(item => item.category === selectedCategory);
    }
    
    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchLower) || 
        (item.description && item.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      // Handle created_at separately since it might be a string or Date
      if (sortConfig.key === 'created_at') {
        const aDate = new Date(a.created_at).getTime();
        const bDate = new Date(b.created_at).getTime();
        return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
      }
      
      // Handle other fields
      const aValue = a[sortConfig.key as keyof InventoryItem];
      const bValue = b[sortConfig.key as keyof InventoryItem];
      
      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bValue === undefined) return sortConfig.direction === 'asc' ? 1 : -1;
      
      // Compare values
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredItems(result);
  }, [inventoryItems, searchTerm, selectedCategory, sortConfig]);

  // All available categories
  const categories = ['all', ...new Set(inventoryItems.map(item => item.category))];

  // Handle sort toggle
  const handleSort = (key: keyof InventoryItem | 'created_at') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return { bg: '#EBF9F0', text: '#0D9F31' }; // Green
      case 'low stock': return { bg: '#FFF8EB', text: '#F0A719' }; // Amber/Orange
      case 'out of stock': return { bg: '#FEEBEF', text: '#EB4A76' }; // Red
      default: return { bg: '#F2F4F7', text: '#667085' }; // Grey
    }
  };

  // Handle item deletion
  const handleDeleteItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const newItems = inventoryItems.filter(item => item.id !== id);
      setInventoryItems(newItems);
      try {
        inventoryStorage.deleteItem(id);
      } catch (error) {
        console.error('Error saving after delete:', error);
      }
    }
  };

  // Export inventory as CSV
  const handleExport = () => {
    try {
      // Create CSV content
      const headers = ['ID', 'Name', 'Description', 'Category', 'Label', 'Purchase Price', 'Selling Price', 'Quantity', 'Status', 'Added'];
      const csvContent = [
        headers.join(','),
        ...filteredItems.map(item => {
          const row = [
            `"${item.id}"`,
            `"${item.name}"`,
            `"${item.description || ''}"`,
            `"${item.category}"`,
            `"${new Date(item.created_at).toLocaleDateString()}"`, // Using created_at as label for now
            item.cost_price,
            item.price,
            item.quantity,
            `"${item.status}"`,
            `"${new Date(item.created_at).toLocaleDateString()}"`
          ];
          return row.join(',');
        })
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting inventory:', error);
      alert('Failed to export inventory data');
    }
  };

  // Render the inventory page
  return (
    <div className="bg-background min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-on-surface mb-2">Inventory Management</h1>
          <p className="text-on-surface-variant">Manage your inventory items, track stock levels and update product information.</p>
        </div>

        {/* Filters and Actions Row */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-outline/20 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="relative w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-lg border border-outline/20 bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
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
            >
              <Plus size={18} />
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-surface rounded-xl overflow-hidden border border-outline/10 shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-2 border-primary/20 rounded-full border-t-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-outline/10 bg-surface-container-low">
                    <th className="py-4 px-4 text-left text-xs font-medium text-on-surface-variant">
                      <button 
                        className="flex items-center gap-1"
                        onClick={() => handleSort('id')}
                      >
                        ID
                        {sortConfig.key === 'id' && (
                          <ArrowUpDown size={14} className={sortConfig.direction === 'asc' ? 'rotate-180' : ''} />
                        )}
                      </button>
                    </th>
                    <th className="py-4 px-4 text-left text-xs font-medium text-on-surface-variant">
                      <button 
                        className="flex items-center gap-1"
                        onClick={() => handleSort('name')}
                      >
                        Product
                        {sortConfig.key === 'name' && (
                          <ArrowUpDown size={14} className={sortConfig.direction === 'asc' ? 'rotate-180' : ''} />
                        )}
                      </button>
                    </th>
                    <th className="py-4 px-4 text-left text-xs font-medium text-on-surface-variant">
                      <button 
                        className="flex items-center gap-1"
                        onClick={() => handleSort('category')}
                      >
                        Category
                        {sortConfig.key === 'category' && (
                          <ArrowUpDown size={14} className={sortConfig.direction === 'asc' ? 'rotate-180' : ''} />
                        )}
                      </button>
                    </th>
                    <th className="py-4 px-4 text-left text-xs font-medium text-on-surface-variant">
                      <button 
                        className="flex items-center gap-1"
                        onClick={() => handleSort('created_at')}
                      >
                        Label
                        {sortConfig.key === 'created_at' && (
                          <ArrowUpDown size={14} className={sortConfig.direction === 'asc' ? 'rotate-180' : ''} />
                        )}
                      </button>
                    </th>
                    <th className="py-4 px-4 text-left text-xs font-medium text-on-surface-variant">
                      <button 
                        className="flex items-center gap-1"
                        onClick={() => handleSort('cost_price')}
                      >
                        Purchased At
                        {sortConfig.key === 'cost_price' && (
                          <ArrowUpDown size={14} className={sortConfig.direction === 'asc' ? 'rotate-180' : ''} />
                        )}
                      </button>
                    </th>
                    <th className="py-4 px-4 text-left text-xs font-medium text-on-surface-variant">
                      <button 
                        className="flex items-center gap-1"
                        onClick={() => handleSort('price')}
                      >
                        Selling Price
                        {sortConfig.key === 'price' && (
                          <ArrowUpDown size={14} className={sortConfig.direction === 'asc' ? 'rotate-180' : ''} />
                        )}
                      </button>
                    </th>
                    <th className="py-4 px-4 text-left text-xs font-medium text-on-surface-variant">
                      <button 
                        className="flex items-center gap-1"
                        onClick={() => handleSort('quantity')}
                      >
                        Quantity
                        {sortConfig.key === 'quantity' && (
                          <ArrowUpDown size={14} className={sortConfig.direction === 'asc' ? 'rotate-180' : ''} />
                        )}
                      </button>
                    </th>
                    <th className="py-4 px-4 text-left text-xs font-medium text-on-surface-variant">
                      <button 
                        className="flex items-center gap-1"
                        onClick={() => handleSort('status')}
                      >
                        Status
                        {sortConfig.key === 'status' && (
                          <ArrowUpDown size={14} className={sortConfig.direction === 'asc' ? 'rotate-180' : ''} />
                        )}
                      </button>
                    </th>
                    <th className="py-4 px-4 text-left text-xs font-medium text-on-surface-variant">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-on-surface-variant">
                        No inventory items found
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const statusColors = getStatusColor(item.status);
                      return (
                        <tr 
                          key={item.id}
                          className="border-b border-outline/10 hover:bg-surface-container-lowest transition-colors"
                        >
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-on-surface-variant">{item.id.slice(0, 8)}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              {item.image ? (
                                <div className="flex-shrink-0 h-10 w-10 mr-3">
                                  <img className="h-10 w-10 rounded-md object-cover" src={item.image} alt="" />
                                </div>
                              ) : (
                                <div className="flex-shrink-0 h-10 w-10 bg-surface-variant/50 flex items-center justify-center rounded-md mr-3">
                                  <Package size={18} className="text-on-surface-variant" />
                                </div>
                              )}
                              <div className="max-w-[200px]">
                                <div className="text-sm font-medium text-on-surface">{item.name}</div>
                                {item.description && (
                                  <div className="text-xs text-on-surface-variant truncate">{item.description}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-surface-container-high text-on-surface-variant">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="text-sm text-on-surface-variant">{new Date(item.created_at).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-on-surface">₹{item.cost_price.toLocaleString()}</div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-on-surface">₹{item.price.toLocaleString()}</div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-on-surface">{item.quantity}</span>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full"
                              style={{
                                backgroundColor: statusColors.bg,
                                color: statusColors.text
                              }}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                className="p-1.5 rounded-full hover:bg-primary/10 text-primary"
                                aria-label="View item details"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                className="p-1.5 rounded-full hover:bg-primary/10 text-primary"
                                aria-label="Edit item"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1.5 rounded-full hover:bg-error/10 text-error"
                                aria-label="Delete item"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 