import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  onAddNew?: () => void;
  className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select option",
  onAddNew,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full h-7 px-2 text-xs border-transparent hover:border-gray-200 rounded 
          focus:border-primary-500 focus:ring-1 focus:ring-primary-500
          bg-white text-left relative
          ${className}
        `}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {value || placeholder}
        </span>
        <ChevronDown 
          className={`absolute right-1 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`
                w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50
                ${value === option ? 'bg-primary-50 text-primary-600' : 'text-gray-900'}
              `}
            >
              {option}
            </button>
          ))}
          {onAddNew && (
            <button
              type="button"
              onClick={() => {
                onAddNew();
                setIsOpen(false);
              }}
              className="w-full px-3 py-1.5 text-left text-xs text-primary-600 font-medium hover:bg-gray-50 flex items-center gap-1.5"
            >
              <Plus className="h-3 w-3" />
              Add New
            </button>
          )}
        </div>
      )}
    </div>
  );
};