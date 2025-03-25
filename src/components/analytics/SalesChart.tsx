import React from 'react';
import { InventoryItem } from '../../types';

interface SalesChartProps {
  items: InventoryItem[];
}

export const SalesChart: React.FC<SalesChartProps> = ({ items }) => {
  // Group sales by month
  const salesByMonth = items.reduce((acc, item) => {
    if (item.sold_at) {
      const date = new Date(item.created_at);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          revenue: 0,
          profit: 0,
          count: 0
        };
      }
      
      acc[monthKey].revenue += item.sold_at;
      acc[monthKey].profit += item.sold_at - item.purchase_price - item.delivery_charges;
      acc[monthKey].count += 1;
    }
    return acc;
  }, {} as Record<string, { revenue: number; profit: number; count: number }>);

  // Convert to array and sort by date
  const monthlyData = Object.entries(salesByMonth)
    .map(([month, data]) => ({
      month,
      ...data
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Find max value for scaling
  const maxValue = Math.max(
    ...monthlyData.map(data => Math.max(data.revenue, data.profit))
  );

  return (
    <div className="h-[300px] relative">
      {/* Y-axis */}
      <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-gray-500">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center justify-end pr-2">
            ₹{((maxValue * (5 - i)) / 5).toFixed(0)}
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div className="absolute left-16 right-0 top-0 bottom-0">
        {/* Grid lines */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-t border-gray-100"
              style={{ top: `${(i * 100) / 5}%` }}
            />
          ))}
        </div>

        {/* Bars */}
        <div className="absolute inset-0 flex items-end">
          {monthlyData.map((data, i) => (
            <div
              key={data.month}
              className="flex-1 flex flex-col items-center gap-1"
            >
              {/* Revenue bar */}
              <div
                className="w-4 bg-blue-500 rounded-t transition-all duration-300"
                style={{
                  height: `${(data.revenue / maxValue) * 100}%`
                }}
              />
              
              {/* Profit bar */}
              <div
                className="w-4 bg-green-500 rounded-t transition-all duration-300"
                style={{
                  height: `${(data.profit / maxValue) * 100}%`
                }}
              />
              
              {/* Month label */}
              <div className="text-xs text-gray-500 -rotate-45 origin-top-left mt-2">
                {new Date(data.month).toLocaleDateString('en-US', {
                  month: 'short',
                  year: '2-digit'
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-0 right-0 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded" />
          <span className="text-xs text-gray-500">Revenue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span className="text-xs text-gray-500">Profit</span>
        </div>
      </div>
    </div>
  );
};