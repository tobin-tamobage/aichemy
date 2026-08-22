# Aichemy Recipes Phase 6 — Studio Depth Parity (camera gear + photographer style)

> **For agentic workers:** Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.
> **Repo:** `/Users/tobin/Documents/Aichemy/renderzero-web`, branch `recipes-phase6`. Base: `main` @ e437d9a.

**Goal:** Non-cinematic domains feel as rich as Cinematic. Cinematic has a Camera Gear section (body, focal length, lens, f-stop, film stock) plus photographer style. This phase adds camera body + lens + photographer/publication style to the photo-based domains where they genuinely fit, and a tilt-shift + drone technique to Real Estate. **ID Photo is deliberately excluded** (regulated document photo — its fixed "85mm DSLR quality" clause is correct per research) and **Marketing** (layout/typography-driven design domain, not camera-driven).

**Default behavior change (intended):** richer default prompts. Every photo domain gains a camera clause; wedding lens stays derived-from-framing unless overridden; portrait/food/wedding stylistic fields default to a no-op "auto/none" option so prompts stay unchanged unless the user chooses.

**Testing:** no test runner; verify with `npm run build` + `npx tsc --noEmit` + browser e2e (Task 3).

---

## 1. Canon rules (apply to every task)

- **All new fields are `kind: 'select'`** with `promptPhrase`. New options carry `image: img(...)` ONLY where the field's sibling options already carry images (RE_ANGLES, and per-catalog convention) — otherwise no image key.
- Option values: lowercase-slug. Labels: human display names. promptPhrases: exact English prompt text below (verbatim).
- Existing presetProtectedKeys unchanged. Existing user presets keep working: `applyPreset` merges onto `createEmptyState()` — new fields fall back to defaults.
- All new select fields default to the FIRST option (engine convention).
- Keep the domain's existing block-join style: portrait/food/product/real-estate use `\n\n` paragraphs; wedding uses `, ` single-paragraph parts.
- Asset checklist: regenerated in Task 2 (only expected diff = +1 asset: `angles/ts-24mm`). All other new options have NO image → checklist otherwise byte-identical.

---

## 2. Task 1 — Portrait + Wedding

### Portrait (`domains/portrait-catalogs.ts`, `domains/portrait.ts`)

**Step 1 — catalogs.** Append to `portrait-catalogs.ts`:

```ts
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
```

**Step 2 — fields.** Section `lens` ('05 · Lens & Framing') gains `{ kind: 'select', key: 'camera', label: 'Camera body', options: PORTRAIT_CAMERAS }`. New section `{ id: 'photographer', title: '06 · Photographer Style', fields: [{ kind: 'select', key: 'photographer', label: 'Photographer style', options: PORTRAIT_PHOTOGRAPHERS }] }` appended to sections.

**Step 3 — buildPrompt.** `createEmptyState` gains `camera: 'sony-a7rv', photographer: 'auto'`. In the photo variant:
- After block 1, insert `blocks.push(\`Camera: ${camera.promptPhrase}.\`);`
- After the wardrobe/expression block, before the guardrail block, insert: `if (photographer.promptPhrase) { blocks.push(\`${photographer.promptPhrase.charAt(0).toUpperCase()}${photographer.promptPhrase.slice(1)}.\`); }`
- Avatar variant: skip both (no camera physics for illustration) — no code change needed since blocks are only pushed in the photo branch; make sure the new blocks are inside the `else` branch.
- Lookups: `const camera = PORTRAIT_CAMERAS.find(o => o.value === str(state.camera)) ?? PORTRAIT_CAMERAS[0];` same pattern for photographer.

**Step 4 — warnings.** Extend existing rule (a) text (the avatar-mode info) to also mention camera and photographer style: `'Avatar mode switches to a stylized illustration — camera, lens, lighting, and photographer-style clauses are skipped.'`

Expected default photo prompt (type corporate-headshot, camera sony-a7rv, photographer auto):

```
A corporate headshot of a person, shot on an 85mm lens, head-and-shoulders framing.

Camera: Sony A7R V, 61MP full-frame mirrorless.

Lighting: ...

Background: ...

The subject wears ... with ....

Sharp focus on the eyes, natural skin texture, photorealistic, no heavy retouching, no text, no watermark.
```

### Wedding (`domains/wedding-catalogs.ts`, `domains/wedding.ts`)

**Step 1 — catalogs.** Append to `wedding-catalogs.ts`:

```ts
// Phase 6 Task 1 — camera body (select). Clause appended after lens part.
export interface WeddingCameraOption extends DomainOption { promptPhrase: string; }
export const WEDDING_CAMERAS: WeddingCameraOption[] = [
  { value: 'canon-r5', label: 'Canon EOS R5', promptPhrase: 'Canon EOS R5' },
  { value: 'sony-a7iv', label: 'Sony A7 IV', promptPhrase: 'Sony A7 IV' },
  { value: 'sony-a9iii', label: 'Sony A9 III', promptPhrase: 'Sony A9 III, global shutter' },
  { value: 'nikon-z8', label: 'Nikon Z8', promptPhrase: 'Nikon Z8' },
  { value: 'fuji-gfx100ii', label: 'Fujifilm GFX 100 II', promptPhrase: 'Fujifilm GFX 100 II, medium format' },
];

// Phase 6 Task 1 — lens override (select). 'auto' = keep derived-from-framing (LENS_BY_FRAMING).
export interface WeddingLensOption extends DomainOption { promptPhrase: string; }
export const WEDDING_LENSES: WeddingLensOption[] = [
  { value: 'auto', label: 'Auto (match framing)', promptPhrase: '' },
  { value: '24mm', label: '24mm f/1.4 wide', promptPhrase: '24mm wide angle, deep depth of field' },
  { value: '35mm', label: '35mm f/1.4', promptPhrase: '35mm, natural documentary perspective' },
  { value: '50mm', label: '50mm f/1.2', promptPhrase: '50mm f/1.2, creamy bokeh' },
  { value: '85mm', label: '85mm f/1.4 portrait', promptPhrase: '85mm f/1.4, shallow depth of field' },
  { value: '70-200mm', label: '70-200mm f/2.8 telephoto', promptPhrase: '70-200mm f/2.8 telephoto zoom, compressed background' },
  { value: '100mm-macro', label: '100mm macro', promptPhrase: '100mm macro lens' },
];
```

**Step 2 — fields.** Section `style-film` ('05 · Photography Style & Film') gains two fields appended: `{ kind: 'select', key: 'camera', label: 'Camera body', options: WEDDING_CAMERAS }` and `{ kind: 'select', key: 'lensOverride', label: 'Lens (optional)', options: WEDDING_LENSES }`.

**Step 3 — buildPrompt.** `createEmptyState` gains `camera: 'canon-r5', lensOverride: 'auto'`. Lookups added. Replace the derived-lens line:

```ts
// Phase 6 Task 1 — lensOverride 'auto' keeps the derived lens; explicit overrides it.
const derivedLens = LENS_BY_FRAMING[framing.value] ?? LENS_BY_FRAMING['close-up'];
const lens = lensOverride.promptPhrase !== '' ? lensOverride.promptPhrase : derivedLens;
```

Parts array: `\`shot on ${lens}, ${camera.promptPhrase}\`` (replaces `\`shot on ${lens}\``). Film keyword stays last.

Expected default: `... shot on 85mm f/1.4, shallow depth of field, Canon EOS R5, photorealistic, natural skin texture, high resolution.`

**Step 4 — warnings.** Two new rules in the existing warnings array:
- (b2) if `lensOverride === '24mm'` and framing is `macro` or `close-up` → `sectionId: 'style-film', level: 'warn', text: '24mm wide on close-up framing distorts faces — use 85mm f/1.4 or Auto.'`
- (b3) if `lensOverride === '100mm-macro'` and framing is NOT `macro` and NOT `close-up` → `sectionId: 'style-film', level: 'warn', text: '100mm macro suits detail shots — pair with macro framing or switch the lens back to Auto.'`

---

## 3. Task 2 — Product, Real Estate, Food

### Product (`domains/product-catalogs.ts`, `domains/product.ts`)

**Step 1 — catalogs.** Append to `product-catalogs.ts`:

```ts
// Phase 6 Task 2 — lens (select). qualityPhrase replaces the hardcoded '85mm f/8 product shot'.
export interface ProductLensOption extends DomainOption {
  promptPhrase: string;      // sentence clause
  qualityPhrase: string;     // physical-constraint tail (replaces '85mm f/8 product shot')
}
export const PRODUCT_LENSES: ProductLensOption[] = [
  { value: '85mm-f8', label: '85mm f/8 packshot', promptPhrase: 'an 85mm lens at f/8, edge-to-edge sharpness', qualityPhrase: '85mm f/8 product shot' },
  { value: '50mm', label: '50mm standard', promptPhrase: 'a 50mm lens', qualityPhrase: '50mm product shot' },
  { value: '100mm-macro', label: '100mm macro', promptPhrase: 'a 100mm macro lens, 1:1 detail reproduction', qualityPhrase: '100mm macro product shot, 1:1 detail reproduction' },
  { value: '24-70mm', label: '24-70mm zoom', promptPhrase: 'a 24-70mm zoom lens', qualityPhrase: '24-70mm zoom product shot' },
  { value: '90mm-ts', label: '90mm tilt-shift', promptPhrase: 'a 90mm tilt-shift lens, full focal plane sharpness', qualityPhrase: '90mm tilt-shift product shot, full focal plane sharpness' },
];

// Phase 6 Task 2 — camera body (select). Sentence clause.
export interface ProductCameraOption extends DomainOption { promptPhrase: string; }
export const PRODUCT_CAMERAS: ProductCameraOption[] = [
  { value: 'fuji-gfx100ii', label: 'Fujifilm GFX 100 II', promptPhrase: 'Fujifilm GFX 100 II, 102MP medium format' },
  { value: 'sony-a7rv', label: 'Sony A7R V', promptPhrase: 'Sony A7R V, 61MP full-frame' },
  { value: 'canon-r5', label: 'Canon EOS R5', promptPhrase: 'Canon EOS R5, 45MP full-frame' },
  { value: 'nikon-z8', label: 'Nikon Z8', promptPhrase: 'Nikon Z8, 45MP full-frame' },
  { value: 'phase-one', label: 'Phase One IQ4', promptPhrase: 'Phase One IQ4 150MP medium format' },
];
```

**Step 2 — remove superseded chip.** Delete the `{ value: '85mm-f8', label: 'shot on 85mm lens, f/8' }` entry from `QUALITY_MODIFIERS` (now owned by the lens field; otherwise the prompt can contradict: chip "shot on 85mm lens, f/8" + lens "100mm macro…"). `QualityOption` interface: check remaining entries still satisfy it.

**Step 3 — fields.** New section appended to sections: `{ id: 'camera-lens', title: '06 · Camera & Lens', fields: [ { kind: 'select', key: 'lens', label: 'Lens', options: PRODUCT_LENSES }, { kind: 'select', key: 'camera', label: 'Camera body', options: PRODUCT_CAMERAS } ] }`.

**Step 4 — buildPrompt.** `createEmptyState` gains `lens: '85mm-f8', camera: 'fuji-gfx100ii'`. Lookups added. Replace the quality-tail block:

```ts
// [Phase 6] Physical constraint now comes from the lens field (was hardcoded '85mm f/8 product shot').
const qualityTail = qualityLabels.length > 0 ? `${qualityLabels.join(', ')}, ` : '';
blocks.push(`${qualityTail}${lens.qualityPhrase}, ${camera.promptPhrase}`);
```

Expected default quality block (no quality chips): `85mm f/8 product shot, Fujifilm GFX 100 II, 102MP medium format`.

**Step 5 — warnings.** New rule: if `shotType === 'macro'` and `lens !== '100mm-macro'` → `sectionId: 'camera-lens', level: 'warn', text: 'Macro detail shots need the 100mm macro lens — switch the lens or choose a wider shot type.'`

### Real Estate (`domains/real-estate-catalogs.ts`, `domains/real-estate.ts`)

**Step 1 — catalogs.** Append one option to `RE_ANGLES` (follows the existing `image: img('angles', ...)` convention — this is the ONE new image, +1 checklist asset):

```ts
{ value: 'tilt-shift-24mm', label: '24mm tilt-shift', image: img('angles', 'tilt-shift-24mm'), promptPhrase: 'a 24mm tilt-shift lens, perspective-corrected, verticals perfectly straight' },
```

New field catalog:

```ts
// Phase 6 Task 2 — camera & technique (select). Sentence clause.
export interface ReCameraOption extends DomainOption { promptPhrase: string; }
export const RE_CAMERAS: ReCameraOption[] = [
  { value: 'full-frame', label: 'Full-frame mirrorless', promptPhrase: 'shot on a full-frame mirrorless camera, high resolution' },
  { value: 'hdr-blend', label: 'HDR exposure blend', promptPhrase: 'HDR exposure blend, balanced interior and window light' },
  { value: 'drone', label: 'Drone aerial', promptPhrase: 'aerial drone photograph, elevated perspective' },
];
```

**Step 2 — fields.** Section `angle-lens` ('05 · Angle & Lens') gains `{ kind: 'select', key: 'cameraTechnique', label: 'Camera & technique', options: RE_CAMERAS }`.

**Step 3 — buildPrompt.** `createEmptyState` gains `cameraTechnique: 'full-frame'`. Lookup added. After the `Shot with ${angleLens.promptPhrase}.` block, insert:

```ts
// [Phase 6] Camera/technique sentence — capitalise first letter of the phrase.
blocks.push(`${cameraTechnique.promptPhrase.charAt(0).toUpperCase()}${cameraTechnique.promptPhrase.slice(1)}.`);
```

Expected default: `Shot on a full-frame mirrorless camera, high resolution.` (interior + exterior both).

**Step 4 — warnings.** New rule: if `cameraTechnique === 'drone'` and scene does NOT start with `'exterior-'` → `sectionId: 'angle-lens', level: 'warn', text: 'Drone aerial only suits exterior scenes — interior drone shots look wrong.'`

### Food (`domains/food-catalogs.ts`, `domains/food.ts`)

**Step 1 — catalogs.** Append to `food-catalogs.ts`:

```ts
// Phase 6 Task 2 — lens (select). 'auto' derives from angle.
export interface FoodLensOption extends DomainOption { promptPhrase: string; }
export const FOOD_LENSES: FoodLensOption[] = [
  { value: 'auto', label: 'Auto (match angle)', promptPhrase: '' },
  { value: '50mm', label: '50mm standard', promptPhrase: 'a 50mm lens, natural table perspective' },
  { value: '85mm', label: '85mm portrait', promptPhrase: 'an 85mm lens, gentle compression' },
  { value: '100mm-macro', label: '100mm macro', promptPhrase: 'a 100mm macro lens, texture and detail' },
  { value: '24-70mm', label: '24-70mm zoom', promptPhrase: 'a 24-70mm zoom lens' },
];

// Phase 6 Task 2 — camera body (select).
export interface FoodCameraOption extends DomainOption { promptPhrase: string; }
export const FOOD_CAMERAS: FoodCameraOption[] = [
  { value: 'sony-a7rv', label: 'Sony A7R V', promptPhrase: 'Sony A7R V, 61MP full-frame mirrorless' },
  { value: 'canon-r5', label: 'Canon EOS R5', promptPhrase: 'Canon EOS R5, 45MP full-frame mirrorless' },
  { value: 'nikon-z8', label: 'Nikon Z8', promptPhrase: 'Nikon Z8, 45MP full-frame' },
  { value: 'fuji-gfx100ii', label: 'Fujifilm GFX 100 II', promptPhrase: 'Fujifilm GFX 100 II, 102MP medium format' },
];

// Phase 6 Task 2 — publication style (select). 'auto' = no clause.
export interface FoodStyleOption extends DomainOption { promptPhrase: string; }
export const FOOD_STYLES: FoodStyleOption[] = [
  { value: 'auto', label: 'No specific style', promptPhrase: '' },
  { value: 'kinfolk-editorial', label: 'Kinfolk editorial', promptPhrase: 'Kinfolk magazine editorial style, muted earthy tones, quiet natural storytelling' },
  { value: 'bon-appetit', label: 'Bon Appétit commercial', promptPhrase: 'Bon Appétit commercial style, bright, crisp, vibrant color pop' },
  { value: 'clean-cookbook', label: 'Clean cookbook', promptPhrase: 'clean cookbook style, even lighting, minimal styling' },
];
```

**Step 2 — fields.** New section appended: `{ id: 'camera-style', title: '06 · Camera & Style', fields: [ { kind: 'select', key: 'lens', label: 'Lens', options: FOOD_LENSES }, { kind: 'select', key: 'camera', label: 'Camera body', options: FOOD_CAMERAS }, { kind: 'select', key: 'publicationStyle', label: 'Publication style', options: FOOD_STYLES } ] }`.

**Step 3 — buildPrompt.** `createEmptyState` gains `lens: 'auto', camera: 'sony-a7rv', publicationStyle: 'auto'`. Lookups added. Lens derivation:

```ts
// [Phase 6] Lens 'auto' derives from angle (macro close-up -> 100mm; overhead -> 50mm; 45° -> 85mm).
const LENS_BY_ANGLE: Record<string, string> = {
  'close-up': 'a 100mm macro lens, texture and detail',
  overhead: 'a 50mm lens, natural table perspective',
  '45-degree': 'an 85mm lens, gentle compression',
  'side-profile': 'an 85mm lens, gentle compression',
};
const lensPhrase = lens.promptPhrase !== '' ? lens.promptPhrase : (LENS_BY_ANGLE[angle.value] ?? 'a 50mm lens, natural table perspective');
```

Replace the angle block:
```ts
blocks.push(`Shot from ${angle.promptPhrase} on ${lensPhrase}, ${camera.promptPhrase}.`);
```

Insert publication-style block right after the backdrop block, before the guardrail:
```ts
if (publicationStyle.promptPhrase !== '') {
  blocks.push(`${publicationStyle.promptPhrase}.`);
}
```
(phrases already start with a capital — no charAt transform needed.)

Expected default angle block (45-degree): `Shot from a 45-degree angle, the classic food photography view on an 85mm lens, gentle compression, Sony A7R V, 61MP full-frame mirrorless.`

**Step 4 — warnings.** New rule: if `angle === 'close-up'` and lens is explicit (`state.lens` is a non-empty string AND not `'auto'`) and `lens !== '100mm-macro'` → `sectionId: 'camera-style', level: 'warn', text: 'Close-up food shots need the 100mm macro lens — switch the lens or widen the angle.'`

---

## 4. Task 3 — e2e verification

- [x] **Step 1**: build + dev server + browser. Assertions:
  1. All 8 studios still render; Cinematic untouched (prompt parity spot-check: one cinematic combo prompt identical to pre-phase).
  2. **Portrait**: new fields Camera body + Photographer style render; default prompt contains `Camera: Sony A7R V, 61MP full-frame mirrorless.`; choosing Annie Leibovitz appends the style clause before the guardrail; avatar mode skips both clauses and shows the extended info warning; corporate-headshot + 35mm warning still fires.
  3. **Wedding**: Camera body + Lens (optional) render; default prompt contains `shot on 85mm f/1.4, shallow depth of field, Canon EOS R5`; lens override to 24mm + close-up framing → new warning; override to 100mm macro + full-length framing → new warning; lens Auto + framing change still derives correctly.
  4. **Product**: Camera & Lens section renders; default prompt quality block = `85mm f/8 product shot, Fujifilm GFX 100 II, 102MP medium format`; shotType macro + lens 85mm → new warning; lens 100mm-macro → no warning; QUALITY_MODIFIERS no longer offers the `85mm-f8` chip.
  5. **Real Estate**: Angle & Lens has 24mm tilt-shift; Camera & technique renders; default interior prompt contains `Shot on a full-frame mirrorless camera, high resolution.`; drone + interior → new warning; drone + exterior → no warning.
  6. **Food**: Camera & Style renders; default prompt angle block matches the expected string above; close-up + 50mm lens → new warning; close-up + 100mm macro → no warning; publication style Kinfolk appends its clause before guardrail; steam rule still works (hot dish).
  7. Existing user presets on all 5 domains load and apply (new fields take defaults).
  8. `node scripts/generate-asset-checklist.mjs` → exactly ONE new line (`angles/tilt-shift-24mm`); 771 referenced / 346 missing; commit the regenerated checklist.
  9. `npm run build` green; `npx tsc --noEmit` exit 0.
- [x] **Step 2**: fix failures; commit `feat(recipes): studio depth parity live, e2e verified`.

---

## 5. Anti-patterns (hard-won, all phases)
- Don't touch `domains/types.ts` (engine contract), `cinematic.ts`, `id-photo.ts`, `marketing.ts`.
- `localStorage` never in domain files.
- No new `visual` kind fields; no new images except `angles/tilt-shift-24mm` (list the image under `public/images/real-estate/angles/` — asset will be generated by user later; the checklist entry is what matters).
- Don't change `applyPreset` / storage / registry — new fields ride the generic domain flow.
- Preserve `str()` / find-fallback patterns exactly (match every existing domain file).
- Wedding stays a single joined paragraph (`', '` parts) — do NOT switch it to `\n\n`.
- Every new catalog export must be consumed (no dead exports) — phase 4/5 review lesson.

## 6. Files
- Modified only: `domains/portrait-catalogs.ts`, `domains/portrait.ts`, `domains/wedding-catalogs.ts`, `domains/wedding.ts`, `domains/product-catalogs.ts`, `domains/product.ts`, `domains/real-estate-catalogs.ts`, `domains/real-estate.ts`, `domains/food-catalogs.ts`, `domains/food.ts`, `design/asset-checklist.md` (regen).
- No new files.
