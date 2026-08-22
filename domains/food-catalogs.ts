/**
 * Katalog Food — dari design/research-food.md §2 (field catalogs) + plan Task 1 Step 3.
 * Semua label English; promptPhrase diambil verbatim dari plan (authoring plan — research
 * memvalidasi, plan menang). Image path mengikuti konvensi spec:
 * 'images/food/<kategori>/<slug>.webp' (file belum ada → placeholder tile di VisualSelector).
 *
 * Keputusan authoring plan: FOOD_DISHES = satu select gabungan 8 hidangan Indonesia +
 * 6 internasional (lebih simpel daripada dua select cuisine+dish; prompt langsung spesifik
 * per hidangan). HOT_DISHES/TALL_DISHES direferensikan oleh food.ts smart rules.
 */

import type { DomainOption } from './types';

const img = (category: string, slug: string) => `images/food/${category}/${slug}.webp`;

// Plan Task 1 Step 3 Field 1 — hidangan (select gabungan; promptPhrase = plating deskriptif).
export interface DishOption extends DomainOption {
  promptPhrase: string;
}
export const FOOD_DISHES: DishOption[] = [
  { value: 'rendang', label: 'Rendang', image: img('dishes', 'rendang'), promptPhrase: 'beef rendang with dark glossy caramelized coconut sauce, tender shredded beef, garnished with fried shallots and red chili' },
  { value: 'sate-ayam', label: 'Sate Ayam', image: img('dishes', 'sate-ayam'), promptPhrase: 'chicken satay skewers with charred edges, peanut sauce on the side, lime wedges and ketupat rice cakes' },
  { value: 'nasi-goreng', label: 'Nasi Goreng', image: img('dishes', 'nasi-goreng'), promptPhrase: 'nasi goreng, Indonesian fried rice topped with a fried egg, shrimp crackers, cucumber slices and fried shallots' },
  { value: 'gado-gado', label: 'Gado-Gado', image: img('dishes', 'gado-gado'), promptPhrase: 'gado-gado, Indonesian vegetable salad with creamy peanut dressing, boiled egg, tofu and lontong rice cakes' },
  { value: 'soto-ayam', label: 'Soto Ayam', image: img('dishes', 'soto-ayam'), promptPhrase: 'soto ayam, golden turmeric chicken soup with rice noodles, bean sprouts, lime and fried shallots' },
  { value: 'rawon', label: 'Rawon', image: img('dishes', 'rawon'), promptPhrase: 'rawon, dark black beef soup with keluak broth, bean sprouts and sambal' },
  { value: 'ayam-bakar', label: 'Ayam Bakar', image: img('dishes', 'ayam-bakar'), promptPhrase: 'ayam bakar, grilled chicken with a smoky sweet glaze, sambal and fresh vegetables' },
  { value: 'mie-goreng', label: 'Mie Goreng', image: img('dishes', 'mie-goreng'), promptPhrase: 'mie goreng, stir-fried noodles with vegetables, egg and kecap manis glaze' },
  { value: 'sushi', label: 'Sushi platter', image: img('dishes', 'sushi'), promptPhrase: 'an elegant sushi platter with glistening fresh nigiri and maki rolls' },
  { value: 'ramen', label: 'Ramen', image: img('dishes', 'ramen'), promptPhrase: 'a steaming bowl of ramen with rich broth, soft-boiled egg, chashu pork and spring onions' },
  { value: 'pasta', label: 'Pasta', image: img('dishes', 'pasta'), promptPhrase: 'a plated pasta dish, al dente, with fresh herbs and shaved parmesan' },
  { value: 'burger', label: 'Gourmet burger', image: img('dishes', 'burger'), promptPhrase: 'a juicy gourmet burger with melted cheese, crisp lettuce and a toasted bun' },
  { value: 'dessert', label: 'Plated dessert', image: img('dishes', 'dessert'), promptPhrase: 'a delicate plated dessert with a glossy sauce swirl and a light garnish' },
  { value: 'drink', label: 'Iced drink', image: img('dishes', 'drink'), promptPhrase: 'a refreshing iced drink in a tall glass with condensation droplets' },
];

// Plan Task 1 Step 3 Field 2 — presentasi/penyajian (select).
export interface PresentationOption extends DomainOption {
  promptPhrase: string;
}
export const FOOD_PRESENTATIONS: PresentationOption[] = [
  { value: 'fine-dining', label: 'Fine dining', image: img('presentations', 'fine-dining'), promptPhrase: 'fine-dining plating, precise and minimal' },
  { value: 'rustic-family', label: 'Rustic family style', image: img('presentations', 'rustic-family'), promptPhrase: 'rustic family-style serving, generous and casual' },
  { value: 'flat-lay', label: 'Flat lay', image: img('presentations', 'flat-lay'), promptPhrase: 'a flat lay with ingredients arranged around the dish' },
];

// Plan Task 1 Step 3 Field 3 — mood cahaya (select).
export interface LightMoodOption extends DomainOption {
  promptPhrase: string;
}
export const FOOD_LIGHT_MOODS: LightMoodOption[] = [
  { value: 'bright-airy', label: 'Bright & airy', image: img('light-moods', 'bright-airy'), promptPhrase: 'bright and airy, soft diffused daylight, clean white balance' },
  { value: 'dark-moody', label: 'Dark & moody', image: img('light-moods', 'dark-moody'), promptPhrase: 'dark and moody, deep shadows, dramatic contrast' },
  { value: 'natural-window', label: 'Window light', image: img('light-moods', 'natural-window'), promptPhrase: 'soft natural window light from the side' },
  { value: 'warm-cozy', label: 'Warm & cozy', image: img('light-moods', 'warm-cozy'), promptPhrase: 'warm cozy evening light with golden tones' },
];

// Plan Task 1 Step 3 Field 4 — angle (select).
export interface FoodAngleOption extends DomainOption {
  promptPhrase: string;
}
export const FOOD_ANGLES: FoodAngleOption[] = [
  { value: '45-degree', label: '45° angle', image: img('angles', '45-degree'), promptPhrase: 'a 45-degree angle, the classic food photography view' },
  { value: 'overhead', label: 'Overhead', image: img('angles', 'overhead'), promptPhrase: 'a top-down overhead view' },
  { value: 'side-profile', label: 'Side profile', image: img('angles', 'side-profile'), promptPhrase: 'a side profile view showing height and layers' },
  { value: 'close-up', label: 'Close-up', image: img('angles', 'close-up'), promptPhrase: 'a close-up macro view of texture and detail' },
];

// Plan Task 1 Step 3 Field 5 — backdrop/permukaan (select).
export interface BackdropOption extends DomainOption {
  promptPhrase: string;
}
export const FOOD_BACKDROPS: BackdropOption[] = [
  { value: 'marble', label: 'White marble', image: img('backdrops', 'marble'), promptPhrase: 'a white marble surface' },
  { value: 'wood-table', label: 'Wood table', image: img('backdrops', 'wood-table'), promptPhrase: 'a rustic wood table' },
  { value: 'banana-leaf', label: 'Banana leaf', image: img('backdrops', 'banana-leaf'), promptPhrase: 'a fresh banana leaf lining' },
  { value: 'linen', label: 'Linen', image: img('backdrops', 'linen'), promptPhrase: 'a natural linen cloth' },
  { value: 'dark-slate', label: 'Dark slate', image: img('backdrops', 'dark-slate'), promptPhrase: 'a dark slate surface' },
  { value: 'ceramic', label: 'Ceramic', image: img('backdrops', 'ceramic'), promptPhrase: 'handmade ceramic tableware' },
];

// Phase 6 Task 2 — lens (select). 'auto' derives from angle.
export interface FoodLensOption extends DomainOption { promptPhrase: string; }
export const FOOD_LENSES: FoodLensOption[] = [
  { value: 'auto', label: 'Auto (match angle)', promptPhrase: '' },
  { value: '50mm', label: '50mm standard', image: '/images/focal-length/50mm-standard.webp', promptPhrase: 'a 50mm lens, natural table perspective' },
  { value: '85mm', label: '85mm portrait', image: '/images/focal-length/85mm-portrait.webp', promptPhrase: 'an 85mm lens, gentle compression' },
  { value: '100mm-macro', label: '100mm macro', image: '/images/focal-length/100mm-macro.webp', promptPhrase: 'a 100mm macro lens, texture and detail' },
  { value: '24-70mm', label: '24-70mm zoom', image: '/images/focal-length/24mm-wide-angle.webp', promptPhrase: 'a 24-70mm zoom lens' },
];

// Phase 6 Task 2 — camera body (select).
export interface FoodCameraOption extends DomainOption { promptPhrase: string; }
export const FOOD_CAMERAS: FoodCameraOption[] = [
  { value: 'canon-eos-5d', label: 'Canon EOS 5D', image: '/images/cameras/canon-eos-5d.webp', promptPhrase: 'Canon EOS 5D, full-frame DSLR' },
  { value: 'fujifilm-x-t4', label: 'Fujifilm X-T4', image: '/images/cameras/fujifilm-x-t4.webp', promptPhrase: 'Fujifilm X-T4, 26MP APS-C mirrorless' },
  { value: 'hasselblad-x1d-ii', label: 'Hasselblad X1D II', image: '/images/cameras/hasselblad-x1d-ii.webp', promptPhrase: 'Hasselblad X1D II, 50MP medium format mirrorless' },
  { value: 'iphone-pro', label: 'iPhone Pro', image: '/images/cameras/iphone-pro.webp', promptPhrase: 'modern iPhone Pro camera, computational photography' },
];

// Phase 6 Task 2 — publication style (select). 'auto' = no clause.
export interface FoodStyleOption extends DomainOption { promptPhrase: string; }
export const FOOD_STYLES: FoodStyleOption[] = [
  { value: 'auto', label: 'No specific style', promptPhrase: '' },
  { value: 'kinfolk-editorial', label: 'Kinfolk editorial', image: img('styles', 'kinfolk-editorial'), promptPhrase: 'Kinfolk magazine editorial style, muted earthy tones, quiet natural storytelling' },
  { value: 'bon-appetit', label: 'Bon Appétit commercial', image: img('styles', 'bon-appetit'), promptPhrase: 'Bon Appétit commercial style, bright, crisp, vibrant color pop' },
  { value: 'clean-cookbook', label: 'Clean cookbook', image: img('styles', 'clean-cookbook'), promptPhrase: 'clean cookbook style, even lighting, minimal styling' },
];
