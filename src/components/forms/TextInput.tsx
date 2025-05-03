// src/components/forms/TextInput.tsx

import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  id,
  label,
  error,
  value,
  onChange,
  className = '',
  type = 'text',
  ...rest
}) => {
  return (
    <div className="space-y-1 bg-[#000000] rounded-2xl border border-gray-800 shadow-[0_0_10px_rgba(0,0,0,0.5)] p-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className={[
          'w-full px-4 py-2 rounded-lg bg-[#000000] text-white placeholder-gray-500',
          'border',
          error
            ? 'border-red-600 focus:ring-red-600'
            : 'border-gray-700 focus:ring-purple-500',
          'focus:outline-none focus:border-transparent focus:ring-2',
          'transition-colors duration-200',
          className,
        ].join(' ')}
        {...rest}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default TextInput;