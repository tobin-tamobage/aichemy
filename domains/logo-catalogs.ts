/**
 * Katalog Logo — dari design/research-logo.md §1-§8 (field catalogs) + plan §1 (verbatim).
 * Semua label English; promptPhrase diambil verbatim dari plan (authoring plan — research
 * memvalidasi, plan menang). Image path mengikuti konvensi spec:
 * 'images/logo/<kategori>/<slug>.webp' (file belum ada → placeholder tile di VisualSelector).
 *
 * Keputusan authoring plan: LOGO_PALETTES membawa hex eksplisit (pola marketing
 * COLOR_PRESETS — checklist script membaca option.hex); LOGO_TECHNIQUES tetap chips
 * tanpa image; LOGO_DESIGNERS 'auto' tanpa image & promptPhrase kosong.
 */

import type { DomainOption } from './types';

const img = (category: string, slug: string) => `images/logo/${category}/${slug}.webp`;

// Plan §1 — tipe logo (field 01). promptPhrase menjelaskan STRUKTUR, bukan sekadar nama.
export interface LogoTypeOption extends DomainOption {
  promptPhrase: string;
}
export const LOGO_TYPES: LogoTypeOption[] = [
  { value: 'wordmark', label: 'Wordmark', image: img('types', 'wordmark'), promptPhrase: 'a wordmark logo built entirely from custom lettering of the brand name, no icon' },
  { value: 'lettermark', label: 'Lettermark', image: img('types', 'lettermark'), promptPhrase: 'a lettermark monogram logo built from the brand initials, interlocking letterforms' },
  { value: 'pictorial', label: 'Pictorial mark', image: img('types', 'pictorial'), promptPhrase: 'a pictorial mark logo with a single, instantly recognizable icon, no text' },
  { value: 'abstract', label: 'Abstract mark', image: img('types', 'abstract'), promptPhrase: 'an abstract mark logo built from interlocking geometric shapes forming a distinctive symbol' },
  { value: 'emblem', label: 'Emblem / badge', image: img('types', 'emblem'), promptPhrase: 'an emblem badge logo with the brand name and icon integrated inside a contained crest shape' },
  { value: 'mascot', label: 'Mascot', image: img('types', 'mascot'), promptPhrase: 'a mascot logo with a friendly character illustration representing the brand' },
  { value: 'combination', label: 'Combination mark', image: img('types', 'combination'), promptPhrase: 'a combination mark logo with the icon on the left and the wordmark beside it, balanced lockup' },
];

// Plan §1 — industri/konteks (field 02).
export interface LogoIndustryOption extends DomainOption {
  promptPhrase: string;
}
export const LOGO_INDUSTRIES: LogoIndustryOption[] = [
  { value: 'tech-saas', label: 'Tech / SaaS', image: img('industries', 'tech-saas'), promptPhrase: 'for a technology startup' },
  { value: 'food-beverage', label: 'Food & beverage', image: img('industries', 'food-beverage'), promptPhrase: 'for a food and beverage brand' },
  { value: 'fashion-beauty', label: 'Fashion & beauty', image: img('industries', 'fashion-beauty'), promptPhrase: 'for a fashion and beauty label' },
  { value: 'finance-legal', label: 'Finance & legal', image: img('industries', 'finance-legal'), promptPhrase: 'for a finance or legal firm' },
  { value: 'health-wellness', label: 'Health & wellness', image: img('industries', 'health-wellness'), promptPhrase: 'for a health and wellness brand' },
  { value: 'sports-fitness', label: 'Sports & fitness', image: img('industries', 'sports-fitness'), promptPhrase: 'for a sports and fitness team' },
  { value: 'creative-studio', label: 'Creative studio', image: img('industries', 'creative-studio'), promptPhrase: 'for a creative studio' },
  { value: 'realestate-construction', label: 'Real estate & construction', image: img('industries', 'realestate-construction'), promptPhrase: 'for a real estate or construction company' },
  { value: 'education', label: 'Education', image: img('industries', 'education'), promptPhrase: 'for an education institution' },
  { value: 'eco-nature', label: 'Eco & nature', image: img('industries', 'eco-nature'), promptPhrase: 'for an eco-friendly nature brand' },
];

// Plan §1 — style axis (field 03). Satu saja; dua style bertabrakan = logo tanpa identitas.
export interface LogoStyleOption extends DomainOption {
  promptPhrase: string;
}
export const LOGO_STYLES: LogoStyleOption[] = [
  { value: 'minimalist', label: 'Minimalist', image: img('styles', 'minimalist'), promptPhrase: 'minimalist, maximum simplicity, generous negative space' },
  { value: 'geometric', label: 'Geometric', image: img('styles', 'geometric'), promptPhrase: 'geometric, constructed from precise circles, squares and triangles' },
  { value: 'monoline', label: 'Monoline', image: img('styles', 'monoline'), promptPhrase: 'monoline, single-weight continuous line work, even stroke' },
  { value: 'vintage-badge', label: 'Vintage badge', image: img('styles', 'vintage-badge'), promptPhrase: 'vintage badge style, retro americana, hand-drawn ornament details' },
  { value: 'hand-drawn', label: 'Hand-drawn', image: img('styles', 'hand-drawn'), promptPhrase: 'hand-drawn, organic imperfect strokes, human warmth' },
  { value: 'gradient-modern', label: 'Modern gradient', image: img('styles', 'gradient-modern'), promptPhrase: 'modern gradient mark, smooth vibrant color transitions' },
  { value: 'negative-space', label: 'Negative space', image: img('styles', 'negative-space'), promptPhrase: 'clever negative space, dual-read imagery hidden in the counterforms' },
  { value: 'bold-flat', label: 'Bold & flat', image: img('styles', 'bold-flat'), promptPhrase: 'bold flat geometric shapes, high-impact, brutalist confidence' },
  { value: 'luxury', label: 'Luxury', image: img('styles', 'luxury'), promptPhrase: 'luxury monoline, thin elegant strokes, high-end boutique feel' },
  { value: 'playful', label: 'Playful', image: img('styles', 'playful'), promptPhrase: 'playful, rounded friendly forms, approachable energy' },
];

// Plan §1 — shape & lockup (field 04).
export interface LogoShapeOption extends DomainOption {
  promptPhrase: string;
}
export const LOGO_SHAPES: LogoShapeOption[] = [
  { value: 'circular-badge', label: 'Circular badge', image: img('shapes', 'circular-badge'), promptPhrase: 'composed inside a circular badge' },
  { value: 'shield', label: 'Shield / crest', image: img('shapes', 'shield'), promptPhrase: 'composed inside a shield crest' },
  { value: 'square-tile', label: 'Square tile', image: img('shapes', 'square-tile'), promptPhrase: 'composed as a square app-icon tile' },
  { value: 'horizontal-lockup', label: 'Horizontal lockup', image: img('shapes', 'horizontal-lockup'), promptPhrase: 'arranged as a horizontal lockup' },
  { value: 'stacked', label: 'Stacked', image: img('shapes', 'stacked'), promptPhrase: 'stacked composition with the icon above the wordmark' },
  { value: 'freeform', label: 'Freeform', image: img('shapes', 'freeform'), promptPhrase: 'freeform composition, no enclosing shape' },
];

// Plan §1 — preset palet (field 05). hex eksplisit per opsi (pola marketing COLOR_PRESETS;
// checklist script membaca option.hex). AI patuh pada hex — tanpa hex warna sembarangan.
export interface LogoPaletteOption extends DomainOption {
  hex: string;
  promptPhrase: string;
}
export const LOGO_PALETTES: LogoPaletteOption[] = [
  { value: 'monochrome-black', label: 'Monochrome black', hex: '#1A1A1A', image: img('palettes', 'monochrome-black'), promptPhrase: 'strictly #1A1A1A black' },
  { value: 'navy-gold', label: 'Navy & gold', hex: '#1F2A44', image: img('palettes', 'navy-gold'), promptPhrase: 'a palette of #1F2A44 navy with #C9A227 gold accents' },
  { value: 'forest-green', label: 'Forest green', hex: '#1F4D2E', image: img('palettes', 'forest-green'), promptPhrase: 'a palette of #1F4D2E forest green with cream accents' },
  { value: 'earth-tones', label: 'Earth tones', hex: '#6B4F2E', image: img('palettes', 'earth-tones'), promptPhrase: 'warm earth tones of #6B4F2E and #D9C7A7' },
  { value: 'pastel', label: 'Pastel', hex: '#F4B6C2', image: img('palettes', 'pastel'), promptPhrase: 'a soft pastel palette, muted and gentle' },
  { value: 'vibrant-bold', label: 'Vibrant bold', hex: '#E63946', image: img('palettes', 'vibrant-bold'), promptPhrase: 'a vibrant bold palette of #E63946 and #1D3557' },
  { value: 'sunset-gradient', label: 'Sunset gradient', hex: '#FF7E5F', image: img('palettes', 'sunset-gradient'), promptPhrase: 'a warm sunset gradient from #FF7E5F to #FEB47B' },
  { value: 'electric-neon', label: 'Electric neon', hex: '#00F5D4', image: img('palettes', 'electric-neon'), promptPhrase: 'electric neon #00F5D4 accents' },
];

// Plan §1 — background (field 05).
export interface LogoBackgroundOption extends DomainOption {
  promptPhrase: string;
}
export const LOGO_BACKGROUNDS: LogoBackgroundOption[] = [
  { value: 'white', label: 'Clean white', image: img('backgrounds', 'white'), promptPhrase: 'on a clean white background' },
  { value: 'flat-neutral', label: 'Flat neutral', image: img('backgrounds', 'flat-neutral'), promptPhrase: 'on a flat light neutral background' },
  { value: 'charcoal', label: 'Dark charcoal', image: img('backgrounds', 'charcoal'), promptPhrase: 'on a dark charcoal #111111 background' },
];

// Plan §1 — gaya lettering (field 06, conditional wordmark/lettermark/combination).
// Gaya lettering, BUKAN nama font brand (riset §3 jebakan #8).
export interface LogoTypestyleOption extends DomainOption {
  promptPhrase: string;
}
export const LOGO_TYPESTYLES: LogoTypestyleOption[] = [
  { value: 'modern-sans', label: 'Modern sans-serif', image: img('typestyles', 'modern-sans'), promptPhrase: 'clean geometric sans-serif lettering' },
  { value: 'serif-classic', label: 'Classic serif', image: img('typestyles', 'serif-classic'), promptPhrase: 'classic serif lettering, heritage and trustworthy' },
  { value: 'script', label: 'Script / hand-lettered', image: img('typestyles', 'script'), promptPhrase: 'flowing hand-lettered script, personal and inviting' },
  { value: 'bold-display', label: 'Bold display', image: img('typestyles', 'bold-display'), promptPhrase: 'bold condensed display lettering, high impact' },
  { value: 'monospace', label: 'Monospace / tech', image: img('typestyles', 'monospace'), promptPhrase: 'monospace technical lettering' },
  { value: 'vintage-slab', label: 'Vintage slab serif', image: img('typestyles', 'vintage-slab'), promptPhrase: 'vintage slab-serif lettering, americana badge style' },
];

// Plan §1 — teknik konstruksi (field 07, chips max 3, tanpa image).
export interface LogoTechniqueOption extends DomainOption {
  promptPhrase: string;
}
export const LOGO_TECHNIQUES: LogoTechniqueOption[] = [
  { value: 'flat-vector', label: 'Flat vector', promptPhrase: 'flat 2D vector style, crisp edges' },
  { value: 'golden-ratio', label: 'Golden-ratio grid', promptPhrase: 'constructed on a golden-ratio grid' },
  { value: 'symmetry', label: 'Perfect symmetry', promptPhrase: 'perfect symmetry' },
  { value: 'single-stroke', label: 'Single-weight stroke', promptPhrase: 'single-weight stroke throughout' },
  { value: 'enclosed-line', label: 'Enclosed line', promptPhrase: 'drawn with one enclosed continuous line' },
  { value: 'letter-integration', label: 'Letter integration', promptPhrase: 'the icon is integrated into the letterforms' },
];

// Plan §1 — gaya desainer legendaris (field 08, opsional + 'auto').
// Shorthand kualitas, sama efektifnya dengan photographer style portrait (riset §8).
export interface LogoDesignerOption extends DomainOption {
  promptPhrase: string;
}
export const LOGO_DESIGNERS: LogoDesignerOption[] = [
  { value: 'auto', label: 'No specific style', promptPhrase: '' },
  { value: 'paul-rand', label: 'Paul Rand', image: img('designers', 'paul-rand'), promptPhrase: 'in the style of Paul Rand: playful modernist simplicity, bold flat shapes, wit' },
  { value: 'saul-bass', label: 'Saul Bass', image: img('designers', 'saul-bass'), promptPhrase: 'in the style of Saul Bass: jagged expressive cut-paper shapes, hand-cut energy' },
  { value: 'massimo-vignelli', label: 'Massimo Vignelli', image: img('designers', 'massimo-vignelli'), promptPhrase: 'in the style of Massimo Vignelli: rigorous grid discipline, timeless restraint' },
  { value: 'chermayeff-geismar', label: 'Chermayeff & Geismar', image: img('designers', 'chermayeff-geismar'), promptPhrase: 'in the style of Chermayeff & Geismar: clean geometric abstraction, instant recognition' },
  { value: 'pentagram', label: 'Pentagram', image: img('designers', 'pentagram'), promptPhrase: 'in the style of Pentagram: contemporary systematic identity design, confident simplicity' },
  { value: 'paula-scher', label: 'Paula Scher', image: img('designers', 'paula-scher'), promptPhrase: 'in the style of Paula Scher: bold expressive typography-driven identity' },
  { value: 'milton-glaser', label: 'Milton Glaser', image: img('designers', 'milton-glaser'), promptPhrase: 'in the style of Milton Glaser: illustrative warmth, psychedelic line work' },
];
