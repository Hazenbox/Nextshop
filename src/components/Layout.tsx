import React, { useState, ReactNode, useEffect } from 'react';
import { NavigationRail } from './NavigationRail';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, BarChart2, Settings, Plus, X } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

// Create a SideSheetContext to manage side sheet state across the application
export const SideSheetContext = React.createContext({
  isInventorySideSheetOpen: false,
  setInventorySideSheetOpen: (open: boolean) => {},
  isTransactionSideSheetOpen: false,
  setTransactionSideSheetOpen: (open: boolean) => {},
});

// Bottom Navigation Component
interface BottomNavigationProps {
  activeItemId: string;
  onNavigate: (id: string) => void;
  onFabClick: () => void;
}

function BottomNavigation({ activeItemId, onNavigate, onFabClick }: BottomNavigationProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'inventory', label: 'Inventory', icon: ShoppingCart, path: '/inventory' },
    { id: 'transactions', label: 'Transactions', icon: BarChart2, path: '/transactions' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '64px',
      backgroundColor: 'white',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      boxShadow: '0 -2px 5px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      padding: '0 16px'
    }}>
      {navItems.map(item => {
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
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: isActive ? '#4CAF50' : 'var(--md-on-surface-variant)',
              textDecoration: 'none',
              padding: '8px',
              borderRadius: '4px',
              flex: 1,
              maxWidth: '72px'
            }}
          >
            <item.icon size={24} />
            <span style={{
              fontSize: '12px',
              marginTop: '4px',
              fontWeight: isActive ? '500' : 'normal'
            }}>
              {item.label}
            </span>
          </a>
        );
      })}
      
      {/* FAB on bottom navigation */}
      <button
        onClick={onFabClick}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#4CAF50',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          top: '-28px',
          right: '24px',
          border: 'none',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          cursor: 'pointer'
        }}
      >
        <Plus size={28} />
      </button>
    </div>
  );
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [navExpanded, setNavExpanded] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' && window.innerWidth < 768
  );
  
  // Create state for side sheets
  const [isInventorySideSheetOpen, setInventorySideSheetOpen] = useState(false);
  const [isTransactionSideSheetOpen, setTransactionSideSheetOpen] = useState(false);
  
  // Create the context value
  const sideSheetContextValue = {
    isInventorySideSheetOpen,
    setInventorySideSheetOpen,
    isTransactionSideSheetOpen,
    setTransactionSideSheetOpen,
  };

  useEffect(() => {
    // Set initial mobile state on mount
    const checkMobile = () => {
      const width = window.innerWidth;
      const newIsMobile = width < 768;
      if (newIsMobile !== isMobile) {
        setIsMobile(newIsMobile);
      }
    };
    
    // Run once on mount
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [isMobile]);

  const toggleNavExpanded = () => {
    setNavExpanded(!navExpanded);
  };

  // Determine the active navigation item based on the current path
  const getActiveItemId = (path: string) => {
    if (path === '/') return 'dashboard';
    if (path.startsWith('/inventory')) return 'inventory';
    if (path.startsWith('/transactions')) return 'transactions';
    if (path.startsWith('/settings')) return 'settings';
    return 'dashboard'; // Default
  };

  const handleNavigate = (id: string) => {
    // Navigate to the selected page without affecting navigation rail state
    switch (id) {
      case 'dashboard':
        navigate('/');
        break;
      case 'inventory':
        navigate('/inventory');
        break;
      case 'transactions':
        navigate('/transactions');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <SideSheetContext.Provider value={sideSheetContextValue}>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Navigation Rail - desktop only */}
        {!isMobile && (
          <NavigationRail
            expanded={navExpanded}
            onToggleExpanded={toggleNavExpanded}
            activeItemId={getActiveItemId(location.pathname)}
            onNavigate={handleNavigate}
            onSideSheetStateChange={(type, isOpen) => {
              if (type === 'inventory') {
                setInventorySideSheetOpen(isOpen);
              } else if (type === 'transaction') {
                setTransactionSideSheetOpen(isOpen);
              }
            }}
          />
        )}

        {/* Main content */}
        <main style={{
          flex: 1,
          marginLeft: isMobile ? 0 : (navExpanded ? '240px' : '80px'),
          transition: 'margin-left 0.3s ease',
          marginBottom: isMobile ? '64px' : 0,
          position: 'relative'
        }}>
          {children}
        </main>

        {/* Side Sheet for inventory and transactions forms */}
        {(isInventorySideSheetOpen || isTransactionSideSheetOpen) && (
          <div
            className={`fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-lg transform ${
              isInventorySideSheetOpen || isTransactionSideSheetOpen
                ? 'translate-x-0'
                : 'translate-x-full'
            } transition-transform duration-300 ease-in-out z-50 overflow-auto`}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">
                {isInventorySideSheetOpen
                  ? 'Add Inventory Item'
                  : isTransactionSideSheetOpen
                  ? 'Add Transaction'
                  : ''}
              </h2>
              <button
                onClick={() => {
                  setInventorySideSheetOpen(false);
                  setTransactionSideSheetOpen(false);
                }}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>
            <div className="side-sheet-content p-4">
              {isInventorySideSheetOpen && <div>Inventory Form Content</div>}
              {isTransactionSideSheetOpen && <div>Transaction Form Content</div>}
            </div>
          </div>
        )}

        {/* Bottom Navigation - mobile only */}
        {isMobile && (
          <BottomNavigation
            activeItemId={getActiveItemId(location.pathname)}
            onNavigate={handleNavigate}
            onFabClick={() => {
              // Open inventory side sheet by default
              setInventorySideSheetOpen(true);
            }}
          />
        )}
      </div>
    </SideSheetContext.Provider>
  );
}