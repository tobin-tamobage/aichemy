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

// Klausa referensi persis spec §3.1
const REFERENCE_CLAUSE =
  'Use the attached photo as the exact identity reference. Preserve facial features, skin tone, and face shape. Replace background and attire as specified. Ignore the original outfit and background.';

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
      fields: [{ kind: 'select', key: 'purpose', label: 'Purpose', options: PURPOSES }],
    },
    {
      id: 'size',
      title: '02 · Country & Print Size',
      fields: [
        { kind: 'select', key: 'country', label: 'Country standard', options: COUNTRIES },
        { kind: 'select', key: 'printSize', label: 'Print size', options: PRINT_SIZES },
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
        { kind: 'select', key: 'outfit', label: 'Outfit', options: OUTFITS },
        { kind: 'toggle', key: 'hijab', label: 'Hijab', hint: 'Neatly draped, forehead-to-chin fully visible' },
        {
          kind: 'select', key: 'hijabColor', label: 'Hijab color', options: HIJAB_COLORS,
          visibleWhen: (s) => s.hijab === true,
        },
      ],
    },
    {
      id: 'expression',
      title: '05 · Expression & Framing',
      fields: [
        { kind: 'select', key: 'expression', label: 'Expression', options: EXPRESSIONS },
        { kind: 'select', key: 'framing', label: 'Framing', options: FRAMINGS },
      ],
    },
  ],

  buildPrompt: (state: DomainState): string => {
    const purpose = PURPOSES.find(o => o.value === str(state.purpose)) ?? PURPOSES[0];
    const size = PRINT_SIZES.find(o => o.value === str(state.printSize)) ?? PRINT_SIZES[1];
    const bg = BACKGROUNDS.find(o => o.value === str(state.background)) ?? BACKGROUNDS[0];
    const outfit = OUTFITS.find(o => o.value === str(state.outfit)) ?? OUTFITS[0];
    const framing = FRAMINGS.find(o => o.value === str(state.framing)) ?? FRAMINGS[0];
    const softSmile = str(state.expression) === 'soft-smile';
    const hijab = state.hijab === true;
    const hijabColor = HIJAB_COLORS.find(o => o.value === str(state.hijabColor)) ?? HIJAB_COLORS[0];

    const blocks: string[] = [];

    // [Riset §1 blok 2 — img2img, jebakan #5] Klausa identitas di posisi awal — paling dipatuhi.
    // Foto di-attach user di app AI, jadi instruksi selalu disertakan selama reference mode aktif.
    if (state.hasReferencePhoto !== false) {
      blocks.push(REFERENCE_CLAUSE);
    }

    // [Riset §1 blok 1] Intent + konteks dokumen → AI masuk mode patuh-standar.
    blocks.push(
      `Transform the photo into a formal ID photo (pas foto) for: ${purpose.label}. Meets official document photo standards.`,
    );

    // [Riset §1 blok 3, jebakan #10] Pakaian spesifik, bukan "formal clothes" generik.
    let attire = `Dress the subject in ${outfit.promptPhrase}.`;
    if (hijab) {
      // [Riset §3 skenario bonus + §4 jebakan konteks] hijab: dahi–dagu terlihat penuh, telinga tidak wajib.
      attire += ` The subject wears a neatly draped ${hijabColor.label.toLowerCase()} hijab that fully covers the hair and neck, with the face oval clearly framed and the forehead-to-chin area fully visible.`;
    }
    blocks.push(attire);

    // [Riset §1 blok 4, keyword ★★★] Pose & framing — membunuh pose 3/4 / kepala miring (jebakan #2).
    const framingPhrase = str(state.framing) === 'half-body'
      ? 'upper half of the body visible'
      : str(state.framing) === 'chest-up'
        ? 'head and chest visible'
        : 'head and upper shoulders visible, face occupying approximately 70–80% of the image height';
    blocks.push(
      `Front-facing pose, ${framingPhrase}, head perfectly centered, shoulders level and symmetrical, both eyes looking directly at the camera.`,
    );

    // [Riset §1 blok 5, keyword ★★★, jebakan #3] Ekspresi — neutral wajib dokumen resmi; no smile di negatif juga.
    blocks.push(
      softSmile
        ? 'Subtle professional smile, friendly and approachable, mouth relaxed.'
        : 'Neutral expression, mouth closed, no smile.',
    );

    // [Riset §1 blok 6, jebakan #1 & #4] Latar: hex eksplisit + kata kunci keseragaman.
    blocks.push(
      `${bg.promptColor.charAt(0).toUpperCase()}${bg.promptColor.slice(1)}, seamless and uniform, evenly lit, no gradient, no vignette, no shadows on the background.`,
    );

    // [Riset §1 blok 7, jebakan #1] Softbox lighting — klausa ganda bersama background anti-bayangan.
    blocks.push(
      'Professional studio softbox lighting, soft and even illumination on the face, no shadows under the nose or chin, balanced exposure, natural skin tones.',
    );

    // [Riset §1 blok 8, jebakan #6] Kualitas teknis + anti beauty filter.
    blocks.push(
      'Photorealistic, high-resolution DSLR photo quality, 85mm lens, sharp focus, natural skin texture with realistic pores, accurate skin tones, no beauty filter, no excessive retouching.',
    );

    // [Riset §1 blok 9, jebakan #8] Rasio eksplisit — AI tidak bisa presisi cm, crop akhir manual.
    blocks.push(
      `Output in ${size.ratio} portrait orientation (for ${size.label} print), print-ready.`,
    );

    // [Riset §1 blok 10, jebakan #3 & #9] Daftar negatif — selalu di akhir.
    const negatives = [
      softSmile ? null : 'no smile',
      'no glasses glare',
      'no jewelry',
      'no distracting accessories',
      'no watermark',
      'no text',
      'no logos',
      'no blur',
      'no artistic effects',
    ].filter(Boolean).join(', ');
    blocks.push(`${negatives}.`);

    return blocks.join('\n\n');
  },

  warnings: (state: DomainState): DomainWarning[] => {
    const out: DomainWarning[] = [];

    // Disclaimer konstan — riset §0 catatan etika/legal + spec §3.1
    out.push({
      sectionId: 'purpose',
      level: 'info',
      text: 'AI photos work for CV/LinkedIn/applications; official biometric documents may reject AI-generated photos.',
    });

    // Smart rule: passport/visa → info standar biometrik (spec §3.1 — info, tidak lock field)
    if (str(state.purpose) === 'passport-visa') {
      out.push({
        sectionId: 'purpose',
        level: 'info',
        text: 'Biometric standard: white background, neutral expression, face 70–80%.',
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
