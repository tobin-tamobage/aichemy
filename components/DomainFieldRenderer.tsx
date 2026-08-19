import React from 'react';
import type { ChipsField, DomainField, DomainState, ToggleField } from '../domains/types';
import { TextInput } from './TextInput';
import { Selector } from './Selector';
import { VisualSelector } from './VisualSelector';

interface DomainFieldRendererProps {
  field: DomainField;
  value: unknown;
  onChange: (value: unknown) => void;
  state: DomainState;
}

const ChipsFieldControl: React.FC<{
  field: ChipsField;
  value: unknown;
  onChange: (value: unknown) => void;
}> = ({ field, value, onChange }) => {
  const selected = Array.isArray(value) ? (value as string[]) : [];

  const toggle = (optionValue: string) => {
    if (selected.includes(optionValue)) {
      onChange(selected.filter(v => v !== optionValue));
      return;
    }
    if (field.max !== undefined && selected.length >= field.max) return; // penuh — tolak
    onChange([...selected, optionValue]);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-wider text-accent2">
        {field.label}
        {field.max !== undefined && (
          <span className="ml-2 text-dim normal-case tracking-normal font-medium">
            ({selected.length}/{field.max})
          </span>
        )}
      </label>
      <div className="flex flex-wrap gap-2">
        {field.options.map(opt => {
          const isSelected = selected.includes(opt.value);
          const isFull = !isSelected && field.max !== undefined && selected.length >= field.max;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              disabled={isFull}
              title={opt.hint}
              className={`px-3 py-1.5 border text-xs font-bold uppercase tracking-wider transition-colors ${
                isSelected
                  ? 'bg-accent text-white border-accent'
                  : isFull
                    ? 'border-line text-dim opacity-50 cursor-not-allowed'
                    : 'border-line text-ink hover:border-dim hover:bg-surface2'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ToggleFieldControl: React.FC<{
  field: ToggleField;
  value: unknown;
  onChange: (value: unknown) => void;
}> = ({ field, value, onChange }) => {
  const checked = value === true;
  return (
    <div className="flex flex-col gap-1">
      <label
        className="flex items-center gap-2.5 cursor-pointer group select-none px-1"
        onClick={() => onChange(!checked)}
      >
        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
          checked ? 'bg-accent border-accent' : 'border-line bg-surface group-hover:border-dim'
        }`}>
          {checked && (
            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 6l3 3 5-5" />
            </svg>
          )}
        </div>
        <span className={`text-xs font-medium tracking-wide ${
          checked ? 'text-ink' : 'text-dim group-hover:text-ink'
        }`}>{field.label}</span>
      </label>
      {field.hint && <p className="text-[10px] text-dim px-1">{field.hint}</p>}
    </div>
  );
};

export const DomainFieldRenderer: React.FC<DomainFieldRendererProps> = ({ field, value, onChange, state }) => {
  if (field.visibleWhen && field.visibleWhen(state) === false) return null;

  switch (field.kind) {
    case 'textarea':
      return (
        <TextInput
          label={field.label}
          value={typeof value === 'string' ? value : ''}
          onChange={onChange}
          placeholder={field.placeholder}
          multiline
        />
      );
    case 'select':
      return (
        <Selector
          label={field.label}
          value={typeof value === 'string' ? value : ''}
          onChange={onChange}
          options={field.options.map(o => ({ value: o.value, label: o.label }))}
          placeholder={field.placeholder}
        />
      );
    case 'visual':
      return (
        <VisualSelector
          label={field.label}
          value={typeof value === 'string' ? value : ''}
          onChange={onChange}
          options={field.options}
          previewRatio={field.previewRatio}
        />
      );
    case 'chips':
      return <ChipsFieldControl field={field} value={value} onChange={onChange} />;
    case 'toggle':
      return <ToggleFieldControl field={field} value={value} onChange={onChange} />;
    default:
      return null;
  }
};
