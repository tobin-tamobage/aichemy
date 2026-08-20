# Aichemy Recipes Phase 4 — Implementation Plan (Portrait, Real Estate, Food)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tambah **tiga domain baru** — **Portrait** (headshot/avatar), **Real Estate** (interior/exterior/staging), **Food** (katalog hidangan Indonesia sebagai diferensiator) — sebagai DomainRecipe lengkap. Total studio jadi 8. Engine TIDAK berubah: semua field memakai union fase 1 (select saja; tidak ada textarea/visual/chips/toggle baru yang belum didukung).

**Architecture:** Murni config. Tiga pasang file `*-catalogs.ts` + `*.ts` di `domains/`, didaftarkan di `domains/index.ts` (urutan: cinematic, id-photo, wedding, product, marketing, **portrait, real-estate, food**). StartScreen render otomatis dari DOMAINS (grid auto-fit sudah menangani 8 kartu — TIDAK ada perubahan StartScreen).

**Tech Stack:** Vite 6, React 19, TS, Tailwind tokens Aichemy.

**Spec:** `docs/superpowers/specs/2026-08-19-recipes-multidomain-design.md` §1-2 (kontrak DomainRecipe), §4-8. Domain baru ini MEWAKILI perluasan roadmap (spec §3.4 adalah domain terakhir di spec) — pola mengikuti marketing/product persis; keputusan authoring baru ditandai di kode.

**Riset:** `design/research-portrait.md`, `design/research-realestate.md`, `design/research-food.md` (dibuat paralel oleh scout — implementer BACA doc ini + plan; plan adalah sumber struktur, riset mendokumentasikan konvensi niche).

**Precedent (baca dulu):** `domains/marketing.ts` (struktur recipe + warnings), `domains/marketing-catalogs.ts` (pola katalog + `img()`), `domains/product.ts` (kalau perlu referencePhoto — domain baru TIDAK pakai referencePhoto).

**Keputusan authoring (gap riset, ditandai di kode):**
- Semua promptPhrase di bawah adalah authoring plan — research doc MEMVALIDASI bukan mengubah; kalau riset menyarankan frasa lain, komentar di kode menandai deviasi.
- `presetProtectedKeys: []` untuk ketiga domain (tidak ada field teks bebas).
- `referencePhoto: false` untuk ketiga domain (scope fase ini; reference clause bisa ditambah belakangan).
- Food memakai katalog hidangan gabungan (8 Indonesia + 6 internasional) — keputusan authoring: satu select `dish` lebih simpel daripada dua select (cuisine + dish) dan prompt langsung spesifik per hidangan.
- Guardrail/negatives jadi konstanta blok terakhir buildPrompt (pola marketing blok 10).

**Testing:** tidak ada test runner — verifikasi per task = `npm run build` hijau + verifikasi browser di Task 3. Implementer JALANKAN `npm run build` sebelum commit.

---

### Task 1: tiga file katalog

**Files:**
- Create: `domains/portrait-catalogs.ts`
- Create: `domains/real-estate-catalogs.ts`
- Create: `domains/food-catalogs.ts`

- [ ] **Step 1: `portrait-catalogs.ts`** — label English, `img()` = `images/portrait/<kategori>/<slug>.webp`; tiap option `{ value, label, promptPhrase }`:
  - `PORTRAIT_TYPES` (5): corporate-headshot 'Corporate headshot' 'a corporate headshot'; linkedin-headshot 'LinkedIn headshot' 'a professional LinkedIn headshot'; actor-headshot 'Actor headshot' 'an actor headshot'; editorial-portrait 'Editorial portrait' 'an editorial portrait'; stylized-avatar 'Stylized avatar' 'a stylized digital avatar'.
  - `PORTRAIT_LIGHTING` (6): rembrandt 'Rembrandt' 'Rembrandt lighting with a soft triangle of light on the shadowed cheek'; butterfly 'Butterfly' 'butterfly lighting with a symmetrical shadow under the nose'; loop 'Loop' 'loop lighting with a small nose shadow toward the cheek'; split 'Split' 'split lighting, half the face lit, half in shadow'; softbox-flat 'Softbox (flat)' 'even, shadowless softbox lighting'; window-natural 'Window (natural)' 'soft natural window light from the side'.
  - `PORTRAIT_BACKGROUNDS` (5): seamless-studio 'Seamless studio' 'a clean seamless studio backdrop'; neutral-office 'Blurred office' 'a softly blurred modern office background'; city-bokeh 'City bokeh' 'a blurred city bokeh background'; outdoor-park 'Outdoor park' 'a softly blurred outdoor park background'; plain-color 'Plain color' 'a plain solid color backdrop'.
  - `PORTRAIT_WARDROBE` (4): formal-suit 'Formal suit' 'a formal suit'; business-casual 'Business casual' 'business casual attire'; smart-casual 'Smart casual' 'a smart casual outfit'; casual 'Casual' 'casual everyday clothing'.
  - `PORTRAIT_EXPRESSIONS` (4): confident-smile 'Confident smile' 'a confident smile'; subtle-smile 'Subtle smile' 'a subtle, natural smile'; neutral 'Neutral' 'a neutral, relaxed expression'; intense 'Intense' 'an intense, dramatic expression'.
  - `PORTRAIT_LENSES` (4): 85mm-closeup '85mm close-up' 'an 85mm lens, head-and-shoulders framing'; 50mm-half '50mm half-body' 'a 50mm lens, half-body framing'; 35mm-environmental '35mm environmental' 'a 35mm lens, environmental framing with context around the subject'; 200mm-tight '200mm tight' 'a 200mm telephoto lens, tight face framing'.
- [ ] **Step 2: `real-estate-catalogs.ts`** — `img()` = `images/real-estate/<kategori>/<slug>.webp`:
  - `RE_SCENES` (7): living-room 'Living room' 'a spacious living room'; bedroom 'Bedroom' 'a cozy bedroom'; kitchen 'Kitchen' 'a modern kitchen'; dining-room 'Dining room' 'an inviting dining room'; bathroom 'Bathroom' 'a clean bathroom'; exterior-front 'Exterior — front' 'the front exterior of a house'; exterior-garden 'Exterior — garden' 'a house with a landscaped garden'.
  - `RE_STYLES` (6): scandinavian 'Scandinavian' 'Scandinavian minimalism, light woods, clean lines'; japandi 'Japandi' 'Japandi style, warm minimalism, natural textures, low furniture'; industrial 'Industrial' 'industrial style, exposed brick, metal accents, raw materials'; mid-century 'Mid-century' 'mid-century modern, walnut tones, tapered legs, retro curves'; coastal 'Coastal' 'coastal style, white and blue palette, linen textures, airy'; modern-farmhouse 'Modern farmhouse' 'modern farmhouse, shiplap, rustic wood, neutral tones'.
  - `RE_TIMES` (4): morning-natural 'Morning (natural)' 'bright natural morning light'; golden-hour 'Golden hour' 'warm golden-hour sunlight'; evening-warm 'Evening (warm)' 'warm interior lighting in the evening'; twilight 'Twilight' 'twilight with interior lights glowing'.
  - `RE_STAGING` (4): furnished-styled 'Furnished & styled' 'professionally staged with tasteful furniture and decor'; virtual-staging 'Virtual staging' 'virtually staged with realistic, properly scaled furniture'; partial-staging 'Minimal staging' 'minimal staging with a few key furniture pieces'; empty 'Empty' 'completely empty, clean, ready for inspection'.
  - `RE_ANGLES` (5): wide-16mm '16mm ultra-wide' 'a 16mm wide-angle lens, full-room view'; wide-24mm '24mm wide' 'a 24mm wide-angle lens, natural perspective'; eye-level 'Eye level' 'eye-level composition'; low-angle 'Low angle' 'a low angle looking slightly upward'; corner-view 'Corner view' 'a corner view showing two walls'.
- [ ] **Step 3: `food-catalogs.ts`** — `img()` = `images/food/<kategori>/<slug>.webp`; katalog `FOOD_DISHES` memakai nama hidangan Indonesia apa adanya (label), promptPhrase deskriptif plating:
  - `FOOD_DISHES` (14): rendang 'Rendang' 'beef rendang with dark glossy caramelized coconut sauce, tender shredded beef, garnished with fried shallots and red chili'; sate-ayam 'Sate Ayam' 'chicken satay skewers with charred edges, peanut sauce on the side, lime wedges and ketupat rice cakes'; nasi-goreng 'Nasi Goreng' 'nasi goreng, Indonesian fried rice topped with a fried egg, shrimp crackers, cucumber slices and fried shallots'; gado-gado 'Gado-Gado' 'gado-gado, Indonesian vegetable salad with creamy peanut dressing, boiled egg, tofu and lontong rice cakes'; soto-ayam 'Soto Ayam' 'soto ayam, golden turmeric chicken soup with rice noodles, bean sprouts, lime and fried shallots'; rawon 'Rawon' 'rawon, dark black beef soup with keluak broth, bean sprouts and sambal'; ayam-bakar 'Ayam Bakar' 'ayam bakar, grilled chicken with a smoky sweet glaze, sambal and fresh vegetables'; mie-goreng 'Mie Goreng' 'mie goreng, stir-fried noodles with vegetables, egg and kecap manis glaze'; sushi 'Sushi platter' 'an elegant sushi platter with glistening fresh nigiri and maki rolls'; ramen 'Ramen' 'a steaming bowl of ramen with rich broth, soft-boiled egg, chashu pork and spring onions'; pasta 'Pasta' 'a plated pasta dish, al dente, with fresh herbs and shaved parmesan'; burger 'Gourmet burger' 'a juicy gourmet burger with melted cheese, crisp lettuce and a toasted bun'; dessert 'Plated dessert' 'a delicate plated dessert with a glossy sauce swirl and a light garnish'; drink 'Iced drink' 'a refreshing iced drink in a tall glass with condensation droplets'.
  - `FOOD_PRESENTATIONS` (3): fine-dining 'Fine dining' 'fine-dining plating, precise and minimal'; rustic-family 'Rustic family style' 'rustic family-style serving, generous and casual'; flat-lay 'Flat lay' 'a flat lay with ingredients arranged around the dish'.
  - `FOOD_LIGHT_MOODS` (4): bright-airy 'Bright & airy' 'bright and airy, soft diffused daylight, clean white balance'; dark-moody 'Dark & moody' 'dark and moody, deep shadows, dramatic contrast'; natural-window 'Window light' 'soft natural window light from the side'; warm-cozy 'Warm & cozy' 'warm cozy evening light with golden tones'.
  - `FOOD_ANGLES` (4): 45-degree '45° angle' 'a 45-degree angle, the classic food photography view'; overhead 'Overhead' 'a top-down overhead view'; side-profile 'Side profile' 'a side profile view showing height and layers'; close-up 'Close-up' 'a close-up macro view of texture and detail'.
  - `FOOD_BACKDROPS` (6): marble 'White marble' 'a white marble surface'; wood-table 'Wood table' 'a rustic wood table'; banana-leaf 'Banana leaf' 'a fresh banana leaf lining'; linen 'Linen' 'a natural linen cloth'; dark-slate 'Dark slate' 'a dark slate surface'; ceramic 'Ceramic' 'handmade ceramic tableware'.
- [ ] **Step 4: Build + commit** — `npm run build` hijau, lalu `git commit -m "feat(recipes): portrait, real estate, food catalogs"`

---

### Task 2: tiga recipe + template + smart rules

**Files:**
- Create: `domains/portrait.ts`
- Create: `domains/real-estate.ts`
- Create: `domains/food.ts`

- [ ] **Step 1: `portrait.ts`** — `id: 'portrait'`, label 'Portrait', icon `📸`, tagline 'Headshots, actor portraits, and stylized avatars.' `referencePhoto: false`, `presetProtectedKeys: []`. `createEmptyState`: `{ portraitType: 'corporate-headshot', lighting: 'rembrandt', background: 'seamless-studio', wardrobe: 'formal-suit', expression: 'confident-smile', lens: '85mm-closeup' }`.
  - **Sections** (5): '01 · Portrait Type' select `portraitType` (PORTRAIT_TYPES); '02 · Lighting Setup' select `lighting` (PORTRAIT_LIGHTING); '03 · Background & Setting' select `background` (PORTRAIT_BACKGROUNDS); '04 · Wardrobe & Expression' select `wardrobe` (PORTRAIT_WARDROBE) + select `expression` (PORTRAIT_EXPRESSIONS); '05 · Lens & Framing' select `lens` (PORTRAIT_LENSES).
  - **`buildPrompt`** — dua varian (pisah `\n\n`):
    - avatar (`portraitType === 'stylized-avatar'`): `A stylized digital avatar portrait of a person with {expression.promptPhrase}.` → `The character wears {wardrobe.promptPhrase}.` → `Background: {background.promptPhrase}.` → `Clean illustration style, consistent character design, soft shading, high detail, no text, no watermark.` (TIDAK ada blok Lighting/Lens)
    - foto: `A {type.promptPhrase} of a person, shot on {lens.promptPhrase}.` → `Lighting: {lighting.promptPhrase}.` → `Background: {background.promptPhrase}.` → `The subject wears {wardrobe.promptPhrase} with {expression.promptPhrase}.` → `Sharp focus on the eyes, natural skin texture, photorealistic, no heavy retouching, no text, no watermark.`
  - **`warnings`** (sectionId valid): (a) avatar → info `Avatar mode switches to a stylized illustration — camera lens and lighting clauses are skipped.` ('portrait-type'); (b) wardrobe formal-suit + background outdoor-park → warn `A formal suit against an outdoor park looks mismatched — use a studio or office background.` ('wardrobe'); (c) actor-headshot + neutral → info `Actors book roles on emotion — a neutral expression is the weakest choice.` ('wardrobe'); (d) corporate-headshot + intense → warn `Intense expressions are off-brand for corporate headshots — pick a confident or subtle smile.` ('wardrobe'); (e) corporate-headshot + lens 35mm-environmental → warn `Corporate headshots need head-and-shoulders framing — choose the 85mm close-up.` ('lens').
- [ ] **Step 2: `real-estate.ts`** — `id: 'real-estate'`, label 'Real Estate', icon `🏠`, tagline 'Interiors, exteriors, and virtual staging.' `referencePhoto: false`, `presetProtectedKeys: []`. `createEmptyState`: `{ scene: 'living-room', designStyle: 'scandinavian', timeOfDay: 'morning-natural', staging: 'furnished-styled', angleLens: 'wide-24mm' }`.
  - **Sections** (5): '01 · Scene' select `scene` (RE_SCENES); '02 · Design Style' select `designStyle` (RE_STYLES); '03 · Time of Day' select `timeOfDay` (RE_TIMES); '04 · Staging' select `staging` (RE_STAGING); '05 · Angle & Lens' select `angleLens` (RE_ANGLES).
  - **`buildPrompt`**: `Photorealistic {interior|exterior} photograph of {scene.promptPhrase}, styled in {style.promptPhrase}.` (exterior bila scene diawali 'exterior-') → `Lighting: {timeOfDay.promptPhrase}.` → `Staging: {staging.promptPhrase}.` (bila virtual-staging, tambahkan kalimat di blok yang sama: ` Furniture must be realistically scaled, cast natural shadows, and contain no people.`) → `Shot with {angleLens.promptPhrase}.` → `Straight verticals, natural colors, realistic materials, no people, no pets, no watermarks, no text overlays.`
  - **`warnings`**: (a) staging virtual-staging → info `Virtual staging — the prompt adds a realistic scale and no-people clause.` ('staging'); (b) scene exterior-* + angleLens wide-16mm → warn `Ultra-wide 16mm distorts house exteriors — use the 24mm wide or eye-level.` ('angle-lens'); (c) scene bathroom + designStyle industrial → info `Industrial style in a bathroom can feel cold — add warm wood or brass accents.` ('design-style').
- [ ] **Step 3: `food.ts`** — `id: 'food'`, label 'Food', icon `🍜`, tagline 'Indonesian dishes, desserts, and drinks, styled to sell.' `referencePhoto: false`, `presetProtectedKeys: []`. `createEmptyState`: `{ dish: 'nasi-goreng', presentation: 'rustic-family', lightMood: 'natural-window', angle: '45-degree', backdrop: 'wood-table' }`. Konstanta: `HOT_DISHES = ['rendang','sate-ayam','soto-ayam','rawon','ayam-bakar','mie-goreng','ramen']`, `TALL_DISHES = ['ramen','drink','burger']`.
  - **Sections** (5): '01 · Dish' select `dish` (FOOD_DISHES); '02 · Presentation' select `presentation` (FOOD_PRESENTATIONS); '03 · Light Mood' select `lightMood` (FOOD_LIGHT_MOODS); '04 · Angle' select `angle` (FOOD_ANGLES); '05 · Backdrop & Props' select `backdrop` (FOOD_BACKDROPS).
  - **`buildPrompt`**: `Appetizing food photograph of {dish.promptPhrase}.` → `Presentation: {presentation.promptPhrase}.` → `Lighting: {lightMood.promptPhrase}.` → (bila HOT_DISHES memuat dish) `Light steam rising from the dish, served fresh and hot.` → `Shot from {angle.promptPhrase}.` → `Served on {backdrop.promptPhrase}.` → `Vibrant natural colors, shallow depth of field, fresh garnish, no hands, no people, no text, no watermark.`
  - **`warnings`**: (a) HOT_DISHES memuat dish → info `Hot dish — the prompt adds a rising-steam clause.` ('dish'); (b) TALL_DISHES memuat dish + angle overhead → warn `Overhead flattens tall dishes — use the 45° or side-profile angle to show layers.` ('angle'); (c) presentation flat-lay + angle close-up → warn `Flat lay and close-up conflict — pick one: ingredients spread out, or a macro detail.` ('angle').
- [ ] **Step 4: Build + commit** — `npm run build` hijau, lalu `git commit -m "feat(recipes): portrait, real estate, food — recipes, templates, smart rules"`

---

### Task 3: Registry + checklist regen + e2e verify

**Files:**
- Modify: `domains/index.ts`
- Modify: `scripts/generate-asset-checklist.mjs` (tambah case `dishes`)
- Modify: `design/asset-checklist.md` (regen)

- [ ] **Step 1: registry** — `domains/index.ts`: import `portraitDomain`, `realEstateDomain`, `foodDomain`; DOMAINS urutan: cinematic, id-photo, wedding, product, marketing, portrait, real-estate, food.
- [ ] **Step 2: script** — `scripts/generate-asset-checklist.mjs` `suggestPrompt`: tambah case `dishes`: `Overhead food photography of ${label} on a rustic wood table, natural window light, steam rising, fresh garnish, no hands.` (switch di atas punya default generik — case baru cukup untuk kategori dishes).
- [ ] **Step 3: browser smoke (tool browser)** — start screen: **8 kartu aktif**, tidak ada kartu Soon; **Portrait**: buka → 5 section; prompt default mengandung 'corporate headshot', 'Rembrandt', '85mm', 'no heavy retouching'; ganti portraitType → stylized-avatar → warning (a) muncul + prompt mengandung 'stylized digital avatar' + TIDAK mengandung 'Lighting:'; wardrobe formal-suit + background outdoor-park → warning (b); actor-headshot + expression neutral → info (c); corporate-headshot + intense → warn (d); **Real Estate**: buka → 5 section; prompt default mengandung 'Photorealistic interior photograph of a spacious living room', 'Scandinavian', 'natural morning light', '24mm', 'no people, no pets'; staging → virtual-staging → info (a) + prompt mengandung 'realistically scaled'; scene exterior-front + angleLens wide-16mm → warn (b); scene bathroom + designStyle industrial → info (c); **Food**: buka → 5 section; prompt default mengandung 'nasi goreng', 'rustic family-style', '45-degree', 'wood table', 'no hands'; dish → soto-ayam → prompt mengandung 'Light steam rising' + info (a); dish ramen + angle overhead → warn (b); presentation flat-lay + angle close-up → warn (c); **preset**: save preset di Portrait → reload (handle beforeunload dialog) → load → state pulih; **export v3 → import round-trip** di Food; **paritas**: 5 domain lama masih jalan (buka tiap domain, prompt terbentuk non-kosong).
- [ ] **Step 4: asset checklist** — `node scripts/generate-asset-checklist.mjs` (3 domain baru otomatis terbaca; totals naik) — commit hasil regen.
- [ ] **Step 5: Build final + commit** — `git commit -m "feat(recipes): three new studios live, e2e verified"`

---

### Anti-patterns (JANGAN)

- JANGAN mengubah engine/`domains/types.ts` — union fase 1 cukup (semua field baru adalah select).
- JANGAN menambah field di luar yang ditulis di plan (tidak ada textarea/visual/chips/toggle tambahan, tidak ada referencePhoto).
- JANGAN menyentuh config domain lama (cinematic/id-photo/wedding/product/marketing) kecuali build merah.
- JANGAN mengubah StartScreen — grid auto-fit menangani 8 kartu; kartu render dari DOMAINS.
- JANGAN mengarang frasa — pakai promptPhrase PERSIS dari plan (riset boleh memvalidasi, plan menang).
- JANGAN memakai nama brand/font/furniture brand dalam prompt — hanya gaya generik.
- JANGAN lupa `npm run build` hijau sebelum tiap commit.
