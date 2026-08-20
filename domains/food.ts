import type { DomainRecipe, DomainState, DomainWarning } from './types';
import {
  FOOD_DISHES,
  FOOD_PRESENTATIONS,
  FOOD_LIGHT_MOODS,
  FOOD_ANGLES,
  FOOD_BACKDROPS,
} from './food-catalogs';

/**
 * DomainRecipe: Food — dari design/research-food.md §1-§5 + plan Task 2 Step 3.
 * Komentar [Riset §…] di buildPrompt/warnings memetakan tiap blok prompt ke temuan riset.
 *
 * Keputusan authoring plan: referencePhoto: false dan presetProtectedKeys: [] (semua
 * field adalah select). Satu katalog gabungan FOOD_DISHES (8 Indonesia + 6 internasional)
 * — prompt langsung spesifik per hidangan. Steam clause hanya untuk hidangan panas
 * (HOT_DISHES); TALL_DISHES memicu warning angle overhead (riset §4 jebakan #2).
 * Guardrail/negative jadi konstanta blok terakhir buildPrompt (pola marketing blok 7).
 */

// Plan Task 2 Step 3 — konstanta smart rules (persis dari plan).
const HOT_DISHES = ['rendang', 'sate-ayam', 'soto-ayam', 'rawon', 'ayam-bakar', 'mie-goreng', 'ramen'];
const TALL_DISHES = ['ramen', 'drink', 'burger'];

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

export const foodDomain: DomainRecipe = {
  id: 'food',
  label: 'Food',
  icon: '🍜',
  tagline: 'Indonesian dishes, desserts, and drinks, styled to sell.',
  referencePhoto: false,
  presetProtectedKeys: [],

  createEmptyState: () => ({
    dish: 'nasi-goreng',
    presentation: 'rustic-family',
    lightMood: 'natural-window',
    angle: '45-degree',
    backdrop: 'wood-table',
  }),

  sections: [
    {
      id: 'dish',
      title: '01 · Dish',
      fields: [{ kind: 'select', key: 'dish', label: 'Dish', options: FOOD_DISHES }],
    },
    {
      id: 'presentation',
      title: '02 · Presentation',
      fields: [{ kind: 'select', key: 'presentation', label: 'Presentation', options: FOOD_PRESENTATIONS }],
    },
    {
      id: 'light-mood',
      title: '03 · Light Mood',
      fields: [{ kind: 'select', key: 'lightMood', label: 'Light mood', options: FOOD_LIGHT_MOODS }],
    },
    {
      id: 'angle',
      title: '04 · Angle',
      fields: [{ kind: 'select', key: 'angle', label: 'Angle', options: FOOD_ANGLES }],
    },
    {
      id: 'backdrop',
      title: '05 · Backdrop & Props',
      fields: [{ kind: 'select', key: 'backdrop', label: 'Backdrop', options: FOOD_BACKDROPS }],
    },
  ],

  buildPrompt: (state: DomainState): string => {
    const dish = FOOD_DISHES.find(o => o.value === str(state.dish)) ?? FOOD_DISHES[0];
    const presentation = FOOD_PRESENTATIONS.find(o => o.value === str(state.presentation)) ?? FOOD_PRESENTATIONS[0];
    const lightMood = FOOD_LIGHT_MOODS.find(o => o.value === str(state.lightMood)) ?? FOOD_LIGHT_MOODS[0];
    const angle = FOOD_ANGLES.find(o => o.value === str(state.angle)) ?? FOOD_ANGLES[0];
    const backdrop = FOOD_BACKDROPS.find(o => o.value === str(state.backdrop)) ?? FOOD_BACKDROPS[0];

    const blocks: string[] = [];

    // [Riset §1 blok 1] Hidangan + plating deskriptif (katalog Indonesia spesifik).
    blocks.push(`Appetizing food photograph of ${dish.promptPhrase}.`);

    // [Riset §2 Field 2] Presentation — fine dining / rustic / flat lay.
    blocks.push(`Presentation: ${presentation.promptPhrase}.`);

    // [Riset §2 Field 3] Light mood.
    blocks.push(`Lighting: ${lightMood.promptPhrase}.`);

    // [Riset §4 jebakan #1] Steam clause hanya untuk hidangan panas — masakan
    // dingin/plated (dessert, sushi, drink) tanpa uap.
    if (HOT_DISHES.includes(dish.value)) {
      blocks.push('Light steam rising from the dish, served fresh and hot.');
    }

    // [Riset §2 Field 4] Angle — 45° klasik, overhead untuk flat lay, side profile
    // untuk lapisan (ramen, burger).
    blocks.push(`Shot from ${angle.promptPhrase}.`);

    // [Riset §2 Field 5] Backdrop/permukaan + props.
    blocks.push(`Served on ${backdrop.promptPhrase}.`);

    // [Riset §4] Guardrail/negative — warna natural, DOF dangkal, tanpa tangan/orang/teks.
    blocks.push('Vibrant natural colors, shallow depth of field, fresh garnish, no hands, no people, no text, no watermark.');

    return blocks.join('\n\n');
  },

  warnings: (state: DomainState): DomainWarning[] => {
    const out: DomainWarning[] = [];
    const dish = str(state.dish);
    const presentation = str(state.presentation);
    const angle = str(state.angle);

    // (a) [Riset §4 jebakan #1] Hidangan panas — prompt menambah klausa steam.
    if (HOT_DISHES.includes(dish)) {
      out.push({
        sectionId: 'dish',
        level: 'info',
        text: 'Hot dish — the prompt adds a rising-steam clause.',
      });
    }

    // (b) [Riset §2 Field 4 + §4 jebakan #2] Overhead meratakan hidangan tinggi —
    // 45° atau side profile menunjukkan lapisan.
    if (TALL_DISHES.includes(dish) && angle === 'overhead') {
      out.push({
        sectionId: 'angle',
        level: 'warn',
        text: 'Overhead flattens tall dishes — use the 45° or side-profile angle to show layers.',
      });
    }

    // (c) [Riset §2 Field 2 + Field 4] Flat lay (bahan tersebar) vs close-up makro
    // (detail satu titik) — dua bahasa visual yang bertentangan.
    if (presentation === 'flat-lay' && angle === 'close-up') {
      out.push({
        sectionId: 'angle',
        level: 'warn',
        text: 'Flat lay and close-up conflict — pick one: ingredients spread out, or a macro detail.',
      });
    }

    return out;
  },
};
