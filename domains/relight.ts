import type { DomainRecipe, DomainState, DomainWarning } from './types';
import {
  RELIGHT_MODES,
  LIGHT_DIRECTIONS,
  LIGHT_QUALITIES,
  LIGHT_COLORS,
  INTENSITIES,
  ENVIRONMENTS,
  AESTHETIC_PRESETS,
  COLOR_GRADES,
  GRADE_STRENGTHS,
  PRESERVATION_OPTIONS,
  BACKGROUND_MODES,
} from './relight-catalogs';

/**
 * DomainRecipe: Relight — Photo Relight & Colour Grade (visual prompt builder).
 * Research: design/research-relight.md §1-§6. Plan: docs/superpowers/plans/2026-08-23-relight-recipe.md §3.
 *
 * The attached photo is the external edit source; prompt preservation and lighting controls
 * follow the selected mode, while background controls distinguish relighting from replacement.
 */

const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const arr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

const needsRelight = (state: DomainState): boolean =>
  ['relight-only', 'both'].includes(str(state.mode));
const needsGrade = (state: DomainState): boolean =>
  ['grade-only', 'both'].includes(str(state.mode));
const needsEnvironment = (state: DomainState): boolean =>
  needsRelight(state) || str(state.backgroundMode) === 'replace';

export const relightDomain: DomainRecipe = {
  id: 'relight',
  label: 'Relight',
  icon: '💡',
  tagline: 'Relight & colour grade any photo — keep identity, change light.',
  referencePhoto: true,
  referenceLabel: 'Photo to relight',
  referenceClause: 'Use the attached photo as the source image for this edit.',
  presetProtectedKeys: [],

  createEmptyState: () => ({
    mode: 'both',
    lightDirection: 'left-45',
    lightQuality: 'soft-diffused',
    lightColor: 'warm-golden',
    intensity: 'natural',
    environment: 'window-natural',
    colorGrade: 'portra-400',
    gradeStrength: 'medium',
    aestheticPreset: 'none',
    preservation: ['identity', 'skin', 'clothing', 'pose', 'background'],
    backgroundMode: 'relight',
    removeBackgroundPeople: false,
  }),

  sections: [
    {
      id: 'mode',
      title: '01 · Mode',
      fields: [{ kind: 'visual', key: 'mode', label: 'Relight mode', options: RELIGHT_MODES, previewRatio: 'aspect-square' }],
    },
    {
      id: 'aesthetic',
      title: '02 · Aesthetic Preset',
      fields: [{ kind: 'visual', key: 'aestheticPreset', label: 'Aesthetic preset', options: AESTHETIC_PRESETS, previewRatio: 'aspect-square' }],
    },
    {
      id: 'light',
      title: '03 · Light Direction & Quality',
      fields: [
        { kind: 'visual', key: 'lightDirection', label: 'Light direction', options: LIGHT_DIRECTIONS, previewRatio: 'aspect-[4/3]', visibleWhen: needsRelight },
        { kind: 'visual', key: 'lightQuality', label: 'Light quality', options: LIGHT_QUALITIES, previewRatio: 'aspect-[4/3]', visibleWhen: needsRelight },
        { kind: 'visual', key: 'lightColor', label: 'Light color', options: LIGHT_COLORS, previewRatio: 'aspect-square', visibleWhen: needsRelight },
        { kind: 'visual', key: 'intensity', label: 'Intensity & contrast', options: INTENSITIES, previewRatio: 'aspect-[4/3]', visibleWhen: needsRelight },
      ],
    },
    {
      id: 'environment',
      title: '04 · Environment',
      fields: [{ kind: 'visual', key: 'environment', label: 'Environment bounce', options: ENVIRONMENTS, previewRatio: 'aspect-video', visibleWhen: needsEnvironment }],
    },
    {
      id: 'grade',
      title: '05 · Colour Grade',
      fields: [
        { kind: 'visual', key: 'colorGrade', label: 'Colour grade (LUT)', options: COLOR_GRADES, previewRatio: 'aspect-square', visibleWhen: needsGrade },
        { kind: 'visual', key: 'gradeStrength', label: 'Grade strength', options: GRADE_STRENGTHS, previewRatio: 'aspect-square', visibleWhen: (s: DomainState) => needsGrade(s) && str(s.colorGrade) !== 'none-natural' },
      ],
    },
    {
      id: 'preserve',
      title: '06 · Preservation & Background',
      fields: [
        { kind: 'chips', key: 'preservation', label: 'Keep / preserve', options: PRESERVATION_OPTIONS },
        { kind: 'visual', key: 'backgroundMode', label: 'Background handling', options: BACKGROUND_MODES, previewRatio: 'aspect-video' },
        { kind: 'toggle', key: 'removeBackgroundPeople', label: 'Remove people from background', hint: 'Erase other people / crowd behind the subject — clean empty background', visibleWhen: (s: DomainState) => str(s.backgroundMode) !== 'replace' },
      ],
    },
  ],

  buildPrompt: (state: DomainState): string => {
    const mode = str(state.mode) || 'both';
    const lightDir = LIGHT_DIRECTIONS.find(o => o.value === str(state.lightDirection)) ?? LIGHT_DIRECTIONS[1];
    const lightQual = LIGHT_QUALITIES.find(o => o.value === str(state.lightQuality)) ?? LIGHT_QUALITIES[0];
    const lightCol = LIGHT_COLORS.find(o => o.value === str(state.lightColor)) ?? LIGHT_COLORS[1];
    const intensity = INTENSITIES.find(o => o.value === str(state.intensity)) ?? INTENSITIES[1];
    const env = ENVIRONMENTS.find(o => o.value === str(state.environment)) ?? ENVIRONMENTS[1];
    const grade = COLOR_GRADES.find(o => o.value === str(state.colorGrade)) ?? COLOR_GRADES[1];
    const gradeStrength = str(state.gradeStrength) || 'medium';
    const aesthetic = AESTHETIC_PRESETS.find(o => o.value === str(state.aestheticPreset)) ?? AESTHETIC_PRESETS[0];
    const preservation = arr(state.preservation);
    const bgMode = str(state.backgroundMode) || 'relight';
    const removeBgPeople = Boolean(state.removeBackgroundPeople) && bgMode !== 'replace';
    const isRelight = needsRelight(state);
    const isGrade = needsGrade(state);

    const relightModes = RELIGHT_MODES.find(o => o.value === mode) ?? RELIGHT_MODES[2];
    const preservedItems = preservation
      .filter(value => value !== 'background')
      .map(value => (
        PRESERVATION_OPTIONS.find(o => o.value === value)?.label ?? value
      ).replace(/^Keep\s+/i, '').toLowerCase());

    const blocks: string[] = [];

    // Keep the source image explicit; selected preservation fields refine the edit.
    const sourceInstruction = relightModes.instruction.replace('this photo', 'the attached source photo');
    const keepClause = preservedItems.length > 0
      ? ` — preserve ${preservedItems.join(', ')} from the source`
      : '';
    blocks.push(`${sourceInstruction}${keepClause}.`);

    if (aesthetic.value !== 'none' && aesthetic.promptPhrase) {
      const precedence = isRelight
        ? `Treat this as a mood reference; selected lighting${isGrade ? ' and grade' : ''} settings take priority where they differ.`
        : 'Treat this as a color-mood reference; preserve the source lighting and follow the selected grade settings.';
      blocks.push(`Aesthetic mood reference: ${aesthetic.promptPhrase}. ${precedence}`);
    }

    // Lighting controls apply only to relight modes.
    if (isRelight) {
      blocks.push(`Lighting: ${lightDir.promptPhrase}, ${lightQual.promptPhrase}.`);
      blocks.push(`Light color: ${lightCol.promptPhrase}.`);
      blocks.push(`Intensity: ${intensity.promptPhrase}.`);
      if (bgMode !== 'replace') {
        blocks.push(`Environment bounce: ${env.promptPhrase}.`);
      }
    }

    // Colour-grade controls apply only to grade modes.
    if (isGrade && grade.value !== 'none-natural' && grade.promptPhrase) {
      blocks.push(`Colour grade: ${grade.promptPhrase} at ${gradeStrength} strength.`);
    }

    // Background handling preserves scene content unless replacement is selected.
    if (bgMode === 'keep') {
      blocks.push(removeBgPeople
        ? 'Keep the background setting and composition unchanged except for the requested people removal.'
        : 'Keep the background content and composition; apply only the selected lighting or colour adjustments.');
    } else if (bgMode === 'relight') {
      blocks.push(isRelight
        ? 'Relight the background to match the new light while preserving its content and composition.'
        : 'Apply the selected colour grade consistently to the background, preserving its content and composition.');
    } else if (bgMode === 'replace') {
      blocks.push(`Replace the background with ${env.promptPhrase}, matching its lighting to the subject.`);
    }

    // This requested cleanup overrides the keep-background choice only in the selected areas.
    if (removeBgPeople) {
      blocks.push('Remove other people from the background and naturally fill those areas to match the existing setting.');
    }

    blocks.push('Photorealistic edit with natural texture and detail.');

    return blocks.join('\n\n');
  },

  warnings: (state: DomainState): DomainWarning[] => {
    const out: DomainWarning[] = [];
    const gradeStrength = str(state.gradeStrength);
    const colorGrade = str(state.colorGrade);
    const intensity = str(state.intensity);
    const preservation = arr(state.preservation);
    const mode = str(state.mode);
    const bgMode = str(state.backgroundMode);
    const removeBgPeople = Boolean(state.removeBackgroundPeople);

    if (gradeStrength === 'extreme' && colorGrade !== 'none-natural' && colorGrade !== '') {
      out.push({ sectionId: 'grade', level: 'warn', text: 'Extreme grade can cause color bleed on skin — medium is more natural.' });
    }
    if (intensity === 'chiaroscuro' && !preservation.includes('skin')) {
      out.push({ sectionId: 'light', level: 'warn', text: "High contrast without 'Keep skin texture' can make skin waxy — enable it." });
    }
    if (mode === 'grade-only' && bgMode === 'replace') {
      out.push({ sectionId: 'preserve', level: 'warn', text: "Background replacement keeps the subject's original lighting in grade-only mode; choose Relight + Grade if it should match the new setting." });
    }
    if (bgMode === 'replace' && preservation.includes('background')) {
      out.push({ sectionId: 'preserve', level: 'info', text: 'Background replacement takes priority over preserving the original background.' });
    }
    if (preservation.length === 0) {
      out.push({ sectionId: 'preserve', level: 'warn', text: 'No preservation — the AI may change the face. Keep at least identity + pose.' });
    }
    if (removeBgPeople && bgMode === 'keep') {
      out.push({ sectionId: 'preserve', level: 'info', text: 'The background stays the same except for the requested people removal and natural fill.' });
    }
    return out;
  },

};
