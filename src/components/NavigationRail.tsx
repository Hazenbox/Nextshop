import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard,
  ShoppingCart,
  BarChart2,
  Settings,
  ChevronRight,
  ChevronLeft,
  Menu,
  Plus,
  IndianRupee,
  Package
} from 'lucide-react';
import { AddInventorySideSheet } from './AddInventorySideSheet';
import { AddTransactionSideSheet } from './AddTransactionSideSheet';
import { inventoryStorage } from '../lib/inventory';
import { useTransactionStore } from '../stores/transactionStore';
import { Image } from '../types';
import { imageStorage } from '../lib/storage';
import { nanoid } from 'nanoid';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path?: string;
}

interface NavigationRailProps {
  expanded: boolean;
  onToggleExpanded: () => void;
  activeItemId: string;
  onNavigate: (id: string) => void;
  onSideSheetStateChange?: (type: 'inventory' | 'transaction', isOpen: boolean) => void;
}

export function NavigationRail({
  expanded,
  onToggleExpanded,
  activeItemId,
  onNavigate,
  onSideSheetStateChange
}: NavigationRailProps) {
  const [fabMenuOpen, setFabMenuOpen] = useState(false);
  
  // Make sure to handle collapsing/expanding correctly
  const railWidth = expanded ? '240px' : '80px';
  
  const handleAddInventory = () => {
    setFabMenuOpen(false);
    if (onSideSheetStateChange) {
      onSideSheetStateChange('inventory', true);
    }
  };
  
  const handleAddTransaction = () => {
    setFabMenuOpen(false);
    if (onSideSheetStateChange) {
      onSideSheetStateChange('transaction', true);
    }
  };
  
  // Define navItems for use in the nav rail
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'inventory', label: 'Inventory', icon: ShoppingCart, path: '/inventory' },
    { id: 'transactions', label: 'Transactions', icon: BarChart2, path: '/transactions' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div 
      className="md-navigation-rail"
      style={{
        width: railWidth,
        height: '100vh',
        backgroundColor: 'white',
        borderRight: '1px solid var(--md-outline-variant)',
        position: 'fixed',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div 
        style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          padding: expanded ? '0 16px' : '0 16px',
          justifyContent: expanded ? 'space-between' : 'center',
          borderBottom: '1px solid var(--md-outline-variant)'
        }}
      >
        {expanded && (
          <div className="app-logo" style={{ fontWeight: '500', fontSize: '18px' }}>
            Nextshop
          </div>
        )}
        <button
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            background: 'none',
            cursor: 'pointer'
          }}
          onClick={onToggleExpanded}
        >
          {expanded ? <ChevronLeft size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* FAB - Moved to top, above nav items */}
      <div 
        style={{ 
          position: 'relative',
          padding: '16px',
          display: 'flex',
          justifyContent: expanded ? 'flex-end' : 'center',
          marginTop: '12px',
          marginBottom: '4px'
        }}
      >
        <button
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: 'var(--md-primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            position: 'relative',
            zIndex: 2,
            transform: fabMenuOpen ? 'rotate(45deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}
          onClick={() => setFabMenuOpen(!fabMenuOpen)}
          aria-label="Add new item"
        >
          <Plus size={22} />
        </button>
        
        {/* FAB Menu - now appears on the right side with higher z-index */}
        {fabMenuOpen && (
          <div 
            style={{
              position: 'absolute',
              top: '0px',
              left: railWidth,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              backgroundColor: 'white',
              padding: '12px',
              borderRadius: '12px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              zIndex: 1500
            }}
          >
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--md-surface-variant)',
                color: 'var(--md-on-surface-variant)',
                cursor: 'pointer',
                fontSize: '14px',
                whiteSpace: 'nowrap'
              }}
              onClick={handleAddInventory}
            >
              <ShoppingCart size={16} style={{ marginRight: '8px' }} />
              Add Inventory
            </button>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--md-surface-variant)',
                color: 'var(--md-on-surface-variant)',
                cursor: 'pointer',
                fontSize: '14px',
                whiteSpace: 'nowrap'
              }}
              onClick={handleAddTransaction}
            >
              <BarChart2 size={16} style={{ marginRight: '8px' }} />
              Add Transaction
            </button>
          </div>
        )}
      </div>
      
      {/* Nav Items */}
      <div style={{ 
        marginTop: '8px', 
        padding: '0 8px', 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {navItems.map((item) => {
          const isActive = item.id === activeItemId;
          
          return (
            <a
              key={item.id}
              href={item.path || '#'}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(item.id);
              }}
              style={{
                display: 'flex',
                flexDirection: expanded ? 'row' : 'column',
                alignItems: 'center',
                padding: expanded ? '12px 16px' : '8px 0',
                borderRadius: expanded ? '32px' : '12px',
                textDecoration: 'none',
                color: isActive ? 'var(--md-primary)' : 'var(--md-on-surface-variant)',
                backgroundColor: isActive ? 'var(--md-primary-container)' : 'transparent',
                transition: 'background-color 0.2s ease',
                height: expanded ? '40px' : 'auto',
                justifyContent: expanded ? 'flex-start' : 'center',
                textAlign: 'center'
              }}
            >
              <item.icon 
                size={24} 
                style={{ 
                  flexShrink: 0,
                  marginBottom: expanded ? 0 : '4px'
                }}
              />
              
              {expanded ? (
                <span style={{ 
                  marginLeft: '16px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: '14px',
                  fontWeight: isActive ? '500' : 'normal'
                }}>
                  {item.label}
                </span>
              ) : (
                <span style={{ 
                  fontSize: '10px',
                  lineHeight: '12px',
                  fontWeight: isActive ? '500' : 'normal',
                  maxWidth: '64px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {item.label}
                </span>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
} 