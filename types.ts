export * from '@renderzero/shared-core/types';

import type {
  Preset,
  PromptState,
} from '@renderzero/shared-core/types';

export type PresetPromptField = 'subjectAction' | 'environment' | 'mood';

export type PresetDataWithPrompts =
  Omit<PromptState, PresetPromptField>
  & Partial<Pick<PromptState, PresetPromptField>>;

export type PresetWithPrompts =
  Omit<Preset, 'data'>
  & { data: PresetDataWithPrompts };
