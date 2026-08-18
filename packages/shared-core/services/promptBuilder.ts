import { PromptState } from '../types';
import { PHOTOGRAPHER_LOOK_DETAILS, MOVIE_LOOK_DETAILS } from '../constants';

/**
 * Prompt Builder Service
 * 
 * Centralized service for constructing AI image generation prompts from PromptState.
 * This allows all API providers to use consistent prompt templates.
 */

export const getIntroPhrase = (state: PromptState): string => {
  const { genre } = state;
  if (!genre) return "A photographic image of";
  return `A photographic image in the style of ${genre.toLowerCase()} of`;
};

export const getShotTypePhrase = (state: PromptState): string => {
  const { shotType, viewingDirection, candidShot } = state;
  if (!shotType) return "";
  let fullShotType = shotType;
  if (viewingDirection) {
    fullShotType = `${shotType} ${viewingDirection}`;
  }
  if (candidShot) {
    return `a ${fullShotType.toLowerCase()}, where the subject is unaware they are on camera, of`;
  }
  return `a ${fullShotType.toLowerCase()} of`;
};

export const getSubjectPhrase = (state: PromptState): string => {
  const { subjectAction } = state;
  return subjectAction || "a subject";
};

export const getEnvironmentPhrase = (state: PromptState): string => { 
  const { environment } = state;
  return environment ? `, set in ${environment}` : "";
};

const getCoreSentence = (state: PromptState): string => {
  const intro = getIntroPhrase(state);
  const shot = getShotTypePhrase(state);
  const subject = getSubjectPhrase(state);
  const env = getEnvironmentPhrase(state);
  
  // Narrative Angle Mode
  if (state.showNewAnglePrompt && state.shotType) {
    const { shotType, viewingDirection, candidShot } = state;
    let fullShotType = shotType;
    if (viewingDirection) {
      fullShotType = `${shotType} ${viewingDirection}`;
    }
    const candidPhrase = candidShot ? ', where the subject is unaware they are on camera,' : '';
    return `${intro} a ${fullShotType.toLowerCase()}${candidPhrase}, in this new angle what would the viewer see? Show us: ${subject}${env}.`;
  }
  
  // Standard Mode
  let sentence = intro;
  if (shot) sentence += ` ${shot}`;
  sentence += ` ${subject}${env}`; 
  
  return sentence ? sentence + "." : "";
};

export const getLightingMoodSentence = (state: PromptState): string => {
  const { lighting, mood } = state;
  let sentence = "";
  if (lighting) sentence += `The scene is illuminated by ${lighting.toLowerCase()}`;
  if (mood) {
    sentence += lighting ? `, creating a ${mood} atmosphere` : `A ${mood} atmosphere`;
  }
  return sentence ? sentence + "." : "";
};

const stripTrailingLensWord = (value: string): string => value.replace(/\s+lens\s*$/i, '').trim();

const buildLensClause = (state: PromptState): string => {
  const focalLength = state.focalLength.trim();
  const lens = state.lens.trim();
  const fStop = state.fStop.trim();

  if (!fStop) {
    if (focalLength && lens) return `${focalLength} ${lens}`;
    if (focalLength) return `${focalLength} lens`;
    if (lens) return lens;
    return "";
  }

  const lensBase = lens ? stripTrailingLensWord(lens) : "";
  const segments = [focalLength, lensBase, `f/${fStop}`].filter(Boolean);

  if (segments.length === 0) return "";
  return `${segments.join(" ")} lens`;
};

export const getGearSentence = (state: PromptState): string => {
  const { camera, filmStock } = state;
  const gear: string[] = [];
  if (camera) gear.push(camera);

  const lensClause = buildLensClause(state);
  if (lensClause) gear.push(lensClause);

  if (filmStock) gear.push(`${filmStock} film`);
  
  return gear.length > 0 ? `Captured with the look of a ${gear.join(", ")}.` : "";
};

export const getPhotographerSentence = (state: PromptState): string => {
  const { photographer } = state;
  if (!photographer) return "";
  const detail = PHOTOGRAPHER_LOOK_DETAILS[photographer];
  const extra = detail ? `, ${detail}` : "";
  return `In the style of photographer ${photographer}${extra}.`;
};

export const getMovieLookSentence = (state: PromptState): string => {
  const { movieLook } = state;
  if (!movieLook) return "";
  const detail = MOVIE_LOOK_DETAILS[movieLook];
  const extra = detail ? ` ${detail}` : "";
  return `With the visual aesthetic of the movie ${movieLook}${extra}.`;
};

export const getFilterSentence = (state: PromptState): string => {
  const { filter } = state;
  if (filter.length === 0) return "";
  return `Applied effect(s): ${filter.join(", ")}.`;
};

export const getAspectRatioSentence = (state: PromptState): string => {
  const { aspectRatio } = state;
  return aspectRatio ? `The image should be in a ${aspectRatio} format.` : "";
};

/**
 * Build a complete prompt string from PromptState
 */
export const buildPromptFromState = (state: PromptState): string => {
  const parts = [
    getCoreSentence(state),
    getLightingMoodSentence(state),
    getGearSentence(state),
    getPhotographerSentence(state),
    getMovieLookSentence(state),
    getFilterSentence(state),
    "Don't blur faces randomly.",
    getAspectRatioSentence(state)
  ];
  return parts.filter(p => !!p).join(" ");
};

/**
 * Add "next action" narrative prompt to existing prompt
 */
export const addNextActionPrompt = (prompt: string): string => {
  const insertion = "What would the Subject do next? Show us the results of that action.";
  const firstPeriodIndex = prompt.indexOf(".");
  if (firstPeriodIndex === -1) return `${prompt} ${insertion}`.trim();
  const before = prompt.slice(0, firstPeriodIndex + 1);
  const after = prompt.slice(firstPeriodIndex + 1).trimStart();
  return `${before} ${insertion} ${after}`.trim();
};

/**
 * Helper function to pick a random item from an array
 */
export const pickRandom = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * Scene angle categories for multi-angle generation
 */
export const SCENE_ANGLE_CATEGORIES = {
  unique1: ["Overhead", "Eye level", "Low angle", "High angle", "Bird's-eye view", "Worm's-eye view"],
  close: ["Close up", "Cowboy-shot", "Extreme close up", "Headshot", "Tight headshot", "Upper body"],
  unique2: ["Dutch angle", "Over the shoulder", "POV", "Cutaway", "Insert", "Reverse", "Reaction shot"],
  wide: ["Entire body", "Three quarter body", "Establishing shot", "Medium shot", "Wide shot"]
};

/**
 * Generate 4 prompt variations with different shot angles
 * Returns array of { id, shotType, prompt }
 */
export const generateSceneVariations = (baseState: PromptState) => {
  const selectedShots = [
    pickRandom(SCENE_ANGLE_CATEGORIES.unique1),
    pickRandom(SCENE_ANGLE_CATEGORIES.close),
    pickRandom(SCENE_ANGLE_CATEGORIES.unique2),
    pickRandom(SCENE_ANGLE_CATEGORIES.wide)
  ];

  return selectedShots.map((shotType, index) => {
    const variationState: PromptState = {
      ...baseState,
      shotType,
      viewingDirection: "" // Clear viewing direction when using scene angles
    };
    const prompt = buildPromptFromState(variationState);
    
    return {
      id: index + 1,
      shotType,
      prompt
    };
  });
};
