# Aichemy Recipes Phase 3 — Implementation Plan (Marketing)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tambah domain **Marketing** (spec §3.4) sebagai DomainRecipe lengkap — domain terakhir dalam roadmap — dan aktifkan kartu StartScreen terakhir (tidak ada 'Soon' tersisa).

**Architecture:** Murni config — SEMUA field Marketing terwakili union fase 1 (textarea/select/visual/chips/toggle + dynamic options). Tidak ada perubahan engine. Format v3, preset per-domain, VisualSelector placeholder — semua sudah jalan.

**Tech Stack:** Vite 6, React 19, TS, Tailwind tokens Aichemy.

**Spec:** `docs/superpowers/specs/2026-08-19-recipes-multidomain-design.md` §3.4 (authoritative untuk sections/list), §4-8. Riset: `design/research-marketing.md` (anatomi §1, field §2-3, contoh prompt, 8 jebakan). Scout extraction lengkap ada di session history — implementer BACA research doc langsung.

**Precedent (baca dulu):** `domains/product.ts` (paling mirip: referencePhoto + textarea + chips max), `domains/wedding.ts` (warnings), `domains/*-catalogs.ts` (pola img(), typed options).

**Resolusi spec-vs-riset (spec MENANG):**
- Content types: 7 per spec (Sale/Promo Flyer, Social Media Post, IG/TikTok Story, Web Banner, Poster, Product Announcement, Event Flyer, Coupon/Voucher — riset punya 8: Flyer/Poster terpisah → ikut spec)
- Formats: 6 per spec (1:1 post, 9:16 story, 16:9 banner, 2:3 poster, A4 flyer, 4:5 feed — riset punya 7: buang X/LinkedIn header 3:1)
- Design styles: 9 per spec (Minimalist, Bold/Brutalist, Modern Gradient, Retro, Luxury, Playful, Corporate Clean, Streetwear, Organic/Elegant — riset punya 10: buang Y2K/Pop)
- Color palettes: 8 preset per spec (buang 'Brand colors manual' — riset 9): red-yellow, black-gold, pastel-pink-cream, blue-white, green-cream, purple-blue, black-white, orange-black
- Promo elements: 6 per spec (discount badge, CTA button, price tag, countdown, star rating, logo placeholder circle)
- Fields ekstra riset (density/guardrail, background, product treatment, text position) TIDAK jadi field — aspek guardrail jadi konstanta negatif di buildPrompt; treatment/hero clause memakai reference photo bila ada

**Keputusan authoring (gap riset, ditandai di kode):**
- Hex codes 8 palet TIDAK ada di doc → author fresh (komentar `// hex authored: riset hanya beri role descriptor`)
- PromptPhrase per opsi promo elements/background tidak ada di doc → author English clause pendek dari konvensi contoh prompt
- referenceClause marketing: `Use the attached product photo exactly as-is, do not redraw or alter the product.` (riset jebakan #4 verbatim)

**Testing:** tidak ada test runner — verifikasi per task = `npm run build` hijau + verifikasi browser di Task 3. Implementer JALANKAN `npm run build` sebelum commit.

---

### Task 1: domains/marketing-catalogs.ts

**Files:**
- Create: `domains/marketing-catalogs.ts`

- [ ] **Step 1: katalog** — dari `design/research-marketing.md` (baca dulu; label English; `img()` = `images/marketing/<kategori>/<slug>.webp`):
  - `CONTENT_TYPES` (7, spec §3.4 section 1): Sale / Promo Flyer, Social Media Post, IG / TikTok Story, Web Banner, Poster, Product Announcement, Event Flyer, Coupon / Voucher — tiap opsi bawa `promptPhrase` (phrase deliverable, mis. 'a sale flyer', 'a social media post').
  - `MARKETING_FORMATS` (6, spec §3.4 section 2) — interface `{ ratio: string; clause: string }`: 1:1 post (clause 'square 1:1'), 9:16 story (clause 'vertical 9:16 story format, keep key elements in the central safe zone' — safe-zone wajib), 16:9 banner ('wide 16:9 banner'), 2:3 poster ('vertical poster 2:3'), A4 flyer ('A4 portrait flyer'), 4:5 feed ('portrait 4:5 feed').
  - `DESIGN_STYLES` (9, spec §3.4 section 3) — bawa `descriptor` (promptPhrase riset §Field 3): Minimalist / Clean, Bold Brutalist, Modern Gradient, Retro / Vintage, Luxury / Elegant, Playful / Fun, Corporate Clean, Streetwear / Urban, Organic / Natural.
  - `COLOR_PRESETS` (8) — interface `{ hex: string; promptPhrase: string }`, hex authored: red-yellow #E63946/#FFD166, black-gold #111111/#D4AF37, pastel-pink-cream #F8D7E3/#FFF6EC, blue-white #1D4ED8/#F5F7FA, green-cream #3A7D44/#F3F7E8, purple-blue #6D28D9/#2563EB, black-white #111111/#FFFFFF, orange-black #F97316/#1A1A1A — tiap opsi bawa phrase peran warna (mis. 'warm mustard yellow background with black text and red accents').
  - `TYPOGRAPHY_STYLES` (7, riset Field 5): Bold condensed sans-serif, Elegant serif, Rounded playful, Retro display / groovy, Monospace tech, Handwritten accent (hint: sub-copy only), Chunky 3D type — bawa `promptPhrase`.
  - `TEXT_STRATEGIES` (3, spec §3.4 section 5): Render text exactly, Placeholder "[HEADLINE]", Empty area (add copy in Canva) — bawa `promptPhrase` (render-exact → wrap headline in quotes; placeholder → `"[HEADLINE]"`; empty-area → 'leave clean empty space at the top for the headline text').
  - `PROMO_ELEMENTS` (6, spec §3.4 section 5): Discount badge, CTA button, Price tag, Countdown / urgency tag, Star rating, Logo placeholder circle — bawa `promptPhrase` pendek.
  - `MARKETING_GUARDRAILS` const negatif (dari riset anatomy block 11 / jebakan #2): `no extra text, no watermark, clean uncluttered layout, generous white space`.
- [ ] **Step 2: Build + commit** — `git commit -m "feat(recipes): marketing domain catalogs"`

---

### Task 2: domains/marketing.ts — recipe + template + smart rules

**Files:**
- Create: `domains/marketing.ts`

- [ ] **Step 1: recipe** — `id: 'marketing'`, `label: 'Marketing'`, icon `📣`, tagline dari StartScreen card ('Ads, flyers, and social media creative.'). `referencePhoto: true`, `referenceLabel: 'Product photo'`, `referenceClause` PERSIS: `Use the attached product photo exactly as-is, do not redraw or alter the product.` `presetProtectedKeys: ['headlineText']`. `createEmptyState`: `hasReferencePhoto: true`, contentType `social-post`, format `1x1`, designStyle `minimalist`, colorScheme `red-yellow`, typography `bold-condensed`, textStrategy `render-exact`, headlineText `''`, promoElements `[]`.
- [ ] **Step 2: sections** (5, persis spec §3.4): 01 Content Type (select `contentType`); 02 Format & Size (select `format`); 03 Design Style (visual `designStyle`); 04 Color & Typography (visual `colorScheme` COLOR_PRESETS + select `typography`); 05 Headline & Promo Elements (textarea `headlineText` placeholder 'E.g., FLASH SALE 50% OFF', select `textStrategy`, chips `promoElements` max 3).
- [ ] **Step 3: `buildPrompt`** — blok per riset anatomy (pisah `\n\n` pola id-photo/product): 1 `Design {contentType.promptPhrase} in {format.clause}.`; 2 style: `{designStyle.descriptor}.`; 3 hero — bila `hasReferencePhoto !== false`: referenceClause + `Use the attached photo as the hero element, cut out cleanly, centered.` (riset anatomy block 3); 4 color: `Color scheme: {colorPreset.promptPhrase}.`; 5 layout: headline position top (bila render-exact/placeholder), `headline at the top, product in the center, CTA at the bottom` + bila format story → `Keep all key elements within the central safe zone (avoid the top and bottom 250px).`; 6 headline: render-exact → `headline text: "…"` (headlineText atau fallback `[HEADLINE]`); placeholder → `headline text: "[HEADLINE]"`; empty-area → `leave clean empty space at the top for the headline text`; 7 typography: `Typography: {typography.promptPhrase}.`; 8 promo elements: join promptPhrase + `, only these elements` — skip bila kosong; bila 'logo placeholder circle' terpilih → `leave a clean placeholder circle at the top-left for the logo`; 9 hierarchy: `Clear visual hierarchy: headline biggest and highest contrast, product second, CTA third.`; 10 guardrail: `{MARKETING_GUARDRAILS}.` (kata-kata akhir disesuaikan kalimat utuh, tanpa duplikasi).
- [ ] **Step 4: `warnings`** — (a) promoElements.length >= 3 → warn `Too many promo elements crowds the layout — max 3 recommended.` (spec "1 prompt = 1 message" guardrail, jebakan #2); (b) format story (9:16) → info `9:16 Stories have UI overlays — key elements are kept in the central safe zone (avoid top/bottom 250px).` (jebakan #7); (c) textStrategy render-exact + headlineText > 6 kata → warn `AI misspells long copy — keep each text element to ~6 words or use the placeholder strategy.` (jebakan #1/#6); (d) render-exact + promoElements menyertakan logo → info `AI will hallucinate a fake logo — use the logo placeholder circle and paste the real one manually.` (jebakan #3); (e) textStrategy empty-area + promoElements kosong → info `Empty-area headline plus no promo elements may look bare — consider adding a CTA button.` (opsional nudge jebakan #2).
- [ ] **Step 5: Build + commit** — `git commit -m "feat(recipes): marketing domain — recipe, prompt template, smart rules"`

---

### Task 3: Registry + StartScreen + e2e verify

**Files:**
- Modify: `domains/index.ts`
- Modify: `components/StartScreen.tsx`
- Modify: `design/asset-checklist.md` (regen script)

- [ ] **Step 1: registry** — tambah `marketingDomain` di `DOMAINS` (urutan: cinematic, id-photo, wedding, product, marketing).
- [ ] **Step 2: StartScreen** — aktifkan kartu Marketing; hapus/handle `SOON_RECIPES` kosong (cek render grid: tidak boleh menyisakan judul 'Coming soon' kosong — hapus blok kondisional bila daftar kosong).
- [ ] **Step 3: browser smoke (tool browser)** — start screen: 5 kartu aktif, TIDAK ada kartu Soon; **Marketing**: buka → 5 section render; isi headline 'FLASH SALE 50% OFF' → prompt mengandung `headline text: "FLASH SALE 50% OFF"` + format clause + guardrail; ganti format → story → warning safe-zone muncul + clause safe-zone di prompt; pilih 3 promo elements → warning max-3 muncul; toggle textStrategy placeholder → prompt berisi `"[HEADLINE]"`; upload foto → preview + hero clause di prompt; save preset → reload → load → state pulih (headlineText TIDAK ditimpa); export v3 → import round-trip; paritas: cinematic/id-photo/wedding/product masih jalan (buka tiap domain, prompt terbentuk).
- [ ] **Step 4: asset checklist** — `node scripts/generate-asset-checklist.mjs` (marketing otomatis terbaca) — commit hasil regen.
- [ ] **Step 5: Build final + commit** — `git commit -m "feat(recipes): marketing domain live, e2e verified"`

---

### Anti-patterns (JANGAN)

- JANGAN menambah field kind atau mengubah engine — analisis konfirmasi union fase 1 cukup.
- JANGAN memakai field/katalog dari riset yang TIDAK ada di spec §3.4 (density, background, product treatment, text position, brand-color manual entry, Y2K style, X header format).
- JANGAN menulis hex palet tanpa komentar 'authored' — gap riset, bukan sumber doc.
- JANGAN menyentuh config domain lain (cinematic/id-photo/wedding/product) kecuali build merah.
- JANGAN memakai nama font brand dalam prompt — hanya gaya generik (jebakan #3/#8).
- JANGAN mengarang klausa referenceClause — PERSIS dari plan.
