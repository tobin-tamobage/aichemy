import type { DomainRecipe, DomainState, DomainWarning, DomainOption } from './types';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_SHOT_TYPES,
  SURFACES,
  PRODUCT_LIGHTING,
  PROPS_BY_CATEGORY,
  COMPOSITIONS,
  QUALITY_MODIFIERS,
  PRODUCT_LENSES,
  PRODUCT_CAMERAS,
  NEGATIVES,
} from './product-catalogs';

/**
 * DomainRecipe: Product — dari design/research-produk.md §1-§4 + spec §3.3.
 * Komentar [Riset §…] di buildPrompt/warnings memetakan tiap blok prompt ke temuan riset.
 *
 * Spec §3.3: referencePhoto: true — ada reference clause (produk di-attach user,
 * scene dibangun di sekelilingnya, produk TIDAK diubah). Lighting single-select
 * (smart rule "one scene, one light"). Constraint fisik kamera/lensa kini berasal
 * dari field Camera & Lens (Phase 6) — dulu hardcoded `85mm f/8 product shot`.
 */

// Klausa referensi PERSIS spec §3.3 — produk di-attach user; jangan redraw/ubah produk.
const REFERENCE_CLAUSE =
  'Use the attached product photo as the product. Do not redraw or alter the product itself; build the scene around it.';

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

export const productDomain: DomainRecipe = {
  id: 'product',
  label: 'Product',
  icon: '📦',
  tagline: 'Studio product photography with surfaces and lighting.',
  referencePhoto: true,
  referenceLabel: 'Product photo',
  referenceClause: REFERENCE_CLAUSE,

  createEmptyState: () => ({
    hasReferencePhoto: true,
    category: 'skincare',
    shotType: 'hero',
    surface: 'white-sweep',
    lighting: 'softbox',
    props: [],
    composition: 'centered',
    negativeSpace: false,
    blankLabel: false,
    quality: ['commercial', '8k', 'ultra-sharp'],
    productName: '',
    lens: '85mm-f8',
    camera: 'fuji-gfx100ii',
  }),

  // Teks bebas (productName) tidak ditimpa preset — pola cinematic subjectAction.
  presetProtectedKeys: ['productName'],

  sections: [
    {
      id: 'product-category',
      title: '01 · Product & Category',
      fields: [
        {
          kind: 'textarea',
          key: 'productName',
          label: 'Product name / description',
          placeholder: 'E.g., minimalist frosted glass serum bottle with white dropper cap…',
          rows: 3,
        },
        { kind: 'select', key: 'category', label: 'Category', options: PRODUCT_CATEGORIES },
      ],
    },
    {
      id: 'shot-type',
      title: '02 · Shot Type',
      fields: [
        { kind: 'visual', key: 'shotType', label: 'Shot type', options: PRODUCT_SHOT_TYPES, previewRatio: 'aspect-[4/3]' },
      ],
    },
    {
      id: 'surface-background',
      title: '03 · Surface & Background',
      fields: [
        { kind: 'visual', key: 'surface', label: 'Surface / background', options: SURFACES, previewRatio: 'aspect-[4/3]' },
      ],
    },
    {
      id: 'studio-lighting',
      title: '04 · Studio Lighting',
      fields: [
        // visual = single-select paksa — smart rule "one scene, one light" (riset §1 prinsip 2, spec §3.3).
        { kind: 'visual', key: 'lighting', label: 'Lighting', options: PRODUCT_LIGHTING, previewRatio: 'aspect-[4/3]' },
      ],
    },
    {
      id: 'props-composition',
      title: '05 · Props & Composition',
      fields: [
        {
          kind: 'chips',
          key: 'props',
          label: 'Props & styling',
          max: 3,
          // Task 1 dynamic options — katalog props mengikuti category (riset §2.5, spec §3.3 section 5).
          options: (state: DomainState): DomainOption[] => PROPS_BY_CATEGORY[str(state.category)] ?? [],
          // Hanya tampil bila category punya opsi props (mis. home-goods tidak).
          visibleWhen: (state: DomainState): boolean =>
            (PROPS_BY_CATEGORY[str(state.category)] ?? []).length > 0,
        },
        { kind: 'toggle', key: 'negativeSpace', label: 'Negative space for ad copy' },
        { kind: 'toggle', key: 'blankLabel', label: 'Blank label (no text)' },
        { kind: 'select', key: 'composition', label: 'Composition', options: COMPOSITIONS },
        { kind: 'chips', key: 'quality', label: 'Quality', options: QUALITY_MODIFIERS },
      ],
    },
    {
      id: 'camera-lens',
      title: '06 · Camera & Lens',
      fields: [
        { kind: 'select', key: 'lens', label: 'Lens', options: PRODUCT_LENSES },
        { kind: 'select', key: 'camera', label: 'Camera body', options: PRODUCT_CAMERAS },
      ],
    },
  ],

  buildPrompt: (state: DomainState): string => {
    const category = str(state.category);
    const shot = PRODUCT_SHOT_TYPES.find(o => o.value === str(state.shotType)) ?? PRODUCT_SHOT_TYPES[0];
    const surface = SURFACES.find(o => o.value === str(state.surface)) ?? SURFACES[0];
    const lighting = PRODUCT_LIGHTING.find(o => o.value === str(state.lighting)) ?? PRODUCT_LIGHTING[0];
    const composition = COMPOSITIONS.find(o => o.value === str(state.composition)) ?? COMPOSITIONS[0];
    const lens = PRODUCT_LENSES.find(o => o.value === str(state.lens)) ?? PRODUCT_LENSES[0];
    const camera = PRODUCT_CAMERAS.find(o => o.value === str(state.camera)) ?? PRODUCT_CAMERAS[0];
    const productName = str(state.productName).trim();
    const blankLabel = state.blankLabel === true;
    const negativeSpace = state.negativeSpace === true;

    // Props chips terpilih → frasa prompt (riset §2.5). Bila user TIDAK memilih props,
    // kategori mengontrol default styling (riset §2.1, didokumentasikan di katalog):
    // defaultProps kategori dipakai sebagai isi blok props. UI tidak berubah — hanya
    // prompt yang memakai default. Warnings tetap berdasarkan state.props saja.
    const propsValues = Array.isArray(state.props) ? (state.props as string[]) : [];
    const propsByCategory = PROPS_BY_CATEGORY[category] ?? [];
    const propsPhrases = propsValues
      .map(v => propsByCategory.find(o => o.value === v))
      .filter((o): o is NonNullable<typeof o> => Boolean(o))
      .map(o => o.promptPhrase);
    const effectivePropsPhrases = propsPhrases.length > 0
      ? propsPhrases
      : (PRODUCT_CATEGORIES.find(o => o.value === category)?.defaultProps ?? [])
          .map(v => propsByCategory.find(o => o.value === v))
          .filter((o): o is NonNullable<typeof o> => Boolean(o))
          .map(o => o.promptPhrase);

    // Quality chips → label adalah frasa prompt itu sendiri (riset §2.8).
    const qualityValues = Array.isArray(state.quality) ? (state.quality as string[]) : [];
    const qualityLabels = qualityValues
      .map(v => QUALITY_MODIFIERS.find(o => o.value === v))
      .filter((o): o is NonNullable<typeof o> => Boolean(o))
      .map(o => o.label);

    const blocks: string[] = [];

    // [Riset §1 blok 2 — img2img] Klausa referensi di posisi awal — paling dipatuhi.
    // Foto produk di-attach user di app AI; disertakan selama reference mode aktif (pola id-photo).
    if (state.hasReferencePhoto !== false) {
      blocks.push(REFERENCE_CLAUSE);
    }

    // [Riset §1 blok 1] Intent + shot type di awal (token paling berpengaruh).
    blocks.push(`Professional product photography, ${shot.promptPhrase}`);

    // [Riset §1 blok 3, jebakan #1] Subject-first: produk + atribut fisik sedini mungkin.
    // productName bebas user; fallback "the product" (produk sesungguhnya dari foto referensi).
    let subject = productName ? productName : 'the product';
    if (blankLabel) {
      // [Riset §4 jebakan #1] Label kosong — mitigasi teks salah eja/logo melting.
      subject += ' with a blank minimal label (no text)';
    }
    blocks.push(subject);

    // [Riset §1 blok 4] Surface/background.
    blocks.push(`on ${surface.promptPhrase}`);

    // [Riset §1 blok 5, prinsip 2] SATU sumber cahaya — never mix (single-select).
    blocks.push(lighting.promptPhrase);

    // [Riset §2.5] Props support product, product tetap focal point — skip bila kosong.
    if (effectivePropsPhrases.length > 0) {
      blocks.push(`${effectivePropsPhrases.join(', ')}, props support the product, product remains the focal point`);
    }

    // [Riset §2.6 + spec §3.3] Komposisi + negative space via toggle.
    let compPhrase = composition.promptPhrase;
    if (negativeSpace) {
      compPhrase += ', generous negative space on the left for ad copy / headline text';
    }
    blocks.push(compPhrase);

    // [Phase 6] Physical constraint now comes from the lens field (was hardcoded '85mm f/8 product shot').
    const qualityTail = qualityLabels.length > 0 ? `${qualityLabels.join(', ')}, ` : '';
    blocks.push(`${qualityTail}${lens.qualityPhrase}, ${camera.promptPhrase}`);

    // [Riset §2.9] Daftar negatif — selalu di akhir.
    blocks.push(`Negative: ${NEGATIVES}.`);

    return blocks.join('\n\n');
  },

  warnings: (state: DomainState): DomainWarning[] => {
    const out: DomainWarning[] = [];
    const category = str(state.category);
    const shotType = str(state.shotType);
    const surface = str(state.surface);
    const lighting = str(state.lighting);
    const lens = str(state.lens);
    const blankLabel = state.blankLabel === true;
    const propsValues = Array.isArray(state.props) ? (state.props as string[]) : [];

    // [Riset §4 jebakan #7] White sweep + cahaya tanpa bayangan → produk melayang tak sengaja.
    if (surface === 'white-sweep' && lighting !== 'soft-shadow' && lighting !== 'softbox') {
      out.push({
        sectionId: 'studio-lighting',
        level: 'info',
        text: 'Add a soft natural drop shadow — products float unintentionally on white sweeps.',
      });
    }

    // [Riset §4 jebakan #8] Terlalu banyak props menenggelamkan produk.
    if (propsValues.length === 3) {
      out.push({
        sectionId: 'props-composition',
        level: 'warn',
        text: 'Too many props bury the product — keep it the clear focal point.',
      });
    }

    // [Riset §4 jebakan #3] Angle ekstrem merusak geometri presisi (elektronik/perhiasan).
    if (
      (shotType === 'macro' || shotType === 'floating') &&
      (category === 'electronics' || category === 'jewelry')
    ) {
      out.push({
        sectionId: 'shot-type',
        level: 'warn',
        text: "Extreme angles risk deformed geometry — keep 'accurate product proportions' in mind.",
      });
    }

    // [Phase 6] Macro shot type needs the 100mm macro lens.
    if (shotType === 'macro' && lens !== '100mm-macro') {
      out.push({
        sectionId: 'camera-lens',
        level: 'warn',
        text: 'Macro detail shots need the 100mm macro lens — switch the lens or choose a wider shot type.',
      });
    }

    // [Riset §4 jebakan #1] Produk berlabel + blank label off → teks sering salah eja.
    if ((category === 'skincare' || category === 'food-beverage') && !blankLabel) {
      out.push({
        sectionId: 'props-composition',
        level: 'info',
        text: "AI often misspells label text — consider 'Blank label' or plan to retouch text.",
      });
    }

    // [Riset §4 jebakan #9] Permukaan glossy baca sebagai plastik → perlu tekstur mikro.
    if (category === 'electronics' || category === 'jewelry') {
      out.push({
        sectionId: 'product-category',
        level: 'info',
        text: 'Glossy surfaces read plastic — add explicit micro-texture detail.',
      });
    }

    return out;
  },
};
