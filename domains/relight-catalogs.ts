/**
 * Katalog Relight — dari design/research-relight.md §4 (field catalogs).
 * Semua label English; promptPhrase diambil dari plan authoring.
 * Image path: 'images/relight/<kategori>/<slug>.webp' (file belum ada → placeholder tile).
 */

import type { DomainOption } from './types';

const img = (category: string, slug: string) => `images/relight/${category}/${slug}.webp`;

// ── Mode ──
export interface RelightModeOption extends DomainOption {
  promptPhrase: string;
  instruction: string;
}
export const RELIGHT_MODES: RelightModeOption[] = [
  { value: 'relight-only', label: 'Relight only', image: img('mode', 'relight-only'), promptPhrase: 'relight only', instruction: 'Relight this photo' },
  { value: 'grade-only', label: 'Colour grade only', image: img('mode', 'grade-only'), promptPhrase: 'colour grade only', instruction: 'Color grade this photo' },
  { value: 'both', label: 'Relight + Grade', image: img('mode', 'both'), promptPhrase: 'relight and colour grade', instruction: 'Relight and color grade this photo' },
];

// ── Light Direction (8) ──
export interface LightDirectionOption extends DomainOption {
  promptPhrase: string;
}
export const LIGHT_DIRECTIONS: LightDirectionOption[] = [
  { value: 'front', label: 'Front', image: img('direction', 'front'), promptPhrase: 'soft frontal light, evenly illuminating the subject from the front' },
  { value: 'left-45', label: 'Left 45°', image: img('direction', 'left-45'), promptPhrase: 'soft light coming from the left at 45 degrees' },
  { value: 'right-45', label: 'Right 45°', image: img('direction', 'right-45'), promptPhrase: 'soft light coming from the right at 45 degrees' },
  { value: 'side-90', label: 'Side 90°', image: img('direction', 'side-90'), promptPhrase: 'dramatic side light at 90 degrees, strong falloff on the shadow side' },
  { value: 'rim-back', label: 'Rim / Back', image: img('direction', 'rim-back'), promptPhrase: 'rim light from behind, creating a glowing edge around the subject' },
  { value: 'top-down', label: 'Top down', image: img('direction', 'top-down'), promptPhrase: 'top-down light, casting soft shadows downward' },
  { value: 'butterfly', label: 'Butterfly', image: img('direction', 'butterfly'), promptPhrase: 'butterfly lighting from above-front, symmetrical shadow under the nose' },
  { value: 'split', label: 'Split', image: img('direction', 'split'), promptPhrase: 'split lighting, half the face lit, half in shadow' },
];

// ── Light Quality (14) — studio + aesthetic medsos ──
export interface LightQualityOption extends DomainOption {
  promptPhrase: string;
}
export const LIGHT_QUALITIES: LightQualityOption[] = [
  { value: 'soft-diffused', label: 'Soft diffused', image: img('quality', 'soft-diffused'), promptPhrase: 'soft, diffused light with gentle falloff and soft shadows' },
  { value: 'hard-directional', label: 'Hard directional', image: img('quality', 'hard-directional'), promptPhrase: 'hard, directional light with crisp shadows and strong contrast' },
  { value: 'volumetric', label: 'Volumetric / God rays', image: img('quality', 'volumetric'), promptPhrase: 'volumetric light with visible god rays and airy haze' },
  { value: 'window-bounced', label: 'Window bounced', image: img('quality', 'window-bounced'), promptPhrase: 'natural window light bounced softly, airy and organic' },
  { value: 'neon-glow', label: 'Neon glow', image: img('quality', 'neon-glow'), promptPhrase: 'glowing neon light with colorful bloom and reflections' },
  { value: 'candle-flicker', label: 'Candle', image: img('quality', 'candle'), promptPhrase: 'warm candlelight with flickering, intimate falloff' },
  { value: 'ring-light', label: 'Ring light (beauty)', image: img('quality', 'ring-light'), promptPhrase: 'ring light beauty lighting, even catchlight in the eyes, soft glam, influencer style' },
  { value: 'beauty-dish', label: 'Beauty dish', image: img('quality', 'beauty-dish'), promptPhrase: 'beauty dish lighting, soft but sculpted, fashion beauty with round catchlight' },
  { value: 'fairy-bokeh', label: 'Fairy lights bokeh', image: img('quality', 'fairy-bokeh'), promptPhrase: 'fairy lights bokeh, warm tiny points of light in the background, dreamy' },
  { value: 'sunset-silhouette', label: 'Sunset silhouette', image: img('quality', 'sunset-silhouette'), promptPhrase: 'sunset silhouette lighting, warm backlight outlining the subject, rim glow' },
  { value: 'overcast-soft', label: 'Overcast soft (cloudy)', image: img('quality', 'overcast-soft'), promptPhrase: 'soft overcast light on a cloudy day, even and flattering, no harsh shadows' },
  { value: 'studio-strobe', label: 'Studio strobe', image: img('quality', 'studio-strobe'), promptPhrase: 'studio strobe lighting, crisp and punchy, clean commercial look' },
  { value: 'led-strip', label: 'LED strip', image: img('quality', 'led-strip'), promptPhrase: 'LED strip accent light, colorful linear glow on the wall behind' },
  { value: 'sun-flare', label: 'Sun flare / Lens flare', image: img('quality', 'sun-flare'), promptPhrase: 'warm sun flare with lens flare streaks, golden haze leaking into the frame' },
];

// ── Light Color (12) ──
export interface LightColorOption extends DomainOption {
  promptPhrase: string;
  kelvin?: string;
}
export const LIGHT_COLORS: LightColorOption[] = [
  { value: 'neutral-5600', label: 'Neutral 5600K', image: img('color', 'neutral-5600'), promptPhrase: 'neutral daylight, 5600K, true color', kelvin: '5600K' },
  { value: 'warm-golden', label: 'Warm golden hour', image: img('color', 'warm-golden'), promptPhrase: 'warm golden hour light, 3200K, honey-orange highlights', kelvin: '3200K' },
  { value: 'cool-blue', label: 'Cool blue hour', image: img('color', 'cool-blue'), promptPhrase: 'cool blue hour light, 7500K, soft cyan-blue tones', kelvin: '7500K' },
  { value: 'tungsten-3200', label: 'Tungsten 3200K', image: img('color', 'tungsten-3200'), promptPhrase: 'warm tungsten light, 3200K, amber glow', kelvin: '3200K' },
  { value: 'teal-gel', label: 'Teal gel', image: img('color', 'teal-gel'), promptPhrase: 'teal color gel on the light, cool cyan accent' },
  { value: 'magenta-gel', label: 'Magenta gel', image: img('color', 'magenta-gel'), promptPhrase: 'magenta color gel on the light, pink-purple accent' },
  { value: 'mixed-neon', label: 'Mixed neon (teal+magenta)', image: img('color', 'mixed-neon'), promptPhrase: 'mixed neon gels — teal and magenta light mixing on the subject' },
  { value: 'candlelight', label: 'Candlelight', image: img('color', 'candlelight'), promptPhrase: 'candlelight color, warm 1800K, soft amber-orange' },
  { value: 'sunrise-pink', label: 'Sunrise pink', image: img('color', 'sunrise-pink'), promptPhrase: 'soft sunrise pink light, pastel pink-orange glow, dreamy morning haze' },
  { value: 'pastel-mint', label: 'Pastel mint', image: img('color', 'pastel-mint'), promptPhrase: 'pastel mint light, soft green-cyan tint, fresh airy feel' },
  { value: 'lavender-haze', label: 'Lavender haze', image: img('color', 'lavender-haze'), promptPhrase: 'lavender haze light, soft purple glow, ethereal' },
  { value: 'amber-sunset', label: 'Amber sunset', image: img('color', 'amber-sunset'), promptPhrase: 'deep amber sunset light, rich orange-red warmth, long shadows' },
];

// ── Intensity (5) ──
export interface IntensityOption extends DomainOption {
  promptPhrase: string;
}
export const INTENSITIES: IntensityOption[] = [
  { value: 'flat', label: 'Flat / Even', image: img('intensity', 'flat'), promptPhrase: 'flat, even lighting with minimal shadows, low contrast' },
  { value: 'natural', label: 'Natural', image: img('intensity', 'natural'), promptPhrase: 'natural lighting intensity with balanced, soft shadows' },
  { value: 'dramatic', label: 'Dramatic', image: img('intensity', 'dramatic'), promptPhrase: 'dramatic lighting with pronounced shadows and highlight sculpting' },
  { value: 'chiaroscuro', label: 'Chiaroscuro / High contrast', image: img('intensity', 'chiaroscuro'), promptPhrase: 'high-contrast chiaroscuro, deep shadows and bright highlights' },
  { value: 'low-key', label: 'Low-key moody', image: img('intensity', 'low-key'), promptPhrase: 'low-key moody lighting, mostly shadows with a single key light' },
];

// ── Environment (12) ──
export interface EnvironmentOption extends DomainOption {
  promptPhrase: string;
}
export const ENVIRONMENTS: EnvironmentOption[] = [
  { value: 'studio-seamless', label: 'Studio seamless', image: img('environment', 'studio-seamless'), promptPhrase: 'clean studio environment with controlled bounce' },
  { value: 'window-natural', label: 'Window natural', image: img('environment', 'window-natural'), promptPhrase: 'bright interior with large window, natural bounce and soft reflections' },
  { value: 'overcast-outdoor', label: 'Overcast outdoor', image: img('environment', 'overcast-outdoor'), promptPhrase: 'soft overcast outdoor light, diffused sky bounce' },
  { value: 'neon-city', label: 'Neon city night', image: img('environment', 'neon-city'), promptPhrase: 'neon-lit city street at night, colorful reflections and glow' },
  { value: 'forest-canopy', label: 'Forest canopy', image: img('environment', 'forest-canopy'), promptPhrase: 'forest canopy with dappled light filtering through leaves' },
  { value: 'luxury-interior', label: 'Luxury interior', image: img('environment', 'luxury-interior'), promptPhrase: 'luxury interior with warm ambient bounce and soft specular highlights' },
  { value: 'cafe-window', label: 'Cafe window', image: img('environment', 'cafe-window'), promptPhrase: 'cozy cafe window light, warm wood tones, latte aesthetic' },
  { value: 'rooftop-sunset', label: 'Rooftop sunset', image: img('environment', 'rooftop-sunset'), promptPhrase: 'rooftop at sunset, open sky, warm gradient horizon, city silhouette' },
  { value: 'beach-golden', label: 'Beach golden hour', image: img('environment', 'beach-golden'), promptPhrase: 'beach at golden hour, sand reflecting warm light, open horizon' },
  { value: 'bedroom-fairy', label: 'Bedroom fairy lights', image: img('environment', 'bedroom-fairy'), promptPhrase: 'bedroom with fairy lights, cozy bokeh, soft intimate glow' },
  { value: 'street-night', label: 'Street night (wet)', image: img('environment', 'street-night'), promptPhrase: 'wet street at night, reflections on pavement, moody urban glow' },
  { value: 'minimal-white', label: 'Minimal white', image: img('environment', 'minimal-white'), promptPhrase: 'minimal all-white room, clean high-key bounce, airy scandinavian' },
];

// ── Aesthetic Preset (12) — 1-klik viral ──
export interface AestheticPresetOption extends DomainOption {
  promptPhrase: string;
}
export const AESTHETIC_PRESETS: AestheticPresetOption[] = [
  { value: 'none', label: 'No preset (custom)', image: img('aesthetic', 'none'), promptPhrase: '' },
  { value: 'clean-girl', label: 'Clean Girl', image: img('aesthetic', 'clean-girl'), promptPhrase: 'clean girl aesthetic — soft natural light, neutral tones, minimal, fresh skin, airy' },
  { value: 'golden-hour', label: 'Golden Hour Glow', image: img('aesthetic', 'golden-hour'), promptPhrase: 'golden hour glow — warm honey light, soft rim, sun-kissed skin, dreamy haze' },
  { value: 'blue-hour', label: 'Blue Hour Moody', image: img('aesthetic', 'blue-hour'), promptPhrase: 'blue hour moody — cool cyan-blue, cinematic shadows, twilight melancholy' },
  { value: 'neon-tokyo', label: 'Neon Tokyo', image: img('aesthetic', 'neon-tokyo'), promptPhrase: 'neon Tokyo — teal and magenta neon, wet reflections, cyber city vibe' },
  { value: 'soft-girl', label: 'Soft Girl Pastel', image: img('aesthetic', 'soft-girl'), promptPhrase: 'soft girl pastel — pink-lavender haze, fairy bokeh, dreamy soft focus' },
  { value: 'dark-academia', label: 'Dark Academia', image: img('aesthetic', 'dark-academia'), promptPhrase: 'dark academia — warm tungsten, low-key, amber library glow, moody shadows' },
  { value: 'coquette', label: 'Coquette', image: img('aesthetic', 'coquette'), promptPhrase: 'coquette — warm candlelight, soft pink, lace bokeh, romantic' },
  { value: 'streetwear', label: 'Streetwear Flash', image: img('aesthetic', 'streetwear'), promptPhrase: 'streetwear flash — hard direct flash, high contrast, urban night, paparazzi look' },
  { value: 'y2k', label: 'Y2K Haze', image: img('aesthetic', 'y2k'), promptPhrase: 'Y2K haze — glossy, slightly overexposed, cool flash with pastel tint' },
  { value: 'film-nostalgia', label: 'Film Nostalgia', image: img('aesthetic', 'film-nostalgia'), promptPhrase: 'film nostalgia — faded grain, warm vintage fade, soft halation, 90s film' },
  { value: 'scandi-minimal', label: 'Scandi Minimal', image: img('aesthetic', 'scandi-minimal'), promptPhrase: 'scandi minimal — overcast soft, neutral white, clean airy, muted palette' },
];

// ── Colour Grade (10) ──
export interface ColorGradeOption extends DomainOption {
  promptPhrase: string;
}
export const COLOR_GRADES: ColorGradeOption[] = [
  { value: 'none-natural', label: 'Natural (no LUT)', image: img('grade', 'none-natural'), promptPhrase: '' },
  { value: 'portra-400', label: 'Kodak Portra 400', image: img('grade', 'portra-400'), promptPhrase: 'Kodak Portra 400 film emulation, warm highlights, muted teal shadows, subtle grain' },
  { value: 'cinestill-800t', label: 'Cinestill 800T', image: img('grade', 'cinestill-800t'), promptPhrase: 'Cinestill 800T film emulation, tungsten-balanced, halation glow, cool shadows' },
  { value: 'eterna', label: 'Fujifilm Eterna', image: img('grade', 'eterna'), promptPhrase: 'Fujifilm Eterna film emulation, muted saturation, soft highlight rolloff' },
  { value: 'teal-orange', label: 'Teal & Orange', image: img('grade', 'teal-orange'), promptPhrase: 'teal and orange blockbuster grade, warm skin, teal shadows' },
  { value: 'bleach-bypass', label: 'Bleach bypass', image: img('grade', 'bleach-bypass'), promptPhrase: 'bleach bypass grade, high contrast, desaturated, gritty silver retention' },
  { value: 'vintage-faded', label: 'Vintage faded', image: img('grade', 'vintage-faded'), promptPhrase: 'vintage faded grade, lifted blacks, warm fade, slightly desaturated' },
  { value: 'cyberpunk', label: 'Cyberpunk', image: img('grade', 'cyberpunk'), promptPhrase: 'cyberpunk grade, neon magenta-cyan palette, crushed blacks, high saturation, subtle bloom' },
  { value: 'wes-anderson', label: 'Wes Anderson pastel', image: img('grade', 'wes-anderson'), promptPhrase: 'Wes Anderson pastel palette, symmetrical pastels, warm beige and mint, playful' },
  { value: 'noir', label: 'Noir', image: img('grade', 'noir'), promptPhrase: 'noir grade, high-contrast black and white with a single subtle color accent, moody' },
];

export const GRADE_STRENGTHS: DomainOption[] = [
  { value: 'subtle', label: 'Subtle' },
  { value: 'medium', label: 'Medium' },
  { value: 'strong', label: 'Strong' },
  { value: 'extreme', label: 'Extreme' },
];

export const PRESERVATION_OPTIONS: DomainOption[] = [
  { value: 'identity', label: 'Keep face identity' },
  { value: 'skin', label: 'Keep skin texture' },
  { value: 'clothing', label: 'Keep clothing' },
  { value: 'pose', label: 'Keep pose' },
  { value: 'background', label: 'Keep background' },
];

export const BACKGROUND_MODES: DomainOption[] = [
  { value: 'keep', label: 'Keep unchanged', image: img('bg-mode', 'keep') },
  { value: 'relight', label: 'Relight consistently', image: img('bg-mode', 'relight') },
  { value: 'replace', label: 'Replace with environment', image: img('bg-mode', 'replace') },
];
