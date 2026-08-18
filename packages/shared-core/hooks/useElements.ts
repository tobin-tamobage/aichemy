/**
 * useElements - Manages the Elements Tool state
 * 
 * Handles character management, scene/global reference images,
 * image transcoding, and the inpaint editor.
 */

import { useState, useRef, useCallback } from 'react';
import type { ElementId, ElementState, CharacterData, ElementInputMode, FaceInputMode } from '../types';
import {
  createInitialCharacter,
  createInitialScene,
  createInitialImageInput,
  createInitialAdditionalReference,
} from './usePromptState';

type CharacterElementType = 'face' | 'outfit' | 'object';

export function useElements() {
  const [characters, setCharacters] = useState<CharacterData[]>(() => [createInitialCharacter(0)]);
  const [activeCharIndex, setActiveCharIndex] = useState(0);
  const [sceneElement, setSceneElement] = useState<ElementState>(() => createInitialScene());
  const [sceneInputMode, setSceneInputModeState] = useState<ElementInputMode>('single');
  const [imageInput, setImageInput] = useState<ElementState>(() => createInitialImageInput());
  const [additionalReferenceImages, setAdditionalReferenceImages] = useState<ElementState[]>([]);

  const [activeElementId, setActiveElementId] = useState<ElementId | null>(null);
  const [dragOverElementId, setDragOverElementId] = useState<ElementId | null>(null);
  const [activeAdditionalReferenceIndex, setActiveAdditionalReferenceIndex] = useState<number | null>(null);
  const [dragOverAdditionalReferenceIndex, setDragOverAdditionalReferenceIndex] = useState<number | null>(null);
  const [filePickerMultiple, setFilePickerMultiple] = useState(false);
  const elementFileInputRef = useRef<HTMLInputElement | null>(null);
  const transcodeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Inpaint Editor State
  const [inpaintEditor, setInpaintEditor] = useState<{
    isOpen: boolean;
    sourceImageUrl: string;
    targetRef: {
      type: 'character' | 'scene' | 'global';
      characterIndex?: number;
      elementType?: 'face' | 'outfit' | 'object';
    } | null;
  }>({ isOpen: false, sourceImageUrl: '', targetRef: null });

  // --- Character Management ---

  const handleAddCharacter = useCallback(() => {
    if (characters.length >= 4) return;
    setCharacters(prev => [...prev, createInitialCharacter(prev.length)]);
    setActiveCharIndex(characters.length);
  }, [characters.length]);

  const handleRemoveCharacter = useCallback((indexToRemove: number) => {
    if (characters.length <= 1) return;

    setCharacters(prev => {
      const newChars = prev.filter((_, i) => i !== indexToRemove);
      return newChars.map((c, i) => ({ ...c, label: `Character${i + 1}` }));
    });

    if (activeCharIndex >= indexToRemove && activeCharIndex > 0) {
      setActiveCharIndex(activeCharIndex - 1);
    } else if (activeCharIndex >= characters.length - 1) {
      setActiveCharIndex(Math.max(0, characters.length - 2));
    }
  }, [characters.length, activeCharIndex]);

  const getCharacterElementInputMode = useCallback((characterIndex: number, elementType: CharacterElementType): ElementInputMode => {
    const character = characters[characterIndex];
    if (!character) return 'single';

    if (elementType === 'face') return character.faceInputMode === 'stitch' ? 'stitch' : 'single';
    if (elementType === 'outfit') return character.outfitInputMode === 'stitch' ? 'stitch' : 'single';
    return character.objectInputMode === 'stitch' ? 'stitch' : 'single';
  }, [characters]);

  const setCharacterElementInputMode = useCallback((characterIndex: number, elementType: CharacterElementType, mode: ElementInputMode) => {
    setCharacters(prev => {
      if (!prev[characterIndex]) return prev;
      const next = [...prev];
      const current = next[characterIndex];
      if (elementType === 'face') {
        next[characterIndex] = { ...current, faceInputMode: mode };
      } else if (elementType === 'outfit') {
        next[characterIndex] = { ...current, outfitInputMode: mode };
      } else {
        next[characterIndex] = { ...current, objectInputMode: mode };
      }
      return next;
    });
  }, []);

  const getCharacterFaceInputMode = useCallback((characterIndex: number): FaceInputMode => {
    return getCharacterElementInputMode(characterIndex, 'face');
  }, [getCharacterElementInputMode]);

  const setCharacterFaceInputMode = useCallback((characterIndex: number, mode: FaceInputMode) => {
    setCharacterElementInputMode(characterIndex, 'face', mode);
  }, [setCharacterElementInputMode]);

  const getSceneInputMode = useCallback((): ElementInputMode => {
    return sceneInputMode;
  }, [sceneInputMode]);

  const setSceneInputMode = useCallback((mode: ElementInputMode) => {
    setSceneInputModeState(mode);
  }, []);

  const getElementLabel = useCallback((id: ElementId): string => {
    if (id === 'character') return 'Face';
    if (id === 'outfit') return 'Outfit';
    if (id === 'object') return 'Object';
    if (id === 'scene') return 'Scene';
    if (id === 'anonymousReference') return 'Reference Image';
    return 'Global Reference';
  }, []);

  const isElementStitchMode = useCallback((id: ElementId, characterIndex: number = activeCharIndex): boolean => {
    if (id === 'character') return getCharacterElementInputMode(characterIndex, 'face') === 'stitch';
    if (id === 'outfit') return getCharacterElementInputMode(characterIndex, 'outfit') === 'stitch';
    if (id === 'object') return getCharacterElementInputMode(characterIndex, 'object') === 'stitch';
    if (id === 'scene') return sceneInputMode === 'stitch';
    return false;
  }, [activeCharIndex, getCharacterElementInputMode, sceneInputMode]);

  // --- File Handling ---

  const openElementFilePicker = useCallback((id: ElementId) => {
    const stitchMode = isElementStitchMode(id);
    setFilePickerMultiple(stitchMode);
    setActiveAdditionalReferenceIndex(null);
    if (elementFileInputRef.current) {
      // Set immediately to ensure the native picker uses the right selection mode.
      elementFileInputRef.current.multiple = stitchMode;
    }
    setActiveElementId(id);
    elementFileInputRef.current?.click();
  }, [isElementStitchMode]);

  const openAdditionalReferenceFilePicker = useCallback((index: number) => {
    setFilePickerMultiple(false);
    setActiveAdditionalReferenceIndex(index);
    if (elementFileInputRef.current) {
      elementFileInputRef.current.multiple = false;
    }
    setActiveElementId('anonymousReference');
    elementFileInputRef.current?.click();
  }, []);

  const addAdditionalReferenceImage = useCallback(() => {
    setAdditionalReferenceImages(prev => [...prev, createInitialAdditionalReference()]);
  }, []);

  const removeAdditionalReferenceImage = useCallback((index: number) => {
    setAdditionalReferenceImages(prev => prev.filter((_, i) => i !== index));
    setDragOverAdditionalReferenceIndex(prev => {
      if (prev === null) return prev;
      if (prev === index) return null;
      return prev > index ? prev - 1 : prev;
    });
    setActiveAdditionalReferenceIndex(prev => {
      if (prev === null) return prev;
      if (prev === index) return null;
      return prev > index ? prev - 1 : prev;
    });
  }, []);

  const removeElementImage = useCallback((id: ElementId) => {
    if (id === 'scene') {
      setSceneElement(prev => ({ ...prev, previewDataUrl: null, base64Data: null, mimeType: null }));
    } else if (id === 'imageInput') {
      setImageInput(prev => ({ ...prev, previewDataUrl: null, base64Data: null, mimeType: null }));
    } else {
      setCharacters(prev => {
        const newChars = [...prev];
        const targetChar = { ...newChars[activeCharIndex] };
        if (id === 'character') {
          targetChar.face = { ...targetChar.face, previewDataUrl: null, base64Data: null, mimeType: null };
        } else if (id === 'outfit') {
          targetChar.outfit = { ...targetChar.outfit, previewDataUrl: null, base64Data: null, mimeType: null };
        } else if (id === 'object') {
          targetChar.object = { ...targetChar.object, previewDataUrl: null, base64Data: null, mimeType: null };
        }
        newChars[activeCharIndex] = targetChar;
        return newChars;
      });
    }
  }, [activeCharIndex]);

  // --- Image Transcoding ---

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read image bytes'));
      reader.onload = () => {
        const result = String(reader.result || '');
        const commaIdx = result.indexOf(',');
        resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
      };
      reader.readAsDataURL(blob);
    });
  };

  const loadImageFromFile = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Unable to load the selected image'));
      };
      img.src = url;
    });
  };

  const transcodeToJpegBase64 = async (file: File, quality: number = 0.85) => {
    const img = await loadImageFromFile(file);
    const canvas = transcodeCanvasRef.current || document.createElement('canvas');
    const width = (img as any).naturalWidth || img.width;
    const height = (img as any).naturalHeight || img.height;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        b => (b ? resolve(b) : reject(new Error('Failed to encode JPEG'))),
        'image/jpeg',
        quality
      );
    });

    const base64Data = await blobToBase64(blob);
    return {
      mimeType: 'image/jpeg',
      base64Data,
      previewDataUrl: `data:image/jpeg;base64,${base64Data}`,
    };
  };

  const remoteImageUrlToDataUrl = useCallback(async (url: string): Promise<string | null> => {
    try {
      const electronApi = (window as any).electron;
      if (electronApi?.httpFetch) {
        const result = await electronApi.httpFetch(url, {
          method: 'GET',
          responseType: 'base64',
        });

        if (result?.ok && result?.base64) {
          const mimeType = String(result.contentType || 'image/png');
          return `data:${mimeType};base64,${String(result.base64)}`;
        }
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const base64 = await blobToBase64(blob);
      const mimeType = blob.type || 'image/png';
      return `data:${mimeType};base64,${base64}`;
    } catch (err: any) {
      console.error(`Failed to convert remote image URL to data URL: ${err?.message || String(err)}`);
      return null;
    }
  }, []);

  const stitchImagesToJpegBase64 = async (files: File[], quality: number = 0.95) => {
    const outputSize = 2048;
    const cellSize = outputSize / 2;
    const images = await Promise.all(files.map(file => loadImageFromFile(file)));

    const canvas = transcodeCanvasRef.current || document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');

    ctx.clearRect(0, 0, outputSize, outputSize);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, outputSize, outputSize);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    images.forEach((img, index) => {
      const sourceWidth = (img as any).naturalWidth || img.width;
      const sourceHeight = (img as any).naturalHeight || img.height;
      if (!sourceWidth || !sourceHeight) return;

      const row = Math.floor(index / 2);
      const col = index % 2;
      const cellX = col * cellSize;
      const cellY = row * cellSize;
      const scale = Math.min(cellSize / sourceWidth, cellSize / sourceHeight);
      const drawWidth = sourceWidth * scale;
      const drawHeight = sourceHeight * scale;
      const drawX = cellX + (cellSize - drawWidth) / 2;
      const drawY = cellY + (cellSize - drawHeight) / 2;

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    });

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        b => (b ? resolve(b) : reject(new Error('Failed to encode stitched JPEG'))),
        'image/jpeg',
        quality
      );
    });

    const base64Data = await blobToBase64(blob);
    return {
      mimeType: 'image/jpeg',
      base64Data,
      previewDataUrl: `data:image/jpeg;base64,${base64Data}`,
    };
  };

  const resolveSingleImageSource = useCallback(async (
    source: File | string,
    elementId: ElementId,
    setError?: (msg: string | null) => void,
  ) => {
    if (source instanceof File) {
      if (!source.type.startsWith('image/')) {
        if (setError) setError(`Only image files can be uploaded for ${getElementLabel(elementId)}.`);
        return null;
      }
      const isFaceImage = elementId === 'character';
      const quality = isFaceImage ? 0.95 : 0.85;
      return transcodeToJpegBase64(source, quality);
    }

    if (typeof source === 'string') {
      if (source.startsWith('data:image/')) {
        const base64Data = source.split(',')[1];
        const mimeType = source.substring(5, source.indexOf(';'));
        return { mimeType, base64Data, previewDataUrl: source };
      }
      if (source.startsWith('http://') || source.startsWith('https://')) {
        return { mimeType: 'image/png', base64Data: source, previewDataUrl: source };
      }
      if (setError) setError('Invalid image data');
    }

    return null;
  }, [getElementLabel]);

  const applyAdditionalReferenceResult = useCallback((index: number, result: { mimeType: string; base64Data: string; previewDataUrl: string }) => {
    setAdditionalReferenceImages(prev => prev.map((reference, refIndex) => (
      refIndex === index
        ? { ...reference, ...result }
        : reference
    )));
  }, []);

  const handleElementFileSelected = useCallback(async (
    e: React.ChangeEvent<HTMLInputElement>,
    setError?: (msg: string | null) => void,
  ) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = '';
    if (!files.length || !activeElementId) return;

    if (setError) setError(null);
    try {
      let result: { mimeType: string; base64Data: string; previewDataUrl: string };
      const activeElementLabel = getElementLabel(activeElementId);
      const isAnonymousReferenceUpload = activeElementId === 'anonymousReference' && activeAdditionalReferenceIndex !== null;
      const stitchMode = !isAnonymousReferenceUpload && isElementStitchMode(activeElementId, activeCharIndex);

      if (stitchMode) {
        if (files.length < 2 || files.length > 4) {
          if (setError) setError(`${activeElementLabel} stitch mode requires 2 to 4 images. Select 2 to 4 files to continue.`);
          return;
        }
        for (const file of files) {
          if (!file.type.startsWith('image/')) {
            if (setError) setError(`Only image files can be used in ${activeElementLabel} stitch mode.`);
            return;
          }
        }
        result = await stitchImagesToJpegBase64(files, 0.95);
      } else {
        const resolved = await resolveSingleImageSource(files[0], activeElementId, setError);
        if (!resolved) return;
        result = resolved;
      }

      if (activeElementId === 'scene') {
        setSceneElement(prev => ({ ...prev, ...result }));
      } else if (activeElementId === 'imageInput') {
        setImageInput(prev => ({ ...prev, ...result, sourcePrompt: null }));
      } else if (activeElementId === 'anonymousReference' && activeAdditionalReferenceIndex !== null) {
        applyAdditionalReferenceResult(activeAdditionalReferenceIndex, result);
      } else {
        setCharacters(prev => {
          const newChars = [...prev];
          const targetChar = { ...newChars[activeCharIndex] };

          if (activeElementId === 'character') {
            targetChar.face = { ...targetChar.face, ...result };
          } else if (activeElementId === 'outfit') {
            targetChar.outfit = { ...targetChar.outfit, ...result };
          } else if (activeElementId === 'object') {
            targetChar.object = { ...targetChar.object, ...result };
          }

          newChars[activeCharIndex] = targetChar;
          return newChars;
        });
      }
    } catch (err: any) {
      const message = `Element upload failed: ${err?.message || String(err)}`;
      if (setError) setError(message);
    } finally {
      setActiveElementId(null);
      setActiveAdditionalReferenceIndex(null);
      setFilePickerMultiple(false);
    }
  }, [activeAdditionalReferenceIndex, activeCharIndex, activeElementId, applyAdditionalReferenceResult, getElementLabel, isElementStitchMode, resolveSingleImageSource]);

  // --- Drag-and-Drop Image Handling ---

  const handleDropImage = useCallback(async (
    elementId: ElementId,
    source: File | string,
    setError?: (msg: string | null) => void,
  ) => {
    if (setError) setError(null);
    try {
      if (isElementStitchMode(elementId, activeCharIndex)) {
        const elementLabel = getElementLabel(elementId);
        if (setError) setError(`${elementLabel} stitch mode uses click + file picker. Select 2 to 4 images to build the reference.`);
        return;
      }

      const result = await resolveSingleImageSource(source, elementId, setError);
      if (!result) {
        return;
      }

      if (elementId === 'scene') {
        setSceneElement(prev => ({ ...prev, ...result }));
      } else if (elementId === 'imageInput') {
        setImageInput(prev => ({ ...prev, ...result, sourcePrompt: null }));
      } else {
        setCharacters(prev => {
          const newChars = [...prev];
          const targetChar = { ...newChars[activeCharIndex] };
          if (elementId === 'character') {
            targetChar.face = { ...targetChar.face, ...result };
          } else if (elementId === 'outfit') {
            targetChar.outfit = { ...targetChar.outfit, ...result };
          } else if (elementId === 'object') {
            targetChar.object = { ...targetChar.object, ...result };
          }
          newChars[activeCharIndex] = targetChar;
          return newChars;
        });
      }
    } catch (err: any) {
      const message = `Element drop failed: ${err?.message || String(err)}`;
      if (setError) setError(message);
    } finally {
      setDragOverElementId(null);
    }
  }, [activeCharIndex, isElementStitchMode, resolveSingleImageSource]);

  const handleDropAdditionalReferenceImage = useCallback(async (
    index: number,
    source: File | string,
    setError?: (msg: string | null) => void,
  ) => {
    if (setError) setError(null);
    try {
      const result = await resolveSingleImageSource(source, 'anonymousReference', setError);
      if (!result) return;
      applyAdditionalReferenceResult(index, result);
    } catch (err: any) {
      const message = `Element drop failed: ${err?.message || String(err)}`;
      if (setError) setError(message);
    } finally {
      setDragOverAdditionalReferenceIndex(null);
    }
  }, [applyAdditionalReferenceResult, resolveSingleImageSource]);

  // --- Reuse Generated Image ---

  const handleReuseImage = useCallback((generatedImage: string | null, primaryPromptUsed: string | null) => {
    if (!generatedImage) return;

    if (generatedImage.startsWith('data:')) {
      const base64Data = generatedImage.split(',')[1];
      const mimeType = generatedImage.substring(5, generatedImage.indexOf(';'));
      setImageInput(prev => ({
        ...prev,
        previewDataUrl: generatedImage,
        base64Data,
        mimeType,
        sourcePrompt: primaryPromptUsed,
      }));
    } else if (generatedImage.startsWith('http://') || generatedImage.startsWith('https://')) {
      // Set immediately so the UI thumbnail appears right away
      setImageInput(prev => ({
        ...prev,
        previewDataUrl: generatedImage,
        base64Data: generatedImage,
        mimeType: 'image/png',
        sourcePrompt: primaryPromptUsed,
      }));

      // Then fetch and convert to a data URL in the background so the canvas
      // doesn't get cross-origin tainted (which blocks toDataURL in the
      // inpaint editor's save flow).
      remoteImageUrlToDataUrl(generatedImage).then((dataUrl) => {
        if (!dataUrl) return;
        const base64Data = dataUrl.split(',')[1];
        const mimeMatch = dataUrl.match(/^data:([^;]+);base64,/i);
        const mimeType = mimeMatch?.[1] || 'image/png';
        setImageInput(prev => ({
          ...prev,
          previewDataUrl: dataUrl,
          base64Data,
          mimeType,
        }));
      });
    }
  }, [remoteImageUrlToDataUrl]);

  // --- Inpaint Editor ---

  const openInpaintEditor = useCallback(async (
    type: 'character' | 'scene' | 'global',
    imageUrl: string,
    characterIndex?: number,
    elementType?: 'face' | 'outfit' | 'object',
  ) => {
    let safeImageUrl = imageUrl;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      const converted = await remoteImageUrlToDataUrl(imageUrl);
      if (converted) safeImageUrl = converted;
    }

    setInpaintEditor({
      isOpen: true,
      sourceImageUrl: safeImageUrl,
      targetRef: { type, characterIndex, elementType }
    });
  }, [remoteImageUrlToDataUrl]);

  const handleInpaintSave = useCallback(async (editedImageUrl: string) => {
    if (!inpaintEditor.targetRef) return;

    const { type, characterIndex, elementType } = inpaintEditor.targetRef;

    try {
      const base64Data = editedImageUrl.split(',')[1];
      const mimeType = 'image/jpeg';

      if (type === 'global') {
        setImageInput(prev => ({
          ...prev,
          originalDataUrl: prev.originalDataUrl || prev.previewDataUrl,
          previewDataUrl: editedImageUrl,
          base64Data,
          mimeType,
        }));
      } else if (type === 'scene') {
        setSceneElement(prev => ({
          ...prev,
          originalDataUrl: prev.originalDataUrl || prev.previewDataUrl,
          previewDataUrl: editedImageUrl,
          base64Data,
          mimeType,
        }));
      } else if (type === 'character' && characterIndex !== undefined && elementType) {
        setCharacters(prev => {
          const newChars = [...prev];
          const targetChar = { ...newChars[characterIndex] };
          const propKey = elementType as 'face' | 'outfit' | 'object';
          const currentElement = targetChar[propKey];

          targetChar[propKey] = {
            ...currentElement,
            originalDataUrl: currentElement.originalDataUrl || currentElement.previewDataUrl,
            previewDataUrl: editedImageUrl,
            base64Data,
            mimeType,
          };

          newChars[characterIndex] = targetChar;
          return newChars;
        });
      }

      setInpaintEditor({ isOpen: false, sourceImageUrl: '', targetRef: null });
    } catch (err: any) {
      console.error(`Failed to save edited image: ${err?.message || String(err)}`);
    }
  }, [inpaintEditor.targetRef]);

  const handleInpaintCancel = useCallback(() => {
    setInpaintEditor({ isOpen: false, sourceImageUrl: '', targetRef: null });
  }, []);

  const resetToOriginal = useCallback((
    type: 'character' | 'scene' | 'global',
    characterIndex?: number,
    elementType?: 'face' | 'outfit' | 'object',
  ) => {
    if (type === 'global') {
      setImageInput(prev => {
        if (!prev.originalDataUrl) return prev;
        const base64Data = prev.originalDataUrl.split(',')[1];
        return { ...prev, previewDataUrl: prev.originalDataUrl, base64Data, originalDataUrl: null };
      });
    } else if (type === 'scene') {
      setSceneElement(prev => {
        if (!prev.originalDataUrl) return prev;
        const base64Data = prev.originalDataUrl.split(',')[1];
        return { ...prev, previewDataUrl: prev.originalDataUrl, base64Data, originalDataUrl: null };
      });
    } else if (type === 'character' && characterIndex !== undefined && elementType) {
      setCharacters(prev => {
        const newChars = [...prev];
        const targetChar = { ...newChars[characterIndex] };
        const propKey = elementType as 'face' | 'outfit' | 'object';
        const currentElement = targetChar[propKey];

        if (!currentElement.originalDataUrl) return prev;

        const base64Data = currentElement.originalDataUrl.split(',')[1];
        targetChar[propKey] = {
          ...currentElement,
          previewDataUrl: currentElement.originalDataUrl,
          base64Data,
          originalDataUrl: null,
        };

        newChars[characterIndex] = targetChar;
        return newChars;
      });
    }
  }, []);

  return {
    characters,
    setCharacters,
    activeCharIndex,
    setActiveCharIndex,
    sceneElement,
    setSceneElement,
    sceneInputMode,
    getSceneInputMode,
    setSceneInputMode,
    imageInput,
    setImageInput,
    additionalReferenceImages,
    setAdditionalReferenceImages,
    activeElementId,
    dragOverElementId,
    dragOverAdditionalReferenceIndex,
    filePickerMultiple,
    setDragOverElementId,
    setDragOverAdditionalReferenceIndex,
    elementFileInputRef,
    transcodeCanvasRef,
    inpaintEditor,
    handleAddCharacter,
    handleRemoveCharacter,
    getCharacterElementInputMode,
    setCharacterElementInputMode,
    getCharacterFaceInputMode,
    setCharacterFaceInputMode,
    openElementFilePicker,
    openAdditionalReferenceFilePicker,
    addAdditionalReferenceImage,
    removeAdditionalReferenceImage,
    removeElementImage,
    handleElementFileSelected,
    handleDropImage,
    handleDropAdditionalReferenceImage,
    handleReuseImage,
    openInpaintEditor,
    handleInpaintSave,
    handleInpaintCancel,
    resetToOriginal,
  };
}
