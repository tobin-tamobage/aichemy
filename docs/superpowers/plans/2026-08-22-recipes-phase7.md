# Aichemy Recipes Phase 7 - Visual Parity (semua opsi punya contoh hasil)

> **For agentic workers:** Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Setiap field kreatif di semua studio memakai `VisualSelector` (thumbnail contoh hasil), bukan dropdown polos. Opsi kamera/lensa/fotografer/film memakai ulang aset shared milik recipe Cinematic (`public/images/cameras|focal-length|lenses|photographers|films/*.webp` — semua sudah ada di disk). Field yang katalognya sudah membawa `image:` cukup di-flip `kind: 'select'` → `kind: 'visual'`.

**User directive:** "aku tidak mau opsi untuk pilihan biasa, aku mau semua opsi memberikan contoh hasil, dan untuk kamera lensa dll, kan kamu bisa menggunakan asset sama dari recipe cinematic, ayo pelajari secara dalam alur di recipe cinematic dan aplikasikan detail seperti itu untuk semua recipe lain".

**Repo:** `/Users/tobin/Documents/Aichemy/renderzero-web`, branch `recipes-phase7`. Base: `main` @ `747cb4f`.

**Cinematic pipeline (referensi, dipelajari):**
1. `packages/shared-core/constants.ts`: `RAW_*` → `createOptions(WithValues)` → `image: '/images/<category>/<slug>.webp'` (shared, non-domain). Kategori di disk: `cameras`(49), `focal-length`(9), `lenses`(12), `photographers`(99), `films`(30), dll.
2. `domains/cinematic.ts` `toVisualOptions` memetakan `{value,label,image}` → DomainOption; field `kind: 'visual'` + `previewRatio`.
3. `DomainFieldRenderer` case `'visual'` → `VisualSelector`; **missing image → tile inisial** (`imgFailed` state, `getInitials`) — aman untuk aset yang belum digenerate.
4. Field select sisa di cinematic (`imageAspectRatio`, `outputFormat`) adalah utility format — **bukan** contoh pola kreatif; cinematic tidak diubah sama sekali.

**DomainOption.image tetap dipakai apa adanya; tidak ada perubahan types.ts, registry, storage, builder, App.tsx, DomainFieldRenderer (visual sudah didukung).**

---

## §1 Keputusan desain (locked)

1. **Kamera body di-re-pick dari shared catalog cinematic** (aset sudah ada; prompt berubah — dimandatkan user). Phase-6 bodies (Sony A7R V, Canon EOS R5, Nikon Z8, GFX 100 II, Leica SL3, Hasselblad X2D) **dibuang** karena tidak punya aset shared.
   - Shared picks + phrase baru (verbatim, dipakai semua domain):
     | value | label | promptPhrase | image |
     |---|---|---|---|
     | `canon-eos-5d` | `Canon EOS 5D` | `Canon EOS 5D, full-frame DSLR` | `/images/cameras/canon-eos-5d.webp` |
     | `fujifilm-x-t4` | `Fujifilm X-T4` | `Fujifilm X-T4, 26MP APS-C mirrorless` | `/images/cameras/fujifilm-x-t4.webp` |
     | `hasselblad-x1d-ii` | `Hasselblad X1D II` | `Hasselblad X1D II, 50MP medium format mirrorless` | `/images/cameras/hasselblad-x1d-ii.webp` |
     | `pentax-645z` | `Pentax 645Z` | `Pentax 645Z, 51MP medium format` | `/images/cameras/pentax-645z.webp` |
     | `phase-one-xf-iq4` | `Phase One XF IQ4` | `Phase One XF IQ4, 150MP medium format` | `/images/cameras/phase-one-xf-iq4.webp` |
     | `lumix-gh5` | `Lumix GH5` | `Lumix GH5, micro four thirds mirrorless` | `/images/cameras/lumix-gh5.webp` |
     | `iphone-pro` | `iPhone Pro` | `modern iPhone Pro camera, computational photography` | `/images/cameras/iphone-pro.webp` |
2. **Lensa memakai shared `focal-length` tiles** (semua ada): mapping per opsi di tiap task di bawah. `70-200mm` → tile `200mm-super-telephoto.webp`; `24-70mm` → tile `24mm-wide-angle.webp`; tilt-shift → `/images/lenses/tilt-shift-lens.webp`.
3. **Opsi `auto`/`auto`-sejenis: tanpa `image` key** → tile inisial "AU" (graceful, nol aset baru).
4. **Semua `kind: 'select'` kreatif di-flip ke `kind: 'visual'`** (single-select semantics identik — visual memang single-only di FieldDef). **Chips TETAP chips** (attire, props, qualityChips, stylingProps, promoElements): FieldDef visual tidak punya multi-select; perluasan tipe = di luar scope phase ini.
5. **`previewRatio` konvensi cinematic:** orang/gaya `aspect-square`; scene/angle/kamera `aspect-video`; lighting/backdrop `aspect-[4/3]`; per-field di-assign di tiap task.
6. **Preset lama:** value field yang di-flip tidak berubah → preset utuh. Value kamera BERUBAH (re-pick) → preset lama dengan `camera: 'sony-a7rv'` dsb. jatuh ke find-fallback `?? CATALOG[0]` (resilience existing, di-probe di e2e).
7. **Checklist script** (`scripts/generate-asset-checklist.mjs`): shared path 3-segmen saat ini salah kategori (filename jadi kategori). Fix: `parts.length >= 4 ? parts[2] : \`shared/${parts[1]}\``. Regen → commit.
8. **Aset baru hanya 5:** `images/real-estate/technique/{hdr-bracketing,drone-aerial}.webp`, `images/food/styles/{kinfolk-editorial,bon-appetit,clean-cookbook}.webp`. Aset domain `images/real-estate/angles/tilt-shift-24mm.webp` (phase 6) di-drop (re-point ke shared) → checklist -1.

---

## §2 Task 1 — Portrait + Wedding

**Files:** `domains/portrait-catalogs.ts`, `domains/portrait.ts`, `domains/wedding-catalogs.ts`, `domains/wedding.ts`.

### Portrait
1. **PORTRAIT_CAMERAS diganti total** (5 opsi, shared picks): `canon-eos-5d` (DEFAULT — ganti `sony-a7rv`), `hasselblad-x1d-ii`, `fujifilm-x-t4`, `pentax-645z`, `phase-one-xf-iq4`. Kolom persis tabel §1.1.
2. **PORTRAIT_LENSES image re-point** ke shared focal tiles: `85mm-closeup`→`/images/focal-length/85mm-portrait.webp`, `50mm-half`→`/images/focal-length/50mm-standard.webp`, `35mm-environmental`→`/images/focal-length/35mm-wide.webp`, `200mm-tight`→`/images/focal-length/200mm-super-telephoto.webp`. Value/label/promptPhrase TIDAK berubah.
3. **PORTRAIT_PHOTOGRAPHERS tambah image** shared: `annie-leibovitz`→`/images/photographers/annie-leibovitz.webp`, `peter-lindbergh`→`peter-lindbergh.webp`, `platon`→`platon.webp`, `richard-avedon`→`richard-avedon.webp`, `steve-mccurry`→`steve-mccurry.webp`, `rankin`→`rankin.webp`. Opsi `auto` tanpa image.
4. **Flip semua field portrait ke visual** (portrait.ts): `portraitType` (`aspect-square`), `lighting` (`aspect-[4/3]`), `background` (`aspect-[4/3]`), `wardrobe` (`aspect-square`), `expression` (`aspect-square`), `lens` (`aspect-video`), `camera` (`aspect-video`), `photographer` (`aspect-square`).
5. Default prompt berubah: blok Camera jadi `Camera: Canon EOS 5D, full-frame DSLR.`

### Wedding
1. **WEDDING_CAMERAS diganti total** (4 opsi): `canon-eos-5d` (DEFAULT — ganti `canon-r5`), `fujifilm-x-t4`, `lumix-gh5`, `hasselblad-x1d-ii`. Kolom persis tabel §1.1.
2. **WEDDING_LENSES image** (re-point shared): `auto` tanpa image; `24mm`→`24mm-wide-angle.webp`, `35mm`→`35mm-wide.webp`, `50mm`→`50mm-standard.webp`, `85mm`→`85mm-portrait.webp`, `70-200mm`→`200mm-super-telephoto.webp`, `100mm-macro`→`100mm-macro.webp` (semua di `/images/focal-length/`).
3. **FILM_STOCK_KEYWORDS image re-point ke shared films** bila match semantik: `portra-400`→`/images/films/portra-400.webp`, `fuji-400h`→`/images/films/fuji-pro-400h.webp`, `ilford-hp5`→`/images/films/ilford-hp5-plus.webp`; cek opsi lain terhadap `ls public/images/films/` (kodak-gold-200, kodak-tri-x-400, portra-160/800, fuji-acros-100 dll.); tanpa match → biarkan image existing / tanpa image.
4. **Flip field wedding ke visual:** `moment` (`aspect-video`), `framing` (`aspect-square`), `style` (`aspect-video`), `filmStock` (`aspect-video`), `camera` (`aspect-video`), `lensOverride` (`aspect-video`). `venue`/`lighting` sudah visual — tidak disentuh.
5. Default prompt berubah: `...shot on 24mm wide angle, deep depth of field, Canon EOS 5D, full-frame DSLR.`

**Acceptance Task 1:** `tsc --noEmit` 0; build hijau; probes: default prompts persis di atas; tiap opsi kamera/lensa/fotografer/film membawa image shared yang exists di disk; `auto` tanpa image; commit.

## §3 Task 2 — Product + Real Estate + Food

**Files:** `domains/product-catalogs.ts`, `domains/product.ts`, `domains/real-estate-catalogs.ts`, `domains/real-estate.ts`, `domains/food-catalogs.ts`, `domains/food.ts`.

### Product
1. **PRODUCT_CAMERAS diganti total** (5 opsi): `phase-one-xf-iq4` (DEFAULT — tetap id default), `hasselblad-x1d-ii`, `pentax-645z`, `canon-eos-5d`, `fujifilm-x-t4`. Kolom persis §1.1.
2. **PRODUCT_LENSES image**: `85mm-f8`→`85mm-portrait.webp`, `50mm`→`50mm-standard.webp`, `100mm-macro`→`100mm-macro.webp`, `24-70mm`→`24mm-wide-angle.webp`, `90mm-ts`→`/images/lenses/tilt-shift-lens.webp`.
3. **Flip:** `category` (`aspect-square`), `composition` (`aspect-video`), `lens` (`aspect-video`), `camera` (`aspect-video`). `shotType`/`surface`/`lighting` sudah visual. PRODUCT_CATEGORIES tanpa image (abstrak) → tile inisial, boleh.
4. Default tail berubah: `85mm f/8 product shot, Phase One XF IQ4, 150MP medium format`.

### Real Estate
1. **RE_ANGLES tilt-shift-24mm image** → `/images/lenses/tilt-shift-lens.webp` (drop aset domain `angles/tilt-shift-24mm.webp` — regen checklist -1).
2. **RE_CAMERAS (cameraTechnique) image**: `full-frame`→`/images/cameras/canon-eos-5d.webp`; `hdr-bracketing`→`img('technique', 'hdr-bracketing')` (BARU); `drone`→`img('technique', 'drone-aerial')` (BARU). (+2 aset)
3. **Flip:** `scene` (`aspect-video`), `designStyle` (`aspect-video`), `timeOfDay` (`aspect-[4/3]`), `staging` (`aspect-video`), `angleLens` (`aspect-video`), `cameraTechnique` (`aspect-video`). `exteriorStyle` sudah visual.
4. Default prompt: `Shot with a 16mm wide-angle lens, natural perspective. Shot on a full-frame mirrorless camera, high resolution.` — tidak berubah.

### Food
1. **FOOD_CAMERAS diganti total** (4 opsi): `canon-eos-5d` (DEFAULT — ganti `sony-a7rv`), `fujifilm-x-t4`, `hasselblad-x1d-ii`, `iphone-pro`. Kolom persis §1.1.
2. **FOOD_LENSES image**: `auto` tanpa image; `50mm`→`50mm-standard.webp`, `85mm`→`85mm-portrait.webp`, `100mm-macro`→`100mm-macro.webp`, `24-70mm`→`24mm-wide-angle.webp`.
3. **FOOD_STYLES (publicationStyle) image BARU**: `auto` tanpa image; `kinfolk-editorial`→`img('styles','kinfolk-editorial')`, `bon-appetit`→`img('styles','bon-appetit')`, `clean-cookbook`→`img('styles','clean-cookbook')`. (+3 aset)
4. **Flip SEMUA field food:** `dish` (`aspect-video`), `presentation` (`aspect-video`), `lightMood` (`aspect-[4/3]`), `angle` (`aspect-video`), `backdrop` (`aspect-[4/3]`), `lens` (`aspect-video`), `camera` (`aspect-video`), `publicationStyle` (`aspect-video`).
5. Default prompt angle block berubah: `Shot from a 45-degree angle on a 50mm lens, Canon EOS 5D, full-frame DSLR.` (50mm karena `auto` derive untuk angle default 45-degree... VERIFIKASI: FOOD_ANGLES[0] actual → derive map riset §4; tulis string final hasil probe).

**Acceptance Task 2:** `tsc --noEmit` 0; build; probes per domain (default strings + image keys + auto-tanpa-image + semua shared image exists); commit.

## §4 Task 3 — ID Photo + Marketing (pure flips)

**Files:** `domains/id-photo.ts`, `domains/marketing.ts` saja. Kedua katalog sudah 100% image keys (38/38, 47/47) — **hanya** `kind` + `previewRatio` berubah; nol perubahan katalog; nol perubahan prompt.

1. **id-photo.ts:** flip `purpose` (`aspect-square`), `country` (`aspect-square`), `printSize` (`aspect-square`), `outfit` (`aspect-square`), `hijabColor` (`aspect-square`), `expression` (`aspect-square`), `framing` (`aspect-square`). `background` sudah visual.
2. **marketing.ts:** flip `contentType` (`aspect-video`), `format` (`aspect-square`), `typography` (`aspect-square`), `textStrategy` (`aspect-video`). `designStyle`/`colorScheme` sudah visual.

**Acceptance Task 3:** `tsc --noEmit` 0; build; probe: prompt byte-identik vs `git stash` untuk state default kedua domain (flips tidak menyentuh buildPrompt); commit.

## §5 Task 4 — Script fix + checklist regen + e2e

1. **Fix kategori shared** di `scripts/generate-asset-checklist.mjs`: `const category = parts.length >= 4 ? parts[2] : \`shared/${parts[1]}\`;` (ganti baris `parts.length >= 3 ? parts[2] : 'misc'`).
2. Regen: `node scripts/generate-asset-checklist.mjs` → commit `design/asset-checklist.md` (diff: +shared/cameras, +shared/focal-length, +shared/photographers, +shared/films, +shared/lenses, +technique(2), +styles(3) food, -angles/tilt-shift-24mm, -lenses portrait 4 lama).
3. **e2e browser (semua 8 studio):**
   - a. Setiap studio: semua field kreatif render sebagai grid tile VisualSelector (bukan `<select>`); chips tetap chips.
   - b. **Nol 404** untuk `/images/cameras|focal-length|lenses|photographers|films/*` yang direferensikan (assert via network listener saat membuka tiap picker).
   - c. Tile tanpa image (auto, PRODUCT_CATEGORIES) → render inisial, bukan broken image.
   - d. Prompt default persis: portrait `Camera: Canon EOS 5D, full-frame DSLR.`; wedding `...deep depth of field, Canon EOS 5D, full-frame DSLR.`; product `...85mm f/8 product shot, Phase One XF IQ4, 150MP medium format`; RE unchanged; food string hasil probe Task 2.
   - e. Pilih fotografer Annie Leibovitz (portrait) → klausa style; pilih kamera Hasselblad (wedding) → prompt berubah ke phrase X1D II.
   - f. **Preset lama dengan `camera:'sony-a7rv'`** → load tanpa crash, kamera jatuh ke opsi pertama (fallback), prompt memakai bodi fallback.
   - g. Save/reload preset, export/import round-trip, light/dark.
4. Final build + commit `feat(recipes): visual parity live, e2e verified`.

## §6 Scope & Anti-Patterns

- **JANGAN** ubah: `cinematic.ts`, `packages/shared-core/*` (read-only referensi), `types.ts`, registry, storage, builder, `App.tsx`, `DomainFieldRenderer.tsx`, `VisualSelector.tsx` (sudah handle missing image + previewRatio).
- **Chips tetap chips.** Jangan extend FieldDef dengan visual multi-select.
- Katalog domains tidak import dari shared-core: image shared ditulis literal `'/images/cameras/canon-eos-5d.webp'` (konsisten dengan `img()` per-domain, beda root saja).
- Semua promptPhrase/qualityPhrase existing TIDAK berubah kecuali kolom kamera (re-pick §1.1) — warning texts, rules, ordering tetap.
- Setiap commit: `npx tsc --noEmit` 0 + `npm run build` hijau.
