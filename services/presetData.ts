import type {
  PresetDataWithPrompts,
  PromptState,
} from '../types';

const hasPromptText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export const createPresetData = (state: PromptState): PresetDataWithPrompts => {
  const {
    subjectAction,
    environment,
    mood,
    ...visualSettings
  } = state;

  return {
    ...visualSettings,
    ...(hasPromptText(subjectAction) ? { subjectAction } : {}),
    ...(hasPromptText(environment) ? { environment } : {}),
    ...(hasPromptText(mood) ? { mood } : {}),
  };
};

const fillEmptyPromptField = (
  currentValue: string,
  presetValue: unknown,
): string => {
  if (hasPromptText(currentValue)) return currentValue;
  return hasPromptText(presetValue) ? presetValue : '';
};

export const mergePresetData = (
  currentState: PromptState,
  presetData: Partial<PresetDataWithPrompts> | null | undefined,
): Partial<PromptState> => ({
  ...(presetData || {}),
  subjectAction: fillEmptyPromptField(currentState.subjectAction, presetData?.subjectAction),
  environment: fillEmptyPromptField(currentState.environment, presetData?.environment),
  mood: fillEmptyPromptField(currentState.mood, presetData?.mood),
});
