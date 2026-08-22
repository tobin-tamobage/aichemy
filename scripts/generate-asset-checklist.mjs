#!/usr/bin/env node
/**
 * Asset checklist generator — Task 8 step 2 of recipes-phase1 plan.
 *
 * Reads the DOMAINS registry (domains/index.ts, TypeScript) by bundling it
 * with the repo's esbuild into node_modules/.cache, then walks every
 * section/field/option and lists each referenced image as
 * `public/images/<domain>/<category>/<slug>.webp` with a suggested
 * generation prompt per entry.
 *
 * Output: design/asset-checklist.md
 * Run:    node scripts/generate-asset-checklist.mjs
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CACHE_DIR = join(ROOT, 'node_modules', '.cache');
const BUNDLE = join(CACHE_DIR, 'aichemy-domains.mjs');
const OUT_MD = join(ROOT, 'design', 'asset-checklist.md');

// --- Bundle the TS registry so this script stays a plain .mjs ---
mkdirSync(CACHE_DIR, { recursive: true });
execFileSync(
  join(ROOT, 'node_modules', '.bin', 'esbuild'),
  [
    join(ROOT, 'domains', 'index.ts'),
    '--bundle',
    '--platform=node',
    '--format=esm',
    `--outfile=${BUNDLE}`,
    '--log-level=warning',
  ],
  { stdio: 'inherit' },
);

const { DOMAINS } = await import(pathToFileURL(BUNDLE).href);

// --- Suggested generation prompts -------------------------------------------
const suggestPrompt = (domainId, category, option, fieldLabel) => {
  const label = option.label ?? option.value;
  // Kategori thumbnail dengan prompt khusus dievaluasi SEBELUM guard promptPhrase
  // (semua opsi katalog bawa promptPhrase → guard meng-intercept switch).
  if (category === 'dishes') {
    return `Overhead food photography of ${label} on a rustic wood table, natural window light, steam rising, fresh garnish, no hands.`;
  }
  if (option.promptColor) {
    return `Solid seamless studio backdrop, ${option.promptColor}, evenly lit, no gradient, no shadows, no texture. Flat empty background plate, landscape crop.`;
  }
  if (option.promptPhrase) {
    return `Studio product photo of ${option.promptPhrase} on an invisible mannequin, front view, neutral light grey background, soft even lighting, no person, no text.`;
  }
  switch (category) {
    case 'countries':
      return `Minimal flat illustration thumbnail for "${label}" document photo standard: head-and-shoulders portrait silhouette on a ${option.defaultBackground ?? 'neutral'} background, pastel palette, no text.`;
    case 'sizes':
      return `Flat minimal diagram of a ${label} portrait photo print (${option.ratio ?? ''} ratio), soft pastel background, subtle border showing print dimensions, no text.`;
    case 'hijab':
      return `Studio photo of a neatly draped ${label.toLowerCase()} hijab on a mannequin head, face area left blank, soft even lighting, pastel neutral background.`;
    case 'color-presets':
      return `Flat two-color palette swatch (${option.hex ?? ''}) side by side, matte, evenly lit, no gradients beyond the pair, no text.`;
    case 'typography':
      return `Minimal type specimen tile for "${label}" typography style, large sample letters on a neutral background, no words.`;
    case 'design-styles':
      return `Abstract mood tile representing the "${label}" design style, no text, no logos.`;
    case 'formats':
      return `Minimal frame outline diagram of a ${option.ratio ?? ''} format, empty inside, pastel background, no text.`;
    case 'purposes':
      return `Minimal flat icon-style thumbnail representing "${label}", pastel palette, centered composition, no text.`;
    default:
      return domainId === 'cinematic'
        ? `Cinematic film-still thumbnail for "${label}" (${fieldLabel}), moody directional lighting, shallow depth of field, 16:9 crop.`
        : `Clean flat thumbnail for "${label}" (${fieldLabel}), soft pastel background, centered, minimal, no text.`;
  }
};

// --- Resolve field options (dynamic catalogs) ---------------------------------
/**
 * Options bisa berupa array statis ATAU fungsi state → DomainOption[] (conditional
 * catalog, mis. pose wedding mengikuti moment; props product mengikuti category).
 * Fungsi di-probe secara generik: dipanggil dengan (a) empty state domain, dan
 * (b) empty state + tiap nilai opsi statis dari SEMUA field select/visual statis
 * di domain yang sama (driving field), lalu hasil di-union (dedupe per value).
 * Probe yang melempar diabaikan (fall back []) — script tidak pernah crash.
 */
function resolveFieldOptions(domain, field) {
  if (typeof field.options !== 'function') return field.options ?? [];
  const empty = domain.createEmptyState();
  const probeStates = [empty];
  for (const section of domain.sections ?? []) {
    for (const f of section.fields ?? []) {
      if (typeof f.options !== 'function' && (f.kind === 'select' || f.kind === 'visual')) {
        for (const opt of f.options ?? []) {
          probeStates.push({ ...empty, [f.key]: opt.value });
        }
      }
    }
  }
  const seen = new Set();
  const out = [];
  for (const state of probeStates) {
    try {
      for (const option of field.options(state) ?? []) {
        const key = option?.value ?? JSON.stringify(option);
        if (!seen.has(key)) {
          seen.add(key);
          out.push(option);
        }
      }
    } catch {
      /* probe gagal — lanjut state lain */
    }
  }
  return out;
}

// --- Walk registry ------------------------------------------------------------
const lines = [];
const today = new Date().toISOString().slice(0, 10);
let total = 0;
let missing = 0;
const perDomain = [];

for (const domain of DOMAINS) {
  /** category -> Array<{ option, fieldLabel, image }> */
  const categories = new Map();
  for (const section of domain.sections ?? []) {
    for (const field of section.fields ?? []) {
      for (const option of resolveFieldOptions(domain, field)) {
        if (typeof option.image !== 'string' || option.image.length === 0) continue;
        const image = option.image.replace(/^\/+/, '');
        const parts = image.split('/'); // images/<domain>/<category>/<slug>.webp
        const category = parts.length >= 4 ? parts[2] : `shared/${parts[1]}`;
        if (!categories.has(category)) categories.set(category, []);
        categories.get(category).push({ option, fieldLabel: field.label, image });
      }
    }
  }
  perDomain.push({ domain, categories });
  for (const entries of categories.values()) total += entries.length;
}

lines.push('# Asset Checklist — reference images');
lines.push('');
lines.push(`Generated ${today} by \`scripts/generate-asset-checklist.mjs\` from the DOMAINS registry.`);
lines.push('Regenerate: `node scripts/generate-asset-checklist.mjs`.');
lines.push('');
lines.push('Files live under `public/`; missing files render as placeholder tiles in VisualSelector until generated.');
lines.push('');

for (const { domain, categories } of perDomain) {
  const domainTotal = [...categories.values()].reduce((n, e) => n + e.length, 0);
  let domainPresent = 0;
  const blocks = [];
  for (const [category, entries] of categories) {
    const rows = [];
    for (const { option, fieldLabel, image } of entries) {
      const abs = join(ROOT, 'public', image);
      const present = existsSync(abs);
      if (present) domainPresent += 1; else missing += 1;
      const extras = [option.hex, option.hint].filter(Boolean).join(' — ');
      rows.push(`- [${present ? 'x' : ' '}] \`public/${image}\` — **${option.label}** (${fieldLabel})${extras ? ` — ${extras}` : ''}`);
      rows.push(`  - Suggested prompt: ${suggestPrompt(domain.id, category, option, fieldLabel)}`);
    }
    blocks.push(`### ${category} (${entries.length})`);
    blocks.push('');
    blocks.push(...rows);
    blocks.push('');
  }
  lines.push(`## ${domain.icon ?? ''} ${domain.label} (\`${domain.id}\`) — ${domainPresent}/${domainTotal} present`);
  lines.push('');
  lines.push(...blocks);
}

lines.push('---');
lines.push(`Total: ${total} referenced, ${total - missing} present, ${missing} missing.`);
lines.push('');

writeFileSync(OUT_MD, lines.join('\n'));
console.log(`Wrote ${OUT_MD} — ${total} referenced, ${missing} missing.`);
