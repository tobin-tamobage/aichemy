import type { DomainRecipe, DomainState, DomainWarning, DomainOption } from './types';
import {
  ATTIRE,
  FILM_STOCK_KEYWORDS,
  FRAMINGS,
  MOMENTS,
  POSES_BY_MOMENT,
  STYLES,
  VENUES,
  WEDDING_LIGHTING,
} from './wedding-catalogs';

/**
 * DomainRecipe: Wedding — dari design/research-wedding.md §1-§5 + spec §3.2.
 * Komentar [Riset §…] di buildPrompt/warnings memetakan tiap bagian ke temuan riset.
 *
 * Spec §3.2: referencePhoto: false — TIDAK ada reference clause (riset §5 #9
 * melarang mode ganti identitas wajah; spec §6 menyerahkan attire lokal ke foto
 * referensi pakaian sendiri — bukan klausa wajah).
 */

// Lensa DERIVED dari framing (spec §3.2 smart rule, riset §3.7 + §5 #4) —
// BUKAN field user: wide scene → 24mm; portrait/close-up → 85mm f/1.4; macro → 100mm.
const LENS_BY_FRAMING: Record<string, string> = {
  'full-length': '24mm wide angle, deep depth of field',
  'from-behind': '24mm wide angle, deep depth of field',
  macro: '100mm macro lens',
  'close-up': '85mm f/1.4, shallow depth of field',
  'over-the-shoulder': '85mm f/1.4, shallow depth of field',
  silhouette: '85mm f/1.4, shallow depth of field',
};

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

export const weddingDomain: DomainRecipe = {
  id: 'wedding',
  label: 'Wedding',
  icon: '💍',
  tagline: 'Couple portraits, ceremony, and reception moments.',
  referencePhoto: false,

  createEmptyState: () => ({
    moment: 'ceremony',
    pose: 'walking-down-aisle',
    framing: 'full-length',
    venue: 'cathedral',
    lighting: 'window-light',
    style: 'documentary',
    filmStock: 'none',
    attire: [],
  }),

  presetProtectedKeys: [],

  sections: [
    {
      id: 'moment-scene',
      title: '01 · Moment & Scene',
      fields: [{ kind: 'select', key: 'moment', label: 'Moment', options: MOMENTS }],
    },
    {
      id: 'pose-framing',
      title: '02 · Pose & Framing',
      fields: [
        {
          kind: 'visual',
          key: 'pose',
          label: 'Pose',
          // Task 1 dynamic options — katalog pose mengikuti moment (spec §3.2 section 2).
          options: (state: DomainState): DomainOption[] =>
            POSES_BY_MOMENT[str(state.moment)] ?? POSES_BY_MOMENT.ceremony,
          previewRatio: 'aspect-[4/3]',
        },
        { kind: 'select', key: 'framing', label: 'Framing', options: FRAMINGS },
      ],
    },
    {
      id: 'venue-setting',
      title: '03 · Venue & Setting',
      fields: [{ kind: 'visual', key: 'venue', label: 'Venue', options: VENUES, previewRatio: 'aspect-video' }],
    },
    {
      id: 'lighting-atmosphere',
      title: '04 · Lighting & Atmosphere',
      fields: [{ kind: 'visual', key: 'lighting', label: 'Lighting', options: WEDDING_LIGHTING, previewRatio: 'aspect-[4/3]' }],
    },
    {
      id: 'style-film',
      title: '05 · Photography Style & Film',
      fields: [
        // select = single-select paksa — mencegah style blend (riset §5 #11, spec §3.2).
        { kind: 'select', key: 'style', label: 'Style', options: STYLES },
        { kind: 'select', key: 'filmStock', label: 'Film stock', options: FILM_STOCK_KEYWORDS },
      ],
    },
    {
      // Section opsional di luar 5 spec — attire masuk anatomi riset §1 blok 2
      // ('subject + attire detail'), jadi dirender sebagai chips multi-select terpisah.
      id: 'attire-details',
      title: '06 · Attire & Details (optional)',
      fields: [{ kind: 'chips', key: 'attire', label: 'Bride & groom attire', options: ATTIRE }],
    },
  ],

  buildPrompt: (state: DomainState): string => {
    const poses = POSES_BY_MOMENT[str(state.moment)] ?? POSES_BY_MOMENT.ceremony;
    const pose = poses.find(o => o.value === str(state.pose)) ?? poses[0];
    const framing = FRAMINGS.find(o => o.value === str(state.framing)) ?? FRAMINGS[0];
    const venue = VENUES.find(o => o.value === str(state.venue)) ?? VENUES[0];
    const lighting = WEDDING_LIGHTING.find(o => o.value === str(state.lighting)) ?? WEDDING_LIGHTING[0];
    const style = STYLES.find(o => o.value === str(state.style)) ?? STYLES[0];
    const film = FILM_STOCK_KEYWORDS.find(o => o.value === str(state.filmStock)) ?? FILM_STOCK_KEYWORDS[0];

    // [Riset §1 blok 2] Subject + attire — hanya disisipkan bila ada chips terpilih.
    const attireValues = Array.isArray(state.attire) ? (state.attire as string[]) : [];
    const selected = attireValues
      .map(v => ATTIRE.find(o => o.value === v))
      .filter((o): o is NonNullable<typeof o> => Boolean(o));
    const bride = selected.filter(o => o.group === 'bride').map(o => o.promptPhrase);
    const groom = selected.filter(o => o.group === 'groom').map(o => o.promptPhrase);
    let subject = 'the couple';
    if (bride.length > 0 && groom.length > 0) {
      subject = `the bride in ${bride.join(', ')}, the groom in ${groom.join(', ')}`;
    } else if (bride.length > 0) {
      subject = `the bride in ${bride.join(', ')}`;
    } else if (groom.length > 0) {
      subject = `the groom in ${groom.join(', ')}`;
    }

    // [Riset §1 blok 1 + §5 #4] Shot type/framing di awal (token paling berpengaruh);
    // lensa derived dari framing, bukan field user (spec §3.2 smart rule, riset §3.7).
    const lens = LENS_BY_FRAMING[framing.value] ?? LENS_BY_FRAMING['close-up'];

    // [Riset §1] Satu kalimat ringkas: shot type → subject → pose → venue →
    // lighting → mood+style (promptModifier) → kamera → film stock (bila dipilih).
    // Target ≤80 kata (spec §3.2, riset §5 #12) — gabung blok, bukan paragraf.
    const parts = [
      `${framing.promptPhrase.charAt(0).toUpperCase()}${framing.promptPhrase.slice(1)} of ${subject}`,
      pose.promptPhrase,
      venue.promptPhrase,
      lighting.promptPhrase,
      style.promptModifier,
      `shot on ${lens}`,
    ];
    if (film.keyword) parts.push(film.keyword);

    return `${parts.join(', ')}, photorealistic, natural skin texture, high resolution.`;
  },

  warnings: (state: DomainState): DomainWarning[] => {
    const out: DomainWarning[] = [];
    const moment = str(state.moment);
    const framing = str(state.framing);
    const lighting = str(state.lighting);
    const venue = str(state.venue);
    const style = str(state.style);
    const pose = str(state.pose);

    // [Riset §5 #5] Detail shots butuh framing makro/close-up (lensa 100mm).
    if (moment === 'detail-shots' && framing !== 'macro' && framing !== 'close-up') {
      out.push({
        sectionId: 'pose-framing',
        level: 'info',
        text: 'Detail shots work best with macro/close-up framing (100mm).',
      });
    }

    // [Riset §5 #4] Golden/blue hour butuh akses outdoor/window — venue indoor kontradiksi.
    if (
      (lighting === 'golden-hour' || lighting === 'blue-hour') &&
      (venue === 'cathedral' || venue === 'chapel' || venue === 'ballroom')
    ) {
      out.push({
        sectionId: 'venue-setting',
        level: 'warn',
        text: 'Golden/blue hour needs outdoor or window access — check venue choice.',
      });
    }

    // [Riset §5 #11] B&W/Vintage + sparkler/DJ lights — konfirmasi mood (warna hilang/grain bentrok).
    if (
      (style === 'black-white' || style === 'vintage-film') &&
      (lighting === 'sparkler' || lighting === 'dj-lights')
    ) {
      out.push({
        sectionId: 'style-film',
        level: 'info',
        text: style === 'black-white'
          ? 'Black & White with sparkler/DJ lights — colors are lost in monochrome; confirm the mood.'
          : 'Vintage film with sparkler/DJ lights — confirm the nostalgic mood you want.',
      });
    }

    // [Riset §5 #5] Close-up tangan/cincin rawan jari ekstra.
    if (
      framing === 'macro' &&
      (pose === 'ring-exchange' || pose === 'rings-macro-invitation' || pose === 'hand-on-chest-ring')
    ) {
      out.push({
        sectionId: 'pose-framing',
        level: 'info',
        text: 'Extreme close-ups of hands risk extra fingers — consider a slightly wider shot.',
      });
    }

    return out;
  },
};
