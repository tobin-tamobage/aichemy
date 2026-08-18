# Aichemy Rebrand — Design Spec

**Date:** 2026-08-18
**Status:** Approved by user (mockup `design/desain-final.html`)
**Project:** `renderzero-web` → rebrand to **Aichemy** (frontend-only web prompt builder)

## 1. Goals

- Rebrand "RenderZero Studio" web app menjadi **Aichemy**.
- Ganti tema gelap-kuning menjadi **aesthetic cerah pastel (light) sebagai default**, dengan **dark mode toggle**.
- Murni reskin + rebrand: **layout, struktur 5 seksi prompt, logika promptBuilder, preset, storage browser tidak berubah**.

## 2. Brand Identity

- **Nama:** Aichemy
- **Wordmark:** `Ai` (text utama) + *chemy* (aksen pink) — seperti mockup B.
- **Tagline:** *"Brew your perfect prompt"* (menggantikan `> From Nothing`).
- **Font UI:** Nunito (400/600/700/800/900) menggantikan Inter/Orbitron. Inter boleh tetap untuk teks panjang jika keterbacaan Nunito kurang di body kecil — keputusan default: Nunito di semua UI.
- Semua string "RenderZero" / "RenderZero Studio" / "RenderZero Web" di UI, `index.html` title, dan komentar user-facing diganti "Aichemy". Nama package internal boleh tetap.

## 3. Design Tokens

Semua warna lewat CSS custom properties di satu file (mis. `theme.css` / bagian token di `project-styles.css`), dipetakan ke utility class Tailwind via `tailwind.config.cjs` (`colors: { surface: 'var(--surface)', ... }`) atau kelas semantik kustom. Dua tema: `:root` (light) dan `html.dark` (dark).

| Token | Light (default) | Dark ("Midnight Potion") | Pemakaian |
|---|---|---|---|
| `--bg` | `#fdf6ee` | `#221c2e` | Latar app |
| `--surface` | `#ffffff` | `#2c2440` | Kartu, accordion, modal |
| `--surface-2` | `#faf5ff` | `#241e33` | Input, area prompt |
| `--border` | `#f0e4ff` | `#453a5e` | Border kartu & input |
| `--accent` | `#ff6b9d` | `#ff6b9d` | Tombol utama, "chemy", highlight aktif |
| `--accent-2` | `#8b5cf6` | `#c4b0f0` | Judul seksi, label, link |
| `--text` | `#3d2c8d` | `#f3eefc` | Teks utama |
| `--text-dim` | `#a78bca` | `#8f7fb8` | Placeholder, hint, tagline |
| `--prompt-gradient` | `linear-gradient(135deg,#f3e8ff,#ffe4f0)` | `#241e33` solid + border `--border` | Panel Constructed Prompt |
| `--radius` | 16–18px kartu, 99px pill/button | sama | Sudut membulat |

Warna status (error/success) memakai varian pastel yang harmonis: error `#f43f5e`-soft, success `#4d9d78`.

## 4. Komponen & Perubahan

1. **Theme system**
   - `html.dark` class toggle; pilihan disimpan di `localStorage` key `aichemy-theme` (`light`|`dark`); default `light`; hormati `prefers-color-scheme` hanya saat belum ada pilihan tersimpan.
   - Toggle button ☀/🌙 di header (kanan, setelah Export).
   - Flash-of-wrong-theme dicegah dengan script inline kecil di `index.html` yang set class sebelum render.

2. **Reskin komponen (mengganti kelas zinc/yellow → token semantik):**
   - `App.tsx` (header, workspace shell, pane kanan)
   - `components/StartScreen.tsx`, `NewProjectModal.tsx`, `UnsavedChangesModal.tsx`
   - `components/Selector.tsx`, `VisualSelector.tsx`, `Slider.tsx`, `FStopSelector.tsx`, `TextInput.tsx`, `ClearableControl.tsx`
   - `components/StudioAccordionSection.tsx`, `PresetLibraryModal.tsx`, `CharacterLibraryModal.tsx`, `MentionTextarea`, `ErrorBoundary.tsx`, `InpaintEditor.tsx`
   - Scrollbar & selection color di `index.html` style block → token.

3. **Wordmark & tagline** di header workspace dan StartScreen.

4. **Hint text** di pane kanan: "…Aichemy never calls any API."

## 5. Yang Eksplisit TIDAK Berubah

- Layout grid 2 kolom workspace, struktur accordion, urutan seksi.
- Logika `promptBuilder`, hooks state, preset/character storage (`browserStorage.ts`), export/import `.nbproject`.
- Aset gambar WebP dan preset JSON.
- Nama folder project, package.json name (internal).

## 6. Error Handling & Edge Cases

- localStorage penuh/gagal saat menyimpan tema → diam-diam fallback ke tema saat ini (tidak crash).
- Gambar thumbnail tidak ditemukan → fallback existing `handleImageError` tetap.
- `prefers-color-scheme: dark` tanpa pilihan user → dark aktif pertama kali (dapat dioverride toggle).

## 7. Testing / Verifikasi

- `npm run build` hijau.
- Browser: light default render benar; toggle dark → semua permukaan berubah konsisten; reload → tema persist.
- Tidak ada sisa kelas `zinc-`/`yellow-` di komponen yang di-bundle (grep).
- Prompt tetap reaktif; preset save/load tetap jalan di kedua tema.

## 8. Mockup Referensi

`design/palet-arah.html` (arah B), `design/desain-final.html` (light + dark + token table) — disetujui user 2026-08-18.
