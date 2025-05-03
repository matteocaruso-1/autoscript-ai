// src/components/forms/TagInput.tsx

import React, { useState, useRef, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

interface TagInputProps {
  label?: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  error?: string;
}

const TagInput: React.FC<TagInputProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Add a tag…',
  suggestions = [],
  error,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredSuggestions(suggestions);
    } else {
      setFilteredSuggestions(
        suggestions.filter(s =>
          s.toLowerCase().includes(inputValue.toLowerCase())
        )
      );
    }
  }, [inputValue, suggestions]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        suggRef.current &&
        !suggRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const addTag = (tag?: string) => {
    const newTag = (tag ?? inputValue).trim();
    if (newTag && !value.includes(newTag)) {
      onChange([...value, newTag]);
    }
    setInputValue('');
    inputRef.current?.focus();
    setShowSuggestions(false);
  };

  const removeTag = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !inputValue && value.length) {
      removeTag(value.length - 1);
    }
  };

  return (
    <div className="relative space-y-2 bg-[#000000] rounded-2xl border border-gray-800 shadow-[0_0_10px_rgba(0,0,0,0.5)] p-4">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div
        onClick={() => inputRef.current?.focus()}
        className={[
          'flex flex-wrap items-center gap-2 p-3 rounded-lg bg-[#000000] transition',
          error
            ? 'border-2 border-red-600'
            : 'border border-gray-700 focus-within:ring-2 focus-within:ring-purple-500',
        ].join(' ')}
      >
        {value.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 bg-gray-800 text-white text-sm px-3 py-1 rounded-full shadow"
          >
            {tag}
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                removeTag(i);
              }}
              className="hover:bg-gray-700 rounded-full p-1"
            >
              <X size={14} className="text-gray-400" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder-gray-500 p-1"
        />
      </div>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggRef}
          className="absolute z-10 mt-1 w-full bg-[#1A1A1A] border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-auto"
        >
          {filteredSuggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => addTag(s)}
              className="flex items-center w-full px-4 py-2 hover:bg-gray-800 transition text-white"
            >
              <Plus size={16} className="mr-2 text-purple-400" />
              {s}
            </button>
          ))}
        </div>
      )}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default TagInput;