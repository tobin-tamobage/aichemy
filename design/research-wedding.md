# Domain Research: Wedding Photography (AI Prompt Builder)

Riset untuk domain recipe "Wedding" di Aichemy. Target output: teks prompt bahasa Inggris
yang user paste ke Midjourney v7, Gemini Imagen, Flux, ChatGPT/DALL·E, dsb. (2025/2026).

---

## 1. Anatomi Prompt Wedding yang Efektif

Struktur kalimat terbaik (konsisten lintas Midjourney docs, guide komunitas, dan blog fotografer):

```
[SHOT TYPE] of [SUBJECT + attire detail] [ACTION/POSE] at/in [VENUE/SETTING],
[LIGHTING], [MOOD/EMOTION], [PHOTOGRAPHY STYLE],
[CAMERA/LENS/FILM keywords], [COMPOSITION notes]
→ parameter teknis di akhir (--ar, --style raw untuk MJ)
```

Urutan elemen yang terbukti:

1. **Shot type / framing** — "close-up portrait", "wide-angle full-length shot", "over-the-shoulder candid". Model membaca token awal paling berat; mulai dari apa yang difoto, bukan suasananya.
2. **Subject + attire** — "bride in a lace A-line gown with a cathedral veil", "groom in a navy three-piece suit". Detail pakaian = sinyal realisme terkuat untuk domain wedding.
3. **Action / pose** — gunakan kata kerja konkret ("walking down the aisle hand in hand", "dipping his bride mid-first-dance"), bukan abstrak ("romantic moment").
4. **Setting / venue** — satu anchor spasial: "inside a stone cathedral", "in a sunlit garden estate".
5. **Lighting** — elemen paling menentukan look: "golden hour backlight", "soft window light", "candlelit".
6. **Mood / emosi** — "joyful tears", "quiet anticipation". Pendek; 1–2 frasa.
7. **Photography style** — "documentary wedding photography", "fine art wedding editorial". Ini mengunci palet warna + treatment lebih efektif daripada daftar adjective.
8. **Technical keywords** — "shot on 85mm f/1.4, shallow depth of field, Kodak Portra 400 film tones, subtle grain".
9. **Parameter** (MJ): `--ar 3:2 --style raw --v 7`. `--style raw` menekan "beautification" default dan wajib untuk fotorealisme.

Kata kunci modifier yang konsisten menaikkan kualitas di domain wedding:

- `candid`, `unposed`, `documentary-style` → ekspresi natural, bukan senyum kaku.
- `shallow depth of field`, `soft bokeh`, `blurred background` → look lensa portrait mahal.
- `natural skin texture`, `realistic skin tones` → melawan wajah plastik/airbrushed.
- `film grain`, `Kodak Portra 400` / `Fuji 400H` → tonal film wedding klasik.
- `motion blur` (hem veil/dress), `confetti in mid-air` → dinamisme.
- Negative (MJ `--no` / di-model-lain kalimat eksplisit): `--no cartoon, illustration, oversaturated, plastic skin, extra fingers`.

---

## 2. Gaya Fotografi Wedding yang Diakui

Katalog gaya (masing-masing = satu opsi field "Style" + prompt modifier bawaan):

| Gaya | Ciri | Prompt modifier |
|---|---|---|
| **Editorial** | Posed, majalah fashion, komposisi kuat, sering high-fashion | `editorial wedding photography, Vogue-style, dramatic composition, high fashion` |
| **Documentary / Photojournalistic** | Candid, tanpa pose, storytelling, momen asli | `documentary wedding photography, candid unposed moment, photojournalistic, captured spontaneously` |
| **Fine Art** | Soft, ethereal, film-like, komposisi deliberat, palet lembut | `fine art wedding photography, soft ethereal tones, film aesthetic, delicate composition` |
| **Dark & Moody** | Shadow dalam, kontras tinggi, desaturated/warm gelap, cocok indoor/venue rustic | `dark and moody wedding photography, deep shadows, rich contrast, desaturated earthy tones` |
| **Light & Airy** | Bright, overexposed tipis, pastel, cocok outdoor siang | `light and airy wedding photography, bright soft tones, pastel palette, airy overexposed highlights` |
| **Classic / Traditional** | Posed formal, true-to-color, timeless | `classic traditional wedding photography, formal posed portrait, true-to-life colors, timeless` |
| **Vintage / Film** | Grain berat, warna analog, kadang faded | `vintage film wedding photo, 35mm analog, heavy film grain, faded nostalgic tones` |
| **Black & White** | Timeless, fokus emosi | `black and white wedding photography, monochrome, high contrast, timeless` |
| **Cinematic** | Look film layar lebar, widescreen, teal/warm grade | `cinematic wedding photography, movie still, anamorphic look, cinematic color grade` |

Catatan tren 2025/2026: documentary paling diminta secara global, sering di-blend dengan editorial ("docu-editorial"). Field style sebaiknya single-select dulu, blend = stretch goal.

---

## 3. Katalog Field Input (siap jadi katalog opsi)

### 3.1 Momen / Scene (field utama — menentukan default pose & setting)

- **Getting ready** — bride prep, groom prep, detail flat-lay
- **First look** — privat, sebelum ceremony
- **Ceremony** — processional/aisle walk, vow exchange, ring exchange, the kiss, recessional
- **Couple portrait session** — posed portraits setelah ceremony
- **First dance** — reception
- **Reception / party** — toast, cake cutting, dance floor, sparkler/confetti exit
- **Detail shots** — rings, invitation suite, bouquet, shoes, dress hanging

### 3.2 Pose / Shot (katalog per momen)

Getting ready: `buttoning the dress from behind`, `mother adjusting the veil`, `bride looking out the window`, `makeup touch-up candid`, `groom adjusting cufflinks`, `dress hanging by the window`.

First look: `groom's back to camera, bride approaching tapping his shoulder`, `embrace after the reveal`, `foreheads together eyes closed`.

Ceremony: `walking down the aisle (from behind, showing venue + guests turning)`, `exchange of vows close-up on hands`, `ring exchange macro`, `the ceremony kiss at the altar`, `recessional walk with confetti/petals`, `guests wiping tears (reaction shot)`.

Couple portraits: `walking hand in hand looking at each other`, `the dip`, `forehead kiss`, `nose to nose (eskimo kiss)`, `veil lift / under-the-veil portrait`, `veil flowing in the wind`, `groom lifting/spinning bride`, `just-married carry over threshold`, `back-to-back`, `bride's hand on groom's chest showing ring`, `silhouette against sunset`, `dancing alone outdoors`, `whispering / laughing candid`.

First dance: `mid-dip`, `slow dance close embrace`, `wide shot with guests around dance floor`, `lift`.

Reception: `champagne toast with raised glasses`, `cake cutting`, `sparkler exit send-off`, `confetti toss`, `dance floor party wide shot`.

Detail shots: `wedding rings macro on invitation`, `flat lay of invitation suite with flowers`, `bouquet close-up`, `heels and perfume flat lay`, `groom's watch and cufflinks`.

### 3.3 Venue / Setting

- Church / cathedral (stone interior, stained glass)
- Chapel (intimate, wooden pews)
- Garden estate / botanical garden
- Beach / seaside cliff
- Vineyard / winery
- Rustic barn / farm
- Ballroom / grand hotel
- Modern rooftop / city skyline
- Forest / woodland
- Mountain / lakeside
- Desert
- Villa / tropical (relevan untuk pasar Indonesia: Bali villa, kebun raya, gedung serbaguna — bisa jadi opsi "local venues")

### 3.4 Lighting

- **Golden hour** — `golden hour backlight, warm sun flare` (paling populer untuk portrait)
- **Blue hour** — `blue hour twilight, city lights bokeh`
- **Soft window light** — `soft natural window light, diffused` (getting ready default)
- **Candlelight** — `warm candlelight glow, intimate`
- **String lights / fairy lights** — `string lights bokeh background, warm ambient`
- **Church window / stained glass** — `dramatic light rays through stained glass windows`
- **Overcast / soft daylight** — `soft overcast daylight, even flattering light`
- **Sparkler light** — `sparkler send-off, warm spark trails, night`
- **Dance floor party light** — `colorful DJ lights, motion energy`
- **Dramatic off-camera flash** — `dramatic off-camera flash, night portrait`

### 3.5 Attire (Subject detail)

Bride: `A-line / ball gown / mermaid / sheath silhouette`, `lace / satin / tulle / chiffon fabric`, `cathedral / fingertip / birdcage veil`, `long train`, `bouquet type (wildflower, roses, pampas)`. Opsi lokal Indonesia: `kebaya wedding dress`, `hijab bridal style`, `sundanese/javanese traditional attire (siger, beskap)`.
Groom: `black tuxedo`, `navy / charcoal three-piece suit`, `bow tie / necktie`, `boutonniere`, opsi lokal: `beskap / jas adat`.

### 3.6 Composition / Framing

- `close-up portrait`, `medium shot`, `full-length wide shot`, `wide establishing shot with venue`, `over-the-shoulder`, `shot from behind`, `macro detail shot`, `symmetrical centered composition`, `rule of thirds`, `silhouette`

### 3.7 Technical / Camera keywords (masih relevan untuk AI 2025–26)

Masih efektif karena model mengaitkannya dengan distribusi visual foto pro:
- Lensa portrait: `85mm f/1.4`, `50mm f/1.2` → bokeh + kompresi wajah
- Wide scene: `35mm`, `24mm wide angle` → establishing shot venue
- Macro detail: `100mm macro lens` → ring/detail shots
- Film stock: `Kodak Portra 400` (skin tone hangat lembut — standar wedding), `Fuji 400H` (pastel hijau), `Ilford HP5` (B&W grain)
- Lainnya: `shallow depth of field`, `film grain`, `natural skin texture`, `high resolution`, `professional wedding photography`
- MJ parameter: `--style raw` (wajib fotorealisme), `--ar` (lihat bawah), `--no cartoon, 3d render`

### 3.8 Aspect Ratio khas wedding

- `3:2` — standar DSLR, default paling aman (ceremony, candid)
- `4:5` — portrait Instagram feed (couple portrait, detail)
- `2:3` — full-length bridal portrait
- `16:9` — cinematic wide (venue establishing, first dance wide)
- `1:1` — detail/flat lay, profile-style
- `9:16` — story/Reels format (veil shot vertikal, sparkler exit)

---

## 4. Contoh Prompt Jadi

### 4.1 Getting Ready (documentary, window light)

```
Candid documentary wedding photo of a bride in a lace A-line gown getting ready
in a bright bridal suite, her mother gently fastening the back buttons of the dress,
large windows with soft diffused morning light, white walls and fresh flowers in
the background, quiet anticipation and tender emotion, documentary wedding
photography, natural skin texture, shot on 85mm f/1.4, shallow depth of field,
Kodak Portra 400 film tones, subtle grain --ar 4:5 --style raw
```

### 4.2 Ceremony (classic, church)

```
Wide-angle photograph of a bride walking down the aisle arm in arm with her father
inside a historic stone cathedral, seen from behind, guests standing and turning to
look, dramatic light rays streaming through stained glass windows, flower petals
along the aisle, emotional reverent atmosphere, classic wedding photography,
true-to-life colors, shot on 24mm wide angle, deep depth of field, high resolution
--ar 3:2 --style raw
```

### 4.3 Golden Hour Couple Portrait (fine art, veil shot)

```
Fine art wedding portrait of a couple nose to nose under the bride's flowing
cathedral veil, standing in an open meadow at golden hour, warm backlight with soft
sun flare, veil catching the wind, blurred golden grass in the background, intimate
joyful mood, fine art wedding photography, soft ethereal film tones, shot on 85mm
f/1.4, shallow depth of field, Fuji 400H pastel tones, subtle film grain
--ar 2:3 --style raw
```

---

## 5. Jebakan / Hal yang Harus Dihindari

1. **Menumpuk adjective tanpa struktur** — "beautiful gorgeous stunning romantic" tidak menambah apa-apa; satu kata style ("documentary wedding photography") lebih kuat dari lima adjective.
2. **Mood/emosi berlebihan** — >2 frasa emosi membuat wajah AI jadi teatral/berlebihan ("crying with joy" → wajah aneh). Batasi 1–2.
3. **Tanpa `--style raw` (MJ)** — default MJ mem-beautify: kulit plastik, pose katalog. Untuk fotorealisme selalu `--style raw` (v6/v7).
4. **Keyword kamera bertentangan dengan shot type** — `85mm f/1.4 shallow DOF` untuk wide venue establishing shot = kontradiksi; template harus menyesuaikan lensa dengan framing (wide → 24/35mm + deep DOF; portrait → 85mm + shallow; detail → 100mm macro).
5. **Tangan & cincin** — close-up ring exchange/rawat tangan masih rawan jari ekstra. Mitigasi: framing medium shot, atau `--no extra fingers` + hindari "extreme close-up of hands".
6. **Dua wajah + ekspresi kompleks** — pose "whispering while laughing with eyes closed" sering merusak satu wajah. Pilih satu aksi dominan.
7. **Terlalu banyak elemen setting** — satu anchor venue; "beach with mountains, city skyline and forest" = komposisi kacau.
8. **Terjemahan literal istilah Indonesia** — "akad nikah", "resepsi" tidak dipahami model; selalu pakai istilah Inggris umum ("wedding vows ceremony", "wedding reception").
9. **Identitas orang nyata** — jangan meminta wajah selebriti/orang tertentu; selain pelanggaran ToS, hasilnya uncanny.
10. **Aspect ratio salah untuk momen** — veil shot vertikal di 16:9 ter-crop; detail flat lay di 2:3 menyisakan ruang kosong aneh. Template harus men-suggest default AR per scene.
11. **Style blend tanpa sadar** — "light and airy" + "dark and moody" dalam satu prompt saling meniadakan; UI sebaiknya single-select atau warning saat konflik.
12. **Panjang prompt** — >80 kata mulai mengencerkan sinyal di MJ; prioritaskan urutan (elemen awal paling berpengaruh), bukan kelengkapan.

---

## 6. Sumber

- Midjourney prompt structure & best practices:
  - https://apiframe.ai/guides/the-complete-midjourney-prompt-guide (Complete Midjourney Prompt Guide 2026)
  - https://cabina.ai/blog/how-to-write-effective-prompts-for-midjourney/
  - https://www.shopify.com/id/blog/prompts-for-midjourney
- Gaya wedding photography:
  - https://www.bespoke-bride.com/2026/04/27/wedding-photography-styles-guide/ (tren 2025/26: documentary paling diminta, blend docu-editorial)
  - https://tovstudiophoto.com/photography-editing-styles-compared/ (matching style ke venue/lighting)
  - https://whitequillcreative.com/wedding-photography-styles-explained/
  - https://channonwilliamson.com.au/wedding-photography-styles-explained/
  - https://caratsandcake.com/wedding-vendors/wedding-photographers
- Katalog pose & shot list:
  - https://wezoree.com/inspiration/your-ultimate-wedding-shot-list/
  - https://mondressy.com/blogs/weddings/guide-to-wedding-poses
  - https://www.heartfulvibes.com/100-romantic-couple-poses/
  - https://www.andibphoto.com/post/top-10-posing-prompts-for-wedding-day-portraits
  - https://www.ronisedaluz.com/international-wedding-resources-and-advice/14-must-do-classic-poses-for-wedding-photos-mnfn9
  - https://scenedisposable.com/wedding-photography-ideas
- Camera/technical keywords untuk AI realism:
  - https://blog.designhero.tv/ai-art-direction-prompts-flux-midjourney/
  - https://www.zegy.app/blog/mastering-photorealistic-portraits-with-ai-prompt-engineers-guide
- Contoh prompt wedding jadi:
  - https://imaginewithrashid.com/20-chatgpt-prompts-for-stunning-wedding-photography/
  - https://aiprompthub.tech/prompt/photorealistic-wedding-portrait-ai-prompt-for-professional-bridal-photography-tzp7
