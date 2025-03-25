import React from 'react';
import { Share2, ArrowLeft, Search, Download, Plus, Menu, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onShare?: () => void;
  onInventory?: () => void;
  showBackButton?: boolean;
  onToggleSidebar?: () => void;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  selectedStatus?: string;
  onStatusChange?: (value: string) => void;
  onAddItem?: () => void;
  onExport?: () => void;
  itemCount?: number;
}

export function Header({
  onToggleSidebar,
  searchTerm,
  onSearchChange
}: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-20 lg:pl-56">
      <div className="flex items-center h-full px-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="flex-1 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </header>
  );
}