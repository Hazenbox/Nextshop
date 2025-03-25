import React, { useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';

interface NotificationProps {
  show: boolean;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export function Notification({ show, message, type, onClose, duration = 5000 }: NotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div className="md-snackbar-container">
      <div 
        className="md-snackbar"
        style={{
          backgroundColor: type === 'success' ? 'var(--md-tertiary-container)' : 'var(--md-error-container)',
          color: type === 'success' ? 'var(--md-on-tertiary-container)' : 'var(--md-on-error-container)'
        }}
      >
        <div className="md-snackbar-icon">
          {type === 'success' ? (
            <div style={{ 
              padding: '4px', 
              backgroundColor: 'var(--md-tertiary)', 
              borderRadius: '50%', 
              display: 'flex' 
            }}>
              <Check size={16} color="var(--md-on-tertiary)" />
            </div>
          ) : (
            <div style={{ 
              padding: '4px', 
              backgroundColor: 'var(--md-error)', 
              borderRadius: '50%', 
              display: 'flex' 
            }}>
              <AlertCircle size={16} color="var(--md-on-error)" />
            </div>
          )}
        </div>
        
        <div className="md-snackbar-message">
          {message}
        </div>
        
        <button 
          onClick={onClose}
          className="md-icon-button md-snackbar-action md-state-layer"
          style={{ width: '28px', height: '28px' }}
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}