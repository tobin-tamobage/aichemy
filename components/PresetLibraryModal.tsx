import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Save,
  Trash2,
  Play,
  Search,
  AlertCircle,
  Check,
  RotateCw,
  Library,
  Lock,
} from 'lucide-react';
import type {
  Preset,
  PresetWithPrompts,
} from '../types';
import { loadAllPresets, saveUserPreset, deleteUserPreset } from '../services/browserStorage';
import { getDomain } from '../domains';

interface PresetLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (preset: PresetWithPrompts) => void;
  /** Domain aktif — semua call storage scoped per domain. */
  domainId: string;
  /** State domain generik saat ini untuk SAVE PRESET. */
  currentDomainState: Record<string, unknown>;
  /** Field yang TIDAK ikut disimpan (mis. subjectAction/environment cinematic). */
  presetProtectedKeys: string[];
}

export const PresetLibraryModal: React.FC<PresetLibraryModalProps> = ({
  isOpen,
  onClose,
  onApply,
  domainId,
  currentDomainState,
  presetProtectedKeys,
}) => {
  const [presets, setPresets] = useState<PresetWithPrompts[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPresetName, setNewPresetName] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const presetNameInputRef = useRef<HTMLInputElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Load presets on open
  useEffect(() => {
    if (isOpen) {
      loadPresets();
      setNewPresetName('');
      setSuccessMsg(null);
      setError(null);
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const activeElement = document.activeElement;
    previouslyFocusedRef.current = activeElement instanceof HTMLElement ? activeElement : null;
    presetNameInputRef.current?.focus();

    return () => {
      const previouslyFocused = previouslyFocusedRef.current;
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
      previouslyFocusedRef.current = null;
    };
  }, [isOpen]);

  // Escape closes the modal; Tab stays among enabled, visible modal controls.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
      )).filter((element) => (
        element.getClientRects().length > 0
        && getComputedStyle(element).visibility !== 'hidden'
      ));
      if (focusable.length === 0) return;

      const activeIndex = focusable.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey ? activeIndex <= 0 : activeIndex === -1 || activeIndex === focusable.length - 1) {
        e.preventDefault();
        focusable[e.shiftKey ? focusable.length - 1 : 0].focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const loadPresets = async () => {
    setLoading(true);
    try {
      const all = await loadAllPresets(domainId);
      // Normalize presets to allow both wrapped ({data}) and raw JSON shapes
      const validPresets = all.map((p) => {
        if (!p || typeof p !== 'object') return null;

        let normalizedPreset: PresetWithPrompts | null = null;

        if (p.data && typeof p.data === 'object') {
          normalizedPreset = p as PresetWithPrompts;
        } else {
          const { filename, id, name, timestamp, type, ...rest } = p as unknown as Record<string, unknown>;
          if (Object.keys(rest).length === 0) return null;

          normalizedPreset = {
            id: (id as string) || `manual-${Math.random().toString(36).slice(2)}`,
            name: (name as string) || (filename as string)?.replace(/\.json$/i, '') || 'Imported Preset',
            timestamp: (timestamp as number) || Date.now(),
            data: rest as PresetWithPrompts['data'],
            filename: filename as string | undefined,
          };
        }

        if (normalizedPreset && p.type) {
          normalizedPreset.type = p.type;
        }

        return normalizedPreset;
      }).filter((p): p is PresetWithPrompts => p !== null);

      setPresets(validPresets.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadPresets();
  };

  const handleSave_Preset = async () => {
    if (!newPresetName.trim()) return;

    // Simpan domainState minus presetProtectedKeys; teks prompt (subjectAction/
    // environment/mood) hanya ikut bila non-kosong — perilaku preset existing
    // ("hanya mengisi field kosong saat dimuat").
    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(currentDomainState)) {
      if (presetProtectedKeys.includes(key)) continue;
      if ((key === 'subjectAction' || key === 'environment' || key === 'mood')
        && typeof value === 'string' && value.trim().length === 0) continue;
      data[key] = value;
    }

    const newPreset: PresetWithPrompts = {
      id: crypto.randomUUID(),
      name: newPresetName.trim(),
      timestamp: Date.now(),
      data: data as PresetWithPrompts['data'],
    };

    try {
      saveUserPreset(newPreset as unknown as Preset, domainId);
      setSuccessMsg('Preset saved!');
      setNewPresetName('');
      loadPresets();
      setTimeout(() => setSuccessMsg(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDelete = async (preset: PresetWithPrompts) => {
    if (preset.type === 'bundled') return;
    if (!confirm(`Delete preset "${preset.name}"?`)) return;

    try {
      deleteUserPreset(preset as Preset, domainId);
      loadPresets();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  // Local search: filters the already-loaded list for display only — never
  // touches storage, scope, or ordering semantics.
  const q = query.trim().toLowerCase();
  const visiblePresets = q
    ? presets.filter((p) => (p.name || '').toLowerCase().includes(q))
    : presets;
  // ponytail: fixed threshold; lower it if typical libraries stay small
  const showSearch = presets.length > 8;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base/80 backdrop-blur-sm p-4">
      <div ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Preset library"
        className="w-full max-w-2xl bg-base border border-line rounded-card shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 p-4 border-b border-line bg-surface/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <Library className="w-5 h-5 text-accent flex-shrink-0" />
            <h2 className="text-lg font-black tracking-widest uppercase text-ink">Preset Library</h2>
            <span className="px-2 py-0.5 border border-line rounded-full text-[9px] font-bold uppercase tracking-wider text-dim whitespace-nowrap">
              {getDomain(domainId).icon} {getDomain(domainId).label}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close preset library"
            title="Close"
            className="p-2 hover:bg-surface2 rounded-full transition-colors text-dim hover:text-ink"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8">

          {/* Save Section */}
          <div className="bg-surface/40 p-4 sm:p-5 rounded-lg border border-line/50">
            <h3 className="text-xs font-bold text-dim uppercase tracking-wider mb-1">Save Current State</h3>
            <p className="text-[11px] text-dim mb-3">Capture the current setup as a reusable preset.</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                ref={presetNameInputRef}
                type="text"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave_Preset(); }}
                placeholder="Name your preset..."
                className="flex-1 min-w-0 bg-base border border-line rounded-md px-4 py-2 text-sm text-ink focus:outline-none focus:border-accent/50 placeholder:text-dim font-medium"
              />
              <button
                onClick={handleSave_Preset}
                disabled={!newPresetName.trim()}
                className="bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold uppercase text-xs px-5 py-2 rounded-md flex items-center justify-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
            {successMsg && (
              <div className="mt-2 text-xs text-ok font-bold flex items-center gap-1">
                <Check className="w-3 h-3" /> {successMsg}
              </div>
            )}
          </div>

          {/* List Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-dim uppercase tracking-wider">
                Your Presets
                {!loading && presets.length > 0 && (
                  <span className="ml-2 font-mono normal-case tracking-normal text-dim/70">{presets.length}</span>
                )}
              </h3>
              <button
                onClick={handleRefresh}
                className="text-[10px] text-dim hover:text-ink uppercase font-bold flex items-center gap-1 transition-colors"
                title="Reload presets"
              >
                <RotateCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {showSearch && (
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-dim pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search presets..."
                  aria-label="Search presets"
                  className="w-full bg-base border border-line rounded-md pl-8 pr-3 py-1.5 text-xs text-ink focus:outline-none focus:border-accent/50 placeholder:text-dim"
                />
              </div>
            )}

            {loading && (
              <div className="text-center py-8 text-dim text-xs uppercase tracking-widest animate-pulse">
                Loading library...
              </div>
            )}

            {error && (
              <div className="bg-danger/20 border border-danger/50 p-4 rounded-md flex items-center gap-3 text-danger">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div className="text-xs flex-1">{error}</div>
                <button
                  onClick={loadPresets}
                  className="text-[10px] font-bold uppercase tracking-wider hover:underline underline-offset-2"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && presets.length === 0 && (
              <div className="text-center py-12 px-4 border border-dashed border-line rounded-lg">
                <p className="text-dim text-xs font-bold uppercase tracking-wider">No presets yet</p>
                <p className="text-dim/80 text-[11px] mt-1.5">Save the current state above to start your library.</p>
              </div>
            )}

            {!loading && !error && presets.length > 0 && visiblePresets.length === 0 && (
              <div className="text-center py-10 px-4 border border-dashed border-line rounded-lg">
                <p className="text-dim text-xs font-medium">No presets match “{query.trim()}”.</p>
              </div>
            )}

            <div className="space-y-2">
              {visiblePresets.map((preset, i) => (
                <div
                  key={preset.id || `${preset.name}-${i}`}
                  className="group bg-surface/30 hover:bg-surface border border-line/50 hover:border-accent/30 rounded-lg p-3 flex items-center justify-between gap-3 transition-all"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-bold text-ink group-hover:text-accent transition-colors truncate">
                      {preset.name || 'Untitled Preset'}
                    </span>
                    <span className="text-[10px] text-dim font-mono">
                      {preset.type === 'bundled' ? 'Built-in' : 'Custom'} ·{' '}
                      {preset.timestamp ? new Date(preset.timestamp).toLocaleDateString() : 'Unknown Date'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {preset.type === 'bundled' ? (
                      <span
                        className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-dim"
                        title="Packaged preset (read-only)"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Read-only
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDelete(preset)}
                        className="p-2 text-dim hover:text-danger hover:bg-danger/20 rounded-md transition-colors"
                        title="Delete preset"
                        aria-label={`Delete preset ${preset.name || 'Untitled Preset'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => { onApply(preset); onClose(); }}
                      className="px-3 py-1.5 bg-surface2 hover:bg-accent text-ink hover:text-white rounded-md transition-all flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
                      title="Load preset"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Load
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-line bg-surface/50 text-center">
          <p className="text-[10px] text-dim leading-relaxed">
            {domainId === 'cinematic'
              ? 'Non-empty Subject, Environment, and Atmosphere/Mood prompts are saved, but only fill empty fields when loaded. Existing prompt text is never replaced.'
              : 'Presets fill fields on load; free-text prompts are never overwritten by a preset.'}
          </p>
        </div>
      </div>
    </div>
  );
};
