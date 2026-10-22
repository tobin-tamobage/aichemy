import React, { useEffect, useRef, useState } from 'react';
import { Check, Search, X } from 'lucide-react';

/** Minimal option shape — `image` may be undefined → placeholder tile. */
export interface VisualSelectorOption {
  label: string;
  value: string;
  image?: string;
}

const getInitials = (label: string): string => {
  const words = label.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

type VisualSelectorProps =
  | {
      label: string;
      value: string;
      onChange: (value: string) => void;
      options: VisualSelectorOption[];
      placeholder?: string;
      previewRatio?: string;
      multiSelect?: false;
    }
  | {
      label: string;
      value: string[];
      onChange: (value: string[]) => void;
      options: VisualSelectorOption[];
      placeholder?: string;
      previewRatio?: string;
      multiSelect: true;
    };

const getFocusableDialogControls = (dialog: HTMLElement): HTMLElement[] =>
  Array.from(dialog.querySelectorAll<HTMLElement>(
    'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])'
  )).filter(control =>
    control.getClientRects().length > 0 && getComputedStyle(control).visibility !== 'hidden'
  );


export const VisualSelector: React.FC<VisualSelectorProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select style...",
  previewRatio = "aspect-video", // Default 16:9
  multiSelect = false
}) => {
  // Fallback inline aspect-ratio for cases where Tailwind purge misses arbitrary classes (e.g. aspect-[3/4]).
  const aspectRatioStyle = (() => {
    const m = previewRatio.match(/aspect-\[(\d+)\/(\d+)\]/);
    if (m) return `${m[1]} / ${m[2]}`;
    if (previewRatio === 'aspect-video') return '16 / 9';
    if (previewRatio === 'aspect-square') return '1 / 1';
    return undefined;
  })();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  // Placeholder mode: image failed to load (or was never provided) per option value.
  const [imgFailed, setImgFailed] = useState<Record<string, boolean>>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

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

  // Local filter only — narrows the visible catalog, never touches selection.
  const q = query.trim().toLowerCase();
  const visibleOptions = q
    ? options.filter(o => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q))
    : options;
  // Search is worth its chrome only for catalogs too big to scan at a glance.
  const showSearch = options.length > 8;

  const hasImage = (opt: VisualSelectorOption): boolean => !!opt.image && !imgFailed[opt.value];

  const handleImageError = (opt: VisualSelectorOption) => {
    setImgFailed(prev => (prev[opt.value] ? prev : { ...prev, [opt.value]: true }));
  };

  const openPicker = () => {
    setQuery('');
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (showSearch && searchRef.current) {
      searchRef.current.focus();
    } else {
      (getFocusableDialogControls(dialog)[0] ?? dialog).focus();
    }
  }, [isOpen, showSearch]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (e.key !== 'Tab') return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const controls = getFocusableDialogControls(dialog);
      if (controls.length === 0) {
        e.preventDefault();
        dialog.focus();
        return;
      }

      const activeIndex = controls.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && (activeIndex === 0 || activeIndex === -1)) {
        e.preventDefault();
        controls[controls.length - 1].focus();
      } else if (!e.shiftKey && (activeIndex === controls.length - 1 || activeIndex === -1)) {
        e.preventDefault();
        controls[0].focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  return (
    <div className="flex flex-col gap-2">
      <span className="ui-field-label">{label}</span>

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={openPicker}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="group relative w-full text-left"
      >
        <div className={`ui-field flex items-center justify-between ${hasSelection ? 'border-accent' : ''}`}>
          <span className={`${hasSelection ? 'text-ink' : 'text-dim'} block truncate`}>
            {selectionLabel}
          </span>
          {primaryOption && (
            <div className="flex items-center gap-2">
              {hasImage(primaryOption) ? (
                <img
                  src={primaryOption.image}
                  alt={primaryOption.label}
                  onError={() => handleImageError(primaryOption)}
                  className="w-8 h-8 object-cover rounded-sm border border-line"
                />
              ) : (
                <span className="w-8 h-8 flex items-center justify-center bg-surface2 border border-line rounded-sm text-[10px] font-black tracking-wider text-dim">
                  {getInitials(primaryOption.label)}
                </span>
              )}
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
            className="absolute inset-0 bg-base/90"
            onClick={close}
          />

          {/* Modal Content */}
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Select ${label}`}
            tabIndex={-1}
            className="relative w-full max-w-5xl h-full max-h-[85vh] bg-base border border-line rounded-card shadow-2xl flex flex-col"
          >

            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-line bg-surface/50">
              <div className="flex flex-col">
                <h3 className="text-xl font-black uppercase tracking-wider text-ink">Select {label}</h3>
                <p className="text-xs text-dim font-mono mt-1">
                  // {q ? `${visibleOptions.length} OF ${options.length} MATCH` : `${options.length} OPTIONS AVAILABLE`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {hasSelection && (
                  <button
                    type="button"
                    onClick={() => {
                      if (isMultiSelect) {
                        (onChange as (value: string[]) => void)([]);
                      } else {
                        (onChange as (value: string) => void)("");
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 border border-line text-[10px] font-bold uppercase tracking-widest text-ink hover:text-ink hover:border-dim transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Clear Selection
                  </button>
                )}
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close dialog"
                  className="p-2 hover:bg-surface2 rounded-full transition-colors text-dim hover:text-ink"
                >
                  <X className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Local filter — visible catalogs skip the search chrome */}
            {showSearch && (
              <div className="px-4 sm:px-6 py-3 border-b border-line">
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dim pointer-events-none" aria-hidden="true" />
                  <input
                    ref={searchRef}
                    type="search"
                    role="searchbox"
                    aria-label={`Filter ${label} options`}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder={`Filter ${options.length} options…`}
                    className="w-full bg-surface border border-line pl-9 pr-3 py-2 text-sm text-ink placeholder:text-dim focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Contact-sheet grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {visibleOptions.map((opt) => {
                  const isSelected = selectedValues.includes(opt.value);
                  const showImage = hasImage(opt);
                  return (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={isSelected}
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
                      close();
                    }}
                    style={aspectRatioStyle ? { aspectRatio: aspectRatioStyle } : undefined}
                    className={`
                      group relative w-full text-left transition-colors
                      ${previewRatio}
                      border
                      ${isSelected ? 'border-accent' : 'border-line hover:border-dim'}
                    `}
                  >
                    <div className="absolute inset-0 overflow-hidden bg-base">
                        {showImage ? (
                          <>
                            <img
                              src={opt.image}
                              alt={opt.label}
                              onError={() => handleImageError(opt)}
                              className="w-full h-full object-cover opacity-90"
                            />
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <span className={`
                                text-xs font-bold uppercase tracking-wider block truncate
                                ${isSelected ? 'text-accent' : 'text-white'}
                                drop-shadow-md
                              `}>
                                {opt.label}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 bg-surface2 flex flex-col items-center justify-center gap-2 p-3">
                            <span className="text-3xl font-black tracking-wider text-dim">
                              {getInitials(opt.label)}
                            </span>
                            <span className={`
                              text-xs font-bold uppercase tracking-wider text-center leading-tight
                              ${isSelected ? 'text-accent' : 'text-dim group-hover:text-ink'}
                            `}>
                              {opt.label}
                            </span>
                          </div>
                        )}

                        {isSelected && (
                          <span className="absolute top-2 right-2 w-5 h-5 bg-accent text-base flex items-center justify-center" aria-hidden="true">
                            <Check className="w-3 h-3" strokeWidth={3} />
                          </span>
                        )}
                    </div>
                  </button>
                );
                })}
              </div>

              {visibleOptions.length === 0 && (
                <p className="py-10 text-center text-sm text-dim">
                  No options match “{query.trim()}”.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
