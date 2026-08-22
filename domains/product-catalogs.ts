import type { DomainOption } from './types';

/**
 * Katalog Product — dari design/research-produk.md §2.
 * Semua label English; promptPhrase diambil verbatim dari riset §2.
 * Image path mengikuti konvensi spec §5: 'images/product/<kategori>/<slug>.webp'
 * (file belum ada → placeholder tile di VisualSelector).
 * Spesifikasi (spec §3.3 section 5) MENANG atas riset pada konflik:
 * COMPOSITIONS hanya centered / rule-of-thirds / symmetric — negative space
 * & diagonal TIDAK jadi opsi (negative space lewat toggle, diagonal dihapus).
 */

const img = (category: string, slug: string) => `images/product/${category}/${slug}.webp`;

// Riset §2.1 + spec §3.3 section 1 — category mengontrol default props/styling
export interface CategoryOption extends DomainOption {
  /** Slug props default dari PROPS_BY_CATEGORY (riset §2.5). */
  defaultProps: string[];
}
export const PRODUCT_CATEGORIES: CategoryOption[] = [
  { value: 'skincare', label: 'Skincare & Beauty', image: img('categories', 'skincare'), defaultProps: ['water-droplets', 'botanical-leaves'], hint: 'Serum, moisturizer, cleanser, perfume' },
  { value: 'food-beverage', label: 'Food & Beverage', image: img('categories', 'food-beverage'), defaultProps: ['scattered-ingredients', 'wooden-board'], hint: 'Coffee, snacks, bottled drinks, packaging' },
  { value: 'fashion', label: 'Fashion & Accessories', image: img('categories', 'fashion'), defaultProps: ['worn-on-model', 'complementary-items'], hint: 'Sneakers, bags, watches, apparel' },
  { value: 'electronics', label: 'Electronics', image: img('categories', 'electronics'), defaultProps: ['desk-setup', 'screen-glow'], hint: 'Headphones, smartwatch, gadgets' },
  { value: 'jewelry', label: 'Jewelry & Luxury', image: img('categories', 'jewelry'), defaultProps: ['velvet-surface', 'macro-sparkle'], hint: 'Rings, necklaces, earrings' },
  { value: 'home-goods', label: 'Home Goods / Other', image: img('categories', 'home-goods'), defaultProps: [], hint: 'No default props' },
];

// Riset §2.2 + spec §3.3 section 2 — shot type
export interface ShotTypeOption extends DomainOption {
  promptPhrase: string;
}
export const PRODUCT_SHOT_TYPES: ShotTypeOption[] = [
  { value: 'hero', label: 'Hero shot', image: img('shot-types', 'hero'), promptPhrase: 'hero shot, slightly low angle, product as the dominant subject' },
  { value: 'eye-level', label: 'Eye-level / straight-on', image: img('shot-types', 'eye-level'), promptPhrase: 'straight-on eye-level packshot' },
  { value: '45-degree', label: '45-degree angle', image: img('shot-types', '45-degree'), promptPhrase: '45-degree angle three-quarter view' },
  { value: 'flat-lay', label: 'Flat lay (top-down)', image: img('shot-types', 'flat-lay'), promptPhrase: 'top-down flat lay composition' },
  { value: 'macro', label: 'Macro detail', image: img('shot-types', 'macro'), promptPhrase: 'extreme macro close-up detail shot, 100mm macro lens' },
  { value: 'lifestyle', label: 'Lifestyle / in-context', image: img('shot-types', 'lifestyle'), promptPhrase: 'lifestyle in-context scene, product in real environment' },
  { value: 'scale', label: 'Scale shot', image: img('shot-types', 'scale'), promptPhrase: 'scale reference shot next to a familiar object for size comparison' },
  { value: 'floating', label: 'Floating / levitation', image: img('shot-types', 'floating'), promptPhrase: 'product levitating mid-air, dynamic hero composition' },
];

// Riset §2.3 + spec §3.3 section 3 — surface & background
export interface SurfaceOption extends DomainOption {
  promptPhrase: string;
  /** Wajib untuk Amazon/marketplace listing (riset §2.3). */
  marketplace?: boolean;
  /** Hanya cocok untuk shot lifestyle (riset §2.3). */
  lifestyleOnly?: boolean;
}
export const SURFACES: SurfaceOption[] = [
  { value: 'white-sweep', label: 'White sweep (seamless)', image: img('surfaces', 'white-sweep'), promptPhrase: 'seamless white background, studio sweep, pure white infinity cove', marketplace: true, hint: 'Required for Amazon / marketplace listings' },
  { value: 'marble', label: 'Marble', image: img('surfaces', 'marble'), promptPhrase: 'white Carrara marble surface with subtle veining' },
  { value: 'wood', label: 'Wood', image: img('surfaces', 'wood'), promptPhrase: 'rustic oak wooden table, warm natural grain' },
  { value: 'gradient', label: 'Gradient studio', image: img('surfaces', 'gradient'), promptPhrase: 'soft gradient studio backdrop from one color to another' },
  { value: 'colored-paper', label: 'Colored paper / solid backdrop', image: img('surfaces', 'colored-paper'), promptPhrase: 'matte pastel seamless paper backdrop' },
  { value: 'concrete', label: 'Concrete / stone', image: img('surfaces', 'concrete'), promptPhrase: 'raw concrete surface, industrial texture' },
  { value: 'linen', label: 'Fabric / linen', image: img('surfaces', 'linen'), promptPhrase: 'draped beige linen fabric background' },
  { value: 'dark-glossy', label: 'Dark / black glossy', image: img('surfaces', 'dark-glossy'), promptPhrase: 'glossy black reflective surface, dark moody background' },
  { value: 'outdoor', label: 'Outdoor lifestyle', image: img('surfaces', 'outdoor'), promptPhrase: 'café table by the window, natural outdoor setting', lifestyleOnly: true, hint: 'Lifestyle / in-context shots only' },
];

// Riset §2.4 + spec §3.3 section 4 — studio lighting (SATU select, "one scene, one light")
export interface LightingOption extends DomainOption {
  promptPhrase: string;
}
export const PRODUCT_LIGHTING: LightingOption[] = [
  { value: 'softbox', label: 'Softbox diffused', image: img('lighting', 'softbox'), promptPhrase: 'large softbox lighting, soft diffused light, gentle even illumination' },
  { value: 'soft-shadow', label: 'Soft shadow (catalog)', image: img('lighting', 'soft-shadow'), promptPhrase: 'soft natural drop shadow beneath the product' },
  { value: 'rim', label: 'Rim light', image: img('lighting', 'rim'), promptPhrase: 'rim lighting outlining the product edges, separated from background' },
  { value: 'dramatic-hard', label: 'Dramatic hard shadow', image: img('lighting', 'dramatic-hard'), promptPhrase: 'hard directional light, long dramatic shadows, high contrast' },
  { value: 'window', label: 'Natural window light', image: img('lighting', 'window'), promptPhrase: 'soft natural window light from the left, airy and bright' },
  { value: 'golden-hour', label: 'Golden hour', image: img('lighting', 'golden-hour'), promptPhrase: 'warm golden hour sunlight, soft glow' },
  { value: 'backlit', label: 'Backlit / glow', image: img('lighting', 'backlit'), promptPhrase: 'backlit translucent glow', hint: 'Works well for bottles, serums, beverages' },
  { value: 'gel', label: 'Colored gel light', image: img('lighting', 'gel'), promptPhrase: 'subtle colored gel accent lighting' },
];

// Riset §2.5 + spec §3.3 section 5 — props & styling per category (chips ikut category)
export interface PropOption extends DomainOption {
  promptPhrase: string;
}
export const PROPS_BY_CATEGORY: Record<string, PropOption[]> = {
  skincare: [
    { value: 'water-droplets', label: 'Water droplets', image: img('props/skincare', 'water-droplets'), promptPhrase: 'fresh water droplets on surface' },
    { value: 'botanical-leaves', label: 'Botanical leaves', image: img('props/skincare', 'botanical-leaves'), promptPhrase: 'eucalyptus leaves' },
    { value: 'ice-cubes', label: 'Ice cubes', image: img('props/skincare', 'ice-cubes'), promptPhrase: 'ice cubes' },
    { value: 'silk-ribbon', label: 'Silk ribbon', image: img('props/skincare', 'silk-ribbon'), promptPhrase: 'silk ribbon' },
    { value: 'stone-pedestal', label: 'Stone pedestal', image: img('props/skincare', 'stone-pedestal'), promptPhrase: 'stone pedestal' },
    { value: 'bathroom-tiles', label: 'Bathroom tiles', image: img('props/skincare', 'bathroom-tiles'), promptPhrase: 'bathroom tiles' },
    { value: 'sliced-ingredients', label: 'Sliced ingredients', image: img('props/skincare', 'sliced-ingredients'), promptPhrase: 'sliced ingredients (aloe, citrus)' },
  ],
  'food-beverage': [
    { value: 'scattered-ingredients', label: 'Scattered ingredients', image: img('props/food-beverage', 'scattered-ingredients'), promptPhrase: 'scattered coffee beans, cocoa powder dusting' },
    { value: 'steam', label: 'Steam', image: img('props/food-beverage', 'steam'), promptPhrase: 'rising steam wisps' },
    { value: 'linen-napkin', label: 'Linen napkin', image: img('props/food-beverage', 'linen-napkin'), promptPhrase: 'folded beige linen napkin' },
    { value: 'ceramic-mug', label: 'Ceramic mug pairing', image: img('props/food-beverage', 'ceramic-mug'), promptPhrase: 'ceramic mug pairing' },
    { value: 'wooden-board', label: 'Wooden board', image: img('props/food-beverage', 'wooden-board'), promptPhrase: 'wooden board' },
    { value: 'splash-motion', label: 'Splash / freeze motion', image: img('props/food-beverage', 'splash-motion'), promptPhrase: 'milk splash frozen in motion' },
  ],
  fashion: [
    { value: 'worn-on-model', label: 'Worn in-context', image: img('props/fashion', 'worn-on-model'), promptPhrase: "styled on model's wrist, on feet walking" },
    { value: 'complementary-items', label: 'Complementary items', image: img('props/fashion', 'complementary-items'), promptPhrase: 'complementary styling items (sunglasses, watch)' },
    { value: 'textured-fabric', label: 'Textured fabric', image: img('props/fashion', 'textured-fabric'), promptPhrase: 'textured fabric' },
    { value: 'urban-street', label: 'Urban / street background', image: img('props/fashion', 'urban-street'), promptPhrase: 'urban street background' },
  ],
  electronics: [
    { value: 'desk-setup', label: 'Minimal desk setup', image: img('props/electronics', 'desk-setup'), promptPhrase: 'minimal desk setup' },
    { value: 'charging-cable', label: 'Charging cable', image: img('props/electronics', 'charging-cable'), promptPhrase: 'charging cable artfully arranged' },
    { value: 'screen-glow', label: 'Screen glow', image: img('props/electronics', 'screen-glow'), promptPhrase: 'subtle screen glow' },
    { value: 'tech-backdrop', label: 'Gradient tech backdrop', image: img('props/electronics', 'tech-backdrop'), promptPhrase: 'gradient tech backdrop' },
    { value: 'floating-cable', label: 'Floating with cable loop', image: img('props/electronics', 'floating-cable'), promptPhrase: 'floating with cable loop' },
  ],
  jewelry: [
    { value: 'velvet-surface', label: 'Velvet surface', image: img('props/jewelry', 'velvet-surface'), promptPhrase: 'deep navy velvet surface' },
    { value: 'macro-sparkle', label: 'Macro sparkle', image: img('props/jewelry', 'macro-sparkle'), promptPhrase: 'brilliant facet sparkle, macro' },
    { value: 'silk-fabric', label: 'Silk fabric', image: img('props/jewelry', 'silk-fabric'), promptPhrase: 'silk fabric' },
    { value: 'water-reflection', label: 'Water surface reflection', image: img('props/jewelry', 'water-reflection'), promptPhrase: 'water surface reflection' },
    { value: 'model-close-up', label: "Model's neck / hand close-up", image: img('props/jewelry', 'model-close-up'), promptPhrase: "model's neck or hand close-up" },
  ],
  'home-goods': [],
};

// Riset §2.6 + spec §3.3 section 5 — komposisi.
// Spec MENANG: hanya centered / rule-of-thirds / symmetric.
// Negative space → toggle; diagonal dynamic → tidak termasuk (spec tidak menyebut).
export interface CompositionOption extends DomainOption {
  promptPhrase: string;
}
export const COMPOSITIONS: CompositionOption[] = [
  { value: 'centered', label: 'Centered', image: img('compositions', 'centered'), promptPhrase: 'centered composition' },
  { value: 'rule-of-thirds', label: 'Rule of thirds', image: img('compositions', 'rule-of-thirds'), promptPhrase: 'placed on the right third of the frame' },
  { value: 'symmetric', label: 'Symmetric', image: img('compositions', 'symmetric'), promptPhrase: 'symmetrical composition' },
];

// Riset §2.8 + spec §3.3 — chips kualitas (multi-select); label = frasa prompt itu sendiri
export const QUALITY_MODIFIERS: DomainOption[] = [
  { value: 'commercial', label: 'commercial photography' },
  { value: 'advertising', label: 'advertising quality' },
  { value: '8k', label: '8k' },
  { value: 'ultra-sharp', label: 'ultra sharp focus' },
  { value: 'high-detail', label: 'high detail' },
  { value: 'studio', label: 'professional studio photography' },
  { value: 'packshot', label: 'packshot' },
  { value: 'award-winning', label: 'award-winning product photography' },
];

// Riset §2.9 — negative/avoid verbatim (untuk platform yang mendukung negative prompt)
export const NEGATIVES =
  'distorted label, misspelled text, warped packaging, extra objects, cluttered background, harsh reflections, deformed product, low resolution, watermark, blurry';

// Phase 6 Task 2 — lens (select). qualityPhrase replaces the hardcoded '85mm f/8 product shot'.
export interface ProductLensOption extends DomainOption {
  qualityPhrase: string;     // physical-constraint tail (replaces '85mm f/8 product shot')
}
export const PRODUCT_LENSES: ProductLensOption[] = [
  { value: '85mm-f8', label: '85mm f/8 packshot', qualityPhrase: '85mm f/8 product shot' },
  { value: '50mm', label: '50mm standard', qualityPhrase: '50mm product shot' },
  { value: '100mm-macro', label: '100mm macro', qualityPhrase: '100mm macro product shot, 1:1 detail reproduction' },
  { value: '24-70mm', label: '24-70mm zoom', qualityPhrase: '24-70mm zoom product shot' },
  { value: '90mm-ts', label: '90mm tilt-shift', qualityPhrase: '90mm tilt-shift product shot, full focal plane sharpness' },
];

// Phase 6 Task 2 — camera body (select). Sentence clause.
export interface ProductCameraOption extends DomainOption { promptPhrase: string; }
export const PRODUCT_CAMERAS: ProductCameraOption[] = [
  { value: 'fuji-gfx100ii', label: 'Fujifilm GFX 100 II', promptPhrase: 'Fujifilm GFX 100 II, 102MP medium format' },
  { value: 'sony-a7rv', label: 'Sony A7R V', promptPhrase: 'Sony A7R V, 61MP full-frame' },
  { value: 'canon-r5', label: 'Canon EOS R5', promptPhrase: 'Canon EOS R5, 45MP full-frame' },
  { value: 'nikon-z8', label: 'Nikon Z8', promptPhrase: 'Nikon Z8, 45MP full-frame' },
  { value: 'phase-one', label: 'Phase One IQ4', promptPhrase: 'Phase One IQ4 150MP medium format' },
];
