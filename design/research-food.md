# Riset Domain: FOOD PHOTOGRAPHY (Aichemy Prompt Builder)

Riset untuk domain ke-6 Aichemy: prompt builder frontend-only. Output = teks prompt bahasa Inggris yang user paste ke AI image app mereka (GPT Image/DALL-E, Midjourney, Imagen, dsb.). Fokus: fotografi makanan — dengan katalog hidangan Indonesia sebagai diferensiator (rendang, sate, nasi goreng, soto, rawon, ayam bakar, mie goreng) yang prompt generik tidak tahu plating-nya.

---

## 1. Anatomi Prompt Foto Makanan yang Efektif

Urutan anatomi yang terbukti efektif (divalidasi oleh plan Task 2 Step 3 food.ts buildPrompt):

1. **Dish + kata "appetizing"** — sebut hidangan spesifik + konteks makanan: "Appetizing food photograph of beef rendang…". Kata kunci yang menandakan makanan mencegah AI menginterpretasi sebagai objek abstrak.
2. **Presentation / gaya penyajian** — fine-dining (precise, minimal), rustic family-style (generous, casual), flat lay (ingredients arranged around the dish). Mengunci komposisi meja.
3. **Light mood** — bright & airy (soft diffused daylight), dark & moody (deep shadows, dramatic), window light, warm & cozy (golden tones). Mood menentukan seluruh rasa foto.
4. **Steam clause (hidangan panas)** — "Light steam rising from the dish, served fresh and hot" — sinyal kesegaran; AI tidak menambahkan uap sendiri secara konsisten.
5. **Angle** — 45° (klasik, menunjukkan kedalaman + tekstur permukaan), overhead (flat lay), side profile (menunjukkan lapisan/tinggi), close-up (tekstur makro).
6. **Backdrop / surface** — marble, wood, banana leaf, linen, slate, ceramic. Permukaan menentukan mood; banana leaf otentik untuk masakan Indonesia.
7. **Guardrail / negative** — "no hands, no people, no text, no watermark" — AI suka menambahkan tangan yang memegang piring/alat makan, dan teks di piring/taplak.

**Prinsip emas:** satu hidangan, satu angle, satu mood. Semakin spesifik plating (garnish, saus, pelengkap), semakin akurat hasilnya.

---

## 2. Katalog Field Input + Opsi (sesuai plan Task 1 Step 3)

### Field 1 — Dish (14 opsi; 8 Indonesia + 6 internasional)
- **Rendang** — "beef rendang with dark glossy caramelized coconut sauce, tender shredded beef, garnished with fried shallots and red chili" — kunci: *glossy caramelized* (saus mengkilap = matang sempurna), *shredded* (tekstur daging).
- **Sate Ayam** — "chicken satay skewers with charred edges, peanut sauce on the side, lime wedges and ketupat rice cakes" — kunci: *charred edges* (gosong tipis = panggang api), saus kacang dipisah (bukan disiram).
- **Nasi Goreng** — "Indonesian fried rice topped with a fried egg, shrimp crackers, cucumber slices and fried shallots" — kunci: telur ceplok di atas, kerupuk, timun, bawang goreng.
- **Gado-Gado** — "Indonesian vegetable salad with creamy peanut dressing, boiled egg, tofu and lontong rice cakes" — kunci: saus kacang creamy, telur rebus, tahu, lontong.
- **Soto Ayam** — "golden turmeric chicken soup with rice noodles, bean sprouts, lime and fried shallots" — kunci: kuah kuning kunyit, soun, tauge, jeruk nipis.
- **Rawon** — "dark black beef soup with keluak broth, bean sprouts and sambal" — kunci: kuah hitam keluak (warna khas, prompt generik tidak tahu).
- **Ayam Bakar** — "grilled chicken with a smoky sweet glaze, sambal and fresh vegetables" — kunci: glaze manis gosong, sambal.
- **Mie Goreng** — "stir-fried noodles with vegetables, egg and kecap manis glaze" — kunci: glaze kecap manis mengkilap.
- **Sushi platter** — "an elegant sushi platter with glistening fresh nigiri and maki rolls" — *glistening* = kesegaran.
- **Ramen** — "a steaming bowl of ramen with rich broth, soft-boiled egg, chashu pork and spring onions" — kunci: uap, telur setengah matang.
- **Pasta** — "a plated pasta dish, al dente, with fresh herbs and shaved parmesan".
- **Gourmet burger** — "a juicy gourmet burger with melted cheese, crisp lettuce and a toasted bun".
- **Plated dessert** — "a delicate plated dessert with a glossy sauce swirl and a light garnish".
- **Iced drink** — "a refreshing iced drink in a tall glass with condensation droplets" — kunci: *condensation droplets* (embun di gelas = dingin).

### Field 2 — Presentation
`Fine dining` (precise, minimal) · `Rustic family style` (generous, casual) · `Flat lay` (ingredients arranged around)

### Field 3 — Light Mood
`Bright & airy` (soft diffused daylight, clean white balance) · `Dark & moody` (deep shadows, dramatic contrast) · `Window light` (soft natural from side) · `Warm & cozy` (golden evening tones)

### Field 4 — Angle
`45°` (klasik) · `Overhead` (top-down) · `Side profile` (menunjukkan tinggi/lapisan) · `Close-up` (tekstur makro)

### Field 5 — Backdrop & Props
`White marble` · `Rustic wood table` · `Banana leaf` (otentik Indonesia) · `Linen` · `Dark slate` · `Ceramic tableware`

---

## 3. Tiga Contoh Prompt Jadi

### a) Nasi Goreng rustic (window light, 45°, wood table)
> Appetizing food photograph of nasi goreng, Indonesian fried rice topped with a fried egg, shrimp crackers, cucumber slices and fried shallots. Presentation: rustic family-style serving, generous and casual. Lighting: soft natural window light from the side. Light steam rising from the dish, served fresh and hot. Shot from a 45-degree angle, the classic food photography view. Served on a rustic wood table. Vibrant natural colors, shallow depth of field, fresh garnish, no hands, no people, no text, no watermark.

### b) Rendang dark & moody (fine dining, side profile, dark slate)
> Appetizing food photograph of beef rendang with dark glossy caramelized coconut sauce, tender shredded beef, garnished with fried shallots and red chili. Presentation: fine-dining plating, precise and minimal. Lighting: dark and moody, deep shadows, dramatic contrast. Light steam rising from the dish, served fresh and hot. Shot from a side profile view showing height and layers. Served on a dark slate surface. Vibrant natural colors, shallow depth of field, fresh garnish, no hands, no people, no text, no watermark.

### c) Ramen 45° (warm & cozy, ceramic)
> Appetizing food photograph of a steaming bowl of ramen with rich broth, soft-boiled egg, chashu pork and spring onions. Presentation: rustic family-style serving, generous and casual. Lighting: warm cozy evening light with golden tones. Light steam rising from the dish, served fresh and hot. Shot from a 45-degree angle, the classic food photography view. Served on handmade ceramic tableware. Vibrant natural colors, shallow depth of field, fresh garnish, no hands, no people, no text, no watermark.

---

## 4. Jebakan AI untuk Foto Makanan (dan strateginya)

| # | Jebakan | Strategi di recipe |
|---|---|---|
| 1 | Tangan/alat makan muncul (AI suka menambah tangan memegang piring/sumpit) | Guardrail "no hands, no people" di blok terakhir |
| 2 | Garnish salah: rendang tanpa bawang goreng, sate tanpa saus kacang | promptPhrase dish PERSIS menyebut garnish otentik per hidangan |
| 3 | Hidangan panas tampak dingin/tidak ada uap | HOT_DISHES + steam clause "Light steam rising" (smart rule a) |
| 4 | Angle overhead meratakan hidangan tinggi (ramen, burger, minuman) | TALL_DISHES + warning (b): sarankan 45° atau side profile |
| 5 | Flat lay vs close-up konflik (dua arahan komposisi bertentangan) | Warning (c): minta user pilih salah satu |
| 6 | Teks/logo muncul di piring, taplak, atau kemasan | Guardrail "no text" |
| 7 | Makanan tampak plastik/soggy (over-sharpening, pencahayaan datar) | Light mood eksplisit + "vibrant natural colors, shallow depth of field" |
| 8 | Watermark/artefak AI | Guardrail "no watermark" |

---

## 5. Sumber Konvensi

- Plating & garnish otentik masakan Indonesia (rendang, sate, nasi goreng, soto, rawon, ayam bakar, mie goreng) — pengetahuan kuliner standar; promptPhrase diauthoring di plan (deviasi dari sumber umum ditandai di kode).
- Sudut 45° sebagai angle standar food photography; overhead untuk flat lay; side profile untuk lapisan — konvensi fotografi makanan umum.
- Backdrop banana leaf — konvensi penyajian Indonesia (hidangan di atas daun pisang).
