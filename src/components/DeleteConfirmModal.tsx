import React from 'react';
import { X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="md-dialog-backdrop">
      <div className="md-dialog">
        <div className="md-dialog-header">
          <h2 className="md-headline-small">{title}</h2>
          <button 
            onClick={onClose}
            className="md-icon-button md-state-layer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="md-dialog-content">
          <p className="md-body-medium">{message}</p>
        </div>
        
        <div className="md-dialog-footer">
          <button
            onClick={onClose}
            className="md-button md-button-text md-state-layer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="md-button md-button-filled md-state-layer"
            style={{ backgroundColor: 'var(--md-error)', color: 'var(--md-on-error)' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}