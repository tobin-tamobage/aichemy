# Riset Domain: LOGO MAKER (Aichemy Prompt Builder)

Riset untuk domain ke-9 Aichemy: prompt builder frontend-only. Output = teks prompt bahasa Inggris yang user paste ke AI image app mereka (GPT Image/DALL-E, Midjourney, Imagen, dsb.). Fokus: **logo & brand mark** — domain desain pertama yang output-nya harus "production-minded": AI image app secara default menghasilkan logo di atas mockup (kartu nama, dinding kantor, kaos) dengan bevel 3D dan teks salah eja. Prompt yang baik melawan ketiganya secara eksplisit.

Diferensiator vs prompt generik: taxonomi tipe logo yang benar (wordmark/lettermark/mark), constraint fisik cetak (flat, satu berat garis, satu warna), dan gaya desainer legendaris sebagai shorthand kualitas (sama seperti photographer style di Portrait).

---

## 1. Anatomi Prompt Logo yang Efektif

Urutan blok yang terbukti (dari praktik prompt logo + struktur domain Aichemy lain):

1. **Kata kunci "logo" + tipe logo di kalimat pertama** — "A minimalist pictorial mark logo of…". Kata *logo* di posisi awal mengunci genre; tanpa itu AI menghasilkan "ilustrasi" atau "poster". Tipe logo menentukan struktur seluruh hasil.
2. **Brand/subjek bebas** — nama brand + apa yang digambarkan. AI butuh subjek konkret untuk pictorial/mascot; untuk wordmark, subjek = nama itu sendiri.
3. **Industri/konteks** — memberi AI kosakata asosiasi (tech → bersih, geometris; bakery → hangat, bulat). Opsional tapi menajamkan.
4. **Style axis** — minimalist / geometric / monoline / vintage badge / hand-drawn / gradient / negative space / luxury. Satu saja; dua style bertabrakan = logo tanpa identitas.
5. **Shape / lockup** — circular badge, shield, horizontal lockup, icon-above-wordmark. Mengunci komposisi kanvas.
6. **Palet warna dengan hex eksplisit** — AI patuh pada hex; "navy and gold" tanpa hex menghasilkan biru sembarang.
7. **Typography (hanya bila ada huruf)** — gaya lettering (modern sans / serif klasik / script), BUKAN nama font brand (jebakan #2).
8. **Teknik konstruksi (chips)** — flat vector, golden-ratio grid, perfect symmetry, single-weight stroke. Bahasa desainer profesional yang mendorong hasil "sistematis" vs "clip-art".
9. **Gaya desainer (opsional)** — "in the style of Paul Rand" = shorthand untuk seluruh filosofi. Sama efektifnya dengan photographer style.
10. **Guardrail/negative** — blok terakhir, wajib: no mockup, no 3D bevel, no drop shadow, no photorealistic scene, no watermark, no extra text.

**Prinsip emas:** satu tipe, satu style, satu konsep. Logo adalah latihan pengurangan — setiap klausa tambahan harus menghapus kemungkinan, bukan menambah dekorasi.

---

## 2. Tujuh Tipe Logo (field 01)

Taxonomi standar industri — tiap tipe punya promptPhrase yang menjelaskan STRUKTUR, bukan sekadar nama:

- **Wordmark** — "a wordmark logo built entirely from custom lettering of the brand name, no icon" (Google, Visa). Risiko teks tertinggi → warning ejaan.
- **Lettermark / monogram** — "a lettermark monogram logo built from the brand initials, interlocking or stacked letterforms" (IBM, HBO). Lebih aman untuk AI: 1-3 huruf.
- **Pictorial mark** — "a pictorial mark logo with a single, instantly recognizable icon, no text" (Apple, Twitter). Paling reliable untuk AI image app.
- **Abstract mark** — "an abstract mark logo built from interlocking geometric shapes forming a distinctive symbol" (Pepsi, Chase).
- **Emblem / badge** — "an emblem badge logo with the brand name and icon integrated inside a contained crest shape" (Starbucks, Harley). Teks di dalam shape → risiko ejaan sedang.
- **Mascot** — "a mascot logo with a friendly character illustration representing the brand" (KFC, Michelin). Paling kompleks; konflik dengan minimalist.
- **Combination mark** — "a combination mark logo with the icon on the left and the wordmark beside it, balanced lockup" (Adidas, Lacoste). Paling fleksibel, paling umum di dunia nyata.

## 3. Style Axis (field 03) — satu saja

- **Minimalist** — "minimalist, maximum simplicity, generous negative space" — default aman.
- **Geometric** — "geometric, constructed from precise circles, squares and triangles".
- **Monoline** — "monoline, single-weight continuous line work, even stroke".
- **Vintage badge** — "vintage badge style, retro americana, hand-drawn ornament details".
- **Hand-drawn / organic** — "hand-drawn, organic imperfect strokes, human warmth".
- **Modern gradient** — "modern gradient mark, smooth vibrant color transitions" (konflik: monoline/flat chips → warning).
- **Negative space** — "clever negative space, dual-read imagery hidden in the counterforms" (FedEx arrow).
- **Bold flat / brutalist** — "bold flat geometric shapes, high-impact, brutalist confidence".
- **Luxury** — "luxury monoline, thin elegant strokes, high-end boutique feel".
- **Playful** — "playful, rounded friendly forms, approachable energy".

## 4. Shape & Lockup (field 04)

`Circular badge` · `Shield / crest` · `Square tile (app icon)` · `Horizontal lockup` · `Stacked (icon above wordmark)` · `Freeform` — phrase menjelaskan komposisi kanvas. Emblem type + horizontal lockup = konflik (warning).

## 5. Warna (field 05) — hex wajib

Palet dengan hex eksplisit (pola ColorPreset marketing): `Monochrome black` (#1A1A1A di putih) · `Navy & gold` (#1F2A44 + #C9A227, luxury) · `Forest green` (#1F4D2E) · `Earth tones` (#6B4F2E + #D9C7A7) · `Pastel` · `Vibrant bold` · `Sunset gradient` (hanya dengan style gradient) · `Electric neon` (di charcoal gelap).
Background terpisah (3 opsi): white / "flat neutral" / dark charcoal. **Rule kontras:** background dark + palet monochrome-black = tak terlihat → warn (pola warning putih-putih ID Photo).

## 6. Typography (field 06, conditional)

Hanya tampil untuk wordmark/lettermark/combination (`visibleWhen`). Gaya lettering, bukan nama font:
`Modern sans-serif` (clean geometric) · `Classic serif` (heritage, trustworthy) · `Script / hand-lettered` (flowing, personal) · `Bold display` (impact, condensed) · `Monospace / tech` (code aesthetic) · `Vintage slab serif` (badge americana).

## 7. Motif + Teknik (field 07)

- **Motif = textarea bebas** ("what should the icon depict?") — terlalu beragam untuk katalog; pola subject cinematic. presetProtected.
- **Technique chips** (multi, max 3): `flat vector` · `golden-ratio grid construction` · `perfect symmetry` · `single-weight stroke` · `enclosed line` · `letter integration` (ikon menyatu ke huruf). Chips > 2 → warning "satu ide kuat" (logo adalah pengurangan).

## 8. Designer Style (field 08, opsional + 'auto')

Shorthand kualitas — sama seperti photographer style portrait:
- **Paul Rand** — "in the style of Paul Rand: playful modernist simplicity, bold flat shapes, wit" (IBM, UPS).
- **Saul Bass** — "in the style of Saul Bass: jagged expressive cut-paper shapes, hand-cut energy" (AT&T, United).
- **Massimo Vignelli** — "in the style of Massimo Vignelli: rigorous grid discipline, timeless restraint" (NYC Subway, American Airlines).
- **Chermayeff & Geismar** — "in the style of Chermayeff & Geismar: clean geometric abstraction, instant recognition" (Chase, NBC).
- **Pentagram** — "in the style of Pentagram: contemporary systematic identity design, confident simplicity".
- **Paula Scher** — "in the style of Paula Scher: bold expressive typography-driven identity".
- **Milton Glaser** — "in the style of Milton Glaser: illustrative warmth, psychedelic line work" (I ❤ NY).

---

## 3. Jebakan AI Image App untuk Logo (dasar smart rules)

1. **Salah eja teks** — AI image app sering salah mengeja. Mitigasi: warning saat tipe berhuruf (wordmark/lettermark/emblem/combination): "AI sering salah mengeja — pakai nama pendek, atau generate mark-nya saja dan tambahkan huruf di vector tool". Lettermark 1-3 huruf paling aman.
2. **Mockup pollution** — default AI: logo di dinding kantor/kartu nama/kaos. Guardrail wajib: "presented flat, no mockup, no stationery scene".
3. **3D bevel & drop shadow 2005-an** — tanpa constraint, AI menambahkan bevel/gradient glossy. Guardrail: "flat 2D vector style, no bevel, no drop shadow, no gloss".
4. **Photorealism leak** — mascot sering bocor jadi render 3D/foto. Guardrail + technique chips menahannya.
5. **Gradient tanpa hex** — warna sembarangan. Selalu sertakan hex di phrase palet.
6. **Kontras hilang** — palet gelap di background gelap. Warning kontras (pola ID Photo).
7. **Konsep ganda** — user menumpuk 2 style + 4 teknik = logo tanpa fokus. Warning kuantitas.
8. **Font brand** — jangan minta "Helvetica"/"font Apple"; AI tidak tahu / menghasilkan teks aneh. Pakai gaya lettering (§6).

## 4. Tiga Contoh Prompt Jadi

### a) Pictorial mark — tech, minimalist, navy-gold
> A minimalist pictorial mark logo of a stylized mountain peak with an upward arrow hidden in its negative space, for a tech startup. Geometric, constructed from precise circles and triangles. Clever negative space, dual-read imagery. Strictly #1F2A44 navy with #C9A227 gold accent on a clean white background. Flat 2D vector style, crisp edges, balanced composition. In the style of Chermayeff & Geismar: clean geometric abstraction, instant recognition. Presented flat, no mockup, no 3D bevel, no drop shadow, no photorealistic scene, no watermark, no text.

### b) Wordmark — bakery, hand-drawn, earth tones
> A wordmark logo built entirely from custom hand-lettered script of the brand name "Kova", for an artisan bakery. Hand-drawn, organic imperfect strokes, human warmth. Warm earth tones #6B4F2E and #D9C7A7 on a clean white background. Flowing script lettering, personal and inviting. Flat 2D vector style. Presented flat, no mockup, no 3D bevel, no drop shadow, no photorealistic scene, no watermark.

### c) Mascot — esports, bold flat, vibrant
> A mascot logo with a fierce geometric falcon head, for an esports team. Bold flat geometric shapes, high-impact. Vibrant bold palette #E63946 and #1D3557 on a clean white background. Perfect symmetry, aggressive angular construction. Flat 2D vector style, crisp edges. Presented flat, no mockup, no 3D bevel, no drop shadow, no photorealistic scene, no watermark, no extra text.

---

## 5. Ringkasan Field → Section (untuk plan)

| # | Key | Kind | Katalog | Default |
|---|---|---|---|---|
| 01 | logoType | visual (square) | LOGO_TYPES (7) | `pictorial` |
| 02 | brandBrief | textarea (presetProtected) | — | '' |
| 02 | industry | visual (square) | LOGO_INDUSTRIES (10) | `tech-saas` |
| 03 | style | visual (square) | LOGO_STYLES (10) | `minimalist` |
| 04 | shape | visual (square) | LOGO_SHAPES (6) | `freeform` |
| 05 | palette | visual (square, hex) | LOGO_PALETTES (8) | `monochrome-black` |
| 05 | logoBackground | visual (square) | LOGO_BACKGROUNDS (3) | `white` |
| 06 | typography | visual (square, visibleWhen) | LOGO_TYPESTYLES (6) | `modern-sans` |
| 07 | iconMotif | textarea (presetProtected) | — | '' |
| 07 | techniques | chips (max 3) | LOGO_TECHNIQUES (6) | `['flat-vector']` |
| 08 | designer | visual (square) + auto | LOGO_DESIGNERS (7+auto) | `auto` |

Smart rules: (1) teks-ejaan untuk tipe berhuruf [info]; (2) mascot×minimalist [warn]; (3) gradient×monoline/flat chips [warn]; (4) kontras dark bg × dark palette [warn]; (5) techniques > 2 [warn]; (6) emblem × horizontal-lockup [info].
Reference photo: TRUE — sketsa user → "Use the attached sketch as the structural basis — keep its layout and proportions, redraw it as a clean vector logo."
Guardrail block konstan terakhir (pola marketing blok 7 / food negatives).
Aset baru: `images/logo/{types,industries,styles,shapes,palettes,typestyles,backgrounds,designers}/*.webp` — masuk checklist otomatis via image keys; tile inisial sampai digenerate.
