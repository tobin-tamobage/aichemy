import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Play, AlertCircle, Check, RotateCw, User, Shirt, Box } from 'lucide-react';
import type { CharacterData, SavedCharacter } from '../types';
import {
  loadCharacters as loadStoredCharacters,
  saveCharacter,
  deleteCharacter,
} from '../services/browserStorage';

interface CharacterLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (character: CharacterData) => void;
  currentCharacter: CharacterData;
}

export const CharacterLibraryModal: React.FC<CharacterLibraryModalProps> = ({
  isOpen,
  onClose,
  onLoad,
  currentCharacter,
}) => {
  const [characters, setCharacters] = useState<SavedCharacter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charName, setCharName] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load characters on open
  useEffect(() => {
    if (isOpen) {
      loadCharacters();
      setCharName('');
      setSuccessMsg(null);
      setError(null);
    }
  }, [isOpen]);

  const loadCharacters = async () => {
    setLoading(true);
    try {
      setCharacters(
        loadStoredCharacters()
          .filter(c => c && typeof c === 'object' && c.data)
          .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      );
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
    loadCharacters();
  };

  /** Check whether the active character has at least one image slot filled */
  const hasAnyImage = currentCharacter.face.previewDataUrl || currentCharacter.outfit.previewDataUrl || currentCharacter.object.previewDataUrl;

  const handleSave = async () => {
    const trimmed = charName.trim();
    if (!trimmed) return;

    const saved: SavedCharacter = {
      id: crypto.randomUUID(),
      name: trimmed,
      timestamp: Date.now(),
      data: currentCharacter,
    };

    try {
      saveCharacter(saved);
      setSuccessMsg('Character saved!');
      setCharName('');
      loadCharacters();
      setTimeout(() => setSuccessMsg(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDelete = async (char: SavedCharacter) => {
    if (!confirm(`Delete character "${char.name}"?`)) return;

    try {
      deleteCharacter(char);
      loadCharacters();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  /** Count how many image slots are filled in a character */
  const filledSlots = (c: CharacterData) => {
    let count = 0;
    if (c.face.previewDataUrl) count++;
    if (c.outfit.previewDataUrl) count++;
    if (c.object.previewDataUrl) count++;
    return count;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-base border border-line rounded-card shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-line bg-surface/50">
          <div className="flex items-center gap-2 text-accent2">
            <User className="w-5 h-5" />
            <h2 className="text-lg font-black tracking-widest uppercase">Character Library</h2>
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
            <h3 className="text-xs font-bold text-dim uppercase tracking-wider mb-3">Save Current Character</h3>
            {!hasAnyImage && (
              <p className="text-[11px] text-dim mb-3">Add at least one image (Face, Outfit, or Object) to save this character.</p>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={charName}
                onChange={(e) => setCharName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && hasAnyImage && charName.trim() && handleSave()}
                placeholder="Name your character..."
                className="flex-1 bg-base border border-line rounded-md px-4 py-2 text-sm text-ink focus:outline-none focus:border-accent/50 placeholder:text-dim font-medium"
              />
              <button
                onClick={handleSave}
                disabled={!charName.trim() || !hasAnyImage}
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

          {/* Library Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-dim uppercase tracking-wider">Saved Characters</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  className="text-[10px] text-dim hover:text-ink uppercase font-bold flex items-center gap-1 transition-colors"
                  title="Reload characters"
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

            {!loading && characters.length === 0 && (
              <div className="text-center py-12 border border-dashed border-line rounded-lg">
                <p className="text-dim text-xs font-medium uppercase">No saved characters yet</p>
                <p className="text-dim text-[10px] mt-1">Set up a character above and save it to reuse across scenes.</p>
              </div>
            )}

            <div className="space-y-2">
              {characters.map(char => (
                <div key={char.id || Math.random()} className="group bg-surface/30 hover:bg-surface border border-line/50 hover:border-accent/30 rounded-lg p-3 flex items-center gap-3 transition-all">
                  {/* Thumbnail */}
                  <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-surface2 border border-line/50">
                    {char.data?.face?.previewDataUrl ? (
                      <img src={char.data.face.previewDataUrl} alt={char.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-5 h-5 text-dim" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <span className="text-sm font-bold text-ink group-hover:text-accent transition-colors truncate">
                      {char.name || 'Unnamed Character'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-dim font-mono">
                        {char.timestamp ? new Date(char.timestamp).toLocaleDateString() : 'Unknown Date'}
                      </span>
                      <span className="text-[10px] text-dim">
                        {filledSlots(char.data)}/3 slots
                      </span>
                      {/* Slot indicators */}
                      <div className="flex items-center gap-1">
                        <User className={`w-3 h-3 ${char.data?.face?.previewDataUrl ? 'text-accent' : 'text-dim'}`} />
                        <Shirt className={`w-3 h-3 ${char.data?.outfit?.previewDataUrl ? 'text-accent' : 'text-dim'}`} />
                        <Box className={`w-3 h-3 ${char.data?.object?.previewDataUrl ? 'text-accent' : 'text-dim'}`} />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDelete(char)}
                      className="p-2 hover:bg-danger/20 hover:text-danger rounded-md transition-colors text-dim"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { onLoad(char.data); onClose(); }}
                      className="p-2 bg-surface2 hover:bg-accent hover:text-white text-ink rounded-md transition-all shadow-lg"
                      title="Load Character"
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
            Characters save Face, Outfit & Object images. Loading replaces the active character tab.
          </p>
        </div>
      </div>
    </div>
  );
};
