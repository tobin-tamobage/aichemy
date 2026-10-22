import type { DomainRecipe, DomainState, DomainWarning } from './types';
import {
  CONTENT_TYPES,
  MARKETING_FORMATS,
  DESIGN_STYLES,
  COLOR_PRESETS,
  TYPOGRAPHY_STYLES,
  TEXT_STRATEGIES,
  PROMO_ELEMENTS,
  MARKETING_GUARDRAILS,
} from './marketing-catalogs';

/**
 * DomainRecipe: Marketing — dari design/research-marketing.md §1-§4 + spec §3.4.
 * Komentar [Riset §…] di buildPrompt/warnings memetakan tiap blok prompt ke temuan riset.
 *
 * Spec §3.4: referencePhoto: true (opsional) — klausa referensi produk (riset jebakan #4
 * verbatim) disertakan selama reference mode aktif; hero = foto produk di-attach user.
 * Chips promo elements max 3 (spec smart rule "1 prompt = 1 message", jebakan #2).
 * Guardrail/negative jadi konstanta blok 10, bukan field (plan keputusan authoring).
 */

// The external image tool uses the attached product photo as the ad's unchanged hero.
const REFERENCE_CLAUSE =
  'Use the attached product photo as the hero product; preserve its appearance, packaging, label, logo, and proportions exactly, and integrate it into the design without redrawing it.';

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

export const marketingDomain: DomainRecipe = {
  id: 'marketing',
  label: 'Marketing',
  icon: '📣',
  tagline: 'Ads, flyers, and social media creative.',
  referencePhoto: true,
  referenceLabel: 'Product photo',
  referenceClause: REFERENCE_CLAUSE,

  createEmptyState: () => ({
    hasReferencePhoto: true,
    // Slug katalog = 'social-media-post' (marketing-catalogs CONTENT_TYPES) —
    // plan menulis 'social-post' tapi opsi itu tidak ada di katalog Task 1.
    contentType: 'social-media-post',
    format: '1x1',
    designStyle: 'minimalist',
    colorScheme: 'red-yellow',
    typography: 'bold-condensed',
    textStrategy: 'render-exact',
    headlineText: '',
    promoElements: [],
  }),

  // Teks bebas (headlineText) tidak ditimpa preset — pola cinematic subjectAction.
  presetProtectedKeys: ['headlineText'],

  sections: [
    {
      id: 'content-type',
      title: '01 · Content Type',
      fields: [{ kind: 'visual', key: 'contentType', label: 'Content type', options: CONTENT_TYPES, previewRatio: 'aspect-video' }],
    },
    {
      id: 'format-size',
      title: '02 · Format & Size',
      fields: [{ kind: 'visual', key: 'format', label: 'Format', options: MARKETING_FORMATS, previewRatio: 'aspect-square' }],
    },
    {
      id: 'design-style',
      title: '03 · Design Style',
      fields: [
        { kind: 'visual', key: 'designStyle', label: 'Design style', options: DESIGN_STYLES, previewRatio: 'aspect-[4/3]' },
      ],
    },
    {
      id: 'color-typography',
      title: '04 · Color & Typography',
      fields: [
        { kind: 'visual', key: 'colorScheme', label: 'Color scheme', options: COLOR_PRESETS, previewRatio: 'aspect-[4/3]' },
        { kind: 'visual', key: 'typography', label: 'Typography', options: TYPOGRAPHY_STYLES, previewRatio: 'aspect-square' },
      ],
    },
    {
      id: 'headline-promo',
      title: '05 · Headline & Promo Elements',
      fields: [
        {
          kind: 'textarea',
          key: 'headlineText',
          label: 'Headline text',
          placeholder: 'E.g., FLASH SALE 50% OFF',
          rows: 3,
        },
        { kind: 'visual', key: 'textStrategy', label: 'Text strategy', options: TEXT_STRATEGIES, previewRatio: 'aspect-video' },
        {
          kind: 'chips',
          key: 'promoElements',
          label: 'Promo elements',
          max: 3,
          options: PROMO_ELEMENTS,
        },
      ],
    },
  ],

  buildPrompt: (state: DomainState): string => {
    const contentType = CONTENT_TYPES.find(o => o.value === str(state.contentType)) ?? CONTENT_TYPES[0];
    const format = MARKETING_FORMATS.find(o => o.value === str(state.format)) ?? MARKETING_FORMATS[0];
    const designStyle = DESIGN_STYLES.find(o => o.value === str(state.designStyle)) ?? DESIGN_STYLES[0];
    const colorPreset = COLOR_PRESETS.find(o => o.value === str(state.colorScheme)) ?? COLOR_PRESETS[0];
    const typography = TYPOGRAPHY_STYLES.find(o => o.value === str(state.typography)) ?? TYPOGRAPHY_STYLES[0];
    const strategy = TEXT_STRATEGIES.find(o => o.value === str(state.textStrategy)) ?? TEXT_STRATEGIES[0];
    // Keep the user's headline text intact; quotation marks below delimit the exact copy.
    const headline = str(state.headlineText);
    const isStory = format.value === '9x16';

    // Promo elements chips terpilih → frasa prompt (riset §2 Field 7).
    const promoValues = Array.isArray(state.promoElements) ? (state.promoElements as string[]) : [];
    const selectedPromos = promoValues
      .map(v => PROMO_ELEMENTS.find(o => o.value === v))
      .filter((o): o is NonNullable<typeof o> => Boolean(o));

    const blocks: string[] = [];

    // [Riset §1 blok 1] Jenis deliverable + format — mengunci komposisi sejak awal.
    blocks.push(`Design ${contentType.promptPhrase} in ${format.clause}.`);

    // [Riset §2 Field 3] Design style / mood.
    blocks.push(`${designStyle.descriptor}.`);

    // [Riset §1 blok 2 + jebakan #4] Preserve the attached product; layout handles placement.
    if (state.hasReferencePhoto !== false) {
      blocks.push(REFERENCE_CLAUSE);
    }

    // [Riset §2 Field 4] Color scheme — warna konkret + peran.
    blocks.push(`Color scheme: ${colorPreset.promptPhrase}.`);

    // [Riset §1 blok 3] Layout zonasi. "headline at the top" hanya bila strategi
    // merender teks (render-exact/placeholder); empty-area memakai klausa blok 6.
    // CTA hanya disebut bila chip cta-button terpilih. Story 9:16 memakai varian
    // layout safe-zone — klausa safe-zone sudah ada di format clause (tanpa duplikasi).
    const hasHeadline = strategy.value === 'placeholder'
      || (strategy.value === 'render-exact' && headline.trim().length > 0);
    const hasCta = selectedPromos.some(o => o.value === 'cta-button');
    const layoutParts: string[] = [];
    if (hasHeadline) {
      layoutParts.push(isStory ? 'headline in the upper part of the central safe zone' : 'headline at the top');
    }
    layoutParts.push('product in the center');
    if (hasCta) {
      layoutParts.push(isStory ? 'CTA just above the bottom edge, within the central safe zone' : 'CTA at the bottom');
    }
    blocks.push(`${layoutParts.join(', ')}.`);

    if (strategy.value === 'render-exact') {
      blocks.push(headline.trim()
        ? `${strategy.promptPhrase}: “${headline}”`
        : 'Leave the headline area at the top blank until exact copy is supplied.');
    } else {
      blocks.push(strategy.promptPhrase);
    }

    // [Riset §1 blok 5] Typography style — gaya generik, bukan font brand (jebakan #3/#8).
    blocks.push(`Typography: ${typography.promptPhrase}.`);

    // [Riset §1 blok 9 + jebakan #2] Elemen promosi — "only these elements" membatasi
    // isian AI; skip bila kosong. promptPhrase katalog sudah menggambarkan tiap elemen
    // (logo placeholder menyertakan lingkaran pojok kiri-atas).
    if (selectedPromos.length > 0) {
      blocks.push(`${selectedPromos.map(o => o.promptPhrase).join(', ')}, only these elements`);
    }

    // Keep hierarchy consistent with whether headline text and a CTA are present.
    blocks.push(hasHeadline
      ? (hasCta
        ? 'Clear visual hierarchy: headline biggest and highest contrast, product second, CTA third.'
        : 'Clear visual hierarchy: headline biggest and highest contrast, product second.')
      : (hasCta
        ? 'Clear visual hierarchy: product first, CTA second.'
        : 'Clear visual hierarchy: the product is the focal point.'));
    // Text guardrail complements the selected headline strategy and reserved promo areas.
    blocks.push(`${MARKETING_GUARDRAILS.charAt(0).toUpperCase()}${MARKETING_GUARDRAILS.slice(1)}`);

    return blocks.join('\n\n');
  },

  warnings: (state: DomainState): DomainWarning[] => {
    const out: DomainWarning[] = [];
    const contentType = str(state.contentType);
    const format = str(state.format);
    const strategy = str(state.textStrategy);
    const headline = str(state.headlineText).trim();
    const promoValues = Array.isArray(state.promoElements) ? (state.promoElements as string[]) : [];

    // [Riset §4 jebakan #2 + spec §3.4 smart rules] "1 prompt = 1 message" —
    // terlalu banyak elemen mengisi setiap ruang kosong.
    if (promoValues.length >= 3) {
      out.push({
        sectionId: 'headline-promo',
        level: 'warn',
        text: 'Too many promo elements crowds the layout — max 3 recommended.',
      });
    }

    // [Riset §4 jebakan #7] Story 9:16 punya UI overlay (nama akun, reply bar) —
    // elemen kunci harus di safe zone.
    if (format === '9x16') {
      out.push({
        sectionId: 'format-size',
        level: 'info',
        text: '9:16 Stories have UI overlays — key elements are kept in the central safe zone (avoid top/bottom 250px).',
      });
    }

    // Content type story + format non-story — kontradiksi rasio (jebakan #8).
    if (contentType === 'ig-tiktok-story' && format !== '9x16') {
      out.push({
        sectionId: 'format-size',
        level: 'warn',
        text: 'Story content pairs with 9:16 — switch Format & Size to IG / TikTok Story.',
      });
    }

    if (strategy === 'render-exact' && headline.length === 0) {
      out.push({
        sectionId: 'headline-promo',
        level: 'info',
        text: 'No headline copy entered — the prompt leaves this area blank. Add exact copy or choose the empty-area strategy.',
      });
    }

    // [Riset §4 jebakan #1/#6] Teks panjang rawan salah eja — batas ~6 kata per elemen.
    if (strategy === 'render-exact' && headline.split(/\s+/).filter(Boolean).length > 6) {
      out.push({
        sectionId: 'headline-promo',
        level: 'warn',
        text: 'AI misspells long copy — keep each text element to ~6 words or use the placeholder strategy.',
      });
    }

    // [Riset §4 jebakan #3] AI menghalusinasi logo palsu — placeholder circle + tempel manual.
    if (strategy === 'render-exact' && promoValues.includes('logo-placeholder')) {
      out.push({
        sectionId: 'headline-promo',
        level: 'info',
        text: 'AI will hallucinate a fake logo — use the logo placeholder circle and paste the real one manually.',
      });
    }

    // [Riset §4 jebakan #2] Empty-area + tanpa elemen promosi → bisa terlihat kosong.
    if (strategy === 'empty-area' && promoValues.length === 0) {
      out.push({
        sectionId: 'headline-promo',
        level: 'info',
        text: 'Empty-area headline plus no promo elements may look bare — consider adding a CTA button.',
      });
    }

    return out;
  },
};
