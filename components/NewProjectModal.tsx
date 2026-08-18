/**
 * NewProjectModal - Simple dialog to enter a name for a new project.
 *
 * Shown when File > New Project is triggered from the menu bar.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export function NewProjectModal({ isOpen, onConfirm, onCancel }: NewProjectModalProps) {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      // Focus input after mount
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (trimmed.length > 0) {
      onConfirm(trimmed);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-base/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-base border border-line rounded-card w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-line">
          <Plus className="w-5 h-5 text-accent2 flex-shrink-0" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink">New Project</h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <label className="block text-xs text-dim uppercase tracking-wider mb-2">
            Project Name
          </label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSubmit();
              if (e.key === 'Escape') onCancel();
            }}
            placeholder="Enter project name..."
            className="w-full bg-surface border border-line text-ink text-sm px-3 py-2.5 focus:outline-none focus:border-accent placeholder-dim"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-line justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-dim hover:text-ink border border-line hover:border-dim transition-colors flex items-center gap-2"
          >
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-accent hover:bg-accent/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" /> Create
          </button>
        </div>
      </div>
    </div>
  );
}
