# Riset: Product Photography (AI Image Generation, E-commerce Focus 2025/2026)

Riset untuk merancang **domain recipe "Product Photography"** di Aichemy: field/seksi input + promptTemplate yang menghasilkan teks prompt bahasa Inggris untuk dipaste ke Gemini / Midjourney / ChatGPT (GPT Image) / dll.

---

## 1. Anatomi Prompt Produk yang Terbukti Efektif

Urutan elemen yang konsisten menghasilkan output paling terkontrol (konsensus dari template e-commerce 2025/2026 — AdLibrary, SurePrompts, Scalio, Mockit):

```
[Shot type + kamera/angle] → [Produk + atribut fisik] → [Surface/background] →
[Pencahayaan] → [Props/styling] → [Komposisi] → [Modifier komersial/kualitas] →
[Negative/avoid (jika platform mendukung)]
```

Contoh skeleton:

> "Professional product photography, 45-degree eye-level shot of [PRODUCT: matte ceramic pour-over coffee dripper in sage green], on a seamless white sweep background, soft diffused softbox lighting with gentle shadow, minimal styling, centered composition with negative space on the left for ad copy, commercial advertising quality, 8k, sharp focus, high detail"

Prinsip kunci:

1. **Subject-first constraint** — nyatakan produk + atribut material (matte/glossy/glass/fabric) sedini mungkin; atribut material mengontrol refleksi & tekstur.
2. **Satu adegan, satu cahaya** — jangan campur "natural window light" dan "dramatic studio rim light" dalam satu prompt; model akan mengkompromikan keduanya.
3. **Realisme datang dari constraint fisik** — sebutkan lensa ("85mm", "macro 100mm"), aperture ("f/8"), bukan mengulang kata "realistic".
4. **Urutan penting untuk Midjourney** — kata di depan lebih berbobot; gunakan `::` weighting dan `--no` untuk exclusion. Untuk GPT Image / Gemini, gunakan kalimat imperatif penuh ("Keep the label text crisp and legible").
5. **Sebutkan tujuan komersial** — "e-commerce catalog", "advertising hero image" menggeser model ke estetika iklan (bersih, kontras terkontrol, highlight produk).

Kata kunci modifier komersial yang efektif:
`professional product photography`, `commercial photography`, `advertising quality`, `8k product shot`, `studio lighting`, `sharp focus`, `high detail`, `shot on Phase One / Hasselblad / Canon EOS R5`, `85mm lens`, `f/8`, `packshot`, `catalog photography`, `Amazon listing photo`.

---

## 2. Field Input + Opsi (Katalog Siap Pakai)

### 2.1 Kategori Produk (mengontrol default props/styling)
- Skincare & beauty (serum, moisturizer, cleanser, parfum)
- Food & beverage (kopi, snack, minuman botol, kemasan)
- Fashion & accessories (sneakers, tas, jam tangan, pakaian)
- Electronics (headphone, smartwatch, gadget)
- Jewelry & luxury (cincin, kalung, anting)
- Home goods / lainnya

### 2.2 Shot Type
| Opsi | Kegunaan | Frasa prompt |
|---|---|---|
| Hero shot | Iklan utama, dramatis | "hero shot, slightly low angle, product as the dominant subject" |
| Eye-level / straight-on | Katalog, marketplace | "straight-on eye-level packshot" |
| 45-degree angle | Menampilkan 3 sisi | "45-degree angle three-quarter view" |
| Flat lay (top-down) | Styling, kit/bundle | "top-down flat lay composition" |
| Macro detail | Tekstur, jahitan, bahan | "extreme macro close-up detail shot, 100mm macro lens" |
| Lifestyle / in-context | Produk dipakai/di situasi nyata | "lifestyle in-context scene, product in real environment" |
| Scale shot | Menunjukkan ukuran | "scale reference shot next to [objek pembanding]" |
| Floating / levitation | Iklan dinamis | "product levitating mid-air, dynamic hero composition" |

### 2.3 Surface & Background
- **Seamless white sweep** — "seamless white background, studio sweep, pure white infinity cove" (wajib untuk Amazon/marketplace)
- **Marble** — "white Carrara marble surface with subtle veining"
- **Wood** — "rustic oak wooden table, warm natural grain"
- **Gradient studio** — "soft gradient studio backdrop from [warna A] to [warna B]"
- **Colored paper / solid backdrop** — "matte pastel [warna] seamless paper backdrop"
- **Concrete / stone** — "raw concrete surface, industrial texture"
- **Fabric / linen** — "draped beige linen fabric background"
- **Dark / black glossy** — "glossy black reflective surface, dark moody background"
- **Outdoor lifestyle** — "café table by the window", "beach sand", dll. (untuk shot lifestyle)

### 2.4 Pencahayaan Studio
- **Softbox diffused** — "large softbox lighting, soft diffused light, gentle even illumination"
- **Soft shadow katalog** — "soft natural drop shadow beneath the product"
- **Rim light** — "rim lighting outlining the product edges, separated from background"
- **Dramatic hard shadow** — "hard directional light, long dramatic shadows, high contrast"
- **Natural window light** — "soft natural window light from the left, airy and bright"
- **Golden hour** (lifestyle) — "warm golden hour sunlight, soft glow"
- **Backlit / glow** — "backlit translucent glow" (bagus untuk botol, serum, minuman)
- **Colored gel light** — "subtle [warna] gel accent lighting"

### 2.5 Props & Styling per Kategori
- **Skincare**: water droplets ("fresh water droplets on surface"), botanical leaves ("eucalyptus leaves"), ice cubes, silk ribbon, stone pedestal, bathroom tiles, sliced ingredients (aloe, citrus)
- **Food & beverage**: scattered ingredients ("scattered coffee beans", "cocoa powder dusting"), steam ("rising steam wisps"), linen napkin, ceramic mug pairing, wooden board, splash/freeze motion ("milk splash frozen in motion")
- **Fashion accessories**: worn-in-context ("styled on model's wrist", "on feet walking"), complementary items (sunglasses + watch), textured fabric, urban/street background
- **Electronics**: minimal desk setup, charging cable artfully arranged, screen glow ("subtle screen glow"), gradient tech backdrop, floating with cable loop
- **Jewelry**: velvet surface ("deep navy velvet"), macro sparkle ("brilliant facet sparkle, macro"), silk fabric, water surface reflection, model's neck/hand close-up
- **Jumlah props**: none / minimal (1–2) / styled set (3–5) — selalu "props support the product, product remains the focal point"

### 2.6 Komposisi
- Centered ("centered composition")
- Rule of thirds ("placed on the right third of the frame")
- Negative space untuk copy ("generous negative space on the left for ad copy / headline text")
- Symmetry ("symmetrical composition")
- Diagonal dynamic ("diagonal dynamic arrangement")
- Close crop / full product in frame ("entire product in frame, not cropped")

### 2.7 Rasio & Format
- 1:1 (marketplace), 4:5 (Instagram feed), 9:16 (story), 3:2 / 16:9 (banner/web)

### 2.8 Modifier Kualitas (multi-select)
`commercial photography` · `advertising quality` · `8k` · `ultra sharp focus` · `high detail` · `professional studio photography` · `shot on 85mm lens, f/8` · `packshot` · `award-winning product photography`

### 2.9 Negative / Avoid (untuk platform dengan negative prompt)
`distorted label, misspelled text, warped packaging, extra objects, cluttered background, harsh reflections, deformed product, low resolution, watermark, blurry`

---

## 3. Contoh Prompt Jadi

### 3.1 Skincare — White Sweep (katalog e-commerce)
> "Professional product photography, straight-on eye-level packshot of a minimalist frosted glass serum bottle with a white dropper cap and clean sans-serif label, on a seamless white studio sweep background, large softbox lighting with soft diffused illumination and a gentle natural drop shadow beneath the bottle, subtle fresh water droplets on the glass surface, single eucalyptus leaf placed beside the base, centered composition with generous negative space on the left for ad copy, commercial advertising quality, 8k, ultra sharp focus, shot on 85mm lens at f/8, Amazon listing photo style"

### 3.2 Coffee — Lifestyle (konten sosial media)
> "Commercial lifestyle photography, 45-degree angle shot of a matte black ceramic pour-over coffee dripper on a matching carafe, steam rising gently, placed on a rustic oak wooden café table beside a window, scattered roasted coffee beans and a folded beige linen napkin, soft natural window light from the left creating warm airy tones, blurred cozy café interior in the background with shallow depth of field, product placed on the right third of the frame, negative space on the upper left for headline copy, advertising quality, 8k, shot on 50mm lens at f/2.8, warm editorial color grading"

### 3.3 Sneaker — Dramatic (hero iklan)
> "Dramatic commercial product photography, slightly low-angle hero shot of a white and volt-green running sneaker levitating mid-air with laces dynamically floating, on a dark charcoal studio background with a subtle smoky haze, hard directional key light from the upper right casting long dramatic shadows, strong rim light outlining the sole and heel separating the shoe from the background, subtle green gel accent light from below, diagonal dynamic composition, the sneaker dominates the frame, advertising campaign quality, 8k, hyper-detailed texture on the knit fabric and rubber sole, sharp focus, award-winning sports product photography"

---

## 4. Jebakan AI pada Produk (Hal yang Harus Dihindari)

1. **Label & teks** — kegagalan paling umum: huruf acak, ejaan salah, logo melting. Mitigasi: instruksikan "clean legible label text" (GPT Image paling andal untuk teks), atau desain recipe agar user memilih "label: minimal/no text" bila target Midjourney; sertakan di negative prompt: `misspelled text, garbled letters`.
2. **Refleksi & material** — botol kaca/logam sering berubah bentuk karena refleksi lingkungan tak konsisten. Mitigasi: tentukan jenis cahaya TUNGGAL; tambahkan "realistic reflections consistent with studio setup"; hindari menggabungkan "glossy" + banyak props reflektif.
3. **Proporsi & deformasi produk** — tutup botol miring, roda/handle asimetris, sol sepatu menebal. Mitigasi: "accurate product proportions, symmetrical design"; hindari angle ekstrem untuk produk dengan geometri presisi.
4. **Duplikasi produk** — model kadang menggandakan objek ("two bottles"). Mitigasi: "a single [product]"; negative: `duplicate, extra objects`.
5. **Ukuran relatif props** — props (cangkir, daun, buah) sering tidak skala terhadap produk. Mitigasi: "correct physical scale between product and props".
6. **Warna brand bergeser** — sertakan deskripsi warna eksplisit ("sage green", bukan "green"); untuk konsistensi SKU, GPT Image / Gemini image-to-image lebih andal daripada text-only.
7. **Shadow hilang/mengambang** — produk tampak melayang tak sengaja di white sweep. Mitigasi: selalu tambahkan "soft natural drop shadow beneath the product" kecuali memang shot levitation.
8. **Over-styling** — terlalu banyak props menenggelamkan produk. Recipe harus membatasi jumlah props dan menambahkan "product remains the clear focal point".
9. **Efek "AI look"** — permukaan terlalu mulus/plastik. Mitigasi: tekstur mikro eksplisit ("fine condensation droplets", "visible knit texture", "subtle paper grain").
10. **Watermark/artefak** — masukkan di negative prompt: `watermark, logo artifacts, text overlay` (kecuali label produk sendiri).

---

## 5. Sumber

- AdLibrary — "AI Image Prompting for Ecommerce: Templates & Best Practices (2026)": https://adlibrary.com/guides/ai-image-prompting-ecommerce-templates
- SurePrompts — "35 ChatGPT Product Photography Prompts: Copy-Paste Templates (2026)": https://sureprompts.com/blog/chatgpt-product-photography-prompts
- Scalio — "AI Prompts for White Background Product Photography": https://scalio.app/prompts/white-background-product-photography/
- Mockit — "Photo Studio Prompts: 40+ Copy-Paste AI Prompts for Studio-Quality Photos": https://mockit.ai/blog/photo-studio-prompts/
- SCENE4 — "How to Use MidJourney for Product Photography (2025 Guide)": https://scene4.ai/blog/how-to-use-midjourney-for-product-photography-guide-no-prompt-workflow
- Nightjar — "Midjourney for Product Photos: Where It Excels and Where Dedicated Tools Win": https://nightjar.so/blog/midjourney-for-product-photos-vs-dedicated-tools
- DIY AI — "AI Photo Prompt: How to Write Prompts That Generate Realistic Images": https://diyai.io/ai-tools/image-generation/ai-photo-prompt/
- Claude Marketplaces (GPT Image 2 skill) — kemampuan teks label & konsistensi SKU: https://claudemarketplaces.com/skills/runcomfy-com/skills/gpt-image-2
- MacIssues — "Midjourney Prompt Guide 2025" (weighting `::`, negative prompts): https://macissues.com/midjourney-prompt-guide/
