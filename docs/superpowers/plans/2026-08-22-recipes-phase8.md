# Aichemy Recipes Phase 8 - Logo Maker domain

> **For agentic workers:** Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Tambah domain builtin ke-9 `logo` (Logo Maker) — catalogs + DomainRecipe + registrasi. Riset: `design/research-logo.md` (sudah committed bersama plan ini). Semua field visual per standar phase 7; nol aset shared (logo tak overlap dengan aset foto cinematic) — semua image key baru di `images/logo/<category>/`, tile inisial sampai user generate.

**Repo:** `/Users/tobin/Documents/Aichemy/renderzero-web`, branch `recipes-phase8`. Base: `main` @ `4b9b912`.

**Files:** BARU `domains/logo-catalogs.ts`, `domains/logo.ts`. EDIT: `domains/index.ts` (import + push ke DOMAINS setelah foodDomain). Tidak ada perubahan App.tsx/types.ts/renderer/storage (semua generik; `defaultExpandedForDomain` auto-terbuka untuk non-cinematic).

**Konvensi wajib (mirror file sibling):**
- `logo-catalogs.ts`: helper `img(kategori, slug)` → \`images/logo/\${kategori}/\${slug}.webp\` (persis pola food-catalogs.ts); tiap opsi punya `image` kecuali `auto`.
- `hex` pada opsi palette: mirror pola persis dari marketing-catalogs.ts color presets (interface extends DomainOption { hex }) — checklist script membaca `option.hex`.
- `logo.ts`: header komentar riset (pola food.ts), `str()` coercion, find-fallback `?? CATALOG[0]`, komentar `[Riset §…]` per blok buildPrompt/warning.
- Section ids: `type`, `brand`, `style`, `shape`, `color`, `lettering`, `motif`, `designer`.

---

## §1 Katalog (verbatim)

### LOGO_TYPES (7) — `img('types', value)`
| value | label | promptPhrase |
|---|---|---|
| `wordmark` | `Wordmark` | `a wordmark logo built entirely from custom lettering of the brand name, no icon` |
| `lettermark` | `Lettermark` | `a lettermark monogram logo built from the brand initials, interlocking letterforms` |
| `pictorial` | `Pictorial mark` | `a pictorial mark logo with a single, instantly recognizable icon, no text` |
| `abstract` | `Abstract mark` | `an abstract mark logo built from interlocking geometric shapes forming a distinctive symbol` |
| `emblem` | `Emblem / badge` | `an emblem badge logo with the brand name and icon integrated inside a contained crest shape` |
| `mascot` | `Mascot` | `a mascot logo with a friendly character illustration representing the brand` |
| `combination` | `Combination mark` | `a combination mark logo with the icon on the left and the wordmark beside it, balanced lockup` |

### LOGO_INDUSTRIES (10) — `img('industries', value)`
`tech-saas` Tech / SaaS `for a technology startup` · `food-beverage` Food & beverage `for a food and beverage brand` · `fashion-beauty` Fashion & beauty `for a fashion and beauty label` · `finance-legal` Finance & legal `for a finance or legal firm` · `health-wellness` Health & wellness `for a health and wellness brand` · `sports-fitness` Sports & fitness `for a sports and fitness team` · `creative-studio` Creative studio `for a creative studio` · `realestate-construction` Real estate & construction `for a real estate or construction company` · `education` Education `for an education institution` · `eco-nature` Eco & nature `for an eco-friendly nature brand`

### LOGO_STYLES (10) — `img('styles', value)`
| value | label | promptPhrase |
|---|---|---|
| `minimalist` | `Minimalist` | `minimalist, maximum simplicity, generous negative space` |
| `geometric` | `Geometric` | `geometric, constructed from precise circles, squares and triangles` |
| `monoline` | `Monoline` | `monoline, single-weight continuous line work, even stroke` |
| `vintage-badge` | `Vintage badge` | `vintage badge style, retro americana, hand-drawn ornament details` |
| `hand-drawn` | `Hand-drawn` | `hand-drawn, organic imperfect strokes, human warmth` |
| `gradient-modern` | `Modern gradient` | `modern gradient mark, smooth vibrant color transitions` |
| `negative-space` | `Negative space` | `clever negative space, dual-read imagery hidden in the counterforms` |
| `bold-flat` | `Bold & flat` | `bold flat geometric shapes, high-impact, brutalist confidence` |
| `luxury` | `Luxury` | `luxury monoline, thin elegant strokes, high-end boutique feel` |
| `playful` | `Playful` | `playful, rounded friendly forms, approachable energy` |

### LOGO_SHAPES (6) — `img('shapes', value)`
`circular-badge` Circular badge `composed inside a circular badge` · `shield` Shield / crest `composed inside a shield crest` · `square-tile` Square tile `composed as a square app-icon tile` · `horizontal-lockup` Horizontal lockup `arranged as a horizontal lockup` · `stacked` Stacked `stacked composition with the icon above the wordmark` · `freeform` Freeform `freeform composition, no enclosing shape`

### LOGO_PALETTES (8) — `img('palettes', value)` + hex (pola marketing)
| value | label | hex | promptPhrase |
|---|---|---|---|
| `monochrome-black` | `Monochrome black` | `#1A1A1A` | `strictly #1A1A1A black` |
| `navy-gold` | `Navy & gold` | `#1F2A44` | `a palette of #1F2A44 navy with #C9A227 gold accents` |
| `forest-green` | `Forest green` | `#1F4D2E` | `a palette of #1F4D2E forest green with cream accents` |
| `earth-tones` | `Earth tones` | `#6B4F2E` | `warm earth tones of #6B4F2E and #D9C7A7` |
| `pastel` | `Pastel` | `#F4B6C2` | `a soft pastel palette, muted and gentle` |
| `vibrant-bold` | `Vibrant bold` | `#E63946` | `a vibrant bold palette of #E63946 and #1D3557` |
| `sunset-gradient` | `Sunset gradient` | `#FF7E5F` | `a warm sunset gradient from #FF7E5F to #FEB47B` |
| `electric-neon` | `Electric neon` | `#00F5D4` | `electric neon #00F5D4 accents` |

### LOGO_BACKGROUNDS (3) — `img('backgrounds', value)`
`white` Clean white `on a clean white background` · `flat-neutral` Flat neutral `on a flat light neutral background` · `charcoal` Dark charcoal `on a dark charcoal #111111 background`

### LOGO_TYPESTYLES (6) — `img('typestyles', value)`
`modern-sans` Modern sans-serif `clean geometric sans-serif lettering` · `serif-classic` Classic serif `classic serif lettering, heritage and trustworthy` · `script` Script / hand-lettered `flowing hand-lettered script, personal and inviting` · `bold-display` Bold display `bold condensed display lettering, high impact` · `monospace` Monospace / tech `monospace technical lettering` · `vintage-slab` Vintage slab serif `vintage slab-serif lettering, americana badge style`

### LOGO_TECHNIQUES (6 chips, max 3) — tanpa image (chips)
`flat-vector` Flat vector `flat 2D vector style, crisp edges` · `golden-ratio` Golden-ratio grid `constructed on a golden-ratio grid` · `symmetry` Perfect symmetry `perfect symmetry` · `single-stroke` Single-weight stroke `single-weight stroke throughout` · `enclosed-line` Enclosed line `drawn with one enclosed continuous line` · `letter-integration` Letter integration `the icon is integrated into the letterforms`

### LOGO_DESIGNERS (auto + 7) — `img('designers', value)` kecuali auto
| value | label | promptPhrase |
|---|---|---|
| `auto` | `No specific style` | `''` (tanpa image) |
| `paul-rand` | `Paul Rand` | `in the style of Paul Rand: playful modernist simplicity, bold flat shapes, wit` |
| `saul-bass` | `Saul Bass` | `in the style of Saul Bass: jagged expressive cut-paper shapes, hand-cut energy` |
| `massimo-vignelli` | `Massimo Vignelli` | `in the style of Massimo Vignelli: rigorous grid discipline, timeless restraint` |
| `chermayeff-geismar` | `Chermayeff & Geismar` | `in the style of Chermayeff & Geismar: clean geometric abstraction, instant recognition` |
| `pentagram` | `Pentagram` | `in the style of Pentagram: contemporary systematic identity design, confident simplicity` |
| `paula-scher` | `Paula Scher` | `in the style of Paula Scher: bold expressive typography-driven identity` |
| `milton-glaser` | `Milton Glaser` | `in the style of Milton Glaser: illustrative warmth, psychedelic line work` |

---

## §2 DomainRecipe (verbatim)

```ts
id: 'logo', label: 'Logo', icon: '✒️',
tagline: 'Wordmarks, emblems, and mascots — flat vector, production-minded prompts.',
referencePhoto: true,
referenceLabel: 'Sketch / reference',
referenceClause: 'Use the attached sketch as the structural basis — keep its layout and proportions, redraw it as a clean vector logo.',
presetProtectedKeys: ['brandBrief', 'iconMotif'],
createEmptyState: () => ({
  logoType: 'pictorial', brandBrief: '', industry: 'tech-saas',
  style: 'minimalist', shape: 'freeform',
  palette: 'monochrome-black', logoBackground: 'white',
  typography: 'modern-sans', iconMotif: '', techniques: ['flat-vector'],
  designer: 'auto',
}),
```

**Sections** (semua field `kind: 'visual'`, `previewRatio: 'aspect-square'`, kecuali disebutkan):
- `type` '01 · Logo Type' → logoType
- `brand` '02 · Brand' → brandBrief (kind `textarea`, placeholder `Brand name and what it does…`, rows 2), industry
- `style` '03 · Style' → style
- `shape` '04 · Shape & Lockup' → shape
- `color` '05 · Color' → palette, logoBackground
- `lettering` '06 · Lettering' → typography, `visibleWhen: (s) => ['wordmark','lettermark','combination'].includes(str(s.logoType))`
- `motif` '07 · Icon & Technique' → iconMotif (kind `textarea`, placeholder `What should the icon depict?…`, rows 2), techniques (kind `chips`, max 3)
- `designer` '08 · Designer Style' → designer

**buildPrompt** (blocks join `'\n\n'`; lookups `find(o => o.value === str(state.x)) ?? CATALOG[0]`):
1. `[Riset §1 blok 1]` `${cap(type.promptPhrase)}, ${industry.promptPhrase}${brandBrief ? \` — ${brandBrief}\` : ''}.${motif ? \` The icon depicts ${motif}.\` : ''}` (`cap` = charAt(0).toUpperCase()+slice(1), pola portrait)
2. `[Riset §1 blok 4]` `Style: ${style.promptPhrase}.`
3. `Composition: ${shape.promptPhrase}.`
4. `Colors: ${palette.promptPhrase}, ${background.promptPhrase}.`
5. Typography hanya bila visibleWhen true: `Lettering: ${typography.promptPhrase}.`
6. Chips techniques (bila > 0): `${selected.map(t => t.promptPhrase).join(', ')}.` (kapitalisasi huruf pertama)
7. Designer bila !== 'auto': `${cap(designer.promptPhrase)}.`
8. Guardrail konstan: `Presented flat, no mockup, no stationery scene, no 3D bevel, no drop shadow, no gloss, no photorealistic rendering, no watermark, no extra text beyond the brand name.`

Default prompt hasil (probe harus assert EXACT):
> `A pictorial mark logo with a single, instantly recognizable icon, no text, for a technology startup.\n\nStyle: minimalist, maximum simplicity, generous negative space.\n\nComposition: freeform composition, no enclosing shape.\n\nColors: strictly #1A1A1A black, on a clean white background.\n\nFlat 2D vector style, crisp edges.\n\nPresented flat, no mockup, no stationery scene, no 3D bevel, no drop shadow, no gloss, no photorealistic rendering, no watermark, no extra text beyond the brand name.`

**warnings:**
1. `[Riset §3 jebakan #1]` logoType ∈ {wordmark, lettermark, emblem, combination} → info `type`: `AI image apps often misspell text — keep the brand name short, or generate the mark only and add type in a vector tool.`
2. `[Riset §3 #7]` mascot + minimalist → warn `style`: `Mascot and minimalist fight — a mascot is inherently detailed; pick one direction.`
3. `[Riset §3 #5]` gradient-modern + techniques ∩ {flat-vector, single-stroke} → warn `motif`: `Gradients fight flat / single-stroke construction — drop one.`
4. `[Riset §3 #6]` logoBackground charcoal + palette monochrome-black → warn `color`: `Black-on-charcoal is invisible — pick a lighter palette.`
5. `[Riset §3 #7]` techniques.length > 2 → warn `motif`: `A logo is one strong idea — keep at most two construction techniques.`
6. `[Riset §4]` emblem + horizontal-lockup → info `shape`: `Emblems are contained shapes — a horizontal lockup fights the badge; prefer stacked or circular.`

**Registry:** `domains/index.ts` — `import { logoDomain } from './logo';` + tambahkan setelah `foodDomain` di array DOMAINS.

## §3 Task 1 — catalogs + domain + registry

- [ ] Tulis `domains/logo-catalogs.ts` (§1 verbatim, img helper, interface per katalog extends DomainOption, hex pola marketing).
- [ ] Tulis `domains/logo.ts` (§2 verbatim, header komentar riset).
- [ ] Edit `domains/index.ts` (import + array).
- [ ] `npx tsc --noEmit` 0 + `npm run build` hijau; probe buildPrompt default EXACT (§2) + semua 6 warning fire pada state pemicunya; commit `feat(recipes): logo maker domain — catalogs, builder, registry`.

## §4 Task 2 — checklist regen + e2e

- [x] `node scripts/generate-asset-checklist.mjs` → 8 kategori logo baru (57 aset, semua missing → initials tiles); commit checklist.
- [x] e2e browser: kartu Logo muncul di start screen + switcher; semua 8 section render; tiap picker adalah tile grid (0 `<select>`); typography picker hanya tampil untuk wordmark/lettermark/combination (cek hilang saat pictorial); default prompt EXACT §2; isi brandBrief+iconMotif → masuk blok 1; pilih wordmark → warning ejaan + Lettering section muncul; mascot+minimalist → warning; charcoal+monochrome-black → warning; upload sketsa → reference clause; save preset (brandBrief TIDAK ikut preset — presetProtectedKeys) → reload → ada; export/import round-trip; preset lama domain lain tak terpengaruh; build+tsc hijau; commit `feat(recipes): logo maker live, e2e verified`.

> **Amendemen (Task 2, disetujui plan owner):** klausa referensi logo digate pada upload aktual — arsitektur lama tidak punya plumbing dari `ReferencePhotoField` ke domain state (sibling menyertakan klausa di default via `hasReferencePhoto: true`, bertabrakan dengan default EXACT §2). Fix d779adc: `App.tsx` onChange ikut `domain.updateField('hasReferencePhoto', url !== null)`; `logo.ts` prepend `REFERENCE_CLAUSE` hanya bila `state.hasReferencePhoto === true`. Default prompt 8 domain lama byte-identical vs 4b9b912 (esbuild probe).

## §5 Anti-Patterns

- Jangan tambah `kind` baru / ubah types.ts. Jangan sentuh domain lain, App.tsx, StudioBuilder, custom/.
- Techniques TETAP chips (bukan visual). brandBrief/iconMotif TETAP textarea.
- Semua promptPhrase persis §1; jangan terjemahkan; apostrof persis.
- `visibleWhen` typography pakai `str()` coercion; section lettering tetap render (field tersembunyi — pola hijabColor id-photo).
