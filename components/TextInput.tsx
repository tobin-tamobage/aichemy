import React from 'react';

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  spellCheck?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({ label, value, onChange, placeholder, multiline, spellCheck = true }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-wider text-accent2">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={spellCheck}
          className="w-full rounded-none border-b-2 border-line bg-surface px-4 py-3 text-sm font-medium text-ink transition-colors focus:border-accent focus:outline-none hover:bg-surface2 min-h-[100px]"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={spellCheck}
          className="w-full rounded-none border-b-2 border-line bg-surface px-4 py-3 text-sm font-medium text-ink transition-colors focus:border-accent focus:outline-none hover:bg-surface2"
        />
      )}
    </div>
  );
};
