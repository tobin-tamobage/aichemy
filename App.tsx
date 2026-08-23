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
import { PresetLibraryModal } from './components/PresetLibraryModal';
import { CharacterLibraryModal } from './components/CharacterLibraryModal';
import { InpaintEditor } from './components/InpaintEditor';
import { StartScreen } from './components/StartScreen';
import { StudioBuilder } from './components/StudioBuilder';
import { StudioAccordionSection } from './components/StudioAccordionSection';
import { StudioWorkspaceShell } from './components/StudioWorkspaceShell';
import { UnsavedChangesModal } from './components/UnsavedChangesModal';
import { NewProjectModal } from './components/NewProjectModal';
import { MentionTextarea } from './components/video/MentionTextarea';
import { DomainFieldRenderer } from './components/DomainFieldRenderer';
import { ReferencePhotoField } from './components/ReferencePhotoField';
import type { MentionOption } from './components/video/MentionTextarea';

import {
  useReferenceImages,
  useElements, useProjectIO, projectNameFromPath, normalizeProjectFile, useTheme,
  createInitialCharacter, createInitialScene, createInitialImageInput,
} from './hooks';
import { useDomainState } from './hooks/useDomainState';
import {
  getAllDomains, getDomain, DEFAULT_DOMAIN_ID, applyPreset,
  DOMAINS, listCustomRecipes, saveCustomStudio,
} from './domains';
import type { DomainRecipe, DomainState, DomainWarning } from './domains';
import { validateRecipe } from './domains/custom/validate';
import type { CustomRecipe } from './domains/custom/types';
import { getSubjectPhrase, getAspectRatioSentence } from './packages/shared-core/services/promptBuilder';

import { createStateComparisonKey } from './services/stateComparisonKey';
import { dataURLToBlob, toClipboardImageBlob } from './utils/referenceComposite';
import {
  downloadTextFile,
  readFileAsText,
  saveAutosave,
  loadAutosave,
  touchRecentProject,
} from './services/browserStorage';

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
  Video, Download, AlertCircle, Layers,
  X, Copy, Check, User, Shirt, Box, ImageIcon, Edit2, Bookmark,
  RefreshCw, Upload, Plus, Home, FolderOpen, FileDown, Moon, Sun,
  AlertTriangle,
} from 'lucide-react';

// ============================================
// HELPER COMPONENTS
// ============================================

/** Total reference images folded into the constructed prompt. */
const MAX_REFERENCE_IMAGES = 14;

/** Returns the icon component for an element type */
const elementIcon = (id: ElementId) => {
  const icons: Record<string, React.ReactNode> = {
    character: <User className="w-7 h-7 text-accent" />,
    outfit: <Shirt className="w-7 h-7 text-accent" />,
    object: <Box className="w-7 h-7 text-accent" />,
    scene: <ImageIcon className="w-7 h-7 text-accent" />,
    imageInput: <Upload className="w-7 h-7 text-accent" />,
    anonymousReference: <ImageIcon className="w-7 h-7 text-accent" />,
  };
  return icons[id] || <ImageIcon className="w-7 h-7 text-accent" />;
};

/** Drag-and-drop overlay shown when dragging an image over an element cell */
const DropOverlay = () => (
  <div className="absolute inset-0 bg-base/60 flex items-center justify-center z-10 pointer-events-none">
    <span className="text-accent text-xs font-black uppercase tracking-widest">Drop image here</span>
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

/** Accordion state per section id — engine section ids + 'elements-tool' (cinematic). */
type StudioExpandedSections = Record<string, boolean>;

const hasNonEmptyValue = (value?: string | null) => !!value?.trim();
const hasLoadedElement = (element?: ElementState | null) => !!(element?.base64Data || element?.previewDataUrl);

/** Buka semua section engine — konsisten untuk semua domain, termasuk cinematic
 *  (sebelumnya cinematic collapse section tanpa nilai di desktop, terasa "kosong"). */
const expandAllSections = (domain: DomainRecipe): StudioExpandedSections => {
  const expanded: StudioExpandedSections = {};
  for (const section of domain.sections) expanded[section.id] = true;
  return expanded;
};

/** Default accordion: semua section domain terbuka (mobile & desktop). */
const defaultExpandedForDomain = (domain: DomainRecipe): StudioExpandedSections => expandAllSections(domain);

/** Banner smart-rule (domain.warnings) di bawah section terkait. */
const SectionWarningBanner: React.FC<{ warning: DomainWarning }> = ({ warning }) => (
  <div className={`flex items-start gap-2 px-3 py-2.5 border text-xs font-medium ${
    warning.level === 'warn'
      ? 'bg-danger/10 border-danger/30 text-danger'
      : 'bg-accent/10 border-accent/30 text-accent2'
  }`}>
    {warning.level === 'warn'
      ? <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
    <span className="leading-relaxed">{warning.text}</span>
  </div>
);

/** Escape HTML special chars for the text/html clipboard representation. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Project file format v3 — generic, domain-driven
 * { id, name, version: '3.0.0', timestamp, domainId, domainState, referencePhotoDataUrl? }.
 * Legacy v2 files are migrated on import via normalizeProjectFile.
 */

// ============================================
// MAIN APP COMPONENT
// ============================================

export default function App() {
  // --- Custom Hooks ---
  const [domainId, setDomainId] = useState<string>(DEFAULT_DOMAIN_ID);
  const activeDomain = useMemo(() => getDomain(domainId), [domainId]);
  const domain = useDomainState(activeDomain);
  const elements = useElements();
  const { theme, toggle } = useTheme();

  // --- Local UI State ---
  const [showPresetLibrary, setShowPresetLibrary] = useState(false);
  const [showCharacterLibrary, setShowCharacterLibrary] = useState(false);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  const [showCopyHint, setShowCopyHint] = useState(false);
  /** Session flag: browser threw on multi-format clipboard write → langsung text-only. */
  const clipboardImageUnsupported = useRef(false);
  const [showExportFeedback, setShowExportFeedback] = useState(false);
  /** Reference photo data URL — session-only; persisted to the project when <500KB. */
  const [referenceDataUrl, setReferenceDataUrl] = useState<string | null>(null);
  const [elementError, setElementError] = useState<string | null>(null);
  const [generationMode, setGenerationMode] = useState<'generate' | 'edit'>('generate');
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);

  const [expandedSections, setExpandedSections] = useState<StudioExpandedSections>(() => (
    defaultExpandedForDomain(activeDomain)
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

  // --- Studio Builder (custom domains, phase 5) ---
  const [showStudioBuilder, setShowStudioBuilder] = useState(false);
  /** Edit mode target; null = create mode. */
  const [editingRecipe, setEditingRecipe] = useState<CustomRecipe | null>(null);
  /** Bump forces re-render → pills + StartScreen re-read getAllDomains()
   *  (registry cache already invalidated by saveCustomStudio/deleteCustomStudio). */
  const [customsVersion, setCustomsVersion] = useState(0);
  const studioImportInputRef = useRef<HTMLInputElement | null>(null);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  }, []);

  // --- Project IO ---
  /** Only persist the reference photo to the project file when it is small enough. */
  const exportedReferenceDataUrl = useMemo(
    () => (referenceDataUrl && referenceDataUrl.length < 500 * 1024 ? referenceDataUrl : undefined),
    [referenceDataUrl],
  );

  const projectIO = useProjectIO({
    domainId,
    domainState: domain.state,
    referencePhotoDataUrl: exportedReferenceDataUrl,
    characters: elements.characters,
    sceneElement: elements.sceneElement,
    sceneInputMode: elements.sceneInputMode,
    imageInput: elements.imageInput,
    additionalReferenceImages: elements.additionalReferenceImages,
    setCharacters: elements.setCharacters,
    setSceneElement: elements.setSceneElement,
    setSceneInputMode: elements.setSceneInputMode,
    setImageInput: elements.setImageInput,
    setAdditionalReferenceImages: elements.setAdditionalReferenceImages,
    setError: setElementError,
    setIsManualPrompt: () => domain.clearManual(),
    setIsEditingPrompt: setIsEditingPrompt,
    currentProjectId,
    setCurrentProjectId,
    currentProjectName,
    setCurrentProjectName,
    setHasUnsavedChanges,
  });

  // --- Track dirty state on prompt/setting changes ---
  const projectSnapshotRef = useRef<string | null>(null);
  const [baselineEpoch, setBaselineEpoch] = useState(0);
  const currentProjectSnapshot = useMemo(
    () => createStateComparisonKey({ domainId, domainState: domain.state }),
    [domainId, domain.state],
  );

  /** Tetapkan baseline bersih — effect capture menangkap snapshot pada commit
   *  berikutnya sebagai acuan compare. Dipanggil di titik save/load/create/switch
   *  (epoch berubah → capture; typing TIDAK mengubah epoch → snapshot tetap acuan). */
  const requestCleanBaseline = useCallback(() => {
    setBaselineEpoch(epoch => epoch + 1);
    setHasUnsavedChanges(false);
  }, []);

  // Capture baseline bersih (state sudah final di commit ini)
  useEffect(() => {
    projectSnapshotRef.current = currentProjectSnapshot;
    // deps sengaja hanya epoch: capture HANYA saat baseline diminta eksplisit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baselineEpoch]);

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
      if (saveAutosave(currentProjectId, data)) {
        touchRecentProject(currentProjectId, data.name, domainId);
      }
    }, 1000);
    return () => clearTimeout(autosaveTimeoutRef.current ?? undefined);
  }, [appView, currentProjectId, currentProjectName, currentProjectSnapshot, projectIO, domainId, domain.state]);

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
      touchRecentProject(data.id, data.name, domainId);
    }
    requestCleanBaseline();
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2000);
  }, [projectIO, currentProjectId, domainId, domain.state, requestCleanBaseline]);

  /** Restore semua state dari ProjectFile v2/v3 — normalize → set domainId + reset domainState. */
  const restoreProject = useCallback((project: ProjectFile) => {
    const normalized = normalizeProjectFile(project);
    const nextDomainId = getDomain(normalized.domainId).id;
    setDomainId(nextDomainId);
    // Elemen cinematic (characters/scene/ref) + id/name via projectIO; state domain
    // ditimpa eksplisit di bawah (restore = reset(domainState) + set domainId).
    projectIO.restoreProjectState(normalized);
    domain.reset(normalized.domainState);
    setReferenceDataUrl(normalized.referencePhotoDataUrl ?? null);
    requestCleanBaseline();
  }, [domain, projectIO, requestCleanBaseline]);

  /** Import a .nbproject file picked via the hidden file input. */
  const handleImportFile = useCallback(async (file: File) => {
    isRestoringProjectRef.current = true;
    try {
      const text = await readFileAsText(file);
      const project = JSON.parse(text) as ProjectFile;
      const hasDomainState = !!project.domainState && typeof project.domainState === 'object';
      const hasPromptState = !!project.promptState && typeof project.promptState === 'object';
      if (!project || typeof project !== 'object' || (!hasDomainState && !hasPromptState)) {
        throw new Error('Not a valid .nbproject file');
      }
      if (!project.id) project.id = globalThis.crypto.randomUUID();
      if (!project.name) project.name = projectNameFromPath(file.name);
      restoreProject(project);
      saveAutosave(project.id, project);
      touchRecentProject(project.id, project.name, project.domainId ?? DEFAULT_DOMAIN_ID);
      studioLayoutResetRequestedRef.current = true;
      setTimeout(() => { isRestoringProjectRef.current = false; }, 100);
      setAppView('editor');
    } catch (err) {
      isRestoringProjectRef.current = false;
      setElementError(`Failed to import project: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [restoreProject]);

  /** Load a project from the localStorage autosave of a recent entry. */
  const handleLoadRecentProject = useCallback((projectId: string) => {
    const project = loadAutosave(projectId) as ProjectFile | null;
    if (!project) {
      setElementError('Saved state for this project is no longer available. Import the .nbproject file instead.');
      return;
    }
    isRestoringProjectRef.current = true;
    restoreProject(project);
    touchRecentProject(projectId, project.name, project.domainId ?? DEFAULT_DOMAIN_ID);
    studioLayoutResetRequestedRef.current = true;
    setTimeout(() => { isRestoringProjectRef.current = false; }, 100);
    setAppView('editor');
  }, [restoreProject]);

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
  const handleNewProject = useCallback((recipeId?: string, name?: string) => {
    const nextDomain = getDomain(recipeId ?? domainId);
    projectIO.handleClearAll();
    const emptyState = nextDomain.createEmptyState();
    domain.reset(emptyState);
    setDomainId(nextDomain.id);
    setExpandedSections(defaultExpandedForDomain(nextDomain));
    const id = globalThis.crypto?.randomUUID?.() ?? `proj-${Date.now()}`;
    const projectName = name?.trim() || 'Untitled';
    setCurrentProjectId(id);
    setCurrentProjectName(projectName);
    setReferenceDataUrl(null);
    requestCleanBaseline();
    setAppView('editor');
  }, [domain, domainId, projectIO, requestCleanBaseline]);

  /** Open Project: trigger the hidden file input */
  const handleOpenProject = useCallback(() => {
    importFileInputRef.current?.click();
  }, []);

  // --- Studio Builder handlers (phase 5) ---

  /** Create Studio: open the builder empty. */
  const openBuilder = useCallback(() => {
    setEditingRecipe(null);
    setShowStudioBuilder(true);
  }, []);

  /** Edit Studio: open the builder pre-filled; Save overwrites the same id. */
  const openBuilderWith = useCallback((recipe: CustomRecipe) => {
    setEditingRecipe(recipe);
    setShowStudioBuilder(true);
  }, []);

  /** Import Studio: trigger the hidden .nbrecipe file input. */
  const handleImportStudio = useCallback(() => {
    studioImportInputRef.current?.click();
  }, []);

  /** Import a .nbrecipe file: parse → validate (builtin + existing custom id
   *  collisions rejected, v1 per plan) → save + bump. Errors alert, nothing saved. */
  const handleStudioImportFile = useCallback(async (file: File) => {
    try {
      const text = await readFileAsText(file);
      const json: unknown = JSON.parse(text);
      const collisionIds = [...DOMAINS.map(d => d.id), ...listCustomRecipes().map(r => r.id)];
      const result = validateRecipe(json, collisionIds);
      if (!result.ok) {
        window.alert(`Invalid studio recipe:\n${result.errors.join('\n')}`);
        return;
      }
      if (saveCustomStudio(result.recipe)) setCustomsVersion(v => v + 1);
    } catch (err) {
      window.alert(`Failed to import studio: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, []);

  /** Builder saved: refresh pills/cards and close. */
  const handleStudioSaved = useCallback(() => {
    setCustomsVersion(v => v + 1);
    setShowStudioBuilder(false);
    setEditingRecipe(null);
  }, []);

  const handleClearWorkspace = useCallback(() => {
    projectIO.handleClearAll();
    const emptyState = activeDomain.createEmptyState();
    domain.reset(emptyState);
    setExpandedSections(defaultExpandedForDomain(activeDomain));
    setReferenceDataUrl(null);
    requestCleanBaseline();
  }, [activeDomain, domain, projectIO, requestCleanBaseline]);

  /** Ganti domain aktif (header switcher) — reset state hook + project baru,
   *  dengan unsaved-warning bila ada perubahan yang belum disimpan. */
  const switchDomain = useCallback((nextId: string) => {
    if (nextId === domainId) return;
    const targetDomain = getDomain(nextId);
    const apply = () => {
      setDomainId(nextId);
      const emptyState = targetDomain.createEmptyState();
      domain.reset(emptyState);
      setExpandedSections(defaultExpandedForDomain(targetDomain));
      const id = globalThis.crypto?.randomUUID?.() ?? `proj-${Date.now()}`;
      setCurrentProjectId(id);
      setCurrentProjectName('Untitled');
      setReferenceDataUrl(null);
      requestCleanBaseline();
      setShowSavedFeedback(false);
    };
    requestNavigation(apply);
  }, [domainId, domain, requestNavigation, requestCleanBaseline]);

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
    setExpandedSections(defaultExpandedForDomain(activeDomain));
  }, [
    appView,
    activeDomain,
  ]);

  useEffect(() => {
    if (elementError) {
      setExpandedSections(prev => (prev['elements-tool'] ? prev : { ...prev, 'elements-tool': true }));
    }
  }, [elementError]);

  // --- Final prompt: auto-build dari domain hook; cinematic pakai prompt singkat
  // saat mode Edit (Inpaint) dengan Global Reference aktif (perilaku lama).
  const isEditWithSourceImage = domainId === 'cinematic'
    && !!elements.imageInput.base64Data
    && generationMode === 'edit';
  const editModePrompt = useMemo(() => {
    if (!isEditWithSourceImage) return '';
    const subject = getSubjectPhrase(domain.state as unknown as PromptState);
    const ar = getAspectRatioSentence(domain.state as unknown as PromptState);
    return [`Modify the source image to: ${subject}.`, 'Don\'t blur faces randomly.', ar].filter(Boolean).join(' ');
  }, [isEditWithSourceImage, domain.state]);
  const finalPrompt = isEditWithSourceImage && !domain.isManualPrompt ? editModePrompt : domain.finalPrompt;

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

  /** Load visual settings — merge preset ke state saat ini (engine). */
  const handleLoadPreset = (preset: PresetWithPrompts) => {
    const nextState = applyPreset(
      activeDomain,
      domain.state,
      (preset.data ?? {}) as unknown as Record<string, unknown>,
    );
    // Perilaku preset existing: teks prompt yang sudah terisi tidak pernah ditimpa.
    for (const key of ['subjectAction', 'environment', 'mood'] as const) {
      const currentValue = domain.state[key];
      if (typeof currentValue === 'string' && currentValue.trim().length > 0) {
        nextState[key] = currentValue;
      }
    }
    domain.reset(nextState);
    setExpandedSections(prev => ({
      ...prev,
      ...defaultExpandedForDomain(activeDomain),
    }));
  };

  /** Full prompt text (reference instruction + constructed prompt). */
  const primaryPromptToSend = useMemo(() => {
    if (!currentElementsInstructionFull) return finalPrompt;
    return `${currentElementsInstructionFull} ${finalPrompt}`.trim();
  }, [currentElementsInstructionFull, finalPrompt]);

  const primaryPromptForDisplay = useMemo(() => {
    if (!currentElementsInstructionDisplay) return finalPrompt;
    return `${currentElementsInstructionDisplay} ${finalPrompt}`.trim();
  }, [currentElementsInstructionDisplay, finalPrompt]);

  /** Copy the constructed prompt (and the reference photo, when available). */
  const handleCopyPrompt = async () => {
    if (!primaryPromptToSend) return;
    const showFeedback = () => {
      setShowCopyFeedback(true);
      setTimeout(() => setShowCopyFeedback(false), 2000);
    };
    const showHint = () => {
      setShowCopyHint(true);
      setTimeout(() => setShowCopyHint(false), 4000);
    };

    // Prefer image+text+html clipboard (Chrome/Edge) when a reference photo is attached.
    // Browser yang melempar error multi-format (Safari/Firefox) ditandai sekali —
    // percobaan berikutnya langsung text-only.
    const supportsImageClipboard = referenceDataUrl
      && !clipboardImageUnsupported.current
      && typeof ClipboardItem !== 'undefined'
      && !!navigator.clipboard
      && typeof navigator.clipboard.write === 'function';

    if (supportsImageClipboard) {
      try {
        // Clipboard Chrome/Safari hanya menerima image/png — transcode bila perlu.
        const png = await toClipboardImageBlob(dataURLToBlob(referenceDataUrl));
        // Tiga representasi dalam SATU ClipboardItem: penerima memilih yang ia pahami.
        const html = `<img src="${referenceDataUrl}" alt="reference"><p>${escapeHtml(primaryPromptToSend)}</p>`;
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': png,
            'text/plain': new Blob([primaryPromptToSend], { type: 'text/plain' }),
            'text/html': new Blob([html], { type: 'text/html' }),
          }),
        ]);
        showFeedback();
        showHint();
        return;
      } catch (err) {
        console.error('Clipboard multi-format copy failed, falling back to text-only', err);
        clipboardImageUnsupported.current = true;
      }
    }

    // Text-only fallback.
    try {
      await navigator.clipboard.writeText(primaryPromptToSend);
      showFeedback();
      if (referenceDataUrl) showHint();
    } catch (err) {
      console.error(err);
    }
  };

  /** Ghost button: copy only the prompt text. */
  const handleCopyTextOnly = async () => {
    if (!primaryPromptToSend) return;
    try {
      await navigator.clipboard.writeText(primaryPromptToSend);
      setShowCopyFeedback(true);
      setTimeout(() => setShowCopyFeedback(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  /** Ghost button: copy only the reference photo (or its composite). */
  const handleCopyPhotoOnly = async () => {
    if (!referenceDataUrl) return;
    try {
      // Chrome/Safari menolak image/jpeg di clipboard — transcode ke PNG dulu.
      const png = await toClipboardImageBlob(dataURLToBlob(referenceDataUrl));
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': png }),
      ]);
      setShowCopyFeedback(true);
      setTimeout(() => setShowCopyFeedback(false), 2000);
    } catch (err) {
      console.error('Clipboard image-only copy failed', err);
      window.alert('Your browser cannot copy images — drag the preview instead.');
    }
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
          handleNewProject(domainId, name);
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

      {/* Hidden studio recipe import input */}
      <input
        ref={studioImportInputRef}
        type="file"
        accept=".json,.nbrecipe,application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleStudioImportFile(file);
          e.target.value = '';
        }}
      />

      {/* Studio Builder modal (create/edit custom studios) */}
      <StudioBuilder
        isOpen={showStudioBuilder}
        initialRecipe={editingRecipe}
        onClose={() => { setShowStudioBuilder(false); setEditingRecipe(null); }}
        onSaved={handleStudioSaved}
      />

      {appView === 'start' ? (
        <StartScreen
          onNewProject={handleNewProject}
          onOpenProject={handleOpenProject}
          onLoadRecentProject={handleLoadRecentProject}
          onCreateStudio={openBuilder}
          onImportStudio={handleImportStudio}
          onEditStudio={openBuilderWith}
        />
      ) : (
    <div className="min-h-screen lg:h-screen bg-base text-ink font-sans flex flex-col lg:overflow-hidden">
      {/* ========== HEADER ========== */}
      <header className="shrink-0 border-b border-line bg-base/90 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
            <div>
              <h1 className="brand-wordmark text-3xl tracking-tight">
                Ai<span className="text-accent">chemy</span>
              </h1>
              <p className="brand-tagline text-xs mt-1">Brew your perfect prompt</p>
            </div>
            {/* Project name + saved indicator */}
            {currentProjectName && (
              <div className="flex min-w-0 flex-wrap items-center gap-2 lg:ml-4 lg:border-l lg:border-line lg:pl-4">
                <span className="text-xs font-medium text-dim truncate max-w-full lg:max-w-[200px]">{currentProjectName}</span>
                {hasUnsavedChanges && <span className="text-accent text-lg leading-none" title="Unsaved changes">●</span>}
                {showSavedFeedback && <span className="text-[10px] font-bold uppercase tracking-wider text-ok animate-in fade-in">Saved</span>}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 xl:justify-end">
            {/* Domain switcher — key on customsVersion forces a fresh getAllDomains() read after studio save/import/delete */}
            <div key={customsVersion} className="flex items-center gap-1.5" role="group" aria-label="Recipe domain">
              {getAllDomains().map(d => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => switchDomain(d.id)}
                  title={d.tagline}
                  className={`h-9 px-3 rounded-full border text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    d.id === domainId
                      ? 'bg-accent text-white border-accent'
                      : 'border-line text-dim hover:text-ink hover:border-dim'
                  }`}
                >
                  <span aria-hidden="true">{d.icon}</span>
                  <span className="hidden sm:inline">{d.label}</span>
                </button>
              ))}
            </div>
            <button type="button" onClick={() => requestNavigation(() => setAppView('start'))}
              title="Back to start screen"
              className="h-9 px-4 py-2 border border-line rounded-full text-xs font-bold uppercase tracking-wider text-ink hover:text-ink hover:border-dim transition-all flex items-center justify-center gap-2">
              <Home className="w-4 h-4" /> Home
            </button>
            <button type="button" onClick={() => requestNavigation(() => setShowNewProjectModal(true))}
              className="h-9 px-4 py-2 border border-line rounded-full text-xs font-bold uppercase tracking-wider text-ink hover:text-ink hover:border-dim transition-all flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> New
            </button>
            <button type="button" onClick={handleClearWorkspace}
              className="h-9 px-4 py-2 border border-line rounded-full text-xs font-bold uppercase tracking-wider text-ink hover:text-ink hover:border-dim transition-all flex items-center justify-center">
              Clear All
            </button>
            <button type="button" onClick={() => setShowPresetLibrary(true)}
              className="h-9 px-4 py-2 border border-line bg-surface rounded-full text-xs font-bold uppercase tracking-wider text-ink hover:text-ink hover:border-accent hover:text-accent transition-all flex items-center gap-2">
              <Bookmark className="w-4 h-4" /> Presets
            </button>
            <button type="button" onClick={() => requestNavigation(handleOpenProject)}
              title="Import a .nbproject file"
              className="h-9 px-4 py-2 border border-line bg-surface rounded-full text-xs font-bold uppercase tracking-wider text-ink hover:text-ink hover:border-blue-500 hover:text-blue-500 transition-all flex items-center gap-2">
              <FolderOpen className="w-4 h-4" /> Import
            </button>
            <button type="button" onClick={handleExportProject}
              title="Export project as .nbproject file"
              className="h-9 px-4 py-2 bg-accent text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-accent/90 transition-all flex items-center gap-2">
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

          {/* Engine sections — domain.sections via DomainFieldRenderer (customSections dirender khusus di bawah) */}
          {activeDomain.sections.map(section => {
            const sectionWarnings = domain.warnings.filter(w => w.sectionId === section.id);
            return (
              <StudioAccordionSection
                key={section.id}
                id={section.id}
                icon={section.icon}
                isOpen={expandedSections[section.id] ?? false}
                onToggle={() => toggleSection(section.id)}
                title={section.title}
              >
                <div className="grid gap-6">
                  {section.fields.map(field => (
                    <div key={field.key}>
                      {domainId === 'cinematic' && field.key === 'subjectAction' ? (
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-accent2">Subject & Action</label>
                          <MentionTextarea
                            value={typeof domain.state.subjectAction === 'string' ? domain.state.subjectAction : ''}
                            onChange={(val) => domain.updateField('subjectAction', val)}
                            mentions={subjectMentions}
                            spellCheck={true}
                            placeholder={subjectMentions.length > 0
                              ? 'E.g., @Character1 walks toward @Image1... (type @ to reference a character or image)'
                              : 'E.g., A woman in a trench coat checking her phone...'}
                            rows={3}
                            className="w-full bg-surface border border-line rounded-lg px-4 py-3 text-ink text-sm focus:outline-none focus:border-accent transition-colors resize-y"
                          />
                        </div>
                      ) : (
                        <DomainFieldRenderer
                          field={field}
                          value={domain.state[field.key]}
                          onChange={(value) => domain.updateField(field.key, value)}
                          state={domain.state}
                        />
                      )}
                    </div>
                  ))}
                </div>
                {sectionWarnings.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {sectionWarnings.map((warning, idx) => (
                      <SectionWarningBanner key={`${warning.sectionId}-${idx}`} warning={warning} />
                    ))}
                  </div>
                )}
              </StudioAccordionSection>
            );
          })}

          {/* Section 5: Elements Tool — fitur khusus cinematic (customSections) */}
          {domainId === 'cinematic' && (
          <StudioAccordionSection
            id="elements-tool"
            icon={<Layers className="w-5 h-5" />}
            isOpen={expandedSections['elements-tool'] ?? false}
            onToggle={() => toggleSection('elements-tool')}
            title="05. Elements Tool (Images)"
          >
            {/* Character Tabs */}
            <div className="flex items-center gap-2 mb-4">
              {elements.characters.map((char, idx) => (
                <div key={char.id}
                  className={`flex items-center gap-2 px-3 py-1.5 border select-none cursor-pointer transition-colors ${
                    idx === elements.activeCharIndex
                      ? "border-ink bg-white/10 text-ink"
                      : "border-line bg-surface/50 text-dim hover:border-line"
                  }`}
                  onClick={() => elements.setActiveCharIndex(idx)}>
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {elements.characters.length >= 4 ? `CHA ${idx + 1}` : `CHARACTER ${idx + 1}`}
                  </span>
                  {elements.characters.length > 1 && (
                    <button onClick={(e) => { e.stopPropagation(); elements.handleRemoveCharacter(idx); }}
                      className="hover:text-danger transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              {elements.characters.length < 4 && (
                <button type="button" onClick={elements.handleAddCharacter}
                  className="px-3 py-1.5 border border-line bg-surface/50 text-dim hover:border-ink hover:text-ink transition-colors">
                  <span className="text-lg leading-none">+</span>
                </button>
              )}
              {/* Character Library Button */}
              <button type="button" onClick={() => setShowCharacterLibrary(true)}
                className="ml-auto px-3 py-1.5 border border-line bg-surface/50 text-dim hover:border-accent/50 hover:text-accent transition-colors flex items-center gap-1.5"
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
                    className={`relative aspect-square bg-surface border overflow-hidden group text-left cursor-pointer transition-all ${
                      isDragOver
                        ? 'border-accent ring-2 ring-accent/50'
                        : 'border-line hover:border-accent/50'
                    }`}
                    title={isElementStitchMode
                      ? (el.previewDataUrl ? `Replace ${el.label} with 2-4 image stitch` : `Upload ${el.label} (Stitch: select 2-4 images)`)
                      : (el.previewDataUrl ? `Replace ${el.label}` : `Upload ${el.label}`)}>
                    <div className="absolute top-2 left-2 z-20 inline-flex overflow-hidden rounded border border-ink/20 bg-base/70">
                      <button
                        type="button"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          elements.setCharacterElementInputMode(elements.activeCharIndex, characterElementType, 'single');
                        }}
                        className={`px-2 py-1 text-[9px] font-black uppercase tracking-wider transition-colors ${
                          !isElementStitchMode ? 'bg-accent text-white' : 'text-ink hover:text-ink'
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
                          isElementStitchMode ? 'bg-accent text-white' : 'text-ink hover:text-ink'
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
                        <div className="absolute inset-0 bg-base/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button type="button" onClick={(ev) => { ev.stopPropagation(); elements.openInpaintEditor('character', el.previewDataUrl!, elements.activeCharIndex, characterElementType); }}
                            className="bg-base/70 hover:bg-blue-500 hover:text-white text-ink p-2 rounded-full transition-all" title="Edit Image">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={(ev) => { ev.stopPropagation(); elements.removeElementImage(el.id); }}
                            className="bg-base/70 hover:bg-accent hover:text-white text-ink p-2 rounded-full transition-all" title="Remove">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        {el.originalDataUrl && (
                          <button type="button" onClick={(ev) => { ev.stopPropagation(); elements.resetToOriginal('character', elements.activeCharIndex, characterElementType); }}
                            className="absolute bottom-14 left-2 bg-base/70 hover:bg-ok hover:text-white text-ink px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-all" title="Reset to Original">
                            <RefreshCw className="w-3 h-3 inline mr-1" /> Reset
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                        {elementIcon(el.id)}
                        <div className="text-xs font-black uppercase tracking-widest text-ink">{el.label}</div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-dim">
                          {isElementStitchMode ? 'Click to select 2-4 images' : 'Click or drop image'}
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-base/70 backdrop-blur-sm border-t border-ink/10 px-3 py-2">
                      <div className="text-[10px] font-black uppercase tracking-widest text-ink">{el.label}</div>
                      <div className="text-[10px] font-bold tracking-wide text-dim">
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
                  className={`relative aspect-square bg-surface border overflow-hidden group text-left cursor-pointer transition-all ${
                    !isSceneStitchMode && elements.dragOverElementId === elements.sceneElement.id
                      ? 'border-accent ring-2 ring-accent/50'
                      : 'border-line hover:border-accent/50'
                  }`}
                  title={isSceneStitchMode
                    ? (elements.sceneElement.previewDataUrl ? 'Replace Scene with 2-4 image stitch' : 'Upload Scene (Stitch: select 2-4 images)')
                    : (elements.sceneElement.previewDataUrl ? 'Replace Scene' : 'Upload Scene')}>
                  <div className="absolute top-2 left-2 z-20 inline-flex overflow-hidden rounded border border-ink/20 bg-base/70">
                    <button
                      type="button"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        elements.setSceneInputMode('single');
                      }}
                      className={`px-2 py-1 text-[9px] font-black uppercase tracking-wider transition-colors ${
                        !isSceneStitchMode ? 'bg-accent text-white' : 'text-ink hover:text-ink'
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
                        isSceneStitchMode ? 'bg-accent text-white' : 'text-ink hover:text-ink'
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
                      <div className="absolute inset-0 bg-base/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button type="button" onClick={(ev) => { ev.stopPropagation(); elements.openInpaintEditor('scene', elements.sceneElement.previewDataUrl!); }}
                          className="bg-base/70 hover:bg-blue-500 hover:text-ink text-ink p-2 rounded-full transition-all" title="Edit Image">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={(ev) => { ev.stopPropagation(); elements.removeElementImage(elements.sceneElement.id); }}
                          className="bg-base/70 hover:bg-accent hover:text-white text-ink p-2 rounded-full transition-all" title="Remove">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {elements.sceneElement.originalDataUrl && (
                        <button type="button" onClick={(ev) => { ev.stopPropagation(); elements.resetToOriginal('scene'); }}
                          className="absolute bottom-14 left-2 bg-base/70 hover:bg-ok hover:text-white text-ink px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-all" title="Reset to Original">
                          <RefreshCw className="w-3 h-3 inline mr-1" /> Reset
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                      {elementIcon(elements.sceneElement.id)}
                      <div className="text-xs font-black uppercase tracking-widest text-ink">{elements.sceneElement.label}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-dim">
                        {isSceneStitchMode ? 'Click to select 2-4 images' : 'Click or drop image'}
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-base/70 backdrop-blur-sm border-t border-ink/10 px-3 py-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-ink">{elements.sceneElement.label}</div>
                    <div className="text-[10px] font-bold tracking-wide text-dim">{elements.sceneElement.promptLabel}</div>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-square bg-surface/30 border border-line/50 flex flex-col items-center justify-center gap-3 opacity-50 cursor-not-allowed"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                  <ImageIcon className="w-7 h-7 text-dim" />
                  <div className="text-xs font-black uppercase tracking-widest text-dim">Scene Reference</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-dim text-center px-2">
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
                className={`col-span-2 relative aspect-[3/1] bg-surface/50 border overflow-hidden group text-left cursor-pointer transition-all ${
                  elements.dragOverElementId === elements.imageInput.id
                    ? 'border-accent ring-2 ring-accent/50'
                    : 'border-line hover:border-accent/50'
                }`}
                title={elements.imageInput.previewDataUrl ? `Replace Global Reference` : `Upload Global Reference`}>
                {elements.dragOverElementId === elements.imageInput.id && <DropOverlay />}
                {elements.imageInput.previewDataUrl ? (
                  <>
                    <img src={elements.imageInput.previewDataUrl} alt="Global reference" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                    <div className="absolute inset-0 bg-base/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button type="button" onClick={(ev) => { ev.stopPropagation(); elements.openInpaintEditor('global', elements.imageInput.previewDataUrl!); }}
                        className="bg-base/70 hover:bg-blue-500 hover:text-ink text-ink p-2 rounded-full transition-all" title="Edit Image">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={(ev) => { ev.stopPropagation(); elements.removeElementImage(elements.imageInput.id); }}
                        className="bg-base/70 hover:bg-accent hover:text-white text-ink p-2 rounded-full transition-all" title="Remove">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {elements.imageInput.originalDataUrl && (
                      <button type="button" onClick={(ev) => { ev.stopPropagation(); elements.resetToOriginal('global'); }}
                        className="absolute bottom-14 left-2 bg-base/70 hover:bg-ok hover:text-white text-ink px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-all" title="Reset to Original">
                        <RefreshCw className="w-3 h-3 inline mr-1" /> Reset
                      </button>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-row items-center justify-center gap-4">
                    {elementIcon(elements.imageInput.id)}
                    <div className="flex flex-col">
                      <div className="text-xs font-black uppercase tracking-widest text-ink">{elements.imageInput.label}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-dim">Drop image or click to upload</div>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-base/70 backdrop-blur-sm border-t border-ink/10 px-3 py-2 flex justify-between items-center">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-ink">{elements.imageInput.label}</div>
                    <div className="text-[10px] font-bold tracking-wide text-dim">Switch the prompt to Edit mode</div>
                  </div>
                  {elements.imageInput.previewDataUrl && <div className="text-[10px] text-accent font-bold">ACTIVE</div>}
                </div>
              </div>

              <div className="col-span-2 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-dim">
                      {`Additional Reference Images (${activeAnonymousReferenceCount} active, ${currentReferenceDescriptors.length}/${MAX_REFERENCE_IMAGES} total)`}
                    </div>
                    <div className="text-[10px] font-bold tracking-wide text-dim">
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
                        ? 'border-line text-ink hover:border-accent hover:text-accent'
                        : 'border-line text-dim cursor-not-allowed'
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
                            <span className="text-[11px] font-bold uppercase tracking-wider text-dim truncate min-w-0">
                              Reference {index + 1}
                            </span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => elements.openAdditionalReferenceFilePicker(index)}
                                className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider border border-line text-ink hover:border-accent hover:text-accent"
                              >
                                <span className="inline-flex items-center gap-1"><Upload className="w-3 h-3" /> Upload</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => elements.removeAdditionalReferenceImage(index)}
                                className="p-1.5 border border-line text-dim hover:border-accent hover:text-accent transition-all"
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
                            className={`relative aspect-[4/3] bg-base border overflow-hidden group text-left cursor-pointer transition-all ${
                              isDragOver
                                ? 'border-accent ring-2 ring-accent/50'
                                : activeNumber
                                  ? 'border-accent/60'
                                  : isOverflow
                                    ? 'border-orange-500/50'
                                    : 'border-line hover:border-accent/50'
                            }`}
                            title={reference.previewDataUrl ? `Replace Reference ${index + 1}` : `Upload Reference ${index + 1}`}
                          >
                            {isDragOver && <DropOverlay />}
                            {reference.previewDataUrl ? (
                              <>
                                <img src={reference.previewDataUrl} alt={`Reference ${index + 1}`} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                                <div className="absolute inset-0 bg-base/35" />
                              </>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                                {elementIcon('anonymousReference')}
                                <div className="text-xs font-black uppercase tracking-widest text-ink">Reference Image</div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-dim">Drop image or click to upload</div>
                              </div>
                            )}

                            <div className="absolute bottom-0 left-0 right-0 bg-base/75 backdrop-blur-sm border-t border-ink/10 px-3 py-2 flex items-center justify-between gap-3">
                              <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-ink">Reference {index + 1}</div>
                                <div className={`text-[10px] font-bold tracking-wide ${
                                  activeNumber
                                    ? 'text-accent2'
                                    : isOverflow
                                      ? 'text-orange-400'
                                      : 'text-dim'
                                }`}>
                                  {statusText}
                                </div>
                              </div>
                              {activeNumber && (
                                <div className="text-[10px] font-black uppercase tracking-widest text-accent2">
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
                  <div className="flex bg-surface border border-line rounded-full p-1 w-full">
                    <button type="button" onClick={() => setGenerationMode('generate')}
                      className={`flex-1 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                        generationMode === 'generate' ? 'bg-accent text-white' : 'text-dim hover:text-ink'
                      }`}>Generate</button>
                    <button type="button" onClick={() => setGenerationMode('edit')}
                      className={`flex-1 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                        generationMode === 'edit' ? 'bg-accent text-white' : 'text-dim hover:text-ink'
                      }`}>Edit (Inpaint)</button>
                  </div>
                </div>
              ) : (
                <div className="col-span-2 flex items-center gap-2 mt-2 relative group">
                  <div className="flex bg-surface/50 border border-line rounded-full p-1 w-full opacity-50 cursor-not-allowed">
                    <div className="flex-1 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-dim text-center">Generate</div>
                    <div className="flex-1 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-dim text-center">Edit (Inpaint)</div>
                  </div>
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-surface2 border border-line px-3 py-2 rounded-lg text-xs text-ink whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-3 h-3 text-accent" />
                      <span>Add a Global Reference image to enable Edit mode</span>
                    </div>
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-surface2 border-l border-t border-line rotate-45" />
                  </div>
                </div>
              )}
            </div>

            {/* Narrative Angle Toggle */}
            <div className="mt-2 flex items-center justify-between bg-surface/30 border border-line/50 p-3 hover:bg-surface/50 transition-colors cursor-pointer group select-none"
              onClick={() => domain.updateField('showNewAnglePrompt', domain.state.showNewAnglePrompt !== true)}>
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-full ${domain.state.showNewAnglePrompt === true ? 'bg-accent/20 text-accent' : 'bg-surface2 text-dim'}`}>
                  <Video className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs font-bold uppercase tracking-widest ${domain.state.showNewAnglePrompt === true ? 'text-ink' : 'text-dim group-hover:text-ink'}`}>
                    Narrative Angle Prompting
                  </span>
                  <span className="text-[10px] text-dim">"In this new angle what would the viewer see? Show us..."</span>
                  {domain.state.showNewAnglePrompt === true && !domain.state.shotType && (
                    <span className="text-[10px] text-accent/80 mt-0.5 animate-in fade-in">
                      Warning: Needs a <b>Shot Type</b> to activate.
                    </span>
                  )}
                </div>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors duration-200 ${domain.state.showNewAnglePrompt === true ? 'bg-accent' : 'bg-surface2'}`}>
                <div className={`absolute top-1 bottom-1 w-3 bg-white rounded-full transition-all duration-200 ${domain.state.showNewAnglePrompt === true ? 'left-6' : 'left-1'}`} />
              </div>
            </div>

            {/* Hidden file input + transcoding canvas */}
            <input ref={elements.elementFileInputRef} type="file" accept="image/*" multiple={elements.filePickerMultiple} className="hidden"
              onChange={(e) => elements.handleElementFileSelected(e, setElementError)} />
            <canvas ref={elements.transcodeCanvasRef} className="hidden" />
          </StudioAccordionSection>
          )}
          </div>
        )}
        rightPane={(
          <div className="space-y-6 pb-12 lg:pb-8">

          {/* Reference Photo Field (only when the domain uses one) */}
          {activeDomain.referencePhoto && (
            <ReferencePhotoField
              value={referenceDataUrl}
              onChange={(url) => {
                setReferenceDataUrl(url);
                // Mirror upload state into domain state so domains whose reference clause
                // is gated on actual upload (logo) can react; siblings keep their default
                // hasReferencePhoto: true, so their default prompts are unchanged.
                domain.updateField('hasReferencePhoto', url !== null);
              }}
              label={activeDomain.referenceLabel}
              hint="Used as the identity reference — your AI app receives it alongside the prompt."
            />
          )}

          {/* Prompt Preview Box */}
          <div className={`prompt-panel rounded-card border border-line p-6 relative transition-all group ${isEditingPrompt ? 'border-accent/50' : 'hover:border-accent/50'}`}>
            <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-base border border-line rounded-full text-accent2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              Constructed Prompt
            </div>

            <div className="absolute top-0 right-0 p-2 flex max-w-[calc(100%-7rem)] flex-wrap justify-end gap-2">
              <button onClick={() => setShowPresetLibrary(true)}
                className="flex items-center gap-1 bg-accent text-white rounded-full hover:bg-accent/90 text-[10px] font-bold uppercase transition-all px-3 py-1.5" title="Save current options as a preset">
                <Bookmark className="w-3 h-3" /> SAVE PRESET
              </button>
              <button onClick={() => setIsEditingPrompt(!isEditingPrompt)}
                className={`flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 border transition-all ${
                  isEditingPrompt ? "bg-accent text-white border-accent" : "bg-transparent text-dim border-transparent hover:text-accent"
                }`}>
                {isEditingPrompt ? <Check className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
                {isEditingPrompt ? "DONE" : "EDIT"}
              </button>
              {domain.isManualPrompt && isEditingPrompt && (
                <button onClick={() => domain.clearManual()}
                  className="flex items-center gap-1 text-danger hover:text-danger/80 text-[10px] font-bold uppercase transition-all px-2 py-1 border border-danger/30 hover:border-danger/70" title="Revert to auto-generated prompt">
                  <X className="w-3 h-3" /> RESET
                </button>
              )}
              <button onClick={handleExportPrompt}
                className={`flex items-center gap-1 font-bold uppercase transition-all px-2 py-1 text-[10px] ${
                  showExportFeedback ? "text-ok" : "text-dim hover:text-accent"
                }`} title="Download prompt as .txt">
                {showExportFeedback ? <Check className="w-3 h-3" /> : <FileDown className="w-3 h-3" />}
                {showExportFeedback ? "EXPORTED" : "EXPORT"}
              </button>
              <button onClick={handleCopyPrompt}
                className="flex items-center gap-1 bg-accent text-white rounded-full hover:bg-accent/90 text-[10px] font-bold uppercase transition-all px-3 py-1.5">
                {showCopyFeedback
                  ? <span className="flex items-center gap-1"><Check className="w-3 h-3" /> COPIED</span>
                  : <><Copy className="w-3 h-3" /> {referenceDataUrl ? 'COPY PROMPT + FOTO' : 'COPY'}</>}
              </button>
              {referenceDataUrl && (
                <>
                  <button onClick={handleCopyTextOnly}
                    className="flex items-center gap-1 text-dim hover:text-accent text-[10px] font-bold uppercase transition-all px-2 py-1"
                    title="Copy the prompt text only">
                    Text only
                  </button>
                  <button onClick={handleCopyPhotoOnly}
                    className="flex items-center gap-1 text-dim hover:text-accent text-[10px] font-bold uppercase transition-all px-2 py-1"
                    title="Copy the reference photo only">
                    Photo only
                  </button>
                </>
              )}
            </div>

            <div className="mt-8 font-mono text-sm leading-relaxed text-ink whitespace-pre-wrap">
              {isEditingPrompt ? (
                <div className="flex flex-col gap-2">
                  {currentElementsInstructionDisplay && (
                    <div className="p-3 bg-base/30 border border-line text-dim italic text-xs select-none">
                      {currentElementsInstructionDisplay}
                    </div>
                  )}
                  <textarea value={finalPrompt}
                    onChange={(e) => domain.setManual(e.target.value)}
                    placeholder="Type your prompt here..."
                    spellCheck={true}
                    className="w-full h-40 bg-base/50 border border-line p-3 text-ink focus:border-accent focus:outline-none resize-y" />
                </div>
              ) : (
                <p className="cursor-pointer" onClick={handleCopyPrompt}>
                  {primaryPromptForDisplay || "Start selecting options to build your prompt..."}
                </p>
              )}
            </div>

          </div>

          {showCopyHint && (
            <div className="p-3 bg-accent/10 border border-accent/30 text-accent2 text-xs font-medium rounded-card">
              {clipboardImageUnsupported.current
                ? 'Your browser copied the text only — use the small buttons for the photo.'
                : 'Paste into ChatGPT/Gemini — photo and prompt arrive together. If only one appears, use the small buttons.'}
            </div>
          )}

          {elementError && (
            <div className="p-4 bg-danger/20 border border-danger/50 text-danger text-sm font-medium flex items-start justify-between gap-3">
              <span>Error: {elementError}</span>
              <button type="button" onClick={() => setElementError(null)} className="text-danger hover:text-ink transition-colors" title="Dismiss">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Hint footer */}
          <div className="text-center text-dim text-xs max-w-md mx-auto mt-4">
            <p>
              Copy the constructed prompt and paste it into your favorite image tool
              (Gemini, ChatGPT, Midjourney, ...). Aichemy never calls any API.
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
        domainId={domainId}
        currentDomainState={domain.state}
        presetProtectedKeys={activeDomain.presetProtectedKeys}
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
