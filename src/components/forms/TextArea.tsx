// src/components/forms/TextArea.tsx

import React, { useState, useEffect } from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  showCharCount?: boolean;
  minLength?: number;
}

const TextArea: React.FC<TextAreaProps> = ({
  id,
  label,
  error,
  value = '',
  onChange,
  placeholder,
  showCharCount = false,
  minLength = 0,
  className = '',
  ...rest
}) => {
  const [charCount, setCharCount] = useState(value.toString().length);

  useEffect(() => {
    setCharCount(value.toString().length);
  }, [value]);

  const meetsMin = minLength === 0 || charCount >= minLength;

  return (
    <div className="space-y-1 bg-[#000000] rounded-2xl border border-gray-800 shadow-[0_0_10px_rgba(0,0,0,0.5)] p-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
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
      {showCharCount && (
        <div className="flex justify-end">
          <span
            className={[
              'text-xs',
              meetsMin ? 'text-green-400' : 'text-amber-400',
            ].join(' ')}
          >
            {charCount}
            {minLength > 0 && ` / ${minLength}`}
          </span>
        </div>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default TextArea;