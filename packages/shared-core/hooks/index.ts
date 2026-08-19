/**
 * Hooks Index
 *
 * Re-exports all custom hooks for clean imports.
 */

export {
  usePromptState,
  usePromptAutoBuilder,
  useReferenceImages,
  createInitialPromptState,
  createInitialCharacter,
  createInitialScene,
  createInitialImageInput,
  createInitialAdditionalReference,
} from './usePromptState';
export { useElements } from './useElements';
export { useProjectIO, projectNameFromPath, normalizeProjectFile, LEGACY_CINEMATIC_DOMAIN_ID } from './useProjectIO';
export type { NormalizedProject } from './useProjectIO';
