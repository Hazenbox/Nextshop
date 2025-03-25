import React from 'react';
import { X, Copy, Edit2, Eye, Link } from 'lucide-react';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  editKey: string;
  onCopyUrl: (type: 'edit' | 'view') => void;
}

export function ShareDialog({ isOpen, onClose, onCopyUrl }: ShareDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Share Board</h2>
        <div className="space-y-4">
          <button
            onClick={() => onCopyUrl('view')}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
          >
            Copy View Link
          </button>
          <button
            onClick={() => onCopyUrl('edit')}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
          >
            Copy Edit Link
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}