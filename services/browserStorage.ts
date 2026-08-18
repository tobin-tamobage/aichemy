/**
 * browserStorage - Web-only persistence layer (localStorage + bundled JSON)
 *
 * Replaces the Electron file-system APIs for:
 * - built-in presets (fetched from public/presets/*.json)
 * - user presets, characters, recent projects, autosave, UI settings
 */

import type { Preset, ProjectFile, SavedCharacter } from '../types';

const KEYS = {
  userPresets: 'renderzero_user_presets_v1',
  characters: 'renderzero_characters_v1',
  recentProjects: 'renderzero_recent_projects_v1',
  settings: 'renderzero_settings_v1',
  autosavePrefix: 'renderzero_autosave:',
} as const;

const MAX_RECENT_PROJECTS = 10;

/** Built-in preset files bundled under public/presets/ */
export const BUILTIN_PRESET_FILES: string[] = [
  '60s_historical_epic_1768957394131.json',
  '60s_new_wave_romance_1768952540076.json',
  '70s_gritty_crime_drama_1768952862427.json',
  '80s_teen_drama_1768953000407.json',
  '8mm_home_movie_1768951323300.json',
  'action_movie_1773276573127.json',
  'analog_1768947076354.json',
  'astrophotography_1768947318044.json',
  'beauty_1768948212337.json',
  'boudoir_photography_1768948609889.json',
  'catalog_macro_detail_1768945830872.json',
  'dark_fantasy_1768953315732.json',
  'depth_map_1784894353069.json',
  'documentary_photography_1768948923459.json',
  'found_footage__cell_phone__1768954608875.json',
  'found_footage__vhs__1768953838845.json',
  'hollywood_blockbuster_movie_1784458642303.json',
  'indie_crime_film_1768951998493.json',
  'local_tv_interview_1768951569198.json',
  'lomo_photography_1768949230146.json',
  'luxury_ad_1768930660893.json',
  'modern_crime_drama_1768956701736.json',
  'modern_sci_fi_film_1768956358882.json',
  'paparazzi_1768949416433.json',
  'polaroid_1768949604709.json',
  'post_apocalyptic_film_1768956184591.json',
  'reportage_photography_1768949805541.json',
  'romantic_comedy_1768955445572.json',
  'sitcom_footage__recording__1768951001764.json',
  'spaghetti_western_1768957726635.json',
  'storyboard_1785260311903.json',
  'street_fashion_1768946192713.json',
  'studio_catalog_1768943759933.json',
  'studio_lay_flat_1768945027555.json',
  'technicolor_movie_1768957245143.json',
  'war_film_1768955612766.json',
  'youtube_documentary_1768952128595.json',
  'youtube_studio_1768951835400.json',
];

// ---------- low-level helpers ----------

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error('browserStorage: failed to write', key, err);
    return false;
  }
}

function presetUrl(filename: string): string {
  const base: string = import.meta.env?.BASE_URL || './';
  return `${base}presets/${filename}`;
}

// ---------- presets ----------

export async function loadBuiltinPresets(): Promise<Preset[]> {
  const results = await Promise.all(
    BUILTIN_PRESET_FILES.map(async (filename): Promise<Preset | null> => {
      try {
        const res = await fetch(presetUrl(filename));
        if (!res.ok) return null;
        const preset = (await res.json()) as Preset;
        return { ...preset, filename, type: 'bundled' };
      } catch {
        return null;
      }
    }),
  );
  return results.filter((p): p is Preset => p !== null);
}

export function loadUserPresets(): Preset[] {
  const presets = readJson<Preset[]>(KEYS.userPresets, []);
  return presets.map(p => ({ ...p, type: 'user' as const }));
}

/** Built-in first, then user presets. */
export async function loadAllPresets(): Promise<Preset[]> {
  const [builtin, user] = await Promise.all([loadBuiltinPresets(), Promise.resolve(loadUserPresets())]);
  return [...user, ...builtin];
}

export function saveUserPreset(preset: Preset): Preset[] {
  const presets = loadUserPresets();
  const entry: Preset = {
    ...preset,
    filename: preset.filename || `${preset.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${preset.timestamp}.json`,
    type: 'user',
  };
  const index = presets.findIndex(p => p.id === entry.id || p.filename === entry.filename);
  if (index >= 0) presets[index] = entry; else presets.push(entry);
  writeJson(KEYS.userPresets, presets);
  return presets;
}

/** Only user presets can be deleted; returns updated full user list. */
export function deleteUserPreset(preset: Preset): Preset[] {
  const presets = loadUserPresets().filter(p => p.id !== preset.id && p.filename !== preset.filename);
  writeJson(KEYS.userPresets, presets);
  return presets;
}

// ---------- characters ----------

export function loadCharacters(): SavedCharacter[] {
  return readJson<SavedCharacter[]>(KEYS.characters, []);
}

export function saveCharacter(character: SavedCharacter): SavedCharacter[] {
  const characters = loadCharacters();
  const entry: SavedCharacter = {
    ...character,
    filename: character.filename || `${character.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${character.timestamp}.json`,
  };
  const index = characters.findIndex(c => c.id === entry.id || c.filename === entry.filename);
  if (index >= 0) characters[index] = entry; else characters.push(entry);
  writeJson(KEYS.characters, characters);
  return characters;
}

export function deleteCharacter(character: SavedCharacter): SavedCharacter[] {
  const characters = loadCharacters().filter(c => c.id !== character.id && c.filename !== character.filename);
  writeJson(KEYS.characters, characters);
  return characters;
}

// ---------- recent projects + autosave ----------

export interface RecentProjectEntry {
  projectId: string;
  name: string;
  lastOpened: number;
}

export function loadRecentProjects(): RecentProjectEntry[] {
  return readJson<RecentProjectEntry[]>(KEYS.recentProjects, []);
}

export function touchRecentProject(projectId: string, name: string): RecentProjectEntry[] {
  const recents = loadRecentProjects().filter(r => r.projectId !== projectId);
  recents.unshift({ projectId, name, lastOpened: Date.now() });
  const trimmed = recents.slice(0, MAX_RECENT_PROJECTS);
  writeJson(KEYS.recentProjects, trimmed);
  return trimmed;
}

export function removeRecentProject(projectId: string): RecentProjectEntry[] {
  const recents = loadRecentProjects().filter(r => r.projectId !== projectId);
  writeJson(KEYS.recentProjects, recents);
  try { localStorage.removeItem(KEYS.autosavePrefix + projectId); } catch { /* ignore */ }
  return recents;
}

export function saveAutosave(projectId: string, project: ProjectFile): boolean {
  return writeJson(KEYS.autosavePrefix + projectId, project);
}

export function loadAutosave(projectId: string): ProjectFile | null {
  return readJson<ProjectFile | null>(KEYS.autosavePrefix + projectId, null);
}

// ---------- generic UI settings ----------

export function loadSetting<T>(key: string, fallback: T): T {
  const settings = readJson<Record<string, unknown>>(KEYS.settings, {});
  return key in settings ? (settings[key] as T) : fallback;
}

export function saveSetting(key: string, value: unknown): void {
  const settings = readJson<Record<string, unknown>>(KEYS.settings, {});
  settings[key] = value;
  writeJson(KEYS.settings, settings);
}

// ---------- file download / upload helpers ----------

export function downloadTextFile(filename: string, content: string, mimeType = 'application/json'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function readFileAsText(file: File): Promise<string> {
  const { promise, resolve, reject } = Promise.withResolvers<string>();
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result ?? ''));
  reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
  reader.readAsText(file);
  return promise;
}
