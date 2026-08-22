/**
 * Katalog Marketing — dari design/research-marketing.md §2 (field catalogs) + §3 (contoh prompt).
 * Semua label English; promptPhrase/descriptor/clause diturunkan dari deskripsi role riset
 * (bahasa Indonesia → frasa prompt English) dan konvensi contoh prompt §3.
 * Hex warna TIDAK ada di doc riset → authored (lihat komentar inline di COLOR_PRESETS).
 * Image path mengikuti konvensi spec §5: 'images/marketing/<kategori>/<slug>.webp'
 * (file belum ada → placeholder tile di VisualSelector).
 * Spesifikasi (spec §3.4) MENANG atas riset pada konflik list membership:
 * CONTENT_TYPES = 8 opsi persis enumerasi spec §3.4 section 1 (plan mengannotasi "7"
 * tapi enumerasi plan & spec sama-sama 8 — ikut enumerasi eksplisit); opsi riset-only
 * (X header 3:1, Y2K style, 'Brand colors' manual, QR/free-shipping) TIDAK masuk.
 */

import type { DomainOption } from './types';

const img = (category: string, slug: string) => `images/marketing/${category}/${slug}.webp`;

// Riset §2 Field 1 + spec §3.4 section 1 — jenis konten/deliverable
export interface ContentTypeOption extends DomainOption {
  promptPhrase: string;
}
export const CONTENT_TYPES: ContentTypeOption[] = [
  { value: 'sale-promo-flyer', label: 'Sale / Promo Flyer', image: img('content-types', 'sale-promo-flyer'), promptPhrase: 'a sale flyer' },
  { value: 'social-media-post', label: 'Social Media Post', image: img('content-types', 'social-media-post'), promptPhrase: 'a social media post' },
  { value: 'ig-tiktok-story', label: 'IG / TikTok Story', image: img('content-types', 'ig-tiktok-story'), promptPhrase: 'a vertical IG / TikTok story graphic' },
  { value: 'web-banner', label: 'Web Banner', image: img('content-types', 'web-banner'), promptPhrase: 'a web banner' },
  { value: 'poster', label: 'Poster', image: img('content-types', 'poster'), promptPhrase: 'a poster' },
  { value: 'product-announcement', label: 'Product Announcement', image: img('content-types', 'product-announcement'), promptPhrase: 'a product announcement graphic' },
  { value: 'event-flyer', label: 'Event Flyer', image: img('content-types', 'event-flyer'), promptPhrase: 'an event flyer' },
  { value: 'coupon-voucher', label: 'Coupon / Voucher', image: img('content-types', 'coupon-voucher'), promptPhrase: 'a coupon voucher graphic' },
];

// Riset §2 Field 2 + spec §3.4 section 2 — format & ukuran.
// Spec MENANG: X/LinkedIn header 3:1 dan e-commerce 3:1–4:1 dari riset TIDAK masuk;
// 4:5 feed menggantikan posisi feed post.
export interface FormatOption extends DomainOption {
  ratio: string;
  clause: string;
}
export const MARKETING_FORMATS: FormatOption[] = [
  { value: '1x1', label: '1:1 post', ratio: '1:1', image: img('formats', '1x1'), clause: 'square 1:1' },
  { value: '9x16', label: '9:16 story', ratio: '9:16', image: img('formats', '9x16'), clause: 'vertical 9:16 story format, keep key elements in the central safe zone', hint: 'Story UI overlays cover top/bottom — safe zone handled by clause' },
  { value: '16x9', label: '16:9 banner', ratio: '16:9', image: img('formats', '16x9'), clause: 'wide 16:9 banner' },
  { value: '2x3', label: '2:3 poster', ratio: '2:3', image: img('formats', '2x3'), clause: 'vertical poster 2:3' },
  { value: 'a4', label: 'A4 flyer', ratio: 'A4', image: img('formats', 'a4'), clause: 'A4 portrait flyer' },
  { value: '4x5', label: '4:5 feed', ratio: '4:5', image: img('formats', '4x5'), clause: 'portrait 4:5 feed' },
];

// Riset §2 Field 3 + spec §3.4 section 3 — gaya desain (visual select).
// Spec MENANG: Y2K/Pop dari riset TIDAK masuk; label & descriptor English.
export interface DesignStyleOption extends DomainOption {
  descriptor: string;
}
export const DESIGN_STYLES: DesignStyleOption[] = [
  { value: 'minimalist', label: 'Minimalist / Clean', image: img('styles', 'minimalist'), descriptor: 'minimalist clean layout, generous white space, one or two colors, thin sans-serif' },
  { value: 'bold-brutalist', label: 'Bold Brutalist', image: img('styles', 'bold-brutalist'), descriptor: 'bold brutalist design, giant typography, extreme contrast, solid color blocks, rigid grid' },
  { value: 'modern-gradient', label: 'Modern Gradient', image: img('styles', 'modern-gradient'), descriptor: 'modern gradient design, soft mesh gradients, glassmorphism, tech startup feel' },
  { value: 'retro-vintage', label: 'Retro / Vintage', image: img('styles', 'retro-vintage'), descriptor: 'retro vintage design, 70s 80s 90s nostalgia, grainy texture, muted colors, circular badges' },
  { value: 'luxury-elegant', label: 'Luxury / Elegant', image: img('styles', 'luxury-elegant'), descriptor: 'luxury elegant design, black and gold or navy palette, elegant serif, generous spacing, foil detail' },
  { value: 'playful-fun', label: 'Playful / Fun', image: img('styles', 'playful-fun'), descriptor: 'playful fun design, candy colors, doodle illustrations, rounded fonts, stickers' },
  { value: 'corporate-clean', label: 'Corporate Clean', image: img('styles', 'corporate-clean'), descriptor: 'corporate clean design, professional blue and gray, neat grid, simple icons' },
  { value: 'streetwear-urban', label: 'Streetwear / Urban', image: img('styles', 'streetwear-urban'), descriptor: 'streetwear urban design, grunge, tape, photocopy texture, layered collage' },
  { value: 'organic-natural', label: 'Organic / Natural', image: img('styles', 'organic-natural'), descriptor: 'organic natural design, earth tones, paper texture, botanical elements' },
];

// Riset §2 Field 4 + spec §3.4 section 4 — preset palet (visual select).
// 'Brand colors manual' dari riset TIDAK masuk spec → dibuang.
// hex authored: riset hanya beri role descriptor
export interface ColorPresetOption extends DomainOption {
  hex: string;
  promptPhrase: string;
}
export const COLOR_PRESETS: ColorPresetOption[] = [
  { value: 'red-yellow', label: 'Red & Yellow (Sale)', hex: '#E63946/#FFD166', image: img('color-presets', 'red-yellow'), promptPhrase: 'warm mustard yellow background with black text and red accents' },
  { value: 'black-gold', label: 'Black & Gold (Luxury)', hex: '#111111/#D4AF37', image: img('color-presets', 'black-gold'), promptPhrase: 'black background with elegant gold accents and white text' },
  { value: 'pastel-pink-cream', label: 'Pastel Pink & Cream (Beauty)', hex: '#F8D7E3/#FFF6EC', image: img('color-presets', 'pastel-pink-cream'), promptPhrase: 'soft pastel pink and cream background with muted warm text' },
  { value: 'blue-white', label: 'Blue & White (Corporate)', hex: '#1D4ED8/#F5F7FA', image: img('color-presets', 'blue-white'), promptPhrase: 'clean light background with corporate blue accents' },
  { value: 'green-cream', label: 'Green & Cream (Natural)', hex: '#3A7D44/#F3F7E8', image: img('color-presets', 'green-cream'), promptPhrase: 'cream background with sage green accents' },
  { value: 'purple-blue', label: 'Purple & Blue (Tech)', hex: '#6D28D9/#2563EB', image: img('color-presets', 'purple-blue'), promptPhrase: 'purple to blue gradient background with white text' },
  { value: 'black-white', label: 'Black & White (Brutalist)', hex: '#111111/#FFFFFF', image: img('color-presets', 'black-white'), promptPhrase: 'high-contrast black and white background with bold text' },
  { value: 'orange-black', label: 'Orange & Black (Energetic)', hex: '#F97316/#1A1A1A', image: img('color-presets', 'orange-black'), promptPhrase: 'deep black background with bright orange accents' },
];

// Riset §2 Field 5 — typography style (visual).
// Handwritten hanya untuk sub-copy (riset §2 Field 5); jangan minta font brand (jebakan #3/#8).
export interface TypographyOption extends DomainOption {
  promptPhrase: string;
}
export const TYPOGRAPHY_STYLES: TypographyOption[] = [
  { value: 'bold-condensed', label: 'Bold condensed sans-serif', image: img('typography', 'bold-condensed'), promptPhrase: 'bold condensed sans-serif' },
  { value: 'elegant-serif', label: 'Elegant serif', image: img('typography', 'elegant-serif'), promptPhrase: 'elegant serif' },
  { value: 'rounded-playful', label: 'Rounded playful', image: img('typography', 'rounded-playful'), promptPhrase: 'rounded playful font' },
  { value: 'retro-groovy', label: 'Retro display / groovy', image: img('typography', 'retro-groovy'), promptPhrase: 'retro groovy display font' },
  { value: 'monospace-tech', label: 'Monospace tech', image: img('typography', 'monospace-tech'), promptPhrase: 'monospace tech font' },
  { value: 'handwritten-accent', label: 'Handwritten accent', image: img('typography', 'handwritten-accent'), promptPhrase: 'handwritten accent font, sub-copy only', hint: 'Sub-copy only — keep the headline in a readable font' },
  { value: 'chunky-3d', label: 'Chunky 3D type', image: img('typography', 'chunky-3d'), promptPhrase: 'chunky 3D type' },
];

// Riset §2 Field 6 + §4 jebakan #1 + spec §3.4 section 5 — strategi teks headline.
export interface TextStrategyOption extends DomainOption {
  promptPhrase: string;
}
export const TEXT_STRATEGIES: TextStrategyOption[] = [
  { value: 'render-exact', label: 'Render text exactly', image: img('text-strategies', 'render-exact'), promptPhrase: 'render the headline text exactly as written, wrapped in quotes', hint: 'Most accurate in GPT Image / Imagen' },
  { value: 'placeholder', label: 'Placeholder "[HEADLINE]"', image: img('text-strategies', 'placeholder'), promptPhrase: '"[HEADLINE]"', hint: 'Swap the placeholder yourself — recommended for Midjourney' },
  { value: 'empty-area', label: 'Empty area (add copy in Canva)', image: img('text-strategies', 'empty-area'), promptPhrase: 'leave clean empty space at the top for the headline text', hint: 'Safest for important brands — add copy manually' },
];

// Riset §2 Field 7 + spec §3.4 section 5 — elemen promosi (chips, max 3).
// Spec MENANG: free-shipping & QR dari riset TIDAK masuk (6 opsi per spec).
export interface PromoElementOption extends DomainOption {
  promptPhrase: string;
}
export const PROMO_ELEMENTS: PromoElementOption[] = [
  { value: 'discount-badge', label: 'Discount badge', image: img('promo-elements', 'discount-badge'), promptPhrase: 'circular discount badge in the top-right corner' },
  { value: 'cta-button', label: 'CTA button', image: img('promo-elements', 'cta-button'), promptPhrase: 'rounded pill CTA button at the bottom' },
  { value: 'price-tag', label: 'Price tag', image: img('promo-elements', 'price-tag'), promptPhrase: 'strikethrough price tag' },
  { value: 'countdown', label: 'Countdown / urgency tag', image: img('promo-elements', 'countdown'), promptPhrase: 'countdown urgency tag' },
  { value: 'star-rating', label: 'Star rating', image: img('promo-elements', 'star-rating'), promptPhrase: 'star rating strip' },
  { value: 'logo-placeholder', label: 'Logo placeholder circle', image: img('promo-elements', 'logo-placeholder'), promptPhrase: 'clean placeholder circle at the top-left for the logo', hint: 'AI hallucinates fake logos — paste the real one manually' },
];

// Riset §1 anatomy block 10/11 + §4 jebakan #2 — negative/guardrail (disisipkan buildPrompt).
export const MARKETING_GUARDRAILS =
  'no extra text, no watermark, clean uncluttered layout, generous white space';
