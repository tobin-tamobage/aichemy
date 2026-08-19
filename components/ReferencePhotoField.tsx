import React, { useRef, useState } from 'react';
import { ImageIcon, Upload, X } from 'lucide-react';

/** Maksimum ukuran foto referensi — file di atas ini ditolak dengan pesan ramah. */
const MAX_REFERENCE_BYTES = 2 * 1024 * 1024; // ~2MB

interface ReferencePhotoFieldProps {
  /** Current photo as a data URL (or null when none is attached). */
  value: string | null;
  /** Called with the new data URL when a photo is chosen, or null when removed. */
  onChange: (dataUrl: string | null) => void;
  /** Field label, e.g. "Your selfie". */
  label?: string;
  /** Short helper text shown under the drop zone. */
  hint?: string;
}

/**
 * Reference photo upload — drop zone + file input + preview thumbnail + remove.
 *
 * Reads the chosen image via FileReader and reports its data URL upward so the
 * parent can keep it in session state (persisted to the project only when
 * small enough). Validates: image files only, max ~2MB, with a friendly message.
 */
export const ReferencePhotoField: React.FC<ReferencePhotoFieldProps> = ({
  value,
  onChange,
  label = 'Reference Photo',
  hint,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPG, PNG, WebP, ...).');
      return;
    }
    if (file.size > MAX_REFERENCE_BYTES) {
      setError('That image is larger than 2MB. Please use a smaller photo.');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string);
    };
    reader.onerror = () => {
      setError('Could not read that image. Please try another one.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-wider text-accent2">
        {label}
      </label>

      {value ? (
        // --- Preview + remove ---
        <div className="flex items-center gap-3 border border-line rounded-card bg-surface/40 p-3">
          <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-surface2 border border-line/50">
            <img src={value} alt={label} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-ink uppercase tracking-wider truncate">Photo attached</p>
            <p className="text-[10px] text-dim">Copied to the AI app together with your prompt.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setError(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            className="p-2 bg-surface2 hover:bg-accent hover:text-white text-ink rounded-md transition-all shadow-lg"
            title="Remove reference photo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        // --- Drop zone + file input ---
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
          }}
          onDrop={handleDrop}
          className={`cursor-pointer flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-card transition-all text-center ${
            isDragging
              ? 'border-accent bg-accent/5'
              : 'border-dim bg-base hover:border-accent hover:bg-accent/5'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            data-reference-photo-input
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-surface2 border border-line text-accent">
            {isDragging ? <Upload className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-ink">
            {isDragging ? 'Drop your photo here' : 'Drop a photo or click to upload'}
          </span>
          <span className="text-[10px] text-dim">JPG / PNG / WebP · up to 2MB</span>
          {hint && <span className="text-[10px] text-dim mt-1">{hint}</span>}
        </div>
      )}

      {error && (
        <p className="text-[11px] font-medium text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
