import type { DomainRecipe, DomainState, DomainWarning } from './types';
import {
  LOGO_TYPES,
  LOGO_INDUSTRIES,
  LOGO_STYLES,
  LOGO_SHAPES,
  LOGO_PALETTES,
  LOGO_BACKGROUNDS,
  LOGO_TYPESTYLES,
  LOGO_TECHNIQUES,
  LOGO_DESIGNERS,
} from './logo-catalogs';

/**
 * DomainRecipe: Logo — dari design/research-logo.md §1-§8 + plan §2 (verbatim).
 * Komentar [Riset §…] di buildPrompt/warnings memetakan tiap blok prompt ke temuan riset.
 *
 * Keputusan authoring plan: referencePhoto: true (sketsa user → referenceClause);
 * brandBrief & iconMotif = textarea presetProtected; techniques TETAP chips (max 3);
 * section lettering pakai visibleWhen (str() coercion) tapi tetap render (pola hijabColor
 * id-photo). Guardrail/negative jadi konstanta blok terakhir buildPrompt (pola marketing
 * blok 7 / food negatives).
 */

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

// Tipe logo berhuruf → risiko salah eja teks (riset §3 jebakan #1).
const TEXT_TYPES = ['wordmark', 'lettermark', 'emblem', 'combination'];
// Tipe dengan kata "wordmark" di lockup → typography section tampil (plan §2).
const LETTERING_TYPES = ['wordmark', 'lettermark', 'combination'];

export const logoDomain: DomainRecipe = {
  id: 'logo',
  label: 'Logo',
  icon: '✒️',
  tagline: 'Wordmarks, emblems, and mascots — flat vector, production-minded prompts.',
  referencePhoto: true,
  referenceLabel: 'Sketch / reference',
  referenceClause: 'Use the attached sketch as the structural basis — keep its layout and proportions, redraw it as a clean vector logo.',
  presetProtectedKeys: ['brandBrief', 'iconMotif'],

  createEmptyState: () => ({
    logoType: 'pictorial',
    brandBrief: '',
    industry: 'tech-saas',
    style: 'minimalist',
    shape: 'freeform',
    palette: 'monochrome-black',
    logoBackground: 'white',
    typography: 'modern-sans',
    iconMotif: '',
    techniques: ['flat-vector'],
    designer: 'auto',
  }),

  sections: [
    {
      id: 'type',
      title: '01 · Logo Type',
      fields: [{ kind: 'visual', key: 'logoType', label: 'Logo type', options: LOGO_TYPES, previewRatio: 'aspect-square' }],
    },
    {
      id: 'brand',
      title: '02 · Brand',
      fields: [
        { kind: 'textarea', key: 'brandBrief', label: 'Brand brief', placeholder: 'Brand name and what it does…', rows: 2 },
        { kind: 'visual', key: 'industry', label: 'Industry', options: LOGO_INDUSTRIES, previewRatio: 'aspect-square' },
      ],
    },
    {
      id: 'style',
      title: '03 · Style',
      fields: [{ kind: 'visual', key: 'style', label: 'Style', options: LOGO_STYLES, previewRatio: 'aspect-square' }],
    },
    {
      id: 'shape',
      title: '04 · Shape & Lockup',
      fields: [{ kind: 'visual', key: 'shape', label: 'Shape & lockup', options: LOGO_SHAPES, previewRatio: 'aspect-square' }],
    },
    {
      id: 'color',
      title: '05 · Color',
      fields: [
        { kind: 'visual', key: 'palette', label: 'Palette', options: LOGO_PALETTES, previewRatio: 'aspect-square' },
        { kind: 'visual', key: 'logoBackground', label: 'Background', options: LOGO_BACKGROUNDS, previewRatio: 'aspect-square' },
      ],
    },
    {
      id: 'lettering',
      title: '06 · Lettering',
      fields: [
        {
          kind: 'visual',
          key: 'typography',
          label: 'Lettering style',
          options: LOGO_TYPESTYLES,
          previewRatio: 'aspect-square',
          visibleWhen: (s: DomainState) => LETTERING_TYPES.includes(str(s.logoType)),
        },
      ],
    },
    {
      id: 'motif',
      title: '07 · Icon & Technique',
      fields: [
        { kind: 'textarea', key: 'iconMotif', label: 'Icon motif', placeholder: 'What should the icon depict?…', rows: 2 },
        { kind: 'chips', key: 'techniques', label: 'Construction techniques', options: LOGO_TECHNIQUES, max: 3 },
      ],
    },
    {
      id: 'designer',
      title: '08 · Designer Style',
      fields: [{ kind: 'visual', key: 'designer', label: 'Designer style', options: LOGO_DESIGNERS, previewRatio: 'aspect-square' }],
    },
  ],

  buildPrompt: (state: DomainState): string => {
    const type = LOGO_TYPES.find(o => o.value === str(state.logoType)) ?? LOGO_TYPES[0];
    const industry = LOGO_INDUSTRIES.find(o => o.value === str(state.industry)) ?? LOGO_INDUSTRIES[0];
    const style = LOGO_STYLES.find(o => o.value === str(state.style)) ?? LOGO_STYLES[0];
    const shape = LOGO_SHAPES.find(o => o.value === str(state.shape)) ?? LOGO_SHAPES[0];
    const palette = LOGO_PALETTES.find(o => o.value === str(state.palette)) ?? LOGO_PALETTES[0];
    const background = LOGO_BACKGROUNDS.find(o => o.value === str(state.logoBackground)) ?? LOGO_BACKGROUNDS[0];
    const typography = LOGO_TYPESTYLES.find(o => o.value === str(state.typography)) ?? LOGO_TYPESTYLES[0];
    const designer = LOGO_DESIGNERS.find(o => o.value === str(state.designer)) ?? LOGO_DESIGNERS[0];

    const brandBrief = str(state.brandBrief);
    const motif = str(state.iconMotif);
    const techniqueValues = Array.isArray(state.techniques) ? (state.techniques as string[]) : [];
    const selected = techniqueValues
      .map(v => LOGO_TECHNIQUES.find(o => o.value === v))
      .filter((o): o is NonNullable<typeof o> => Boolean(o));

    const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

    const blocks: string[] = [];

    // [Riset §1 blok 1] Kata "logo" + tipe di kalimat pertama mengunci genre; industri
    // memberi kosakata asosiasi; brand brief + motif ikon jadi subjek konkret.
    blocks.push(`${cap(type.promptPhrase)}, ${industry.promptPhrase}${brandBrief ? ` — ${brandBrief}` : ''}.${motif ? ` The icon depicts ${motif}.` : ''}`);

    // [Riset §1 blok 4] Style axis — satu saja; dua style bertabrakan.
    blocks.push(`Style: ${style.promptPhrase}.`);

    // [Riset §4] Shape/lockup mengunci komposisi kanvas.
    blocks.push(`Composition: ${shape.promptPhrase}.`);

    // [Riset §5] Palet dengan hex eksplisit + background terpisah.
    blocks.push(`Colors: ${palette.promptPhrase}, ${background.promptPhrase}.`);

    // [Riset §6] Typography hanya bila ada huruf — gaya lettering, bukan nama font.
    if (LETTERING_TYPES.includes(str(state.logoType))) {
      blocks.push(`Lettering: ${typography.promptPhrase}.`);
    }

    // [Riset §7] Teknik konstruksi — bahasa desainer profesional, mendorong hasil sistematis.
    if (selected.length > 0) {
      blocks.push(`${cap(selected.map(t => t.promptPhrase).join(', '))}.`);
    }

    // [Riset §8] Gaya desainer sebagai shorthand kualitas (opsional; 'auto' = tanpa blok).
    if (designer.value !== 'auto') {
      blocks.push(`${cap(designer.promptPhrase)}.`);
    }

    // [Riset §3 jebakan #2-#4] Guardrail/negative konstan di akhir — melawan mockup
    // pollution, 3D bevel, photorealism leak, dan teks ekstra.
    blocks.push('Presented flat, no mockup, no stationery scene, no 3D bevel, no drop shadow, no gloss, no photorealistic rendering, no watermark, no extra text beyond the brand name.');

    return blocks.join('\n\n');
  },

  warnings: (state: DomainState): DomainWarning[] => {
    const out: DomainWarning[] = [];
    const logoType = str(state.logoType);
    const style = str(state.style);
    const palette = str(state.palette);
    const logoBackground = str(state.logoBackground);
    const shape = str(state.shape);
    const techniqueValues = Array.isArray(state.techniques) ? (state.techniques as string[]) : [];

    // [Riset §3 jebakan #1] Tipe berhuruf → AI image app sering salah mengeja.
    if (TEXT_TYPES.includes(logoType)) {
      out.push({
        sectionId: 'type',
        level: 'info',
        text: 'AI image apps often misspell text — keep the brand name short, or generate the mark only and add type in a vector tool.',
      });
    }

    // [Riset §3 #7] Mascot inherently detailed — bertabrakan dengan minimalist.
    if (logoType === 'mascot' && style === 'minimalist') {
      out.push({
        sectionId: 'style',
        level: 'warn',
        text: 'Mascot and minimalist fight — a mascot is inherently detailed; pick one direction.',
      });
    }

    // [Riset §3 #5] Gradient style melawan konstruksi flat / single-stroke.
    if (style === 'gradient-modern' && techniqueValues.some(t => t === 'flat-vector' || t === 'single-stroke')) {
      out.push({
        sectionId: 'motif',
        level: 'warn',
        text: 'Gradients fight flat / single-stroke construction — drop one.',
      });
    }

    // [Riset §3 #6] Palet gelap di background gelap = kontras hilang.
    if (logoBackground === 'charcoal' && palette === 'monochrome-black') {
      out.push({
        sectionId: 'color',
        level: 'warn',
        text: 'Black-on-charcoal is invisible — pick a lighter palette.',
      });
    }

    // [Riset §3 #7] Logo adalah latihan pengurangan — satu ide kuat.
    if (techniqueValues.length > 2) {
      out.push({
        sectionId: 'motif',
        level: 'warn',
        text: 'A logo is one strong idea — keep at most two construction techniques.',
      });
    }

    // [Riset §4] Emblem adalah contained shape — horizontal lockup melawan badge.
    if (logoType === 'emblem' && shape === 'horizontal-lockup') {
      out.push({
        sectionId: 'shape',
        level: 'info',
        text: 'Emblems are contained shapes — a horizontal lockup fights the badge; prefer stacked or circular.',
      });
    }

    return out;
  },
};
