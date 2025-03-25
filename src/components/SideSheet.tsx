import React, { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface SideSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  variant?: 'modal' | 'standard';
  position?: 'left' | 'right';
  width?: string;
}

export function SideSheet({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  variant = 'standard',
  position = 'right',
  width = '400px'
}: SideSheetProps) {
  // Prevent body scrolling when side sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Scrim (background overlay) for modal variant */}
      {variant === 'modal' && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 1000,
          }} 
          onClick={onClose}
        />
      )}
      
      {/* Side Sheet */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          [position]: 0,
          bottom: 0,
          width,
          backgroundColor: 'var(--md-surface)',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : `translateX(${position === 'right' ? '100%' : '-100%'})`,
          transition: 'transform 0.3s ease',
          borderRadius: position === 'right' ? '12px 0 0 12px' : '0 12px 12px 0',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid var(--md-outline-variant)',
          }}
        >
          <h2 style={{ 
            margin: 0, 
            fontSize: '22px', 
            fontWeight: '500',
            color: 'var(--md-on-surface)'
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--md-on-surface-variant)',
              position: 'relative',
            }}
          >
            <X size={24} />
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '50%',
              backgroundColor: 'currentColor',
              opacity: 0,
              transition: 'opacity 0.2s ease',
              pointerEvents: 'none',
            }} />
          </button>
        </div>
        
        {/* Content */}
        <div
          style={{
            padding: '24px',
            flex: 1,
            overflowY: 'auto',
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
} 