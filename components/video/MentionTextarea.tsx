import React, { useCallback, useEffect, useRef, useState } from 'react';

export interface MentionOption {
  /** The tag inserted into the prompt, e.g. "@Element1" */
  tag: string;
  /** Display label in the dropdown, e.g. "Element 1 — frontal image" */
  label: string;
  /** Optional visual hint (e.g. "image", "frame") */
  kind?: string;
  /** Optional small thumbnail preview for quick visual scanning. */
  thumbnailUrl?: string | null;
  /** Optional hint used for fallback thumbnail behavior. */
  thumbnailKind?: 'image' | 'video' | 'placeholder';
}

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  /** Available @ mention options. If empty, the component behaves like a plain textarea. */
  mentions: MentionOption[];
  placeholder?: string;
  rows?: number;
  className?: string;
  /** Forward ref to the underlying textarea */
  textareaRef?: React.Ref<HTMLTextAreaElement>;
  onSelect?: () => void;
  onClick?: () => void;
  onKeyUp?: () => void;
  onBlur?: () => void;
  onFocus?: () => void;
  spellCheck?: boolean;
}

export function MentionTextarea({
  value,
  onChange,
  mentions,
  placeholder,
  rows = 3,
  className,
  textareaRef,
  onSelect,
  onClick,
  onKeyUp,
  onBlur,
  onFocus,
  spellCheck = true,
}: MentionTextareaProps) {
  const internalRef = useRef<HTMLTextAreaElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [triggerPos, setTriggerPos] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Merge refs
  const setRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      internalRef.current = el;
      if (typeof textareaRef === 'function') textareaRef(el);
      else if (textareaRef && typeof textareaRef === 'object')
        (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
    },
    [textareaRef],
  );

  const filteredMentions = mentions.filter((m) =>
    m.tag.toLowerCase().includes(filterText.toLowerCase()) ||
    m.label.toLowerCase().includes(filterText.toLowerCase()),
  );

  // Reset active index when filter changes
  useEffect(() => {
    setActiveIndex(0);
  }, [filterText]);

  const insertMention = useCallback(
    (option: MentionOption) => {
      if (triggerPos === null) return;
      const ta = internalRef.current;
      const cursorPos = ta?.selectionStart ?? value.length;
      const before = value.slice(0, triggerPos); // everything before the @
      const after = value.slice(cursorPos); // everything after the cursor
      const needsTrailingSpace = after.length === 0 || !/^\s/.test(after);
      const insertion = `${option.tag}${needsTrailingSpace ? ' ' : ''}`;
      const nextValue = `${before}${insertion}${after}`;
      const nextCaret = before.length + insertion.length;
      onChange(nextValue);
      setShowDropdown(false);
      setFilterText('');
      setTriggerPos(null);

      requestAnimationFrame(() => {
        if (ta) {
          ta.focus();
          ta.setSelectionRange(nextCaret, nextCaret);
        }
      });
    },
    [triggerPos, value, onChange],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const cursor = e.target.selectionStart ?? newValue.length;
      onChange(newValue);

      if (mentions.length === 0) return;

      // Scan backwards from cursor to find a trigger '@'
      const textBeforeCursor = newValue.slice(0, cursor);
      const atIndex = textBeforeCursor.lastIndexOf('@');

      if (atIndex === -1) {
        setShowDropdown(false);
        setFilterText('');
        setTriggerPos(null);
        return;
      }

      // Only trigger if @ is at start or preceded by whitespace
      if (atIndex > 0 && !/\s/.test(newValue[atIndex - 1])) {
        setShowDropdown(false);
        setFilterText('');
        setTriggerPos(null);
        return;
      }

      // The text after @ up to cursor is the filter
      const partial = textBeforeCursor.slice(atIndex + 1);

      // If the partial contains whitespace, the mention context is broken
      if (/\s/.test(partial)) {
        setShowDropdown(false);
        setFilterText('');
        setTriggerPos(null);
        return;
      }

      setTriggerPos(atIndex);
      setFilterText(partial);
      setShowDropdown(true);
    },
    [mentions, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!showDropdown || filteredMentions.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % filteredMentions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + filteredMentions.length) % filteredMentions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(filteredMentions[activeIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowDropdown(false);
        setFilterText('');
        setTriggerPos(null);
      }
    },
    [showDropdown, filteredMentions, activeIndex, insertMention],
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        internalRef.current &&
        !internalRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
        setFilterText('');
        setTriggerPos(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDropdown]);

  // Scroll active item into view
  useEffect(() => {
    if (!showDropdown || !dropdownRef.current) return;
    const active = dropdownRef.current.querySelector('[data-active="true"]');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, showDropdown]);

  const kindColors: Record<string, string> = {
    element: 'text-purple-400',
    frame: 'text-cyan-400',
    character: 'text-yellow-400',
    image: 'text-cyan-400',
  };

  return (
    <div className="relative">
      <textarea
        ref={setRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onSelect={onSelect}
        onClick={onClick}
        onKeyUp={onKeyUp}
        onFocus={onFocus}
        onBlur={(e) => {
          onBlur?.();
          // Small delay so click on dropdown option registers first
          setTimeout(() => {
            if (
              !dropdownRef.current?.contains(document.activeElement) &&
              document.activeElement !== internalRef.current
            ) {
              setShowDropdown(false);
            }
          }, 150);
        }}
        rows={rows}
        className={className}
        placeholder={placeholder}
        spellCheck={spellCheck}
      />
      {showDropdown && filteredMentions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto border border-zinc-700 bg-zinc-900 shadow-xl"
        >
          {filteredMentions.map((option, idx) => (
            <button
              key={option.tag}
              type="button"
              data-active={idx === activeIndex}
              className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                idx === activeIndex
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'text-zinc-300 hover:bg-zinc-800'
              }`}
              onMouseDown={(e) => {
                e.preventDefault(); // prevent textarea blur
                insertMention(option);
              }}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              <span className="w-4 h-4 shrink-0 border border-zinc-700 bg-zinc-800 overflow-hidden flex items-center justify-center">
                {option.thumbnailUrl ? (
                  <img
                    src={option.thumbnailUrl}
                    alt={option.tag}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="w-2 h-2 bg-zinc-600" />
                )}
              </span>
              <span className="font-mono font-bold text-xs">{option.tag}</span>
              <span className="text-zinc-500 text-xs truncate">{option.label}</span>
              {option.kind && (
                <span className={`ml-auto text-[10px] uppercase tracking-wider ${kindColors[option.kind] || 'text-zinc-500'}`}>
                  {option.kind}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
