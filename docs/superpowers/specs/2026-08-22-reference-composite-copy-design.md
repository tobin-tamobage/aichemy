# Design: Reference Photo Composite + Rich Clipboard Copy (Phase 9)

**Tanggal:** 2026-08-22 · **Status:** approved (user: "gas")

## Masalah

App adalah prompt builder tanpa image generation; beberapa domain butuh foto referensi. Saat ini COPY menulis `image/*` + `text/plain` dalam satu ClipboardItem (phase 1), tapi: (a) tidak ada representasi `text/html` — kanal yang diparse beberapa app target; (b) tidak ada fallback yang *terlihat* saat app target hanya mengambil satu format; (c) hanya satu foto referensi yang bisa dibawa — clipboard web memang dibatasi 1 gambar per item, jadi multi-referensi butuh komposit.

**Target:** pemula, app tujuan utama ChatGPT + Gemini (keduanya bisa menerima gambar+teks dalam satu paste bila clipboard menawarkannya).

## Keputusan Desain

1. **Copy diperkaya, satu ClipboardItem, tiga representasi:** `image/*` (foto/komposit), `text/plain` (prompt), `text/html` (`<img>` + paragraf prompt). Aplikasi penerima memilih representasi yang ia pahami — kita memaksimalkan tawaran.
2. **Komposit saat upload, bukan saat copy.** State tetap SATU dataUrl → nol perubahan format project v3, nol migrasi, nol perubahan domain/klausa referensi ("the attached photo" tetap benar karena hasilnya memang satu gambar). ReferencePhotoField menerima tambahan foto (maks 3 sumber) dan me-regenerate komposit setiap tambahan.
3. **Layout komposit:** 1 → apa adanya (tidak di-encode ulang); 2 → berdampingan; 3 → grid 2 atas + 1 bawah (centered). Tinggi cell 1024px, gap 16px, latar putih, lebar total ≤ 2048px (scale down proporsional). Output JPEG q=0.92 (foto dominan; ukuran ramah batas 2MB project).
4. **Fallback terlihat:** tombol utama `COPY` → `COPY PROMPT + FOTO` saat referensi ada; tombol ghost kecil `Text only` / `Photo only` muncul di sebelahnya. Hint pasca-copy memberi tahu apa yang harus terjadi + ke mana harus lari bila gagal. Browser yang melempar error multi-format (Safari/Firefox) → session flag, langsung text-only, hint berganti mengarah ke tombol kecil.
5. **Scope:** foto referensi domain saja. Elemen cinematic (karakter/scene) TIDAK ikut — prompt cinematic tidak pernah mereferensikan gambar-gambar itu.

## Komponen

| File | Perubahan |
|---|---|
| `utils/referenceComposite.ts` (BARU) | `dataURLToBlob` (pindah dari App.tsx — satu-satunya konsumen), `composeReferenceImages(dataUrls: string[]): Promise<string>` |
| `components/ReferencePhotoField.tsx` | Multi-add (maks 3), internal `sourceCount` (reset saat value null), loading "Combining photos…", hint copy, error ramah saat > 3 |
| `App.tsx` | `handleCopyPrompt` menulis 3 representasi; label dinamis; 2 tombol ghost; session flag unsupported; hint diperkaya; `dataURLToBlob` dihapus (impor dari utils) |

## Error handling

- File non-image / > 2MB → pesan ramah (perilaku existing, dipertahankan).
- Compose gagal (gambar korup) → fallback: pakai foto terakhir saja + console.error; tidak pernah melempar ke UI.
- `clipboard.write` throw → text-only + hint fallback (existing path, diperkaya teks).
- `Photo only` gagal (browser tanpa image clipboard) → alert ramah.

## Testing (e2e browser)

Upload 2 foto → preview satu komposit (dimensi dicek); copy → clipboard punya 3 format; prompt tetap byte-stabil; remove → klausa referensi hilang (phase 8 wiring); export/import project dengan komposit; fallback path (mock throw); 3 foto → grid 2+1; ke-4 ditolak ramah.

## Non-goals

Multi-image clipboard (mustahil di web), integrasi cinematic elements, slot referensi berlabel per-domain, perubahan format project, generate aset checklist.
