import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';

interface DropdownProps<T extends string> {
  options: T[];
  value?: T;
  onChange: (value: T) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function Dropdown<T extends string>({
  options,
  value,
  onChange,
  placeholder = '선택하세요',
  label,
  className,
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={clsx('relative', className)} ref={dropdownRef}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'flex items-center justify-between'
        )}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>{value || placeholder}</span>
        <svg
          className={clsx('w-5 h-5 text-gray-400 transition-transform', isOpen && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={clsx(
                'w-full px-4 py-2 text-left hover:bg-gray-100',
                value === option && 'bg-primary-50 text-primary-700'
              )}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
