# RenderZero UI Agent Prompt

Use this document when another AI agent needs to design or modify UI for RenderZero Studio without drifting away from the established visual language.

## Copy-Paste Prompt

```text
You are working inside the RenderZero Studio codebase. Your job is to design and implement UI that looks native to RenderZero, not like a generic React/Tailwind dashboard.

RenderZero's design language is a cinematic control-room aesthetic:
- Backgrounds are matte black and deep zinc, not gray-white app chrome.
- The main accent color is a single warm signal yellow: #eab308.
- Typography is aggressive and structured: Inter for UI copy, Orbitron for the RenderZero wordmark, Roboto for the brand tagline.
- Labels, section titles, badges, and controls use uppercase text with wide tracking.
- Surfaces are mostly flat, dark, and high-contrast. Borders do most of the visual separation.
- Inputs are usually hard-edged or only slightly rounded, with dark fills and yellow focus states.
- Primary actions are white with black text, turning yellow on hover.
- Secondary actions are dark or transparent with yellow borders/text, filling yellow on hover.
- Visual selectors use moody thumbnail imagery, black gradient overlays, strong labels, yellow selected states, and dramatic hover enlargement.
- The UI should feel like a professional image-generation tool for filmmakers and photographers, not a playful SaaS product.

Follow these non-negotiable design rules:

1. Color system
- Default page background: pure black or near-black.
- Main surfaces: zinc-950, zinc-900, zinc-800 range.
- Default text: white or zinc-300/400.
- Primary accent: yellow-500 / #eab308.
- Use green only for success/ready states, red only for errors, blue only for limited secondary actions like external/open-folder flows.
- Do not introduce new brand colors unless the feature already has an established semantic reason.

2. Typography
- Keep the RenderZero wordmark in Orbitron and preserve the white + yellow split on "RenderZero Studio".
- Use Inter for body, controls, lists, and labels.
- Use Roboto only for the small brand tagline treatment if needed.
- Prefer uppercase labels, bold weights, and tracking-wider/tracking-widest for control language.
- Use monospace sparingly for metadata, counts, or machine-like helper text.

3. Shape language
- Most core controls should be rectangular, flat, and border-defined.
- Use square corners or very light radius by default.
- Pills/rounded-full shapes are allowed for compact toolbar buttons, segmented toggles, status chips, and circular icon buttons.
- Do not make the interface soft, bubbly, or card-rounded everywhere.

4. Borders and emphasis
- Use borders as the main separation tool: zinc-800 and zinc-700 are common.
- Yellow borders or yellow fills should signal focus, selection, or the current primary path.
- Avoid relying on drop shadows alone; RenderZero is border-led, not shadow-led.

5. Layout
- Prefer spacious, editorial spacing with clear section breaks.
- Major sections should have icon + uppercase heading + bottom border.
- The main app layout is a wide desktop workspace with a left control column and a right preview/output column.
- Preview panels and prompt boxes should feel anchored and dense, not airy consumer cards.

6. Inputs and forms
- Inputs/selects/textareas should usually be dark zinc with white text and yellow focus borders.
- Placeholder text should stay subdued in zinc tones.
- Labels should sit above controls in small uppercase yellow or muted zinc, depending on importance.
- Avoid default browser styling, bright outlines, or soft shadows.

7. Buttons
- Primary CTA: white background, black text, heavy uppercase, slight scale on hover, yellow hover fill.
- Secondary CTA: border-led, dark background or transparent, yellow accent on hover.
- Utility buttons: dark pills or border buttons with restrained color until hover.
- Destructive actions should stay restrained until needed, then use red semantic styling.

8. Visual selector behavior
- Thumbnail options should use real imagery, low-to-medium default opacity, and a black gradient overlay.
- Labels sit at the bottom over the image and remain uppercase.
- Selected items use yellow borders/rings and a small yellow status indicator.
- Hover can be dramatic but controlled: slight zoom on image, stronger opacity, surface expansion if the component already behaves that way.

9. Motion
- Keep motion subtle and fast: mostly 150ms to 300ms transitions.
- Use hover color shifts, border shifts, tiny scale changes, opacity changes, and restrained blur.
- Avoid playful bounces, spring-heavy animation, or decorative motion.

10. Tone and product feel
- Everything should feel precise, cinematic, technical, and production-oriented.
- The interface should read as a serious image/video prompt workstation.
- Avoid "friendly startup app" language in the visuals.

11. Avoid these mistakes
- No pastel palettes.
- No purple-as-brand.
- No generic glassmorphism.
- No large soft shadows as the main visual identity.
- No rounded-xl everywhere.
- No gradient-heavy hero styling unless a specific existing RenderZero area already uses it.
- No generic white cards on gray backgrounds.
- No default Tailwind app look.

12. When adding a new UI block
- First ask: would this belong on a black/zinc surface with border-led hierarchy and yellow focus?
- Reuse existing RenderZero primitives and class patterns before inventing new ones.
- Match the surrounding density, casing, spacing, and hover behavior.
- If unsure, choose the stricter and more minimal option.

Your output should preserve the existing RenderZero visual identity exactly. Do not "improve" it by making it softer, trendier, or more generic.
```

## Source-of-Truth Design Rules

### 1. Brand Identity

- Treat RenderZero as a high-contrast desktop tool, not a lifestyle web app.
- The brand lockup is the most stylized element: `RenderZero` in white, `Studio` in yellow.
- Brand typography is intentionally tech-forward and slightly futuristic, but the rest of the UI is restrained.

### 2. Color Palette

Primary RenderZero colors found in the current UI:

- `#000000` for body/background
- `#09090b` for deepest cards/panels
- `#18181b` for standard control surfaces
- `#27272a` for stronger borders and hover layers
- `#71717a` to `#a1a1aa` for secondary text
- `#ffffff` for primary CTA backgrounds and high-priority text
- `#eab308` as the signature RenderZero accent

Usage rules:

- Yellow is not a wash color. It is a signal color.
- Large yellow areas should be limited to selected toggles, primary state markers, and hover/active states for the strongest actions.
- Most of the interface should remain black, zinc, white, and muted gray.

### 3. Typography Rules

- `Orbitron` is reserved for the main wordmark or very rare brand-critical moments.
- `Inter` is the default everywhere else.
- `Roboto` is only for the subdued tagline style if that specific brand treatment is reused.
- Section headings are bold, uppercase, and spaced out.
- Small control labels are often `text-xs` or smaller with `tracking-wider` or `tracking-widest`.
- Use `font-black` or `font-bold` frequently on action labels and section titles.

### 4. Shape and Radius Rules

RenderZero is not purely "sharp corners everywhere." The shape system is mixed but disciplined:

- Main form inputs: mostly square or `rounded-none`.
- Large content cards/panels: flat rectangles, sometimes slightly rounded.
- Toolbar buttons and status pills: often `rounded-full`.
- Modal cards and internal grouped controls: can use `rounded-lg` or `rounded-xl`, but only as contained exceptions.
- Circular icon buttons are valid where they already exist for overlays and close controls.

Practical rule:

- If it is a primary form field or structural panel, keep it sharp or barely rounded.
- If it is a compact control, toggle, or icon action, a pill or circular treatment is allowed.

### 5. Border-First Hierarchy

RenderZero relies on borders more than shadows.

- Section separation: bottom borders
- Panels: 1px zinc borders
- Active states: yellow border, yellow fill, or yellow ring
- Disabled states: reduce contrast, not just opacity

Shadows are used, but usually only in overlays, modals, enlarged hover cards, or floating helpers.

### 6. Layout Rules

The main application follows a workbench layout:

- Sticky top header
- Wide centered content area
- Two-column desktop grid
- Left side for control construction
- Right side for prompt preview and output

Spacing rules:

- Use generous vertical gaps between major sections.
- Keep controls dense enough to feel professional.
- Avoid cramped micro-spacing and avoid oversized empty space that feels like marketing UI.

### 7. Section Construction Pattern

RenderZero repeatedly uses this structure:

1. Icon in yellow
2. Bold uppercase section title in white
3. Bottom border in zinc
4. Control stack below

If creating a new major section, mimic that exact hierarchy.

### 8. Input and Selector Rules

Standard control behaviors:

- Dark surface
- White text
- Muted placeholder text
- Zinc border by default
- Yellow focus state
- Slight background dark-to-less-dark hover shift

Selector behavior:

- Show selected value clearly
- Keep the control understated until active
- Provide a compact clear affordance if the pattern already exists nearby
- Avoid overly decorated dropdown chevrons or glossy surfaces

### 9. Visual Media Selector Rules

This is one of the strongest parts of the RenderZero UI language.

- Use thumbnail imagery as functional inspiration, not decorative noise.
- Always darken thumbnails with a black gradient or low-opacity treatment so text stays readable.
- Labels live at the bottom edge.
- Hover can increase image opacity and scale.
- Selected cards should be unmistakable via yellow border/ring and a small bright marker.
- The visual tone should remain moody and cinematic even when the source imagery is colorful.

### 10. Prompt/Output Panel Rules

The prompt preview area should feel like an instrument panel:

- Dense
- Dark
- High-contrast
- Functional
- Minimal ornament

Useful traits:

- Monospace helper snippets are acceptable
- Top-left yellow tag labels are acceptable
- Inline actions belong at the top edge in subdued text until hovered

### 11. CTA Rules

Primary generation button:

- White fill
- Black text
- Heavy uppercase
- Slight hover scale
- Yellow hover state

Secondary generation/action button:

- Transparent or dark base
- Yellow border and text
- Yellow fill on hover

This contrast between white primary and yellow-outline secondary is part of the product feel and should be preserved.

### 12. Modal Rules

Modals in RenderZero should:

- Sit over a near-black blurred backdrop
- Use dark zinc surfaces
- Use strong border definition
- Keep headers clear and utilitarian
- Avoid playful centered dialog styling

Slight corner radius is acceptable inside modals, but the modal should still read as part of the same tool, not a separate design system.

### 13. Status and Semantic Colors

Keep semantics narrow:

- Yellow: focus, active, selected, guidance
- Green: saved, ready, success
- Red: warning/error/destructive
- Blue: special-case external/setup/open-folder actions

Do not invent additional semantic colors casually.

### 14. Motion Rules

Allowed:

- `transition-colors`
- `transition-all` when restrained
- opacity changes
- small hover scale
- image zoom on hover
- backdrop blur in overlays

Avoid:

- bouncy motion
- floating motion
- exaggerated spring physics
- animated gradients
- decorative loading flourishes

### 15. Anti-Patterns

Do not let another agent do any of the following:

- Replace the black/zinc foundation with light mode styling
- Swap the yellow accent for another dominant brand color
- Add giant rounded cards everywhere
- Add glossy gradients or neon cyberpunk effects across the whole UI
- Use low-contrast gray-on-gray controls
- Introduce generic SaaS cards with shadow-only separation
- Make forms feel casual or playful
- Use oversized hero typography outside brand zones

## Fast Decision Rules

If the agent is unsure, default to these decisions:

- Background: black
- Surface: zinc-950 or zinc-900
- Border: zinc-800
- Text: white with zinc-400 secondary
- Accent: yellow-500 only
- Label style: small uppercase bold with tracking
- Input shape: square or nearly square
- Primary CTA: white to yellow hover
- Secondary CTA: yellow outline
- Major section header: yellow icon + white uppercase title + bottom border

## Implementation Checklist

Before finalizing UI work, verify:

- The screen still reads as RenderZero from a squint test.
- Yellow is used as an accent, not a wallpaper.
- Core forms still feel flat, dark, and tool-like.
- Section hierarchy is border-led and icon-led.
- The brand wordmark treatment was not diluted.
- New controls match surrounding casing, spacing, radius, and hover behavior.
- Nothing looks like a default Tailwind template.

## Current Reference Files

Use these files as the visual source of truth before changing styles:

- `project-styles.css`
- `App.tsx`
- `components/VisualSelector.tsx`
- `components/Selector.tsx`
- `components/TextInput.tsx`
- `components/Slider.tsx`
- `components/StartScreen.tsx`
- `components/PresetLibraryModal.tsx`
- `components/SettingsModal.tsx`
