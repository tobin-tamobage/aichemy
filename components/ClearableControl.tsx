/**
 * ClearableControl - Wrapper that adds a clear button to any form control
 */

import React from 'react';
import { X } from 'lucide-react';

interface ClearableControlProps {
  value: any;
  onClear: () => void;
  children: React.ReactNode;
}

export const ClearableControl: React.FC<ClearableControlProps> = ({ value, onClear, children }) => {
  const hasValue = Array.isArray(value) ? value.length > 0 : !!value;

  if (!children) return null;

  return (
    <div className="relative block">
      {children}
      {hasValue && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="absolute right-3 top-[2.25rem] text-zinc-500 hover:text-white transition-colors bg-zinc-900/90 hover:bg-zinc-700 rounded-sm p-1 z-10"
          title="Clear selection"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
