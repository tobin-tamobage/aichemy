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
 * This recipe generates new property scenes without a source photo. Exterior scenes use
 * exterior-appropriate staging and time-of-day language; virtual staging adds perspective
 * and shadow guidance, while the closing direction keeps the frame property-focused.
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
      fields: [{ kind: 'visual', key: 'scene', label: 'Scene', options: RE_SCENES, previewRatio: 'aspect-video' }],
    },
    {
      id: 'design-style',
      title: '02 · Design Style',
      fields: [{ kind: 'visual', key: 'designStyle', label: 'Design style', options: RE_STYLES, previewRatio: 'aspect-video' }],
    },
    {
      id: 'time-of-day',
      title: '03 · Time of Day',
      fields: [{ kind: 'visual', key: 'timeOfDay', label: 'Time of day', options: RE_TIMES, previewRatio: 'aspect-[4/3]' }],
    },
    {
      id: 'staging',
      title: '04 · Staging',
      fields: [{ kind: 'visual', key: 'staging', label: 'Staging', options: RE_STAGING, previewRatio: 'aspect-video' }],
    },
    {
      id: 'angle-lens',
      title: '05 · Angle & Lens',
      fields: [
        { kind: 'visual', key: 'angleLens', label: 'Angle & lens', options: RE_ANGLES, previewRatio: 'aspect-video' },
        { kind: 'visual', key: 'cameraTechnique', label: 'Camera & technique', options: RE_CAMERAS, previewRatio: 'aspect-video' },
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
    const lightingPhrase = isExterior
      ? timeOfDay.promptPhrase.replace('interior lighting', 'exterior lighting').replace('interior lights', 'house lights')
      : timeOfDay.promptPhrase;
    const stagingPhrase = isExterior
      ? ({
          'furnished-styled': 'professionally presented with tasteful landscaping and outdoor details',
          'virtual-staging': 'virtually staged with realistically scaled outdoor furniture and landscaping',
          'partial-staging': 'light landscaping with a few tasteful outdoor details',
          empty: 'clean, uncluttered grounds ready for inspection',
        } as Record<string, string>)[staging.value] ?? staging.promptPhrase
      : staging.promptPhrase;

    const blocks: string[] = [];

    // [Riset §1] Jenis ruang/eksterior + gaya desain — mengunci subjek sejak awal.
    blocks.push(`Photorealistic ${isExterior ? 'exterior' : 'interior'} photograph of ${scene.promptPhrase}, styled in ${style.promptPhrase}.`);

    // [Riset §1] Cahaya per waktu (golden hour / twilight = momen listing premium).
    blocks.push(`Lighting: ${lightingPhrase}.`);

    // [Riset §2 Field 4] Virtual staging adds scale and perspective guidance.
    const virtualClause = staging.value === 'virtual-staging'
      ? ' Added furniture should cast natural shadows and follow the scene perspective.'
      : '';
    blocks.push(`Staging: ${stagingPhrase}.${virtualClause}`);

    // [Riset §2 Field 5] Angle & lens — 16mm ultra-wide untuk interior, bukan eksterior.
    blocks.push(`Shot with ${angleLens.promptPhrase}.`);

    blocks.push(`${cameraTechnique.promptPhrase.charAt(0).toUpperCase()}${cameraTechnique.promptPhrase.slice(1)}.`);

    blocks.push('An unoccupied, uncluttered property frame, with straight verticals, natural colors, and realistic materials.');

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
        text: 'Virtual staging adds realistic scale and perspective/shadow guidance; people remain excluded by the property specification.',
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
