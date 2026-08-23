# Aichemy Recipes Phase 9 - Reference Composite + Rich Clipboard Copy

> **For agentic workers:** Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** (1) COPY menulis prompt + foto referensi dalam satu paste dengan kompatibilitas maksimal untuk ChatGPT/Gemini (3 representasi clipboard), dengan fallback yang terlihat untuk pemula. (2) ReferencePhotoField menerima hingga 3 foto yang otomatis digabung jadi satu gambar komposit saat upload.

**Spec (authoritative untuk keputusan):** `docs/superpowers/specs/2026-08-22-reference-composite-copy-design.md`. Baca dulu.

**Repo:** `/Users/tobin/Documents/Aichemy/renderzero-web`, branch `recipes-phase9`. Base: `main` @ `e38c505`.

**Files:** BARU `utils/referenceComposite.ts`. EDIT `components/ReferencePhotoField.tsx`, `App.tsx`. **Tidak ada perubahan lain** (domains/, types, project format, storage semua tidak disentuh).

---

## §1 Task 1 — implementasi

### 1a. NEW `utils/referenceComposite.ts`

```ts
/** Pindahan dari App.tsx — satu-satunya konsumen lama; App kini impor dari sini. */
export function dataURLToBlob(dataUrl: string): Blob { /* persis implementasi App.tsx L292-301 */ }

const loadImage = (dataUrl: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load image for compositing'));
    img.src = dataUrl;
  });

/**
 * Gabungkan 1-3 foto referensi jadi SATU dataUrl.
 * 1 input → dikembalikan apa adanya (tanpa re-encode). 2 → side-by-side.
 * 3 → grid 2 atas + 1 bawah (bawah centered). Cell height 1024, gap 16,
 * latar putih, lebar total <= 2048 (scale proporsional). Output JPEG q=0.92.
 * Melempar Error bila ada gambar yang gagal dimuat.
 */
export async function composeReferenceImages(dataUrls: string[]): Promise<string> { /* impl */ }
```

Implementasi komposit: load semua → hitung cell per gambar (h=1024, w=natural aspect scaled) → layout per aturan → canvas → scale bila totalWidth > 2048 → fill putih → draw dengan gap → `canvas.toDataURL('image/jpeg', 0.92)`.

### 1b. `components/ReferencePhotoField.tsx` — multi-add

- Props TIDAK berubah (`value: string | null`, `onChange`, `label`, `hint`). State baru internal: `sourceCount` (number), `isComposing` (boolean).
- `handleFile`: bila `value` ada dan `sourceCount < 3` → `setIsComposing(true)`, `composeReferenceImages([value, newDataUrl])` → `onChange(composite)`, `setSourceCount(c => c + 1)`; `sourceCount >= 3` → `setError('Maximum 3 reference photos — remove to start over.')`. Bila `value` null → perilaku lama + `setSourceCount(1)`. Compose gagal → fallback: `onChange(newDataUrl)` (foto terbaru saja) + console.error. Selama `isComposing`: drop zone disabled + teks "Combining photos…".
- `value` jadi null (remove ATAU restore project) → `setSourceCount(0)`. Restore dengan komposit (import) → count tak diketahui → diperlakukan 1 sumber (tambah lagi masih bisa, komposit menimpa — diterima, spec).
- Sinkron `sourceCount` dari `value` via `useEffect` (value null → 0). Jangan reset saat value berubah non-null (compose sedang mengaturnya).
- UI: di bawah preview ada tombol kecil "Add another photo" (terlihat bila value ada & sourceCount < 3 & !isComposing). Hint default diperkaya: bila tidak ada hint prop → `Drop or paste up to 3 photos — they are combined into one image.` Gaya mengikuti token Aichemy existing (border-dashed zone, tombol ghost kecil).

### 1c. `App.tsx` — copy diperkaya + fallback terlihat

- Hapus `dataURLToBlob` lokal; `import { dataURLToBlob } from './utils/referenceComposite';` (cek path alias relatif konsisten dengan impor lain).
- `handleCopyPrompt` (L852-886) jadi:
  - `supportsImageClipboard` seperti sekarang.
  - Representasi: `{ [blob.type || 'image/png']: blob, 'text/plain': new Blob([prompt], {type:'text/plain'}), 'text/html': new Blob([html], {type:'text/html'}) }` dengan `html = \`<img src="${referenceDataUrl}" alt="reference"><p>${escapeHtml(prompt)}</p>\``; tambah helper lokal `escapeHtml` (ganti `&<>"'`).
  - Pada throw: set `clipboardImageUnsupported.current = true` (useRef baru) + jatuh ke text-only (path existing). Bila flag sudah true, lewati percobaan multi.
  - Tombol utama: label `COPY PROMPT + FOTO` bila `referenceDataUrl` ada, selain itu `COPY` (feedback COPIED tetap).
  - Dua tombol ghost kecil di sebelah tombol COPY (hanya render bila `referenceDataUrl`): `Text only` → `navigator.clipboard.writeText(prompt)` + feedback; `Photo only` → `clipboard.write([new ClipboardItem({[type]: blob})])`, throw → `window.alert('Your browser cannot copy images — drag the preview instead.')`. Styling mengikuti tombol header existing (ghost, text-[10px], uppercase, token Aichemy).
  - Hint pasca-copy (`showCopyHint` existing): teks baru — unsupported: `Your browser copied the text only — use the small buttons for the photo.`; supported: `Paste into ChatGPT/Gemini — photo and prompt arrive together. If only one appears, use the small buttons.`

### 1d. Verifikasi Task 1
- [ ] `npx tsc --noEmit` 0 + `npm run build` hijau.
- [ ] Smoke dev-server cepat: komposit 2 foto menghasilkan dataUrl JPEG dengan dimensi benar (cek via browser console probe, screenshot opsional).
- [ ] Commit `feat(recipes): reference photo composite + rich clipboard copy`.

## §2 Task 2 — e2e browser penuh

- [ ] Upload 1 foto (ID Photo) → prompt mengandung klausa referensi (wiring phase 8) → COPY PROMPT + FOTO → assert clipboard: 3 format ada, text/plain === prompt persis. Tambah foto ke-2 → preview komposit (assert naturalWidth ≈ gabungan, height 1024, rasio). Tambah ke-3 → grid 2+1. Ke-4 → pesan ramah, tidak berubah.
- [ ] Tombol `Text only` → clipboard text saja; `Photo only` → image saja. Label tombol utama berganti COPY ↔ COPY PROMPT + FOTO sesuai ada/tidaknya foto.
- [ ] Fallback: monkey-patch `navigator.clipboard.write` agar throw sekali → copy jatuh ke text-only + hint unsupported muncul + flag mencegah percobaan ulang.
- [ ] Remove foto → klausa referensi hilang dari prompt (phase 8 behavior utuh).
- [ ] Export project dengan komposit → import → preview + prompt pulih.
- [ ] Regresi: default prompt 9 domain byte-identik vs base (esbuild probe); cinematic tanpa referensi → COPY biasa tanpa tombol kecil.
- [ ] tsc 0 + build hijau; commit `feat(recipes): composite copy live, e2e verified`.

## §3 Anti-Patterns

- Jangan ubah: domains/, types.ts, project format v3, browserStorage, StudioBuilder, App di luar handleCopyPrompt + area tombol prompt + impor.
- Jangan re-encode single photo (rule 1 input → apa adanya).
- Jangan simpan array foto di mana pun — state tetap satu dataUrl (spec keputusan #2).
- Teks UI bahasa Inggris (konvensi app); komentar kode boleh Indonesia mengikuti gaya file.
- Setiap commit: tsc 0 + build hijau.
