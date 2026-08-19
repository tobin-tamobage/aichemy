# Aichemy Recipes — Multi-Domain Prompt Builder Design Spec

**Date:** 2026-08-19
**Status:** Approved by user (brainstorm + 4 research docs)
**Project:** Aichemy (ex renderzero-web)

## 1. Goal

Menambah sistem **"Recipes"**: multi-domain prompt builder. Empat domain baru di samping Cinematic: **ID Photo, Wedding, Product, Marketing**. Semua konten UI & output prompt dalam **bahasa Inggris**. Output tetap teks prompt yang user paste ke app AI mereka (Gemini/ChatGPT/Midjourney/dll), digabung foto referensi yang user attach sendiri di app tersebut.

## 2. Architecture — Recipes Engine

Setiap domain = satu file config deklaratif `domains/<id>.ts`:

```ts
interface DomainRecipe {
  id: string;                    // 'cinematic' | 'id-photo' | 'wedding' | 'product' | 'marketing'
  label: string;                 // 'ID Photo'
  icon: string;                  // emoji
  tagline: string;
  sections: DomainSection[];     // accordion sections, declarative
  buildPrompt: (state: PromptState) => string;  // per-domain template
  presets: PresetRef[];          // per-domain packaged presets
  referencePhoto: boolean;       // true → tampilkan field upload referensi
}

interface DomainSection {
  id: string; title: string; icon?: string;
  fields: DomainField[];
}

type DomainField =
  | { kind: 'textarea'; key: string; label: string; placeholder: string; rows?: number }
  | { kind: 'select'; key: string; label: string; options: Option[] }          // dropdown
  | { kind: 'visual'; key: string; label: string; category: string; options: Option[] }  // thumbnail grid
  | { kind: 'chips'; key: string; label: string; options: Option[]; max?: number }       // multi-select
  | { kind: 'toggle'; key: string; label: string; hint?: string }
  | { kind: 'reference'; key: string; label: string };  // reference photo upload

interface Option { value: string; label: string; image?: string; hint?: string; disabledReason?: string }
// Conditional fields: field.visibleWhen?: (state) => boolean  (mis. pose catalog mengikuti moment)
```

**Mesin generik** (`components/DomainBuilder.tsx` + `hooks/useDomainState.ts`) me-render sections/fields dari config — komponen lapangan (`StudioAccordionSection`, `VisualSelector`, `Selector`, `TextInput`, chips, toggle) dipakai ulang. Builder sinematik yang sekarang **diekstrak** menjadi `domains/cinematic.ts`; App.tsx merender engine, bukan JSX hardcoded per seksi.

**State:** satu `PromptState` generik = `Record<string, unknown>` per domain + meta (projectName, domainId). Autosave localStorage, recent projects, export/import `.nbproject` menyertakan `domainId`. **Preset per domain** (packaged di `public/presets/<domain>/`, user preset di localStorage per domain).

**StartScreen:** "Choose your Recipe" — 5 kartu domain (icon, label, tagline) + recent projects (dengan badge domain). Header workspace: pill switcher antar domain (ganti domain = reset state, dengan unsaved-warning).

## 3. Domain Designs

### 3.1 ID Photo (`id-photo`) — referencePhoto: true
Sections:
1. **Purpose & Document** — select: Job Application (CV), LinkedIn/Professional, Passport/Visa, KTP/SKCK/Official ID, Academic/Campus, Corporate Badge, Other.
2. **Country & Print Size** — select country standard (Indonesia, US 2×2in, EU 35×45mm, UK, Japan, India, Schengen visa…) → auto-suggest background & rasio; select print size (2×3, 3×4, 4×6 cm, 2×2 in, 35×45, 50×70mm) → template menyebut rasio eksplisit.
3. **Background** — visual select: Red `#C8102E`, Blue `#1E6FD9`, White `#FFFFFF`, Light Grey, Light Blue, Custom. Indonesia official → hint konvensi "Red = odd birth year, Blue = even".
4. **Outfit & Appearance** — select outfit (white shirt, shirt+black/navy/charcoal blazer, batik long-sleeve, blouse, suit+tie, polo), toggle hijab (+warna), toggle glasses warning.
5. **Expression & Framing** — select: Neutral (official) / Soft smile (CV/LinkedIn); framing head-and-shoulders (face 70–80% biometrik) / half-body.

Smart rules:
- Purpose→auto-suggest: Passport/Visa → white bg + neutral + face 70–80% (locked chips).
- Validasi kontras: white shirt + white bg → warning + saran blazer (UI warning, tidak blokir).
- Template selalu menyertakan: `seamless solid <color> background (<hex>), no shadows on background, soft even studio lighting, front-facing centered symmetrical pose, sharp focus, natural skin texture, no beauty filter`.
- Reference mode: prompt diawali klausa `Use the attached photo as the exact identity reference. Preserve facial features, skin tone, and face shape. Replace background and attire as specified. Ignore the original outfit and background.`
- Disclaimer UI: "AI photos work for CV/LinkedIn/applications; official biometric documents may reject them."

### 3.2 Wedding (`wedding`) — referencePhoto: false
Sections:
1. **Moment & Scene** — select: Getting Ready, First Look, Ceremony, Couple Portraits, First Dance, Reception, Detail Shots.
2. **Pose & Framing** — visual select; **catalog berubah mengikuti moment** (conditional field); framing select (close-up, full-length, OTS, from behind, macro, silhouette).
3. **Venue & Setting** — visual select: cathedral, chapel, garden estate, beach, vineyard, barn, ballroom, rooftop, forest, mountain, villa.
4. **Lighting & Atmosphere** — visual select: golden hour, blue hour, window light, candlelight, string lights, stained glass rays, overcast, sparkler, DJ lights.
5. **Photography Style & Film** — select (single-select paksa): Editorial, Documentary, Fine Art, Dark & Moody, Light & Airy, Classic, Vintage/Film, B&W, Cinematic + film stock keyword (Portra 400, Fuji 400H, Ilford HP5).

Smart rules: template auto-konsisten lensa↔framing (wide scene → 24mm; portrait → 85mm f/1.4; macro detail → 100mm); style single-select mencegah konflik; prompt ≤80 kata.

### 3.3 Product (`product`) — referencePhoto: true
Sections:
1. **Product & Category** — textarea nama produk + select category (Skincare/Beauty, Food & Beverage, Fashion & Accessories, Electronics, Jewelry, Home Goods).
2. **Shot Type** — visual select: hero, eye-level, 45-degree, flat lay, macro detail, lifestyle/in-context, scale shot, levitation.
3. **Surface & Background** — visual select: white sweep, marble, wood, gradient studio, colored paper, concrete, linen, black glossy, outdoor.
4. **Studio Lighting** — visual select (single-select): softbox, soft shadow, rim light, dramatic hard shadow, window light, golden hour, backlit, gel light.
5. **Props & Composition** — chips (max 3, catalog ikut category) + toggles: *Negative space for ad copy*, *Blank label (no text)*, composition select (centered, rule of thirds, symmetric).

Smart rules: "one scene, one light" (lighting single-select); template menambah constraint fisik `85mm f/8 product shot` sebagai ganti kata "realistic"; reference clause `Use the attached product photo as the product. Do not redraw or alter the product itself; build the scene around it.`

### 3.4 Marketing (`marketing`) — referencePhoto: true (opsional)
Sections:
1. **Content Type** — select: Sale/Promo Flyer, Social Media Post, IG/TikTok Story, Web Banner, Poster, Product Announcement, Event Flyer, Coupon/Voucher.
2. **Format & Size** — select: 1:1 post, 9:16 story (safe-zone clause), 16:9 banner, 2:3 poster, A4 flyer, 4:5 feed.
3. **Design Style** — visual select: Minimalist, Bold/Brutalist, Modern Gradient, Retro, Luxury, Playful, Corporate Clean, Streetwear, Organic/Elegant.
4. **Color & Typography** — select preset palet (8) + select typography style (bold sans, elegant serif, hand-written, mono…).
5. **Headline & Promo Elements** — textarea headline; select text strategy (render exact text / placeholder "HEADLINE" / empty area for Canva); chips promo elements (max 3: discount badge, CTA button, price tag, countdown, star rating, logo placeholder circle).

Smart rules: "1 prompt = 1 message" guardrail (hint bila >3 elemen); story safe-zone clause; default rekomendasi render exact text untuk GPT Image/Imagen, placeholder untuk Midjourney.

## 4. Reference Photo & Clipboard

- Field `reference` menampilkan upload (FileReader → dataURL preview, disimpan di localStorage project bila <500KB, else session-only).
- **Copy**: coba `navigator.clipboard.write([ClipboardItem{ 'image/png', 'text/plain' }])` (Chrome/Edge). Fallback/saat tidak ada foto: `writeText` + hint "Attach your reference photo in your AI app".
- Prompt selalu menyertakan klausa referensi bila `referencePhoto: true` (meski user belum upload — foto di-attach nanti di app AI).

## 5. Visual Assets (Thumbnails)

- Konvensi: `public/images/<domain>/<category>/<slug>.webp` (maks 640px, WebP q78 — pipeline yang sudah ada).
- VisualSelector mendapat **placeholder state** (tile pastel + initial/icon) bila file belum ada — tidak broken.
- **Asset checklist**: build-time/dev script menghasilkan `design/asset-checklist.md` — daftar file yang dibutuhkan per domain + suggested prompt (dari domain config) untuk user generate sendiri nanti (dogfooding).
- Re-use katalog sinematik (lighting, focal-length, shots) di Wedding/Product bila cocok (config mereferensikan kategori yang sama).

## 6. Non-Goals

- Tidak ada generasi gambar di web (tetap prompt-only, no backend, no API).
- Tidak ada crop/print-tool pas foto (presisi cm di luar AI).
- Opsi attire lokal Indonesia eksplisit (kebaya/beskap) TIDAK masuk katalog — user attach foto referensi pakaian sendiri.
- Tidak ada login/auth (fase nanti).

## 7. Error Handling

- localStorage penuh saat simpan foto referensi → fallback session-only + toast kecil.
- Clipboard write gambar gagal → fallback writeText + hint.
- Config domain invalid (missing field) → ErrorBoundary menampilkan pesan, domain lain tetap jalan.
- Import `.nbproject` dengan domainId tak dikenal → error message ramah + tidak merusak state.

## 8. Verification

- Build hijau; grep tidak ada sisa hardcoded cinematic JSX di App.tsx (semua via engine).
- Browser: ganti domain dari start screen & switcher; tiap domain: isi field → prompt update sesuai template domain; conditional fields (pose mengikuti moment; props mengikuti category) bekerja; smart rules (contrast warning, auto-suggest) tampil; reference upload → preview; copy dengan/tanpa gambar; preset per domain save/load; export/import round-trip menjaga domainId; tema light/dark konsisten.

## 9. Phasing

- **Fase 1 (spec ini):** Recipes engine + ekstraksi Cinematic + **ID Photo** lengkap (membuktikan pola reference-photo & conditional fields) + placeholder assets + asset checklist.
- **Fase 2:** Wedding + Product.
- **Fase 3:** Marketing.

## 10. Research References

`design/research-wedding.md`, `design/research-pasfoto.md`, `design/research-produk.md`, `design/research-marketing.md` (anatomi prompt, katalog field lengkap, contoh prompt jadi, jebakan + mitigasi, sumber 2025/2026).
