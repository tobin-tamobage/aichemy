/**
 * App.tsx - Main Application Component
 *
 * RenderZero Web - Cinematic AI Prompt Builder (frontend-only)
 *
 * Users compose cinematic image prompts from structured controls, then
 * copy or export the constructed prompt text to paste into external tools
 * (Gemini, ChatGPT, ...). No image/video generation, no API keys, no backend.
 *
 * Persistence: projects export/import as .nbproject JSON files; recent
 * projects and autosave live in localStorage (services/browserStorage.ts).
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { normalizePromptState } from './types';
import { Selector } from './components/Selector';
import { Slider } from './components/Slider';
import { VisualSelector } from './components/VisualSelector';
import { FStopSelector } from './components/FStopSelector';
import { TextInput } from './components/TextInput';
import { PresetLibraryModal } from './components/PresetLibraryModal';
import { CharacterLibraryModal } from './components/CharacterLibraryModal';
import { InpaintEditor } from './components/InpaintEditor';
import { ClearableControl } from './components/ClearableControl';
import { StartScreen } from './components/StartScreen';
import { StudioAccordionSection } from './components/StudioAccordionSection';
import { StudioWorkspaceShell } from './components/StudioWorkspaceShell';
import { UnsavedChangesModal } from './components/UnsavedChangesModal';
import { NewProjectModal } from './components/NewProjectModal';
import { MentionTextarea } from './components/video/MentionTextarea';
import type { MentionOption } from './components/video/MentionTextarea';

import {
  usePromptState, usePromptAutoBuilder, useReferenceImages,
  useElements, useProjectIO, projectNameFromPath, useTheme,
  createInitialPromptState, createInitialCharacter, createInitialScene, createInitialImageInput,
} from './hooks';

import { createStateComparisonKey } from './services/stateComparisonKey';
import { mergePresetData } from './services/presetData';
import {
  downloadTextFile,
  readFileAsText,
  saveAutosave,
  loadAutosave,
  touchRecentProject,
} from './services/browserStorage';

import {
  SHOT_TYPES, LIGHTING_TYPES, CAMERAS, LENSES, FOCAL_LENGTHS,
  FILM_STOCKS, PHOTOGRAPHERS, MOVIE_LOOKS, FILTERS, ASPECT_RATIOS,
  VIEWING_DIRECTIONS,
} from './constants';

import type {
  CharacterData,
  ElementId,
  ElementState,
  InlineReferenceImage,
  PresetWithPrompts,
  PromptState,
  ReferenceImageCategory,
  UnsavedChangesAction,
  ProjectFile,
} from './types';

import {
  Camera, Aperture, Film, Video, Download, AlertCircle, Layers,
  X, Copy, Check, User, Shirt, Box, ImageIcon, Edit2, Bookmark,
  RefreshCw, Upload, Plus, Home, FolderOpen, FileDown, Moon, Sun,
} from 'lucide-react';

// ============================================
// HELPER COMPONENTS
// ============================================

/** Total reference images folded into the constructed prompt. */
const MAX_REFERENCE_IMAGES = 14;

const filterImageAspectRatioOptions = (aspectRatios: string[]): string[] =>
  aspectRatios.filter(aspectRatio => aspectRatio !== 'auto');

/** Returns the icon component for an element type */
const elementIcon = (id: ElementId) => {
  const icons: Record<string, React.ReactNode> = {
    character: <User className="w-7 h-7 text-yellow-500" />,
    outfit: <Shirt className="w-7 h-7 text-yellow-500" />,
    object: <Box className="w-7 h-7 text-yellow-500" />,
    scene: <ImageIcon className="w-7 h-7 text-yellow-500" />,
    imageInput: <Upload className="w-7 h-7 text-yellow-500" />,
    anonymousReference: <ImageIcon className="w-7 h-7 text-yellow-500" />,
  };
  return icons[id] || <ImageIcon className="w-7 h-7 text-yellow-500" />;
};

/** Drag-and-drop overlay shown when dragging an image over an element cell */
const DropOverlay = () => (
  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 pointer-events-none">
    <span className="text-yellow-500 text-xs font-black uppercase tracking-widest">Drop image here</span>
  </div>
);

type PromptReferenceDescriptor = InlineReferenceImage & {
  key: string;
  number: number;
  displayText: string;
  fullText: string;
  assetFileName: string;
  previewDataUrl: string | null;
  mentionTag?: string;
  mentionLabel?: string;
};

/** Builds drag event handlers for an element cell */
const makeElementDragHandlers = (
  elementId: ElementId,
  setDragOverElementId: (id: ElementId | null) => void,
  handleDropImage: (id: ElementId, source: File | string, setError?: (msg: string | null) => void) => void,
  setError?: (msg: string | null) => void,
) => ({
  onDragOver: (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverElementId(elementId);
  },
  onDragEnter: (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverElementId(elementId);
  },
  onDragLeave: (e: React.DragEvent) => {
    e.stopPropagation();
    const related = e.relatedTarget as Node | null;
    if (related && e.currentTarget.contains(related)) return;
    setDragOverElementId(null);
  },
  onDrop: (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverElementId(null);
    const inAppImage = e.dataTransfer.getData('text/nano-banana-image');
    if (inAppImage) {
      handleDropImage(elementId, inAppImage, setError);
      return;
    }
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleDropImage(elementId, file, setError);
      return;
    }
    const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    if (url && (url.startsWith('data:image/') || url.startsWith('http'))) {
      handleDropImage(elementId, url, setError);
    }
  },
});

const makeAdditionalReferenceDragHandlers = (
  index: number,
  setDragOverAdditionalReferenceIndex: (index: number | null) => void,
  handleDropAdditionalReferenceImage: (index: number, source: File | string, setError?: (msg: string | null) => void) => void,
  setError?: (msg: string | null) => void,
) => ({
  onDragOver: (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverAdditionalReferenceIndex(index);
  },
  onDragEnter: (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverAdditionalReferenceIndex(index);
  },
  onDragLeave: (e: React.DragEvent) => {
    e.stopPropagation();
    const related = e.relatedTarget as Node | null;
    if (related && e.currentTarget.contains(related)) return;
    setDragOverAdditionalReferenceIndex(null);
  },
  onDrop: (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverAdditionalReferenceIndex(null);
    const inAppImage = e.dataTransfer.getData('text/nano-banana-image');
    if (inAppImage) {
      handleDropAdditionalReferenceImage(index, inAppImage, setError);
      return;
    }
    const files = Array.from(e.dataTransfer.files || []);
    const file = files.find(f => f.type.startsWith('image/'));
    if (file) {
      handleDropAdditionalReferenceImage(index, file, setError);
    } else if (setError) {
      setError('Only image files can be dropped here');
    }
  },
});

type StudioSectionId = 'subjectFraming' | 'lightingMood' | 'cameraGear' | 'styleAesthetics' | 'elements';
type StudioExpandedSections = Record<StudioSectionId, boolean>;

const isDesktopStudioViewport = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return true;
  }
  return window.matchMedia('(min-width: 1280px)').matches;
};

const hasNonEmptyValue = (value?: string | null) => !!value?.trim();
const hasLoadedElement = (element?: ElementState | null) => !!(element?.base64Data || element?.previewDataUrl);

const hasLoadedCharacterReferences = (characters: CharacterData[]) => characters.some(character => (
  hasLoadedElement(character.face)
  || hasLoadedElement(character.outfit)
  || hasLoadedElement(character.object)
));

const createDefaultExpandedSections = (
  promptState: PromptState,
  characters: CharacterData[],
  sceneElement: ElementState,
  imageInput: ElementState,
  additionalReferenceImages: ElementState[],
): StudioExpandedSections => {
  if (!isDesktopStudioViewport()) {
    return {
      subjectFraming: true,
      lightingMood: true,
      cameraGear: true,
      styleAesthetics: true,
      elements: true,
    };
  }

  return {
    subjectFraming: true,
    lightingMood: hasNonEmptyValue(promptState.lighting) || hasNonEmptyValue(promptState.mood),
    cameraGear: hasNonEmptyValue(promptState.camera)
      || hasNonEmptyValue(promptState.focalLength)
      || hasNonEmptyValue(promptState.lens)
      || hasNonEmptyValue(promptState.fStop)
      || hasNonEmptyValue(promptState.filmStock),
    styleAesthetics: hasNonEmptyValue(promptState.photographer)
      || hasNonEmptyValue(promptState.movieLook)
      || promptState.filter.length > 0,
    elements: !!promptState.showNewAnglePrompt
      || characters.length > 1
      || hasLoadedCharacterReferences(characters)
      || hasLoadedElement(sceneElement)
      || hasLoadedElement(imageInput)
      || additionalReferenceImages.some(reference => hasLoadedElement(reference)),
  };
};

// ============================================
// MAIN APP COMPONENT
// ============================================

export default function App() {
  // --- Custom Hooks ---
  const prompt = usePromptState();
  const elements = useElements();
  const { theme, toggle } = useTheme();

  // --- Local UI State ---
  const [showPresetLibrary, setShowPresetLibrary] = useState(false);
  const [showCharacterLibrary, setShowCharacterLibrary] = useState(false);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  const [showExportFeedback, setShowExportFeedback] = useState(false);
  const [elementError, setElementError] = useState<string | null>(null);
  const [generationMode, setGenerationMode] = useState<'generate' | 'edit'>('generate');

  const [expandedSections, setExpandedSections] = useState<StudioExpandedSections>(() => (
    createDefaultExpandedSections(
      prompt.promptState,
      elements.characters,
      elements.sceneElement,
      elements.imageInput,
      elements.additionalReferenceImages,
    )
  ));

  // --- App View State ---
  const [appView, setAppView] = useState<'start' | 'editor'>('start');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [pendingNavAction, setPendingNavAction] = useState<(() => void) | null>(null);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState<string | null>(null);
  const studioLayoutResetRequestedRef = useRef(false);
  const isRestoringProjectRef = useRef(false);
  const importFileInputRef = useRef<HTMLInputElement | null>(null);

  const toggleSection = useCallback((sectionId: StudioSectionId) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }, []);

  // --- Project IO ---
  const projectIO = useProjectIO({
    promptState: prompt.promptState,
    characters: elements.characters,
    sceneElement: elements.sceneElement,
    sceneInputMode: elements.sceneInputMode,
    imageInput: elements.imageInput,
    additionalReferenceImages: elements.additionalReferenceImages,
    setPromptState: prompt.setPromptState,
    setCharacters: elements.setCharacters,
    setSceneElement: elements.setSceneElement,
    setSceneInputMode: elements.setSceneInputMode,
    setImageInput: elements.setImageInput,
    setAdditionalReferenceImages: elements.setAdditionalReferenceImages,
    setError: setElementError,
    setIsManualPrompt: prompt.setIsManualPrompt,
    setIsEditingPrompt: prompt.setIsEditingPrompt,
    currentProjectId,
    setCurrentProjectId,
    currentProjectName,
    setCurrentProjectName,
    setHasUnsavedChanges,
  });

  // --- Track dirty state on prompt/setting changes ---
  const projectSnapshotRef = useRef<string | null>(null);
  const currentProjectSnapshot = useMemo(
    () => createStateComparisonKey({ promptState: prompt.promptState }),
    [prompt.promptState],
  );

  // Capture a clean snapshot whenever a project is loaded/saved/created
  useEffect(() => {
    if (!hasUnsavedChanges && appView === 'editor') {
      projectSnapshotRef.current = currentProjectSnapshot;
    }
  }, [hasUnsavedChanges, appView, currentProjectSnapshot]);

  // Compare current state to snapshot — mark dirty if changed
  useEffect(() => {
    if (appView !== 'editor') return;
    if (isRestoringProjectRef.current) return;
    if (projectSnapshotRef.current === null) return;
    if (currentProjectSnapshot !== projectSnapshotRef.current) {
      setHasUnsavedChanges(true);
    }
  }, [currentProjectSnapshot, appView]);

  // --- Autosave to localStorage (debounced) ---
  const autosaveTimeoutRef = useRef<number | null>(null);
  useEffect(() => {
    if (appView !== 'editor' || !currentProjectId) return;
    clearTimeout(autosaveTimeoutRef.current ?? undefined);
    autosaveTimeoutRef.current = window.setTimeout(() => {
      const data = projectIO.buildProjectData();
      data.id = currentProjectId;
      data.name = currentProjectName || data.name;
      if (saveAutosave(currentProjectId, data)) {
        touchRecentProject(currentProjectId, data.name);
      }
    }, 1000);
    return () => clearTimeout(autosaveTimeoutRef.current ?? undefined);
  }, [appView, currentProjectId, currentProjectName, currentProjectSnapshot, projectIO]);

  // --- Warn before leaving the page with unsaved changes ---
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  // --- Project Management Handlers ---

  /** Check for unsaved changes before navigating. If dirty, show modal; otherwise run action immediately. */
  const requestNavigation = useCallback((action: () => void) => {
    if (hasUnsavedChanges) {
      setPendingNavAction(() => action);
      setShowUnsavedModal(true);
    } else {
      action();
    }
  }, [hasUnsavedChanges]);

  /** Export the current project as a .nbproject JSON download. */
  const handleExportProject = useCallback(() => {
    const data = projectIO.buildProjectData();
    const safeName = (data.name || 'untitled').replace(/[^a-z0-9]+/gi, '_').toLowerCase();
    downloadTextFile(`${safeName}.nbproject`, JSON.stringify(data, null, 2));
    if (currentProjectId) {
      saveAutosave(data.id, data);
      touchRecentProject(data.id, data.name);
    }
    setHasUnsavedChanges(false);
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2000);
  }, [projectIO, currentProjectId]);

  /** Import a .nbproject file picked via the hidden file input. */
  const handleImportFile = useCallback(async (file: File) => {
    isRestoringProjectRef.current = true;
    try {
      const text = await readFileAsText(file);
      const project = JSON.parse(text) as ProjectFile;
      if (!project || typeof project !== 'object' || !project.promptState) {
        throw new Error('Not a valid .nbproject file');
      }
      if (!project.id) project.id = globalThis.crypto.randomUUID();
      if (!project.name) project.name = projectNameFromPath(file.name);
      projectIO.restoreProjectState(project);
      saveAutosave(project.id, project);
      touchRecentProject(project.id, project.name);
      studioLayoutResetRequestedRef.current = true;
      setTimeout(() => { isRestoringProjectRef.current = false; }, 100);
      setAppView('editor');
    } catch (err) {
      isRestoringProjectRef.current = false;
      setElementError(`Failed to import project: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [projectIO]);

  /** Load a project from the localStorage autosave of a recent entry. */
  const handleLoadRecentProject = useCallback((projectId: string) => {
    const project = loadAutosave(projectId);
    if (!project) {
      setElementError('Saved state for this project is no longer available. Import the .nbproject file instead.');
      return;
    }
    isRestoringProjectRef.current = true;
    projectIO.restoreProjectState(project);
    touchRecentProject(projectId, project.name);
    studioLayoutResetRequestedRef.current = true;
    setTimeout(() => { isRestoringProjectRef.current = false; }, 100);
    setAppView('editor');
  }, [projectIO]);

  /** Handle the unsaved changes modal result */
  const handleUnsavedAction = useCallback((action: UnsavedChangesAction) => {
    setShowUnsavedModal(false);

    if (action === 'cancel') {
      setPendingNavAction(null);
      return;
    }

    if (action === 'save') {
      handleExportProject();
    }

    if (pendingNavAction) {
      pendingNavAction();
      setPendingNavAction(null);
    }
  }, [pendingNavAction, handleExportProject]);

  /** New Project: clear state, enter editor, autosave initial state */
  const handleNewProject = useCallback((name?: string) => {
    projectIO.handleClearAll();
    setExpandedSections(createDefaultExpandedSections(
      createInitialPromptState(),
      [createInitialCharacter(0)],
      createInitialScene(),
      createInitialImageInput(),
      [],
    ));
    const id = globalThis.crypto?.randomUUID?.() ?? `proj-${Date.now()}`;
    const projectName = name?.trim() || 'Untitled';
    setCurrentProjectId(id);
    setCurrentProjectName(projectName);
    setHasUnsavedChanges(false);
    setAppView('editor');
  }, [projectIO]);

  /** Open Project: trigger the hidden file input */
  const handleOpenProject = useCallback(() => {
    importFileInputRef.current?.click();
  }, []);

  const handleClearWorkspace = useCallback(() => {
    projectIO.handleClearAll();
    setExpandedSections(createDefaultExpandedSections(
      createInitialPromptState(),
      [createInitialCharacter(0)],
      createInitialScene(),
      createInitialImageInput(),
      [],
    ));
  }, [projectIO]);

  // --- Auto-switch generation mode based on global reference image ---
  useEffect(() => {
    setGenerationMode(elements.imageInput.base64Data ? 'edit' : 'generate');
  }, [elements.imageInput.base64Data]);

  // Reset accordion layout after a project is loaded
  useEffect(() => {
    if (appView !== 'editor' || !studioLayoutResetRequestedRef.current) {
      return;
    }

    studioLayoutResetRequestedRef.current = false;
    setExpandedSections(createDefaultExpandedSections(
      prompt.promptState,
      elements.characters,
      elements.sceneElement,
      elements.imageInput,
      elements.additionalReferenceImages,
    ));
  }, [
    appView,
    prompt.promptState,
    elements.characters,
    elements.sceneElement,
    elements.imageInput,
    elements.additionalReferenceImages,
  ]);

  useEffect(() => {
    if (elementError) {
      setExpandedSections(prev => (prev.elements ? prev : { ...prev, elements: true }));
    }
  }, [elementError]);

  // --- Auto-build prompt when state changes ---
  usePromptAutoBuilder(
    prompt.promptState,
    prompt.isManualPrompt,
    prompt.prevPromptStateRef,
    elements.imageInput,
    generationMode,
    prompt.setFinalPrompt,
  );

  // --- Reference image descriptors folded into the prompt ---
  const refs = useReferenceImages(
    elements.characters,
    elements.sceneElement,
    elements.imageInput,
    elements.additionalReferenceImages,
    MAX_REFERENCE_IMAGES,
    undefined,
    'image',
  );

  const currentReferenceDescriptors = useMemo<PromptReferenceDescriptor[]>(
    () => generationMode === 'edit' ? refs.activeReferenceDescriptorsForEdit : refs.activeReferenceDescriptors,
    [generationMode, refs.activeReferenceDescriptors, refs.activeReferenceDescriptorsForEdit],
  );
  const currentOverflowReferenceDescriptors = useMemo<PromptReferenceDescriptor[]>(
    () => generationMode === 'edit' ? refs.overflowReferenceDescriptorsForEdit : refs.overflowReferenceDescriptors,
    [generationMode, refs.overflowReferenceDescriptors, refs.overflowReferenceDescriptorsForEdit],
  );

  const currentElementsInstructionFull = generationMode === 'edit'
    ? refs.elementsInstructionFullEdit
    : refs.elementsInstructionFull;
  const currentElementsInstructionDisplay = generationMode === 'edit'
    ? refs.elementsInstructionDisplayEdit
    : refs.elementsInstructionDisplay;

  const activeAnonymousReferenceNumbers = useMemo(
    () => new Map<string, number>(
      currentReferenceDescriptors
        .filter(descriptor => descriptor.category === 'anonymous')
        .map(descriptor => [descriptor.key, descriptor.number]),
    ),
    [currentReferenceDescriptors],
  );
  const overflowAnonymousReferenceKeys = useMemo(
    () => new Set<string>(
      currentOverflowReferenceDescriptors
        .filter(descriptor => descriptor.category === 'anonymous')
        .map(descriptor => descriptor.key),
    ),
    [currentOverflowReferenceDescriptors],
  );
  const nonAnonymousReferenceCount = useMemo(
    () => currentReferenceDescriptors.filter(descriptor => descriptor.category !== 'anonymous').length,
    [currentReferenceDescriptors],
  );
  const maxAnonymousReferenceSlots = Math.max(0, MAX_REFERENCE_IMAGES - nonAnonymousReferenceCount);
  const activeAnonymousReferenceCount = activeAnonymousReferenceNumbers.size;
  const remainingAnonymousReferenceSlots = Math.max(0, maxAnonymousReferenceSlots - elements.additionalReferenceImages.length);
  const canAddAdditionalReference = elements.additionalReferenceImages.length < maxAnonymousReferenceSlots;

  // --- Character + image mention options for Subject & Action field ---
  const subjectCharacterMentions = useMemo<MentionOption[]>(() => {
    const options: MentionOption[] = [];
    elements.characters.forEach((c, i) => {
      const hasImages = !!(c.face.base64Data || c.outfit.base64Data || c.object.base64Data);
      if (!hasImages) return;
      const parts: string[] = [];
      if (c.face.base64Data) parts.push('face');
      if (c.outfit.base64Data) parts.push('outfit');
      if (c.object.base64Data) parts.push('object');
      options.push({
        tag: `@Character${i + 1}`,
        label: `Character ${i + 1} - ${parts.join(', ')} loaded`,
        kind: 'character',
        thumbnailUrl: c.face.previewDataUrl || (c.face.base64Data ? `data:${c.face.mimeType || 'image/jpeg'};base64,${c.face.base64Data}` : null),
        thumbnailKind: c.face.previewDataUrl || c.face.base64Data ? 'image' : 'placeholder',
      });
    });
    return options;
  }, [elements.characters]);

  const subjectImageMentions = useMemo<MentionOption[]>(
    () => currentReferenceDescriptors
      .filter(descriptor => descriptor.category === 'anonymous' && descriptor.mentionTag && descriptor.mentionLabel)
      .map(descriptor => ({
        tag: descriptor.mentionTag!,
        label: descriptor.mentionLabel!,
        kind: 'image',
        thumbnailUrl: descriptor.previewDataUrl,
        thumbnailKind: descriptor.previewDataUrl ? 'image' : 'placeholder',
      })),
    [currentReferenceDescriptors],
  );

  const subjectMentions = useMemo(
    () => [...subjectCharacterMentions, ...subjectImageMentions],
    [subjectCharacterMentions, subjectImageMentions],
  );

  const aspectRatioOptions = useMemo(() => filterImageAspectRatioOptions(ASPECT_RATIOS), []);

  /** Load visual settings and only fill prompt fields that are currently empty. */
  const handleLoadPreset = (preset: PresetWithPrompts) => {
    const nextPromptState = normalizePromptState(
      mergePresetData(prompt.promptState, preset.data),
    );

    prompt.setPromptState(nextPromptState);
    setExpandedSections(prev => ({
      ...prev,
      ...createDefaultExpandedSections(
        nextPromptState,
        elements.characters,
        elements.sceneElement,
        elements.imageInput,
        elements.additionalReferenceImages,
      ),
    }));
  };

  /** Full prompt text (reference instruction + constructed prompt). */
  const primaryPromptToSend = useMemo(() => {
    const modifiedFinal = prompt.finalPrompt;
    if (!currentElementsInstructionFull) return modifiedFinal;
    return `${currentElementsInstructionFull} ${modifiedFinal}`.trim();
  }, [currentElementsInstructionFull, prompt.finalPrompt]);

  const primaryPromptForDisplay = useMemo(() => {
    const modifiedFinal = prompt.finalPrompt;
    if (!currentElementsInstructionDisplay) return modifiedFinal;
    return `${currentElementsInstructionDisplay} ${modifiedFinal}`.trim();
  }, [currentElementsInstructionDisplay, prompt.finalPrompt]);

  /** Copy prompt text to clipboard */
  const handleCopyPrompt = () => {
    if (!primaryPromptToSend) return;
    navigator.clipboard.writeText(primaryPromptToSend).then(() => {
      setShowCopyFeedback(true);
      setTimeout(() => setShowCopyFeedback(false), 2000);
    }).catch(console.error);
  };

  /** Export the constructed prompt as a .txt download */
  const handleExportPrompt = () => {
    if (!primaryPromptToSend) return;
    const safeName = (currentProjectName || 'prompt').replace(/[^a-z0-9]+/gi, '_').toLowerCase();
    downloadTextFile(`${safeName}_prompt.txt`, primaryPromptToSend, 'text/plain');
    setShowExportFeedback(true);
    setTimeout(() => setShowExportFeedback(false), 2000);
  };

  // Ctrl+S exports the project file
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (appView === 'editor') handleExportProject();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [appView, handleExportProject]);

  const isSceneStitchMode = elements.sceneInputMode === 'stitch';
  const hasEditSource = !!elements.imageInput.base64Data;

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onAction={handleUnsavedAction}
        projectName={currentProjectName}
      />

      {/* New Project Name Modal */}
      <NewProjectModal
        isOpen={showNewProjectModal}
        onConfirm={(name) => {
          setShowNewProjectModal(false);
          handleNewProject(name);
        }}
        onCancel={() => setShowNewProjectModal(false)}
      />

      {/* Hidden project import input */}
      <input
        ref={importFileInputRef}
        type="file"
        accept=".nbproject,.json,application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleImportFile(file);
          e.target.value = '';
        }}
      />

      {appView === 'start' ? (
        <StartScreen
          onNewProject={handleNewProject}
          onOpenProject={handleOpenProject}
          onLoadRecentProject={handleLoadRecentProject}
        />
      ) : (
    <div className="min-h-screen lg:h-screen bg-black text-zinc-300 font-sans selection:bg-yellow-500 selection:text-black flex flex-col lg:overflow-hidden">
      {/* ========== HEADER ========== */}
      <header className="shrink-0 border-b border-zinc-800 bg-black/90 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
            <div>
              <h1 className="brand-wordmark text-3xl tracking-tighter text-white">
                RenderZero <span className="text-yellow-500">Studio</span>
              </h1>
              <p className="brand-tagline text-xs text-zinc-500 mt-1">
                &gt; From Nothing
              </p>
            </div>
            {/* Project name + saved indicator */}
            {currentProjectName && (
              <div className="flex min-w-0 flex-wrap items-center gap-2 lg:ml-4 lg:border-l lg:border-zinc-800 lg:pl-4">
                <span className="text-xs font-medium text-zinc-400 truncate max-w-full lg:max-w-[200px]">{currentProjectName}</span>
                {hasUnsavedChanges && <span className="text-yellow-500 text-lg leading-none" title="Unsaved changes">●</span>}
                {showSavedFeedback && <span className="text-[10px] font-bold uppercase tracking-wider text-green-500 animate-in fade-in">Saved</span>}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 xl:justify-end">
            <button type="button" onClick={() => requestNavigation(() => setAppView('start'))}
              title="Back to start screen"
              className="h-9 px-4 py-2 border border-zinc-700 rounded-full text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white hover:border-zinc-500 transition-all flex items-center justify-center gap-2">
              <Home className="w-4 h-4" /> Home
            </button>
            <button type="button" onClick={() => requestNavigation(() => setShowNewProjectModal(true))}
              className="h-9 px-4 py-2 border border-zinc-700 rounded-full text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white hover:border-zinc-500 transition-all flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> New
            </button>
            <button type="button" onClick={handleClearWorkspace}
              className="h-9 px-4 py-2 border border-zinc-700 rounded-full text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white hover:border-zinc-500 transition-all flex items-center justify-center">
              Clear All
            </button>
            <button type="button" onClick={() => setShowPresetLibrary(true)}
              className="h-9 px-4 py-2 border border-zinc-700 bg-zinc-900 rounded-full text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white hover:border-yellow-500 hover:text-yellow-500 transition-all flex items-center gap-2">
              <Bookmark className="w-4 h-4" /> Presets
            </button>
            <button type="button" onClick={() => requestNavigation(handleOpenProject)}
              title="Import a .nbproject file"
              className="h-9 px-4 py-2 border border-zinc-700 bg-zinc-900 rounded-full text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white hover:border-blue-500 hover:text-blue-500 transition-all flex items-center gap-2">
              <FolderOpen className="w-4 h-4" /> Import
            </button>
            <button type="button" onClick={handleExportProject}
              title="Export project as .nbproject file"
              className="h-9 px-4 py-2 border border-zinc-700 bg-zinc-900 rounded-full text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white hover:border-green-500 hover:text-green-500 transition-all flex items-center gap-2">
              <Download className="w-4 h-4" /> Export
            </button>
            <button type="button" onClick={toggle} title="Toggle theme"
              className="h-9 w-9 border-2 border-line bg-surface rounded-full text-xs font-bold uppercase text-accent2 hover:border-accent transition-all flex items-center justify-center">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ========== MAIN CONTENT ========== */}
      <StudioWorkspaceShell
        leftPane={(
          <div className="space-y-4 pb-12 lg:pb-8">

          {/* Section 1: Subject & Framing */}
          <StudioAccordionSection
            id="subject-framing"
            icon={<Camera className="w-5 h-5" />}
            isOpen={expandedSections.subjectFraming}
            onToggle={() => toggleSection('subjectFraming')}
            title="01. Subject & Framing"
          >
            <div className="grid gap-6">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Subject & Action</label>
                <MentionTextarea
                  value={prompt.promptState.subjectAction}
                  onChange={(val) => prompt.updateState('subjectAction', val)}
                  mentions={subjectMentions}
                  spellCheck={true}
                  placeholder={subjectMentions.length > 0
                    ? 'E.g., @Character1 walks toward @Image1... (type @ to reference a character or image)'
                    : 'E.g., A woman in a trench coat checking her phone...'}
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-500 transition-colors resize-y"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ClearableControl value={prompt.promptState.shotType} onClear={() => prompt.updateState('shotType', "")}>
                  <VisualSelector label="Shot Type / Angle" value={prompt.promptState.shotType}
                    onChange={(val) => prompt.updateState('shotType', val)} options={SHOT_TYPES} previewRatio="aspect-video" />
                </ClearableControl>
                {prompt.promptState.shotType && (
                  <ClearableControl value={prompt.promptState.viewingDirection} onClear={() => prompt.updateState('viewingDirection', "")}>
                    <VisualSelector label="Viewing Direction (Optional)" value={prompt.promptState.viewingDirection}
                      onChange={(val) => prompt.updateState('viewingDirection', val)} options={VIEWING_DIRECTIONS} previewRatio="aspect-video" />
                  </ClearableControl>
                )}
              </div>
              <div>
                <Selector label="Aspect Ratio" value={prompt.promptState.aspectRatio}
                  onChange={(val) => prompt.updateState('aspectRatio', val)}
                  options={aspectRatioOptions} />
              </div>
              {prompt.promptState.shotType && (
                <label className="flex items-center gap-2.5 cursor-pointer group select-none px-1"
                  onClick={() => prompt.setPromptState(prev => ({ ...prev, candidShot: !prev.candidShot }))}>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    prompt.promptState.candidShot
                      ? 'bg-yellow-500 border-yellow-500'
                      : 'border-zinc-600 bg-zinc-900 group-hover:border-zinc-400'
                  }`}>
                    {prompt.promptState.candidShot && (
                      <svg className="w-3 h-3 text-black" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-xs font-medium tracking-wide ${
                    prompt.promptState.candidShot ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'
                  }`}>Subject unaware of camera</span>
                </label>
              )}
              <TextInput label="Environment" value={prompt.promptState.environment}
                onChange={(val) => prompt.updateState('environment', val)}
                spellCheck={true}
                placeholder="E.g., at a rainy London bus stop at night..." />
            </div>
          </StudioAccordionSection>

          {/* Section 2: Lighting & Mood */}
          <StudioAccordionSection
            id="lighting-mood"
            icon={<Aperture className="w-5 h-5" />}
            isOpen={expandedSections.lightingMood}
            onToggle={() => toggleSection('lightingMood')}
            title="02. Lighting & Mood"
          >
            <div className="grid gap-6">
              <ClearableControl value={prompt.promptState.lighting} onClear={() => prompt.updateState('lighting', "")}>
                <VisualSelector label="Lighting Source" value={prompt.promptState.lighting}
                  onChange={(val) => prompt.updateState('lighting', val)} options={LIGHTING_TYPES} previewRatio="aspect-[3/4]" />
              </ClearableControl>
              <TextInput label="Atmosphere / Mood" value={prompt.promptState.mood}
                onChange={(val) => prompt.updateState('mood', val)}
                spellCheck={true}
                placeholder="E.g., moody, cinematic, lonely, melancholic..." />
            </div>
          </StudioAccordionSection>

          {/* Section 3: Gear & Tech */}
          <StudioAccordionSection
            id="camera-gear"
            icon={<Film className="w-5 h-5" />}
            isOpen={expandedSections.cameraGear}
            onToggle={() => toggleSection('cameraGear')}
            title="03. Camera Gear"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ClearableControl value={prompt.promptState.camera} onClear={() => prompt.updateState('camera', "")}>
                <VisualSelector label="Camera Body" value={prompt.promptState.camera}
                  onChange={(val) => prompt.updateState('camera', val)} options={CAMERAS} previewRatio="aspect-video" />
              </ClearableControl>
              <ClearableControl value={prompt.promptState.focalLength} onClear={() => prompt.updateState('focalLength', "")}>
                <VisualSelector label="Focal Length" value={prompt.promptState.focalLength}
                  onChange={(val) => prompt.updateState('focalLength', val)} options={FOCAL_LENGTHS} previewRatio="aspect-video" />
              </ClearableControl>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
                <ClearableControl value={prompt.promptState.lens} onClear={() => prompt.updateState('lens', "")}>
                  <VisualSelector label="Lens Type" value={prompt.promptState.lens}
                    onChange={(val) => prompt.updateState('lens', val)} options={LENSES} previewRatio="aspect-video" />
                </ClearableControl>
                <ClearableControl value={prompt.promptState.fStop} onClear={() => prompt.updateState('fStop', "")}>
                  <FStopSelector
                    label="F-Stop"
                    value={prompt.promptState.fStop}
                    onChange={(val) => prompt.updateState('fStop', val)}
                  />
                </ClearableControl>
              </div>
              <ClearableControl value={prompt.promptState.filmStock} onClear={() => prompt.updateState('filmStock', "")}>
                <VisualSelector label="Film Stock" value={prompt.promptState.filmStock}
                  onChange={(val) => prompt.updateState('filmStock', val)} options={FILM_STOCKS} previewRatio="aspect-video" />
              </ClearableControl>
            </div>
          </StudioAccordionSection>

          {/* Section 4: Style */}
          <StudioAccordionSection
            id="style-aesthetics"
            icon={<Video className="w-5 h-5" />}
            isOpen={expandedSections.styleAesthetics}
            onToggle={() => toggleSection('styleAesthetics')}
            title="04. Style & Aesthetics"
          >
            <div className="grid gap-6">
              <Slider label="Temperature (Creativity)" value={prompt.promptState.temperature}
                onChange={(val) => prompt.updateState('temperature', val)} min={0} max={2} step={0.1}
                labels={['Focused', 'Balanced', 'Creative']} />
              <ClearableControl value={prompt.promptState.photographer} onClear={() => prompt.updateState('photographer', "")}>
                <VisualSelector label="Photographer Style" value={prompt.promptState.photographer}
                  onChange={(val) => prompt.updateState('photographer', val)} options={PHOTOGRAPHERS}
                  placeholder="Choose a photographer..." previewRatio="aspect-square" />
              </ClearableControl>
              <ClearableControl value={prompt.promptState.movieLook} onClear={() => prompt.updateState('movieLook', "")}>
                <VisualSelector label="Movie Look / Aesthetic" value={prompt.promptState.movieLook}
                  onChange={(val) => prompt.updateState('movieLook', val)} options={MOVIE_LOOKS}
                  placeholder="Choose a movie style..." previewRatio="aspect-video" />
              </ClearableControl>
              <ClearableControl value={prompt.promptState.filter} onClear={() => prompt.handleFilterChange([])}>
                <VisualSelector label="Filter / Effect" value={prompt.promptState.filter}
                  onChange={prompt.handleFilterChange} options={FILTERS}
                  placeholder="Choose a filter..." previewRatio="aspect-video" multiSelect />
              </ClearableControl>
            </div>
          </StudioAccordionSection>

          {/* Section 5: Elements Tool */}
          <StudioAccordionSection
            id="elements-tool"
            icon={<Layers className="w-5 h-5" />}
            isOpen={expandedSections.elements}
            onToggle={() => toggleSection('elements')}
            title="05. Elements Tool (Images)"
          >
            {/* Character Tabs */}
            <div className="flex items-center gap-2 mb-4">
              {elements.characters.map((char, idx) => (
                <div key={char.id}
                  className={`flex items-center gap-2 px-3 py-1.5 border select-none cursor-pointer transition-colors ${
                    idx === elements.activeCharIndex
                      ? "border-white bg-white/10 text-white"
                      : "border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700"
                  }`}
                  onClick={() => elements.setActiveCharIndex(idx)}>
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {elements.characters.length >= 4 ? `CHA ${idx + 1}` : `CHARACTER ${idx + 1}`}
                  </span>
                  {elements.characters.length > 1 && (
                    <button onClick={(e) => { e.stopPropagation(); elements.handleRemoveCharacter(idx); }}
                      className="hover:text-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              {elements.characters.length < 4 && (
                <button type="button" onClick={elements.handleAddCharacter}
                  className="px-3 py-1.5 border border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-white hover:text-white transition-colors">
                  <span className="text-lg leading-none">+</span>
                </button>
              )}
              {/* Character Library Button */}
              <button type="button" onClick={() => setShowCharacterLibrary(true)}
                className="ml-auto px-3 py-1.5 border border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-yellow-500/50 hover:text-yellow-500 transition-colors flex items-center gap-1.5"
                title="Character Library — Save & load characters">
                <Bookmark className="w-3.5 h-3.5" />
                <span className="text-xs font-bold uppercase tracking-wider">Library</span>
              </button>
            </div>

            {/* Element Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Character elements: face, outfit, object */}
              <>
              {[
                elements.characters[elements.activeCharIndex].face,
                elements.characters[elements.activeCharIndex].outfit,
                elements.characters[elements.activeCharIndex].object,
              ].map(el => {
                const characterElementType = (el.id === 'character' ? 'face' : el.id) as 'face' | 'outfit' | 'object';
                const isElementStitchMode = elements.getCharacterElementInputMode(elements.activeCharIndex, characterElementType) === 'stitch';
                const isDragOver = !isElementStitchMode && elements.dragOverElementId === el.id;

                return (
                  <div key={el.id} role="button" tabIndex={0}
                    onClick={() => elements.openElementFilePicker(el.id)}
                    onKeyDown={(e) => e.key === 'Enter' && elements.openElementFilePicker(el.id)}
                    {...(isElementStitchMode
                      ? {}
                      : makeElementDragHandlers(el.id, elements.setDragOverElementId, elements.handleDropImage, setElementError))}
                    className={`relative aspect-square bg-zinc-900 border overflow-hidden group text-left cursor-pointer transition-all ${
                      isDragOver
                        ? 'border-yellow-500 ring-2 ring-yellow-500/50'
                        : 'border-zinc-800 hover:border-yellow-500/50'
                    }`}
                    title={isElementStitchMode
                      ? (el.previewDataUrl ? `Replace ${el.label} with 2-4 image stitch` : `Upload ${el.label} (Stitch: select 2-4 images)`)
                      : (el.previewDataUrl ? `Replace ${el.label}` : `Upload ${el.label}`)}>
                    <div className="absolute top-2 left-2 z-20 inline-flex overflow-hidden rounded border border-white/20 bg-black/70">
                      <button
                        type="button"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          elements.setCharacterElementInputMode(elements.activeCharIndex, characterElementType, 'single');
                        }}
                        className={`px-2 py-1 text-[9px] font-black uppercase tracking-wider transition-colors ${
                          !isElementStitchMode ? 'bg-yellow-500 text-black' : 'text-zinc-300 hover:text-white'
                        }`}
                        title={`Single image upload mode for ${el.label}`}
                      >
                        Single
                      </button>
                      <button
                        type="button"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          elements.setCharacterElementInputMode(elements.activeCharIndex, characterElementType, 'stitch');
                        }}
                        className={`px-2 py-1 text-[9px] font-black uppercase tracking-wider transition-colors ${
                          isElementStitchMode ? 'bg-yellow-500 text-black' : 'text-zinc-300 hover:text-white'
                        }`}
                        title={`Stitch mode for ${el.label} (select 2-4 images)`}
                      >
                        Stitch
                      </button>
                    </div>
                    {isDragOver && <DropOverlay />}
                    {el.previewDataUrl ? (
                      <>
                        <img src={el.previewDataUrl} alt={`${el.label} reference`} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button type="button" onClick={(ev) => { ev.stopPropagation(); elements.openInpaintEditor('character', el.previewDataUrl!, elements.activeCharIndex, characterElementType); }}
                            className="bg-black/70 hover:bg-blue-500 hover:text-white text-white p-2 rounded-full transition-all" title="Edit Image">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={(ev) => { ev.stopPropagation(); elements.removeElementImage(el.id); }}
                            className="bg-black/70 hover:bg-yellow-500 hover:text-black text-white p-2 rounded-full transition-all" title="Remove">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        {el.originalDataUrl && (
                          <button type="button" onClick={(ev) => { ev.stopPropagation(); elements.resetToOriginal('character', elements.activeCharIndex, characterElementType); }}
                            className="absolute bottom-14 left-2 bg-black/70 hover:bg-green-500 hover:text-white text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-all" title="Reset to Original">
                            <RefreshCw className="w-3 h-3 inline mr-1" /> Reset
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                        {elementIcon(el.id)}
                        <div className="text-xs font-black uppercase tracking-widest text-zinc-200">{el.label}</div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                          {isElementStitchMode ? 'Click to select 2-4 images' : 'Click or drop image'}
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm border-t border-white/10 px-3 py-2">
                      <div className="text-[10px] font-black uppercase tracking-widest text-white">{el.label}</div>
                      <div className="text-[10px] font-bold tracking-wide text-zinc-400">
                        {`Character ${elements.activeCharIndex + 1} ${el.label}`}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Scene Reference */}
              {elements.activeCharIndex === 0 ? (
                <div role="button" tabIndex={0}
                  onClick={() => elements.openElementFilePicker(elements.sceneElement.id)}
                  onKeyDown={(e) => e.key === 'Enter' && elements.openElementFilePicker(elements.sceneElement.id)}
                  {...(isSceneStitchMode
                    ? {}
                    : makeElementDragHandlers(elements.sceneElement.id, elements.setDragOverElementId, elements.handleDropImage, setElementError))}
                  className={`relative aspect-square bg-zinc-900 border overflow-hidden group text-left cursor-pointer transition-all ${
                    !isSceneStitchMode && elements.dragOverElementId === elements.sceneElement.id
                      ? 'border-yellow-500 ring-2 ring-yellow-500/50'
                      : 'border-zinc-800 hover:border-yellow-500/50'
                  }`}
                  title={isSceneStitchMode
                    ? (elements.sceneElement.previewDataUrl ? 'Replace Scene with 2-4 image stitch' : 'Upload Scene (Stitch: select 2-4 images)')
                    : (elements.sceneElement.previewDataUrl ? 'Replace Scene' : 'Upload Scene')}>
                  <div className="absolute top-2 left-2 z-20 inline-flex overflow-hidden rounded border border-white/20 bg-black/70">
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        elements.setSceneInputMode('single');
                      }}
                      className={`px-2 py-1 text-[9px] font-black uppercase tracking-wider transition-colors ${
                        !isSceneStitchMode ? 'bg-yellow-500 text-black' : 'text-zinc-300 hover:text-white'
                      }`}
                      title="Single image upload mode for Scene"
                    >
                      Single
                    </button>
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        elements.setSceneInputMode('stitch');
                      }}
                      className={`px-2 py-1 text-[9px] font-black uppercase tracking-wider transition-colors ${
                        isSceneStitchMode ? 'bg-yellow-500 text-black' : 'text-zinc-300 hover:text-white'
                      }`}
                      title="Stitch mode for Scene (select 2-4 images)"
                    >
                      Stitch
                    </button>
                  </div>
                  {!isSceneStitchMode && elements.dragOverElementId === elements.sceneElement.id && <DropOverlay />}
                  {elements.sceneElement.previewDataUrl ? (
                    <>
                      <img src={elements.sceneElement.previewDataUrl} alt="Scene reference" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button type="button" onClick={(ev) => { ev.stopPropagation(); elements.openInpaintEditor('scene', elements.sceneElement.previewDataUrl!); }}
                          className="bg-black/70 hover:bg-blue-500 hover:text-white text-white p-2 rounded-full transition-all" title="Edit Image">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={(ev) => { ev.stopPropagation(); elements.removeElementImage(elements.sceneElement.id); }}
                          className="bg-black/70 hover:bg-yellow-500 hover:text-black text-white p-2 rounded-full transition-all" title="Remove">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {elements.sceneElement.originalDataUrl && (
                        <button type="button" onClick={(ev) => { ev.stopPropagation(); elements.resetToOriginal('scene'); }}
                          className="absolute bottom-14 left-2 bg-black/70 hover:bg-green-500 hover:text-white text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-all" title="Reset to Original">
                          <RefreshCw className="w-3 h-3 inline mr-1" /> Reset
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                      {elementIcon(elements.sceneElement.id)}
                      <div className="text-xs font-black uppercase tracking-widest text-zinc-200">{elements.sceneElement.label}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        {isSceneStitchMode ? 'Click to select 2-4 images' : 'Click or drop image'}
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm border-t border-white/10 px-3 py-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white">{elements.sceneElement.label}</div>
                    <div className="text-[10px] font-bold tracking-wide text-zinc-400">{elements.sceneElement.promptLabel}</div>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-square bg-zinc-900/30 border border-zinc-800/50 flex flex-col items-center justify-center gap-3 opacity-50 cursor-not-allowed"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                  <ImageIcon className="w-7 h-7 text-zinc-600" />
                  <div className="text-xs font-black uppercase tracking-widest text-zinc-600">Scene Reference</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-700 text-center px-2">
                    Set in Character 1
                  </div>
                </div>
              )}
              </>

              {/* Global Reference / Image Input */}
              <div role="button" tabIndex={0}
                onClick={() => elements.openElementFilePicker(elements.imageInput.id)}
                onKeyDown={(e) => e.key === 'Enter' && elements.openElementFilePicker(elements.imageInput.id)}
                {...makeElementDragHandlers(elements.imageInput.id, elements.setDragOverElementId, elements.handleDropImage, setElementError)}
                className={`col-span-2 relative aspect-[3/1] bg-zinc-900/50 border overflow-hidden group text-left cursor-pointer transition-all ${
                  elements.dragOverElementId === elements.imageInput.id
                    ? 'border-yellow-500 ring-2 ring-yellow-500/50'
                    : 'border-zinc-800 hover:border-yellow-500/50'
                }`}
                title={elements.imageInput.previewDataUrl ? `Replace Global Reference` : `Upload Global Reference`}>
                {elements.dragOverElementId === elements.imageInput.id && <DropOverlay />}
                {elements.imageInput.previewDataUrl ? (
                  <>
                    <img src={elements.imageInput.previewDataUrl} alt="Global reference" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button type="button" onClick={(ev) => { ev.stopPropagation(); elements.openInpaintEditor('global', elements.imageInput.previewDataUrl!); }}
                        className="bg-black/70 hover:bg-blue-500 hover:text-white text-white p-2 rounded-full transition-all" title="Edit Image">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={(ev) => { ev.stopPropagation(); elements.removeElementImage(elements.imageInput.id); }}
                        className="bg-black/70 hover:bg-yellow-500 hover:text-black text-white p-2 rounded-full transition-all" title="Remove">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {elements.imageInput.originalDataUrl && (
                      <button type="button" onClick={(ev) => { ev.stopPropagation(); elements.resetToOriginal('global'); }}
                        className="absolute bottom-14 left-2 bg-black/70 hover:bg-green-500 hover:text-white text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-all" title="Reset to Original">
                        <RefreshCw className="w-3 h-3 inline mr-1" /> Reset
                      </button>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-row items-center justify-center gap-4">
                    {elementIcon(elements.imageInput.id)}
                    <div className="flex flex-col">
                      <div className="text-xs font-black uppercase tracking-widest text-zinc-200">{elements.imageInput.label}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Drop image or click to upload</div>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm border-t border-white/10 px-3 py-2 flex justify-between items-center">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white">{elements.imageInput.label}</div>
                    <div className="text-[10px] font-bold tracking-wide text-zinc-400">Switch the prompt to Edit mode</div>
                  </div>
                  {elements.imageInput.previewDataUrl && <div className="text-[10px] text-yellow-500 font-bold">ACTIVE</div>}
                </div>
              </div>

              <div className="col-span-2 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      {`Additional Reference Images (${activeAnonymousReferenceCount} active, ${currentReferenceDescriptors.length}/${MAX_REFERENCE_IMAGES} total)`}
                    </div>
                    <div className="text-[10px] font-bold tracking-wide text-zinc-500">
                      {`Generic uploads appear in the prompt as @Image# after character, scene, and global refs.${remainingAnonymousReferenceSlots > 0
                        ? ` ${remainingAnonymousReferenceSlots} slot${remainingAnonymousReferenceSlots === 1 ? '' : 's'} remaining.`
                        : ' No additional slots available at the current limit.'}`}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={elements.addAdditionalReferenceImage}
                    disabled={!canAddAdditionalReference}
                    className={`inline-flex items-center gap-1 px-3 py-2 border text-[10px] font-bold uppercase tracking-wider transition-all ${
                      canAddAdditionalReference
                        ? 'border-zinc-700 text-zinc-300 hover:border-yellow-500 hover:text-yellow-500'
                        : 'border-zinc-800 text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-3 h-3" /> Add Image
                  </button>
                </div>

                {elements.additionalReferenceImages.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {elements.additionalReferenceImages.map((reference, index) => {
                      const referenceKey = reference.instanceId || `anonymous-${index}`;
                      const activeNumber = activeAnonymousReferenceNumbers.get(referenceKey);
                      const isOverflow = overflowAnonymousReferenceKeys.has(referenceKey) || index >= maxAnonymousReferenceSlots;
                      const isDragOver = elements.dragOverAdditionalReferenceIndex === index;
                      const statusText = activeNumber
                        ? `ACTIVE AS @Image${activeNumber}`
                        : isOverflow
                          ? 'OVER LIMIT'
                          : reference.base64Data
                            ? 'READY'
                            : 'EMPTY';

                      return (
                        <div key={referenceKey} className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2 min-w-0">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 truncate min-w-0">
                              Reference {index + 1}
                            </span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => elements.openAdditionalReferenceFilePicker(index)}
                                className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider border border-zinc-700 text-zinc-300 hover:border-yellow-500 hover:text-yellow-500"
                              >
                                <span className="inline-flex items-center gap-1"><Upload className="w-3 h-3" /> Upload</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => elements.removeAdditionalReferenceImage(index)}
                                className="p-1.5 border border-zinc-800 text-zinc-500 hover:border-yellow-500 hover:text-yellow-500 transition-all"
                                title="Remove reference slot"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => elements.openAdditionalReferenceFilePicker(index)}
                            onKeyDown={(e) => e.key === 'Enter' && elements.openAdditionalReferenceFilePicker(index)}
                            {...makeAdditionalReferenceDragHandlers(index, elements.setDragOverAdditionalReferenceIndex, elements.handleDropAdditionalReferenceImage, setElementError)}
                            className={`relative aspect-[4/3] bg-zinc-950 border overflow-hidden group text-left cursor-pointer transition-all ${
                              isDragOver
                                ? 'border-yellow-500 ring-2 ring-yellow-500/50'
                                : activeNumber
                                  ? 'border-yellow-500/60'
                                  : isOverflow
                                    ? 'border-orange-500/50'
                                    : 'border-zinc-800 hover:border-yellow-500/50'
                            }`}
                            title={reference.previewDataUrl ? `Replace Reference ${index + 1}` : `Upload Reference ${index + 1}`}
                          >
                            {isDragOver && <DropOverlay />}
                            {reference.previewDataUrl ? (
                              <>
                                <img src={reference.previewDataUrl} alt={`Reference ${index + 1}`} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                                <div className="absolute inset-0 bg-black/35" />
                              </>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                {elementIcon('anonymousReference')}
                                <div className="text-xs font-black uppercase tracking-widest text-zinc-200">Reference Image</div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Drop image or click to upload</div>
                              </div>
                            )}

                            <div className="absolute bottom-0 left-0 right-0 bg-black/75 backdrop-blur-sm border-t border-white/10 px-3 py-2 flex items-center justify-between gap-3">
                              <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-white">Reference {index + 1}</div>
                                <div className={`text-[10px] font-bold tracking-wide ${
                                  activeNumber
                                    ? 'text-yellow-400'
                                    : isOverflow
                                      ? 'text-orange-400'
                                      : 'text-zinc-400'
                                }`}>
                                  {statusText}
                                </div>
                              </div>
                              {activeNumber && (
                                <div className="text-[10px] font-black uppercase tracking-widest text-yellow-400">
                                  {`image_${activeNumber}`}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Prompt Mode Toggle */}
              {hasEditSource ? (
                <div className="col-span-2 flex items-center gap-2 mt-2">
                  <div className="flex bg-zinc-900 border border-zinc-700 rounded-full p-1 w-full">
                    <button type="button" onClick={() => setGenerationMode('generate')}
                      className={`flex-1 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                        generationMode === 'generate' ? 'bg-yellow-500 text-black' : 'text-zinc-400 hover:text-white'
                      }`}>Generate</button>
                    <button type="button" onClick={() => setGenerationMode('edit')}
                      className={`flex-1 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                        generationMode === 'edit' ? 'bg-yellow-500 text-black' : 'text-zinc-400 hover:text-white'
                      }`}>Edit (Inpaint)</button>
                  </div>
                </div>
              ) : (
                <div className="col-span-2 flex items-center gap-2 mt-2 relative group">
                  <div className="flex bg-zinc-900/50 border border-zinc-800 rounded-full p-1 w-full opacity-50 cursor-not-allowed">
                    <div className="flex-1 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-zinc-500 text-center">Generate</div>
                    <div className="flex-1 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-zinc-500 text-center">Edit (Inpaint)</div>
                  </div>
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 px-3 py-2 rounded-lg text-xs text-zinc-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-3 h-3 text-yellow-500" />
                      <span>Add a Global Reference image to enable Edit mode</span>
                    </div>
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-800 border-l border-t border-zinc-700 rotate-45" />
                  </div>
                </div>
              )}
            </div>

            {/* Narrative Angle Toggle */}
            <div className="mt-2 flex items-center justify-between bg-zinc-900/30 border border-zinc-800/50 p-3 hover:bg-zinc-900/50 transition-colors cursor-pointer group select-none"
              onClick={() => prompt.setPromptState(prev => ({ ...prev, showNewAnglePrompt: !prev.showNewAnglePrompt }))}>
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-full ${prompt.promptState.showNewAnglePrompt ? 'bg-yellow-500/20 text-yellow-500' : 'bg-zinc-800 text-zinc-500'}`}>
                  <Video className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs font-bold uppercase tracking-widest ${prompt.promptState.showNewAnglePrompt ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                    Narrative Angle Prompting
                  </span>
                  <span className="text-[10px] text-zinc-500">"In this new angle what would the viewer see? Show us..."</span>
                  {prompt.promptState.showNewAnglePrompt && !prompt.promptState.shotType && (
                    <span className="text-[10px] text-yellow-500/80 mt-0.5 animate-in fade-in">
                      Warning: Needs a <b>Shot Type</b> to activate.
                    </span>
                  )}
                </div>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${prompt.promptState.showNewAnglePrompt ? 'bg-yellow-500' : 'bg-zinc-700'}`}>
                <div className={`absolute top-1 bottom-1 w-3 bg-white rounded-full transition-all duration-200 ${prompt.promptState.showNewAnglePrompt ? 'left-6' : 'left-1'}`} />
              </div>
            </div>

            {/* Hidden file input + transcoding canvas */}
            <input ref={elements.elementFileInputRef} type="file" accept="image/*" multiple={elements.filePickerMultiple} className="hidden"
              onChange={(e) => elements.handleElementFileSelected(e, setElementError)} />
            <canvas ref={elements.transcodeCanvasRef} className="hidden" />
          </StudioAccordionSection>
          </div>
        )}
        rightPane={(
          <div className="space-y-6 pb-12 lg:pb-8">

          {/* Prompt Preview Box */}
          <div className={`bg-zinc-900 border border-zinc-800 p-6 relative transition-all group ${prompt.isEditingPrompt ? 'border-yellow-500/50' : 'hover:border-yellow-500/50'}`}>
            <div className="absolute top-0 left-0 bg-yellow-500 text-black text-[10px] font-black uppercase px-2 py-1 tracking-widest flex items-center gap-2">
              Constructed Prompt
            </div>

            <div className="absolute top-0 right-0 p-2 flex max-w-[calc(100%-7rem)] flex-wrap justify-end gap-2">
              <button onClick={() => setShowPresetLibrary(true)}
                className="flex items-center gap-1 text-zinc-500 hover:text-yellow-500 text-[10px] font-bold uppercase transition-all px-2 py-1" title="Save current options as a preset">
                <Bookmark className="w-3 h-3" /> SAVE PRESET
              </button>
              <button onClick={() => prompt.setIsEditingPrompt(!prompt.isEditingPrompt)}
                className={`flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 border transition-all ${
                  prompt.isEditingPrompt ? "bg-yellow-500 text-black border-yellow-500" : "bg-transparent text-zinc-500 border-transparent hover:text-yellow-500"
                }`}>
                {prompt.isEditingPrompt ? <Check className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
                {prompt.isEditingPrompt ? "DONE" : "EDIT"}
              </button>
              {prompt.isManualPrompt && prompt.isEditingPrompt && (
                <button onClick={() => prompt.resetPrompt()}
                  className="flex items-center gap-1 text-red-500 hover:text-red-400 text-[10px] font-bold uppercase transition-all px-2 py-1 border border-red-500/30 hover:border-red-500/70" title="Revert to auto-generated prompt">
                  <X className="w-3 h-3" /> RESET
                </button>
              )}
              <button onClick={handleExportPrompt}
                className={`flex items-center gap-1 font-bold uppercase transition-all px-2 py-1 text-[10px] ${
                  showExportFeedback ? "text-green-500" : "text-zinc-500 hover:text-yellow-500"
                }`} title="Download prompt as .txt">
                {showExportFeedback ? <Check className="w-3 h-3" /> : <FileDown className="w-3 h-3" />}
                {showExportFeedback ? "EXPORTED" : "EXPORT"}
              </button>
              <button onClick={handleCopyPrompt}
                className="flex items-center gap-1 text-zinc-500 hover:text-yellow-500 text-[10px] font-bold uppercase transition-all px-2 py-1">
                {showCopyFeedback ? <span className="text-green-500 flex items-center gap-1"><Check className="w-3 h-3" /> COPIED</span> : <><Copy className="w-3 h-3" /> COPY</>}
              </button>
            </div>

            <div className="mt-8 font-mono text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap selection:bg-yellow-500/30">
              {prompt.isEditingPrompt ? (
                <div className="flex flex-col gap-2">
                  {currentElementsInstructionDisplay && (
                    <div className="p-3 bg-black/30 border border-zinc-800 text-zinc-500 italic text-xs select-none">
                      {currentElementsInstructionDisplay}
                    </div>
                  )}
                  <textarea value={prompt.finalPrompt}
                    onChange={(e) => { prompt.setFinalPrompt(e.target.value); prompt.setIsManualPrompt(true); }}
                    placeholder="Type your prompt here..."
                    spellCheck={true}
                    className="w-full h-40 bg-zinc-950/50 border border-zinc-700 p-3 text-white focus:border-yellow-500 focus:outline-none resize-y" />
                </div>
              ) : (
                <p className="cursor-pointer" onClick={handleCopyPrompt}>
                  {primaryPromptForDisplay || "Start selecting options to build your prompt..."}
                </p>
              )}
            </div>

          </div>

          {elementError && (
            <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-400 text-sm font-medium flex items-start justify-between gap-3">
              <span>Error: {elementError}</span>
              <button type="button" onClick={() => setElementError(null)} className="text-red-400 hover:text-white transition-colors" title="Dismiss">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Hint footer */}
          <div className="text-center text-zinc-600 text-xs max-w-md mx-auto mt-4">
            <p>
              Copy the constructed prompt and paste it into your favorite image tool
              (Gemini, ChatGPT, Midjourney, ...). RenderZero Web never calls any API.
            </p>
          </div>
          </div>
        )}
      />

      {/* ========== MODALS ========== */}

      <PresetLibraryModal
        isOpen={showPresetLibrary}
        onClose={() => setShowPresetLibrary(false)}
        onApply={handleLoadPreset}
        currentPromptState={prompt.promptState}
      />

      <CharacterLibraryModal
        isOpen={showCharacterLibrary}
        onClose={() => setShowCharacterLibrary(false)}
        currentCharacter={elements.characters[elements.activeCharIndex]}
        onLoad={(charData) => {
          const updated = [...elements.characters];
          updated[elements.activeCharIndex] = {
            ...charData,
            id: updated[elements.activeCharIndex].id,
            label: updated[elements.activeCharIndex].label,
            faceInputMode: charData.faceInputMode === 'stitch' ? 'stitch' : 'single',
            outfitInputMode: charData.outfitInputMode === 'stitch' ? 'stitch' : 'single',
            objectInputMode: charData.objectInputMode === 'stitch' ? 'stitch' : 'single',
          };
          elements.setCharacters(updated);
        }}
      />

      {/* Inpaint Editor Modal */}
      <InpaintEditor
        isOpen={elements.inpaintEditor.isOpen}
        sourceImageUrl={elements.inpaintEditor.sourceImageUrl}
        onSave={elements.handleInpaintSave}
        onCancel={elements.handleInpaintCancel}
      />
    </div>
      )}
    </>
  );
}
