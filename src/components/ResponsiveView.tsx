import React, { useState, useEffect } from 'react';

interface ResponsiveViewProps {
  tableView: React.ReactNode;
  cardView: React.ReactNode;
}

/**
 * A component that switches between table and card views based on screen size
 * @param tableView The table view component to render on larger screens
 * @param cardView The card view component to render on smaller screens
 */
export function ResponsiveView({ tableView, cardView }: ResponsiveViewProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? cardView : tableView;
}

interface StatusProps {
  label: string;
  color: string;
}

interface DetailProps {
  label: string;
  value: string | number;
}

interface DataCardProps {
  title: string;
  subtitle?: string;
  image?: string;
  status?: {
    label: string;
    color: string;
  };
  details: Array<{
    label: string;
    value: string | number;
  }>;
  actions?: React.ReactNode;
}

/**
 * Card component for mobile views
 */
export function DataCard({ title, subtitle, image, status, details, actions }: DataCardProps) {
  return (
    <div className="bg-white rounded-lg shadow mb-4 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          {/* Title and subtitle */}
          <div className="flex-1">
            <div className="flex items-center">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              {status && (
                <span 
                  className="ml-2 px-2 py-1 rounded-full text-xs" 
                  style={{ 
                    backgroundColor: `${status.color}20`,
                    color: status.color
                  }}
                >
                  {status.label}
                </span>
              )}
            </div>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          
          {/* Image (if provided) */}
          {image && (
            <div className="ml-4">
              <img 
                src={image} 
                alt={title} 
                className="h-16 w-16 object-cover rounded-md"
              />
            </div>
          )}
        </div>
        
        {/* Details */}
        <div className="mt-4 border-t border-gray-100 pt-4">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            {details.map((detail, index) => (
              <div key={index} className={index % 2 === 0 ? "col-span-1" : "col-span-1"}>
                <dt className="text-xs text-gray-500">{detail.label}</dt>
                <dd className="text-sm font-medium text-gray-900">{detail.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        
        {/* Actions */}
        {actions && (
          <div className="mt-4 border-t border-gray-100 pt-3 flex justify-end">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
} 