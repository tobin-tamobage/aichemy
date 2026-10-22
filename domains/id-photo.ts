import type { DomainRecipe, DomainState, DomainWarning, DomainOption } from './types';
import {
  PURPOSES, COUNTRIES, PRINT_SIZES, BACKGROUNDS, OUTFITS, EXPRESSIONS, FRAMINGS,
} from './id-photo-catalogs';

/**
 * DomainRecipe: ID Photo — dari design/research-pasfoto.md + spec §3.1.
 * Komentar [Riset §…] di buildPrompt memetakan tiap blok prompt ke temuan riset.
 */

const HIJAB_COLORS: DomainOption[] = [
  { value: 'black', label: 'Black', image: 'images/id-photo/hijab/black.webp' },
  { value: 'navy', label: 'Navy', image: 'images/id-photo/hijab/navy.webp' },
  { value: 'off-white', label: 'Off-white', image: 'images/id-photo/hijab/off-white.webp' },
  { value: 'grey', label: 'Grey', image: 'images/id-photo/hijab/grey.webp' },
  { value: 'light-brown', label: 'Light brown', image: 'images/id-photo/hijab/light-brown.webp' },
];

// Attached-photo identity-preservation clause for external image tools.
const REFERENCE_CLAUSE =
  'Use the attached photo as the exact identity reference. Preserve facial features, skin tone, and face shape; follow the specified attire, pose, framing, background, and lighting.';

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

export const idPhotoDomain: DomainRecipe = {
  id: 'id-photo',
  label: 'ID Photo',
  icon: '🪪',
  tagline: 'Formal pas foto for job applications, LinkedIn, and document-ready portraits.',
  referencePhoto: true,
  referenceLabel: 'Your selfie',
  referenceClause: REFERENCE_CLAUSE,

  createEmptyState: () => ({
    hasReferencePhoto: true,
    purpose: 'job-application',
    country: 'indonesia',
    printSize: '3x4',
    background: 'red',
    outfit: 'white-shirt',
    hijab: false,
    hijabColor: 'black',
    expression: 'neutral',
    framing: 'head-and-shoulders',
  }),

  presetProtectedKeys: [],

  sections: [
    {
      id: 'purpose',
      title: '01 · Purpose & Document',
      fields: [{ kind: 'visual', key: 'purpose', label: 'Purpose', options: PURPOSES, previewRatio: 'aspect-square' }],
    },
    {
      id: 'size',
      title: '02 · Country & Print Size',
      fields: [
        { kind: 'visual', key: 'country', label: 'Country standard', options: COUNTRIES, previewRatio: 'aspect-square' },
        { kind: 'visual', key: 'printSize', label: 'Print size', options: PRINT_SIZES, previewRatio: 'aspect-square' },
      ],
    },
    {
      id: 'background',
      title: '03 · Background',
      fields: [{ kind: 'visual', key: 'background', label: 'Background color', options: BACKGROUNDS, previewRatio: 'aspect-[4/3]' }],
    },
    {
      id: 'outfit',
      title: '04 · Outfit & Appearance',
      fields: [
        { kind: 'visual', key: 'outfit', label: 'Outfit', options: OUTFITS, previewRatio: 'aspect-square' },
        { kind: 'toggle', key: 'hijab', label: 'Hijab', hint: 'Neatly draped, forehead-to-chin fully visible' },
        {
          kind: 'visual', key: 'hijabColor', label: 'Hijab color', options: HIJAB_COLORS, previewRatio: 'aspect-square',
          visibleWhen: (s) => s.hijab === true,
        },
      ],
    },
    {
      id: 'expression',
      title: '05 · Expression & Framing',
      fields: [
        { kind: 'visual', key: 'expression', label: 'Expression', options: EXPRESSIONS, previewRatio: 'aspect-square' },
        { kind: 'visual', key: 'framing', label: 'Framing', options: FRAMINGS, previewRatio: 'aspect-square' },
      ],
    },
  ],

  buildPrompt: (state: DomainState): string => {
    const purpose = PURPOSES.find(o => o.value === str(state.purpose)) ?? PURPOSES[0];
    const country = COUNTRIES.find(o => o.value === str(state.country)) ?? COUNTRIES[0];
    const countryName = country.label.split(' (')[0];
    const size = PRINT_SIZES.find(o => o.value === str(state.printSize)) ?? PRINT_SIZES[1];
    const bg = BACKGROUNDS.find(o => o.value === str(state.background)) ?? BACKGROUNDS[0];
    const outfit = OUTFITS.find(o => o.value === str(state.outfit)) ?? OUTFITS[0];
    const framing = FRAMINGS.find(o => o.value === str(state.framing)) ?? FRAMINGS[0];
    const softSmile = str(state.expression) === 'soft-smile';
    const hijab = state.hijab === true;
    const hijabColor = HIJAB_COLORS.find(o => o.value === str(state.hijabColor)) ?? HIJAB_COLORS[0];

    const blocks: string[] = [];

    // [Riset §1 blok 2 — img2img, jebakan #5] Klausa identitas di posisi awal — paling dipatuhi.
    // The source photo is attached in the external image tool while reference mode is active.
    if (state.hasReferencePhoto !== false) {
      blocks.push(REFERENCE_CLAUSE);
    }

    // Set the selected use and country as guidance, not a guarantee of legal compliance.
    blocks.push(
      `Create a formal document-style portrait for ${purpose.label}, following photo conventions for ${countryName}.`,
    );

    // Specify the selected attire positively; the optional head covering stays clearly separated from the face.
    let attire = `Dress the subject in ${outfit.promptPhrase}.`;
    if (hijab) {
      attire += ` The subject wears a neatly draped ${hijabColor.label.toLowerCase()} hijab that fully covers the hair and neck while keeping the face clearly visible from forehead to chin.`;
    }
    blocks.push(attire);

    // [Riset §1 blok 4, keyword ★★★] Pose & framing — membunuh pose 3/4 / kepala miring (jebakan #2).
    const framingPhrase = framing.value === 'half-body'
      ? 'upper half of the body visible'
      : framing.value === 'chest-up'
        ? 'head and chest visible'
        : 'head and upper shoulders visible, face occupying approximately 70–80% of the image height';
    blocks.push(
      `Front-facing pose, ${framingPhrase}, head perfectly centered, shoulders level and symmetrical, both eyes looking directly at the camera.`,
    );

    // State the selected expression directly.
    blocks.push(
      softSmile
        ? 'Subtle professional smile, friendly and approachable, mouth relaxed.'
        : 'Neutral expression, lips gently closed.',
    );

    // A uniform backdrop and soft, even face lighting suit compliance-style portraits.
    blocks.push(
      `${bg.promptColor.charAt(0).toUpperCase()}${bg.promptColor.slice(1)}, seamless, uniform, and evenly lit.`,
    );
    blocks.push(
      'Soft, even studio lighting across the face, balanced exposure, natural skin tones.',
    );

    blocks.push('Photorealistic portrait with natural skin texture and accurate skin tones.');
    blocks.push(`Compose the portrait in a ${size.ratio} vertical frame for a ${size.label} print.`);

    return blocks.join('\n\n');
  },

  warnings: (state: DomainState): DomainWarning[] => {
    const out: DomainWarning[] = [];
    const country = COUNTRIES.find(o => o.value === str(state.country)) ?? COUNTRIES[0];
    const countryName = country.label.split(' (')[0];

    // Disclaimer konstan — riset §0 catatan etika/legal + spec §3.1
    out.push({
      sectionId: 'purpose',
      level: 'info',
      text: 'AI photos work for CV/LinkedIn/applications; official biometric documents may reject AI-generated photos.',
    });

    // Destination requirements vary; avoid presenting one background/expression as universal.
    if (str(state.purpose) === 'passport-visa') {
      out.push({
        sectionId: 'purpose',
        level: 'info',
        text: `Check the current official photo requirements for ${countryName}, including background, expression, and crop.`,
      });
    }

    // Smart rule: kontras putih-putih (riset §4 jebakan #7) — warn + saran blazer
    const outfit = OUTFITS.find(o => o.value === str(state.outfit));
    if (outfit?.whiteRisk && str(state.background) === 'white') {
      out.push({
        sectionId: 'outfit',
        level: 'warn',
        text: 'White shirt on white background reduces contrast — consider adding a blazer.',
      });
    }

    return out;
  },
};
