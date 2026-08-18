/**
 * usePromptState - Manages prompt construction state
 * 
 * Handles all prompt-related state and the auto-building logic that
 * constructs the final prompt from individual selections.
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { createEmptyPromptState } from '../types';
import type { PromptState, ElementState, InlineReferenceImage, ReferenceImageCategory, CharacterData } from '../types';
/** Reference image inclusion contract (formerly from providers/types). */
export type ReferenceContract = 'all' | 'character1-global' | 'none' | (string & {});
import {
  buildPromptFromState,
  getIntroPhrase,
  getShotTypePhrase,
  getSubjectPhrase,
  getEnvironmentPhrase,
  getLightingMoodSentence,
  getGearSentence,
  getPhotographerSentence,
  getMovieLookSentence,
  getFilterSentence,
  getAspectRatioSentence
} from '../services/promptBuilder';
import { CHARACTER_ELEMENT_DEFS, SCENE_ELEMENT_DEF } from '../constants';

// --- Factory Functions ---

export const createInitialPromptState = (): PromptState => createEmptyPromptState();

export const createInitialCharacter = (index: number): CharacterData => ({
  id: crypto.randomUUID(),
  label: `Character${index + 1}`,
  face: { ...CHARACTER_ELEMENT_DEFS.face, previewDataUrl: null, base64Data: null, mimeType: null },
  outfit: { ...CHARACTER_ELEMENT_DEFS.outfit, previewDataUrl: null, base64Data: null, mimeType: null },
  object: { ...CHARACTER_ELEMENT_DEFS.object, previewDataUrl: null, base64Data: null, mimeType: null },
  faceInputMode: 'single',
  outfitInputMode: 'single',
  objectInputMode: 'single',
});

export const createInitialScene = (): ElementState => ({
  ...SCENE_ELEMENT_DEF,
  previewDataUrl: null,
  base64Data: null,
  mimeType: null,
});

export const createInitialImageInput = (): ElementState => ({
  id: 'imageInput',
  label: 'Global Reference',
  promptLabel: 'Global Reference',
  previewDataUrl: null,
  base64Data: null,
  mimeType: null,
});

export const createInitialAdditionalReference = (): ElementState => ({
  id: 'anonymousReference',
  label: 'Reference Image',
  promptLabel: 'Reference Image',
  previewDataUrl: null,
  base64Data: null,
  mimeType: null,
  instanceId: crypto.randomUUID(),
});

export function usePromptState() {
  const [promptState, setPromptState] = useState<PromptState>(() => createInitialPromptState());
  const [finalPrompt, setFinalPrompt] = useState("");
  const [isManualPrompt, setIsManualPrompt] = useState(false);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const prevPromptStateRef = useRef<PromptState>(promptState);

  const updateState = <K extends keyof PromptState>(key: K, value: PromptState[K]) => {
    setPromptState(prev => ({ ...prev, [key]: value }));
  };

  const handleFilterChange = (value: string[]) => {
    updateState('filter', value);
  };

  const resetPrompt = () => {
    setIsManualPrompt(false);
    setFinalPrompt(buildPromptFromState(promptState));
  };

  return {
    promptState,
    setPromptState,
    finalPrompt,
    setFinalPrompt,
    isManualPrompt,
    setIsManualPrompt,
    isEditingPrompt,
    setIsEditingPrompt,
    prevPromptStateRef,
    updateState,
    handleFilterChange,
    resetPrompt,
  };
}

/**
 * usePromptAutoBuilder - Auto-builds the prompt from prompt state
 * Separated for clarity and to avoid circular dependencies
 */
export function usePromptAutoBuilder(
  promptState: PromptState,
  isManualPrompt: boolean,
  prevPromptStateRef: React.MutableRefObject<PromptState>,
  sourceImage: ElementState,
  generationMode: 'generate' | 'edit',
  setFinalPrompt: React.Dispatch<React.SetStateAction<string>>,
) {
  useEffect(() => {
    const isEditWithSourceImage = !!(sourceImage.base64Data && generationMode === 'edit');

    if (!isManualPrompt) {
      let prompt: string;
      if (isEditWithSourceImage) {
        // Simplified prompt for edit mode — the reference image carries the visual style
        const subject = getSubjectPhrase(promptState);
        const ar = getAspectRatioSentence(promptState);
        const parts = [`Modify the source image to: ${subject}.`, 'Don\'t blur faces randomly.', ar].filter(Boolean);
        prompt = parts.join(' ');
      } else {
        prompt = buildPromptFromState(promptState);
      }
      setFinalPrompt(prompt);
    } else if (isEditWithSourceImage) {
      // Manual prompt in edit mode: only update subject & aspect ratio
      const prevState = prevPromptStateRef.current;
      setFinalPrompt(prev => {
        let newPrompt = prev;
        const updatePart = (getter: (s: PromptState) => string) => {
          const oldPart = getter(prevState);
          const newPart = getter(promptState);
          if (oldPart !== newPart) {
            if (oldPart && newPrompt.includes(oldPart)) {
              newPrompt = newPrompt.replace(oldPart, newPart);
            } else if (!oldPart && newPart && !newPrompt.includes(newPart)) {
              newPrompt = `${newPrompt} ${newPart}`.trim();
            }
          }
        };

        updatePart(getSubjectPhrase);
        updatePart(getAspectRatioSentence);

        return newPrompt;
      });
    } else {
      // Manual prompt in generate mode: incrementally update all parts
      const prevState = prevPromptStateRef.current;
      setFinalPrompt(prev => {
        let newPrompt = prev;
        const updatePart = (getter: (s: PromptState) => string) => {
          const oldPart = getter(prevState);
          const newPart = getter(promptState);
          if (oldPart !== newPart) {
            if (oldPart && newPrompt.includes(oldPart)) {
              newPrompt = newPrompt.replace(oldPart, newPart);
            } else if (!oldPart && newPart && !newPrompt.includes(newPart)) {
              newPrompt = `${newPrompt} ${newPart}`.trim();
            }
          }
        };

        updatePart(getIntroPhrase);
        updatePart(getShotTypePhrase);
        updatePart(getSubjectPhrase);
        updatePart(getEnvironmentPhrase);
        updatePart(getLightingMoodSentence);
        updatePart(getGearSentence);
        updatePart(getPhotographerSentence);
        updatePart(getMovieLookSentence);
        updatePart(getFilterSentence);

        const staticSuffix = "Don't blur faces randomly.";
        const oldReview = getAspectRatioSentence(prevState);
        const newReview = getAspectRatioSentence(promptState);

        if (newPrompt.includes(staticSuffix)) {
          newPrompt = newPrompt.split(staticSuffix).join(" ");
        }
        if (oldReview && newPrompt.includes(oldReview)) {
          newPrompt = newPrompt.split(oldReview).join(" ");
        }
        if (newReview && newPrompt.includes(newReview)) {
          newPrompt = newPrompt.split(newReview).join(" ");
        }

        newPrompt = newPrompt.replace(/\s+/g, " ").trim();

        if (newReview) {
          newPrompt = `${newPrompt} ${staticSuffix} ${newReview}`;
        } else {
          newPrompt = `${newPrompt} ${staticSuffix}`;
        }

        return newPrompt;
      });
    }
    prevPromptStateRef.current = promptState;
  }, [promptState, isManualPrompt, sourceImage, generationMode]);
}

/**
 * useReferenceImages - Manages reference image building and instruction text
 */
export function useReferenceImages(
  characters: CharacterData[],
  sceneElement: ElementState,
  imageInput: ElementState,
  additionalReferenceImages: ElementState[],
  maxReferenceImages: number,
  referenceContract?: ReferenceContract,
  referenceLabelMode: 'image' | 'file' = 'image',
) {
  interface ReferenceCandidate {
    key: string;
    category: ReferenceImageCategory;
    mimeType: string;
    data: string;
    previewDataUrl: string | null;
    buildDisplayText: (imageNumber: number) => string;
    buildFullText: (imageNumber: number) => string;
    buildMentionTag?: (imageNumber: number) => string;
    buildMentionLabel?: (imageNumber: number) => string;
  }

  interface ReferenceDescriptor extends InlineReferenceImage {
    key: string;
    number: number;
    displayText: string;
    fullText: string;
    assetFileName: string;
    previewDataUrl: string | null;
    mentionTag?: string;
    mentionLabel?: string;
  }

  const CATEGORY_PRIORITY: Record<ReferenceImageCategory, number> = {
    global: 1,
    face: 2,
    scene: 3,
    outfit: 4,
    object: 5,
    anonymous: 6,
  };

  const getReferenceDisplayToken = (imageNumber: number): string => (
    referenceLabelMode === 'file' ? `file ${imageNumber}` : `image_${imageNumber}`
  );

  const getReferenceLoadedLabel = (imageNumber: number): string => (
    referenceLabelMode === 'file' ? `File ${imageNumber} - reference loaded` : `Image ${imageNumber} - reference loaded`
  );

  const buildReferenceCandidates = (order: 'generate' | 'edit'): ReferenceCandidate[] => {
    const candidates: ReferenceCandidate[] = [];
    const isCharacter1GlobalContract = referenceContract === 'character1-global';
    const isNoReferenceContract = referenceContract === 'none';

    if (isNoReferenceContract) {
      return candidates;
    }

    const addCharacters = () => {
      const scopedCharacters = isCharacter1GlobalContract ? characters.slice(0, 1) : characters;
      scopedCharacters.forEach((character, index) => {
        const charLabel = `Character${index + 1}`;
        if (character.face.base64Data) {
          candidates.push({
            key: `${character.id}-face`,
            category: 'face',
            mimeType: character.face.mimeType || 'image/jpeg',
            data: character.face.base64Data,
            previewDataUrl: character.face.previewDataUrl,
            buildDisplayText: (imageNumber) => `${getReferenceDisplayToken(imageNumber)} as ${charLabel} face reference`,
            buildFullText: (imageNumber) => `${getReferenceDisplayToken(imageNumber)} as ${charLabel} face reference`,
          });
        }
        if (character.outfit.base64Data) {
          candidates.push({
            key: `${character.id}-outfit`,
            category: 'outfit',
            mimeType: character.outfit.mimeType || 'image/jpeg',
            data: character.outfit.base64Data,
            previewDataUrl: character.outfit.previewDataUrl,
            buildDisplayText: (imageNumber) => `${getReferenceDisplayToken(imageNumber)} as ${charLabel} clothing reference`,
            buildFullText: (imageNumber) => `${getReferenceDisplayToken(imageNumber)} as ${charLabel} clothing reference`,
          });
        }
        if (character.object.base64Data) {
          candidates.push({
            key: `${character.id}-object`,
            category: 'object',
            mimeType: character.object.mimeType || 'image/jpeg',
            data: character.object.base64Data,
            previewDataUrl: character.object.previewDataUrl,
            buildDisplayText: (imageNumber) => `${getReferenceDisplayToken(imageNumber)} as ${charLabel} prop reference`,
            buildFullText: (imageNumber) => `${getReferenceDisplayToken(imageNumber)} as ${charLabel} prop reference`,
          });
        }
      });
    };

    const addScene = () => {
      if (!sceneElement.base64Data) return;
      candidates.push({
        key: 'scene',
        category: 'scene',
        mimeType: sceneElement.mimeType || 'image/jpeg',
        data: sceneElement.base64Data,
        previewDataUrl: sceneElement.previewDataUrl,
        buildDisplayText: (imageNumber) => `${getReferenceDisplayToken(imageNumber)} as scene style reference`,
        buildFullText: (imageNumber) => `${getReferenceDisplayToken(imageNumber)} as scene style reference`,
      });
    };

    const addGlobal = () => {
      if (!imageInput.base64Data) return;
      const promptCtx = imageInput.sourcePrompt ? ` (Source content: "${imageInput.sourcePrompt}")` : '';
      candidates.push({
        key: 'global',
        category: 'global',
        mimeType: imageInput.mimeType || 'image/jpeg',
        data: imageInput.base64Data,
        previewDataUrl: imageInput.previewDataUrl,
        buildDisplayText: (imageNumber) => `${getReferenceDisplayToken(imageNumber)} as global visual reference`,
        buildFullText: (imageNumber) => `${getReferenceDisplayToken(imageNumber)} as global visual reference${promptCtx}`,
      });
    };

    const addAnonymousReferences = () => {
      additionalReferenceImages.forEach((reference, index) => {
        if (!reference.base64Data) return;
        const key = reference.instanceId || `anonymous-${index}`;
        candidates.push({
          key,
          category: 'anonymous',
          mimeType: reference.mimeType || 'image/jpeg',
          data: reference.base64Data,
          previewDataUrl: reference.previewDataUrl,
          buildDisplayText: (imageNumber) => `${getReferenceDisplayToken(imageNumber)} as ${referenceLabelMode === 'file' ? `File${imageNumber}` : `Image${imageNumber}`} reference`,
          buildFullText: (imageNumber) => `${getReferenceDisplayToken(imageNumber)} as ${referenceLabelMode === 'file' ? `File${imageNumber}` : `Image${imageNumber}`} reference`,
          buildMentionTag: (imageNumber) => `@Image${imageNumber}`,
          buildMentionLabel: (imageNumber) => getReferenceLoadedLabel(imageNumber),
        });
      });
    };

    if (isCharacter1GlobalContract) {
      addCharacters();
      addGlobal();
      return candidates;
    }

    if (order === 'edit') {
      addGlobal();
      addCharacters();
      addScene();
      addAnonymousReferences();
    } else {
      addCharacters();
      addScene();
      addGlobal();
      addAnonymousReferences();
    }

    return candidates;
  };

  const selectReferenceCandidates = (candidates: ReferenceCandidate[]) => {
    const safeLimit = maxReferenceImages > 0 ? maxReferenceImages : Number.MAX_SAFE_INTEGER;
    if (candidates.length <= safeLimit) {
      return { active: candidates, overflow: [] as ReferenceCandidate[] };
    }

    const ranked = candidates
      .map((candidate, originalIndex) => ({ candidate, originalIndex }))
      .sort((a, b) => {
        const priorityA = CATEGORY_PRIORITY[a.candidate.category] ?? 99;
        const priorityB = CATEGORY_PRIORITY[b.candidate.category] ?? 99;
        if (priorityA !== priorityB) return priorityA - priorityB;
        return a.originalIndex - b.originalIndex;
      });

    const selectedKeys = new Set(ranked.slice(0, safeLimit).map(item => item.candidate.key));
    return {
      active: candidates.filter(candidate => selectedKeys.has(candidate.key)),
      overflow: candidates.filter(candidate => !selectedKeys.has(candidate.key)),
    };
  };

  const materializeReferenceDescriptors = (candidates: ReferenceCandidate[]): ReferenceDescriptor[] => {
    return candidates.map((candidate, index) => {
      const imageNumber = index + 1;
      return {
        key: candidate.key,
        number: imageNumber,
        category: candidate.category,
        mimeType: candidate.mimeType,
        data: candidate.data,
        displayText: candidate.buildDisplayText(imageNumber),
        fullText: candidate.buildFullText(imageNumber),
        assetFileName: `image_${imageNumber}.jpg`,
        previewDataUrl: candidate.previewDataUrl,
        mentionTag: candidate.buildMentionTag?.(imageNumber),
        mentionLabel: candidate.buildMentionLabel?.(imageNumber),
      };
    });
  };

  const generateSelection = useMemo(
    () => selectReferenceCandidates(buildReferenceCandidates('generate')),
    [additionalReferenceImages, characters, imageInput, maxReferenceImages, referenceContract, referenceLabelMode, sceneElement],
  );
  const editSelection = useMemo(
    () => selectReferenceCandidates(buildReferenceCandidates('edit')),
    [additionalReferenceImages, characters, imageInput, maxReferenceImages, referenceContract, referenceLabelMode, sceneElement],
  );

  const activeReferenceDescriptors = useMemo(
    () => materializeReferenceDescriptors(generateSelection.active),
    [generateSelection.active],
  );
  const overflowReferenceDescriptors = useMemo(
    () => materializeReferenceDescriptors(generateSelection.overflow),
    [generateSelection.overflow],
  );
  const activeReferenceDescriptorsForEdit = useMemo(
    () => materializeReferenceDescriptors(editSelection.active),
    [editSelection.active],
  );
  const overflowReferenceDescriptorsForEdit = useMemo(
    () => materializeReferenceDescriptors(editSelection.overflow),
    [editSelection.overflow],
  );

  const activeReferenceImages = useMemo(
    () => activeReferenceDescriptors.map(({ mimeType, data, category }) => ({ mimeType, data, category })),
    [activeReferenceDescriptors],
  );
  const activeReferenceImagesForEdit = useMemo(
    () => activeReferenceDescriptorsForEdit.map(({ mimeType, data, category }) => ({ mimeType, data, category })),
    [activeReferenceDescriptorsForEdit],
  );

  const editAdditionalReferenceImages = useMemo(() => {
    if (activeReferenceImagesForEdit.length === 0) return [];
    const [first, ...rest] = activeReferenceImagesForEdit;
    if (first?.category === 'global') return rest;
    return activeReferenceImagesForEdit;
  }, [activeReferenceImagesForEdit]);

  const buildInstructionText = (descriptors: ReferenceDescriptor[], order: 'generate' | 'edit') => {
    if (descriptors.length === 0) {
      return { display: '', full: '' };
    }

    const prefix = order === 'edit'
      ? 'Use the provided reference images to guide the edit:'
      : 'Create a new photographic image by combining the provided elements:';
    const hasCharacterRefs = descriptors.some(descriptor => (
      descriptor.category === 'face'
      || descriptor.category === 'outfit'
      || descriptor.category === 'object'
    ));
    const suffix = hasCharacterRefs ? ' Keep character appearances consistent with the references.' : '';

    return {
      display: `${prefix} ${descriptors.map(descriptor => descriptor.displayText).join('; ')}.${suffix}`,
      full: `${prefix} ${descriptors.map(descriptor => descriptor.fullText).join('; ')}.${suffix}`,
    };
  };

  const generateInstructions = useMemo(
    () => buildInstructionText(activeReferenceDescriptors, 'generate'),
    [activeReferenceDescriptors],
  );
  const editInstructions = useMemo(
    () => buildInstructionText(activeReferenceDescriptorsForEdit, 'edit'),
    [activeReferenceDescriptorsForEdit],
  );

  const buildReferenceImages = (order: 'generate' | 'edit'): InlineReferenceImage[] => {
    return order === 'edit' ? activeReferenceImagesForEdit : activeReferenceImages;
  };

  return {
    activeReferenceImages,
    activeReferenceImagesForEdit,
    editAdditionalReferenceImages,
    activeReferenceDescriptors,
    overflowReferenceDescriptors,
    activeReferenceDescriptorsForEdit,
    overflowReferenceDescriptorsForEdit,
    buildReferenceImages,
    elementsInstructionDisplay: generateInstructions.display,
    elementsInstructionFull: generateInstructions.full,
    elementsInstructionDisplayEdit: editInstructions.display,
    elementsInstructionFullEdit: editInstructions.full,
  };
}
