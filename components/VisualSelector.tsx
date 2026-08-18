import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { VisualOption } from '../types';

type VisualSelectorProps =
  | {
      label: string;
      value: string;
      onChange: (value: string) => void;
      options: VisualOption[];
      placeholder?: string;
      previewRatio?: string;
      multiSelect?: false;
    }
  | {
      label: string;
      value: string[];
      onChange: (value: string[]) => void;
      options: VisualOption[];
      placeholder?: string;
      previewRatio?: string;
      multiSelect: true;
    };

export const VisualSelector: React.FC<VisualSelectorProps> = ({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder = "Select style...",
  previewRatio = "aspect-video", // Default 16:9
  multiSelect = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const isMultiSelect = multiSelect === true;
  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
  const selectedOptions = options.filter(o => selectedValues.includes(o.value));
  const primaryOption = selectedOptions[0];
  const hasSelection = selectedValues.length > 0;
  const selectionLabel = (() => {
    if (!hasSelection) return placeholder;
    if (!isMultiSelect) return selectedOptions[0]?.label || selectedValues[0];
    const labels = selectedOptions.map(opt => opt.label);
    if (labels.length <= 2) return labels.join(", ");
    return `${labels.slice(0, 2).join(", ")} +${labels.length - 2}`;
  })();

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.dataset.fallbackUsed === "true") return;
    img.dataset.fallbackUsed = "true";
    img.src = img.src.replace(/\.jpg(\?.*)?$/i, '.png$1');
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-wider text-accent2">{label}</label>
      
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="group relative w-full text-left"
      >
        <div className={`
          w-full border-b-2 bg-surface px-4 py-3 text-sm font-medium text-ink transition-colors 
          hover:bg-surface2 flex items-center justify-between
          ${hasSelection ? 'border-accent' : 'border-line'}
        `}>
          <span className={`${hasSelection ? 'text-ink' : 'text-dim'} block truncate`}>
            {selectionLabel}
          </span>
          {primaryOption && (
            <div className="flex items-center gap-2">
              <img 
                src={primaryOption.image} 
                alt={primaryOption.label} 
                onError={handleImageError}
                className="w-8 h-8 object-cover rounded-sm border border-line"
              />
              {isMultiSelect && selectedOptions.length > 1 && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-dim">
                  {selectedOptions.length} selected
                </span>
              )}
            </div>
          )}
        </div>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-base/90 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-5xl h-full max-h-[85vh] bg-base border border-line rounded-card shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-line bg-surface/50">
              <div className="flex flex-col">
                <h3 className="text-xl font-black uppercase tracking-wider text-ink">Select {label}</h3>
                <p className="text-xs text-dim font-mono mt-1">// {options.length} OPTIONS AVAILABLE</p>
              </div>
              <div className="flex items-center gap-3">
                {hasSelection && (
                  <button
                    onClick={() => {
                      if (isMultiSelect) {
                        (onChange as (value: string[]) => void)([]);
                      } else {
                        (onChange as (value: string) => void)("");
                      }
                      setSearch("");
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 border border-line text-[10px] font-bold uppercase tracking-widest text-ink hover:text-ink hover:border-dim transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Clear Selection
                  </button>
                )}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-surface2 rounded-full transition-colors text-dim hover:text-ink"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-line bg-base sticky top-0 z-10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dim" />
                <input 
                  type="text" 
                  placeholder="Filter options..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  className="w-full bg-surface border border-line rounded-none pl-10 pr-4 py-3 text-sm text-ink focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            {/* Grid Content */}
            {/* Added extra padding (p-10 md:p-14) to ensure scaled items (1.75x) have room to expand without being clipped by the overflow container */}
            <div className="flex-1 overflow-y-auto p-10 md:p-14 custom-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredOptions.map((opt) => {
                  const isSelected = selectedValues.includes(opt.value);
                  return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      if (isMultiSelect) {
                        const nextSelection = isSelected
                          ? selectedValues.filter(val => val !== opt.value)
                          : [...selectedValues, opt.value];
                        (onChange as (value: string[]) => void)(nextSelection);
                        return;
                      }
                      if (selectedValues[0] === opt.value) {
                        (onChange as (value: string) => void)(""); // Deselect if clicking the same option
                      } else {
                        (onChange as (value: string) => void)(opt.value);
                      }
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`
                      group relative w-full text-left transition-all duration-300 ease-out
                      ${previewRatio}
                      hover:scale-[1.75] hover:z-50 hover:shadow-2xl
                      border-2 
                      ${isSelected ? 'border-accent ring-1 ring-accent z-10' : 'border-line hover:border-dim'}
                    `}
                  >
                    <div className="absolute inset-0 overflow-hidden bg-base">
                        <img 
                          src={opt.image} 
                          alt={opt.label}
                          onError={handleImageError}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-70 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-40 transition-opacity" />
                        
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <span className={`
                            text-xs font-bold uppercase tracking-wider block truncate
                            ${isSelected ? 'text-accent' : 'text-white group-hover:text-white'}
                            drop-shadow-md
                          `}>
                            {opt.label}
                          </span>
                        </div>

                        {isSelected && (
                           <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_rgb(var(--accent)_/_0.5)]" />
                        )}
                    </div>
                  </button>
                );
                })}

                {filteredOptions.length === 0 && (
                  <div className="col-span-full py-12 text-center text-dim">
                    <p>No matches found for "{search}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
