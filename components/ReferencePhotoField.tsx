import React, { useEffect, useRef, useState } from 'react';
import { ImageIcon, ImagePlus, Upload, X } from 'lucide-react';
import { composeReferenceImages } from '../utils/referenceComposite';

/** Maksimum ukuran foto referensi — file di atas ini ditolak dengan pesan ramah. */
const MAX_REFERENCE_BYTES = 2 * 1024 * 1024; // ~2MB
/** Maksimum jumlah foto sumber yang digabung jadi satu komposit. */
const MAX_REFERENCE_SOURCES = 3;

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
 * Accepts up to 3 source photos: each addition is merged into ONE composite
 * data URL via composeReferenceImages, so the parent state stays a single image.
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
  /** Berapa foto sumber yang sudah digabung ke `value` (komposit dihitung per tambahan). */
  const [sourceCount, setSourceCount] = useState(0);
  const [isComposing, setIsComposing] = useState(false);

  // Value jadi null (remove ATAU restore project tanpa foto) → hitungan sumber reset.
  // Perubahan non-null tidak disentuh — compose flow yang mengaturnya; komposit hasil
  // import tak diketahui jumlahnya dan diperlakukan sebagai 1 sumber (spec).
  useEffect(() => {
    if (value === null) setSourceCount(0);
  }, [value]);

  const handleFile = (file: File | null | undefined) => {
    if (!file || isComposing) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPG, PNG, WebP, ...).');
      return;
    }
    if (file.size > MAX_REFERENCE_BYTES) {
      setError('That image is larger than 2MB. Please use a smaller photo.');
      return;
    }
    if (value && sourceCount >= MAX_REFERENCE_SOURCES) {
      setError('Maximum 3 reference photos — remove to start over.');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const newDataUrl = reader.result as string;
      if (!value) {
        onChange(newDataUrl);
        setSourceCount(1);
        return;
      }
      // Tambahan foto → gabung dengan komposit yang ada jadi satu gambar baru.
      setIsComposing(true);
      try {
        const composite = await composeReferenceImages([value, newDataUrl]);
        onChange(composite);
        setSourceCount((c) => c + 1);
      } catch (err) {
        // Komposit gagal (gambar korup) → jangan lempar ke UI; pakai foto terbaru saja.
        console.error('Failed to combine reference photos — using the newest photo only', err);
        onChange(newDataUrl);
        setSourceCount(1);
      } finally {
        setIsComposing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
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

  const dragHandlers = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    },
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    },
    onDrop: handleDrop,
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-wider text-accent2">
        {label}
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        data-reference-photo-input
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {value ? (
        // --- Preview + remove + add-another (drop di sini juga menggabung) ---
        <div className="flex flex-col gap-2">
          <div
            {...dragHandlers}
            className={`flex items-center gap-3 border rounded-card bg-surface/40 p-3 transition-all ${
              isDragging ? 'border-accent bg-accent/5' : 'border-line'
            }`}
          >
            <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-surface2 border border-line/50">
              <img src={value} alt={label} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-ink uppercase tracking-wider truncate">
                {isComposing ? 'Combining photos…' : 'Photo attached'}
              </p>
              <p className="text-[10px] text-dim">Copied to the AI app together with your prompt.</p>
            </div>
            <button
              type="button"
              disabled={isComposing}
              onClick={() => {
                onChange(null);
                setError(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="p-2 bg-surface2 hover:bg-accent hover:text-white text-ink rounded-md transition-all shadow-lg disabled:opacity-50"
              title="Remove reference photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {sourceCount < MAX_REFERENCE_SOURCES && !isComposing && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="self-start flex items-center gap-1 text-[10px] font-bold uppercase text-dim hover:text-accent transition-all px-2 py-1 border border-transparent hover:border-line rounded-md"
            >
              <ImagePlus className="w-3 h-3" /> Add another photo
            </button>
          )}
        </div>
      ) : (
        // --- Drop zone ---
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
          {...dragHandlers}
          className={`cursor-pointer flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-card transition-all text-center ${
            isDragging
              ? 'border-accent bg-accent/5'
              : 'border-dim bg-base hover:border-accent hover:bg-accent/5'
          }`}
        >
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-surface2 border border-line text-accent">
            {isDragging ? <Upload className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-ink">
            {isDragging ? 'Drop your photo here' : 'Drop a photo or click to upload'}
          </span>
          <span className="text-[10px] text-dim">JPG / PNG / WebP · up to 2MB</span>
          <span className="text-[10px] text-dim mt-1">
            {hint || 'Drop or paste up to 3 photos — they are combined into one image.'}
          </span>
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
