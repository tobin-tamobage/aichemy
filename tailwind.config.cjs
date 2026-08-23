/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./domains/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./packages/shared-core/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  safelist: [
    'aspect-video',
    'aspect-square',
    'aspect-[3/4]',
    'aspect-[4/3]',
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
