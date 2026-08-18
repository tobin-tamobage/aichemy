import React, { useEffect, useMemo, useRef, useState } from 'react';

interface FStopSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const F_STOP_VALUES = ['1.4', '2', '2.8', '4', '5.6', '8', '11', '16', '22'] as const;

export const FStopSelector: React.FC<FStopSelectorProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Select f-stop...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const sliderRef = useRef<HTMLInputElement | null>(null);

  const selectedIndex = useMemo(() => {
    const optionIndex = F_STOP_VALUES.indexOf(value as typeof F_STOP_VALUES[number]);
    return optionIndex >= 0 ? optionIndex : 0;
  }, [value]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    const focusTimer = window.setTimeout(() => {
      sliderRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const displayValue = value ? `f/${value}` : placeholder;

  return (
    <div ref={rootRef} className="relative flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-wider text-yellow-500">{label}</label>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="relative w-full border-b-2 border-zinc-800 bg-zinc-900 px-4 py-3 pr-10 text-left text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:border-yellow-500"
      >
        <span className={value ? 'text-white' : 'text-zinc-500'}>
          {displayValue}
        </span>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 border border-zinc-800 bg-zinc-950 p-4 shadow-2xl md:left-auto md:w-[22rem] md:min-w-[22rem]">
          <div className="mb-3 flex items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            <span>Blurrier Background</span>
            <span>Sharper background</span>
          </div>

          <div className="mb-3 rounded-md border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-center text-sm font-bold text-white">
            f/{F_STOP_VALUES[selectedIndex]}
          </div>

          <input
            ref={sliderRef}
            type="range"
            min={0}
            max={F_STOP_VALUES.length - 1}
            step={1}
            value={selectedIndex}
            onChange={(event) => {
              const nextIndex = Number(event.target.value);
              onChange(F_STOP_VALUES[nextIndex] || F_STOP_VALUES[0]);
            }}
            className="w-full cursor-pointer appearance-none rounded-lg border-b-2 border-zinc-800 bg-zinc-900 h-2 focus:outline-none focus:border-yellow-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:bg-yellow-500 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer hover:[&::-moz-range-thumb]:bg-yellow-500"
          />

          <div className="mt-3 grid grid-cols-9 gap-1 text-center text-[10px] font-medium text-zinc-500">
            {F_STOP_VALUES.map((fStop, index) => (
              <button
                key={fStop}
                type="button"
                onClick={() => onChange(fStop)}
                className={`rounded px-1 py-1 transition-colors ${
                  index === selectedIndex
                    ? 'bg-yellow-500/15 text-yellow-400'
                    : 'hover:bg-zinc-800 hover:text-zinc-300'
                }`}
              >
                {fStop}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
