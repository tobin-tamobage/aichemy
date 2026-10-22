import React from 'react';
import type { ChipsField, DomainField, DomainOption, DomainState, SelectField, ToggleField, VisualField } from '../domains/types';
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
  options: DomainOption[];
}> = ({ field, value, onChange, options }) => {
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
      <span className="ui-field-label">
        {field.label}
        {field.max !== undefined && (
          <span className="ml-2 text-dim normal-case tracking-normal font-medium">
            ({selected.length}/{field.max})
          </span>
        )}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const isSelected = selected.includes(opt.value);
          const isFull = !isSelected && field.max !== undefined && selected.length >= field.max;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              disabled={isFull}
              title={opt.hint}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
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
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className="group flex items-center gap-2.5 px-1 text-left"
        onClick={() => onChange(!checked)}
      >
        <span className={`flex h-5 w-9 items-center rounded-full border p-0.5 transition-colors ${
          checked ? 'bg-accent border-accent' : 'border-line bg-surface group-hover:border-dim'
        }`}>
          <span className={`h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-3.5' : ''}`} />
        </span>
        <span className={`text-xs font-medium tracking-wide ${
          checked ? 'text-ink' : 'text-dim group-hover:text-ink'
        }`}>{field.label}</span>
      </button>
      {field.hint && <p className="text-[10px] text-dim px-1">{field.hint}</p>}
    </div>
  );
};

export const DomainFieldRenderer: React.FC<DomainFieldRendererProps> = ({ field, value, onChange, state }) => {
  if (field.visibleWhen && field.visibleWhen(state) === false) return null;

  // Resolver katalog kondisional — fungsi options dievaluasi terhadap state saat ini;
  // array statis diteruskan apa adanya (perilaku tidak berubah).
  const resolveOptions = (f: SelectField | VisualField | ChipsField): DomainOption[] =>
    typeof f.options === 'function' ? f.options(state) : f.options;

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
          options={resolveOptions(field).map(o => ({ value: o.value, label: o.label }))}
          placeholder={field.placeholder}
        />
      );
    case 'visual': {
      const isMulti = (field as VisualField).multi === true || Array.isArray(value);
      if (isMulti) {
        return (
          <VisualSelector
            label={field.label}
            value={Array.isArray(value) ? (value as string[]) : []}
            onChange={onChange as (value: string[]) => void}
            options={resolveOptions(field)}
            previewRatio={field.previewRatio}
            multiSelect={true}
          />
        );
      }
      return (
        <VisualSelector
          label={field.label}
          value={typeof value === 'string' ? value : ''}
          onChange={onChange as (value: string) => void}
          options={resolveOptions(field)}
          previewRatio={field.previewRatio}
        />
      );
    }
    case 'chips':
      return <ChipsFieldControl field={field} value={value} onChange={onChange} options={resolveOptions(field)} />;
    case 'toggle':
      return <ToggleFieldControl field={field} value={value} onChange={onChange} />;
    default:
      return null;
  }
};
