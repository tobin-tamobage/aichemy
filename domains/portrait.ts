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
 * Keputusan authoring plan: referencePhoto: false (subjek di-scene AI, tidak ada foto
 * referensi) dan presetProtectedKeys: [] (semua field adalah select — tidak ada teks bebas).
 * Dua varian prompt: foto vs stylized-avatar — avatar men-skip blok Lighting + Lens
 * (riset §3a: ilustrasi tidak punya fisika kamera) dan menutup dengan klausa ilustrasi.
 * Guardrail/negative jadi konstanta blok terakhir buildPrompt (pola marketing blok 5/10).
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
    camera: 'sony-a7rv',
    photographer: 'auto',
  }),

  sections: [
    {
      id: 'portrait-type',
      title: '01 · Portrait Type',
      fields: [{ kind: 'select', key: 'portraitType', label: 'Portrait type', options: PORTRAIT_TYPES }],
    },
    {
      id: 'lighting',
      title: '02 · Lighting Setup',
      fields: [{ kind: 'select', key: 'lighting', label: 'Lighting', options: PORTRAIT_LIGHTING }],
    },
    {
      id: 'background',
      title: '03 · Background & Setting',
      fields: [{ kind: 'select', key: 'background', label: 'Background', options: PORTRAIT_BACKGROUNDS }],
    },
    {
      id: 'wardrobe',
      title: '04 · Wardrobe & Expression',
      fields: [
        { kind: 'select', key: 'wardrobe', label: 'Wardrobe', options: PORTRAIT_WARDROBE },
        { kind: 'select', key: 'expression', label: 'Expression', options: PORTRAIT_EXPRESSIONS },
      ],
    },
    {
      id: 'lens',
      title: '05 · Lens & Framing',
      fields: [
        { kind: 'select', key: 'lens', label: 'Lens', options: PORTRAIT_LENSES },
        { kind: 'select', key: 'camera', label: 'Camera body', options: PORTRAIT_CAMERAS },
      ],
    },
    {
      id: 'photographer',
      title: '06 · Photographer Style',
      fields: [{ kind: 'select', key: 'photographer', label: 'Photographer style', options: PORTRAIT_PHOTOGRAPHERS }],
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

    // [Riset §1 anatomi + §3a] Varian avatar — klausa ilustrasi murni; TIDAK ada
    // blok Lighting/Lens (fisika kamera tidak berlaku untuk ilustrasi digital).
    if (type.value === 'stylized-avatar') {
      blocks.push(`A stylized digital avatar portrait of a person with ${expression.promptPhrase}.`);
      blocks.push(`The character wears ${wardrobe.promptPhrase}.`);
      blocks.push(`Background: ${background.promptPhrase}.`);
      blocks.push('Clean illustration style, consistent character design, soft shading, high detail, no text, no watermark.');
    } else {
      // [Riset §1] Varian foto — lens/framing dikunci sejak blok pertama (riset §1 lens).
      // promptPhrase katalog diawali artikel 'a ' — kapitalisasi huruf pertama, bukan
      // prefix 'A ' (hindari "A a corporate headshot…").
      blocks.push(`${type.promptPhrase.charAt(0).toUpperCase()}${type.promptPhrase.slice(1)} of a person, shot on ${lens.promptPhrase}.`);
      // [Phase 6] Camera body — klausa kamera setelah blok shot type/lens.
      blocks.push(`Camera: ${camera.promptPhrase}.`);
      blocks.push(`Lighting: ${lighting.promptPhrase}.`);
      blocks.push(`Background: ${background.promptPhrase}.`);
      blocks.push(`The subject wears ${wardrobe.promptPhrase} with ${expression.promptPhrase}.`);
      // [Phase 6] Photographer style — klausa opsional sebelum guardrail ('auto' = tanpa klausa).
      if (photographer.promptPhrase) {
        blocks.push(`${photographer.promptPhrase.charAt(0).toUpperCase()}${photographer.promptPhrase.slice(1)}.`);
      }
      blocks.push('Sharp focus on the eyes, natural skin texture, photorealistic, no heavy retouching, no text, no watermark.');
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

    // (a) [Riset §3a] Avatar mode men-skip klausa kamera — info, bukan error.
    if (type === 'stylized-avatar') {
      out.push({
        sectionId: 'portrait-type',
        level: 'info',
        text: 'Avatar mode switches to a stylized illustration — camera, lens, lighting, and photographer-style clauses are skipped.',
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
