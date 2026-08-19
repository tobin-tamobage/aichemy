import type { DomainOption } from './types';

/**
 * Katalog ID Photo — dari design/research-pasfoto.md §2.
 * Semua label English; hint Indonesia-convention sesuai riset §4.
 * Image path mengikuti konvensi spec §5: 'images/id-photo/<kategori>/<slug>.webp'
 * (file belum ada → placeholder tile di VisualSelector).
 */

const img = (category: string, slug: string) => `images/id-photo/${category}/${slug}.webp`;

// Riset §2 Seksi B — purpose dropdown
export const PURPOSES: DomainOption[] = [
  { value: 'job-application', label: 'Job Application (CV)', image: img('purposes', 'job-application') },
  { value: 'linkedin', label: 'LinkedIn / Professional Profile', image: img('purposes', 'linkedin') },
  { value: 'passport-visa', label: 'Passport / Visa', image: img('purposes', 'passport-visa') },
  { value: 'official-id', label: 'Official ID (KTP/SIM/SKCK)', image: img('purposes', 'official-id') },
  { value: 'academic', label: 'Academic / Campus', image: img('purposes', 'academic') },
  { value: 'corporate-badge', label: 'Corporate Badge', image: img('purposes', 'corporate-badge') },
  { value: 'other', label: 'Other', image: img('purposes', 'other') },
];

// Riset §2 Seksi B + tabel rasio §1 — country standard dengan default background + size + ratio
export interface CountryOption extends DomainOption {
  defaultBackground: string;
  defaultSize: string;
  ratio: string;
}
export const COUNTRIES: CountryOption[] = [
  { value: 'indonesia', label: 'Indonesia', image: img('countries', 'indonesia'), defaultBackground: 'red', defaultSize: '3x4', ratio: '3:4' },
  { value: 'us', label: 'United States (2×2 in)', image: img('countries', 'us'), defaultBackground: 'white', defaultSize: '2x2in', ratio: '1:1' },
  { value: 'schengen', label: 'Schengen / EU (35×45 mm)', image: img('countries', 'schengen'), defaultBackground: 'white', defaultSize: '35x45', ratio: '7:9' },
  { value: 'uk', label: 'United Kingdom', image: img('countries', 'uk'), defaultBackground: 'light-grey', defaultSize: '35x45', ratio: '7:9' },
  { value: 'japan', label: 'Japan', image: img('countries', 'japan'), defaultBackground: 'white', defaultSize: '35x45', ratio: '7:9' },
  { value: 'india', label: 'India', image: img('countries', 'india'), defaultBackground: 'white', defaultSize: '2x2in', ratio: '1:1' },
  { value: 'international', label: 'General International', image: img('countries', 'international'), defaultBackground: 'white', defaultSize: '35x45', ratio: '7:9' },
];

// Riset §1 tabel rasio per ukuran cetak
export interface PrintSizeOption extends DomainOption {
  ratio: string;
}
export const PRINT_SIZES: PrintSizeOption[] = [
  { value: '2x3', label: '2×3 cm', image: img('sizes', '2x3'), ratio: '2:3', hint: 'Supporting documents, archives' },
  { value: '3x4', label: '3×4 cm', image: img('sizes', '3x4'), ratio: '3:4', hint: 'Job applications, diplomas, SKCK' },
  { value: '4x6', label: '4×6 cm', image: img('sizes', '4x6'), ratio: '2:3', hint: 'Job applications (most recommended), official documents' },
  { value: '2x2in', label: '2×2 in (51×51 mm)', image: img('sizes', '2x2in'), ratio: '1:1', hint: 'US/India visa, US passport' },
  { value: '35x45', label: '35×45 mm', image: img('sizes', '35x45'), ratio: '7:9', hint: 'Schengen/UK visa' },
  { value: '50x70', label: '50×70 mm', image: img('sizes', '50x70'), ratio: '5:7', hint: 'Canadian passport' },
];

// Riset §2 Seksi C — hex dari riset: merah deep #C8102E (bukan #FF0000), biru medium #1E6FD9 (hindari navy/cyan)
export interface BackgroundOption extends DomainOption {
  hex: string;
  promptColor: string; // frasa warna untuk prompt
}
export const BACKGROUNDS: BackgroundOption[] = [
  {
    value: 'red', label: 'Red', image: img('backgrounds', 'red'),
    hex: '#C8102E', promptColor: 'solid deep red studio backdrop (#C8102E)',
    hint: 'Indonesian convention: odd birth year (1987, 1991, 2001…)',
  },
  {
    value: 'blue', label: 'Blue', image: img('backgrounds', 'blue'),
    hex: '#1E6FD9', promptColor: 'solid medium blue studio backdrop (#1E6FD9)',
    hint: 'Indonesian convention: even birth year (1988, 1992, 2000…)',
  },
  {
    value: 'white', label: 'White', image: img('backgrounds', 'white'),
    hex: '#FFFFFF', promptColor: 'plain pure white background (#FFFFFF)',
    hint: 'Passport, US/Schengen visa, international documents',
  },
  {
    value: 'light-grey', label: 'Light Grey', image: img('backgrounds', 'light-grey'),
    hex: '#D3D3D3', promptColor: 'solid light grey studio backdrop (#D3D3D3)',
    hint: 'Corporate / LinkedIn',
  },
  {
    value: 'light-blue', label: 'Light Blue', image: img('backgrounds', 'light-blue'),
    hex: '#A8C8E8', promptColor: 'solid light blue studio backdrop (#A8C8E8)',
    hint: 'Academic / children variant',
  },
];

// Riset §2 Seksi D — promptPhrase spesifik (hindari "formal clothes" generik, jebakan #10)
export interface OutfitOption extends DomainOption {
  promptPhrase: string;
  /** true bila outfit ini rawan menyatu dengan latar putih (jebakan #7 kontras) */
  whiteRisk?: boolean;
}
export const OUTFITS: OutfitOption[] = [
  { value: 'white-shirt', label: 'White dress shirt', image: img('outfits', 'white-shirt'), promptPhrase: 'a crisp white long-sleeved formal dress shirt', whiteRisk: true },
  { value: 'shirt-black-blazer', label: 'Shirt + black blazer', image: img('outfits', 'shirt-black-blazer'), promptPhrase: 'a crisp white long-sleeved formal shirt with a black formal suit jacket' },
  { value: 'shirt-navy-blazer', label: 'Shirt + navy blazer', image: img('outfits', 'shirt-navy-blazer'), promptPhrase: 'a tailored navy blue blazer over a white dress shirt' },
  { value: 'shirt-charcoal-blazer', label: 'Shirt + charcoal blazer', image: img('outfits', 'shirt-charcoal-blazer'), promptPhrase: 'a crisp white dress shirt with a charcoal grey blazer' },
  { value: 'batik', label: 'Long-sleeve batik shirt', image: img('outfits', 'batik'), promptPhrase: 'a neat long-sleeved batik shirt (formal Indonesian civil servant style)' },
  { value: 'blouse', label: 'Blouse', image: img('outfits', 'blouse'), promptPhrase: 'a modest white formal blouse', whiteRisk: true },
  { value: 'suit-tie', label: 'Suit + tie', image: img('outfits', 'suit-tie'), promptPhrase: 'a full formal suit with a solid navy tie' },
  { value: 'polo', label: 'Polo shirt', image: img('outfits', 'polo'), promptPhrase: 'a neat collared polo shirt (smart casual)' },
];

// Riset §2 Seksi E
export const EXPRESSIONS: DomainOption[] = [
  { value: 'neutral', label: 'Neutral (official)', image: img('expressions', 'neutral'), hint: 'Required for official documents' },
  { value: 'soft-smile', label: 'Soft smile (CV/LinkedIn)', image: img('expressions', 'soft-smile'), hint: 'Subtle professional smile' },
];

export const FRAMINGS: DomainOption[] = [
  { value: 'head-and-shoulders', label: 'Head and shoulders (face fills 70–80% of frame)', image: img('framings', 'head-and-shoulders'), hint: 'Biometric standard' },
  { value: 'chest-up', label: 'Chest-up', image: img('framings', 'chest-up') },
  { value: 'half-body', label: 'Half body', image: img('framings', 'half-body'), hint: 'Common for 4×6 job applications' },
];
