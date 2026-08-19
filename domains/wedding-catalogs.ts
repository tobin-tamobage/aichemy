import type { DomainOption } from './types';

/**
 * Katalog Wedding — dari design/research-wedding.md §2/§3.
 * Semua label English; promptPhrase/promptModifier diambil verbatim dari riset
 * (§4 contoh prompt dipakai untuk menurunkan frasa venue yang tidak punya frasa eksplisit).
 * Image path mengikuti konvensi spec §5: 'images/wedding/<kategori>/<slug>.webp'
 * (file belum ada → placeholder tile di VisualSelector).
 */

const img = (category: string, slug: string) => `images/wedding/${category}/${slug}.webp`;

// Riset §3.1 — moment menentukan default pose & setting (spec §3.2 section 1)
export const MOMENTS: DomainOption[] = [
  { value: 'getting-ready', label: 'Getting Ready', image: img('moments', 'getting-ready'), hint: 'Bride prep, groom prep, detail flat-lay' },
  { value: 'first-look', label: 'First Look', image: img('moments', 'first-look'), hint: 'Private reveal before the ceremony' },
  { value: 'ceremony', label: 'Ceremony', image: img('moments', 'ceremony'), hint: 'Aisle walk, vows, ring exchange, the kiss, recessional' },
  { value: 'couple-portraits', label: 'Couple Portraits', image: img('moments', 'couple-portraits'), hint: 'Posed portraits after the ceremony' },
  { value: 'first-dance', label: 'First Dance', image: img('moments', 'first-dance'), hint: 'Reception first dance' },
  { value: 'reception', label: 'Reception', image: img('moments', 'reception'), hint: 'Toast, cake cutting, dance floor, sparkler/confetti exit' },
  { value: 'detail-shots', label: 'Detail Shots', image: img('moments', 'detail-shots'), hint: 'Rings, invitation suite, bouquet, shoes, dress hanging' },
];

// Riset §3.2 — katalog pose per moment (conditional field, spec §3.2 section 2)
export interface PoseOption extends DomainOption {
  promptPhrase: string;
}
export const POSES_BY_MOMENT: Record<string, PoseOption[]> = {
  'getting-ready': [
    { value: 'buttoning-dress', label: 'Buttoning the dress', image: img('poses/getting-ready', 'buttoning-dress'), promptPhrase: 'buttoning the dress from behind' },
    { value: 'mother-adjusting-veil', label: 'Mother adjusting the veil', image: img('poses/getting-ready', 'mother-adjusting-veil'), promptPhrase: 'mother adjusting the veil' },
    { value: 'bride-looking-out-window', label: 'Bride looking out the window', image: img('poses/getting-ready', 'bride-looking-out-window'), promptPhrase: 'bride looking out the window' },
    { value: 'makeup-touch-up', label: 'Makeup touch-up candid', image: img('poses/getting-ready', 'makeup-touch-up'), promptPhrase: 'makeup touch-up candid' },
    { value: 'groom-adjusting-cufflinks', label: 'Groom adjusting cufflinks', image: img('poses/getting-ready', 'groom-adjusting-cufflinks'), promptPhrase: 'groom adjusting cufflinks' },
    { value: 'dress-hanging', label: 'Dress hanging by the window', image: img('poses/getting-ready', 'dress-hanging'), promptPhrase: 'dress hanging by the window' },
  ],
  'first-look': [
    { value: 'shoulder-tap-reveal', label: "Bride tapping the groom's shoulder", image: img('poses/first-look', 'shoulder-tap-reveal'), promptPhrase: "groom's back to camera, bride approaching tapping his shoulder" },
    { value: 'embrace-after-reveal', label: 'Embrace after the reveal', image: img('poses/first-look', 'embrace-after-reveal'), promptPhrase: 'embrace after the reveal' },
    { value: 'foreheads-together', label: 'Foreheads together', image: img('poses/first-look', 'foreheads-together'), promptPhrase: 'foreheads together eyes closed' },
  ],
  ceremony: [
    { value: 'walking-down-aisle', label: 'Walking down the aisle', image: img('poses/ceremony', 'walking-down-aisle'), promptPhrase: 'walking down the aisle, seen from behind, guests standing and turning to look' },
    { value: 'exchange-of-vows', label: 'Exchange of vows', image: img('poses/ceremony', 'exchange-of-vows'), promptPhrase: 'exchange of vows close-up on hands' },
    { value: 'ring-exchange', label: 'Ring exchange macro', image: img('poses/ceremony', 'ring-exchange'), promptPhrase: 'ring exchange macro' },
    { value: 'ceremony-kiss', label: 'The ceremony kiss', image: img('poses/ceremony', 'ceremony-kiss'), promptPhrase: 'the ceremony kiss at the altar' },
    { value: 'recessional-confetti', label: 'Recessional with confetti', image: img('poses/ceremony', 'recessional-confetti'), promptPhrase: 'recessional walk with confetti and petals' },
    { value: 'guests-wiping-tears', label: 'Guests wiping tears', image: img('poses/ceremony', 'guests-wiping-tears'), promptPhrase: 'guests wiping tears, reaction shot' },
  ],
  'couple-portraits': [
    { value: 'walking-hand-in-hand', label: 'Walking hand in hand', image: img('poses/couple-portraits', 'walking-hand-in-hand'), promptPhrase: 'walking hand in hand looking at each other' },
    { value: 'the-dip', label: 'The dip', image: img('poses/couple-portraits', 'the-dip'), promptPhrase: 'the dip' },
    { value: 'forehead-kiss', label: 'Forehead kiss', image: img('poses/couple-portraits', 'forehead-kiss'), promptPhrase: 'forehead kiss' },
    { value: 'nose-to-nose', label: 'Nose to nose', image: img('poses/couple-portraits', 'nose-to-nose'), promptPhrase: 'nose to nose (eskimo kiss)' },
    { value: 'under-the-veil', label: 'Under-the-veil portrait', image: img('poses/couple-portraits', 'under-the-veil'), promptPhrase: "veil lift, under-the-veil portrait" },
    { value: 'veil-flowing', label: 'Veil flowing in the wind', image: img('poses/couple-portraits', 'veil-flowing'), promptPhrase: 'veil flowing in the wind' },
    { value: 'lifting-spinning', label: 'Groom lifting / spinning bride', image: img('poses/couple-portraits', 'lifting-spinning'), promptPhrase: 'groom lifting and spinning his bride' },
    { value: 'threshold-carry', label: 'Carry over the threshold', image: img('poses/couple-portraits', 'threshold-carry'), promptPhrase: 'just-married carry over threshold' },
    { value: 'back-to-back', label: 'Back to back', image: img('poses/couple-portraits', 'back-to-back'), promptPhrase: 'back to back' },
    { value: 'hand-on-chest-ring', label: "Bride's hand on groom's chest", image: img('poses/couple-portraits', 'hand-on-chest-ring'), promptPhrase: "bride's hand on groom's chest showing the ring" },
    { value: 'silhouette-sunset', label: 'Silhouette against sunset', image: img('poses/couple-portraits', 'silhouette-sunset'), promptPhrase: 'silhouette against sunset' },
    { value: 'dancing-alone-outdoors', label: 'Dancing alone outdoors', image: img('poses/couple-portraits', 'dancing-alone-outdoors'), promptPhrase: 'dancing alone outdoors' },
    { value: 'whispering-laughing', label: 'Whispering / laughing candid', image: img('poses/couple-portraits', 'whispering-laughing'), promptPhrase: 'whispering, laughing candid' },
  ],
  'first-dance': [
    { value: 'mid-dip', label: 'Mid-dip', image: img('poses/first-dance', 'mid-dip'), promptPhrase: 'mid-dip' },
    { value: 'slow-dance-embrace', label: 'Slow dance close embrace', image: img('poses/first-dance', 'slow-dance-embrace'), promptPhrase: 'slow dance close embrace' },
    { value: 'wide-guests-dance-floor', label: 'Wide shot with guests', image: img('poses/first-dance', 'wide-guests-dance-floor'), promptPhrase: 'wide shot with guests around the dance floor' },
    { value: 'the-lift', label: 'The lift', image: img('poses/first-dance', 'the-lift'), promptPhrase: 'the lift' },
  ],
  reception: [
    { value: 'champagne-toast', label: 'Champagne toast', image: img('poses/reception', 'champagne-toast'), promptPhrase: 'champagne toast with raised glasses' },
    { value: 'cake-cutting', label: 'Cake cutting', image: img('poses/reception', 'cake-cutting'), promptPhrase: 'cake cutting' },
    { value: 'sparkler-exit', label: 'Sparkler exit send-off', image: img('poses/reception', 'sparkler-exit'), promptPhrase: 'sparkler exit send-off' },
    { value: 'confetti-toss', label: 'Confetti toss', image: img('poses/reception', 'confetti-toss'), promptPhrase: 'confetti toss' },
    { value: 'dance-floor-wide', label: 'Dance floor party wide shot', image: img('poses/reception', 'dance-floor-wide'), promptPhrase: 'dance floor party wide shot' },
  ],
  'detail-shots': [
    { value: 'rings-macro-invitation', label: 'Rings macro on invitation', image: img('poses/detail-shots', 'rings-macro-invitation'), promptPhrase: 'wedding rings macro on the invitation' },
    { value: 'invitation-flat-lay', label: 'Invitation suite flat lay', image: img('poses/detail-shots', 'invitation-flat-lay'), promptPhrase: 'flat lay of the invitation suite with flowers' },
    { value: 'bouquet-close-up', label: 'Bouquet close-up', image: img('poses/detail-shots', 'bouquet-close-up'), promptPhrase: 'bouquet close-up' },
    { value: 'heels-perfume-flat-lay', label: 'Heels and perfume flat lay', image: img('poses/detail-shots', 'heels-perfume-flat-lay'), promptPhrase: 'heels and perfume flat lay' },
    { value: 'groom-watch-cufflinks', label: "Groom's watch and cufflinks", image: img('poses/detail-shots', 'groom-watch-cufflinks'), promptPhrase: "groom's watch and cufflinks" },
  ],
};

// Riset §3.6 + spec §3.2 section 2 — framing select (6 opsi)
export interface FramingOption extends DomainOption {
  promptPhrase: string;
}
export const FRAMINGS: FramingOption[] = [
  { value: 'close-up', label: 'Close-up', image: img('framings', 'close-up'), promptPhrase: 'close-up portrait' },
  { value: 'full-length', label: 'Full-length', image: img('framings', 'full-length'), promptPhrase: 'full-length wide shot' },
  { value: 'over-the-shoulder', label: 'Over the shoulder', image: img('framings', 'over-the-shoulder'), promptPhrase: 'over-the-shoulder' },
  { value: 'from-behind', label: 'From behind', image: img('framings', 'from-behind'), promptPhrase: 'shot from behind' },
  { value: 'macro', label: 'Macro detail', image: img('framings', 'macro'), promptPhrase: 'macro detail shot' },
  { value: 'silhouette', label: 'Silhouette', image: img('framings', 'silhouette'), promptPhrase: 'silhouette' },
];

// Riset §3.3 + spec §3.2 section 3 — venue select (11 opsi; desert di riset tidak masuk spec)
export interface VenueOption extends DomainOption {
  promptPhrase: string;
}
export const VENUES: VenueOption[] = [
  { value: 'cathedral', label: 'Church / Cathedral', image: img('venues', 'cathedral'), promptPhrase: 'inside a historic stone cathedral with stained glass windows' },
  { value: 'chapel', label: 'Chapel', image: img('venues', 'chapel'), promptPhrase: 'in an intimate chapel with wooden pews' },
  { value: 'garden-estate', label: 'Garden Estate', image: img('venues', 'garden-estate'), promptPhrase: 'in a sunlit garden estate' },
  { value: 'beach', label: 'Beach / Seaside Cliff', image: img('venues', 'beach'), promptPhrase: 'on a beach by a seaside cliff' },
  { value: 'vineyard', label: 'Vineyard / Winery', image: img('venues', 'vineyard'), promptPhrase: 'in a vineyard at a winery' },
  { value: 'barn', label: 'Rustic Barn / Farm', image: img('venues', 'barn'), promptPhrase: 'in a rustic barn on a farm' },
  { value: 'ballroom', label: 'Ballroom / Grand Hotel', image: img('venues', 'ballroom'), promptPhrase: 'in a grand hotel ballroom' },
  { value: 'rooftop', label: 'Rooftop / City Skyline', image: img('venues', 'rooftop'), promptPhrase: 'on a modern rooftop with the city skyline' },
  { value: 'forest', label: 'Forest / Woodland', image: img('venues', 'forest'), promptPhrase: 'in a forest woodland' },
  { value: 'mountain', label: 'Mountain / Lakeside', image: img('venues', 'mountain'), promptPhrase: 'in the mountains by a lakeside' },
  { value: 'villa', label: 'Villa / Tropical', image: img('venues', 'villa'), promptPhrase: 'at a tropical villa' },
];

// Riset §3.4 + spec §3.2 section 4 — lighting select (9 opsi; off-camera flash di riset tidak masuk spec)
export interface LightingOption extends DomainOption {
  promptPhrase: string;
}
export const WEDDING_LIGHTING: LightingOption[] = [
  { value: 'golden-hour', label: 'Golden Hour', image: img('lighting', 'golden-hour'), promptPhrase: 'golden hour backlight, warm sun flare' },
  { value: 'blue-hour', label: 'Blue Hour', image: img('lighting', 'blue-hour'), promptPhrase: 'blue hour twilight, city lights bokeh' },
  { value: 'window-light', label: 'Soft Window Light', image: img('lighting', 'window-light'), promptPhrase: 'soft natural window light, diffused' },
  { value: 'candlelight', label: 'Candlelight', image: img('lighting', 'candlelight'), promptPhrase: 'warm candlelight glow, intimate' },
  { value: 'string-lights', label: 'String / Fairy Lights', image: img('lighting', 'string-lights'), promptPhrase: 'string lights bokeh background, warm ambient' },
  { value: 'stained-glass', label: 'Stained Glass Rays', image: img('lighting', 'stained-glass'), promptPhrase: 'dramatic light rays through stained glass windows' },
  { value: 'overcast', label: 'Overcast / Soft Daylight', image: img('lighting', 'overcast'), promptPhrase: 'soft overcast daylight, even flattering light' },
  { value: 'sparkler', label: 'Sparkler Light', image: img('lighting', 'sparkler'), promptPhrase: 'sparkler send-off, warm spark trails, night' },
  { value: 'dj-lights', label: 'DJ / Party Lights', image: img('lighting', 'dj-lights'), promptPhrase: 'colorful DJ lights, motion energy' },
];

// Riset §2 — style single-select (blend = jebakan #11), promptModifier per gaya
export interface StyleOption extends DomainOption {
  promptModifier: string;
}
export const STYLES: StyleOption[] = [
  { value: 'editorial', label: 'Editorial', image: img('styles', 'editorial'), promptModifier: 'editorial wedding photography, Vogue-style, dramatic composition, high fashion', hint: 'Posed, fashion-magazine, strong composition' },
  { value: 'documentary', label: 'Documentary', image: img('styles', 'documentary'), promptModifier: 'documentary wedding photography, candid unposed moment, photojournalistic, captured spontaneously', hint: 'Candid, unposed, storytelling — most requested 2025/26' },
  { value: 'fine-art', label: 'Fine Art', image: img('styles', 'fine-art'), promptModifier: 'fine art wedding photography, soft ethereal tones, film aesthetic, delicate composition', hint: 'Soft, ethereal, film-like, delicate palette' },
  { value: 'dark-moody', label: 'Dark & Moody', image: img('styles', 'dark-moody'), promptModifier: 'dark and moody wedding photography, deep shadows, rich contrast, desaturated earthy tones', hint: 'Deep shadows, high contrast — suits indoor/rustic venues' },
  { value: 'light-airy', label: 'Light & Airy', image: img('styles', 'light-airy'), promptModifier: 'light and airy wedding photography, bright soft tones, pastel palette, airy overexposed highlights', hint: 'Bright, pastel — suits daytime outdoor' },
  { value: 'classic', label: 'Classic / Traditional', image: img('styles', 'classic'), promptModifier: 'classic traditional wedding photography, formal posed portrait, true-to-life colors, timeless', hint: 'Formal posed, true-to-color, timeless' },
  { value: 'vintage-film', label: 'Vintage / Film', image: img('styles', 'vintage-film'), promptModifier: 'vintage film wedding photo, 35mm analog, heavy film grain, faded nostalgic tones', hint: 'Heavy grain, analog colors, sometimes faded' },
  { value: 'black-white', label: 'Black & White', image: img('styles', 'black-white'), promptModifier: 'black and white wedding photography, monochrome, high contrast, timeless', hint: 'Monochrome, emotion-focused' },
  { value: 'cinematic', label: 'Cinematic', image: img('styles', 'cinematic'), promptModifier: 'cinematic wedding photography, movie still, anamorphic look, cinematic color grade', hint: 'Widescreen movie-still look, teal/warm grade' },
];

// Riset §3.7 + spec §3.2 — keyword film stock disisipkan hanya bila dipilih
export interface FilmStockOption extends DomainOption {
  keyword: string; // '' = tidak menyisipkan apa pun ke prompt
}
export const FILM_STOCK_KEYWORDS: FilmStockOption[] = [
  { value: 'none', label: 'None', image: img('film', 'none'), keyword: '' },
  { value: 'portra-400', label: 'Kodak Portra 400', image: img('film', 'portra-400'), keyword: 'Kodak Portra 400 film tones', hint: 'Warm soft skin tones — the wedding standard' },
  { value: 'fuji-400h', label: 'Fuji 400H', image: img('film', 'fuji-400h'), keyword: 'Fuji 400H pastel tones', hint: 'Green-tinted pastel palette' },
  { value: 'ilford-hp5', label: 'Ilford HP5', image: img('film', 'ilford-hp5'), keyword: 'Ilford HP5 black and white film grain', hint: 'B&W grain' },
];

// Riset §3.5 — chips subject detail; group memisahkan sub-opsi bride/groom.
// Opsi lokal Indonesia (kebaya/beskap/dll) sengaja TIDAK masuk katalog —
// spec §6 Non-Goals: user attach foto referensi pakaian sendiri.
export interface AttireOption extends DomainOption {
  promptPhrase: string;
  group: 'bride' | 'groom';
}
export const ATTIRE: AttireOption[] = [
  // Bride — siluet
  { value: 'a-line-gown', label: 'A-line gown', image: img('attire', 'a-line-gown'), group: 'bride', promptPhrase: 'an A-line wedding gown' },
  { value: 'ball-gown', label: 'Ball gown', image: img('attire', 'ball-gown'), group: 'bride', promptPhrase: 'a ball gown wedding dress' },
  { value: 'mermaid-gown', label: 'Mermaid gown', image: img('attire', 'mermaid-gown'), group: 'bride', promptPhrase: 'a mermaid silhouette wedding gown' },
  { value: 'sheath-gown', label: 'Sheath gown', image: img('attire', 'sheath-gown'), group: 'bride', promptPhrase: 'a sheath wedding dress' },
  // Bride — fabric
  { value: 'lace', label: 'Lace fabric', image: img('attire', 'lace'), group: 'bride', promptPhrase: 'lace' },
  { value: 'satin', label: 'Satin fabric', image: img('attire', 'satin'), group: 'bride', promptPhrase: 'satin' },
  { value: 'tulle', label: 'Tulle fabric', image: img('attire', 'tulle'), group: 'bride', promptPhrase: 'tulle' },
  { value: 'chiffon', label: 'Chiffon fabric', image: img('attire', 'chiffon'), group: 'bride', promptPhrase: 'chiffon' },
  // Bride — veil & train
  { value: 'cathedral-veil', label: 'Cathedral veil', image: img('attire', 'cathedral-veil'), group: 'bride', promptPhrase: 'a cathedral veil' },
  { value: 'fingertip-veil', label: 'Fingertip veil', image: img('attire', 'fingertip-veil'), group: 'bride', promptPhrase: 'a fingertip veil' },
  { value: 'birdcage-veil', label: 'Birdcage veil', image: img('attire', 'birdcage-veil'), group: 'bride', promptPhrase: 'a birdcage veil' },
  { value: 'long-train', label: 'Long train', image: img('attire', 'long-train'), group: 'bride', promptPhrase: 'a long train' },
  // Bride — bouquet
  { value: 'wildflower-bouquet', label: 'Wildflower bouquet', image: img('attire', 'wildflower-bouquet'), group: 'bride', promptPhrase: 'a wildflower bouquet' },
  { value: 'rose-bouquet', label: 'Rose bouquet', image: img('attire', 'rose-bouquet'), group: 'bride', promptPhrase: 'a rose bouquet' },
  { value: 'pampas-bouquet', label: 'Pampas bouquet', image: img('attire', 'pampas-bouquet'), group: 'bride', promptPhrase: 'a pampas bouquet' },
  // Groom
  { value: 'black-tuxedo', label: 'Black tuxedo', image: img('attire', 'black-tuxedo'), group: 'groom', promptPhrase: 'a black tuxedo' },
  { value: 'navy-three-piece', label: 'Navy three-piece suit', image: img('attire', 'navy-three-piece'), group: 'groom', promptPhrase: 'a navy three-piece suit' },
  { value: 'charcoal-three-piece', label: 'Charcoal three-piece suit', image: img('attire', 'charcoal-three-piece'), group: 'groom', promptPhrase: 'a charcoal three-piece suit' },
  { value: 'bow-tie', label: 'Bow tie', image: img('attire', 'bow-tie'), group: 'groom', promptPhrase: 'a bow tie' },
  { value: 'necktie', label: 'Necktie', image: img('attire', 'necktie'), group: 'groom', promptPhrase: 'a necktie' },
  { value: 'boutonniere', label: 'Boutonniere', image: img('attire', 'boutonniere'), group: 'groom', promptPhrase: 'a boutonniere' },
];
