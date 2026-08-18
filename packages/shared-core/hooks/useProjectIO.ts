/**
 * useProjectIO - Web project persistence
 *
 * Replaces the Electron file-dialog implementation with:
 * - export: download the project as a .nbproject (JSON) file
 * - import: load a .nbproject file picked via <input type="file">
 * - autosave: project state persisted to localStorage per project id
 */

import { useCallback } from 'react';
import { normalizePromptState } from '../types';
import type {
  PromptState,
  CharacterData,
  ElementState,
  ProjectFile,
  ElementInputMode,
} from '../types';
import {
  createInitialPromptState,
  createInitialCharacter,
  createInitialScene,
  createInitialImageInput,
} from './usePromptState';

/** Extract a display name from a file path or file name (without extension) */
export function projectNameFromPath(filePath: string): string {
  const base = filePath.replace(/\\/g, '/').split('/').pop() || 'Untitled';
  return base.replace(/\.nbproject$/i, '').replace(/\.json$/i, '');
}

interface ProjectIODeps {
  promptState: PromptState;
  characters: CharacterData[];
  sceneElement: ElementState;
  sceneInputMode: ElementInputMode;
  imageInput: ElementState;
  additionalReferenceImages: ElementState[];
  setPromptState: (state: PromptState) => void;
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

/** Build a ProjectFile data object from current state */
function buildProjectData(deps: ProjectIODeps): ProjectFile {
  const timestamp = Date.now();
  const projectName = deps.currentProjectName
    || (deps.promptState.subjectAction
      ? deps.promptState.subjectAction.slice(0, 30).replace(/[^a-z0-9]/gi, '-')
      : `project-${timestamp}`);
  const projectId = deps.currentProjectId || globalThis.crypto.randomUUID();

  return {
    id: projectId,
    name: projectName,
    version: '2.2.0',
    timestamp,
    promptState: deps.promptState,
    characters: deps.characters,
    sceneElement: deps.sceneElement,
    sceneInputMode: deps.sceneInputMode,
    imageInput: deps.imageInput,
    additionalReferenceImages: deps.additionalReferenceImages,
  };
}

export function useProjectIO(deps: ProjectIODeps) {
  /** Build a ProjectFile from current state (export / autosave) */
  const buildProjectDataForSave = useCallback((): ProjectFile => {
    return buildProjectData(deps);
  }, [deps]);

  /** Restore all state from a loaded ProjectFile */
  const restoreProjectState = useCallback((project: ProjectFile) => {
    const normalizedPromptState = normalizePromptState(project.promptState);

    deps.setPromptState(normalizedPromptState);
    deps.setCharacters(
      (project.characters || [createInitialCharacter(0)]).map(char => ({
        ...char,
        faceInputMode: normalizeInputMode(char.faceInputMode),
        outfitInputMode: normalizeInputMode(char.outfitInputMode),
        objectInputMode: normalizeInputMode(char.objectInputMode),
      }))
    );
    deps.setSceneElement(project.sceneElement || createInitialScene());
    deps.setSceneInputMode(normalizeInputMode(project.sceneInputMode));
    deps.setImageInput(project.imageInput || createInitialImageInput());
    deps.setAdditionalReferenceImages((project.additionalReferenceImages || []).map(reference => ({
      ...reference,
      id: 'anonymousReference',
      instanceId: reference.instanceId || globalThis.crypto.randomUUID(),
    })));

    if (deps.setCurrentProjectId) deps.setCurrentProjectId(project.id || globalThis.crypto.randomUUID());
    if (deps.setCurrentProjectName) deps.setCurrentProjectName(project.name || 'Untitled');
    if (deps.setHasUnsavedChanges) deps.setHasUnsavedChanges(false);
    deps.setIsManualPrompt(false);
    deps.setIsEditingPrompt(false);
    deps.setError(null);
  }, [deps]);

  const handleClearAll = useCallback(() => {
    deps.setPromptState(createInitialPromptState());
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
