# Riset Domain Recipe: ID / Passport Photo (Pas Foto)

> Riset untuk merancang "domain recipe" Aichemy — web prompt builder frontend-only.
> Output recipe = teks prompt **bahasa Inggris** yang user paste ke Gemini (Nano Banana) / ChatGPT / Midjourney / dll.
> Tanggal riset: 2026-08-19.

---

## 0. Konteks Domain: Kenapa Pas Foto Beda dari Domain Lain

Pas foto adalah domain **paling terkendali** dari semua domain fotografi: pose, ekspresi, latar, dan pencahayaan semuanya diatur standar resmi. Ini kabar baik untuk prompt builder — variasinya sedikit, sehingga field bisa berupa **dropdown tertutup** dengan kualitas hasil yang sangat konsisten.

Dua mode penggunaan nyata yang harus didukung recipe:

1. **Image-to-image (mode utama, ~90% kasus):** user upload selfie/foto kasual → AI mengganti latar + pakaian + merapikan pose. Prompt WAJIB mengandung klausa pelestarian identitas ("preserve exact facial features") dan klausa pengabaian input ("ignore the original outfit and background").
2. **Text-to-image:** user mendeskripsikan persona dari nol (contoh: mockup, ilustrasi, atau tanpa foto sumber). Prompt mengandung deskripsi subjek (umur, gender, rambut).

> ⚠️ Catatan etika/legal yang harus tampil di UI: foto hasil AI **berisiko ditolak** untuk dokumen biometrik vital (KTP, paspor, visa) karena banyak lembaga mensyaratkan foto studio terverifikasi. Pas foto AI aman untuk lamaran kerja, CV, LinkedIn, keperluan internal, dan dokumen non-biometrik. Sertakan disclaimer ini di recipe.

---

## 1. Anatomi Prompt yang Terbukti Efektif

Dari analisis puluhan prompt pas foto yang beredar (LightX, blog prompt Gemini Indonesia, panduan biometric photo), prompt terbaik selalu mengikuti **urutan elemen yang sama**. Urutan ini yang harus direplikasi `promptTemplate`:

### Urutan blok (10 blok)

1. **Intent / jenis foto** — "Transform this photo into a formal Indonesian ID photo (pas foto)" atau "Generate an ultra-realistic biometric passport photo". Menyebut konteks dokumen ("official document photo standard") membuat AI masuk mode patuh-standar.
2. **Pelestarian identitas** *(hanya img2img)* — "Preserve the exact facial features, face shape, skin tone, hairstyle, and identity from the uploaded photo. Do not alter the face." Tanpa ini, AI sering "mempercantik" sampai wajah berubah.
3. **Subjek & pakaian** — gender/usia + detail pakaian spesifik. Semakin spesifik semakin akurat: "crisp white long-sleeved formal shirt", "navy blue blazer", "black neatly-draped hijab". Hindari kata generik "formal clothes".
4. **Pose & framing** — "front-facing pose", "head and upper shoulders visible", "head centered", "shoulders level and symmetrical", "direct eye contact with the camera". Untuk standar biometrik: "face occupies approximately 70–80% of the image height".
5. **Ekspresi** — dokumen resmi: "neutral expression, mouth closed, no smile". CV/LinkedIn boleh: "subtle professional smile".
6. **Latar belakang** — warna + kata kunci keseragaman: "solid red background, seamless, uniform, evenly lit, no gradient, no vignette, no shadows on the background".
7. **Pencahayaan** — "professional studio softbox lighting, soft and even illumination, no shadows on the face". Ini kata kunci paling berpengaruh untuk kesan "studio".
8. **Kualitas teknis** — "photorealistic, high-resolution DSLR quality, 85mm lens, sharp focus, natural skin texture with realistic pores, accurate skin tones, no beauty filter, no retouching".
9. **Format output** — rasio/ukuran: "3:4 portrait orientation", "2×2 inch (51×51 mm), minimum 600×600 px, print-ready, 300 DPI".
10. **Daftar negatif** — "no glasses, no jewelry, no accessories, no watermark, no text, no logos, no blur, no artistic effects, no distortion".

### Kata kunci paling krusial (prioritas)

| Prioritas | Keyword | Efek |
|---|---|---|
| ★★★ | `front-facing`, `centered`, `symmetrical shoulders`, `direct eye contact` | Membunuh pose 3/4 & miring — cacat paling umum |
| ★★★ | `neutral expression, mouth closed` | Standar resmi; mencegah senyum berlebih |
| ★★★ | `solid [warna] background, no shadows, no gradient` | Latar polos tanpa bayangan — masalah #1 pas foto AI |
| ★★★ | `preserve exact facial features` (img2img) | Wajah tidak berubah dari foto sumber |
| ★★ | `soft even studio lighting / softbox` | Pencahayaan rata, hilang bayangan hidung/leher |
| ★★ | `head and shoulders`, `face 70–80% of frame` | Framing pas foto yang benar |
| ★ | `natural skin texture, no beauty filter` | Menghindari wajah plastik/AI look |
| ★ | `photorealistic, DSLR, 85mm, sharp focus, high-resolution` | Modifier kualitas standar |

### Rasio aspek per ukuran cetak Indonesia

| Ukuran cetak | Rasio prompt | Umum dipakai untuk |
|---|---|---|
| 2×3 cm | 2:3 | dokumen pelengkap, arsip |
| 3×4 cm | 3:4 | lamaran kerja, ijazah, SKCK |
| 4×6 cm | 2:3 | lamaran kerja (paling direkomendasikan HRD), dokumen resmi |
| 2×2 inch (51×51 mm) | 1:1 | visa AS/India, paspor AS |
| 35×45 mm | 7:9 (≈3:4) | visa Schengen/UK |
| 50×70 mm | 5:7 | paspor Kanada |

Catatan: AI generator tidak bisa memotong ke ukuran cm presisi — recipe sebaiknya meminta **rasio aspek** yang benar dan menyarankan crop akhir di tool lain.

---

## 2. Katalog Field Input + Opsi (Siap Jadi Recipe)

### Seksi A — Mode & Sumber

| Field | Tipe | Opsi |
|---|---|---|
| `mode` | radio | `edit` (upload foto — tambahkan klausa preserve identity + "ignore the original outfit and background") · `generate` (text-to-image — tambahkan deskripsi subjek) |
| `subjectDescription` | text (hanya mode generate) | mis. "Indonesian man in his late 20s, short black hair" |

### Seksi B — Keperluan & Ukuran

| Field | Tipe | Opsi |
|---|---|---|
| `purpose` | dropdown | Lamaran kerja / CV · Dokumen resmi (KTP/KK/SIM/SKCK) · Akademik/ijazah · PNS/instansi pemerintah · Paspor/visa Indonesia · Visa internasional · LinkedIn/profesional headshot |
| `printSize` | dropdown | 2×3 cm · 3×4 cm · 4×6 cm · 2×2 inch (AS/India) · 35×45 mm (Schengen/UK) · 50×70 mm (Kanada) |
| `aspectRatio` | auto dari printSize (bisa override) | 2:3 · 3:4 · 1:1 · 7:9 · 5:7 |

### Seksi C — Latar Belakang ⭐ (field paling penting di Indonesia)

| Field | Tipe | Opsi |
|---|---|---|
| `backgroundColor` | dropdown + swatch | **Merah solid** (konvensi: tahun kelahiran **ganjil** — 1987, 1991, 2001…) · **Biru solid** (tahun kelahiran **genap** — 1988, 1992, 2000…) · **Putih** (paspor, visa AS/Schengen, dokumen internasional) · Abu-abu muda (korporat/LinkedIn) · Biru muda (varian akademik/anak) |
| `birthYearHint` | toggle/info | Tampilkan helper: "Tahun lahir ganjil → merah, genap → biru" (konvensi umum Indonesia, bukan hukum — kecuali KTP yang mengikuti aturan Dukcapil) |

Nilai warna yang disarankan di prompt (AI kadang menghasilkan merah/biru "murahan" jika hanya "red"):
- Merah: "solid deep red studio backdrop (#C8102E)" — jangan pure `#FF0000`, terlalu menyala.
- Biru: "solid medium blue studio backdrop (#2E5FA3 / #1E6FD9)" — hindari navy (terlalu gelap) dan cyan.
- Putih: "plain pure white background (#FFFFFF), seamless".

### Seksi D — Pakaian

| Field | Tipe | Opsi |
|---|---|---|
| `outfit` | dropdown | Kemeja putih lengan panjang (default paling aman) · Kemeja putih + jas hitam · Kemeja putih + jas navy · Kemeja putih + jas abu-abu charcoal · Kemeja batik lengan panjang (formal/PNS) · Blouse putih formal (wanita) · Blazer hitam/navy + blouse · Jas lengkap + dasi navy/hitam · Polo/kemeja kerah (kasual resmi, non-dokumen) |
| `tie` | checkbox (hanya jika jas) | Dasi navy solid · dasi hitam solid |
| `hijab` | checkbox + sub-field | Jika aktif → `hijabColor`: hitam · navy · putih/off-white · abu-abu · cokelat muda. Aturan prompt: "neatly draped hijab that fully covers hair and neck, forehead-to-chin fully visible, face oval clearly framed" |

**Aturan kontras pakaian vs latar** (harus divalidasi di UI — kombinasi terlarang):
- Latar putih → ❌ kemeja putih/blouse putih/hijab putih tanpa blazer (wajib lapisan gelap).
- Latar merah → hindari pakaian merah/batik dominan merah.
- Latar biru → hindari kemeja biru/hijab navy tanpa lapisan kontras.

### Seksi E — Wajah, Pose, Ekspresi

| Field | Tipe | Opsi |
|---|---|---|
| `expression` | radio | Netral, mulut tertutup (default, wajib dokumen resmi) · Senyum tipis profesional (CV/LinkedIn) |
| `gaze` | fixed | "eyes looking directly at the camera, both eyes open and clearly visible" (tidak perlu jadi field — masuk template) |
| `framing` | dropdown | Dada ke atas / head-and-shoulders (default) · Setengah badan (4×6 lamaran kerja) |
| `faceOccupancy` | auto | "face occupies 70–80% of image height" untuk biometrik; longgar untuk CV |

### Seksi F — Kualitas & Finishing

| Field | Tipe | Opsi |
|---|---|---|
| `quality` | fixed di template | "photorealistic, high-resolution DSLR quality, sharp focus, natural skin texture, realistic skin pores, accurate skin tones" |
| `retouching` | radio | Natural / no beauty filter (default, wajib resmi) · Sedikit merapikan (rambut, noda) untuk CV |
| `printReady` | checkbox | "print-ready, 300 DPI, minimum 600 px" |
| `extraNegatives` | fixed di template | "no glasses, no jewelry, no accessories, no watermark, no text, no logos, no blur, no shadows, no artistic effects" |

### Struktur `promptTemplate` (urutan penyusunan)

```
[mode clause] + [identity preservation?] + [subject + outfit (+hijab)] +
[pose & framing] + [expression & gaze] + [background: warna + uniformity keywords] +
[studio lighting clause] + [quality modifiers] + [output format & ratio] + [negative list]
```

---

## 3. Contoh Prompt Jadi (Copy-Paste Ready)

### Skenario 1 — Latar merah formal (lamaran kerja / dokumen resmi, jas hitam, mode edit)

```
Transform the uploaded photo into a formal Indonesian ID photo (pas foto) that meets official
document standards. Preserve the exact facial features, face shape, skin tone, hairstyle, and
identity from the original photo — do not alter or beautify the face. Ignore the original
outfit and background completely.

Dress the subject in a crisp white long-sleeved formal shirt with a black formal suit jacket.
Front-facing pose, head and upper shoulders visible, head perfectly centered, shoulders level
and symmetrical, both eyes looking directly at the camera. Neutral expression, mouth closed,
no smile.

Solid deep red studio background (#C8102E), seamless and uniform, evenly lit, no gradient,
no vignette, no shadows on the background. Professional studio softbox lighting, soft and
even illumination on the face, no shadows under the nose or chin, balanced exposure,
natural skin tones.

Photorealistic, high-resolution DSLR quality, 85mm lens, sharp focus, natural skin texture
with realistic pores, no beauty filter, no excessive retouching. 3:4 portrait orientation
(3×4 cm print), print-ready.

No glasses, no jewelry, no accessories, no watermark, no text, no logos, no blur,
no artistic effects.
```

### Skenario 2 — Latar biru, kemeja putih tanpa jas (SKCK / lamaran / arsip kantor, mode edit)

```
Edit the uploaded photo into a professional Indonesian ID photo (pas foto). Keep my face,
hairstyle, and identity exactly the same as in the original photo. Replace my outfit with a
clean, neat white long-sleeved collared shirt (no jacket). Replace the entire background
with a solid medium blue studio backdrop (#1E6FD9) — flat, uniform, evenly lit, with no
gradient and no shadows.

Straighten my posture: body and head facing the camera directly, shoulders level and
symmetrical, head centered in the frame, head and upper shoulders visible. Neutral,
calm expression, mouth closed, eyes looking straight into the lens.

Apply professional studio softbox lighting: soft, even illumination that removes all harsh
shadows from the face and the background. Natural skin texture and accurate skin tones.

Photorealistic, ultra high resolution, sharp focus, DSLR studio quality. 3:4 portrait
orientation, print-ready at 300 DPI.

No smile, no glasses, no jewelry, no beauty filter, no watermark, no text, no blur.
```

### Skenario 3 — Paspor / visa internasional, latar putih, jas navy (biometrik, mode edit)

```
Create an ultra-realistic biometric passport and visa photograph from the uploaded photo.
Preserve exact facial features, identity, skin tone, and current age — do not retouch or
beautify the face. The subject is front-facing, looking directly at the camera with a neutral
expression and closed mouth. Head centered, shoulders visible and symmetrical, both ears
partially visible, hair away from the eyes.

Dress the subject in a tailored navy blue blazer over a white dress shirt (dark layer required
against the white background).

Plain pure white background (#FFFFFF), seamless, evenly illuminated, absolutely no shadows
on the face or background, no red-eye. Soft, even professional studio lighting, balanced
exposure, natural skin tones, sharp facial details, high-resolution image.

Face occupies approximately 70–80% of the image height, official biometric passport crop.
Output: 1:1 square, 2×2 inch (51×51 mm), minimum 600×600 pixels, print-ready.

No filters, no beauty retouching, no smile, no glasses, no hats, no head covering, no jewelry,
no distracting accessories, no watermark, no text, no blur.
```

### Skenario Bonus — Varian hijab (latar biru, dokumen resmi Indonesia)

```
Transform the uploaded photo into a formal Indonesian ID photo (pas foto) for official
documents. Preserve the exact facial features and identity — do not alter the face.
Dress the subject in a neatly draped black hijab that fully covers the hair and neck, with
the face oval clearly framed and the forehead-to-chin area fully visible, paired with a
modest white formal blouse. (Note: ears do not need to be visible for hijab ID photos.)

Front-facing pose, direct eye contact, head centered, shoulders symmetrical. Neutral
expression, mouth closed, natural minimal makeup.

Solid medium blue studio background (#1E6FD9), flat and uniform, no gradient, no shadows.
Professional studio softbox lighting, even illumination, no shadows on the face or background.
Photorealistic, DSLR quality, sharp focus, realistic fabric texture, natural skin tones,
4:5 portrait orientation, print-ready.

No beauty filter, no excessive retouching, no accessories, no watermark, no text, no blur.
```

---

## 4. Jebakan & Hal yang Harus Dihindari

### Jebakan teknis AI (paling sering terjadi)

1. **Bayangan di latar belakang.** Kegagalan #1 pas foto AI — muncul bayangan kepala/bahu di latar. Solusi: selalu sertakan `seamless background, no shadows on the background, evenly lit` DAN `soft even studio lighting`. Satu klausa saja tidak cukup.
2. **Pose 3/4 atau kepala miring.** Default AI untuk "portrait" adalah angle artistik. Solusi: tumpuk keyword `front-facing, head centered, shoulders level and symmetrical, direct eye contact`. Untuk biometrik tambahkan `both ears visible` (non-hijab).
3. **Senyum berlebih.** AI menilai senyum = foto bagus. Solusi: eksplisit `neutral expression, mouth closed, no smile` + masukkan `no smile` juga di daftar negatif.
4. **Warna latar tidak solid / gradasi / studio-abu.** "Red background" saja sering jadi gradasi gelap-terang. Solusi: `solid`, `uniform`, `flat`, plus **hex code** warna target.
5. **Wajah berubah (mode edit).** Gemini/ChatGPT suka "memperbaiki" wajah. Solusi: klausa `preserve exact facial features… do not alter or beautify the face` di awal prompt (posisi awal lebih dipatuhi).
6. **Wajah plastik / over-smoothed.** Solusi: `natural skin texture, realistic skin pores, no beauty filter, no excessive retouching`.
7. **Pakaian menyatu dengan latar.** Kemeja putih di latar putih → kepala melayang. Solusi: validasi kontras di UI + instruksi lapisan gelap di prompt.
8. **Rasio aspek salah.** AI default ke rasio bebas. Solusi: selalu sebut rasio eksplisit (`3:4 portrait orientation`) + rekomendasikan crop akhir manual — AI tidak bisa presisi cm.
9. **Teks/logo/watermark artefak.** Selalu akhiri dengan daftar negatif `no watermark, no text, no logos`.
10. **Pakaian generik.** "Formal clothes" menghasilkan acak. Solusi: deskripsi pakaian sangat spesifik (warna, lengan, kerah, lapisan).

### Jebakan aturan/konteks Indonesia

- **Konvensi merah/biru tahun kelahiran** (merah = ganjil, biru = genap) adalah konvensi luas, bukan hukum tertulis untuk semua dokumen — tetapi **KTP mengikuti aturan ini** (Dukcapil). UI sebaiknya memberi helper text, bukan enforcement.
- **Hijab:** dahi hingga dagu wajib terlihat penuh (pemindai biometrik); telinga TIDAK wajib terlihat untuk wanita berhijab. Prompt harus eksplisit "forehead-to-chin fully visible" agar AI tidak menutupi rahang.
- **Kacamata:** dokumen biometrik melarang kacamata (meski user berkacamata sehari-hari) → selalu ada `no glasses` di negatif untuk mode resmi.
- **Legal/etika:** foto AI berisiko ditolak untuk KTP/paspor/visa (standar biometrik & verifikasi keaslian). Tampilkan disclaimer; posisikan recipe untuk lamaran kerja, CV, LinkedIn, dan keperluan non-vital.
- **Jangan janjikan ukuran cetak presisi** — sampaikan "rasio sudah benar, tinggal crop/print ke 3×4".

---

## 5. Sumber

1. LightX Editor — "10+ Passport-Size Photo Prompts to Create Professional Photos" (2026): anatomi prompt biometrik, face 70–80% frame, prompt per negara (India/UK/US/Kanada), prompt grid 3×3 dengan klausa preserve identity, daftar negatif standar. https://www.lightxeditor.com/blog/passport-size-photo-prompt/
2. Gen Amikom — "7+ Prompt Gemini AI Foto Formal: Cara Bikin Pas Foto, Potret Resmi, dan Hasil Profesional Tanpa Studio" (2025): prompt latar merah/biru Indonesia, transformasi dari foto kasual ("abaikan pakaian dan latar asli"), prompt gaya PNS/batik Korpri, tips softbox lighting, risiko etika dokumen resmi. https://blog.amikom.ac.id/prompt-gemini-ai-foto-formal-cara-bikin-pas-foto-potret-resmi-dan-hasil-profesional-tanpa-studio/
3. Paspoto.com — "Persyaratan Foto Paspor Indonesia 2026" & "Pas Foto Hijab KTP & Paspor 2026: Aturan Wajah & Telinga" (2026): komposisi centered, jarak ujung kepala ke tepi, bahu simetris; visibilitas dahi–dagu krusial untuk biometrik; telinga tidak wajib untuk hijab. https://www.paspoto.com/blog/persyaratan-foto-paspor-indonesia-2026 · https://www.paspoto.com/blog/aturan-pas-foto-hijab-dokumen-resmi-2026
4. Dukcapil Kab. Madiun — "Latar Belakang Foto KTP" (2025): konfirmasi resmi merah = tahun kelahiran ganjil, biru = genap untuk KTP. https://dukcapil.madiunkab.go.id/latar-belakang-foto-ktp/
5. Erafone — "Melihat Makna Tersembunyi di Balik Warna Background Pas Foto" (2025): konvensi warna latar di dokumen umum. https://erafone.com/artikel/post/melihat-makna-tersembunyi-di-balik-warna-background-pas-foto
6. Dealls & Ajaib — ukuran pas foto lamaran kerja (2×3, 3×4, 4×6; 4×6 paling direkomendasikan HRD). https://dealls.com/pengembangan-karir/foto-lamaran-kerja · https://ajaib.co.id/ukuran-pas-foto-paling-sering-dipakai-untuk-melamar-kerja/
7. Pincel blog — "Make a Passport Photo from Any Selfie Using AI" (2025): pola prompt edit selfie → pas foto. https://blog.pincel.app/ai-passport-photo/
8. HelpingPrompt — "20 Passport Size Photo Prompts for a Clean Background": keyword framing "equal space left and right, minimal empty space above head". https://helpingprompt.in/20-passport-size-photo-prompts-for-a-clean-background-studio-look-no-editing-needed/
