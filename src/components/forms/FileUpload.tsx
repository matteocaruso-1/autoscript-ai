// src/components/forms/FileUpload.tsx

import React, { useRef, useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';

interface FileUploadProps {
  accept?: string;
  value: File & { url?: string; timestamp?: string } | null;
  onChange: (file: File & { url?: string; timestamp?: string } | null) => void;
  placeholder?: string;
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  value,
  onChange,
  placeholder = 'Choose a file',
  error,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Updated max file size: 100 MB
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.size > MAX_FILE_SIZE) {
        alert('File size must be less than 100 MB');
        return;
      }
      const fileUrl = URL.createObjectURL(file);
      const augmentedFile = Object.assign(file, {
        url: fileUrl,
        timestamp: new Date().toISOString(),
      });
      onChange(augmentedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.size > MAX_FILE_SIZE) {
        alert('File size must be less than 100 MB');
        return;
      }
      if (accept) {
        const allowed = accept.split(',').map(a => a.trim());
        const ext = '.' + file.name.split('.').pop();
        const valid = allowed.some(a =>
          a.includes('/') ? file.type === a : a === ext
        );
        if (!valid) {
          alert('Invalid file type');
          return;
        }
      }
      const fileUrl = URL.createObjectURL(file);
      const augmentedFile = Object.assign(file, {
        url: fileUrl,
        timestamp: new Date().toISOString(),
      });
      onChange(augmentedFile);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value?.url) URL.revokeObjectURL(value.url);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const prettyFileSize = (size: number) => {
    if (size < 1024) return `${size} bytes`;
    if (size < 1024 ** 2) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 ** 3) return `${(size / 1024 ** 2).toFixed(1)} MB`;
    return `${(size / 1024 ** 3).toFixed(1)} GB`;
  };

  const triggerFileSelect = () => inputRef.current?.click();

  return (
    <div className="space-y-2">
      <div
        onClick={triggerFileSelect}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={[
          // darker, cleaner black panel
          'relative rounded-lg p-4 transition cursor-pointer bg-white/90 dark:bg-black/90 backdrop-blur-sm',
          // dashed border base
          'border border-dashed border-gray-200 dark:border-black/50',
          // conditional state overrides
          error
            ? 'border-red-600'
            : isDragging
            ? 'border-purple-500 bg-purple-900/20'
            : value
            ? 'border-green-500 bg-green-900/10'
            : 'hover:border-purple-400',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="sr-only"
        />

        {value ? (
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 bg-purple-900/30 p-2 rounded">
              <FileText size={24} className="text-purple-300" />
            </div>
            <div className="flex-grow overflow-hidden">
              <p className="text-sm font-medium text-white truncate">
                {value.name}
              </p>
              <p className="text-xs text-gray-400">
                {prettyFileSize(value.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="p-1 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300"
              title="Remove file"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <Upload className="mx-auto h-10 w-10 text-gray-500" />
            <p className="mt-2 text-sm font-medium text-white">
              {isDragging ? 'Drop your file here' : placeholder}
            </p>
            {accept && (
              <p className="mt-1 text-xs text-gray-400">
                Accepted: {accept} (max 100 MB)
              </p>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FileUpload;