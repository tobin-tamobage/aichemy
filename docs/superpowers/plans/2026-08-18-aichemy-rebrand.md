# Aichemy Rebrand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin + rebrand renderzero-web menjadi **Aichemy**: tema terang pastel default, dark mode "Midnight Potion" dengan toggle, brand & font baru, tanpa mengubah layout/logika.

**Architecture:** Semua warna menjadi CSS custom properties (RGB triplet) di `project-styles.css` (`:root` = light, `html.dark` = dark). `tailwind.config.cjs` memetakan token semantik (`base`, `surface`, `surface2`, `border`, `accent`, `accent2`, `ink`, `dim`, `danger`, `ok`) ke `rgb(var(--x) / <alpha-value>)` sehingga modifier opasitas tetap jalan. Komponen diganti kelasnya dari `zinc-*`/`yellow-*` ke token semantik lewat tabel mapping di Task 5.

**Tech Stack:** Vite 6, React 19, Tailwind 3, CSS variables.

**Spec:** `docs/superpowers/specs/2026-08-18-aichemy-rebrand-design.md` (approved). Mockup: `design/desain-final.html`.

**Catatan testing:** project tidak punya test runner — verifikasi = `npm run build` hijau + grep + browser smoke per task terakhir. Ini disengaja (reskin murni visual).

---

### Task 1: Theme tokens & Tailwind mapping

**Files:**
- Modify: `project-styles.css`
- Modify: `tailwind.config.cjs`

- [ ] **Step 1: Ganti blok `:root` di `project-styles.css`** dengan token dua tema (hapus juga `@import` font Inter/Orbitron — font dipindah ke index.html):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Aichemy — design tokens (RGB triplets for Tailwind alpha support) */
:root {
  --bg: 253 246 238;          /* #fdf6ee cream */
  --surface: 255 255 255;     /* #ffffff */
  --surface-2: 250 245 255;   /* #faf5ff */
  --border: 240 228 255;      /* #f0e4ff */
  --accent: 255 107 157;      /* #ff6b9d candy pink */
  --accent-2: 139 92 246;     /* #8b5cf6 violet */
  --ink: 61 44 141;           /* #3d2c8d deep violet text */
  --dim: 167 139 202;         /* #a78bca muted */
  --danger: 244 63 94;        /* rose */
  --ok: 77 157 120;           /* #4d9d78 pastel green */
  --prompt-from: 243 232 255; /* #f3e8ff */
  --prompt-to: 255 228 240;   /* #ffe4f0 */
}

html.dark {
  --bg: 34 28 46;             /* #221c2e */
  --surface: 44 36 64;        /* #2c2440 */
  --surface-2: 36 30 51;      /* #241e33 */
  --border: 69 58 94;         /* #453a5e */
  --accent: 255 107 157;      /* sama */
  --accent-2: 196 176 240;    /* #c4b0f0 lebih terang utk kontras */
  --ink: 243 238 252;         /* #f3eefc */
  --dim: 143 127 184;         /* #8f7fb8 */
  --danger: 251 113 133;
  --ok: 110 231 183;
  --prompt-from: 44 36 64;    /* solid surface di dark */
  --prompt-to: 44 36 64;
}

body {
  margin: 0;
  font-family: 'Nunito', ui-rounded, system-ui, sans-serif;
  background-color: rgb(var(--bg));
  color: rgb(var(--ink));
  -webkit-font-smoothing: antialiased;
}

::selection { background: rgb(var(--accent)); color: #fff; }

/* panel prompt gradient */
.prompt-panel {
  background: linear-gradient(135deg, rgb(var(--prompt-from)), rgb(var(--prompt-to)));
}
html.dark .prompt-panel {
  background: rgb(var(--surface-2));
  border: 2px solid rgb(var(--border));
}
```

Gaya lama lain di file (brand-wordmark/tagline, scrollbar, dsb) yang mereferensikan warna lama: arahkan ke token (`--accent`, `--ink`, `--dim`). Pertahankan kelas `brand-wordmark`/`brand-tagline` namanya (dipakai App.tsx/StartScreen), isinya: wordmark Nunito 900; tagline `rgb(var(--dim))`.

- [ ] **Step 2: `tailwind.config.cjs`** — tambah warna semantik & font:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./packages/shared-core/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        base: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        surface2: 'rgb(var(--surface-2) / <alpha-value>)',
        line: 'rgb(var(--border) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        accent2: 'rgb(var(--accent-2) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        dim: 'rgb(var(--dim) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        ok: 'rgb(var(--ok) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Nunito', 'ui-rounded', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '18px',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 3: Build**
Run: `npm run build` — Expected: hijau (kelas baru belum dipakai, tidak apa).

- [ ] **Step 4: Commit**
`git add -A && git commit -m "feat(theme): Aichemy design tokens + tailwind semantic colors"`

---

### Task 2: index.html — font, anti-flash, title, scrollbar

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Update head** — title `Aichemy`, ganti link font menjadi Nunito saja:

```html
<title>Aichemy</title>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Tambah anti-flash script** tepat setelah `<body>` tag:

```html
<script>
  (function () {
    try {
      var t = localStorage.getItem('aichemy-theme');
      if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {}
  })();
</script>
```

- [ ] **Step 3: Style block** — body font-family jadi `'Nunito', sans-serif`; scrollbar track `rgb(var(--bg))`, thumb `rgb(var(--dim))`; body class di tag `<body>` ganti `bg-black text-white ... selection:bg-yellow-500 selection:text-black` → `bg-base text-ink antialiased`.

- [ ] **Step 4: Build + commit**
`npm run build` hijau → `git commit -m "feat(theme): index.html Nunito, anti-flash dark, Aichemy title"`

---

### Task 3: Theme hook + toggle

**Files:**
- Create: `hooks/useTheme.ts`
- Modify: `App.tsx` (bagian header — tombol toggle)

- [ ] **Step 1: `hooks/useTheme.ts`**

```ts
import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try { localStorage.setItem('aichemy-theme', theme); } catch { /* storage penuh/ditolak: abaikan */ }
  }, [theme]);

  const toggle = useCallback(() => setTheme(t => (t === 'dark' ? 'light' : 'dark')), []);
  return { theme, toggle };
}
```

- [ ] **Step 2: Di `App.tsx`** — panggil `useTheme()`, tambahkan tombol di deretan kanan header (setelah tombol Export), ikon lucide `Moon`/`Sun` sesuai tema, gaya pill seperti tombol header lain:

```tsx
const { theme, toggle } = useTheme();
// ...
<button type="button" onClick={toggle} title="Toggle theme"
  className="h-9 w-9 border-2 border-line bg-surface rounded-full text-xs font-bold uppercase text-accent2 hover:border-accent transition-all flex items-center justify-center">
  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
</button>
```

- [ ] **Step 3: Build + commit**
`npm run build` hijau → `git commit -m "feat(theme): useTheme hook + header toggle"`

---

### Task 4: Brand text — nama & tagline

**Files:**
- Modify: `App.tsx` (wordmark header)
- Modify: `components/StartScreen.tsx` (wordmark + tagline)
- Modify: pane kanan App.tsx hint text

- [ ] **Step 1: Wordmark** — semua `RenderZero <span …>Studio</span>` menjadi:

```tsx
<h1 className="brand-wordmark text-3xl tracking-tight">
  Ai<span className="text-accent">chemy</span>
</h1>
<p className="brand-tagline text-xs mt-1">Brew your perfect prompt</p>
```

- [ ] **Step 2: Hint text pane kanan** ganti "RenderZero Web never calls any API" → "Aichemy never calls any API." (font Nunito; pakai `text-dim`).

- [ ] **Step 3: grep** — `grep -rn "RenderZero" components App.tsx index.tsx` hanya boleh tersisa di komentar non-user-facing. Sisanya ganti Aichemy.

- [ ] **Step 4: Build + commit** → `git commit -m "feat(brand): Aichemy wordmark + tagline"`

---

### Task 5: Reskin semua komponen via tabel mapping

**Files (semua Modify):**
- `App.tsx`, `components/StartScreen.tsx`, `NewProjectModal.tsx`, `UnsavedChangesModal.tsx`, `Selector.tsx`, `VisualSelector.tsx`, `Slider.tsx`, `FStopSelector.tsx`, `TextInput.tsx`, `ClearableControl.tsx`, `MentionTextarea.tsx` (nama file mungkin berbeda — cari komponen mention di `components/`), `StudioAccordionSection.tsx`, `PresetLibraryModal.tsx`, `CharacterLibraryModal.tsx`, `InpaintEditor.tsx`, `ErrorBoundary.tsx`

- [ ] **Step 1: Terapkan mapping** (sed -i per file, lalu rapikan kasus khusus dengan tangan):

| Lama | Baru |
|---|---|
| `bg-black` | `bg-base` |
| `bg-zinc-950` | `bg-base` |
| `bg-zinc-900` | `bg-surface` |
| `bg-zinc-800` | `bg-surface2` |
| `bg-zinc-700` | `bg-surface2` |
| `border-zinc-800` | `border-line` |
| `border-zinc-700` | `border-line` |
| `border-zinc-600` | `border-line` |
| `border-zinc-500` | `border-dim` |
| `text-white` | `text-ink` |
| `text-zinc-200` | `text-ink` |
| `text-zinc-300` | `text-ink` |
| `text-zinc-400` | `text-dim` |
| `text-zinc-500` | `text-dim` |
| `text-zinc-600` | `text-dim` |
| `text-zinc-700` | `text-dim` |
| `text-zinc-800` | `text-dim` |
| `bg-yellow-500` | `bg-accent` |
| `bg-yellow-400` | `bg-accent` |
| `text-yellow-500` | `text-accent` (label seksi: `text-accent2` — lihat Step 2) |
| `text-yellow-400` | `text-accent2` |
| `border-yellow-500` | `border-accent` |
| `border-yellow-500/50` | `border-accent/50` |
| `border-yellow-500/30` | `border-accent/30` |
| `text-black` (di atas bg kuning) | `text-white` |
| `bg-green-500` / `text-green-500` | `bg-ok` / `text-ok` |
| `bg-green-500/10` dst | `bg-ok/10` dst |
| `bg-red-*` / `text-red-*` | `bg-danger*` / `text-danger*` |
| `selection:bg-yellow-500 selection:text-black` | hapus (sudah via CSS ::selection) |

- [ ] **Step 2: Kasus khusus (manual, bukan sed):**
  - Label judul seksi accordion (`01. Subject & Framing` dsb, sebelumnya `text-yellow-500` uppercase) → `text-accent2`.
  - Panel Constructed Prompt: bungkus dengan kelas `prompt-panel` (gradient light / solid dark), labelnya `text-accent2`, isi `text-ink`.
  - Tombol utama (COPY, EXPORT header, Save preset): `bg-accent text-white rounded-full`; hover `brightness(1.05)` atau `hover:bg-accent/90`.
  - Kartu/accordion/modal: tambah `rounded-card` (18px) menggantikan `rounded-lg` pada kontainer besar; tombol pill `rounded-full` menggantikan `rounded-full` yang sudah ada (sudah pill, biarkan).
  - Checkbox "Subject unaware of camera": kotak aktif `bg-accent border-accent`, centang putih.
  - Focus ring input: `focus:border-accent`.
  - StartScreen kartu New/Open Project: border hover `hover:border-accent`.

- [ ] **Step 3: Build**
`npm run build` — hijau.

- [ ] **Step 4: Verifikasi grep**
`grep -rn "zinc-\|yellow-" components App.tsx packages/shared-core/hooks` → Expected: 0 hasil (atau hanya komentar).

- [ ] **Step 5: Commit** → `git commit -m "feat(theme): reskin all components to Aichemy tokens"`

---

### Task 6: Verifikasi visual dua tema

- [ ] **Step 1:** `npm run dev -- --port 8318 --strictPort`, buka browser.
- [ ] **Step 2:** Light default: bg krim, kartu putih, label violet, tombol pink, thumbnail VisualSelector tampil.
- [ ] **Step 3:** Klik toggle 🌙 → seluruh permukaan berubah ke Midnight Potion; reload → tetap dark (persist).
- [ ] **Step 4:** Alur fungsional tetap: New Project → ketik subject → prompt update → COPY → save preset → reload → restore.
- [ ] **Step 5:** `npm run build` final hijau → `git commit -m "chore: verify Aichemy themes"` (jika ada perubahan).
