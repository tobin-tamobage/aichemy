/**
 * browserStorage - Web-only persistence layer (localStorage + bundled JSON)
 *
 * Replaces the Electron file-system APIs for:
 * - built-in presets (fetched from public/presets/*.json)
 * - user presets, characters, recent projects, autosave, UI settings
 */

import type { Preset, ProjectFile, SavedCharacter } from '../types';
import type { CustomRecipe } from '../domains/custom/types';

const KEYS = {
  /** Legacy user-preset key (cinematic) — dibaca + dimigrasi ke aichemy-presets-cinematic. */
  userPresets: 'renderzero_user_presets_v1',
  characters: 'renderzero_characters_v1',
  recentProjects: 'renderzero_recent_projects_v1',
  settings: 'renderzero_settings_v1',
  autosavePrefix: 'renderzero_autosave:',
} as const;

/** Key preset user per domain (spec: aichemy-presets-<domainId>). */
const userPresetKey = (domainId: string): string => `aichemy-presets-${domainId}`;

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

function presetUrl(filename: string, domainId?: string): string {
  const base: string = import.meta.env?.BASE_URL || './';
  // Kompatibilitas: cinematic tetap public/presets/; domain lain public/presets/<domainId>/
  const folder = domainId && domainId !== 'cinematic' ? `presets/${domainId}/` : 'presets/';
  return `${base}${folder}${filename}`;
}

// ---------- presets ----------

/** Builtin presets per domain. Cinematic memakai daftar statis di public/presets/ (path lama).
 *  Domain lain: folder public/presets/<domainId>/ berisi index.json (array filename) — folder
 *  boleh belum ada → return []. */
export async function loadBuiltinPresets(domainId: string): Promise<Preset[]> {
  let filenames: string[];
  if (domainId === 'cinematic') {
    filenames = BUILTIN_PRESET_FILES;
  } else {
    try {
      const res = await fetch(presetUrl('index.json', domainId));
      if (!res.ok) return [];
      const manifest = (await res.json()) as unknown;
      if (!Array.isArray(manifest)) return [];
      filenames = manifest.filter((f): f is string => typeof f === 'string');
    } catch {
      return [];
    }
  }

  const results = await Promise.all(
    filenames.map(async (filename): Promise<Preset | null> => {
      try {
        const res = await fetch(presetUrl(filename, domainId));
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

export function loadUserPresets(domainId: string): Preset[] {
  const key = userPresetKey(domainId);
  let presets = readJson<Preset[]>(key, []);
  // Migrasi sekali: preset user cinematic lama tersimpan di renderzero_user_presets_v1.
  if (presets.length === 0 && domainId === 'cinematic') {
    presets = readJson<Preset[]>(KEYS.userPresets, []);
    if (presets.length > 0) writeJson(key, presets);
  }
  return presets.map(p => ({ ...p, type: 'user' as const }));
}

/** Builtin first, then user presets — keduanya scoped per domain. */
export async function loadAllPresets(domainId: string): Promise<Preset[]> {
  const [builtin, user] = await Promise.all([loadBuiltinPresets(domainId), Promise.resolve(loadUserPresets(domainId))]);
  return [...user, ...builtin];
}

export function saveUserPreset(preset: Preset, domainId: string): Preset[] {
  const presets = loadUserPresets(domainId);
  const entry: Preset & { domainId: string } = {
    ...preset,
    domainId,
    filename: preset.filename || `${preset.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${preset.timestamp}.json`,
    type: 'user',
  };
  const index = presets.findIndex(p => p.id === entry.id || p.filename === entry.filename);
  if (index >= 0) presets[index] = entry; else presets.push(entry);
  writeJson(userPresetKey(domainId), presets);
  return presets;
}

/** Only user presets can be deleted; returns updated full user list for the domain. */
export function deleteUserPreset(preset: Preset, domainId: string): Preset[] {
  const presets = loadUserPresets(domainId).filter(p => p.id !== preset.id && p.filename !== preset.filename);
  writeJson(userPresetKey(domainId), presets);
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
  /** Domain recipe id — opsional, backward compatible dengan entry lama (default 'cinematic'). */
  domainId?: string;
}

export function loadRecentProjects(): RecentProjectEntry[] {
  return readJson<RecentProjectEntry[]>(KEYS.recentProjects, []);
}

export function touchRecentProject(projectId: string, name: string, domainId?: string): RecentProjectEntry[] {
  const recents = loadRecentProjects().filter(r => r.projectId !== projectId);
  recents.unshift({ projectId, name, lastOpened: Date.now(), ...(domainId ? { domainId } : {}) });
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

// ---------- custom studios (phase 5) ----------

const CUSTOM_STUDIOS_KEY = 'aichemy-custom-studios';

/**
 * Semua fungsi di section ini WAJIB aman di Node (tanpa localStorage) —
 * scripts/generate-asset-checklist.mjs membundel domains/index.ts yang
 * mengimpor modul ini secara transitif.
 */
export function loadCustomRecipes(): CustomRecipe[] {
  if (typeof localStorage === 'undefined') return [];
  const raw = readJson<unknown>(CUSTOM_STUDIOS_KEY, []);
  if (!Array.isArray(raw)) return [];
  // Validasi penuh ada di validate.ts saat save/import; di sini hanya
  // filter shape minimal supaya cache adapter tidak crash pada data korup.
  return raw.filter(
    (r): r is CustomRecipe =>
      !!r && typeof r === 'object' &&
      typeof (r as CustomRecipe).id === 'string' &&
      Array.isArray((r as CustomRecipe).sections) &&
      Array.isArray((r as CustomRecipe).template),
  );
}

/** Upsert by id. Returns false pada kegagalan tulis / environment Node. */
export function saveCustomRecipe(recipe: CustomRecipe): boolean {
  if (typeof localStorage === 'undefined') return false;
  const all = loadCustomRecipes();
  const idx = all.findIndex(r => r.id === recipe.id);
  if (idx >= 0) all[idx] = recipe; else all.push(recipe);
  return writeJson(CUSTOM_STUDIOS_KEY, all);
}

/** Returns false saat id tidak ditemukan atau environment Node. */
export function deleteCustomRecipe(id: string): boolean {
  if (typeof localStorage === 'undefined') return false;
  const all = loadCustomRecipes();
  const next = all.filter(r => r.id !== id);
  if (next.length === all.length) return false;
  return writeJson(CUSTOM_STUDIOS_KEY, next);
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
