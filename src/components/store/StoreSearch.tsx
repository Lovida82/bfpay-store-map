import { useState, useCallback } from 'react';
import { useStoreStore } from '@/stores';
import { Input } from '@/components/common';
import { debounce } from '@/utils/helpers';

interface StoreSearchProps {
  onSearchChange?: () => void;
}

export function StoreSearch({ onSearchChange }: StoreSearchProps) {
  const { searchQuery, setSearchQuery } = useStoreStore();
  const [inputValue, setInputValue] = useState(searchQuery);

  const debouncedSetSearchQuery = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
      onSearchChange?.();
    }, 300),
    [setSearchQuery, onSearchChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSetSearchQuery(value);
  };

  const handleClear = () => {
    setInputValue('');
    setSearchQuery('');
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <Input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="가게명 또는 주소로 검색"
        className="pl-10 pr-10"
      />

      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
