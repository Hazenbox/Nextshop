import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, IndianRupee, BarChart2, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/inventory', icon: Package, label: 'Inventory' },
    { path: '/transactions', icon: IndianRupee, label: 'Transactions' },
    { path: '/analytics', icon: BarChart2, label: 'Analytics' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-30 hidden lg:block ${
        isCollapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {!isCollapsed && <h1 className="text-xl font-bold">NextShop</h1>}
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        <nav className="flex-1 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2 my-1 text-gray-700 hover:bg-gray-100 ${
                  isActive ? 'bg-gray-100' : ''
                }`}
              >
                <Icon className="h-5 w-5" />
                {!isCollapsed && (
                  <span className="ml-3">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}