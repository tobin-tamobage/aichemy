import { createElement } from 'react';
import { Aperture, Camera, Film, Video } from 'lucide-react';
import type {
  DomainOption,
  DomainRecipe,
  DomainSection,
} from './types';
import {
  createEmptyPromptState,
  type PromptState,
} from '../packages/shared-core/types';
import { buildPromptFromState } from '../packages/shared-core/services/promptBuilder';
import {
  ASPECT_RATIOS,
  CAMERAS,
  FILM_STOCKS,
  FILTERS,
  FOCAL_LENGTHS,
  LENSES,
  LIGHTING_TYPES,
  MOVIE_LOOKS,
  PHOTOGRAPHERS,
  SHOT_TYPES,
  VIEWING_DIRECTIONS,
} from '../packages/shared-core/constants';
import type { VisualOption } from '../packages/shared-core/types';

/**
 * Cinematic domain — ekstraksi 1:1 dari JSX App.tsx (sections L798-1419).
 *
 * Paritas field yang direplikasi (key → sumber App.tsx):
 *
 * Section 1 'subject-framing' — "01. Subject & Framing" (App.tsx L799-862):
 *   - subjectAction  textarea rows 3      MentionTextarea L807-819
 *                    (placeholder App dinamis saat ada @mentions karakter/scene
 *                    dari Elements; di engine dipakai placeholder dasar —
 *                    MentionTextarea tetap milik custom section 'elements')
 *   - shotType       visual SHOT_TYPES    VisualSelector L823-825 (aspect-video)
 *   - viewingDirection visual VIEWING_DIRECTIONS L827-831 (aspect-video)
 *                    visibleWhen: hanya tampil bila shotType terisi (L826)
 *   - aspectRatio    select ASPECT_RATIOS Selector L834-837
 *                    (App memakai filterImageAspectRatioOptions = buang 'auto', L80-81/L626)
 *   - candidShot     toggle "Subject unaware of camera" L838-856
 *                    visibleWhen: hanya tampil bila shotType terisi (L838)
 *   - environment    textarea (TextInput single-line) L857-860
 *
 * Section 2 'lighting-mood' — "02. Lighting & Mood" (App.tsx L865-882):
 *   - lighting       visual LIGHTING_TYPES VisualSelector L874-876 (aspect-[3/4])
 *   - mood           textarea (TextInput single-line) L877-880
 *
 * Section 3 'camera-gear' — "03. Camera Gear" (App.tsx L885-919):
 *   - camera         visual CAMERAS        VisualSelector L894-896 (aspect-video)
 *   - focalLength    visual FOCAL_LENGTHS  VisualSelector L898-900 (aspect-video)
 *   - lens           visual LENSES         VisualSelector L903-905 (aspect-video)
 *   - fStop          select (FStopSelector L907-912) — opsi dari F_STOP_VALUES
 *                    di components/FStopSelector.tsx L8; value disimpan mentah
 *                    ('2.8') agar buildLensClause promptBuilder menghasilkan
 *                    "f/2.8" persis seperti sekarang
 *   - filmStock      visual FILM_STOCKS    VisualSelector L915-917 (aspect-video)
 *
 * Section 4 'style-aesthetics' — "04. Style & Aesthetics" (App.tsx L922-949):
 *   - photographer   visual PHOTOGRAPHERS  VisualSelector L934-938 (aspect-square)
 *   - movieLook      visual MOVIE_LOOKS    VisualSelector L939-943 (aspect-video)
 *   - filter         chips  FILTERS        VisualSelector multiSelect L944-948
 *                    (union DomainField: visual hanya single — multi dirender chips;
 *                    tanpa max, handleFilterChange hanya set array penuh)
 *
 * SENGAJA TIDAK masuk config:
 *   - temperature    Slider "Temperature (Creativity)" L930-932 — TAMPIL di UI,
 *                    tetapi (a) DomainField union fase 1 tidak punya kind 'slider'
 *                    dan (b) temperature tidak pernah masuk buildPromptFromState
 *                    (param kreativitas generasi, dead UI untuk prompt builder).
 *                    Task 5 wiring menghapus slider ini sepenuhnya dari App.tsx
 *                    (clean cutover, bukan render di luar engine).
 *   - genre / westernAnimation / animeGenre / animeShowStyle — ada di PromptState
 *                    tetapi TIDAK dirender di UI App.tsx sekarang (grep: nol
 *                    kemunculan di JSX sections) → tidak dimasukkan.
 *
 * Section 5 'elements-tool' — "05. Elements Tool (Images)" (App.tsx L952-1419):
 *   BUKAN field engine — Characters/Scene/Global Reference/Additional References
 *   + InpaintEditor + Narrative Angle toggle dirender khusus App.tsx.
 *   Ditandai via customSections: ['elements'].
 */

const toOptions = (values: string[]): DomainOption[] =>
  values.map(value => ({ value, label: value }));

const toVisualOptions = (options: VisualOption[]): DomainOption[] =>
  options.map(({ value, label, image }) => ({ value, label, image }));

// Replika filterImageAspectRatioOptions (App.tsx L80-81): buang 'auto'.
const ASPECT_RATIO_OPTIONS = toOptions(ASPECT_RATIOS.filter(r => r !== 'auto'));

// Sumber: F_STOP_VALUES di components/FStopSelector.tsx L8.
// value mentah (tanpa prefix) agar promptBuilder membangun `f/${fStop}`.
const F_STOP_OPTIONS: DomainOption[] =
  ['1.4', '2', '2.8', '4', '5.6', '8', '11', '16', '22']
    .map(value => ({ value, label: `f/${value}` }));

const hasShotType = (state: Record<string, unknown>): boolean =>
  typeof state.shotType === 'string' && state.shotType.length > 0;

const iconProps = { className: 'w-5 h-5' } as const;

const sections: DomainSection[] = [
  {
    id: 'subject-framing',
    title: '01. Subject & Framing',
    icon: createElement(Camera, iconProps),
    fields: [
      {
        kind: 'textarea',
        key: 'subjectAction',
        label: 'Subject & Action',
        placeholder: 'E.g., A woman in a trench coat checking her phone...',
        rows: 3,
      },
      {
        kind: 'visual',
        key: 'shotType',
        label: 'Shot Type / Angle',
        options: toVisualOptions(SHOT_TYPES),
        previewRatio: 'aspect-video',
      },
      {
        kind: 'visual',
        key: 'viewingDirection',
        label: 'Viewing Direction (Optional)',
        options: toVisualOptions(VIEWING_DIRECTIONS),
        previewRatio: 'aspect-video',
        visibleWhen: hasShotType,
      },
      {
        kind: 'select',
        key: 'aspectRatio',
        label: 'Aspect Ratio',
        options: ASPECT_RATIO_OPTIONS,
      },
      {
        kind: 'toggle',
        key: 'candidShot',
        label: 'Subject unaware of camera',
        visibleWhen: hasShotType,
      },
      {
        kind: 'textarea',
        key: 'environment',
        label: 'Environment',
        placeholder: 'E.g., at a rainy London bus stop at night...',
        rows: 1,
      },
    ],
  },
  {
    id: 'lighting-mood',
    title: '02. Lighting & Mood',
    icon: createElement(Aperture, iconProps),
    fields: [
      {
        kind: 'visual',
        key: 'lighting',
        label: 'Lighting Source',
        options: toVisualOptions(LIGHTING_TYPES),
        previewRatio: 'aspect-[3/4]',
      },
      {
        kind: 'textarea',
        key: 'mood',
        label: 'Atmosphere / Mood',
        placeholder: 'E.g., moody, cinematic, lonely, melancholic...',
        rows: 1,
      },
    ],
  },
  {
    id: 'camera-gear',
    title: '03. Camera Gear',
    icon: createElement(Film, iconProps),
    fields: [
      {
        kind: 'visual',
        key: 'camera',
        label: 'Camera Body',
        options: toVisualOptions(CAMERAS),
        previewRatio: 'aspect-video',
      },
      {
        kind: 'visual',
        key: 'focalLength',
        label: 'Focal Length',
        options: toVisualOptions(FOCAL_LENGTHS),
        previewRatio: 'aspect-video',
      },
      {
        kind: 'visual',
        key: 'lens',
        label: 'Lens Type',
        options: toVisualOptions(LENSES),
        previewRatio: 'aspect-video',
      },
      {
        kind: 'select',
        key: 'fStop',
        label: 'F-Stop',
        options: F_STOP_OPTIONS,
        placeholder: 'Select f-stop...',
      },
      {
        kind: 'visual',
        key: 'filmStock',
        label: 'Film Stock',
        options: toVisualOptions(FILM_STOCKS),
        previewRatio: 'aspect-video',
      },
    ],
  },
  {
    id: 'style-aesthetics',
    title: '04. Style & Aesthetics',
    icon: createElement(Video, iconProps),
    fields: [
      {
        kind: 'visual',
        key: 'photographer',
        label: 'Photographer Style',
        options: toVisualOptions(PHOTOGRAPHERS),
        previewRatio: 'aspect-square',
      },
      {
        kind: 'visual',
        key: 'movieLook',
        label: 'Movie Look / Aesthetic',
        options: toVisualOptions(MOVIE_LOOKS),
        previewRatio: 'aspect-video',
      },
      {
        kind: 'visual',
        key: 'filter',
        label: 'Filter / Effect',
        options: toVisualOptions(FILTERS),
        previewRatio: 'aspect-square',
        multi: true,
      },
    ],
  },
];

export const cinematicDomain: DomainRecipe = {
  id: 'cinematic',
  label: 'Cinematic',
  icon: '🎬',
  tagline: 'Compose cinematic photo prompts — subject, lighting, camera gear, and film aesthetics.',
  referencePhoto: false,
  createEmptyState: () => createEmptyPromptState() as unknown as Record<string, unknown>,
  presetProtectedKeys: ['subjectAction', 'environment'],
  sections,
  customSections: ['elements'],
  buildPrompt: state => buildPromptFromState(state as unknown as PromptState),
};
