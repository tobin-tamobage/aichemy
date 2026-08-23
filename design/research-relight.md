# Riset Domain: PHOTO RELIGHT & COLOUR GRADE (Aichemy Prompt Builder)

Riset untuk recipe baru Aichemy: **photo relight / colour grading** — user upload foto referensi (wajib), lalu membangun prompt relight & colour grade via **visual prompt builder** (semua field visual/chips, tanpa textarea bebas). Output = teks prompt English yang di-paste ke AI image editor yang mendukung relighting & style transfer: **FLUX Kontext / FLUX Fill, Gemini 2.5 Flash Image (Nano Banana), Seedream 4, SDXL IC-Light, ComfyUI IC-Light workflow, Magnific Relight**.

> Scope: **re-lighting** = ubah arah/kualitas/warna cahaya tanpa ubah identitas/subjek. **Colour grading** = ubah palet warna/mood via LUT/film-emulation/style-transfer. Keduanya bisa dipilih terpisah atau bersamaan. **Background cleanup** = hapus orang lain di background (inpaint) — toggle on/off. Reference photo = ground truth — prompt harus mengandung klausa preservasi identitas.
---

## 1. Teknik Relight AI Populer (2024–2026) — yang harus tercermin di katalog

### 1.1 IC-Light (Zhang et al., 2024) — *de facto standard*
- **Apa:** ControlNet/DiT yang memisahkan *appearance* vs *illumination*. Input: foto + prompt cahaya atau background image/HDR → output: foto yang sama dengan pencahayaan baru, bayangan & highlight konsisten.
- **Varian 2024-2025:** IC-Light v1 (SD 1.5), IC-Light v2 (SDXL), **IC-Light for FLUX / FLUX Kontext** (2025) — kualitas bayangan & konsistensi tekstur jauh lebih baik. ComfyUI node `IC Light` paling dipakai di komunitas.
- **Prompt pattern IC-Light:** `"dramatic rim lighting from behind, soft gradient background"` + negative `"preserve face identity, same person, same clothes"`
- **Kenapa penting untuk Aichemy:** pola prompt IC-Light = bukti bahwa *arah cahaya + warna + kualitas (soft/hard) + preservasi* adalah 4 variabel inti prompt relight.

### 1.2 DiffusionLight / DiLightNet / Total Relighting (2024)
- **DiffusionLight (Pang et al.):** estimasi **HDR environment map** dari foto tunggal → lalu re-render dengan HDR baru. Prompt-nya: deskripsi environment (`"warm sunset HDRI through window"`).
- **DiLightNet (Zhang):** depth-aware relighting untuk portrait — prompt mengandung *light direction* + *HDRI*.
- **Total Relighting (Pandey et al.):** inverse rendering PBR (albedo/normal/roughness) → relight fisik akurat.
- **Implikasi katalog:** butuh field **Light Direction** (kiri/kanan/belakang/atas) dan **Environment/HDRI mood** (studio, window, outdoor, neon).

### 1.3 HDR + PBR Inverse Rendering (2025)
- Model 2025 meniru pipeline 3D: `foto → albedo + normal + env map → relight`. Prompt sering menyebut *material preservation* (`"keep skin texture, keep fabric material"`).
- Istilah yang muncul di prompt komunitas: `PBR, physically based, ray traced shadows, global illumination`

### 1.4 FLUX Kontext / Gemini Nano Banana / Seedream 4 — *instruction-based relight* (2025-2026)
- Model instruction-editing terbaru: cukup prompt natural language `"relight the subject with soft golden hour light from the left, keep the background unchanged"`. Tidak perlu ControlNet terpisah.
- **Pola prompt 2025-2026:** kalimat instruksi tunggal + klausa preservasi eksplisit per elemen (wajah, pakaian, background).
- **Kenapa penting:** konvensi prompt sekarang = **instruksi edit** bukan **deskripsi scene**. Recipe Aichemy harus menghasilkan *edit instruction* ("relight this photo…") bukan "a photo of…".

### 1.5 Video relight (DiLight, IC-Light video, 2025)
- Ekstensi temporal: konsisten antar-frame. Tidak perlu untuk recipe foto, tapi memperkuat bahwa *lighting intensity & shadow softness* adalah kontrol independen.

---

## 2. Teknik Colour Grading AI Populer

### 2.1 3D LUT & Film Emulation (paling dipakai di komunitas)
- **3D LUT**: tabel pemetaan warna. Di prompt: `"Kodak Portra 400 LUT"`, `"Fujifilm Eterna LUT"`, `"Teal and Orange blockbuster LUT"`.
- **Film stocks** yang paling sering dipakai di prompt (komunitas Midjourney/FLUX): Kodak Portra 400/800, Kodak Gold, Cinestill 800T, Fujifilm Eterna, Ektar 100, expired film.
- **Pola prompt:** `"color graded with Kodak Portra 400, warm highlights, muted teal shadows"`

### 2.2 AI Style Transfer / Color Transfer (2024-2025)
- **Reference-based grading:** upload foto referensi kedua sebagai *style source* → model meniru paletnya (AdaIN, Style-Aligned, IP-Adapter color). Prompt: `"match the color palette of the reference, warm autumn tones, desaturated greens"`.
- **2025:** FLUX + IP-Adapter & Gemini Nano Banana bisa `image-to-image color transfer` hanya dengan prompt yang mendeskripsikan palet referensi.

### 2.3 Cinematic Colour Grading presets
- Preset yang viral di 2024-2025 untuk prompt:
  - **Teal & Orange** (blockbuster)
  - **Bleach Bypass** (kontras tinggi, desaturasi, Saving Private Ryan)
  - **Noir** (high contrast B&W + satu aksen warna)
  - **Vintage / Faded** (lifted blacks, warm)
  - **Cyberpunk** (neon magenta-cyan)
  - **Wes Anderson** (pastel simetris)
  - **A24 / muted earthy** (desaturasi natural)
  - **Golden Hour warm** (oranye-emas)
  - **Blue Hour cool**

### 2.4 Textual Inversion untuk grading
- Banyak creator menjual "grading prompts" sebagai satu frasa ajaib: `"cinematic color grading, soft film grain, subtle halation"`. Ini menjadi *finishing clause* di prompt.

---

## 3. Anatomi Prompt Relight & Grade yang Efektif (2025-2026)

Urutan yang terbukti menghasilkan relight stabil di IC-Light / FLUX Kontext / Nano Banana:

1. **Edit instruction + preservasi identitas** — `"Relight this photo of the same person, keep facial identity, skin texture, clothing, and pose exactly the same."` (paling krusial; tanpa ini AI akan mengganti wajah)
2. **Light direction & quality** — arah (`from left 45°`, `rim from behind`, `top-down`), kualitas (`soft diffused`, `hard directional`, `volumetric`), sumber (`window`, `softbox`, `neon`)
3. **Light color & temperature** — `warm 3200K golden hour`, `neutral 5600K`, `cool 7500K`, `RGB gel (teal, magenta)`, `candlelight`
4. **Shadow & contrast** — `soft shadows`, `hard shadows`, `high contrast chiaroscuro`, `flat even lighting`
5. **Environment / HDRI** — konteks yang menghasilkan cahaya: `studio backdrop`, `neon city street`, `forest canopy`, `overcast sky` (untuk relight yang butuh bounce)
6. **Colour grade / LUT** — `graded with Kodak Portra 400 LUT, teal-orange, lifted blacks, subtle film grain`
7. **Background handling** — `keep background unchanged` vs `relight background consistently`
8. **Negative / guardrail** — `no face swap, no plastic skin, no extra person, no text, photorealistic, 8k detail`

**Prinsip emas 2025:** *preservasi > estetika*. Semua prompt relight yang bagus menyebut 3 preservasi: **identity + texture + pose**.

---

## 4. Katalog yang Diusulkan (semua visual)

Semua field `kind: 'visual'` agar sesuai permintaan "semua menggunakan visual prompt builder". Tidak ada textarea bebas.

| # | Field (key) | Label UI | Opsi (jumlah) | Visual preview |
|---|-------------|----------|---------------|----------------|
| 1 | `mode` | Relight mode | 3: `relight-only` / `grade-only` / `both` | icon + contoh before/after |
| 2 | `lightDirection` | Light direction | 8: front / 45° left / 45° right / side / rim-back / top / butterfly / split | diagram wajah + arah cahaya |
| 3 | `lightQuality` | Light quality | 6: soft diffused / hard directional / volumetric god rays / bounced window / neon glow / candle flicker | close-up shadow edge |
| 4 | `lightColor` | Light color | 8: neutral 5600K / warm golden hour / cool blue hour / warm tungsten 3200K / RGB teal / RGB magenta / mixed neon / candlelight | color swatch + contoh kulit |
| 5 | `intensity` | Intensity & contrast | 5: flat even / natural / dramatic / high-contrast chiaroscuro / low-key moody | histogram mini |
| 6 | `environment` | Environment bounce | 6: studio seamless / window natural / outdoor overcast / neon city / forest canopy / luxury interior | HDRI thumb |
| 7 | `colorGrade` | Colour grade (LUT) | 10: none-natural / Kodak Portra 400 / Cinestill 800T / Fujifilm Eterna / Teal-Orange / Bleach Bypass / Vintage faded / Cyberpunk / Wes Anderson pastel / Noir | LUT preview strip |
| 8 | `gradeStrength` | Grade strength | 4: subtle / medium / strong / extreme | slider visual (chip) |
| 9 | `preservation` | Keep / preserve | chips multi: `keep face identity`, `keep skin texture`, `keep background`, `keep clothing` (default semua ON) | chips |
| 10 | `backgroundMode` | Background handling | 3: keep unchanged / relight consistently / replace with environment | visual |
| 11 | `removeBackgroundPeople` | Remove people from background | toggle ON/OFF (default OFF) — checklist hapus orang di belakang | toggle switch |
> Catatan: field 9 `preservation` memakai `kind: 'chips'` multi-select — tetap visual. Field 2-7 conditional pada `mode` (mis. grade-only sembunyikan direction/quality).

---

## 5. Contoh Prompt Jadi (yang akan dihasilkan buildPrompt)

### a) Relight saja — golden hour window 45° left, preservasi penuh
> Relight this photo with soft, diffused golden hour light coming from the left at 45 degrees, warm 3200K color temperature, bouncing naturally through a large window.
>
> Lighting intensity is dramatic but natural, with soft shadows and gentle falloff on the skin.
>
> Environment bounce from a bright window interior, consistent with the original background.
>
> Keep facial identity, skin texture, clothing, pose, and background exactly the same. Photorealistic, sharp focus, no plastic skin, no face swap, no extra person, no text.

### b) Colour grade saja — Kodak Portra teal-orange medium
> Color grade this photo with a Kodak Portra 400 film emulation, teal-orange palette — warm skin tones, muted teal shadows, lifted blacks, subtle film grain and halation.
>
> Grade strength: medium, natural and cinematic, not over-saturated.
>
> Keep facial identity and skin texture exactly the same, keep background unchanged.

### c) Both — neon rim + cyberpunk grade
> Relight this photo with a hard, directional neon rim light from behind, mixed magenta and teal gels, high-contrast chiaroscuro shadows.
>
> Environment: neon-lit city street at night, glowing reflections.
>
> Then color grade with a cyberpunk LUT — neon magenta-cyan palette, crushed blacks, high saturation, subtle bloom.
>
> Remove all other people from the background — clean, empty background behind the subject, no crowd, no bystanders, inpaint naturally.
>
> Keep facial identity, skin texture, and pose exactly the same; relight the background consistently with the new neon environment. No plastic skin, no face swap, photorealistic.

### d) Relight + hapus orang di background (crowd removal)
> Relight this photo with soft, diffused neutral daylight from the front, natural intensity.
>
> Remove all other people from the background — clean, empty background behind the subject, no crowd, no bystanders, inpaint the area naturally to match the environment.
>
> Keep facial identity, skin texture, clothing, and pose exactly the same. Photorealistic, no plastic skin, no extra person (background already cleaned).

---

## 6. Jebakan AI untuk Relight/Grade & Mitigasi

| # | Jebakan | Gejala | Mitigasi di Aichemy |
|---|---------|--------|---------------------|
| 1 | **Face swap / identity drift** | Wajah berubah jadi orang lain | Guardrail `keep facial identity exactly the same` + smart rule wajib referencePhoto |
| 2 | **Plastic skin** | Kulit waxy, pori hilang | Guardrail `keep skin texture, no plastic skin` + intensity tidak flat |
| 3 | **Color bleed ke kulit** | LUT membuat kulit oranye/hijau tidak natural | Field `preservation: keep skin texture` + grade strength default `medium` + warning bila `extreme + Portra` |
| 4 | **Shadow tidak konsisten** | Bayangan ganda / arah salah | Prompt selalu menyebut satu `lightDirection` tunggal + `single light source` |
| 5 | **Background ikut berubah tidak diinginkan** | Background terganti padahal ingin keep | Field `backgroundMode` eksplisit per kombinasi |
| 6 | **Over-grade / oversaturated** | Warna norak, tidak sinematik | Grade strength `subtle/medium` default; warning bila `extreme` |
| 7 | **Background crowd tidak hilang / terpotong aneh** | Orang di belakang masih ada atau hasil inpaint berantakan | Toggle `Remove people from background` → prompt eksplisit `remove all other people… inpaint naturally`; bila toggle off, guardrail `no extra person` dipertahankan |
---

## 7. Sumber & Konvensi Visual

- IC-Light (Zhang et al. 2024) — GitHub `lllyasviel/IC-Light`, HuggingFace `IC-Light`, ComfyUI-IC-Light.
- DiffusionLight (Pang 2024), DiLightNet — arxiv: diffusion-based relighting, HDR env map.
- FLUX Kontext (Black Forest Labs 2025), Gemini 2.5 Flash Image / Nano Banana (Google 2025), Seedream 4 (ByteDance 2025) — instruction-based edit.
- Komunitas prompt: `r/StableDiffusion`, `Civitai IC-Light`, `FLUX prompts` — pola LUT/film stock & preservasi.
- Konvensi katalog visual Aichemy: `images/relight/<kategori>/<slug>.webp`, `previewRatio` `aspect-[4/3]` untuk lighting, `aspect-video` untuk environment, `aspect-square` untuk LUT swatch.

---

*Dokumen ini menjadi dasar authoring plan `docs/superpowers/plans/2026-08-23-relight-recipe.md` — plan adalah sumber struktur yang otoritatif untuk koding `domains/relight.ts` & `relight-catalogs.ts`.*
