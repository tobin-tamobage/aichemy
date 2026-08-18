/**
 * UnsavedChangesModal - 3-button dialog for unsaved changes
 * 
 * Shown before destructive navigation (Home, New Project, Open other project, Quit)
 * when the current project has unsaved changes.
 * 
 * Returns: 'save' | 'discard' | 'cancel'
 */

import React from 'react';
import { AlertTriangle, Save, Trash2, X } from 'lucide-react';
import type { UnsavedChangesAction } from '../types';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onAction: (action: UnsavedChangesAction) => void;
  projectName?: string | null;
}

export function UnsavedChangesModal({ isOpen, onAction, projectName }: UnsavedChangesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-800">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Unsaved Changes</h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-zinc-300">
            {projectName ? (
              <>Your project <span className="text-white font-medium">"{projectName}"</span> has unsaved changes.</>
            ) : (
              <>You have unsaved changes that will be lost.</>
            )}
          </p>
          <p className="text-xs text-zinc-500 mt-2">
            Would you like to save before continuing?
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-zinc-800 justify-end">
          <button
            onClick={() => onAction('cancel')}
            className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 transition-colors flex items-center gap-2"
          >
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
          <button
            onClick={() => onAction('discard')}
            className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" /> Discard
          </button>
          <button
            onClick={() => onAction('save')}
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black bg-yellow-500 hover:bg-yellow-400 transition-colors flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" /> Save
          </button>
        </div>
      </div>
    </div>
  );
}
