/**
 * Katalog Portrait — dari design/research-portrait.md §2 (field catalogs) + plan Task 1 Step 1.
 * Semua label English; promptPhrase diambil verbatim dari plan (authoring plan — research
 * memvalidasi, plan menang). Image path mengikuti konvensi spec:
 * 'images/portrait/<kategori>/<slug>.webp' (file belum ada → placeholder tile di VisualSelector).
 */

import type { DomainOption } from './types';

const img = (category: string, slug: string) => `images/portrait/${category}/${slug}.webp`;

// Plan Task 1 Step 1 Field 1 — jenis potret/deliverable (select).
export interface PortraitTypeOption extends DomainOption {
  promptPhrase: string;
}
export const PORTRAIT_TYPES: PortraitTypeOption[] = [
  { value: 'corporate-headshot', label: 'Corporate headshot', image: img('portrait-types', 'corporate-headshot'), promptPhrase: 'a corporate headshot' },
  { value: 'linkedin-headshot', label: 'LinkedIn headshot', image: img('portrait-types', 'linkedin-headshot'), promptPhrase: 'a professional LinkedIn headshot' },
  { value: 'actor-headshot', label: 'Actor headshot', image: img('portrait-types', 'actor-headshot'), promptPhrase: 'an actor headshot' },
  { value: 'editorial-portrait', label: 'Editorial portrait', image: img('portrait-types', 'editorial-portrait'), promptPhrase: 'an editorial portrait' },
  { value: 'stylized-avatar', label: 'Stylized avatar', image: img('portrait-types', 'stylized-avatar'), promptPhrase: 'a stylized digital avatar' },
];

// Plan Task 1 Step 1 Field 2 — skema pencahayaan (select).
export interface LightingOption extends DomainOption {
  promptPhrase: string;
}
export const PORTRAIT_LIGHTING: LightingOption[] = [
  { value: 'rembrandt', label: 'Rembrandt', image: img('lighting', 'rembrandt'), promptPhrase: 'Rembrandt lighting with a soft triangle of light on the shadowed cheek' },
  { value: 'butterfly', label: 'Butterfly', image: img('lighting', 'butterfly'), promptPhrase: 'butterfly lighting with a symmetrical shadow under the nose' },
  { value: 'loop', label: 'Loop', image: img('lighting', 'loop'), promptPhrase: 'loop lighting with a small nose shadow toward the cheek' },
  { value: 'split', label: 'Split', image: img('lighting', 'split'), promptPhrase: 'split lighting, half the face lit, half in shadow' },
  { value: 'softbox-flat', label: 'Softbox (flat)', image: img('lighting', 'softbox-flat'), promptPhrase: 'even, shadowless softbox lighting' },
  { value: 'window-natural', label: 'Window (natural)', image: img('lighting', 'window-natural'), promptPhrase: 'soft natural window light from the side' },
];

// Plan Task 1 Step 1 Field 3 — latar belakang (select).
export interface BackgroundOption extends DomainOption {
  promptPhrase: string;
}
export const PORTRAIT_BACKGROUNDS: BackgroundOption[] = [
  { value: 'seamless-studio', label: 'Seamless studio', image: img('backgrounds', 'seamless-studio'), promptPhrase: 'a clean seamless studio backdrop' },
  { value: 'neutral-office', label: 'Blurred office', image: img('backgrounds', 'neutral-office'), promptPhrase: 'a softly blurred modern office background' },
  { value: 'city-bokeh', label: 'City bokeh', image: img('backgrounds', 'city-bokeh'), promptPhrase: 'a blurred city bokeh background' },
  { value: 'outdoor-park', label: 'Outdoor park', image: img('backgrounds', 'outdoor-park'), promptPhrase: 'a softly blurred outdoor park background' },
  { value: 'plain-color', label: 'Plain color', image: img('backgrounds', 'plain-color'), promptPhrase: 'a plain solid color backdrop' },
];

// Plan Task 1 Step 1 Field 4 — wardrobe (select).
export interface WardrobeOption extends DomainOption {
  promptPhrase: string;
}
export const PORTRAIT_WARDROBE: WardrobeOption[] = [
  { value: 'formal-suit', label: 'Formal suit', image: img('wardrobe', 'formal-suit'), promptPhrase: 'a formal suit' },
  { value: 'business-casual', label: 'Business casual', image: img('wardrobe', 'business-casual'), promptPhrase: 'business casual attire' },
  { value: 'smart-casual', label: 'Smart casual', image: img('wardrobe', 'smart-casual'), promptPhrase: 'a smart casual outfit' },
  { value: 'casual', label: 'Casual', image: img('wardrobe', 'casual'), promptPhrase: 'casual everyday clothing' },
];

// Plan Task 1 Step 1 Field 5 — ekspresi (select).
export interface ExpressionOption extends DomainOption {
  promptPhrase: string;
}
export const PORTRAIT_EXPRESSIONS: ExpressionOption[] = [
  { value: 'confident-smile', label: 'Confident smile', image: img('expressions', 'confident-smile'), promptPhrase: 'a confident smile' },
  { value: 'subtle-smile', label: 'Subtle smile', image: img('expressions', 'subtle-smile'), promptPhrase: 'a subtle, natural smile' },
  { value: 'neutral', label: 'Neutral', image: img('expressions', 'neutral'), promptPhrase: 'a neutral, relaxed expression' },
  { value: 'intense', label: 'Intense', image: img('expressions', 'intense'), promptPhrase: 'an intense, dramatic expression' },
];

// Plan Task 1 Step 1 Field 6 — lens & framing (select).
export interface LensOption extends DomainOption {
  promptPhrase: string;
}
export const PORTRAIT_LENSES: LensOption[] = [
  { value: '85mm-closeup', label: '85mm close-up', image: img('lenses', '85mm-closeup'), promptPhrase: 'an 85mm lens, head-and-shoulders framing' },
  { value: '50mm-half', label: '50mm half-body', image: img('lenses', '50mm-half'), promptPhrase: 'a 50mm lens, half-body framing' },
  { value: '35mm-environmental', label: '35mm environmental', image: img('lenses', '35mm-environmental'), promptPhrase: 'a 35mm lens, environmental framing with context around the subject' },
  { value: '200mm-tight', label: '200mm tight', image: img('lenses', '200mm-tight'), promptPhrase: 'a 200mm telephoto lens, tight face framing' },
];

// Phase 6 Task 1 — camera body (select).
export interface CameraOption extends DomainOption { promptPhrase: string; }
export const PORTRAIT_CAMERAS: CameraOption[] = [
  { value: 'sony-a7rv', label: 'Sony A7R V', promptPhrase: 'Sony A7R V, 61MP full-frame mirrorless' },
  { value: 'canon-r5', label: 'Canon EOS R5', promptPhrase: 'Canon EOS R5, 45MP full-frame mirrorless' },
  { value: 'nikon-z8', label: 'Nikon Z8', promptPhrase: 'Nikon Z8, 45MP stacked full-frame' },
  { value: 'fuji-gfx100ii', label: 'Fujifilm GFX 100 II', promptPhrase: 'Fujifilm GFX 100 II, 102MP medium format' },
  { value: 'hasselblad-x2d', label: 'Hasselblad X2D 100C', promptPhrase: 'Hasselblad X2D 100C, 100MP medium format' },
  { value: 'leica-sl3', label: 'Leica SL3', promptPhrase: 'Leica SL3, 60MP full-frame' },
];

// Phase 6 Task 1 — photographer style (select). 'auto' = no clause.
export interface PhotographerOption extends DomainOption { promptPhrase: string; }
export const PORTRAIT_PHOTOGRAPHERS: PhotographerOption[] = [
  { value: 'auto', label: 'No specific style', promptPhrase: '' },
  { value: 'annie-leibovitz', label: 'Annie Leibovitz', promptPhrase: 'in the style of Annie Leibovitz, dramatic painterly lighting, conceptual editorial portrait' },
  { value: 'peter-lindbergh', label: 'Peter Lindbergh', promptPhrase: 'in the style of Peter Lindbergh, raw black-and-white realism, natural unretouched beauty' },
  { value: 'platon', label: 'Platon', promptPhrase: 'in the style of Platon, tight framing, intense direct gaze, powerful simplicity' },
  { value: 'richard-avedon', label: 'Richard Avedon', promptPhrase: 'in the style of Richard Avedon, stark white background, psychological intensity, sharp detail' },
  { value: 'steve-mccurry', label: 'Steve McCurry', promptPhrase: 'in the style of Steve McCurry, vivid color, soulful environmental storytelling' },
  { value: 'rankin', label: 'Rankin', promptPhrase: 'in the style of Rankin, bold glossy fashion lighting, high-contrast beauty' },
];
