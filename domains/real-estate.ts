import type { DomainRecipe, DomainState, DomainWarning } from './types';
import {
  RE_SCENES,
  RE_STYLES,
  RE_TIMES,
  RE_STAGING,
  RE_ANGLES,
  RE_CAMERAS,
} from './real-estate-catalogs';

/**
 * DomainRecipe: Real Estate — dari design/research-realestate.md §1-§5 + plan Task 2 Step 2.
 * Komentar [Riset §…] di buildPrompt/warnings memetakan tiap blok prompt ke temuan riset.
 *
 * Keputusan authoring plan: referencePhoto: false dan presetProtectedKeys: [] (semua
 * field adalah select). Deteksi eksterior = scene.value diawali 'exterior-' (riset §2
 * Field 1: prefix value menandakan blok interior/exterior). Virtual staging menambahkan
 * klausa realistic-scale + no-people di blok Staging yang sama (riset §4 jebakan #3).
 * Guardrail/negative jadi konstanta blok terakhir buildPrompt (pola marketing blok 5).
 */

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

export const realEstateDomain: DomainRecipe = {
  id: 'real-estate',
  label: 'Real Estate',
  icon: '🏠',
  tagline: 'Interiors, exteriors, and virtual staging.',
  referencePhoto: false,
  presetProtectedKeys: [],

  createEmptyState: () => ({
    scene: 'living-room',
    designStyle: 'scandinavian',
    timeOfDay: 'morning-natural',
    staging: 'furnished-styled',
    angleLens: 'wide-24mm',
    cameraTechnique: 'full-frame',
  }),

  sections: [
    {
      id: 'scene',
      title: '01 · Scene',
      fields: [{ kind: 'select', key: 'scene', label: 'Scene', options: RE_SCENES }],
    },
    {
      id: 'design-style',
      title: '02 · Design Style',
      fields: [{ kind: 'select', key: 'designStyle', label: 'Design style', options: RE_STYLES }],
    },
    {
      id: 'time-of-day',
      title: '03 · Time of Day',
      fields: [{ kind: 'select', key: 'timeOfDay', label: 'Time of day', options: RE_TIMES }],
    },
    {
      id: 'staging',
      title: '04 · Staging',
      fields: [{ kind: 'select', key: 'staging', label: 'Staging', options: RE_STAGING }],
    },
    {
      id: 'angle-lens',
      title: '05 · Angle & Lens',
      fields: [
        { kind: 'select', key: 'angleLens', label: 'Angle & lens', options: RE_ANGLES },
        { kind: 'select', key: 'cameraTechnique', label: 'Camera & technique', options: RE_CAMERAS },
      ],
    },
  ],

  buildPrompt: (state: DomainState): string => {
    const scene = RE_SCENES.find(o => o.value === str(state.scene)) ?? RE_SCENES[0];
    const style = RE_STYLES.find(o => o.value === str(state.designStyle)) ?? RE_STYLES[0];
    const timeOfDay = RE_TIMES.find(o => o.value === str(state.timeOfDay)) ?? RE_TIMES[0];
    const staging = RE_STAGING.find(o => o.value === str(state.staging)) ?? RE_STAGING[0];
    const angleLens = RE_ANGLES.find(o => o.value === str(state.angleLens)) ?? RE_ANGLES[0];
    const cameraTechnique = RE_CAMERAS.find(o => o.value === str(state.cameraTechnique)) ?? RE_CAMERAS[0];

    // [Riset §2 Field 1] Prefix 'exterior-' di value scene → blok exterior (vs interior).
    const isExterior = scene.value.startsWith('exterior-');

    const blocks: string[] = [];

    // [Riset §1] Jenis ruang/eksterior + gaya desain — mengunci subjek sejak awal.
    blocks.push(`Photorealistic ${isExterior ? 'exterior' : 'interior'} photograph of ${scene.promptPhrase}, styled in ${style.promptPhrase}.`);

    // [Riset §1] Cahaya per waktu (golden hour / twilight = momen listing premium).
    blocks.push(`Lighting: ${timeOfDay.promptPhrase}.`);

    // [Riset §2 Field 4 + §4 jebakan #3] Virtual staging menambahkan klausa realistic
    // scale + no-people di blok yang sama (furniture AI sering melayang/tidak proporsional).
    const virtualClause = staging.value === 'virtual-staging'
      ? ' Furniture must be realistically scaled, cast natural shadows, and contain no people.'
      : '';
    blocks.push(`Staging: ${staging.promptPhrase}.${virtualClause}`);

    // [Riset §2 Field 5] Angle & lens — 16mm ultra-wide untuk interior, bukan eksterior.
    blocks.push(`Shot with ${angleLens.promptPhrase}.`);

    // [Phase 6] Camera/technique sentence — capitalise first letter of the phrase.
    blocks.push(`${cameraTechnique.promptPhrase.charAt(0).toUpperCase()}${cameraTechnique.promptPhrase.slice(1)}.`);

    // [Riset §4 jebakan #1/#2] Guardrail/negative — vertikal lurus, orang/hewan/teks dihapus.
    blocks.push('Straight verticals, natural colors, realistic materials, no people, no pets, no watermarks, no text overlays.');

    return blocks.join('\n\n');
  },

  warnings: (state: DomainState): DomainWarning[] => {
    const out: DomainWarning[] = [];
    const scene = str(state.scene);
    const designStyle = str(state.designStyle);
    const staging = str(state.staging);
    const angleLens = str(state.angleLens);
    const cameraTechnique = str(state.cameraTechnique);

    // (a) [Riset §4 jebakan #3] Virtual staging menambah klausa prompt — info.
    if (staging === 'virtual-staging') {
      out.push({
        sectionId: 'staging',
        level: 'info',
        text: 'Virtual staging — the prompt adds a realistic scale and no-people clause.',
      });
    }

    // (b) [Riset §2 Field 5 + §5] 16mm ultra-wide mendistorsi fasad eksterior.
    if (scene.startsWith('exterior-') && angleLens === 'wide-16mm') {
      out.push({
        sectionId: 'angle-lens',
        level: 'warn',
        text: 'Ultra-wide 16mm distorts house exteriors — use the 24mm wide or eye-level.',
      });
    }

    // (c) [Riset §4] Industrial di kamar mandi terasa dingin — saran aksen hangat.
    if (scene === 'bathroom' && designStyle === 'industrial') {
      out.push({
        sectionId: 'design-style',
        level: 'info',
        text: 'Industrial style in a bathroom can feel cold — add warm wood or brass accents.',
      });
    }

    // (d) [Phase 6] Drone aerial hanya cocok untuk scene eksterior.
    if (cameraTechnique === 'drone' && !scene.startsWith('exterior-')) {
      out.push({
        sectionId: 'angle-lens',
        level: 'warn',
        text: 'Drone aerial only suits exterior scenes — interior drone shots look wrong.',
      });
    }

    return out;
  },
};
