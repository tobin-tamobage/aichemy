/**
 * useProjectIO - Web project persistence (format v3)
 *
 * Project file format v3 is generic and domain-driven:
 *   { id, name, version: '3.0.0', timestamp, domainId, domainState, referencePhotoDataUrl? }
 *
 * `domainState` is the domain's generic state (Record<string, unknown>). The cinematic
 * domain folds its Elements Tool state (characters / scene / reference images) into a
 * reserved key inside domainState (CINEMATIC_ELEMENTS_STATE_KEY), so it survives the
 * round trip. Legacy v2 files (promptState-based, cinematic) are migrated to v3 on
 * import by normalizeProjectFile, preserving their cinematic elements.
 *
 * Operations:
 * - buildProjectData: current state → v3 ProjectFile (export / autosave)
 * - restoreProjectState: apply id/name + cinematic elements from a normalized project
 * - handleClearAll: reset cinematic elements + flags
 */

import { useCallback } from 'react';
import { normalizePromptState } from '../types';
import type {
  CharacterData,
  ElementState,
  ElementInputMode,
  ProjectFile,
  CinematicElementsState,
} from '../types';
import {
  createInitialCharacter,
  createInitialScene,
  createInitialImageInput,
} from './usePromptState';
import { CINEMATIC_ELEMENTS_STATE_KEY } from '../types';

/** Cinematic domain id — legacy v2 files always migrate here. */
export const LEGACY_CINEMATIC_DOMAIN_ID = 'cinematic';

/** Normalized v3 view of any (v2 or v3) project file, ready for restore. */
export interface NormalizedProject {
  id: string;
  name: string;
  version: string;
  timestamp: number;
  domainId: string;
  domainState: Record<string, unknown>;
  referencePhotoDataUrl?: string;
  /** Cinematic Elements Tool state — present when the file carries one. */
  elements?: CinematicElementsState;
}

/** Migrate a raw parsed .nbproject object (v2 or v3) into the canonical v3 view. */
export function normalizeProjectFile(raw: unknown): NormalizedProject {
  const project = (raw ?? {}) as Record<string, unknown>;
  const timestamp = typeof project.timestamp === 'number' ? project.timestamp : Date.now();
  const id = typeof project.id === 'string' && project.id ? project.id : globalThis.crypto.randomUUID();
  const name = typeof project.name === 'string' && project.name ? project.name : 'Untitled';

  const domainStateRaw = project.domainState;
  const hasDomainState = !!domainStateRaw && typeof domainStateRaw === 'object';
  const promptStateRaw = project.promptState;
  const hasPromptState = !!promptStateRaw && typeof promptStateRaw === 'object';

  let domainId: string;
  let domainState: Record<string, unknown>;
  let elements: CinematicElementsState | undefined;

  if (hasDomainState) {
    // v3 (or transitional save with domainState) — read as-is.
    domainId = typeof project.domainId === 'string' && project.domainId
      ? project.domainId
      : LEGACY_CINEMATIC_DOMAIN_ID;
    const ds = { ...(domainStateRaw as Record<string, unknown>) };
    const elems = ds[CINEMATIC_ELEMENTS_STATE_KEY];
    if (elems && typeof elems === 'object') {
      elements = elems as CinematicElementsState;
    }
    delete ds[CINEMATIC_ELEMENTS_STATE_KEY];
    domainState = ds;
  } else if (hasPromptState) {
    // Legacy v2 — cinematic domain; migrate prompt + top-level elements.
    domainId = LEGACY_CINEMATIC_DOMAIN_ID;
    domainState = normalizePromptState(promptStateRaw as never) as unknown as Record<string, unknown>;
    elements = {
      characters: (project.characters as CharacterData[] | undefined),
      sceneElement: (project.sceneElement as ElementState | undefined),
      sceneInputMode: (project.sceneInputMode as ElementInputMode | undefined),
      imageInput: (project.imageInput as ElementState | undefined),
      additionalReferenceImages: (project.additionalReferenceImages as ElementState[] | undefined),
    };
  } else {
    // Degenerate — empty cinematic project.
    domainId = LEGACY_CINEMATIC_DOMAIN_ID;
    domainState = {};
  }

  return {
    id,
    name,
    version: typeof project.version === 'string' ? project.version : '3.0.0',
    timestamp,
    domainId,
    domainState,
    referencePhotoDataUrl: typeof project.referencePhotoDataUrl === 'string'
      ? project.referencePhotoDataUrl
      : undefined,
    elements,
  };
}

/** Extract a display name from a file path or file name (without extension) */
export function projectNameFromPath(filePath: string): string {
  const base = filePath.replace(/\\/g, '/').split('/').pop() || 'Untitled';
  return base.replace(/\.nbproject$/i, '').replace(/\.json$/i, '');
}

interface ProjectIODeps {
  /** Current domain id (value read at build time). */
  domainId: string;
  /** Current domain state (value read at build time). */
  domainState: Record<string, unknown>;
  referencePhotoDataUrl?: string;
  // Cinematic Elements Tool state — folded into domainState for the cinematic domain.
  characters: CharacterData[];
  sceneElement: ElementState;
  sceneInputMode: ElementInputMode;
  imageInput: ElementState;
  additionalReferenceImages: ElementState[];
  setCharacters: (chars: CharacterData[]) => void;
  setSceneElement: (el: ElementState) => void;
  setSceneInputMode: (mode: ElementInputMode) => void;
  setImageInput: (el: ElementState) => void;
  setAdditionalReferenceImages: (images: ElementState[]) => void;
  setError: (err: string | null) => void;
  setIsManualPrompt: (v: boolean) => void;
  setIsEditingPrompt: (v: boolean) => void;
  currentProjectId?: string | null;
  setCurrentProjectId?: (id: string | null) => void;
  currentProjectName?: string | null;
  setCurrentProjectName?: (name: string | null) => void;
  setHasUnsavedChanges?: (v: boolean) => void;
}

const normalizeInputMode = (mode: unknown): ElementInputMode => {
  return mode === 'stitch' ? 'stitch' : 'single';
};

/** Build a v3 ProjectFile data object from current state */
function buildProjectData(deps: ProjectIODeps): ProjectFile {
  const timestamp = Date.now();
  const projectName = deps.currentProjectName || `project-${timestamp}`;
  const projectId = deps.currentProjectId || globalThis.crypto.randomUUID();

  // Fold cinematic Elements Tool state into domainState so it round-trips.
  const domainState: Record<string, unknown> = { ...deps.domainState };
  if (deps.domainId === LEGACY_CINEMATIC_DOMAIN_ID) {
    domainState[CINEMATIC_ELEMENTS_STATE_KEY] = {
      characters: deps.characters,
      sceneElement: deps.sceneElement,
      sceneInputMode: deps.sceneInputMode,
      imageInput: deps.imageInput,
      additionalReferenceImages: deps.additionalReferenceImages,
    };
  }

  return {
    id: projectId,
    name: projectName,
    version: '3.0.0',
    timestamp,
    domainId: deps.domainId,
    domainState,
    referencePhotoDataUrl: deps.referencePhotoDataUrl,
  };
}

export function useProjectIO(deps: ProjectIODeps) {
  /** Build a v3 ProjectFile from current state (export / autosave) */
  const buildProjectDataForSave = useCallback((): ProjectFile => {
    return buildProjectData(deps);
  }, [deps]);

  /**
   * Restore id/name + cinematic elements from a normalized project.
   * Domain id + domainState are applied by the caller (App) via useDomainState.
   */
  const restoreProjectState = useCallback((project: NormalizedProject) => {
    const elements = project.elements;
    if (elements) {
      deps.setCharacters(
        (elements.characters || [createInitialCharacter(0)]).map(char => ({
          ...char,
          faceInputMode: normalizeInputMode(char.faceInputMode),
          outfitInputMode: normalizeInputMode(char.outfitInputMode),
          objectInputMode: normalizeInputMode(char.objectInputMode),
        }))
      );
      deps.setSceneElement(elements.sceneElement || createInitialScene());
      deps.setSceneInputMode(normalizeInputMode(elements.sceneInputMode));
      deps.setImageInput(elements.imageInput || createInitialImageInput());
      deps.setAdditionalReferenceImages((elements.additionalReferenceImages || []).map(reference => ({
        ...reference,
        id: 'anonymousReference',
        instanceId: reference.instanceId || globalThis.crypto.randomUUID(),
      })));
    }

    if (deps.setCurrentProjectId) deps.setCurrentProjectId(project.id);
    if (deps.setCurrentProjectName) deps.setCurrentProjectName(project.name);
    if (deps.setHasUnsavedChanges) deps.setHasUnsavedChanges(false);
    deps.setIsManualPrompt(false);
    deps.setIsEditingPrompt(false);
    deps.setError(null);
  }, [deps]);

  const handleClearAll = useCallback(() => {
    deps.setCharacters([createInitialCharacter(0)]);
    deps.setSceneElement(createInitialScene());
    deps.setSceneInputMode('single');
    deps.setImageInput(createInitialImageInput());
    deps.setAdditionalReferenceImages([]);
    deps.setError(null);
    deps.setIsManualPrompt(false);
    deps.setIsEditingPrompt(false);
    if (deps.setCurrentProjectId) deps.setCurrentProjectId(null);
    if (deps.setCurrentProjectName) deps.setCurrentProjectName(null);
    if (deps.setHasUnsavedChanges) deps.setHasUnsavedChanges(false);
  }, [deps]);

  return {
    buildProjectData: buildProjectDataForSave,
    restoreProjectState,
    handleClearAll,
  };
}
