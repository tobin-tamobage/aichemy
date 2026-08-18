import React from 'react';
import { X } from 'lucide-react';

interface SelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  disabledReason?: string;
  /** Individual options to show but render as disabled/grayed out */
  disabledOptions?: string[];
}

export const Selector: React.FC<SelectorProps> = ({ label, value, onChange, options, placeholder = "Select...", disabled = false, disabledReason, disabledOptions = [] }) => {
  return (
    <div className={`flex flex-col gap-2${disabled ? ' opacity-50 cursor-not-allowed' : ''}`} title={disabled ? disabledReason : undefined}>
      <label className={`text-xs font-bold uppercase tracking-wider ${disabled ? 'text-zinc-600' : 'text-yellow-500'}`}>{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full appearance-none rounded-none border-b-2 border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-medium transition-colors focus:outline-none ${
            disabled ? 'text-zinc-600 cursor-not-allowed' : 'text-white focus:border-yellow-500 hover:bg-zinc-800'
          }`}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt} disabled={disabledOptions.includes(opt)}>
              {opt}{disabledOptions.includes(opt) ? ' (N/A)' : ''}
            </option>
          ))}
        </select>

        {value && !disabled && (
            <button
                onClick={() => onChange("")}
                className="absolute inset-y-0 right-8 flex items-center px-2 text-zinc-500 hover:text-white transition-colors"
                title="Clear selection"
            >
                <X className="w-4 h-4" />
            </button>
        )}

        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
