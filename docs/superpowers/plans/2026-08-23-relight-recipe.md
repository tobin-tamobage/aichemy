# Aichemy Recipe Baru — Photo Relight & Colour Grade (Visual Prompt Builder)

> **For agentic workers:** Use `superpowers:subagent-driven-development`. Steps use checkbox (`- [ ]`) syntax. Riset authoritative: `design/research-relight.md`.

**Goal:** Recipe baru **Relight** — user upload 1 foto referensi (wajib, via `referencePhoto: true` + composite 1-4 yang sudah ada), lalu memilih *relight* dan/atau *colour grade* semuanya lewat **visual prompt builder** (tanpa textarea bebas). Output = edit-instruction prompt yang stabil di **FLUX Kontext / Gemini Nano Banana / Seedream 4 / SDXL IC-Light** dengan preservasi identitas.

**Repo:** `/Users/tobin/Documents/Aichemy/renderzero-web`, branch `feat/relight-recipe`. Base: `main @ 9e9fe21`.

**Files:** BARU `domains/relight.ts`, `domains/relight-catalogs.ts`. EDIT `domains/index.ts` (registry), `public/images/relight/*` (thumbs — placeholder boleh, VisualSelector fallback ke initials). **Tidak ada perubahan lain** (promptBuilder, types, storage tidak disentuh).

**Konvensi visual:** semua field `kind: 'visual'` kecuali `preservation` (`kind: 'chips'` multi, tetap visual). `previewRatio`: `aspect-[4/3]` untuk lighting, `aspect-video` untuk environment, `aspect-square` untuk LUT swatch. Image path: `images/relight/<kategori>/<slug>.webp`.

---

## §1 Riset → Keputusan Katalog (ringkas)

Riset `design/research-relight.md` memetakan 5 teknik populer 2024-2026 ke field:

| Teknik | Mapping ke field |
|--------|------------------|
| **IC-Light / FLUX IC-Light** — arah + kualitas cahaya + preservasi | `lightDirection` (8), `lightQuality` (6), `preservation` |
| **DiffusionLight / DiLightNet / Total Relighting** — HDR env + PBR | `environment` (6), `intensity` (shadow/contrast) |
| **Instruction edit (FLUX Kontext / Nano Banana / Seedream 4)** — edit instruction + keep clauses | `mode` + `backgroundMode` + guardrail di `buildPrompt` |
| **3D LUT / Film emulation** (Portra, Cinestill, Eterna…) | `colorGrade` (10) + `gradeStrength` (4) |
| **AI color transfer / reference palette** | `colorGrade` mencakup opsi generic + strength; v2 bisa tambah reference kedua |

**Anatomi prompt (urutan blok buildPrompt):** 1) edit instruction + preservasi → 2) light direction & quality → 3) light color/temperature → 4) intensity/contrast → 5) environment bounce → 6) colour grade LUT → 7) background handling → 8) guardrail negative. Tanpa semua blok ini, IC-Light/flux sering face-swap atau kulit plastik.

---

## §2 Task 1 — Katalog `domains/relight-catalogs.ts`

- [ ] Buat `domains/relight-catalogs.ts` mengikuti pola `portrait-catalogs.ts` / `wedding-catalogs.ts`:

```ts
import type { DomainOption } from './types';
const img = (cat: string, slug: string) => `images/relight/${cat}/${slug}.webp`;

export interface RelightModeOption extends DomainOption { promptPhrase: string; instruction: string; }
export const RELIGHT_MODES: RelightModeOption[] = [
  { value:'relight-only', label:'Relight only', image: img('mode','relight-only'), promptPhrase:'relight only', instruction:'Relight this photo' },
  { value:'grade-only',   label:'Colour grade only', image: img('mode','grade-only'),   promptPhrase:'colour grade only', instruction:'Color grade this photo' },
  { value:'both',         label:'Relight + Grade',   image: img('mode','both'),           promptPhrase:'relight and colour grade', instruction:'Relight and color grade this photo' },
];

export interface LightDirectionOption extends DomainOption { promptPhrase: string; }
export const LIGHT_DIRECTIONS: LightDirectionOption[] = [
  { value:'front',        label:'Front',        image: img('direction','front'),        promptPhrase:'soft frontal light, evenly illuminating the subject from the front' },
  { value:'left-45',      label:'Left 45°',     image: img('direction','left-45'),      promptPhrase:'soft light coming from the left at 45 degrees' },
  { value:'right-45',     label:'Right 45°',    image: img('direction','right-45'),     promptPhrase:'soft light coming from the right at 45 degrees' },
  { value:'side-90',      label:'Side 90°',     image: img('direction','side-90'),      promptPhrase:'dramatic side light at 90 degrees, strong falloff on the shadow side' },
  { value:'rim-back',     label:'Rim / Back',   image: img('direction','rim-back'),     promptPhrase:'rim light from behind, creating a glowing edge around the subject' },
  { value:'top-down',     label:'Top down',     image: img('direction','top-down'),     promptPhrase:'top-down light, casting soft shadows downward' },
  { value:'butterfly',    label:'Butterfly',    image: img('direction','butterfly'),    promptPhrase:'butterfly lighting from above-front, symmetrical shadow under the nose' },
  { value:'split',        label:'Split',        image: img('direction','split'),        promptPhrase:'split lighting, half the face lit, half in shadow' },
];

export interface LightQualityOption extends DomainOption { promptPhrase: string; }
export const LIGHT_QUALITIES: LightQualityOption[] = [
  // Studio & natural base
  { value:'soft-diffused', label:'Soft diffused', image: img('quality','soft-diffused'), promptPhrase:'soft, diffused light with gentle falloff and soft shadows' },
  { value:'hard-directional',label:'Hard directional',image: img('quality','hard-directional'),promptPhrase:'hard, directional light with crisp shadows and strong contrast' },
  { value:'volumetric',    label:'Volumetric / God rays', image: img('quality','volumetric'), promptPhrase:'volumetric light with visible god rays and airy haze' },
  { value:'window-bounced',label:'Window bounced',image: img('quality','window-bounced'),promptPhrase:'natural window light bounced softly, airy and organic' },
  { value:'neon-glow',     label:'Neon glow',    image: img('quality','neon-glow'),     promptPhrase:'glowing neon light with colorful bloom and reflections' },
  { value:'candle-flicker',label:'Candle',       image: img('quality','candle'),        promptPhrase:'warm candlelight with flickering, intimate falloff' },
  // Social-media aesthetic — populer di TikTok/IG 2024-2025
  { value:'ring-light',    label:'Ring light (beauty)', image: img('quality','ring-light'), promptPhrase:'ring light beauty lighting, even catchlight in the eyes, soft glam, influencer style' },
  { value:'beauty-dish',   label:'Beauty dish',  image: img('quality','beauty-dish'),  promptPhrase:'beauty dish lighting, soft but sculpted, fashion beauty with round catchlight' },
  { value:'fairy-bokeh',   label:'Fairy lights bokeh', image: img('quality','fairy-bokeh'), promptPhrase:'fairy lights bokeh, warm tiny points of light in the background, dreamy' },
  { value:'sunset-silhouette', label:'Sunset silhouette', image: img('quality','sunset-silhouette'), promptPhrase:'sunset silhouette lighting, warm backlight outlining the subject, rim glow' },
  { value:'overcast-soft', label:'Overcast soft (cloudy)', image: img('quality','overcast-soft'), promptPhrase:'soft overcast light on a cloudy day, even and flattering, no harsh shadows' },
  { value:'studio-strobe', label:'Studio strobe', image: img('quality','studio-strobe'), promptPhrase:'studio strobe lighting, crisp and punchy, clean commercial look' },
  { value:'led-strip',     label:'LED strip',    image: img('quality','led-strip'),    promptPhrase:'LED strip accent light, colorful linear glow on the wall behind' },
  { value:'sun-flare',     label:'Sun flare / Lens flare', image: img('quality','sun-flare'), promptPhrase:'warm sun flare with lens flare streaks, golden haze leaking into the frame' },
];

export interface LightColorOption extends DomainOption { promptPhrase: string; kelvin?: string; }
export const LIGHT_COLORS: LightColorOption[] = [
  { value:'neutral-5600', label:'Neutral 5600K', image: img('color','neutral-5600'), promptPhrase:'neutral daylight, 5600K, true color', kelvin:'5600K' },
  { value:'warm-golden',  label:'Warm golden hour', image: img('color','warm-golden'), promptPhrase:'warm golden hour light, 3200K, honey-orange highlights', kelvin:'3200K' },
  { value:'cool-blue',    label:'Cool blue hour', image: img('color','cool-blue'),   promptPhrase:'cool blue hour light, 7500K, soft cyan-blue tones', kelvin:'7500K' },
  { value:'tungsten-3200',label:'Tungsten 3200K', image: img('color','tungsten-3200'),promptPhrase:'warm tungsten light, 3200K, amber glow', kelvin:'3200K' },
  { value:'teal-gel',     label:'Teal gel',     image: img('color','teal-gel'),     promptPhrase:'teal color gel on the light, cool cyan accent' },
  { value:'magenta-gel',  label:'Magenta gel',  image: img('color','magenta-gel'),  promptPhrase:'magenta color gel on the light, pink-purple accent' },
  { value:'mixed-neon',   label:'Mixed neon (teal+magenta)', image: img('color','mixed-neon'), promptPhrase:'mixed neon gels — teal and magenta light mixing on the subject' },
  { value:'candlelight',  label:'Candlelight',  image: img('color','candlelight'),  promptPhrase:'candlelight color, warm 1800K, soft amber-orange' },
  // Aesthetic medsos extended
  { value:'sunrise-pink', label:'Sunrise pink', image: img('color','sunrise-pink'), promptPhrase:'soft sunrise pink light, pastel pink-orange glow, dreamy morning haze' },
  { value:'pastel-mint',  label:'Pastel mint',  image: img('color','pastel-mint'),  promptPhrase:'pastel mint light, soft green-cyan tint, fresh airy feel' },
  { value:'lavender-haze',label:'Lavender haze',image: img('color','lavender-haze'),promptPhrase:'lavender haze light, soft purple glow, ethereal' },
  { value:'amber-sunset', label:'Amber sunset', image: img('color','amber-sunset'), promptPhrase:'deep amber sunset light, rich orange-red warmth, long shadows' },
];

export interface IntensityOption extends DomainOption { promptPhrase: string; }
export const INTENSITIES: IntensityOption[] = [
  { value:'flat',        label:'Flat / Even', image: img('intensity','flat'), promptPhrase:'flat, even lighting with minimal shadows, low contrast' },
  { value:'natural',     label:'Natural',     image: img('intensity','natural'), promptPhrase:'natural lighting intensity with balanced, soft shadows' },
  { value:'dramatic',    label:'Dramatic',    image: img('intensity','dramatic'),promptPhrase:'dramatic lighting with pronounced shadows and highlight sculpting' },
  { value:'chiaroscuro', label:'Chiaroscuro / High contrast', image: img('intensity','chiaroscuro'), promptPhrase:'high-contrast chiaroscuro, deep shadows and bright highlights' },
  { value:'low-key',     label:'Low-key moody', image: img('intensity','low-key'), promptPhrase:'low-key moody lighting, mostly shadows with a single key light' },
];

export interface EnvironmentOption extends DomainOption { promptPhrase: string; }
export const ENVIRONMENTS: EnvironmentOption[] = [
  { value:'studio-seamless', label:'Studio seamless', image: img('environment','studio-seamless'), promptPhrase:'clean studio environment with controlled bounce' },
  { value:'window-natural',  label:'Window natural',  image: img('environment','window-natural'),  promptPhrase:'bright interior with large window, natural bounce and soft reflections' },
  { value:'overcast-outdoor',label:'Overcast outdoor',image: img('environment','overcast-outdoor'),promptPhrase:'soft overcast outdoor light, diffused sky bounce' },
  { value:'neon-city',     label:'Neon city night', image: img('environment','neon-city'), promptPhrase:'neon-lit city street at night, colorful reflections and glow' },
  { value:'forest-canopy', label:'Forest canopy', image: img('environment','forest-canopy'), promptPhrase:'forest canopy with dappled light filtering through leaves' },
  { value:'luxury-interior',label:'Luxury interior',image: img('environment','luxury-interior'),promptPhrase:'luxury interior with warm ambient bounce and soft specular highlights' },
  // Social aesthetic extended
  { value:'cafe-window',   label:'Cafe window',  image: img('environment','cafe-window'), promptPhrase:'cozy cafe window light, warm wood tones, latte aesthetic' },
  { value:'rooftop-sunset',label:'Rooftop sunset',image: img('environment','rooftop-sunset'),promptPhrase:'rooftop at sunset, open sky, warm gradient horizon, city silhouette' },
  { value:'beach-golden',  label:'Beach golden hour', image: img('environment','beach-golden'), promptPhrase:'beach at golden hour, sand reflecting warm light, open horizon' },
  { value:'bedroom-fairy', label:'Bedroom fairy lights', image: img('environment','bedroom-fairy'), promptPhrase:'bedroom with fairy lights, cozy bokeh, soft intimate glow' },
  { value:'street-night',  label:'Street night (wet)', image: img('environment','street-night'), promptPhrase:'wet street at night, reflections on pavement, moody urban glow' },
  { value:'minimal-white', label:'Minimal white', image: img('environment','minimal-white'), promptPhrase:'minimal all-white room, clean high-key bounce, airy scandinavian' },
];

// Curated social-media aesthetic presets — 1-klik look viral (opsional field, tetap visual)
export interface AestheticPresetOption extends DomainOption { promptPhrase: string; }
export const AESTHETIC_PRESETS: AestheticPresetOption[] = [
  { value:'none',          label:'No preset (custom)', image: img('aesthetic','none'),          promptPhrase:'' },
  { value:'clean-girl',    label:'Clean Girl',    image: img('aesthetic','clean-girl'),    promptPhrase:'clean girl aesthetic — soft natural light, neutral tones, minimal, fresh skin, airy' },
  { value:'golden-hour',   label:'Golden Hour Glow', image: img('aesthetic','golden-hour'), promptPhrase:'golden hour glow — warm honey light, soft rim, sun-kissed skin, dreamy haze' },
  { value:'blue-hour',     label:'Blue Hour Moody', image: img('aesthetic','blue-hour'),   promptPhrase:'blue hour moody — cool cyan-blue, cinematic shadows, twilight melancholy' },
  { value:'neon-tokyo',    label:'Neon Tokyo',    image: img('aesthetic','neon-tokyo'),    promptPhrase:'neon Tokyo — teal and magenta neon, wet reflections, cyber city vibe' },
  { value:'soft-girl',     label:'Soft Girl Pastel', image: img('aesthetic','soft-girl'), promptPhrase:'soft girl pastel — pink-lavender haze, fairy bokeh, dreamy soft focus' },
  { value:'dark-academia', label:'Dark Academia', image: img('aesthetic','dark-academia'), promptPhrase:'dark academia — warm tungsten, low-key, amber library glow, moody shadows' },
  { value:'coquette',      label:'Coquette',      image: img('aesthetic','coquette'),      promptPhrase:'coquette — warm candlelight, soft pink, lace bokeh, romantic' },
  { value:'streetwear',    label:'Streetwear Flash', image: img('aesthetic','streetwear'), promptPhrase:'streetwear flash — hard direct flash, high contrast, urban night, paparazzi look' },
  { value:'y2k',           label:'Y2K Haze',      image: img('aesthetic','y2k'),           promptPhrase:'Y2K haze — glossy, slightly overexposed, cool flash with pastel tint' },
  { value:'film-nostalgia',label:'Film Nostalgia',image: img('aesthetic','film-nostalgia'),promptPhrase:'film nostalgia — faded grain, warm vintage fade, soft halation, 90s film' },
  { value:'scandi-minimal',label:'Scandi Minimal',image: img('aesthetic','scandi-minimal'),promptPhrase:'scandi minimal — overcast soft, neutral white, clean airy, muted palette' },
];
export interface EnvironmentOption extends DomainOption { promptPhrase: string; }
export const ENVIRONMENTS: EnvironmentOption[] = [
  { value:'studio-seamless', label:'Studio seamless', image: img('environment','studio-seamless'), promptPhrase:'clean studio environment with controlled bounce' },
  { value:'window-natural',  label:'Window natural',  image: img('environment','window-natural'),  promptPhrase:'bright interior with large window, natural bounce and soft reflections' },
  { value:'overcast-outdoor',label:'Overcast outdoor',image: img('environment','overcast-outdoor'),promptPhrase:'soft overcast outdoor light, diffused sky bounce' },
  { value:'neon-city',     label:'Neon city night', image: img('environment','neon-city'), promptPhrase:'neon-lit city street at night, colorful reflections and glow' },
  { value:'forest-canopy', label:'Forest canopy', image: img('environment','forest-canopy'), promptPhrase:'forest canopy with dappled light filtering through leaves' },
  { value:'luxury-interior',label:'Luxury interior',image: img('environment','luxury-interior'),promptPhrase:'luxury interior with warm ambient bounce and soft specular highlights' },
];

export interface ColorGradeOption extends DomainOption { promptPhrase: string; }
export const COLOR_GRADES: ColorGradeOption[] = [
  { value:'none-natural', label:'Natural (no LUT)', image: img('grade','none-natural'), promptPhrase:'' },
  { value:'portra-400',   label:'Kodak Portra 400',  image: img('grade','portra-400'),  promptPhrase:'Kodak Portra 400 film emulation, warm highlights, muted teal shadows, subtle grain' },
  { value:'cinestill-800t',label:'Cinestill 800T',  image: img('grade','cinestill-800t'),promptPhrase:'Cinestill 800T film emulation, tungsten-balanced, halation glow, cool shadows' },
  { value:'eterna',       label:'Fujifilm Eterna', image: img('grade','eterna'),       promptPhrase:'Fujifilm Eterna film emulation, muted saturation, soft highlight rolloff' },
  { value:'teal-orange',  label:'Teal & Orange',   image: img('grade','teal-orange'),  promptPhrase:'teal and orange blockbuster grade, warm skin, teal shadows' },
  { value:'bleach-bypass',label:'Bleach bypass',   image: img('grade','bleach-bypass'),promptPhrase:'bleach bypass grade, high contrast, desaturated, gritty silver retention' },
  { value:'vintage-faded',label:'Vintage faded',   image: img('grade','vintage-faded'),promptPhrase:'vintage faded grade, lifted blacks, warm fade, slightly desaturated' },
  { value:'cyberpunk',    label:'Cyberpunk',       image: img('grade','cyberpunk'),    promptPhrase:'cyberpunk grade, neon magenta-cyan palette, crushed blacks, high saturation, subtle bloom' },
  { value:'wes-anderson', label:'Wes Anderson pastel', image: img('grade','wes-anderson'),promptPhrase:'Wes Anderson pastel palette, symmetrical pastels, warm beige and mint, playful' },
  { value:'noir',         label:'Noir',            image: img('grade','noir'),         promptPhrase:'noir grade, high-contrast black and white with a single subtle color accent, moody' },
];

export const GRADE_STRENGTHS: DomainOption[] = [
  { value:'subtle',  label:'Subtle'  },
  { value:'medium',  label:'Medium'  },
  { value:'strong',  label:'Strong'  },
  { value:'extreme', label:'Extreme' },
];
export const PRESERVATION_OPTIONS: DomainOption[] = [
  { value:'identity',  label:'Keep face identity' },
  { value:'skin',      label:'Keep skin texture' },
  { value:'clothing',  label:'Keep clothing' },
  { value:'pose',      label:'Keep pose' },
  { value:'background',label:'Keep background' },
];

export const BACKGROUND_MODES: DomainOption[] = [
  { value:'keep',    label:'Keep unchanged',        image: img('bg-mode','keep') },
  { value:'relight', label:'Relight consistently',  image: img('bg-mode','relight') },
  { value:'replace', label:'Replace with environment', image: img('bg-mode','replace') },
];

// Background people removal — toggle, bukan katalog visual (chips/toggle tetap visual di StudioFieldRenderer)
// Nilai boolean di state: removeBackgroundPeople: boolean

```

- [ ] `npx tsc --noEmit` 0. Verifikasi pola mengikuti `portrait-catalogs.ts` (interface `promptPhrase`, helper `img`).
- [ ] Placeholder thumbs tidak wajib — VisualSelector fallback ke initials bila file belum ada (cek `hasImage`).

---

## §3 Task 2 — Domain `domains/relight.ts`

- [ ] Buat `domains/relight.ts` mengikuti struktur `portrait.ts` (sections + buildPrompt + warnings), dengan keputusan:

```ts
export const relightDomain: DomainRecipe = {
  id: 'relight',
  label: 'Relight',
  icon: '💡',
  tagline: 'Relight & colour grade any photo — keep identity, change light.',
  referencePhoto: true,
  referenceLabel: 'Photo to relight',
  referenceClause: 'Use the uploaded photo as the exact source — keep the same person, clothing, and pose.',
  presetProtectedKeys: [],
  createEmptyState: () => ({
    mode: 'both',
    lightDirection: 'left-45',
    lightQuality: 'soft-diffused',
    lightColor: 'warm-golden',
    intensity: 'natural',
    environment: 'window-natural',
    colorGrade: 'portra-400',
    gradeStrength: 'medium',
    aestheticPreset: 'none',
    preservation: ['identity','skin','clothing','pose','background'],
    backgroundMode: 'relight',
    removeBackgroundPeople: false,
  }),
  sections: [
    { id:'mode', title:'01 · Mode', fields:[{ kind:'visual', key:'mode', label:'Relight mode', options: RELIGHT_MODES, previewRatio:'aspect-square' }] },
    { id:'aesthetic', title:'02 · Aesthetic Preset (1-klik viral)', fields:[{ kind:'visual', key:'aestheticPreset', label:'Aesthetic preset', options: AESTHETIC_PRESETS, previewRatio:'aspect-square' }] },
    { id:'light', title:'03 · Light Direction & Quality',
      fields:[
        { kind:'visual', key:'lightDirection', label:'Light direction', options: LIGHT_DIRECTIONS, previewRatio:'aspect-[4/3]' },
        { kind:'visual', key:'lightQuality',   label:'Light quality',   options: LIGHT_QUALITIES,  previewRatio:'aspect-[4/3]' },
        { kind:'visual', key:'lightColor',     label:'Light color',     options: LIGHT_COLORS,    previewRatio:'aspect-square' },
        { kind:'visual', key:'intensity',      label:'Intensity & contrast', options: INTENSITIES,  previewRatio:'aspect-[4/3]' },
      ]},
    { id:'environment', title:'04 · Environment', fields:[{ kind:'visual', key:'environment', label:'Environment bounce', options: ENVIRONMENTS, previewRatio:'aspect-video' }] },
    { id:'grade', title:'05 · Colour Grade',
      fields:[
        { kind:'visual', key:'colorGrade',    label:'Colour grade (LUT)', options: COLOR_GRADES, previewRatio:'aspect-square' },
        { kind:'visual', key:'gradeStrength', label:'Grade strength', options: GRADE_STRENGTHS, previewRatio:'aspect-square' },
      ]},
    { id:'preserve', title:'06 · Preservation & Background',
      fields:[
        { kind:'chips', key:'preservation', label:'Keep / preserve', options: PRESERVATION_OPTIONS },
        { kind:'visual', key:'backgroundMode', label:'Background handling', options: BACKGROUND_MODES, previewRatio:'aspect-video' },
        { kind:'toggle', key:'removeBackgroundPeople', label:'Remove people from background', hint: 'Erase other people / crowd behind the subject — clean empty background' },
      ]},
  ],
  buildPrompt: (s) => { /* 10 blok berurutan, lihat di bawah */ },
  warnings: (s) => { /* 5 smart rules */ },
}
```
**`buildPrompt` — 10 blok (pola IC-Light + FLUX Kontext + aesthetic):**

0. **Aesthetic preset** — bila `aestheticPreset !== 'none'`: `"Aesthetic: {preset.promptPhrase}."` Blok ini di-insert SETELAH instruction (blok 1) dan SEBELUM lighting, agar preset viral menjadi konteks utama.
1. **Instruction + preservasi:** `"{Relight|Color grade|Relight and color grade} this photo — keep {preservation list} exactly the same."` Jika `preservation` kosong, fallback ke `keep facial identity and pose exactly the same`.
2. **Light direction & quality** — *hanya* bila mode `relight-only` atau `both`: `"Lighting: {lightDirection.promptPhrase}, {lightQuality.promptPhrase}."`
3. **Light color:** sama conditional, `"Light color: {lightColor.promptPhrase}."`
4. **Intensity:** `"Intensity: {intensity.promptPhrase}."`
5. **Environment:** `"Environment bounce: {environment.promptPhrase}."`
6. **Colour grade:** *hanya* bila mode `grade-only` atau `both` dan `colorGrade !== 'none-natural'`: `"Colour grade: {colorGrade.promptPhrase}, strength {gradeStrength}."` Jika `none-natural` → skip blok grade.
7. **Background handling:** `keep → "Keep the background exactly unchanged."`, `relight → "Relight the background consistently with the new lighting."`, `replace → "Replace the background with the {environment} environment."`
8. **Background people removal (NEW — toggle):** bila `removeBackgroundPeople === true` → `"Remove all other people from the background — clean, empty background behind the subject, no crowd, no bystanders, inpaint the area naturally to match the environment."` Jika false → skip blok. Blok ini di-insert SETELAH background handling dan SEBELUM guardrail agar konteks inpaint jelas.
9. **Guardrail (selalu):** `"Photorealistic, sharp focus, natural skin texture, no plastic skin, no face swap, no extra person, no text, no watermark, single consistent light source."` — bila `removeBackgroundPeople` true, guardrail menyesuaikan menjadi `no extra person (background already cleaned)` agar tidak konflik instruksi.

Semua lookup via `find` dengan fallback ke entry pertama (pola `portrait.ts`).

**`warnings` — 5 smart rules:**

- `gradeStrength === 'extreme' && colorGrade !== 'none-natural'` → `warn` di `grade`: "Extreme grade can cause color bleed on skin — medium is more natural."
- `intensity === 'chiaroscuro' && preservation.includes('skin') === false` → `warn` di `light`: "High contrast without 'Keep skin texture' can make skin waxy."
- `mode === 'grade-only' && backgroundMode === 'replace'` → `warn` di `preserve`: "Grade-only with background replace is unusual — use Relight + Grade to change environment."
- `preservation.length === 0` → `warn` di `preserve`: "No preservation — the AI may change the face. Keep at least identity + pose."
- `removeBackgroundPeople === true && backgroundMode === 'keep'` → `info` di `preserve`: "You asked to remove people but keep background unchanged — the AI will clean only the people and inpaint the same background."

- [ ] `npx tsc --noEmit` 0. Test 3 contoh prompt dari riset §5 (relight-only, grade-only, both) harus byte-identik dengan ekspektasi.

---

## §4 Task 3 — Registrasi & Verifikasi

- [ ] Edit `domains/index.ts`: import `relightDomain` dan tambahkan ke `DOMAINS` (urutan setelah `logoDomain` atau sebelum, konsisten — taruh setelah `foodDomain` agar tidak menggeser index cinematic yang sering jadi default; atau akhir array — pilih salah satu dan konsisten).
- [ ] `npx tsc --noEmit` 0 + `npm run build` hijau.
- [ ] Smoke visual: `npm run dev` → StartScreen menampilkan `💡 Relight` → klik → 5 sections render, semua field visual (grid thumbs), chips preservation default ter-check semua, prompt preview ter-generate sesuai mode; ganti mode `grade-only` → field light tetap tampil tapi bisa di-hide conditional bila diinginkan (opsional: `visibleWhen` pada section light/environment bila `mode === 'grade-only'` — implementasikan bila mudah, jika tidak biarkan tampil tapi `buildPrompt` yang skip).
- [ ] Reference photo wajib: upload foto → prompt mengandung `referenceClause` → copy → paste ke FLUX Kontext harus relight tanpa face swap (manual check dengan 1 foto).
- [ ] Commit `feat(recipes): relight & colour grade visual prompt builder`.

---

## §5 Anti-Patterns

- Jangan pakai `textarea` — semua field harus `visual`/`chips` sesuai brief "semua menggunakan visual prompt builder".
- Jangan ubah `DomainField` types, `buildPromptFromState`, atau `referenceComposite` — hanya tambah domain baru.
- Jangan simpan LUT binary — katalog hanya menyimpan `promptPhrase` untuk LUT, bukan file .cube.
- Teks UI English, prompt English; komentar kode boleh Indonesia mengikuti gaya `portrait.ts`.
- Setiap commit: `tsc 0` + `build` hijau. Thumbs `images/relight/*` boleh placeholder/404 dulu — jangan block build karena missing image (VisualSelector sudah fallback).

---

## §6 Nice-to-have v2 (tidak di scope plan ini)

- Reference kedua untuk style transfer warna (field `styleReference` upload).
- Slider strength numeric (bukan chips) bila StudioFieldRenderer mendukung.
- HDRI upload custom.

