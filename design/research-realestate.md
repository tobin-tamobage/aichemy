# Riset Domain: REAL ESTATE PHOTOGRAPHY (Aichemy Prompt Builder)

Riset untuk domain ke-6 Aichemy: prompt builder frontend-only. Output = teks prompt bahasa Inggris yang user paste ke AI image app mereka (GPT Image/DALL-E, Midjourney, Imagen, dsb.). Fokus: fotografi properti — interior, eksterior, dan virtual staging untuk agen properti, stager, dan host Airbnb.

---

## 1. Anatomi Prompt Foto Properti yang Efektif

Fotografi properti berbeda dari genre lain: tujuannya **dokumentasi arsitektur yang menarik**, bukan seni. Prioritas: garis vertikal lurus, cahaya natural, ruangan terlihat luas, tanpa distorsi. Urutan anatomi yang efektif (divalidasi oleh plan Task 2 Step 2 real-estate.ts buildPrompt):

1. **Scene + "Photorealistic {interior|exterior} photograph"** — sebut jenis ruangan (living room, kitchen, exterior-front) dan pastikan AI tahu ini foto real estat (bukan ilustrasi arsitektur): "Photorealistic interior photograph of a spacious living room…".
2. **Design style descriptor** — gaya furnitur/desain: Scandinavian minimalism, Japandi warm minimalism, industrial exposed brick, mid-century walnut, coastal white-blue, modern farmhouse shiplap. Gaya mengunci seluruh pemilihan furnitur AI.
3. **Time of day / lighting** — morning natural, golden hour, evening warm, twilight (eksterior dengan interior menyala = momen jual utama listing mewah).
4. **Staging clause** — furnished & styled / virtual staging / minimal / empty. Virtual staging butuh klausa khusus: "Furniture must be realistically scaled, cast natural shadows, and contain no people" (AI cenderung membuat furnitur melayang / skala raksasa).
5. **Angle & lens** — 16mm ultra-wide (interior penuh, risiko distorsi di eksterior), 24mm wide (perspektif natural), eye-level, low angle, corner view (dua dinding).
6. **Guardrail / negative** — "Straight verticals, natural colors, realistic materials, no people, no pets, no watermarks, no text overlays". Vertikal lurus = ciri fotografer profesional; AI suka melengkungkan dinding.

**Prinsip emas:** ruangan kosong dari orang/hewan, furnitur berskala realistis, vertikal lurus. Foto properti menjual ruang, bukan dekorasi.

---

## 2. Katalog Field Input + Opsi (sesuai plan Task 1 Step 2)

### Field 1 — Scene (7 opsi)
`Living room` (spacious) · `Bedroom` (cozy) · `Kitchen` (modern) · `Dining room` (inviting) · `Bathroom` (clean) · `Exterior — front` · `Exterior — garden` (landscaped). Prefix `exterior-` di value menandakan blok interior/exterior.

### Field 2 — Design Style (6 opsi, descriptor visual)
- **Scandinavian** — "light woods, clean lines"
- **Japandi** — "warm minimalism, natural textures, low furniture"
- **Industrial** — "exposed brick, metal accents, raw materials"
- **Mid-century** — "walnut tones, tapered legs, retro curves"
- **Coastal** — "white and blue palette, linen textures, airy"
- **Modern farmhouse** — "shiplap, rustic wood, neutral tones"

### Field 3 — Time of Day (4 opsi)
`Morning (natural)` bright natural morning light · `Golden hour` warm golden-hour sunlight · `Evening (warm)` warm interior lighting · `Twilight` twilight with interior lights glowing (momen eksterior terbaik)

### Field 4 — Staging (4 opsi)
`Furnished & styled` (professionally staged) · `Virtual staging` (realistically scaled + no-people clause) · `Minimal staging` (a few key pieces) · `Empty` (clean, ready for inspection)

### Field 5 — Angle & Lens (5 opsi)
`16mm ultra-wide` (full-room view — interior; hati-hati eksterior) · `24mm wide` (natural perspective) · `Eye level` · `Low angle` (looking slightly upward) · `Corner view` (two walls)

---

## 3. Tiga Contoh Prompt Jadi

### a) Living room Scandinavian (morning, furnished, 24mm)
> Photorealistic interior photograph of a spacious living room, styled in Scandinavian minimalism, light woods, clean lines. Lighting: bright natural morning light. Staging: professionally staged with tasteful furniture and decor. Shot with a 24mm wide-angle lens, natural perspective. Straight verticals, natural colors, realistic materials, no people, no pets, no watermarks, no text overlays.

### b) Kitchen virtual-staged (modern farmhouse, evening warm, corner view)
> Photorealistic interior photograph of a modern kitchen, styled in modern farmhouse, shiplap, rustic wood, neutral tones. Lighting: warm interior lighting in the evening. Staging: virtually staged with realistic, properly scaled furniture. Furniture must be realistically scaled, cast natural shadows, and contain no people. Shot with a corner view showing two walls. Straight verticals, natural colors, realistic materials, no people, no pets, no watermarks, no text overlays.

### c) Exterior twilight (coastal, golden-hour-adjacent, eye level)
> Photorealistic exterior photograph of the front exterior of a house, styled in coastal style, white and blue palette, linen textures, airy. Lighting: twilight with interior lights glowing. Staging: professionally staged with tasteful furniture and decor. Shot with an eye-level composition. Straight verticals, natural colors, realistic materials, no people, no pets, no watermarks, no text overlays.

---

## 4. Jebakan AI untuk Foto Properti (dan strateginya)

| # | Jebakan | Strategi di recipe |
|---|---|---|
| 1 | Dinding/vertikal melengkung (barrel distortion) | Guardrail "Straight verticals" di blok terakhir |
| 2 | Furnitur virtual staging skala surreal (sofa raksasa, meja melayang) | Virtual staging clause: "realistically scaled, cast natural shadows, no people" (smart rule a) |
| 3 | Hantu orang/hewan peliharaan di ruangan | Guardrail "no people, no pets" |
| 4 | 16mm ultra-wide di eksterior → distorsi fasad | Warning (b): sarankan 24mm/eye-level untuk scene exterior |
| 5 | Over-HDR / warna jenuh tidak natural | Guardrail "natural colors" + "realistic materials" |
| 6 | Watermark/teks overlay muncul | Guardrail "no watermarks, no text overlays" |
| 7 | Kamar mandi industrial terasa dingin/tidak mengundang | Warning (c): sarankan aksen kayu hangat/kuningan |
| 8 | Ruangan tampak seperti ilustrasi arsitektur (bukan foto) | "Photorealistic photograph" di blok pertama |

---

## 5. Sumber Konvensi

- Konvensi wide-angle interior (16–24mm) dan distorsi eksterior — praktik standar fotografi properti.
- Twilight eksterior ("lights on") sebagai momen listing premium — praktik standar real estate marketing.
- Virtual staging: skala realistis + shadow natural + tanpa orang — konvensi industri staging (AI flaw yang diketahui).
- Design style descriptors (Scandi/Japandi/industrial/mid-century/coastal/farmhouse) — terminologi desain interior umum; promptPhrase diauthoring di plan.
