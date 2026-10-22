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
  const inputId = `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="ui-field-label">{label}</label>
      {multiline ? (
        <textarea
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={spellCheck}
          className="ui-field min-h-[100px] resize-y"
        />
      ) : (
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={spellCheck}
          className="ui-field"
        />
      )}
    </div>
  );
};
