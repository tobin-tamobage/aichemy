# Aichemy Recipes Phase 2 — Implementation Plan (Wedding + Product)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tambah domain **Wedding** (spec §3.2) dan **Product** (spec §3.3) sebagai DomainRecipe config lengkap, aktifkan kedua kartu StartScreen, tanpa mengubah perilaku Cinematic/ID Photo.

**Architecture:** Phase 2 murni config + satu micro-extension engine: `options` pada SelectField/VisualField/ChipsField boleh berupa fungsi `(state) => DomainOption[]` (untuk katalog pose wedding yang mengikuti moment). `DomainFieldRenderer` sudah menerima prop `state` — resolve di situ. Tidak ada perubahan format project (v3 tetap), storage preset sudah per-domain, VisualSelector placeholder menutup asset yang belum digenerate.

**Tech Stack:** Vite 6, React 19, TS, Tailwind tokens Aichemy.

**Spec:** `docs/superpowers/specs/2026-08-19-recipes-multidomain-design.md` §3.2, §3.3, §4-8. Riset: `design/research-wedding.md` (katalog §3, anatomi §1, contoh §4, jebakan §5), `design/research-produk.md` (anatomi §1, katalog §2, contoh §3, jebakan §4).

**Precedent (baca sebelum menulis config baru):** `domains/id-photo.ts` + `domains/id-photo-catalogs.ts` — pola sections, typed options (`promptPhrase` dll), `img()` helper, 10-blok `buildPrompt`, `warnings(state)`.

**Testing:** tidak ada test runner (keputusan spec) — verifikasi per task = `npm run build` hijau + verifikasi browser di Task 6. Implementer JALANKAN `npm run build` sebelum commit.

---

### Task 1: Engine micro-extension — dynamic options

**Files:**
- Modify: `domains/types.ts`
- Modify: `components/DomainFieldRenderer.tsx`

- [ ] **Step 1: `domains/types.ts`** — pada `SelectField`, `VisualField`, `ChipsField` ubah `options: DomainOption[]` menjadi `options: DomainOption[] | ((state: DomainState) => DomainOption[])`. Komentar: untuk katalog kondisional (pose wedding mengikuti moment; props product mengikuti category).
- [ ] **Step 2: `DomainFieldRenderer.tsx`** — tambah resolver di atas switch: `const resolveOptions = (f) => typeof f.options === 'function' ? f.options(state) : f.options;` dan pakai hasilnya saat mem-pass options ke `Selector`/`VisualSelector`/chips. JANGAN mengubah perilaku field statis.
- [ ] **Step 3: Build + commit** — `git commit -m "feat(recipes): dynamic options resolver for conditional catalogs"`

---

### Task 2: domains/wedding-catalogs.ts

**Files:**
- Create: `domains/wedding-catalogs.ts`

- [ ] **Step 1: katalog** — semua dari `design/research-wedding.md` §3 (baca dulu; semua label English; path gambar via `img()` = `images/wedding/<kategori>/<slug>.webp`):
  - `MOMENTS` (7, research §3.1 = spec §3.2 section 1): Getting Ready, First Look, Ceremony, Couple Portraits, First Dance, Reception, Detail Shots.
  - `POSES_BY_MOMENT: Record<string, PoseOption[]>` (research §3.2 — katalog per momen; tiap opsi bawa `promptPhrase`).
  - `FRAMINGS` (6, spec §3.2 section 2): close-up, full-length, over-the-shoulder, from behind, macro, silhouette — tiap opsi bawa `promptPhrase`.
  - `VENUES` (11, spec §3.2 section 3 = research §3.3): cathedral, chapel, garden estate, beach, vineyard, barn, ballroom, rooftop, forest, mountain, villa — bawa `promptPhrase`.
  - `WEDDING_LIGHTING` (9, spec §3.2 section 4 = research §3.4): golden hour, blue hour, window light, candlelight, string lights, stained glass rays, overcast, sparkler, DJ lights — bawa `promptPhrase`.
  - `STYLES` (9, research §2, single-select): Editorial, Documentary, Fine Art, Dark & Moody, Light & Airy, Classic, Vintage/Film, B&W, Cinematic — tiap opsi bawa `promptModifier` (research §2 memberi modifier per gaya).
  - `FILM_STOCK_KEYWORDS` (spec §3.2: Portra 400, Fuji 400H, Ilford HP5 + opsi None) — select, keyword disisipkan hanya bila dipilih.
  - `ATTIRE` (research §3.5 — bride/groom sub-options termasuk lokal Indonesia bila ada di doc) — chips.
  - `WEDDING_RATIOS` (research §3.8) — tiap opsi bawa `ratio`.
- [ ] **Step 2: Build + commit** — `git commit -m "feat(recipes): wedding domain catalogs"`

---

### Task 3: domains/wedding.ts — recipe + template + smart rules

**Files:**
- Create: `domains/wedding.ts`

- [ ] **Step 1: recipe** — `id: 'wedding'`, `label: 'Wedding'`, icon `💍`, tagline dari StartScreen card ('Couple portraits, ceremony, and reception moments.'). `referencePhoto: false` (spec §3.2 — TIDAK ada reference clause; riset §5 melarang mode ganti identitas wajah). `presetProtectedKeys: []`. `createEmptyState` → moment `ceremony`, style `documentary`, dst. (default paling umum dari riset).
- [ ] **Step 2: sections** (5, persis spec §3.2): 01 Moment & Scene (select `moment`); 02 Pose & Framing (visual `pose` — **options fungsi: `POSES_BY_MOMENT[state.moment]`**, pakai Task 1; select `framing` FRAMINGS); 03 Venue & Setting (visual `venue`); 04 Lighting & Atmosphere (visual `lighting`); 05 Photography Style & Film (select `style` STYLES — single-select paksa, select `filmStock`).
- [ ] **Step 3: `buildPrompt`** — anatomi riset §1 (9 blok, shot type dulu): pose/framing phrase → subject + attire → action/moment → venue → lighting → mood (dari style modifier) → style → kamera. **Aturan lensa↔framing (spec smart rule, research §3.7)**: derived, BUKAN field user — wide/full-length scene → `24mm`, portrait/close-up → `85mm f/1.4`, macro/detail → `100mm macro`. Film stock keyword bila dipilih. Target ≤80 kata (spec) — gabung blok jadi kalimat ringkas, bukan paragraf per blok seperti id-photo.
- [ ] **Step 4: `warnings`** — dari riset §5 (12 jebakan): minimal (a) moment `detail-shots` + framing bukan macro/close-up → info "Detail shots work best with macro/close-up framing (100mm)."; (b) lighting `golden-hour`/`blue-hour` + venue indoor (cathedral/chapel/ballroom) → warn "Golden/blue hour needs outdoor or window access — check venue choice."; (c) style B&W/Vintage + sparkler/DJ lights → info konfirmasi mood. Petakan jebakan lain yang relevan ke state yang ada; jangan mengarang rule untuk field yang tidak ada.
- [ ] **Step 5: Build + commit** — `git commit -m "feat(recipes): wedding domain — recipe, prompt template, smart rules"`

---

### Task 4: domains/product-catalogs.ts

**Files:**
- Create: `domains/product-catalogs.ts`

- [ ] **Step 1: katalog** — dari `design/research-produk.md` §2 (baca dulu; label English; `img()` = `images/product/<kategori>/<slug>.webp`):
  - `PRODUCT_CATEGORIES` (6, spec §3.3 section 1): Skincare & Beauty, Food & Beverage, Fashion & Accessories, Electronics, Jewelry, Home Goods/Other — tiap opsi bawa `defaultProps: string[]` (riset §2.1).
  - `PRODUCT_SHOT_TYPES` (8, §2.2): hero, eye-level, 45-degree, flat-lay, macro, lifestyle, scale, floating — bawa `promptPhrase`.
  - `SURFACES` (9, §2.3): white-sweep (hint marketplace `marketplace: true`), marble, wood, gradient, colored-paper, concrete, linen, dark-glossy, outdoor (hint lifestyle only) — bawa `promptPhrase`.
  - `PRODUCT_LIGHTING` (8, §2.4, satu select — spec TIDAK membuatnya kondisional): softbox, soft-shadow, rim, dramatic-hard, window, golden-hour, backlit (hint bottles/serum), gel — bawa `promptPhrase`.
  - `PROPS_BY_CATEGORY: Record<string, PropOption[]>` (§2.5 — per category, `promptPhrase` per opsi; home-goods kosong).
  - `COMPOSITIONS` (spec §3.3 section 5: centered, rule-of-thirds, symmetric) — bawa `promptPhrase`.
  - `QUALITY_MODIFIERS` (§2.8, chips): commercial, advertising, 8k, ultra-sharp, high-detail, studio, 85mm-f8, packshot, award-winning.
  - `NEGATIVES` const (§2.9 verbatim): `distorted label, misspelled text, warped packaging, extra objects, cluttered background, harsh reflections, deformed product, low resolution, watermark, blurry`.
- [ ] **Step 2: Build + commit** — `git commit -m "feat(recipes): product domain catalogs"`

---

### Task 5: domains/product.ts — recipe + template + smart rules

**Files:**
- Create: `domains/product.ts`

- [ ] **Step 1: recipe** — `id: 'product'`, `label: 'Product'`, icon `📦`, tagline dari StartScreen card. `referencePhoto: true`, `referenceLabel: 'Product photo'`, `referenceClause` **PERSIS spec §3.3**: `Use the attached product photo as the product. Do not redraw or alter the product itself; build the scene around it.` `presetProtectedKeys: ['productName']` (teks bebas tidak ditimpa preset — pola cinematic subjectAction). `createEmptyState`: `hasReferencePhoto: true`, category `skincare`, shotType `hero`, surface `white-sweep`, lighting `softbox`, props `[]`, composition `centered`, negativeSpace `false`, blankLabel `false`, quality `['commercial','8k','ultra-sharp']`, productName `''`.
- [ ] **Step 2: sections** (5, persis spec §3.3): 01 Product & Category (textarea `productName` placeholder 'E.g., minimalist frosted glass serum bottle with white dropper cap…' + select `category`); 02 Shot Type (visual `shotType`); 03 Surface & Background (visual `surface`); 04 Studio Lighting (visual `lighting` — single-select by kind); 05 Props & Composition (chips `props` **max 3, options fungsi: `PROPS_BY_CATEGORY[state.category] ?? []`** — visibleWhen category punya props; toggle `negativeSpace` label 'Negative space for ad copy'; toggle `blankLabel` label 'Blank label (no text)'; select `composition`; chips `quality` QUALITY_MODIFIERS).
- [ ] **Step 3: `buildPrompt`** — 9 blok (riset §1 skeleton + §3 contoh, pisah `\n\n` pola id-photo): 1 reference clause (gate `hasReferencePhoto !== false`); 2 `Professional product photography, ${shot.promptPhrase}`; 3 subject — productName bila diisi, fallback `the product` + bila `blankLabel` tambah `with a blank minimal label (no text)`; 4 `on ${surface.promptPhrase}`; 5 lighting phrase (SATU sumber — never mix); 6 props (join promptPhrase) + `, props support the product, product remains the focal point` — skip blok bila kosong; 7 composition phrase + bila `negativeSpace` tambah `, generous negative space on the left for ad copy / headline text`; 8 quality chips join + constraint fisik spec: `85mm f/8 product shot` (bukan kata "realistic"); 9 `Negative: ${NEGATIVES}.`
- [ ] **Step 4: `warnings`** — dari riset §4 (10 jebakan), hanya yang termap ke state: (a) surface `white-sweep` + lighting bukan `soft-shadow`/`softbox` → info "Add a soft natural drop shadow — products float unintentionally on white sweeps." (jebakan #7); (b) props.length === 3 → warn "Too many props bury the product — keep it the clear focal point." (#8); (c) shotType `macro`/`floating` + category `electronics`/`jewelry` → warn "Extreme angles risk deformed geometry — keep 'accurate product proportions' in mind." (#3); (d) category berlabel (skincare/food-beverage) + `blankLabel === false` → info "AI often misspells label text — consider 'Blank label' or plan to retouch text." (#1); (e) category `electronics`/`jewelry` (glossy) → info "Glossy surfaces read plastic — add explicit micro-texture detail." (#9).
- [ ] **Step 5: Build + commit** — `git commit -m "feat(recipes): product domain — recipe, prompt template, smart rules"`

---

### Task 6: Registry + StartScreen activation + e2e verify

**Files:**
- Modify: `domains/index.ts`
- Modify: `components/StartScreen.tsx`
- Modify: `design/asset-checklist.md` (regenerate via script)

- [ ] **Step 1: registry** — import + daftar `weddingDomain`, `productDomain` di `DOMAINS` (urutan: cinematic, id-photo, wedding, product).
- [ ] **Step 2: StartScreen** — aktifkan kartu Wedding & Product (baca kartu dari `DOMAINS` bila belum; kartu 'Soon' yang tersisa hanya Marketing). Verifikasi `services/browserStorage.loadAllPresets(domainId)` toleran terhadap `public/presets/<domainId>/` yang belum ada (baca kodenya; bila fetch 404 melempar error, bungkus try/catch → return user presets saja; jangan membuat folder kosong ber-.gitkeep kecuali diperlukan).
- [ ] **Step 3: browser smoke (tool browser)** — start screen: 4 kartu aktif + 1 Soon; **Wedding**: buka → 5 section render; ganti moment → katalog pose berganti (buktikan dynamic options); prompt mengandung lens derived rule (pilih full-length → `24mm`; close-up → `85mm f/1.4`); warning golden-hour+ballroom muncul; prompt ≤80 kata. **Product**: buka → upload foto produk (pakai `public/icon.png`) → preview; prompt mengandung reference clause spec verbatim + `85mm f/8 product shot` + negatives; ganti category → props chips berganti; toggle blank label → klausa label muncul; warning props=3 muncul; save preset → reload → load → state pulih (productName TIDAK ditimpa); export v3 → import round-trip.
- [ ] **Step 4: asset checklist** — `node scripts/generate-asset-checklist.mjs` (DOMAINS baru otomatis terbaca) — commit hasil regen.
- [ ] **Step 5: Build final + commit** — `git commit -m "feat(recipes): wedding + product domains live, e2e verified"`

---

### Anti-patterns (JANGAN)

- JANGAN menambah field kind baru — union fase 1 + dynamic options (Task 1) cukup (dikonfirmasi analisis spec).
- JANGAN menaruh reference clause di Wedding (spec: `referencePhoto: false`).
- JANGAN menjadikan lighting product kondisional — spec §3.3 satu select 8 opsi; single-select itu sendiri smart rule "one scene, one light".
- JANGAN field kamera/lensa untuk wedding — lensa derived dari framing (spec smart rule).
- JANGAN menyentuh cinematic/id-photo config kecuali build merah karena perubahan tipe Task 1.
- JANGAN mengarang opsi katalog — semua label dari research docs; bila doc kurang (mis. promptPhrase venue), turunkan dari contoh prompt §4/§3 doc yang sama.
