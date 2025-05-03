import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSave?: () => void;
  showSave?: boolean;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  onSave,
  showSave = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-white/50 dark:bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-4xl mx-4 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-2xl shadow-[0_0_30px_rgba(128,90,213,0.4)] border border-gray-200 dark:border-black/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-black/50">
          <h3
            className="text-2xl font-semibold bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(90deg, #374151 0%, #A78BFA 50%, #6B21A8 100%)',
            }}
          >
            {title}
          </h3>
          <div className="flex items-center gap-4">
            {showSave && (
              <button
                onClick={onSave}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg transition duration-200 shadow-[0_0_12px_rgba(128,90,213,0.5)] hover:shadow-[0_0_16px_rgba(128,90,213,0.8)]"
              >
                Save Changes
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar text-gray-800 dark:text-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;