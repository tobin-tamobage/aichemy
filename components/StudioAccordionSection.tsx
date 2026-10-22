import React from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface StudioAccordionSectionProps {
  id: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  step?: number;
  completed?: boolean;
  summary?: string;
  children: React.ReactNode;
}

export function StudioAccordionSection({
  id,
  icon,
  isOpen,
  onToggle,
  title,
  step,
  completed = false,
  summary,
  children,
}: StudioAccordionSectionProps) {
  const buttonId = `studio-section-button-${id}`;
  const panelId = `studio-section-panel-${id}`;

  return (
    <section className={`studio-section overflow-hidden rounded-card border bg-surface shadow-sm transition-colors ${
      isOpen ? 'border-accent/50 shadow-md' : 'border-line'
    }`}>
      <h2>
        <button
          id={buttonId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="w-full flex items-center justify-between gap-4 px-4 py-4 text-left hover:bg-surface2 transition-colors"
        >
          <span className="flex items-center gap-3 text-ink">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-accent2 ${
              completed ? 'border-accent bg-accent/10 text-accent' : 'border-line bg-base'
            }`}>
              {completed ? <Check className="h-4 w-4" aria-hidden="true" /> : icon}
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                {step !== undefined && <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Step {step}</span>}
                <span className="text-sm font-semibold tracking-tight text-ink sm:text-[1rem]">{title}</span>
              </span>
              {summary && <span className="mt-0.5 block truncate text-xs font-normal text-dim">{summary}</span>}
            </span>
          </span>

          <ChevronDown
            className={`w-4 h-4 text-dim transition-transform duration-200 motion-reduce:transition-none ${
              isOpen ? 'rotate-180 text-accent' : ''
            }`}
          />
        </button>
      </h2>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!isOpen}
        className="border-t border-line bg-base/40 px-4 py-5"
      >
        {children}
      </div>
    </section>
  );
}
