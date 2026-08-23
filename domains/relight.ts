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
 * Semua field visual (kecuali preservation chips & toggle) — sesuai brief "semua menggunakan visual prompt builder".
 * referencePhoto: true — foto adalah ground truth, prompt mengandung referenceClause preservasi.
 * 6 sections, 10 blok buildPrompt, 5 smart warnings + toggle removeBackgroundPeople.
 */

const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const arr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

export const relightDomain: DomainRecipe = {
  id: 'relight',
  label: 'Relight',
  icon: '💡',
  tagline: 'Relight & colour grade any photo — keep identity, change light.',
  referencePhoto: true,
  referenceLabel: 'Photo to relight',
  referenceClause: 'Use the uploaded photo as the exact source — keep the same person, clothing, and pose.',
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
      title: '02 · Aesthetic Preset (1-klik viral)',
      fields: [{ kind: 'visual', key: 'aestheticPreset', label: 'Aesthetic preset', options: AESTHETIC_PRESETS, previewRatio: 'aspect-square' }],
    },
    {
      id: 'light',
      title: '03 · Light Direction & Quality',
      fields: [
        { kind: 'visual', key: 'lightDirection', label: 'Light direction', options: LIGHT_DIRECTIONS, previewRatio: 'aspect-[4/3]' },
        { kind: 'visual', key: 'lightQuality', label: 'Light quality', options: LIGHT_QUALITIES, previewRatio: 'aspect-[4/3]' },
        { kind: 'visual', key: 'lightColor', label: 'Light color', options: LIGHT_COLORS, previewRatio: 'aspect-square' },
        { kind: 'visual', key: 'intensity', label: 'Intensity & contrast', options: INTENSITIES, previewRatio: 'aspect-[4/3]' },
      ],
    },
    {
      id: 'environment',
      title: '04 · Environment',
      fields: [{ kind: 'visual', key: 'environment', label: 'Environment bounce', options: ENVIRONMENTS, previewRatio: 'aspect-video' }],
    },
    {
      id: 'grade',
      title: '05 · Colour Grade',
      fields: [
        { kind: 'visual', key: 'colorGrade', label: 'Colour grade (LUT)', options: COLOR_GRADES, previewRatio: 'aspect-square' },
        { kind: 'visual', key: 'gradeStrength', label: 'Grade strength', options: GRADE_STRENGTHS, previewRatio: 'aspect-square' },
      ],
    },
    {
      id: 'preserve',
      title: '06 · Preservation & Background',
      fields: [
        { kind: 'chips', key: 'preservation', label: 'Keep / preserve', options: PRESERVATION_OPTIONS },
        { kind: 'visual', key: 'backgroundMode', label: 'Background handling', options: BACKGROUND_MODES, previewRatio: 'aspect-video' },
        { kind: 'toggle', key: 'removeBackgroundPeople', label: 'Remove people from background', hint: 'Erase other people / crowd behind the subject — clean empty background' },
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
    const removeBgPeople = Boolean(state.removeBackgroundPeople);

    const relightModes = RELIGHT_MODES.find(o => o.value === mode) ?? RELIGHT_MODES[2];

    const blocks: string[] = [];

    // 1 — Instruction + preservasi
    const keepList = preservation.length > 0
      ? preservation.map(v => PRESERVATION_OPTIONS.find(o => o.value === v)?.label ?? v).join(', ')
      : 'facial identity and pose';
    blocks.push(`${relightModes.instruction} — keep ${keepList} exactly the same.`);

    // 0 — Aesthetic preset (bila bukan none)
    if (aesthetic.value !== 'none' && aesthetic.promptPhrase) {
      blocks.push(`Aesthetic: ${aesthetic.promptPhrase}.`);
    }

    const isRelight = mode === 'relight-only' || mode === 'both';
    const isGrade = mode === 'grade-only' || mode === 'both';

    // 2-5 — Lighting blocks (hanya bila relight)
    if (isRelight) {
      blocks.push(`Lighting: ${lightDir.promptPhrase}, ${lightQual.promptPhrase}.`);
      blocks.push(`Light color: ${lightCol.promptPhrase}.`);
      blocks.push(`Intensity: ${intensity.promptPhrase}.`);
      blocks.push(`Environment bounce: ${env.promptPhrase}.`);
    } else {
      // grade-only tetap butuh environment bila background replace
      if (bgMode === 'replace') {
        blocks.push(`Environment bounce: ${env.promptPhrase}.`);
      }
    }

    // 6 — Colour grade
    if (isGrade && grade.value !== 'none-natural' && grade.promptPhrase) {
      blocks.push(`Colour grade: ${grade.promptPhrase}, strength ${gradeStrength}.`);
    }

    // 7 — Background handling
    if (bgMode === 'keep') {
      blocks.push('Keep the background exactly unchanged.');
    } else if (bgMode === 'relight') {
      blocks.push('Relight the background consistently with the new lighting.');
    } else if (bgMode === 'replace') {
      blocks.push(`Replace the background with the ${env.promptPhrase}.`);
    }

    // 8 — Background people removal (toggle)
    if (removeBgPeople) {
      blocks.push('Remove all other people from the background — clean, empty background behind the subject, no crowd, no bystanders, inpaint the area naturally to match the environment.');
    }

    // 9 — Guardrail
    if (removeBgPeople) {
      blocks.push('Photorealistic, sharp focus, natural skin texture, no plastic skin, no face swap, no extra person (background already cleaned), no text, no watermark, single consistent light source.');
    } else {
      blocks.push('Photorealistic, sharp focus, natural skin texture, no plastic skin, no face swap, no extra person, no text, no watermark, single consistent light source.');
    }

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
      out.push({ sectionId: 'preserve', level: 'warn', text: 'Grade-only with background replace is unusual — use Relight + Grade to change the environment.' });
    }
    if (preservation.length === 0) {
      out.push({ sectionId: 'preserve', level: 'warn', text: 'No preservation — the AI may change the face. Keep at least identity + pose.' });
    }
    if (removeBgPeople && bgMode === 'keep') {
      out.push({ sectionId: 'preserve', level: 'info', text: 'You asked to remove people but keep the background unchanged — the AI will clean only the people and inpaint the same background.' });
    }
    return out;
  },
};
