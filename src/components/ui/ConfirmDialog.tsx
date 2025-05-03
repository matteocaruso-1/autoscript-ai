// src/components/ui/ConfirmDialog.tsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog Panel */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-black/80 backdrop-blur-sm rounded-2xl shadow-[0_0_30px_rgba(229,46,77,0.5)] border border-black/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-black/50">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <h3
            className="text-2xl font-semibold bg-clip-text text-transparent"
            style={{
              backgroundImage:
                'linear-gradient(90deg, #F87171 0%, #EF4444 50%, #DC2626 100%)',
            }}
          >
            {title}
          </h3>
        </div>

        {/* Message */}
        <div className="p-6 text-gray-300">
          <p>{message}</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 p-6 border-t border-black/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-pink-500 rounded-lg transition duration-200 shadow-[0_0_12px_rgba(229,46,77,0.7)] hover:shadow-[0_0_16px_rgba(229,46,77,1)]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;