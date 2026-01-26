import React, { useState, useEffect, useRef } from 'react';
import { Input } from './Input';

interface AutocompleteOption {
  id: string;
  name: string;
  title?: string;
  equipment_type?: string;
  city?: string;
  location?: string;
  [key: string]: any;
}

interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (option: AutocompleteOption | null) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  error?: string;
  equipmentType?: string;
}

export const Autocomplete: React.FC<AutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = 'Search...',
  label,
  required = false,
  className = '',
  disabled = false,
  error,
  equipmentType
}) => {
  const [options, setOptions] = useState<AutocompleteOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchOptions = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('search', searchTerm);
      // Always include equipment_type parameter, even if it's empty
      params.append('equipment_type', equipmentType || '');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/api/v1'}/equipment/my-equipment?${params.toString()}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const equipmentOptions = data.data?.data || data.data || [];
        setOptions(equipmentOptions);
      } else {
        setOptions([]);
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setHighlightedIndex(-1);
    
    if (newValue.trim()) {
      setIsOpen(true);
      fetchOptions(newValue);
    } else {
      setIsOpen(false);
      setOptions([]);
      onSelect(null);
    }
  };

  const handleOptionClick = (option: AutocompleteOption) => {
    const displayName = option.name || option.title || '';
    onChange(displayName);
    onSelect(option);
    setIsOpen(false);
    setOptions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < options.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && options[highlightedIndex]) {
          handleOptionClick(options[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const getEquipmentType = (option: AutocompleteOption) => {
    return option.equipment_type || option.equipmentTypeName || 'N/A';
  };

  const getLocation = (option: AutocompleteOption) => {
    return option.city || option.location || 'N/A';
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Input
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => value.trim() && setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        className={error ? 'border-red-500' : ''}
      />
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-black border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-300 bg-black">Loading...</div>
          ) : options.length > 0 ? (
            options.map((option, index) => {
              const displayName = option.name || option.title || '';
              const equipmentType = getEquipmentType(option);
              const location = getLocation(option);
              
              return (
                <div
                  key={option.id}
                  className={`px-4 py-3 cursor-pointer text-sm border-b border-gray-800 last:border-b-0 transition-colors ${
                    index === highlightedIndex 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-black text-gray-200 hover:bg-gray-900'
                  }`}
                  onClick={() => handleOptionClick(option)}
                >
                  <div className="font-medium text-white mb-1">{displayName}</div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {equipmentType}
                    </span>
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {location}
                    </span>
                  </div>
                </div>
              );
            })
          ) : value.trim() ? (
            <div className="px-4 py-3 text-sm text-gray-400 bg-black">No equipment found</div>
          ) : null}
        </div>
      )}
      
      {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
    </div>
  );
}; 