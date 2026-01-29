'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchableSelectOption {
  value: string;
  label: string;
  labelAr?: string;
  description?: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
  onBlur?: () => void;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  disabled = false,
  className,
  error = false,
  onBlur,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Find selected option
  const selectedOption = options.find((opt) => opt.value === value);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(term) ||
        opt.labelAr?.includes(searchTerm) ||
        opt.description?.toLowerCase().includes(term)
    );
  }, [options, searchTerm]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        onBlur?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onBlur]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
      setHighlightedIndex(-1);
    }
  };

  const handleSelect = (option: SearchableSelectOption) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        break;
    }
  };

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 text-sm rounded-md border transition-colors',
          'bg-gray-800 border-gray-700 text-white',
          'hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FFCC00] focus:ring-offset-0',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500',
          isOpen && 'ring-2 ring-[#FFCC00]'
        )}
      >
        <span className={cn(!selectedOption && 'text-gray-400')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && !disabled && (
            <X
              className="h-4 w-4 text-gray-400 hover:text-white cursor-pointer"
              onClick={handleClear}
            />
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 text-gray-400 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-900 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#FFCC00] focus:border-[#FFCC00]"
              />
            </div>
          </div>

          {/* Options List */}
          <div ref={listRef} className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">
                No options found
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    'flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors',
                    index === highlightedIndex
                      ? 'bg-gray-700'
                      : 'hover:bg-gray-700/50',
                    option.value === value && 'bg-[#FFCC00]/10'
                  )}
                >
                  <div className="flex flex-col">
                    <span
                      className={cn(
                        'text-sm',
                        option.value === value
                          ? 'text-[#FFCC00] font-medium'
                          : 'text-white'
                      )}
                    >
                      {option.label}
                    </span>
                    {option.labelAr && (
                      <span className="text-xs text-gray-400 font-cairo" dir="rtl">
                        {option.labelAr}
                      </span>
                    )}
                    {option.description && (
                      <span className="text-xs text-gray-500">
                        {option.description}
                      </span>
                    )}
                  </div>
                  {option.value === value && (
                    <Check className="h-4 w-4 text-[#FFCC00]" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
