# Riset Domain: PORTRAIT / HEADSHOT (Aichemy Prompt Builder)

Riset untuk domain ke-7 Aichemy: web prompt builder frontend-only. Output = teks prompt bahasa Inggris yang user paste ke AI image app mereka (GPT Image/DALL-E, Midjourney, Imagen, dsb.). Fokus niche: **headshot & potret orang** — corporate/LinkedIn headshot, actor headshot, editorial portrait, dan stylized avatar. Tidak ada referencePhoto di domain ini (subjek di-scene oleh AI). Dokumen ini MEMVALIDASI katalog dan smart rule yang dikodifikasi plan `2026-08-20-recipes-phase4.md` Task 1 & 2 — plan adalah sumber struktur, riset mendokumentasikan konvensi niche tanpa mengubah isi plan.

---

## 1. Anatomi Prompt Potret (Headshot) yang Efektif

Prompt potret berbeda dari prompt marketing: AI harus membangun **wajah + karakter orang yang kredibel**, bukan layout grafis. Urutan anatomi yang terbukti efektif:

1. **Jenis potret + konteks** — "corporate headshot", "actor headshot", "editorial portrait", "stylized avatar". Mengunci tujuan akhir (klien korporat vs casting vs majalah vs profil digital) dan menurunkan pilihan ekspresi/wardrobe yang sesuai.
2. **Lens & framing** — lensa menentukan kompresi wajah dan berapa banyak konteks terlihat. 85mm (head-and-shoulders, standar korporat) vs 200mm (tight face) vs 35mm (environmental). Lensa panjang memampatkan fitur (flattering); lensa lebar mendistorsi bila terlalu dekat.
3. **Lighting pattern** — pola cahaya menentukan kesan wajah: Rembrandt (klasik/kedalaman), butterfly (beauty/fashion), loop (natural, paling aman), split (dramatis/editorial), softbox flat (bersih/ID), window natural (lembut/approachable).
4. **Background** — seamless studio (korporat bersih), environmental blur (konteks hidup), plain color (avatar/stylized bersih). Background membawa konteks naratif: office → profesional, park → kasual.
5. **Wardrobe** — formal suit (otoritas korporat), business casual / smart casual (approachable), casual (relatable). Wardrobe harus koheren dengan background.
6. **Expression** — confident/subtle smile (trust, hangat), neutral (tenang), intense (dramatis, hanya actor/editorial). Ekspresi = bahasa non-verbal utama.
7. **Guardrail / negative** — "sharp focus on the eyes, natural skin texture, no heavy retouching, no text, no watermark". Blok penutup (pola marketing blok 10) mencegah kulit plastik, mata kosong, dan artifact AI.

**Prinsip emas:** satu prompt = satu subjek yang kredibel. Lighting, lensa, dan ekspresi harus saling menguatkan konteks.

### Lighting patterns — efek ke wajah & kapan dipakai

| Pattern | Efek ke wajah | Kapan dipakai |
|---|---|---|
| **Rembrandt** | Segitiga cahaya kecil di pipi sisi bayangan; kedalaman, karakter, kontur tegas | Standar korporat & editorial; paling aman untuk kesan profesional-berwibawa |
| **Butterfly** | Bayangan simetris di bawah hidung; wajah tampak ramping, halus, high-key | Beauty / fashion / editorial; kurang cocok untuk pria berfitur keras |
| **Loop** | Bayangan hidung kecil jatuh ke pipi; paling natural & flattering | Default paling aman untuk headshot korporat/LinkedIn |
| **Split** | Setengah wajah terang, setengah gelap; dramatis, teaterikal | Actor / editorial / karakter; TIDAK untuk korporat |
| **Softbox (flat)** | Cahaya merata, hampir tanpa bayangan; wajah bersih, datar | ID/pasfoto, LinkedIn bersih, avatar |
| **Window (natural)** | Cahaya lembut dari samping; natural, hangat, approachable | Editorial kasual, lifestyle |

### Lens choice — kompresi & framing

- **85mm close-up** — standar emas headshot. Kompresi panjang lensa memampatkan fitur wajah (flattering) dan memisahkan subjek dari background (bokeh). Head-and-shoulders. Pilihan yang benar untuk corporate headshot.
- **200mm tight** — telephoto ekstrem, framing wajah sangat ketat. Kompresi kuat, background ter-isolasi maksimal. Untuk close-up dramatis/editorial.
- **50mm half-body** — perspektif natural setara mata, framing setengah badan. Fleksibel.
- **35mm environmental** — lensa lebar, menangkap konteks sekitar subjek. Bagus untuk editorial/behind-the-scenes, TETAPI terlalu banyak konteks & distorsi untuk corporate headshot.

### Background conventions

- **Seamless studio** — backdrop bersih tanpa distraksi; standar korporat & avatar.
- **Neutral office (blur)** — konteks profesional hidup tanpa mencuri fokus dari wajah; LinkedIn/korporat.
- **City bokeh** — latar urban blur; editorial/actor yang ingin kesan kota.
- **Outdoor park (blur)** — konteks kasual/relatable; harus dipasangkan wardrobe non-formal.
- **Plain color** — backdrop warna solid; avatar/stylized, atau potret minimalis.

### Expression & wardrobe psychology per use-case headshot

- **Corporate / LinkedIn headshot** — *trust + approachable authority*. Wardrobe: formal suit / business casual. Expression: confident smile / subtle smile.
- **Actor headshot** — *emotion + casting*. Expression: intense. Actor dibooking berdasarkan emosi yang bisa ditampilkan — ekspresi netral adalah pilihan terlemah.
- **Editorial portrait** — *karakter + mood*. Bebas memakai split lighting, wardrobe statement, ekspresi kuat.
- **Stylized avatar** — *konsistensi + bersih*. Ilustrasi digital konsisten, ekspresi netral/senyum, plain background, tanpa detail kamera (lensa/cahaya tidak relevan untuk gaya ilustrasi).

---

## 2. Katalog Field Input + Opsi (dari plan Task 1 — validasi)

Katalog berikut persis dari `domains/portrait-catalogs.ts` (plan Task 1 Step 1); riset memvalidasi tiap pilihan sebagai konvensi niche yang sah.

### Field 1 — Portrait Type (5)
`Corporate headshot` · `LinkedIn headshot` · `Actor headshot` · `Editorial portrait` · `Stylized avatar`

### Field 2 — Lighting Setup (6)
| Opsi | promptPhrase (plan) | Validasi riset |
|---|---|---|
| Rembrandt | "Rembrandt lighting with a soft triangle of light on the shadowed cheek" | Segitiga cahaya = definisi textbook Rembrandt |
| Butterfly | "symmetrical shadow under the nose" | Ciri khas butterfly pattern |
| Loop | "a small nose shadow toward the cheek" | Definisi loop pattern |
| Split | "half the face lit, half in shadow" | Definisi split pattern |
| Softbox (flat) | "even, shadowless softbox lighting" | Ciri softbox datar |
| Window (natural) | "soft natural window light from the side" | Ciri window light |

### Field 3 — Background & Setting (5)
`Seamless studio` · `Blurred office` · `City bokeh` · `Outdoor park` · `Plain color`

### Field 4 — Wardrobe (4)
`Formal suit` · `Business casual` · `Smart casual` · `Casual`

### Field 5 — Expression (4)
`Confident smile` · `Subtle smile` · `Neutral` · `Intense`

### Field 6 — Lens & Framing (4)
| Opsi | promptPhrase (plan) | Validasi riset |
|---|---|---|
| 85mm close-up | "an 85mm lens, head-and-shoulders framing" | Standar emas headshot korporat |
| 50mm half-body | "a 50mm lens, half-body framing" | Perspektif natural, setengah badan |
| 35mm environmental | "environmental framing with context around the subject" | Editorial/konteks; bukan korporat |
| 200mm tight | "a 200mm telephoto lens, tight face framing" | Close-up ketat/editorial |

**Default empty state** (plan Task 2): `corporate-headshot` + `rembrandt` + `seamless-studio` + `formal-suit` + `confident-smile` + `85mm-closeup` — kombinasi paling konservatif & benar secara konvensi.

---

## 3. Kenapa Setiap Smart Rule di Plan Penting

Plan Task 2 Step 1 mendefinisikan 5 warning smart-rule untuk `portrait.ts`. Masing-masing grounded pada konvensi fotografi potret:

### (a) Avatar mode → skip Lighting & Lens clause (info, 'portrait-type')
Gaya ilustrasi tidak memiliki fisika kamera — lensa dan lighting pattern adalah properti fotografi, bukan ilustrasi digital. Mencampur "Rembrandt lighting" ke avatar ilustrasi menghasilkan gaya tidak konsisten. Plan benar memakai varian prompt avatar terpisah dengan klausa ilustrasi murni ("Clean illustration style, consistent character design, soft shading").

### (b) formal-suit + outdoor-park → mismatch (warn, 'wardrobe')
Koherensi konteks: setelan formal adalah bahasa visual korporat/studio; taman luar ruangan adalah konteks kasual/rekreasi. Kombinasi ini memberi sinyal ganda yang membingungkan. Konvensi potret menuntut wardrobe selaras dengan setting. **Catatan (bukan kontradiksi):** plan menyarankan "studio or office background" — sejalan dengan katalog (seamless-studio/neutral-office), jadi valid.

### (c) actor-headshot + neutral → info "weakest choice" ('wardrobe')
Prinsip casting: aktor dibooking berdasarkan *emosi* yang bisa mereka proyeksikan. Headshot aktor adalah alat casting — ekspresi netral tidak menjual emosi apa pun dan karenanya paling lemah untuk use-case ini. Plan mengangkatnya sebagai info (bukan warn) karena netral bukan *error*, hanya suboptimal.

### (d) corporate-headshot + intense → warn off-brand ('wardrobe')
Ekspresi intense menyiratkan konflik, drama, ketegangan — berlawanan dengan trust/approachability yang dicari brand korporat. Plan menyarankan confident/subtle smile, sesuai konvensi korporat.

### (e) corporate-headshot + 35mm-environmental → warn, perlu 85mm ('lens')
Framing korporat harus head-and-shoulders dengan kompresi 85mm — standar industri headshot. 35mm environmental mendistorsi fitur saat dekat dan memasukkan terlalu banyak konteks, menggeser fokus dari wajah klien.

---

## 4. Tiga Contoh Prompt Jadi

### a) Corporate Headshot (Rembrandt, 85mm, seamless studio, formal suit, confident smile)
> A corporate headshot of a person, shot on an 85mm lens, head-and-shoulders framing.
>
> Lighting: Rembrandt lighting with a soft triangle of light on the shadowed cheek.
>
> Background: a clean seamless studio backdrop.
>
> The subject wears a formal suit with a confident smile.
>
> Sharp focus on the eyes, natural skin texture, photorealistic, no heavy retouching, no text, no watermark.

### b) Actor Headshot (Split, 200mm tight, city bokeh, intense)
> An actor headshot of a person, shot on a 200mm telephoto lens, tight face framing.
>
> Lighting: split lighting, half the face lit, half in shadow.
>
> Background: a blurred city bokeh background.
>
> The subject wears business casual attire with an intense, dramatic expression.
>
> Sharp focus on the eyes, natural skin texture, photorealistic, no heavy retouching, no text, no watermark.

### c) Stylized Avatar (butterfly/plain color, subtle smile — varian ilustrasi)
> A stylized digital avatar portrait of a person with a subtle, natural smile.
>
> The character wears a smart casual outfit.
>
> Background: a plain solid color backdrop.
>
> Clean illustration style, consistent character design, soft shading, high detail, no text, no watermark.

Catatan: contoh (c) mengikuti varian avatar plan Task 2 — TIDAK memuat blok Lighting/Lens (konsisten dengan smart rule (a)), dan menutup dengan guardrail ilustrasi murni.

---

## 5. Jebakan AI untuk Potret / Headshot (dan strategi di Aichemy)

| # | Jebakan | Gejala AI | Strategi di Aichemy (guardrail prompt) |
|---|---|---|---|
| 1 | **Kulit over-smoothing / plastik** | Tekstur kulit dihaluskan berlebihan, tampak waxy/plastik | Guardrail "natural skin texture, no heavy retouching" di blok penutup semua varian foto |
| 2 | **Tangan cacat** | Jari salah jumlah, bentuk aneh, tidak anatomis | Hindari pose tangan di prompt default; framing head-and-shoulders/close-up meminimalkan tangan dalam frame |
| 3 | **Artifact teks** | Rambut/background memunculkan huruf/teks gibberish; logo palsu | Guardrail "no text" di blok penutup; background seamless/plain mengurangi teks acak |
| 4 | **Watermark** | Watermark/stempel palsu menempel di gambar | Guardrail "no watermark" eksplisit di blok penutup semua varian |
| 5 | **Fokus mata hilang / mata kosong** | Mata tidak tajam, iris blur, tatapan kosong/berbeda arah | Guardrail "Sharp focus on the eyes" — mata adalah anchor psikologis potret |

Strategi umum: blok guardrail/negative adalah **konstanta blok terakhir** di `buildPrompt` (pola marketing blok 10, keputusan authoring plan) — bukan field terpisah, sehingga selalu aktif.

---

## 6. Sumber

- Konvensi lighting pattern potret (Rembrandt, butterfly, loop, split) — standar fotografi studio klasik.
- Standar lensa headshot: 85mm sebagai lensa headshot standar industri karena kompresi flattering; wide/35mm untuk environmental/editorial.
- Konvensi headshot korporat: head-and-shoulders framing, ekspresi trust/confident, background bersih — standar branding profesional/LinkedIn.
- Pola `buildPrompt` guardrail/negative sebagai konstanta blok penutup — meniru `domains/marketing.ts` (pola marketing blok 10).

---

*Dokumen riset untuk implementer: plan `docs/superpowers/plans/2026-08-20-recipes-phase4.md` adalah sumber struktur/konten yang otoritatif. Doc ini memvalidasi katalog & smart rule; semua promptPhrase dipakai PERSIS dari plan. Tidak ada kontradiksi antara riset dan plan; plan tetap utuh.*
