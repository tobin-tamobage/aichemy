# Aichemy Recipes Phase 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bangun Recipes engine (domain-config driven prompt builder), ekstrak Cinematic ke `domains/cinematic.ts` tanpa perubahan perilaku, dan tambah domain **ID Photo** lengkap (spec §3.1) dengan reference photo + clipboard image+text.

**Architecture:** Engine generik membaca `DomainRecipe` config. Domain memiliki shape state-nya sendiri (`Record<string, unknown>` di mata engine; typed di dalam domain). `buildPrompt` milik domain. Cinematic memetakan state generik → `PromptState` lama → `buildPromptFromState` existing (nol perubahan output prompt). Project format baru v3 (`domainId` + `domainState`); import file v2 lama tetap didukung (→ cinematic).

**Tech Stack:** Vite 6, React 19, TS, Tailwind tokens Aichemy (sudah ada).

**Spec:** `docs/superpowers/specs/2026-08-19-recipes-multidomain-design.md` §1-5, 7, 8 (Fase 1 = §9 fase 1). Riset pas foto: `design/research-pasfoto.md`.

**Testing:** tidak ada test runner (keputusan spec) — verifikasi per task = `npm run build` hijau + verifikasi browser di Task 8. Implementer JALANKAN `npm run build` sebelum commit.

---

### Task 1: Domain type system + registry

**Files:**
- Create: `domains/types.ts`
- Create: `domains/index.ts`

- [ ] **Step 1: `domains/types.ts`** — kontrak engine (persis):

```ts
import type React from 'react';

export interface DomainOption {
  value: string;
  label: string;
  /** Relatif ke public/, mis. 'images/id-photo/backgrounds/red.webp'. Boleh undefined → placeholder tile. */
  image?: string;
  hint?: string;
}

export type DomainState = Record<string, unknown>;

export interface DomainFieldBase {
  key: string;
  label: string;
  /** Field kondisional — mis. pose catalog mengikuti moment. */
  visibleWhen?: (state: DomainState) => boolean;
}

export interface TextareaField extends DomainFieldBase {
  kind: 'textarea'; placeholder: string; rows?: number;
}
export interface SelectField extends DomainFieldBase {
  kind: 'select'; options: DomainOption[]; placeholder?: string;
}
export interface VisualField extends DomainFieldBase {
  kind: 'visual'; options: DomainOption[]; previewRatio?: string; multi?: false;
}
export interface ChipsField extends DomainFieldBase {
  kind: 'chips'; options: DomainOption[]; max?: number; // multi-select
}
export interface ToggleField extends DomainFieldBase {
  kind: 'toggle'; hint?: string;
}

export type DomainField = TextareaField | SelectField | VisualField | ChipsField | ToggleField;

export interface DomainSection {
  id: string;
  title: string;             // '01 · Background'
  icon?: React.ReactNode;
  fields: DomainField[];
}

/** Smart-rule warning yang ditampilkan di bawah section terkait. */
export interface DomainWarning {
  sectionId: string;
  level: 'info' | 'warn';
  text: string;
}

export interface DomainPreset {
  id: string; name: string; timestamp: number;
  /** State parsial domain — merge ke atas state kosong, tidak menimpa field yang dikecualikan domain. */
  data: Record<string, unknown>;
  type?: 'user' | 'bundled';
}

export interface DomainRecipe {
  id: string;                  // 'cinematic' | 'id-photo'
  label: string;
  icon: string;                // emoji
  tagline: string;
  referencePhoto: boolean;
  referenceLabel?: string;     // 'Your selfie' / 'Product photo'
  referenceClause?: string;    // kalimat yang disisipkan ke prompt saat ada referensi
  createEmptyState: () => DomainState;
  /** Field yang TIDAK ditimpa preset (mis. subjectAction, teks bebas). */
  presetProtectedKeys: string[];
  sections: DomainSection[];
  buildPrompt: (state: DomainState) => string;
  /** Smart rules — dihitung dari state, dirender sebagai banner. */
  warnings?: (state: DomainState) => DomainWarning[];
}
```

- [ ] **Step 2: `domains/index.ts`** — registry + helpers:

```ts
import type { DomainRecipe, DomainState } from './types';
import { cinematicDomain } from './cinematic';
import { idPhotoDomain } from './id-photo';

export const DOMAINS: DomainRecipe[] = [cinematicDomain, idPhotoDomain];

export const getDomain = (id: string): DomainRecipe =>
  DOMAINS.find(d => d.id === id) ?? cinematicDomain;

export const DEFAULT_DOMAIN_ID = 'cinematic';

/** Merge preset ke state kosong, hormati presetProtectedKeys. */
export function applyPreset(domain: DomainRecipe, current: DomainState, data: Record<string, unknown>): DomainState {
  const next = { ...current };
  for (const [k, v] of Object.entries(data)) {
    if (domain.presetProtectedKeys.includes(k)) continue;
    next[k] = v;
  }
  return next;
}

export type { DomainRecipe, DomainState, DomainField, DomainSection, DomainOption, DomainWarning, DomainPreset } from './types';
```

NOTE: import `./cinematic` dan `./id-photo` akan error sampai Task 3 & 4 — Step 3 membuktikan kompilasi dengan stub sementara yang langsung diganti. Kerjakan Task 1 bersamaan commit setelah Task 3/4 ada? TIDAK — Task 1 commit dengan registry yang hanya berisi `DOMAINS: DomainRecipe[] = []` + komentar `// populated in Tasks 3-4`, dan `getDomain` fallback `throw`. Perbaiki: registry final dirangkai di Task 5 (App wiring). Task 1 commit = types saja + registry kosong.

- [ ] **Step 3: Build** — `npm run build` hijau (file baru belum di-import App).
- [ ] **Step 4: Commit** — `git commit -m "feat(recipes): domain type system + registry scaffold"`

---

### Task 2: Generic state hook + field renderer + VisualSelector placeholder

**Files:**
- Create: `hooks/useDomainState.ts`
- Create: `components/DomainFieldRenderer.tsx`
- Modify: `components/VisualSelector.tsx`

- [ ] **Step 1: `hooks/useDomainState.ts`**

```ts
import { useCallback, useMemo, useState } from 'react';
import type { DomainRecipe, DomainState } from '../domains/types';

export function useDomainState(domain: DomainRecipe) {
  const [state, setState] = useState<DomainState>(() => domain.createEmptyState());
  const [isManualPrompt, setIsManualPrompt] = useState(false);
  const [manualPrompt, setManualPrompt] = useState('');

  const updateField = useCallback((key: string, value: unknown) => {
    setState(prev => ({ ...prev, [key]: value }));
    setIsManualPrompt(false);
  }, []);

  const reset = useCallback((next?: DomainState) => {
    setState(next ?? domain.createEmptyState());
    setIsManualPrompt(false);
    setManualPrompt('');
  }, [domain]);

  const autoPrompt = useMemo(() => domain.buildPrompt(state), [domain, state]);
  const finalPrompt = isManualPrompt ? manualPrompt : autoPrompt;
  const warnings = useMemo(() => domain.warnings?.(state) ?? [], [domain, state]);

  return { state, updateField, reset, finalPrompt, isManualPrompt, setManual: (text: string) => { setManualPrompt(text); setIsManualPrompt(true); }, clearManual: () => setIsManualPrompt(false), warnings };
}
```

- [ ] **Step 2: `components/DomainFieldRenderer.tsx`** — switch per `field.kind`, pakai komponen existing (`TextInput`, `Selector`, `VisualSelector`) + renderer chips & toggle baru (pattern chips: tombol pill `border-line` → terpilih `bg-accent text-white`; toggle: pola checkbox existing App.tsx "Subject unaware"). Bungkus tiap field dengan label pola existing (`text-accent2 uppercase`). Baca dulu `components/TextInput.tsx`, `Selector.tsx` untuk props-nya.

- [ ] **Step 3: `VisualSelector.tsx` placeholder mode** — jika `opt.image` undefined ATAU img error: render tile placeholder (bg `surface2`, border `line`, huruf inisial label besar `text-dim`, tanpa gradient overlay). Ganti `handleImageError` (.jpg→.png) dengan flag `dataset.placeholderUsed` → set state `imgFailed` → render placeholder (fallback .png tidak relevan lagi).

- [ ] **Step 4: Build + commit** — `git commit -m "feat(recipes): generic domain state hook + field renderer + VisualSelector placeholder"`

---

### Task 3: Ekstraksi Cinematic → domains/cinematic.ts

**Files:**
- Create: `domains/cinematic.ts`
- TIDAK mengubah App.tsx di task ini (wiring di Task 5)

- [ ] **Step 1:** `domains/cinematic.ts` — DomainRecipe lengkap untuk cinematic:
  - `createEmptyState` → `createEmptyPromptState()` dari `packages/shared-core/types` (state tetap typed PromptState di dalam domain).
  - `buildPrompt` → `buildPromptFromState(state as unknown as PromptState)` (import dari `packages/shared-core/services/promptBuilder`).
  - `presetProtectedKeys`: `['subjectAction', 'environment']` (perilaku preset existing: subject & environment tidak ditimpa).
  - `sections`: 5 section sesuai JSX App.tsx saat ini — Subject & Framing (textarea subjectAction, visual shotType SHOT_TYPES, visual viewingDirection VIEWING_DIRECTIONS visibleWhen shotType, select aspectRatio ASPECT_RATIOS, toggle candidShot visibleWhen shotType, textarea environment), Lighting & Mood (visual LIGHTING_TYPES, textarea mood), Camera Gear (select CAMERAS, FOCAL_LENGTHS, LENSES, select fStop → opsi dari FStopSelector constants, select FILM_STOCKS), Style & Aesthetics (select PHOTOGRAPHERS, MOVIE_LOOKS, chips FILTERS, + genre/anime selects bila ada di App sekarang — baca App.tsx 1000-1400 untuk daftar field aktual dan urutannya; JANGAN menambah/mengurangi).
  - Slider/temperature: pertahankan bila ada di UI sekarang sebagai kind select? TIDAK — temperature slider: tambahkan ke DomainField union? Cek App.tsx dulu; jika temperature tidak tampil di UI, skip.
  - Elements section (characters/scene/reference images + InpaintEditor) TIDAK masuk engine — tetap fitur khusus cinematic yang dirender App.tsx di luar DomainFieldRenderer (flag `customSections?: 'elements'` di recipe cinematic).
- [ ] **Step 2:** Verifikasi paritas: untuk state default + 3 kombinasi field, `buildPrompt` domain == `buildPromptFromState` langsung (uji manual via dev console / unit ad-hoc `node` tidak bisa import TS — cukup code review + nanti browser test Task 8).
- [ ] **Step 3: Build + commit** — `git commit -m "feat(recipes): extract cinematic domain config (parity preserved)"`

---

### Task 4: domains/id-photo.ts — katalog + template + smart rules

**Files:**
- Create: `domains/id-photo.ts`
- Create: `domains/id-photo-catalogs.ts`

- [ ] **Step 1: katalog** (`id-photo-catalogs.ts`) — dari `design/research-pasfoto.md` (baca dulu; semua label English):
  - PURPOSES: Job Application (CV), LinkedIn / Professional Profile, Passport / Visa, Official ID (KTP/SIM/SKCK), Academic / Campus, Corporate Badge, Other
  - COUNTRIES: Indonesia, United States (2×2 in), Schengen/EU (35×45mm), United Kingdom, Japan, India, General International — tiap entry: default background + default size + ratio
  - PRINT_SIZES: 2×3 cm (ratio 2:3), 3×4 cm (3:4), 4×6 cm (2:3), 2×2 in (1:1), 35×45 mm (7:9), 50×70 mm (5:7)
  - BACKGROUNDS: Red #C8102E, Blue #1E6FD9, White #FFFFFF, Light Grey #D3D3D3, Light Blue #A8C8E8 (+hint konvensi Indonesia di option Red/Blue)
  - OUTFITS: White dress shirt, Shirt + black blazer, Shirt + navy blazer, Shirt + charcoal blazer, Long-sleeve batik shirt, Blouse, Suit + tie, Polo shirt
  - EXPRESSIONS: Neutral (official), Soft smile (CV/LinkedIn)
  - FRAMINGS: Head and shoulders (face fills 70–80% of frame), Chest-up, Half body
- [ ] **Step 2: `buildPrompt`** mengikuti anatomi riset (10 blok): reference clause (jika ada foto/flag) → jenis foto & purpose → pakaian → pose/framing → ekspresi → latar solid + hex + `no shadows on background, seamless` → softbox even lighting → kualitas (`DSLR photo, 85mm lens, sharp focus, natural skin texture, no beauty filter`) → rasio eksplisit → negatives (`no glasses glare, no watermark, no text`).
- [ ] **Step 3: smart rules** (`warnings`):
  - purpose=Passport/Visa → info banner: "Biometric standard: white background, neutral expression, face 70–80%." (tidak lock field — cukup info; lock = janggal untuk UX)
  - white shirt + white background → warn: "White shirt on white background reduces contrast — consider adding a blazer."
  - disclaimer info konstan di section Purpose: "AI photos work for CV/LinkedIn/applications; official biometric documents may reject AI-generated photos."
- [ ] **Step 4: referencePhoto:** true, referenceLabel 'Your selfie', referenceClause persis spec §3.1.
- [ ] **Step 5: Build + commit** — `git commit -m "feat(recipes): ID Photo domain — catalogs, prompt template, smart rules"`

---

### Task 5: Wiring App.tsx → engine + StartScreen recipe picker + switcher

**Files:**
- Modify: `App.tsx` (besar)
- Modify: `components/StartScreen.tsx`
- Modify: `services/browserStorage.ts` (preset per domain + recents ber-domain)
- Modify: `components/PresetLibraryModal.tsx` (props domainId)

- [ ] **Step 1: App.tsx** — ganti state cinematic langsung dengan `useDomainState(activeDomain)`; `activeDomain` dari `getDomain(domainId)` state. Render: StartScreen (view 'start') → editor: header + kiri `DomainFieldRenderer` per section + kanan prompt panel (existing, finalPrompt dari hook) + modals. Fitur khusus cinematic (Elements section, InpaintEditor, characters, scene) tetap dirender apa adanya HANYA bila `domainId === 'cinematic'`, di bawah sections engine. Prompt panel: pakai finalPrompt dari useDomainState; tombol EDIT memakai `setManual`/`clearManual`; SAVE PRESET menyimpan `domainState` minus protected keys dengan domainId.
- [ ] **Step 2: domain switcher** — pill group di header (icon+label tiap domain), ganti domain = unsaved-warning bila dirty → reset hook state; `domainId` bagian dari project.
- [ ] **Step 3: StartScreen** — "Choose your Recipe": grid kartu 5 domain aktif di registry (fase ini: Cinematic + ID Photo; sisanya tampil "Soon" disabled abu-abu) + recent projects dengan badge domain. `onNewProject(domainId, name)`.
- [ ] **Step 4: browserStorage** — key preset jadi per domain: `aichemy-presets-<domainId>`; `loadAllPresets(domainId)` membaca `public/presets/<domainId>/` (id-photo: folder baru; cinematic: folder existing `public/presets/` — kompatibilitas: cinematic tetap path lama). RecentProjectEntry + autosave menyimpan `domainId`.
- [ ] **Step 5: PresetLibraryModal** — terima `domainId`, panggil storage per domain.
- [ ] **Step 6: Build + commit** — `git commit -m "feat(recipes): App wiring to engine, recipe picker, per-domain presets"`

---

### Task 6: Project format v3 + import legacy

**Files:**
- Modify: `packages/shared-core/hooks/useProjectIO.ts` (atau buat `services/projectIO.ts` baru bila lebih bersih — pilih satu, hapus jalur lama)
- Modify: `App.tsx` (pemakaian)

- [ ] **Step 1: format v3:** `{ id, name, version: '3.0.0', timestamp, domainId, domainState, referencePhotoDataUrl? }`. Export = downloadTextFile (existing helper). Import: deteksi `version`/field — v3 → langsung; file lama (punya `promptState` tanpa `domainId`) → domainId='cinematic', domainState=normalizePromptState(promptState lama) + restore elements cinematic bila ada.
- [ ] **Step 2: round-trip test manual** — export dari UI, import kembali, state pulih (Task 8 verifikasi browser).
- [ ] **Step 3: Build + commit** — `git commit -m "feat(recipes): project file v3 with domainId + legacy import"`

---

### Task 7: Reference photo field + copy gambar+teks

**Files:**
- Create: `components/ReferencePhotoField.tsx`
- Modify: `App.tsx` (render di atas prompt panel bila `domain.referencePhoto`) + tombol COPY

- [ ] **Step 1: `ReferencePhotoField.tsx`** — drop zone + file input + preview thumbnail + remove; simpan dataURL di state App (session; masuk project export bila <500KB); gaya pastel token (border dashed `border-dim`, rounded-card).
- [ ] **Step 2: copy logic** — `handleCopy`: bila ada foto & `navigator.clipboard.write` tersedia → `ClipboardItem({ 'image/png': blob, 'text/plain': prompt })` dalam try/catch; fallback `writeText(prompt)` + tampilkan hint toast kecil "Prompt copied — attach your photo in the AI app". Feedback "COPIED" existing dipertahankan.
- [ ] **Step 3: Build + commit** — `git commit -m "feat(recipes): reference photo field + clipboard image+text copy"`

---

### Task 8: Verifikasi end-to-end (browser) + asset checklist

**Files:**
- Create: `scripts/generate-asset-checklist.mjs` → output `design/asset-checklist.md`

- [ ] **Step 1: browser smoke (tool browser/Playwright):** start screen → 2 kartu aktif + 3 "Soon"; buka ID Photo → isi semua section → prompt mengandung hex latar, rasio, klausa referensi, negatives; warning kontras putih-putih muncul; upload foto → preview; COPY (teks) feedback; save preset → reload → preset ada; export → import round-trip; ganti ke Cinematic → **paritas prompt** dengan versi sebelum engine (bandingkan string untuk state yang sama dengan main branch lama bila perlu via git stash); tema light/dark OK.
- [ ] **Step 2: asset checklist** — script membaca DOMAINS, menulis daftar `public/images/<domain>/<kategori>/<slug>.webp` yang direferensikan + suggested prompt per entri (untuk user generate nanti).
- [ ] **Step 3: Build final + commit** — `git commit -m "feat(recipes): asset checklist generator + e2e verified"`
