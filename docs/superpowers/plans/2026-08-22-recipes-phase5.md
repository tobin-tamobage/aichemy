# Aichemy Recipes Phase 5 — Studio Builder (custom domains)

> **For agentic workers:** Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.
> **Repo:** `/Users/tobin/Documents/Aichemy/renderzero-web`, branch `recipes-phase5`.

**Goal:** Users can create their own studio (domain) without code: a visual **Studio Builder** produces a validated custom recipe, the engine adapts it into a `DomainRecipe` at runtime, and custom studios live alongside the 8 built-ins (cards, pills, presets, projects). Recipes are shareable as `.nbrecipe` JSON files (import/export).

**Non-goals:** no `visual` field kind for customs (needs image assets), no dynamic/function option catalogs, no drag-drop reorder (up/down buttons), no code editing UI, no cloud sharing.

**Testing:** no test runner; verify with `npm run build` (tsc + vite) + browser e2e.

---

## 1. Custom recipe JSON schema (`.nbrecipe`, `recipeVersion: 1`)

```ts
// domains/custom/types.ts
export interface CustomRecipe {
  recipeVersion: 1;
  id: string;                 // 'x-' + slug, unique vs builtins
  label: string;
  icon: string;               // emoji string
  tagline: string;
  referencePhoto?: boolean;   // default false
  referenceLabel?: string;
  referenceClause?: string;   // appended when reference photo active
  sections: CustomSection[];
  template: PromptBlock[];    // ordered prompt blocks
  rules?: CustomRule[];       // smart warnings
  presetProtectedKeys?: string[];
}

export interface CustomSection { id: string; title: string; fields: CustomField[]; }

export type CustomFieldKind = 'select' | 'textarea' | 'chips' | 'toggle';
export interface CustomField {
  key: string;                // unique within recipe
  label: string;
  kind: CustomFieldKind;
  options?: CatalogOption[];  // select/chips: required, >=1
  placeholder?: string;       // textarea
  max?: number;               // chips (>=1)
  text?: string;              // toggle: clause when true — declarative replacement for builtin if-blocks
  hint?: string;              // toggle/select hint (renderer already supports hint)
  default?: unknown;          // select: option value; chips: value[]; toggle: boolean; textarea: string
  visibleWhen?: When;         // compiled to DomainField.visibleWhen predicate
}
// CatalogOption is the existing shape: { value, label, promptPhrase?, promptColor?, ... }

export type PromptBlock =
  | { kind: 'text'; text: string; when?: When }
  | { kind: 'field'; field: string; prefix?: string; suffix?: string; separator?: string; when?: When }
  | { kind: 'reference'; when?: When };   // renders referenceClause; gated by hasReferencePhoto

export interface CustomRule {
  id: string;
  sectionId: string;
  level: 'info' | 'warn';
  when: When;
  text: string;
}

export type When =
  | { field: string; op: 'equals' | 'not-equals'; value: string }
  | { field: string; op: 'in' | 'not-in'; values: string[] }
  | { field: string; op: 'empty' | 'not-empty' }
  | { field: string; op: 'contains' | 'not-contains'; value: string };  // chips array membership
```

**Adapter semantics** — `toDomainRecipe(recipe)` returns a `DomainRecipe`:
- `createEmptyState`: per field — select → `default ?? options[0].value`; textarea → `default ?? ''`; chips → `default ?? []`; toggle → `default ?? false`. If `referencePhoto`, add `hasReferencePhoto: true`.
- `buildPrompt(state)`: walk `template` in order; skip block when its `when` evaluates false. Field block value: select → `option.promptPhrase ?? option.label` (find by value, fallback `catalog[0]` — same convention as builtins); textarea → trimmed raw string, skip if empty; chips → selected options' `promptPhrase ?? label` joined with `separator ?? ', '`, skip if empty; toggle → `field.text` when truthy else skip. Wrap with `prefix`/`suffix`. Join blocks with `'\n\n'` and append guardrail block: `'no text, no watermark.'` — actually NO: guardrail is a built-in-domain convention; customs get no automatic guardrail unless the author adds a text block. (Decision: no hidden clauses — what you build is what you get.)
- `reference` block: renders `recipe.referenceClause` only when `recipe.referencePhoto && state.hasReferencePhoto !== false`.
- `warnings(state)`: evaluate each rule's `when` → `DomainWarning { sectionId, level, text }` (id dropped — DomainWarning has no id).
- `when` evaluation: read `state[field]`; equals/not-equals compare `String(v)`; in/not-in check membership in `values`; empty/not-empty: `''`, `[]`, `false`, null/undefined = empty; contains/not-contains: Array.isArray(v) && v.includes(value).
- `fieldsMeta`: keep `options[]` entries as plain CatalogOption — UI renders select/chips generically; textarea/toggle as existing.

**Validation** — `validateRecipe(json: unknown): { ok: true; recipe: CustomRecipe } | { ok: false; errors: string[] }`:
- Plain-object shape checks, `recipeVersion === 1`, required strings non-empty.
- `id`: matches `^x-[a-z0-9][a-z0-9-]*$`, not colliding with a builtin id (validator receives builtin id list as arg).
- Unique field keys across sections; unique section ids; unique option values per field.
- select/chips fields MUST have `options.length >= 1`; chips `max` >= 1 if present; toggle fields MUST have `text` (clause) non-empty.
- Every `template` field block references an existing field key; every `when`/`rule.field`/`visibleWhen.field` references an existing field key; `rule.sectionId` references an existing section id.
- `default` values must exist among option values (select/chips).
- No `img` paths required/validated (customs have no assets).
- Pure string checks only — **never eval**.

**Golden example** (also the e2e fixture — builder UI output must round-trip to this shape):

```json
{
  "recipeVersion": 1,
  "id": "x-pet-portraits",
  "label": "Pet Portraits",
  "icon": "🐾",
  "tagline": "Regal portraits of your furry companions",
  "referencePhoto": true,
  "referenceLabel": "Pet photo",
  "referenceClause": "The portrait must clearly depict the pet from the reference photo - same breed, fur color, markings, and eye shape.",
  "sections": [
    { "id": "subject", "title": "Subject", "fields": [
      { "key": "species", "label": "Species", "kind": "select", "options": [
        { "value": "cat", "label": "Cat", "promptPhrase": "a domestic cat" },
        { "value": "dog", "label": "Dog", "promptPhrase": "a dog" },
        { "value": "rabbit", "label": "Rabbit", "promptPhrase": "a rabbit" }
      ] },
      { "key": "personality", "label": "Personality", "kind": "chips", "max": 3, "options": [
        { "value": "regal", "label": "Regal", "promptPhrase": "regal, composed posture" },
        { "value": "playful", "label": "Playful", "promptPhrase": "playful energy, bright eyes" },
        { "value": "sleepy", "label": "Sleepy", "promptPhrase": "sleepy, relaxed expression" }
      ] }
    ] },
    { "id": "style", "title": "Style & Scene", "fields": [
      { "key": "style", "label": "Art style", "kind": "select", "options": [
        { "value": "royal-oil", "label": "Royal oil painting", "promptPhrase": "classical oil painting style, rich brushwork, dramatic Rembrandt lighting" },
        { "value": "watercolor", "label": "Watercolor", "promptPhrase": "loose watercolor illustration, soft washes" },
        { "value": "studio-photo", "label": "Studio photo", "promptPhrase": "professional studio photograph, softbox lighting, 85mm lens" }
      ] },
      { "key": "background", "label": "Background", "kind": "select", "options": [
        { "value": "velvet", "label": "Velvet drapes", "promptPhrase": "deep burgundy velvet drapes" },
        { "value": "park", "label": "Park", "promptPhrase": "a sunny park with soft bokeh" },
        { "value": "seamless", "label": "Seamless studio", "promptPhrase": "a neutral seamless studio backdrop" }
      ] },
      { "key": "costume", "label": "Costume", "kind": "textarea", "placeholder": "e.g. a tiny admiral's uniform with gold epaulettes" },
      { "key": "crown", "label": "Add a crown", "kind": "toggle", "text": "wearing a small ornate golden crown" }
    ] }
  ],
  "template": [
    { "kind": "field", "field": "species", "prefix": "A portrait of ", "suffix": "." },
    { "kind": "field", "field": "personality", "prefix": "Mood: ", "suffix": "." },
    { "kind": "field", "field": "style", "prefix": "Rendered as ", "suffix": "." },
    { "kind": "field", "field": "background", "prefix": "Background: ", "suffix": "." },
    { "kind": "field", "field": "costume", "prefix": "The pet wears ", "suffix": "." },
    { "kind": "field", "field": "crown" },
    { "kind": "text", "text": "Painterly detail, museum quality.", "when": { "field": "style", "op": "in", "values": ["royal-oil", "watercolor"] } },
    { "kind": "reference" }
  ],
  "rules": [
    { "id": "r1", "sectionId": "style", "level": "warn",
      "when": { "field": "style", "op": "equals", "value": "royal-oil" },
      "text": "Royal oil + Park background clashes - velvet or seamless reads more regal." }
  ],
  "presetProtectedKeys": ["species"]
}
```

Expected default prompt (species=cat, personality=[], style=royal-oil, background=velvet, costume empty, crown off, reference on — empty/toggled-off blocks skipped):

```
A portrait of a domestic cat.

Rendered as classical oil painting style, rich brushwork, dramatic Rembrandt lighting.

Background: deep burgundy velvet drapes.

Painterly detail, museum quality.

The portrait must clearly depict the pet from the reference photo - same breed, fur color, markings, and eye shape.
```

**Template semantics (LOCK):** every block renders as ONE complete paragraph; the adapter joins non-empty blocks with `'\n\n'` (same as builtins). Authors write full clauses including punctuation; prefix/suffix are literal strings wrapped around the rendered field value. No cross-block sentence assembly.

---

## 2. Tasks

### Task 1 — schema, validator, adapter (no UI)
- [ ] **Step 1**: `domains/custom/types.ts` — types above.
- [ ] **Step 2**: `domains/custom/validate.ts` — `validateRecipe(json, builtinIds: string[])` per §1. Error messages human-readable, one per line, e.g. `sections[1].fields[0].options: at least 1 option required`.
- [ ] **Step 3**: `domains/custom/toDomainRecipe.ts` — `toDomainRecipe(recipe: CustomRecipe): DomainRecipe` per §1 semantics. `DEFAULT_PROMPT_ENABLED = true`. Field mapping: CustomField → existing `DomainField` union — select→`SelectField`, textarea→`TextareaField`, chips→`ChipsField`, toggle→`ToggleField` (`{kind:'toggle', key, label, hint?}`; the `text` clause is consumed by the adapter's buildPrompt, NOT by the renderer); `visibleWhen` compiles to the field's `visibleWhen` predicate via the same `when` evaluator.
- [ ] **Step 4**: runtime probe (node one-liner via vite build or a scratch `node --experimental-strip-types` is NOT allowed — use a small probe through the existing esbuild-bundle trick from `scripts/generate-asset-checklist.mjs`): build golden recipe → adapter → assert default prompt equals expected paragraph string; rule fires for royal-oil; reference clause present/absent with `hasReferencePhoto` true/false; empty chips block skipped; toggle block renders only when true.
- [ ] **Step 5**: `npm run build`, commit `feat(recipes): custom studio schema + declarative recipe adapter`.

### Task 2 — storage + registry integration (no builder UI yet)
- [ ] **Step 1**: `services/browserStorage.ts` — custom studio CRUD: `loadCustomRecipes(): CustomRecipe[]`, `saveCustomRecipe(recipe)`, `deleteCustomRecipe(id)` under key `aichemy-custom-studios`. **All functions MUST be safe under Node (`typeof localStorage === 'undefined' → return [] / no-op`)** — the checklist script bundles `domains/index.ts` which will import these transitively.
- [ ] **Step 2**: `domains/index.ts` — `getAllDomains(): DomainRecipe[]` = `DOMAINS` + cached custom adapters (invalidate cache inside save/delete). `getDomain(id)` checks builtins first, then customs (fallback behavior unchanged). Export `listCustomRecipes` for UI.
- [ ] **Step 3**: `StartScreen.tsx` — render custom studios in the same card grid after builtins (from `getAllDomains()`), each custom card gets a small "CUSTOM" badge + a trash icon button (confirm via `window.confirm`) calling `deleteCustomRecipe`. Builtin cards unchanged.
- [ ] **Step 4**: `App.tsx` — recipe pills render `getAllDomains()` instead of `DOMAINS`. (Project v3 round-trip with custom domains then works via existing generic restore; unknown deleted-custom id still falls back per existing `getDomain` — leave as is.)
- [ ] **Step 5**: verify `node scripts/generate-asset-checklist.mjs` still runs green and `design/asset-checklist.md` is byte-identical (registry must not leak localStorage into Node).
- [ ] **Step 6**: `npm run build`, commit `feat(recipes): custom studio storage + registry integration`.

### Task 3 — Studio Builder UI + import/export
- [ ] **Step 1**: `components/StudioBuilder.tsx` — full-screen modal (same overlay pattern as `PresetLibraryModal`). Sections, top→bottom:
  1. **Identity**: label, tagline, icon (single-emoji text input), id auto-derived (`x-` + slug of label, editable, validated live).
  2. **Reference photo**: toggle + label + clause inputs (visible when toggle on).
  3. **Sections**: list; add/remove section (title input, id auto-slug). Per section: field rows; add field → kind picker (select/textarea/chips/toggle); per field: label (key auto-slug, editable), and per-kind editors — options editor (rows: label + value auto-slug + promptPhrase textarea; add/remove), placeholder (textarea), max number (chips), clause text (toggle), default picker (select/chips only, from defined options).
  4. **Prompt template**: block list in order; add block (type: Field/Text/Reference); Field block: field dropdown + prefix + suffix (+ separator for chips); Text block: textarea; Reference block: no config. Every block: optional `when` editor (field dropdown, op dropdown, value input). Reorder via up/down buttons; delete per block.
  5. **Smart rules**: add rule → section dropdown, level dropdown (info/warn), when editor (same component as block `when`), warning text.
  6. **Preset protected keys**: checkbox list of all defined field keys.
  7. **Live preview pane**: builds the recipe from current form state → `validateRecipe` → if ok, `toDomainRecipe` → `createEmptyState()` → `buildPrompt` rendered in the same dark prompt panel styling as the studio output; validation errors listed above preview. Preview field values: interactive mini-form is out of scope — preview uses defaults only.
  8. **Footer**: `Save Studio` (validate → save → close → parent bumps registry version), `Export .nbrecipe` (validate → `downloadTextFile`), `Cancel`.
- [ ] **Step 2**: reuse the same `when` editor component for blocks and rules (small shared subcomponent inside StudioBuilder file is fine).
- [ ] **Step 3**: `StartScreen.tsx` — two buttons beside the recipe grid header: **Create Studio** (opens builder) and **Import Studio** (file picker `.json/.nbrecipe` → `validateRecipe` → alert errors or save). After save/delete/import, StartScreen re-reads `getAllDomains()` (local state bump).
- [ ] **Step 4**: `App.tsx` — builder modal state lives in App (StartScreen gets `onCreateStudio`/`onImportStudio` props, mirroring existing callback props); on save, bump a `customsVersion` state so pills re-render; `handleNewProject`/`switchDomain` accept custom ids (already generic via `getDomain`).
- [ ] **Step 5**: Edit flow: pencil icon on custom cards in StartScreen → builder opens pre-filled with that recipe; Save overwrites (same id).
- [ ] **Step 6**: `npm run build`, commit `feat(recipes): studio builder UI + .nbrecipe import/export`.

### Task 4 — e2e verification
- [x] **Step 1**: build + dev server + browser automation. Assertions:
  1. Start screen shows 8 builtin cards + Create/Import Studio buttons.
  2. Create Studio → build the golden Pet Portraits recipe exactly per §1 (all fields, blocks, rule, protected key) → live preview prompt equals expected default paragraphs → Save.
  3. Start screen now shows Pet Portraits card with CUSTOM badge; header pills include 🐾.
  4. Open it: sections render (2), species select works, chips max 3 enforced, toggle renders, textarea placeholder shown.
  5. Default prompt paragraphs = preview; switch species→dog updates prompt; set style royal-oil → rule warning appears on Style section; switch background park → warning text mentions park/velvet; add costume text → paragraph appears; enable crown → clause appended; upload reference photo → reference clause appears; theme light/dark fine.
  6. Save a preset on the custom studio → reload page → preset loads.
  7. Export project (.nbproject v3) → New Project → import project → state restored, domainId = x-pet-portraits.
  8. Export .nbrecipe → delete studio (trash, confirm) → card gone → Import Studio with the exported file → card back, opens, prompt identical.
  9. Import invalid JSON (e.g. `{ "foo": 1 }`) → alert lists validation errors, nothing saved.
  10. Switch back to Cinematic → prompt parity unaffected; all 8 builtins still build prompts.
  11. `node scripts/generate-asset-checklist.mjs` → byte-identical `design/asset-checklist.md`.
- [x] **Step 2**: fix any failures; `npm run build`; commit `feat(recipes): studio builder live, e2e verified`.

---

## 3. Anti-patterns (hard-won, all phases)
- **`localStorage` at module top level or unguarded in registry code → kills the Node checklist script.** Guard every access.
- No eval / Function in recipe execution — recipes are pure data.
- No `visual` kind, no function-options in customs.
- Don't special-case custom ids in App rendering paths — keep the generic domain flow; the only custom-specific UI is badge/delete/edit on cards and the builder itself.
- Don't add hidden prompt clauses (no automatic guardrail/camera text) — author controls every block.
- A11y: icon-only buttons need `title`/`aria-label` (e2e checked this in phase 3).
- Custom id MUST start `x-`; reject collisions with builtin ids AND existing custom ids on import (import with colliding id → offer overwrite confirm or reject — v1: reject with alert).
- `export const` only for used exports (phase 4 review).
- Reference field flag convention: `hasReferencePhoto !== false` (mirror builtins).

## 4. Files
- New: `domains/custom/types.ts`, `domains/custom/validate.ts`, `domains/custom/toDomainRecipe.ts`, `components/StudioBuilder.tsx`.
- Modified: `domains/index.ts`, `services/browserStorage.ts`, `components/StartScreen.tsx`, `App.tsx`.
- Untouched: all 8 builtin domain files, engine/types.ts, DomainFieldRenderer (verify it covers the 4 kinds; extend ONLY if a kind is genuinely unrenderable), checklist script logic.
