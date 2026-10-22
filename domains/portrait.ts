import type { DomainRecipe, DomainState, DomainWarning } from './types';
import {
  PORTRAIT_TYPES,
  PORTRAIT_LIGHTING,
  PORTRAIT_BACKGROUNDS,
  PORTRAIT_WARDROBE,
  PORTRAIT_EXPRESSIONS,
  PORTRAIT_LENSES,
  PORTRAIT_CAMERAS,
  PORTRAIT_PHOTOGRAPHERS,
} from './portrait-catalogs';

/**
 * DomainRecipe: Portrait — dari design/research-portrait.md §1-§4 + plan Task 2 Step 1.
 * Komentar [Riset §…] di buildPrompt/warnings memetakan tiap blok prompt ke temuan riset.
 *
 * Both variants treat lighting, camera, and photographer choices as visual cues, not guarantees.
 */

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

export const portraitDomain: DomainRecipe = {
  id: 'portrait',
  label: 'Portrait',
  icon: '📸',
  tagline: 'Headshots, actor portraits, and stylized avatars.',
  referencePhoto: false,
  presetProtectedKeys: [],

  createEmptyState: () => ({
    portraitType: 'corporate-headshot',
    lighting: 'rembrandt',
    background: 'seamless-studio',
    wardrobe: 'formal-suit',
    expression: 'confident-smile',
    lens: '85mm-closeup',
    camera: 'canon-eos-5d',
    photographer: 'auto',
  }),

  sections: [
    {
      id: 'portrait-type',
      title: '01 · Portrait Type',
      fields: [{ kind: 'visual', key: 'portraitType', label: 'Portrait type', options: PORTRAIT_TYPES, previewRatio: 'aspect-square' }],
    },
    {
      id: 'lighting',
      title: '02 · Lighting Setup',
      fields: [{ kind: 'visual', key: 'lighting', label: 'Lighting', options: PORTRAIT_LIGHTING, previewRatio: 'aspect-[4/3]' }],
    },
    {
      id: 'background',
      title: '03 · Background & Setting',
      fields: [{ kind: 'visual', key: 'background', label: 'Background', options: PORTRAIT_BACKGROUNDS, previewRatio: 'aspect-[4/3]' }],
    },
    {
      id: 'wardrobe',
      title: '04 · Wardrobe & Expression',
      fields: [
        { kind: 'visual', key: 'wardrobe', label: 'Wardrobe', options: PORTRAIT_WARDROBE, previewRatio: 'aspect-square' },
        { kind: 'visual', key: 'expression', label: 'Expression', options: PORTRAIT_EXPRESSIONS, previewRatio: 'aspect-square' },
      ],
    },
    {
      id: 'lens',
      title: '05 · Lens & Framing',
      fields: [
        { kind: 'visual', key: 'lens', label: 'Lens', options: PORTRAIT_LENSES, previewRatio: 'aspect-video' },
        { kind: 'visual', key: 'camera', label: 'Camera body', options: PORTRAIT_CAMERAS, previewRatio: 'aspect-video' },
      ],
    },
    {
      id: 'photographer',
      title: '06 · Photographer Style',
      fields: [{ kind: 'visual', key: 'photographer', label: 'Photographer style', options: PORTRAIT_PHOTOGRAPHERS, previewRatio: 'aspect-square' }],
    },
  ],

  buildPrompt: (state: DomainState): string => {
    const type = PORTRAIT_TYPES.find(o => o.value === str(state.portraitType)) ?? PORTRAIT_TYPES[0];
    const lighting = PORTRAIT_LIGHTING.find(o => o.value === str(state.lighting)) ?? PORTRAIT_LIGHTING[0];
    const background = PORTRAIT_BACKGROUNDS.find(o => o.value === str(state.background)) ?? PORTRAIT_BACKGROUNDS[0];
    const wardrobe = PORTRAIT_WARDROBE.find(o => o.value === str(state.wardrobe)) ?? PORTRAIT_WARDROBE[0];
    const expression = PORTRAIT_EXPRESSIONS.find(o => o.value === str(state.expression)) ?? PORTRAIT_EXPRESSIONS[0];
    const lens = PORTRAIT_LENSES.find(o => o.value === str(state.lens)) ?? PORTRAIT_LENSES[0];
    const camera = PORTRAIT_CAMERAS.find(o => o.value === str(state.camera)) ?? PORTRAIT_CAMERAS[0];
    const photographer = PORTRAIT_PHOTOGRAPHERS.find(o => o.value === str(state.photographer)) ?? PORTRAIT_PHOTOGRAPHERS[0];

    const blocks: string[] = [];

    // Avatar mode translates photographic choices into composition and art-direction cues.
    if (type.value === 'stylized-avatar') {
      blocks.push(`A stylized digital avatar portrait of a person with ${expression.promptPhrase}.`);
      blocks.push(`The character wears ${wardrobe.promptPhrase}.`);
      blocks.push(`Illustration composition: ${lens.promptPhrase}.`);
      blocks.push(`Illustrative lighting: ${lighting.promptPhrase}.`);
      blocks.push(`Camera look cue: ${camera.promptPhrase}.`);
      blocks.push(`Background: ${background.promptPhrase}.`);
      if (photographer.promptPhrase) {
        blocks.push(`${photographer.promptPhrase.charAt(0).toUpperCase()}${photographer.promptPhrase.slice(1)}.`);
      }
      blocks.push('Clean digital illustration with a consistent character design, clear facial features, and soft shading.');
    } else {
      // Lens, camera, and photographer selections are photographic cues, not generation settings.
      blocks.push(`${type.promptPhrase.charAt(0).toUpperCase()}${type.promptPhrase.slice(1)} of a person.`);
      blocks.push(`Lens and framing cue: ${lens.promptPhrase}.`);
      blocks.push(`Camera look: ${camera.promptPhrase}.`);
      blocks.push(`Lighting: ${lighting.promptPhrase}.`);
      blocks.push(`Background: ${background.promptPhrase}.`);
      blocks.push(`The subject wears ${wardrobe.promptPhrase} with ${expression.promptPhrase}.`);
      // [Phase 6] Photographer style — klausa opsional sebelum guardrail ('auto' = tanpa klausa).
      if (photographer.promptPhrase) {
        blocks.push(`${photographer.promptPhrase.charAt(0).toUpperCase()}${photographer.promptPhrase.slice(1)}.`);
      }
      blocks.push('Photorealistic portrait photography, natural skin texture, sharp focus on the eyes.');
    }

    return blocks.join('\n\n');
  },

  warnings: (state: DomainState): DomainWarning[] => {
    const out: DomainWarning[] = [];
    const type = str(state.portraitType);
    const background = str(state.background);
    const wardrobe = str(state.wardrobe);
    const expression = str(state.expression);
    const lens = str(state.lens);

    // Avatar settings remain visually active as illustrative cues.
    if (type === 'stylized-avatar') {
      out.push({
        sectionId: 'portrait-type',
        level: 'info',
        text: 'Avatar mode keeps camera, lens, lighting, and photographer choices as visual direction for the illustration.',
      });
    }

    // (b) [Riset §3b] Koherensi konteks: setelan formal vs setting kasual taman.
    if (wardrobe === 'formal-suit' && background === 'outdoor-park') {
      out.push({
        sectionId: 'wardrobe',
        level: 'warn',
        text: 'A formal suit against an outdoor park looks mismatched — use a studio or office background.',
      });
    }

    // (c) [Riset §3c] Prinsip casting: aktor dibooking berdasarkan emosi.
    if (type === 'actor-headshot' && expression === 'neutral') {
      out.push({
        sectionId: 'wardrobe',
        level: 'info',
        text: 'Actors book roles on emotion — a neutral expression is the weakest choice.',
      });
    }

    // (d) [Riset §3d] Intense berlawanan dengan trust yang dicari korporat.
    if (type === 'corporate-headshot' && expression === 'intense') {
      out.push({
        sectionId: 'wardrobe',
        level: 'warn',
        text: 'Intense expressions are off-brand for corporate headshots — pick a confident or subtle smile.',
      });
    }

    // (e) [Riset §3e] Framing korporat harus head-and-shoulders — 85mm standar industri.
    if (type === 'corporate-headshot' && lens === '35mm-environmental') {
      out.push({
        sectionId: 'lens',
        level: 'warn',
        text: 'Corporate headshots need head-and-shoulders framing — choose the 85mm close-up.',
      });
    }

    return out;
  },
};
