import React from 'react';
import { InventoryItem } from '../../types';

interface InventoryChartProps {
  items: InventoryItem[];
}

export const InventoryChart: React.FC<InventoryChartProps> = ({ items }) => {
  // Calculate status counts
  const statusCounts = items.reduce((acc, item) => {
    acc[item.sale_status] = (acc[item.sale_status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = items.length;
  const data = [
    { label: 'Available', value: statusCounts.available || 0, color: 'bg-blue-500' },
    { label: 'Pending', value: statusCounts.pending || 0, color: 'bg-yellow-500' },
    { label: 'Sold', value: statusCounts.sold || 0, color: 'bg-green-500' }
  ];

  return (
    <div className="h-[300px] flex items-center justify-center">
      <div className="relative w-48 h-48">
        {/* Donut segments */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {data.reduce((acc, item, i) => {
            const percentage = (item.value / total) * 100;
            const previousPercentage = acc.previousPercentage;
            
            // Calculate the SVG arc
            const x1 = 50 + 40 * Math.cos(2 * Math.PI * previousPercentage / 100);
            const y1 = 50 + 40 * Math.sin(2 * Math.PI * previousPercentage / 100);
            const x2 = 50 + 40 * Math.cos(2 * Math.PI * (previousPercentage + percentage) / 100);
            const y2 = 50 + 40 * Math.sin(2 * Math.PI * (previousPercentage + percentage) / 100);
            
            const largeArcFlag = percentage > 50 ? 1 : 0;
            
            acc.elements.push(
              <path
                key={item.label}
                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                className={item.color}
              />
            );
            
            acc.previousPercentage += percentage;
            return acc;
          }, { elements: [], previousPercentage: 0 } as { elements: JSX.Element[], previousPercentage: number }).elements}
          
          {/* Inner circle for donut effect */}
          <circle cx="50" cy="50" r="25" className="fill-white" />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-gray-900">{total}</span>
          <span className="text-sm text-gray-500">Total Items</span>
        </div>
      </div>

      {/* Legend */}
      <div className="ml-8 space-y-2">
        {data.map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${item.color}`} />
            <span className="text-sm text-gray-600">{item.label}</span>
            <span className="text-sm font-medium text-gray-900">
              {item.value} ({((item.value / total) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};