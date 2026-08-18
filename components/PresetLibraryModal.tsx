import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Play, Search, AlertCircle, Check, RotateCw } from 'lucide-react';
import type {
  Preset,
  PresetWithPrompts,
  PromptState,
} from '../types';
import { createPresetData } from '../services/presetData';
import { loadAllPresets, saveUserPreset, deleteUserPreset } from '../services/browserStorage';

interface PresetLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (preset: PresetWithPrompts) => void;
  currentPromptState: PromptState;
}

export const PresetLibraryModal: React.FC<PresetLibraryModalProps> = ({
  isOpen,
  onClose,
  onApply,
  currentPromptState,
}) => {
  const [presets, setPresets] = useState<PresetWithPrompts[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPresetName, setNewPresetName] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load presets on open
  useEffect(() => {
    if (isOpen) {
      loadPresets();
      setNewPresetName('');
      setSuccessMsg(null);
      setError(null);
    }
  }, [isOpen]);

  const loadPresets = async () => {
    setLoading(true);
    try {
      const all = await loadAllPresets();
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

    const newPreset: PresetWithPrompts = {
      id: crypto.randomUUID(),
      name: newPresetName.trim(),
      timestamp: Date.now(),
      data: createPresetData(currentPromptState),
    };

    try {
      saveUserPreset(newPreset as Preset);
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
      deleteUserPreset(preset as Preset);
      loadPresets();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-base border border-line rounded-card shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-line bg-surface/50">
          <div className="flex items-center gap-2 text-accent2">
            <Search className="w-5 h-5" />
            <h2 className="text-lg font-black tracking-widest uppercase">Preset Library</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-surface2 rounded-full transition-colors text-dim hover:text-ink"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Save Section */}
          <div className="bg-surface/40 p-5 rounded-lg border border-line/50">
            <h3 className="text-xs font-bold text-dim uppercase tracking-wider mb-3">Save Current State</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="Name your preset..."
                className="flex-1 bg-base border border-line rounded-md px-4 py-2 text-sm text-ink focus:outline-none focus:border-accent/50 placeholder:text-dim font-medium"
              />
              <button 
                onClick={handleSave_Preset}
                disabled={!newPresetName.trim()}
                className="bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold uppercase text-xs px-4 py-2 rounded-full flex items-center gap-2 transition-all"
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
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-dim uppercase tracking-wider">Your Presets</h3>
                <div className="flex items-center gap-3">
                    <button
                      onClick={handleRefresh}
                      className="text-[10px] text-dim hover:text-ink uppercase font-bold flex items-center gap-1 transition-colors"
                      title="Reload presets"
                    >
                      <RotateCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                </div>
             </div>
             
             {loading && <div className="text-center py-8 text-dim text-xs uppercase animate-pulse">Loading library...</div>}
             
             {error && (
                <div className="bg-danger/20 border border-danger/50 p-4 rounded-md flex items-start gap-3 text-danger mb-4">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <div className="text-xs">{error}</div>
                </div>
             )}

             {!loading && presets.length === 0 && (
                <div className="text-center py-12 border border-dashed border-line rounded-lg">
                  <p className="text-dim text-xs font-medium uppercase">No presets found</p>
                </div>
             )}

             <div className="space-y-2">
                {presets.map(preset => (
                  <div key={preset.id || Math.random()} className="group bg-surface/30 hover:bg-surface border border-line/50 hover:border-accent/30 rounded-lg p-3 flex items-center justify-between transition-all">
                    <div className="flex flex-col gap-1">
                       <span className="text-sm font-bold text-ink group-hover:text-accent transition-colors">
                          {preset.name || 'Untitled Preset'}
                       </span>
                       <span className="text-[10px] text-dim font-mono">
                          {preset.timestamp ? new Date(preset.timestamp).toLocaleDateString() : 'Unknown Date'}
                       </span>
                    </div>

                    <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      {preset.type !== 'bundled' && (
                        <button 
                          onClick={() => handleDelete(preset)}
                          className="p-2 hover:bg-danger/20 hover:text-danger rounded-md transition-colors text-dim"
                          title="Delete"
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      
                      {preset.type === 'bundled' && (
                         <div className="p-2 text-dim" title="Packaged preset (Read-only)">
                           <Save className="w-4 h-4 opacity-20" /> 
                         </div>
                      )}

                      <button 
                        onClick={() => { onApply(preset); onClose(); }}
                        className="p-2 bg-surface2 hover:bg-accent hover:text-white text-ink rounded-md transition-all shadow-lg"
                        title="Load Preset"
                      >
                         <Play className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
             </div>
          </div>

        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-line bg-surface/50 text-center">
            <p className="text-[10px] text-dim">
               Non-empty Subject, Environment, and Atmosphere/Mood prompts are saved, but only fill empty fields when loaded. Existing prompt text is never replaced.
            </p>
        </div>
      </div>
    </div>
  );
};
