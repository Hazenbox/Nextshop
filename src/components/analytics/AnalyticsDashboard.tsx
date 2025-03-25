import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  ShoppingBag,
  Users
} from 'lucide-react';
import { InventoryItem } from '../../types';
import { SalesChart } from './SalesChart';
import { InventoryChart } from './InventoryChart';

interface AnalyticsDashboardProps {
  items: InventoryItem[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ items }) => {
  // Calculate metrics
  const totalRevenue = items.reduce((sum, item) => sum + (item.sold_at || 0), 0);
  const totalCost = items.reduce((sum, item) => sum + item.purchase_price, 0);
  const totalProfit = items.reduce((sum, item) => 
    sum + ((item.sold_at || 0) - item.purchase_price - item.delivery_charges), 0
  );
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const soldItems = items.filter(item => item.sale_status === 'sold');
  const pendingItems = items.filter(item => item.sale_status === 'pending');
  const availableItems = items.filter(item => item.sale_status === 'available');

  const uniqueCustomers = new Set(
    items
      .filter(item => item.customer_name)
      .map(item => item.customer_name)
  ).size;

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">₹{totalRevenue.toFixed(2)}</p>
            </div>
            <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-600 ml-1">+12.5%</span>
            <span className="text-sm text-gray-500 ml-2">from last month</span>
          </div>
        </div>

        {/* Profit Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Profit</p>
              <p className="text-2xl font-semibold text-gray-900">₹{totalProfit.toFixed(2)}</p>
            </div>
            <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm font-medium text-gray-600">Margin:</span>
            <span className="text-sm font-medium text-green-600 ml-1">{profitMargin.toFixed(1)}%</span>
          </div>
        </div>

        {/* Inventory Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-semibold text-gray-900">{items.length}</p>
            </div>
            <div className="h-12 w-12 bg-purple-50 rounded-full flex items-center justify-center">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-gray-500">Available</p>
              <p className="font-medium text-gray-900">{availableItems.length}</p>
            </div>
            <div>
              <p className="text-gray-500">Pending</p>
              <p className="font-medium text-gray-900">{pendingItems.length}</p>
            </div>
            <div>
              <p className="text-gray-500">Sold</p>
              <p className="font-medium text-gray-900">{soldItems.length}</p>
            </div>
          </div>
        </div>

        {/* Customers Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Customers</p>
              <p className="text-2xl font-semibold text-gray-900">{uniqueCustomers}</p>
            </div>
            <div className="h-12 w-12 bg-pink-50 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-pink-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-600 ml-1">+5.2%</span>
            <span className="text-sm text-gray-500 ml-2">new customers</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Overview</h3>
          <SalesChart items={items} />
        </div>

        {/* Inventory Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Status</h3>
          <InventoryChart items={items} />
        </div>
      </div>
    </div>
  );
};