import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { ImageGrid } from '../components/ImageGrid';
import { ImageViewer } from '../components/ImageViewer';
import { Notification } from '../components/Notification';
import { ShareDialog } from '../components/ShareDialog';
import { Image, InventoryItem, Transaction } from '../types';
import { imageStorage } from '../lib/storage';
import { nanoid } from 'nanoid';
import { useNavigate } from 'react-router-dom';
import { Package, IndianRupee, BarChart2, TrendingUp, TrendingDown, Calendar, DollarSign, Plus, FileText, ArrowUpRight, ArrowDownLeft, Activity, LucideIcon } from 'lucide-react';
import { inventoryStorage, mockInventoryItems } from '../lib/inventory';
import { mockTransactions, transactionService } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { ResponsiveView, DataCard } from '../components/ResponsiveView';

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export function HomePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [board, setBoard] = useState(() => ({
    id: 'default',
    editKey: nanoid(),
    images: [] as Image[],
    createdAt: new Date()
  }));

  const [selectedImageGroup, setSelectedImageGroup] = useState<{
    images: Image[];
    currentIndex: number;
  } | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState({
    income: 0,
    expense: 0,
    balance: 0,
    inventory: 0
  });

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const quickActions = [
    {
      title: 'Manage Inventory',
      description: 'Add, edit or view your inventory items',
      icon: Package,
      onClick: () => navigate('/inventory')
    },
    {
      title: 'Record Transaction',
      description: 'Record a new sale or purchase',
      icon: IndianRupee,
      onClick: () => navigate('/transactions')
    },
    {
      title: 'View Analytics',
      description: 'Check your business performance',
      icon: BarChart2,
      onClick: () => navigate('/analytics')
    }
  ];

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, message, type });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const loadImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const images = await imageStorage.getImages(board.id);
      setBoard(prev => ({ ...prev, images }));
    } catch (error) {
      console.error('Error loading images:', error);
      setError('Failed to load images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await imageStorage.init();
        await loadImages();

        // Load inventory items
        let items: InventoryItem[];
        try {
          items = inventoryStorage.getAllItems();
          if (!items || items.length === 0) {
            items = mockInventoryItems;
          }
        } catch (error) {
          console.warn('Error loading from inventoryStorage, falling back to mock data:', error);
          items = mockInventoryItems;
        }
        
        setInventoryItems(items);

        // Calculate stats
        const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalRevenue = mockTransactions
          .filter(tx => tx.type === 'income')
          .reduce((sum, tx) => sum + tx.amount, 0);
        const totalExpenses = mockTransactions
          .filter(tx => tx.type === 'expense')
          .reduce((sum, tx) => sum + tx.amount, 0);

        setStats({
          income: totalRevenue,
          expense: totalExpenses,
          balance: totalRevenue - totalExpenses,
          inventory: items.length
        });
      } catch (error) {
        console.error('Error initializing app:', error);
        setError('Failed to load the application. Please refresh the page.');
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch transactions
        const allTransactions = mockTransactions;
        
        // Get recent transactions (last 5)
        const recent = [...allTransactions].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ).slice(0, 5);
        
        setRecentTransactions(recent);
        
        // Calculate statistics
        const income = allTransactions
          .filter(tx => tx.type === 'income')
          .reduce((sum, tx) => sum + tx.amount, 0);
          
        const expense = allTransactions
          .filter(tx => tx.type === 'expense')
          .reduce((sum, tx) => sum + tx.amount, 0);
          
        setStats({
          income,
          expense,
          balance: income - expense,
          inventory: 120 // Mock inventory count
        });
        
      } catch (error) {
        console.error('Error fetching data:', error);
        
        // Use mock data as fallback
        const recent = [...mockTransactions].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ).slice(0, 5);
        
        setRecentTransactions(recent);
        
        // Calculate mock statistics
        const income = mockTransactions
          .filter(tx => tx.type === 'income')
          .reduce((sum: number, tx: Transaction) => sum + tx.amount, 0);
          
        const expense = mockTransactions
          .filter(tx => tx.type === 'expense')
          .reduce((sum: number, tx: Transaction) => sum + tx.amount, 0);
          
        setStats({
          income,
          expense,
          balance: income - expense,
          inventory: 120 // Mock inventory count
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleShare = () => {
    setShowShareDialog(true);
  };

  const handleCopyUrl = async (type: 'edit' | 'view') => {
    try {
      const baseUrl = `${window.location.origin}/${board.id}`;
      const url = type === 'edit' ? `${baseUrl}?edit=${board.editKey}` : baseUrl;
      
      await navigator.clipboard.writeText(url);
      showNotification(`${type === 'edit' ? 'Edit' : 'View-only'} link copied`);
      setShowShareDialog(false);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showNotification('Failed to copy link', 'error');
    }
  };

  const handleUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;

      setLoading(true);
      try {
        const uploadedImages: Image[] = [];
        
        for (const file of Array.from(files)) {
          const image = await imageStorage.addImage(board.id, file);
          uploadedImages.push(image);
        }

        setBoard(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedImages]
        }));

        showNotification('Images uploaded successfully');
      } catch (error) {
        console.error('Error uploading files:', error);
        showNotification('Failed to upload images', 'error');
      } finally {
        setLoading(false);
      }
    };

    input.click();
  };

  const handleDeleteImage = async (id: string) => {
    try {
      setLoading(true);
      await imageStorage.deleteImage(id);
      setSelectedImageGroup(null);
      
      setBoard(prev => ({
        ...prev,
        images: prev.images.filter(img => img.id !== id)
      }));

      showNotification('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      showNotification('Failed to delete image', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReplaceImage = async (id: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        setLoading(true);
        const updatedImage = await imageStorage.replaceImage(id, file);
        
        setBoard(prev => ({
          ...prev,
          images: prev.images.map(img => 
            img.id === id ? updatedImage : img
          )
        }));

        showNotification('Image replaced successfully');
      } catch (error) {
        console.error('Error replacing image:', error);
        showNotification('Failed to replace image', 'error');
      } finally {
        setLoading(false);
      }
    };

    input.click();
  };

  // Get recent items
  const recentInventoryItems = [...inventoryItems]
    .sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);

  // Render transaction cards for mobile view
  const renderTransactionCards = () => {
    return (
      <div>
        {recentTransactions.map(transaction => (
          <DataCard
            key={transaction.id}
            title={transaction.type === 'income' ? 'Income' : 'Expense'}
            subtitle={transaction.payment_mode}
            status={{
              label: new Date(transaction.date).toLocaleDateString(),
              color: '#6D736D'
            }}
            details={[
              { label: 'Amount', value: `₹${transaction.amount.toLocaleString()}` },
              { label: 'Reference', value: transaction.reference || 'None' },
              { label: 'Notes', value: transaction.notes || 'None' }
            ]}
            actions={
              transaction.type === 'income' 
                ? <ArrowUpRight size={18} className="text-green-500" />
                : <ArrowDownLeft size={18} className="text-red-500" />
            }
          />
        ))}
        </div>
    );
  };

  // Render transaction table for desktop view
  const renderTransactionTable = () => {
    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment Mode
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reference
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {recentTransactions.map(transaction => (
            <tr key={transaction.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(transaction.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  transaction.type === 'income' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {transaction.type === 'income' ? 'Income' : 'Expense'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                  ₹{transaction.amount.toLocaleString()}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {transaction.payment_mode}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {transaction.reference || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Mobile version with cards
  const mobileView = (
    <div className="md-content" style={{ padding: '16px', marginBottom: '16px' }}>
      {/* Summary Cards */}
      <div className="md-card md-elevation-1" style={{ 
        marginBottom: '16px', 
        borderRadius: '12px', 
        overflow: 'hidden'
      }}>
        <div className="md-card-content" style={{ padding: '16px' }}>
          <h2 className="md-title-medium" style={{ marginBottom: '12px' }}>Quick Summary</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '12px' 
          }}>
            <div style={{ 
              backgroundColor: 'var(--md-primary-container)', 
              padding: '12px', 
              borderRadius: '8px',
              color: 'var(--md-on-primary-container)'
            }}>
              <p style={{ 
                fontSize: '12px', 
                marginBottom: '4px',
                opacity: 0.8
              }}>Total Revenue</p>
              <p style={{ 
                fontSize: '20px', 
                fontWeight: '500', 
                margin: 0 
              }}>{formatCurrency(stats.income)}</p>
            </div>
            <div style={{ 
              backgroundColor: 'var(--md-secondary-container)', 
              padding: '12px', 
              borderRadius: '8px',
              color: 'var(--md-on-secondary-container)'
            }}>
              <p style={{ 
                fontSize: '12px', 
                marginBottom: '4px',
                opacity: 0.8
              }}>Profit</p>
              <p style={{ 
                fontSize: '20px', 
                fontWeight: '500', 
                margin: 0 
              }}>{formatCurrency(stats.balance)}</p>
            </div>
            <div style={{ 
              backgroundColor: 'var(--md-tertiary-container)', 
              padding: '12px', 
              borderRadius: '8px',
              color: 'var(--md-on-tertiary-container)'
            }}>
              <p style={{ 
                fontSize: '12px', 
                marginBottom: '4px',
                opacity: 0.8
              }}>Inventory Items</p>
              <p style={{ 
                fontSize: '20px', 
                fontWeight: '500', 
                margin: 0 
              }}>{stats.inventory}</p>
            </div>
            <div style={{ 
              backgroundColor: 'rgba(255, 193, 7, 0.1)', 
              padding: '12px', 
              borderRadius: '8px',
              color: '#B45309'
            }}>
              <p style={{ 
                fontSize: '12px', 
                marginBottom: '4px',
                opacity: 0.8
              }}>Pending Orders</p>
              <p style={{ 
                fontSize: '20px', 
                fontWeight: '500', 
                margin: 0 
              }}>12</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Transactions Card */}
      <div className="md-card md-elevation-1" style={{ 
        marginBottom: '16px', 
        borderRadius: '12px', 
        overflow: 'hidden'
      }}>
        <div className="md-card-content" style={{ padding: '16px' }}>
          <h2 className="md-title-medium" style={{ marginBottom: '12px' }}>Recent Transactions</h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ 
                padding: '12px 0', 
                borderBottom: i < 3 ? '1px solid var(--md-outline-variant)' : 'none' 
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px'
                }}>
                  <p className="md-body-medium">Transaction #{10000 + i}</p>
                  <span style={{ 
                    color: 'var(--md-primary)', 
                    fontWeight: '500'
                  }}>+₹1,200</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  color: 'var(--md-on-surface-variant)',
                  fontSize: '12px'
                }}>
                  <p>Cash Payment</p>
                  <p>Today, 2:30 PM</p>
                </div>
              </div>
            ))}
          </div>
          <button className="md-text-button" style={{ 
            width: '100%', 
            marginTop: '12px',
            color: 'var(--md-primary)',
            fontSize: '14px',
            fontWeight: '500',
            padding: '8px',
            textAlign: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}>
            View All Transactions
          </button>
        </div>
      </div>
      
      {/* Low Stock Items Card */}
      <div className="md-card md-elevation-1" style={{ 
        marginBottom: '16px', 
        borderRadius: '12px', 
        overflow: 'hidden'
      }}>
        <div className="md-card-content" style={{ padding: '16px' }}>
          <h2 className="md-title-medium" style={{ marginBottom: '12px' }}>Low Stock Items</h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '12px 0',
                borderBottom: i < 3 ? '1px solid var(--md-outline-variant)' : 'none'
              }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  backgroundColor: 'var(--md-surface-variant)', 
                  borderRadius: '8px',
                  marginRight: '12px',
                  flexShrink: 0
                }}></div>
                <div style={{ flex: 1 }}>
                  <p className="md-body-medium">Product Name {i}</p>
                  <p style={{ 
                    color: 'var(--md-error)', 
                    fontSize: '12px'
                  }}>Only 2 left in stock</p>
                </div>
                <button className="md-text-button" style={{ 
                  backgroundColor: 'var(--md-primary-container)', 
                  color: 'var(--md-on-primary-container)',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  fontSize: '12px',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  Restock
                </button>
              </div>
            ))}
          </div>
          <button className="md-text-button" style={{ 
            width: '100%', 
            marginTop: '12px',
            color: 'var(--md-primary)',
            fontSize: '14px',
            fontWeight: '500',
            padding: '8px',
            textAlign: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}>
            View Inventory
          </button>
        </div>
      </div>
      
      {/* Sales Chart Card - Simplified for mobile */}
      <div className="md-card md-elevation-1" style={{ 
        borderRadius: '12px', 
        overflow: 'hidden'
      }}>
        <div className="md-card-content" style={{ padding: '16px' }}>
          <h2 className="md-title-medium" style={{ marginBottom: '12px' }}>Weekly Sales</h2>
          <div style={{ 
            height: '160px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'var(--md-surface-variant)',
            borderRadius: '8px',
            color: 'var(--md-on-surface-variant)'
          }}>
            <p>Chart Placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Desktop version with Material Design 3 styling
  const desktopView = (
    <div className="md-content" style={{ 
      minHeight: '100vh',
      padding: '24px'
    }}>
      <div className="md-layout-grid-header" style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 className="md-headline-medium">
          Dashboard
        </h1>
      </div>
      
      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div className="md-card md-elevation-1" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div className="md-card-content" style={{ padding: '16px' }}>
            <h2 className="md-title-medium" style={{ color: 'var(--md-on-surface-variant)', marginBottom: '8px' }}>
              Total Revenue
            </h2>
            <p className="md-headline-small" style={{ margin: '0 0 4px 0' }}>{formatCurrency(stats.income)}</p>
            <p style={{ 
              color: 'var(--md-primary)', 
              fontSize: '14px', 
              display: 'flex', 
              alignItems: 'center', 
              margin: 0 
            }}>
              ↑ 12% from last month
            </p>
          </div>
        </div>
        
        <div className="md-card md-elevation-1" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div className="md-card-content" style={{ padding: '16px' }}>
            <h2 className="md-title-medium" style={{ color: 'var(--md-on-surface-variant)', marginBottom: '8px' }}>
              Profit
            </h2>
            <p className="md-headline-small" style={{ margin: '0 0 4px 0' }}>{formatCurrency(stats.balance)}</p>
            <p style={{ 
              color: 'var(--md-primary)', 
              fontSize: '14px', 
              display: 'flex', 
              alignItems: 'center', 
              margin: 0 
            }}>
              ↑ 8% from last month
            </p>
          </div>
        </div>
        
        <div className="md-card md-elevation-1" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div className="md-card-content" style={{ padding: '16px' }}>
            <h2 className="md-title-medium" style={{ color: 'var(--md-on-surface-variant)', marginBottom: '8px' }}>
              Inventory Items
            </h2>
            <p className="md-headline-small" style={{ margin: '0 0 4px 0' }}>{stats.inventory}</p>
            <p style={{ 
              color: 'var(--md-tertiary)', 
              fontSize: '14px', 
              display: 'flex', 
              alignItems: 'center', 
              margin: 0 
            }}>
              5 items low in stock
            </p>
          </div>
        </div>
        
        <div className="md-card md-elevation-1" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div className="md-card-content" style={{ padding: '16px' }}>
            <h2 className="md-title-medium" style={{ color: 'var(--md-on-surface-variant)', marginBottom: '8px' }}>
              Pending Orders
            </h2>
            <p className="md-headline-small" style={{ margin: '0 0 4px 0' }}>12</p>
            <p style={{ 
              color: '#F59E0B', 
              fontSize: '14px', 
              display: 'flex', 
              alignItems: 'center', 
              margin: 0 
            }}>
              3 need attention
            </p>
          </div>
        </div>
      </div>
      
      {/* Charts and Recent Transactions */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
        gap: '24px',
        marginBottom: '24px'
      }}>
        <div className="md-card md-elevation-1" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div className="md-card-content" style={{ padding: '16px' }}>
            <h2 className="md-title-medium" style={{ marginBottom: '16px' }}>Revenue Overview</h2>
            <div style={{ 
              height: '280px', 
              backgroundColor: 'var(--md-surface-variant)', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--md-on-surface-variant)'
            }}>
              <p>Chart Placeholder</p>
            </div>
          </div>
        </div>
        
        <div className="md-card md-elevation-1" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div className="md-card-content" style={{ padding: '16px' }}>
            <h2 className="md-title-medium" style={{ marginBottom: '16px' }}>Recent Transactions</h2>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ 
                padding: '12px 0', 
                borderBottom: i < 5 ? '1px solid var(--md-outline-variant)' : 'none',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <div>
                  <p className="md-body-medium" style={{ margin: '0 0 4px 0' }}>Transaction #{10000 + i}</p>
                  <p style={{ 
                    color: 'var(--md-on-surface-variant)', 
                    fontSize: '12px',
                    margin: 0
                  }}>Today, 2:30 PM</p>
                </div>
                <span style={{ 
                  color: 'var(--md-primary)', 
                  fontWeight: '500'
                }}>+₹1,200</span>
              </div>
            ))}
            <button className="md-text-button" style={{ 
              width: '100%', 
              marginTop: '16px',
              color: 'var(--md-primary)',
              fontSize: '14px',
              fontWeight: '500',
              padding: '8px',
              textAlign: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}>
              View All Transactions
            </button>
          </div>
        </div>
      </div>
      
      {/* Low Stock Items Table */}
      <div className="md-card md-elevation-1" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div className="md-card-content" style={{ padding: '16px' }}>
          <h2 className="md-title-medium" style={{ marginBottom: '16px' }}>Low Stock Items</h2>
          <div className="md-data-table">
            <table className="md-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--md-surface-variant)' }}>
                  <th className="md-table-header-cell" style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left', 
                    color: 'var(--md-on-surface-variant)',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>Product</th>
                  <th className="md-table-header-cell" style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left', 
                    color: 'var(--md-on-surface-variant)',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>Category</th>
                  <th className="md-table-header-cell" style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left', 
                    color: 'var(--md-on-surface-variant)',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>Current Stock</th>
                  <th className="md-table-header-cell" style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left', 
                    color: 'var(--md-on-surface-variant)',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>Min. Required</th>
                  <th className="md-table-header-cell" style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left', 
                    color: 'var(--md-on-surface-variant)',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map(i => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--md-outline-variant)' }}>
                    <td className="md-table-cell" style={{ padding: '12px 16px' }}>Product Name {i}</td>
                    <td className="md-table-cell" style={{ padding: '12px 16px' }}>Electronics</td>
                    <td className="md-table-cell" style={{ padding: '12px 16px', color: 'var(--md-error)', fontWeight: '500' }}>2</td>
                    <td className="md-table-cell" style={{ padding: '12px 16px' }}>10</td>
                    <td className="md-table-cell" style={{ padding: '12px 16px' }}>
                      <button style={{ 
                        backgroundColor: 'var(--md-primary-container)', 
                        color: 'var(--md-on-primary-container)',
                        borderRadius: '20px',
                        padding: '4px 12px',
                        fontSize: '12px',
                        border: 'none',
                        cursor: 'pointer'
                      }}>
                        Restock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <ResponsiveView 
        tableView={desktopView}
        cardView={mobileView}
      />

      {selectedImageGroup && (
        <ImageViewer
          images={selectedImageGroup.images}
          currentIndex={selectedImageGroup.currentIndex}
          onClose={() => setSelectedImageGroup(null)}
          onDelete={handleDeleteImage}
          onReplace={handleReplaceImage}
          onNavigate={(index) => setSelectedImageGroup(prev => prev ? { ...prev, currentIndex: index } : null)}
        />
      )}

      <ShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        boardId={board.id}
        editKey={board.editKey}
        onCopyUrl={handleCopyUrl}
      />

      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
      />
    </Layout>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconColor: string;
}

function StatCard({ title, value, icon, iconColor }: StatCardProps) {
  return (
    <div style={{ 
      backgroundColor: 'white',
      borderRadius: '10px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px'
    }}>
      <div style={{ 
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: `${iconColor}10`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: iconColor
      }}>
        {icon}
      </div>
      <div>
        <div style={{ color: 'rgba(0,0,0,0.6)', fontSize: '14px', marginBottom: '4px' }}>{title}</div>
        <div style={{ fontSize: '24px', fontWeight: '500' }}>{value}</div>
      </div>
    </div>
  );
}

// Action Button Component
interface ActionButtonProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
}

function ActionButton({ title, description, icon: Icon, onClick }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: '#f0f0f0',
        border: 'none',
        borderRadius: '20px',
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
      }}
      className="md-state-layer"
    >
      <Icon size={20} style={{ color: 'var(--md-primary)', marginRight: '8px' }} />
      <div>
        <p style={{ margin: '0 0 6px 0', fontWeight: 500, color: 'var(--md-on-surface)', fontSize: '14px' }}>{title}</p>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--md-on-surface-variant)' }}>{description}</p>
      </div>
    </button>
  );
}

// Transaction Row Component
interface TransactionRowProps {
  date: string;
  amount: string;
  type: string;
}

function TransactionRow({ date, amount, type }: TransactionRowProps) {
  const isIncome = type === 'Income';
  
  return (
    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
      <td style={{ padding: '12px 16px' }}>{date}</td>
      <td style={{ textAlign: 'right', padding: '12px 16px', color: isIncome ? '#4CAF50' : '#F44336' }}>{amount}</td>
      <td style={{ textAlign: 'right', padding: '12px 16px' }}>
        <span style={{ 
          display: 'inline-block',
          padding: '4px 8px',
          borderRadius: '100px',
          fontSize: '12px',
          fontWeight: '500',
          backgroundColor: isIncome ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
          color: isIncome ? '#4CAF50' : '#F44336'
        }}>
          {type}
        </span>
      </td>
    </tr>
  );
}