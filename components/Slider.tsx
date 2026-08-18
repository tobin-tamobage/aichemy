import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  labels?: string[];
}

export const Slider: React.FC<SliderProps> = ({ 
  label, 
  value, 
  onChange, 
  min, 
  max, 
  step, 
  labels 
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-baseline">
        <label className="text-xs font-bold uppercase tracking-wider text-accent2">
          {label}
        </label>
        <span className="text-xs font-bold text-dim">
          {value.toFixed(1)}
        </span>
      </div>
      
      <div className="relative py-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer border-b-2 border-line focus:outline-none focus:border-accent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:bg-accent [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer hover:[&::-moz-range-thumb]:bg-accent"
        />
        
        {labels && labels.length > 0 && (
          <div className="flex justify-between mt-2 text-[10px] text-dim font-medium uppercase tracking-wider">
            {labels.map((label, index) => (
              <span key={index}>{label}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
