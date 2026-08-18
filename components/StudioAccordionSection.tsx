import React from 'react';
import { ChevronDown } from 'lucide-react';

interface StudioAccordionSectionProps {
  id: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  children: React.ReactNode;
}

export function StudioAccordionSection({
  id,
  icon,
  isOpen,
  onToggle,
  title,
  children,
}: StudioAccordionSectionProps) {
  const buttonId = `studio-section-button-${id}`;
  const panelId = `studio-section-panel-${id}`;

  return (
    <section className="border border-zinc-800 bg-zinc-950/40">
      <h2>
        <button
          id={buttonId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="w-full flex items-center justify-between gap-4 px-4 py-4 text-left hover:bg-zinc-900/60 transition-colors"
        >
          <span className="flex items-center gap-3 text-white">
            <span className="text-yellow-500">{icon}</span>
            <span className="text-lg font-bold uppercase tracking-wider">{title}</span>
          </span>

          <ChevronDown
            className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-yellow-500' : ''
            }`}
          />
        </button>
      </h2>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!isOpen}
        className="border-t border-zinc-800 px-4 py-4"
      >
        {children}
      </div>
    </section>
  );
}
