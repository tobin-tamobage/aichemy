# Riset Domain: MARKETING DESIGN (Aichemy Prompt Builder)

Riset untuk domain ke-4 Aichemy: web prompt builder frontend-only. Output = teks prompt bahasa Inggris yang user paste ke AI image app mereka (GPT Image/DALL-E, Midjourney, Imagen, dsb.) bersama foto referensi produk sendiri. Fokus: flyer, promo/sale ad, social media post & story, banner, poster, product announcement.

---

## 1. Anatomi Prompt Desain Marketing yang Efektif

Prompt desain marketing berbeda dari prompt foto/ilustrasi: AI harus membangun **layout grafis**, bukan cuma gambar. Urutan anatomi yang terbukti efektif:

1. **Jenis deliverable + format** — "vertical Instagram story promo graphic, 9:16" / "A4 sale flyer". Ini mengunci komposisi sejak awal.
2. **Subject / hero visual** — apa yang jadi pusat perhatian. Jika user melampirkan foto produk: *"use the attached product photo as the hero element, cut out cleanly, centered"* — jangan biarkan AI menggambar ulang produk.
3. **Layout description** — struktur zonasi: "headline di sepertiga atas, produk di tengah, badge diskon di pojok kanan atas, CTA di bawah". AI layout-aware (GPT Image, Imagen) merespons deskripsi zona dengan baik.
4. **Headline & copy** — tulis teks persis dalam tanda kutip: `headline text: "FLASH SALE 50%"`. Batasi maksimal 1 headline + 1 subheadline + 1 CTA. Alternatif aman: minta *placeholder* atau *empty space* (lihat bagian 4).
5. **Typography style** — "bold condensed sans-serif", "elegant serif", "chunky retro display font". Jangan minta font brand spesifik (AI tidak punya).
6. **Color scheme** — beri 2–3 warna konkret + peran: "background kuning mustard, teks hitam, aksen merah pada badge diskon". Warna brand user selalu disebut eksplisit.
7. **Design style / mood** — dari katalog style (bagian 2): "flat minimalist", "bold brutalist", dsb.
8. **Visual hierarchy cues** — "headline paling besar dan paling kontras; produk kedua; CTA ketiga". AI cenderung meratakan segalanya tanpa instruksi hierarki.
9. **CTA button** — "rounded pill button bertuliskan 'SHOP NOW' di bagian bawah" — sebut bentuk, posisi, warna.
10. **Negative prompt / guardrails** — "clean uncluttered layout, generous white space, no watermark, no extra text".

**Prinsip emas:** satu prompt = satu pesan. Semakin sedikit elemen copy, semakin akurat hasilnya.

---

## 2. Katalog Field Input + Opsi (siap jadi UI builder)

### Field 1 — Jenis Konten
`Flyer / Poster` · `Promo / Sale Ad` · `Social Media Post` · `Social Media Story` · `Web/E-commerce Banner` · `Product Announcement / Launch` · `Voucher / Coupon Graphic` · `Event Promo`

### Field 2 — Format & Ukuran
| Opsi | Rasio | Catatan prompt |
|---|---|---|
| Instagram Post | 1:1 (1080×1080) | "square 1:1" |
| Instagram/TikTok Story | 9:16 (1080×1920) | "vertical 9:16 story format, keep key elements in center safe zone" |
| Facebook/Landscape Banner | 16:9 | "wide 16:9 banner" |
| E-commerce banner (Shopee/Tokopedia) | 3:1 – 4:1 | "extra-wide horizontal marketplace banner" |
| Poster | 2:3 | "vertical poster 2:3" |
| Flyer | A4 (1:1.414) | "A4 portrait flyer" |
| X/LinkedIn header | 3:1 | "wide header banner" |

### Field 3 — Gaya Desain (katalog style)
- **Minimalist / Clean** — banyak white space, 1–2 warna, sans-serif tipis
- **Bold Brutalist** — tipografi raksasa, kontras ekstrem, blok warna solid, grid kaku
- **Modern Gradient** — gradient mesh lembut, glassmorphism, nuansa tech/startup
- **Retro / Vintage** — 70s/80s/90s, tekstur grain, warna muted, badge melingkar
- **Luxury / Elegant** — hitam-emas/navy, serif elegan, spacing lega, detail foil
- **Playful / Fun** — warna candy, ilustrasi doodle, font rounded, stiker
- **Corporate Clean** — biru/abu profesional, grid rapi, ikon sederhana
- **Y2K / Pop** — chrome, holographic, bintang, bubble type
- **Organic / Natural** — earth tone, tekstur kertas, elemen botani (cocok skincare/F&B artisan)
- **Streetwear / Urban** — grunge, tape, photocopy texture, layered collage

### Field 4 — Color Scheme
`Brand colors (isi manual hex/nama)` · preset: `Merah-Kuning (sale urgency)` · `Hitam-Emas (luxury)` · `Pastel Pink-Krem (beauty)` · `Biru-Putih (corporate)` · `Hijau-Krem (natural/organic)` · `Ungu-Biru gradient (tech)` · `Hitam-Putih kontras (brutalist)` · `Orange-Hitam (electronics/energetic)`

### Field 5 — Typography Style
`Bold condensed sans-serif` · `Elegant serif` · `Rounded playful` · `Retro display/groovy` · `Monospace tech` · `Handwritten accent (untuk sub-copy saja)` · `Chunky 3D type`

### Field 6 — Posisi & Teks Headline
- Teks headline (input bebas, dibungkus kutip)
- Strategi teks: `Render teks persis` · `Placeholder "[HEADLINE]"` · `Kosongkan area (copy ditambahkan manual di Canva)`
- Posisi: `atas` · `tengah` · `bawah` · `mengikuti diagonal produk`

### Field 7 — Elemen Promosi (multi-select)
`Badge diskon (%, "SALE", "50% OFF")` · `Harga coret (strikethrough)` · `Countdown/urgency tag ("Today Only")` · `CTA button ("Shop Now", "Order Sekarang", "Link in Bio")` · `Star rating / testimonial strip` · `Free ongkir/bonus tag` · `QR code placeholder`

### Field 8 — Perlakuan Foto Produk (referensi terlampir)
`Hero cutout di tengah` · `Hero dengan bayangan lembut` · `Flat lay bersama properti` · `Floating dengan elemen grafis di sekitarnya` · `Di dalam mockup lifestyle` · `Grid/kolase multi-angle` · `Dengan efek 3D pop-out dari frame`

### Field 9 — Latar / Background
`Solid brand color` · `Gradient dua warna` · `Pola/pattern abstrak` · `Foto lifestyle blur` · `Tekstur (paper, grain, concrete)` · `Scene tematik (dapur, meja kayu, studio)`

### Field 10 — Kepadatan / Guardrail
`Sangat minimal (banyak ruang kosong)` · `Seimbang` · `Padat promo (katalog style)` + toggle: "no extra text, no watermark, clean edges"

---

## 3. Tiga Contoh Prompt Jadi

### a) Promo Sale Flyer Makanan (A4, playful-bold)
> Design an A4 portrait sale flyer for a fried chicken restaurant promo, bold playful style. Use the attached product photo of the fried chicken bucket as the hero element — cut it out cleanly and place it large in the center with a soft drop shadow, slightly tilted for energy. Background: warm mustard yellow with subtle halftone dot pattern. At the top third, headline text in chunky bold condensed sans-serif, black with red outline: "CRAZY DEAL 50% OFF". Below it, a smaller subheadline in black rounded font: "Every Friday, All Outlets". Add a red circular badge in the top-right corner with white text "LIMITED". At the bottom, a rounded pill CTA button in red with white bold text "ORDER NOW". Visual hierarchy: headline biggest and highest contrast, product second, CTA third. Keep the layout clean with generous spacing, no additional text, no watermark.

### b) IG Story Skincare Launch (9:16, organic-elegant)
> Create a vertical 9:16 Instagram story graphic for a skincare product launch, organic elegant style. Use the attached serum bottle photo as the hero — place it in the lower-center on a soft beige stone podium with gentle natural lighting and a botanical leaf shadow falling across the background. Background: cream to sage green soft gradient with subtle paper texture. Keep all key elements within the central safe zone (avoid the top and bottom 250px). At the top, elegant thin serif headline text: "NEW" in small letterspaced caps, then "Glow Renewal Serum" in larger serif, dark forest green. Below the product, a minimal CTA in lowercase sans-serif: "shop now →" in dark green. Add small floating botanical line illustrations around the edges. Mood: calm, premium, natural. No extra text, no watermark, uncluttered.

### c) Banner Diskon Elektronik (16:9, modern gradient)
> Design a wide 16:9 e-commerce web banner for an electronics discount campaign, modern tech style. Use the attached headphone product photo as the hero on the right third of the banner — clean cutout, floating at a dynamic angle with a soft glow behind it. Background: deep navy-to-electric-blue gradient with subtle geometric line pattern. On the left two-thirds, bold condensed sans-serif headline in white: "MEGA SALE" with "UP TO 40% OFF" in larger bright orange below it. Under the headline, a small white subheadline: "Audio & Gadgets — This Week Only". Add a rounded pill CTA button in orange with white bold text "SHOP NOW" at the bottom-left. Clear visual hierarchy: discount text biggest, product second, CTA third. Leave breathing room around all elements, sharp clean edges, no extra text, no watermark.

---

## 4. Jebakan AI untuk Desain Marketing (dan strateginya)

1. **Teks salah tulis / gibberish.** Masalah terbesar. GPT Image (gpt-image-1/DALL-E 3 via ChatGPT) dan Imagen 3/4 jauh lebih akurat merender teks daripada Midjourney (v6 membaik tapi tetap sering typo). Strategi di Aichemy:
   - Selalu bungkus teks dalam tanda kutip persis.
   - Maksimal ~6 kata per elemen teks, total ≤3 elemen teks.
   - Opsi "placeholder": minta `"[HEADLINE]"` agar user ganti manual.
   - Opsi "kosongkan area": "leave clean empty space at the top for headline text" — user menambah copy di Canva/Photoshop. Paling aman untuk brand penting.
   - Rekomendasi di UI: tandai field teks dengan catatan "hasil terbaik di GPT Image; cek ejaan di output".
2. **Terlalu ramai.** AI suka mengisi setiap ruang kosong. Counter: "generous white space", "uncluttered", "only these elements: …", batasi multi-select elemen promosi (saran maks 3).
3. **Logo palsu / merk halusinasi.** Jangan minta AI menggambar logo brand. Strategi: "leave a clean placeholder circle/area at top-left for logo" — logo asli ditempel manual.
4. **Produk referensi digambar ulang.** Tanpa instruksi, AI mereinterpretasi foto lampiran. Selalu: "use the attached product photo exactly as-is, do not redraw or alter the product".
5. **Hierarki rata.** Semua elemen sama besar. Counter: kalimat hierarki eksplisit (headline > produk > CTA).
6. **CTA & badge cacat.** Teks kecil di tombol sering typo → pakai kata pendek ("SALE", "SHOP NOW") atau placeholder.
7. **Elemen terpotong di Story.** Format 9:16 punya UI overlay (nama akun, reply bar). Selalu tambahkan "keep key elements in the central safe zone".
8. **Rasio aspek salah.** Sebutkan rasio eksplisit ("9:16 vertical") — jangan andalkan kata "story" saja.

---

## 5. Sumber

- Genesys Growth — "Midjourney vs DALL·E vs Imagen: Complete Guide for Marketing Leaders 2026" (2025): perbandingan kekuatan tiap platform untuk kampanye marketing; DALL-E unggul di prompt adherence & teks, Midjourney di kualitas artistik. https://genesysgrowth.com/blog/midjourney-vs-dall-e-vs-imagen
- Vertu — "Midjourney vs DALL-E 3 vs Stable Diffusion 2025": bagian "Text Integration: A Critical Differentiator" — Midjourney lemah di teks, DALL-E 3 paling konsisten merender copy yang bisa dibaca. https://vertu.com/lifestyle/midjourney-vs-dall-e-3-vs-stable-diffusion-2025-ai-image-generation/
- Frank & Marci — survei DALL-E 3 vs Firefly 2 vs Midjourney 5.2: DALL-E/Firefly lebih baik menaati prompt kompleks (layout, elemen ganda). https://www.frankandmarci.com/blog/survey-results-dall-e-3-vs-firefly-2-vs-midjourney-which-one-is-best-for-your-business/
- Dokumentasi OpenAI GPT Image (2025): kemampuan text rendering dan penggunaan gambar referensi sebagai input edit. https://platform.openai.com/docs/guides/images
- Panduan safe-zone Meta/Instagram Stories (250px atas-bawah) — standar desain story.
