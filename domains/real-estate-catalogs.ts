/**
 * Katalog Real Estate — dari design/research-realestate.md §2 (field catalogs) + plan Task 1 Step 2.
 * Semua label English; promptPhrase diambil verbatim dari plan (authoring plan — research
 * memvalidasi, plan menang). Image path mengikuti konvensi spec:
 * 'images/real-estate/<kategori>/<slug>.webp' (file belum ada → placeholder tile di VisualSelector).
 */

import type { DomainOption } from './types';

const img = (category: string, slug: string) => `images/real-estate/${category}/${slug}.webp`;

// Plan Task 1 Step 2 Field 1 — scene (visual).
export interface ReSceneOption extends DomainOption {
  promptPhrase: string;
}
export const RE_SCENES: ReSceneOption[] = [
  { value: 'living-room', label: 'Living room', image: img('scenes', 'living-room'), promptPhrase: 'a spacious living room' },
  { value: 'bedroom', label: 'Bedroom', image: img('scenes', 'bedroom'), promptPhrase: 'a cozy bedroom' },
  { value: 'kitchen', label: 'Kitchen', image: img('scenes', 'kitchen'), promptPhrase: 'a modern kitchen' },
  { value: 'dining-room', label: 'Dining room', image: img('scenes', 'dining-room'), promptPhrase: 'an inviting dining room' },
  { value: 'bathroom', label: 'Bathroom', image: img('scenes', 'bathroom'), promptPhrase: 'a clean bathroom' },
  { value: 'exterior-front', label: 'Exterior — front', image: img('scenes', 'exterior-front'), promptPhrase: 'the front exterior of a house' },
  { value: 'exterior-garden', label: 'Exterior — garden', image: img('scenes', 'exterior-garden'), promptPhrase: 'a house with a landscaped garden' },
];

// Plan Task 1 Step 2 Field 2 — gaya desain (visual).
export interface ReStyleOption extends DomainOption {
  promptPhrase: string;
}
export const RE_STYLES: ReStyleOption[] = [
  { value: 'scandinavian', label: 'Scandinavian', image: img('styles', 'scandinavian'), promptPhrase: 'Scandinavian minimalism, light woods, clean lines' },
  { value: 'japandi', label: 'Japandi', image: img('styles', 'japandi'), promptPhrase: 'Japandi style, warm minimalism, natural textures, low furniture' },
  { value: 'industrial', label: 'Industrial', image: img('styles', 'industrial'), promptPhrase: 'industrial style, exposed brick, metal accents, raw materials' },
  { value: 'mid-century', label: 'Mid-century', image: img('styles', 'mid-century'), promptPhrase: 'mid-century modern, walnut tones, tapered legs, retro curves' },
  { value: 'coastal', label: 'Coastal', image: img('styles', 'coastal'), promptPhrase: 'coastal style, white and blue palette, linen textures, airy' },
  { value: 'modern-farmhouse', label: 'Modern farmhouse', image: img('styles', 'modern-farmhouse'), promptPhrase: 'modern farmhouse, shiplap, rustic wood, neutral tones' },
];

// Plan Task 1 Step 2 Field 3 — waktu/cahaya (visual).
export interface ReTimeOption extends DomainOption {
  promptPhrase: string;
}
export const RE_TIMES: ReTimeOption[] = [
  { value: 'morning-natural', label: 'Morning (natural)', image: img('times-of-day', 'morning-natural'), promptPhrase: 'bright natural morning light' },
  { value: 'golden-hour', label: 'Golden hour', image: img('times-of-day', 'golden-hour'), promptPhrase: 'warm golden-hour sunlight' },
  { value: 'evening-warm', label: 'Evening (warm)', image: img('times-of-day', 'evening-warm'), promptPhrase: 'warm interior lighting in the evening' },
  { value: 'twilight', label: 'Twilight', image: img('times-of-day', 'twilight'), promptPhrase: 'twilight with interior lights glowing' },
];

// Plan Task 1 Step 2 Field 4 — staging (visual).
export interface ReStagingOption extends DomainOption {
  promptPhrase: string;
}
export const RE_STAGING: ReStagingOption[] = [
  { value: 'furnished-styled', label: 'Furnished & styled', image: img('stagings', 'furnished-styled'), promptPhrase: 'professionally staged with tasteful furniture and decor' },
  { value: 'virtual-staging', label: 'Virtual staging', image: img('stagings', 'virtual-staging'), promptPhrase: 'virtually staged with realistic, properly scaled furniture' },
  { value: 'partial-staging', label: 'Minimal staging', image: img('stagings', 'partial-staging'), promptPhrase: 'minimal staging with a few key furniture pieces' },
  { value: 'empty', label: 'Empty', image: img('stagings', 'empty'), promptPhrase: 'completely empty, clean, ready for inspection' },
];

// Plan Task 1 Step 2 Field 5 — angle & lens (visual).
export interface ReAngleOption extends DomainOption {
  promptPhrase: string;
}
export const RE_ANGLES: ReAngleOption[] = [
  { value: 'wide-16mm', label: '16mm ultra-wide', image: img('angles', 'wide-16mm'), promptPhrase: 'a 16mm wide-angle lens, full-room view' },
  { value: 'wide-24mm', label: '24mm wide', image: img('angles', 'wide-24mm'), promptPhrase: 'a 24mm wide-angle lens, natural perspective' },
  { value: 'eye-level', label: 'Eye level', image: img('angles', 'eye-level'), promptPhrase: 'eye-level composition' },
  { value: 'low-angle', label: 'Low angle', image: img('angles', 'low-angle'), promptPhrase: 'a low angle looking slightly upward' },
  { value: 'corner-view', label: 'Corner view', image: img('angles', 'corner-view'), promptPhrase: 'a corner view showing two walls' },
  { value: 'tilt-shift-24mm', label: '24mm tilt-shift', image: '/images/lenses/tilt-shift-lens.webp', promptPhrase: 'a 24mm tilt-shift lens, perspective-corrected, verticals perfectly straight' },
];

// Phase 6 Task 2 — camera & technique (visual). Sentence clause.
export interface ReCameraOption extends DomainOption { promptPhrase: string; }
export const RE_CAMERAS: ReCameraOption[] = [
  { value: 'full-frame', label: 'Full-frame mirrorless', image: '/images/cameras/canon-eos-5d.webp', promptPhrase: 'shot on a full-frame mirrorless camera, high resolution' },
  { value: 'hdr-blend', label: 'HDR exposure blend', image: img('technique', 'hdr-bracketing'), promptPhrase: 'HDR exposure blend, balanced interior and window light' },
  { value: 'drone', label: 'Drone aerial', image: img('technique', 'drone-aerial'), promptPhrase: 'aerial drone photograph, elevated perspective' },
];
