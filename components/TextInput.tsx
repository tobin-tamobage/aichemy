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
      <label className="text-xs font-bold uppercase tracking-wider text-yellow-500">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={spellCheck}
          className="w-full rounded-none border-b-2 border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-colors focus:border-yellow-500 focus:outline-none hover:bg-zinc-800 min-h-[100px]"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={spellCheck}
          className="w-full rounded-none border-b-2 border-zinc-800 bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-colors focus:border-yellow-500 focus:outline-none hover:bg-zinc-800"
        />
      )}
    </div>
  );
};
