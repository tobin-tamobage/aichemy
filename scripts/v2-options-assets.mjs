import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const originals = path.join(root, 'design/v2/options-originals');
const assets = path.join(root, 'public/assets/v2/options');
const manifestPath = path.join(root, 'design/v2/option-assets.json');
const source = name => path.join(root, `design/originals/${name}.png`);
const saved = id => path.join(originals, `${id}.png`);
const jobs = new Map();
const add = (id, prompt, references, extra = {}) => jobs.set(id, { id, prompt, references, ...extra });
const series = (prefix, variants, base, shared, useCase = 'identity-preserve') => {
  for (const [name, change] of Object.entries(variants)) {
    const id = `${prefix}-${name}`;
    add(id, `Use case: ${useCase}. Asset type: Aichemy option comparison ${id}, one single polished photorealistic commercial photograph, vertical 4:5. Image 1 is the edit target and invariant reference. ${shared} Primary request: ${change} Preserve every other aspect. Realistic materials and skin texture. No captions, random text, added logos, watermarks, collage or multiple panels. Illustrative AI photography, no physical optical simulation or camera-brand claim.`, [base]);
  }
};

add('people-light-soft', 'Use case: identity-preserve. Asset type: Aichemy option comparison, people-light-soft; one single polished photorealistic commercial portrait, vertical 4:5. Image 1 is the identity and original coral knit wardrobe reference. Create a neutral baseline portrait of this exact Indonesian adult woman with the same short dark wavy bob, facial features, skin tone, and coral collared short-sleeved knitted top. Change her pose to directly front-facing shoulders and face, upright, calm closed-mouth neutral expression, arms and hands down outside crop. Mid-torso up composition, eye-level illustrative 85 mm portrait perspective. Plain warm peach studio backdrop. Broad neutral softbox key and gentle fill, soft natural shadows and realistic skin pores. This will anchor comparisons: preserve distinctive face and knit garment carefully. No jewelry additions, no props, no text, no watermarks. AI illustrative photography, no camera-brand claim.', [source('portrait')]);
add('product-light-soft', 'Use case: precise-object-edit. Asset type: Aichemy product comparison baseline product-light-soft; single photorealistic polished commercial product photograph, vertical 4:5. Image 1 is the exact product design reference. Preserve the exact peach frosted rectangular glass serum bottle with gently rounded corners, thick transparent glass base, rose-gold cylindrical dropper collar and cream rubber bulb, same proportions and peach liquid, no label. Stand the bottle upright centered on a simple matte white horizontal tabletop against a warm light-gray seamless studio backdrop, level eye-height front viewpoint, entire bottle visible with generous margins. Remove the original flowers, orange, cloth and architectural scene to establish a clean comparison baseline. Broad neutral softbox lighting, soft shadow cast behind right, realistic glass and metal highlights. No new design, no label, no text, no watermark. This exact bottle geometry, tabletop, backdrop, position and camera will anchor option edits.', [source('product')]);

const people = saved('people-light-soft');
const personLock = 'Keep the exact same adult Indonesian woman, facial identity, short dark wavy bob, coral collared knit top, neutral closed mouth, front-facing pose, mid-torso crop, camera perspective, plain warm peach studio backdrop and subject position.';
series('people-light', {
  window: 'Change only illumination to directional neutral window light from camera-left, a clear broad side-lit face and gentle shadow falloff on the right, subtle window-shaped background light; do not add a physical window or change backdrop.',
  golden: 'Change only illumination to warm golden-hour-style low angled light, honey highlights and gentle warm directional shadows on the same peach backdrop.',
  rembrandt: 'Change only illumination to a clearly legible Rembrandt portrait pattern: a small key high camera-left at 55 degrees and almost no frontal fill. The viewer-right side of her face must be in deep shadow, except a small distinct closed triangular patch of light on the cheek immediately below the viewer-right eye. Connect the nose shadow to cheek shadow to enclose this light triangle; substantially darker cheek, neck and background on viewer-right. Keep head and shoulders exactly front-facing. Do not merely add broad warm frontal lighting.',
  rim: 'Change only illumination to a distinct luminous warm rim along both outer edges of hair and shoulders from behind, restrained soft frontal fill keeping the face clearly visible.',
  dramatic: 'Change only illumination to dramatic low-key split lighting, one side of the face illuminated from camera-left, other side deeply shadowed, same peach backdrop falling dark through lighting alone.'
}, people, personLock, 'lighting-weather');
series('people-lens', {
  '35': 'Illustrative 35 mm environmental perspective: move camera CLOSER to hold the same head-and-mid-torso size. The fixed background objects now appear distinctly SMALLER relative to her head, with MORE room context visible around the same monstera at left and wooden shelf at right. Show complete plant pot and more shelf width and beige wall, no new objects. Keep the same actual plant and shelf at the same real scene positions several metres behind her. Make background-scale distinction legible, preserve subject size, soft lighting and deep-focus clarity. No exaggerated face distortion.',
  '50': 'Illustrative 50 mm standard perspective: camera distance intermediate between the 35 mm close camera and 85 mm farther camera, holding EXACTLY SAME subject face size, head position and head-and-mid-torso crop as the provided approved 35 mm image. Keep the same real room objects and positions. Background plant and shelf appear moderately larger than the provided 35 mm image, with slightly less visible room context, but less enlarged than 85/100. Preserve lighting, fixed subject position and deep-focus clarity.',
  '85': 'Illustrative 85 mm portrait perspective: use the reference room composition as the anchor, head-and-mid-torso framing with the same subject size. Same detailed monstera and planter at left, wooden shelf with hanging vine and ceramics at right, beige plaster wall. This represents a farther camera position than 35/50; background objects appear larger relative to her face, with less surrounding room context. Preserve all object designs, lighting and deep-focus clarity.',
  '100': 'Illustrative 100 mm portrait perspective: move the camera FARTHER AWAY while holding EXACTLY SAME head-and-mid-torso framing, face size and eye-level height as reference and 35/50/85. Background objects appear visibly LARGER relative to her face and feel closer behind her: larger monstera leaves at left and larger shelf ceramics and wider shelf uprights at right, less surrounding room context. Keep the identical real plant, shelf, vine and ceramics in their locked scene positions, not different props. Preserve same lighting and deep-focus clarity. Full hair and both shoulders remain visible; NO macro or closeup.'
}, saved('people-depth-deep'), 'Keep the exact same adult Indonesian woman, facial identity, short dark wavy bob, coral collared knit top, neutral closed mouth, directly front-facing mid-torso pose, eye-level height and subject size. Use this ONE same real room: beige plaster wall, same monstera plant and pale cylindrical pot camera-left, same wood shelving camera-right with hanging vine, books and ceramic bowls/vase; all objects stay fixed in actual scene positions. Same soft light and exposure, keep background details comparably in focus. Vary only camera distance and illustrative field of view to explain environmental perspective, not background styling, pose, light or bokeh. No quantified optical accuracy or camera-brand claim.');
for (const id of ['people-lens-50', 'people-lens-85', 'people-lens-100']) {
  jobs.get(id).references = [saved('people-lens-35')];
  jobs.get(id).prompt += ' Image 1 is the approved 35 mm room composition from this same source. CRITICAL: keep her head, hair silhouette, face size, eye height, shoulder placement and torso crop at EXACTLY the same image locations as Image 1. Change only the background room projection for the farther camera: ' + (id.endsWith('50') ? 'moderate background enlargement, same complete planter still visible at left, same shelf at right with slightly less room context.' : id.endsWith('85') ? 'plant leaves, planter and shelf objects visibly larger than 35/50, less surrounding beige wall and room context.' : 'strongest background enlargement in the series: plant leaves and shelf objects larger and more tightly cropped than 85, with much less room context.') + ' Do not zoom or crop the person; no closeup. Preserve the exact plant and shelf designs and their actual scene positions, same neutral soft light and background focus.';
}
series('people-wardrobe', {
  shirt: 'Change only her coral knit top to a crisp white cotton collared button-up shirt with realistic fabric folds, same modest neckline.',
  blazer: 'Change only wardrobe to a tailored charcoal blazer over a simple ivory shell; preserve her neck and face, no added jewelry.',
  graduation: 'Change only wardrobe to a plain black graduation gown, simple deep red stole, and a black mortarboard with a tassel; no institutional insignia, certificates or documents. Preserve the visible face and bob around the cap.',
  kebaya: 'Change only clothing to a refined ivory Indonesian kebaya blouse with delicate floral embroidery and a modest lining; same body pose and crop, no added jewelry.',
  hijab: 'Change only wardrobe to a neatly draped taupe hijab covering her hair and neck and a plain modest long-sleeved ivory blouse. Preserve the exact visible facial identity, facial proportions, expression and skin tone.'
}, people, personLock);
series('people-expression', {
  smile: 'Change only facial expression to a warm natural teeth-visible smile, eyes gently smiling, same neutral head position.',
  confident: 'Change only facial expression to calm confidence: assured direct gaze and a very subtle closed-mouth smile, relaxed brows, same head position.',
  thoughtful: 'Change only facial expression to thoughtful contemplation: gaze slightly toward camera-right and softly pensive lips, head and shoulders remain fixed. Do not add hand gestures.'
}, people, personLock);
series('people-style', {
  editorial: 'Change only the photographic treatment to polished contemporary editorial color and retouching: refined clean tones, slightly crisper local contrast and carefully retained skin texture. No wardrobe, pose, light-direction or background change.',
  cinematic: 'Change only the photographic color treatment to cinematic restrained warm highlights and cooler shadows, subtle filmic contrast and fine grain. Preserve exposure, light direction, geometry, wardrobe and pose. No bars or scene additions.',
  monochrome: 'Change only color treatment to rich neutral black-and-white monochrome, refined tonal separation and natural skin texture. Same exposure, composition and lighting.'
}, people, personLock, 'style-transfer');
add('people-cutout', 'Use case: background-extraction. Asset type: Aichemy transparent portrait for exact CSS background-color examples. Image 1 is the edit target. Extract this exact neutral front-facing adult Indonesian woman, same face, short dark wavy bob, coral knit top, lighting, expression, pose, and mid-torso crop onto a genuinely transparent alpha background. Preserve fine flyaway hair, natural skin and knit edges. Remove every pixel of peach studio backdrop without changing the subject. Actual alpha transparency, no checkerboard baked in, no solid color, no cast shadow outside subject, no halo, no text, no watermark.', [people], { transparent: true });

for (const [name, change] of Object.entries({
  front: 'Stand facing squarely forward, shoulders level, arms relaxed down.',
  'three-quarter': 'Turn only body and head to an elegant three-quarter angle, face still looking toward camera, arms relaxed.',
  seated: 'Sit naturally on the existing pale wooden stool, hands relaxed on thighs, upright posture.',
  standing: 'Stand in a relaxed fashion pose with weight on one leg, one hand gently at the hip and other arm down.'
})) add(`people-pose-${name}`, `Use case: identity-preserve. Asset type: Aichemy people pose comparison, one single vertical 4:5 polished photorealistic photograph. Image 1 is the face, hair, top and lighting identity reference. Use the exact same adult Indonesian woman with the same short dark wavy bob, facial features, coral collared knit top and neutral closed-mouth expression. Scene for every pose option: the same plain peach studio, same pale wooden stool at her right, charcoal straight-leg trousers, neutral softbox light from camera-left, same eye-level camera and fixed knee-up composition, same person size. Change only pose: ${change} Keep the stool in scene even when unused, same attire and lighting. Realistic anatomy, hands and skin. No text, watermark, extra accessories or objects.`, [name === 'front' ? people : saved('people-pose-front')]);

add('people-depth-deep', 'Use case: identity-preserve. Asset type: Aichemy depth comparison baseline people-depth-deep, single photorealistic vertical 4:5 portrait. Image 1 is the person and lighting reference. Preserve the exact front-facing adult Indonesian woman, facial identity, short dark wavy bob, coral knit shirt, neutral closed mouth, same mid-torso framing and neutral softbox key. Place her in front of a tasteful studio interior background with a beige plaster wall, one leafy plant at camera-left and a wooden shelf camera-right, all several metres behind her. Deep depth of field: her face, knit texture, distant plant leaves and shelf details are all clearly resolved and sharp, consistent exposure. This fixed 85 mm illustrative composition will anchor depth edits; keep natural perspective. No new accessories, text, watermark or labels.', [people]);
series('people-depth', {
  balanced: 'Change only depth of field from deep to balanced: subject eyes, face and knit front remain sharp, distant plant and shelf are moderately softly defocused but recognizable. Same fixed focal length, camera position, framing, light, exposure, background objects and distances.',
  shallow: 'Change only depth of field to very shallow: both subject eyes and face in focus, distant plant and shelf dissolve into strongly soft creamy bokeh; their color positions still match the reference. Same fixed focal length, camera position, framing, light, exposure and geometry. Do not zoom or enlarge the face.'
}, saved('people-depth-deep'), 'Keep the exact same person, neutral expression, frontal pose, coral knit top, fixed camera and crop, background plant at left and shelf at right, lighting and exposure.');

const product = saved('product-light-soft');
const bottleLock = 'Preserve the exact peach frosted rectangular glass serum bottle, rounded corners, thick clear base, rose-gold cylindrical collar, cream rubber dropper bulb and all proportions. Keep the bottle upright, centered, same position and size, eye-height front camera, warm light-gray studio backdrop and white tabletop, no label or props.';
series('product-light', {
  window: 'Change only lighting to neutral directional window light from camera-left, rectangular reflections in glass and a clear soft-edged directional shadow to the right. No physical window addition.',
  golden: 'Change only lighting to warm golden-hour-style low side light, warm amber highlights and a longer soft shadow to the right. Preserve the product material color.',
  rim: 'Change only lighting to elegant strong edge/rim highlights outlining the bottle and cap, subdued front fill, same background made slightly darker through illumination only, visible peach glass.'
}, product, bottleLock, 'lighting-weather');
series('product-surface', {
  stone: 'Change only the white tabletop material to pale warm travertine stone with restrained natural pores. Keep surface geometry, height, backdrop, bottle position, camera and lighting.',
  wood: 'Change only the white tabletop material to natural medium warm oak with visible fine grain. Keep surface geometry, height, backdrop, bottle position, camera and lighting.',
  pastel: 'Change only the white tabletop color/material to smooth matte pastel dusty-rose. Keep surface geometry, height, backdrop, bottle position, camera and lighting.'
}, product, bottleLock, 'precise-object-edit');
series('product-angle', {
  'three-quarter': 'Change only the camera angle to a clear three-quarter product view, elevated about 25 degrees and around the bottle 30 degrees so top and side planes are visible. Same bottle standing in the same place, same white tabletop/backdrop and lighting, entire bottle with comparable margins.',
  overhead: 'Change only camera viewpoint to EXACTLY 90 degrees overhead, optical axis straight vertically down aligned with the bottle axis. The same bottle remains UPRIGHT on the white tabletop. In this true top view, the cream bulb appears as a CIRCULAR dome centered inside the CIRCULAR rose-gold collar ring, with only the rounded-rectangular peach glass shoulder outline surrounding it. The bottle vertical walls and cap vertical side wall are NOT visible. Do not show a tall side elevation or 45-degree view. White tabletop fills the frame, same soft light from left. Preserve exact cap and bottle design and do not lay the bottle down. Top projection centered with generous negative space.',
  macro: 'Change only camera framing to a close macro detail of the upper peach frosted glass shoulder, rose-gold collar and cream dropper bulb. Same angle, orientation, lighting, tabletop and background; crop the lower bottle body. Preserve exact cap shape, seam and material textures.'
}, product, bottleLock, 'precise-object-edit');
series('product-props', {
  botanical: 'Add only one small branch with green leaves and tiny white citrus blossoms lying on the tabletop at lower left beside the bottle. Keep exact bottle, lighting, camera, surface and background unchanged.',
  citrus: 'Add only one fresh orange wedge on the tabletop at lower left beside the bottle. Keep exact bottle, lighting, camera, surface and background unchanged.',
  fabric: 'Add only a small softly folded piece of peach translucent fabric on the tabletop at lower left beside the bottle. Keep exact bottle, lighting, camera, surface and background unchanged.'
}, product, bottleLock, 'precise-object-edit');

series('food-presentation', {
  clean: 'Change only plating presentation and supporting table styling to clean minimalist: same nasi goreng, same ingredients and serving amount, same fried egg, chicken, cucumber, tomato, crackers and sambal bowl on a simple clean white ceramic plate, tidy arrangement on a plain neutral tabletop. Retain same three-quarter camera angle, scale, window-light direction and warm natural food colors.',
  flatlay: 'Change only camera viewpoint to a true directly overhead flatlay of this exact nasi goreng plate, same fried egg, rice, chicken, cucumber, tomatoes, crackers, sambal bowl, rustic table and linen. Preserve food amounts and arrangement as seen from above, same daylight direction and color treatment.',
  close: 'Change only framing to a tight appetizing close-up of the exact fried egg and nasi goreng rice grains and chicken beneath, same three-quarter angle and daylight direction. Keep same plate, ingredients, rustic table and cloth; outer plate naturally crops out. No added garnish.'
}, source('food'), 'Image 1 is the exact nasi goreng dish and scene reference. Preserve the same dish identity, ingredients and natural warm daylight. No substitutions of cuisine.', 'precise-object-edit');
series('couple-pose', {
  walk: 'Change only their pose to walking gently together side-by-side hand in hand along this garden aisle, bride holding same bouquet in free hand, both smiling toward each other.',
  seated: 'Change only their pose to sitting naturally close together on the existing garden stone step, bride holding the same bouquet in her lap and groom turned slightly toward her. Realistic joined hands.',
  embrace: 'Change only their pose to a tender standing embrace, groom arms naturally around her waist, bride one arm at his shoulder, same bouquet held low, their faces close and smiling.'
}, source('wedding'), 'Preserve BOTH exact adult Indonesian identities from Image 1: same groom face and short wavy black hair, same bride face and updo with white flowers. Keep his ivory three-piece suit and tie, her embroidered ivory kebaya gown and patterned skirt, exact bouquet. Same floral garden arch and stone steps, same golden soft backlight, knee-up portrait framing and comparable subject scale.', 'identity-preserve');
series('property-view', {
  straight: 'Change only camera placement and orientation to a straight-on architectural view squarely facing the existing cream sofa with arched opening at its left. Keep verticals straight. Same room, furniture and objects in their real positions, same daylight direction and decor.',
  detail: 'Change only camera framing to a close architectural detail of the existing round wooden coffee table, dark ceramic foliage vase, stone bowl and book stack, with part of the same cream sofa behind. Preserve exact objects and their arrangement, same natural daylight direction; no new readable text.',
  corner: 'Change only camera position to a diagonal corner view from the rear-right corner of this SAME living room, looking across the existing cream sofa and round wooden table toward the same arched pool opening. Preserve spatial layout and all furniture designs, materials and daylight direction. Straight architectural verticals.'
}, source('real-estate'), 'Image 1 is the exact room geometry, furniture and materials reference. Preserve cream plaster walls, large arched pool opening, tropical palms outside, woven ceiling, cream sofa, round wood coffee table and same objects, ceramic planter, linen curtains, rattan chair and jute rug. Do not invent a different property.', 'precise-object-edit');

const aliases = {
  'people-wardrobe-original': 'people-light-soft',
  'people-expression-neutral': 'people-light-soft',
  'people-style-natural': 'people-light-soft',
  'product-surface-white': 'product-light-soft',
  'product-angle-eye': 'product-light-soft',
  'product-props-none': 'product-light-soft',
  'food-presentation-rustic': source('food'),
  'couple-pose-facing': source('wedding'),
  'property-view-wide': source('real-estate')
};

series('property-light', {
  soft: 'Change only illumination to soft diffuse neutral daylight, gentle even interior shadows, natural beige plaster and cream upholstery; remove hard sun stripes through diffusion only. Same room, exact camera and composition.',
  window: 'Change only illumination to directional neutral daytime window light from the existing left curtain and arched opening, clear light-and-shadow bands, neutral daylight white balance. Same architecture, camera, furniture and exterior view.'
}, source('real-estate'), 'Preserve the exact same room geometry, arched pool opening and palm garden, cream sofa, round timber coffee table, ceramic vase, bowl and books, rattan chair, jute rug, curtain, planter and woven ceiling. Same fixed camera, framing and object positions. No remodel, new furniture or added objects.', 'lighting-weather');
series('property-style', {
  editorial: 'Change only the photographic color and finishing treatment to clean contemporary architectural editorial: controlled highlights, refined neutral beige and cream, crisp material detail and gentle local contrast. Preserve exact room geometry, furniture, camera, object positions and original sunlight direction. No decor or lighting changes.'
}, source('real-estate'), 'Preserve the exact same cream plaster living room, arched pool opening, tropical garden, sofa, wood coffee table with vase/bowl/books, woven chair and rug, curtain, planter, ceiling and fixed camera composition.', 'style-transfer');
Object.assign(aliases, {
  'property-light-golden': source('real-estate'),
  'property-style-natural': source('real-estate')
});
for (const [id, baseline] of Object.entries(aliases)) {
  add(id, `Baseline reuse for ${id}. Use the visually inspected existing AI image directly; no semantic alteration. ${id.includes('lens') ? 'Illustrative 85 mm portrait perspective only; no physical simulation or camera-brand promise. ' : ''}Resize only to 700 and 350 pixels wide.`, [baseline.includes('/') ? baseline : saved(baseline)], { reuse: baseline });
}

export { jobs, root, originals, assets, manifestPath };

async function record(id, input, reviewNotes) {
  const job = jobs.get(id);
  if (!job) throw new Error(`Unknown key: ${id}`);
  if (!reviewNotes) throw new Error('Visual inspection notes required');
  await fs.mkdir(originals, { recursive: true });
  await fs.mkdir(assets, { recursive: true });
  const original = saved(id);
  if (path.resolve(input) !== original) await fs.copyFile(input, original);
  for (const width of [700, 350]) {
    await sharp(original).rotate().resize({ width }).webp({ quality: 86, alphaQuality: 100, effort: 6 }).toFile(path.join(assets, `${id}${width === 350 ? '-small' : ''}.webp`));
  }
  let manifest = [];
  try { manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  const entry = { id, src: `/assets/v2/options/${id}.webp`, source: original, prompt: job.prompt, references: job.references, reviewed: true, reviewNotes, tool: 'built-in image_gen' };
  manifest = [...manifest.filter(x => x.id !== id), entry].sort((a, b) => a.id.localeCompare(b.id));
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify({ id, source: original, count: manifest.length, metadata: await sharp(path.join(assets, `${id}.webp`)).metadata() }));
}

async function audit() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const missing = [...jobs.keys()].filter(id => !manifest.some(x => x.id === id));
  const problems = [];
  for (const item of manifest) {
    for (const [suffix, width] of [['', 700], ['-small', 350]]) {
      const file = path.join(assets, `${item.id}${suffix}.webp`);
      const m = await sharp(file).metadata();
      if (m.width !== width) problems.push(`${item.id}${suffix}: width ${m.width}`);
      if (item.id === 'people-cutout' && !m.hasAlpha) problems.push(`${item.id}${suffix}: missing alpha`);
    }
    await fs.access(item.source);
    if (!item.reviewed || !item.reviewNotes || !item.prompt) problems.push(`${item.id}: incomplete review record`);
  }
  console.log(JSON.stringify({ expected: jobs.size, completed: manifest.length, missing, problems }, null, 2));
}

async function alphaReview(input) {
  const meta = await sharp(input).metadata();
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let transparent = 0, partial = 0, opaque = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] === 0) transparent++;
    else if (data[i] === 255) opaque++;
    else partial++;
  }
  await fs.mkdir(originals, { recursive: true });
  const colors = ['#ffffff', '#13b8a6', '#141923'];
  const tiles = [];
  for (const [index, background] of colors.entries()) {
    tiles.push({ input: await sharp(input).resize({ width: 350 }).flatten({ background }).png().toBuffer(), left: index * 350, top: 0 });
  }
  const preview = path.join(originals, 'qa-cutout-backgrounds.png');
  await sharp({ create: { width: 1050, height: Math.round(info.height * 350 / info.width), channels: 3, background: '#ffffff' } }).composite(tiles).png().toFile(preview);
  console.log(JSON.stringify({ input, hasAlpha: meta.hasAlpha, transparent, partial, opaque, preview }));
}

async function reviewSheet(ids, name) {
  const width = 280, height = 350, labelHeight = 30;
  const tiles = [];
  for (const [index, id] of ids.entries()) {
    tiles.push({ input: await sharp(saved(id)).resize(width, height).png().toBuffer(), left: index * width, top: labelHeight });
    const label = Buffer.from(`<svg width="280" height="30"><rect width="280" height="30" fill="#ffffff"/><text x="12" y="21" fill="#202020" font-family="sans-serif" font-size="14">${id}</text></svg>`);
    tiles.push({ input: label, left: index * width, top: 0 });
  }
  const output = path.join(originals, `qa-${name}.png`);
  await sharp({ create: { width: width * ids.length, height: height + labelHeight, channels: 3, background: '#ffffff' } }).composite(tiles).png().toFile(output);
  console.log(JSON.stringify({ output, ids }));
}

const [action, ...args] = process.argv.slice(2);
if (action === 'job') console.log(JSON.stringify(jobs.get(args[0])));
if (action === 'list') console.log(JSON.stringify([...jobs.values()]));
if (action === 'record') await record(...args);
if (action === 'audit') await audit();
if (action === 'alpha') await alphaReview(args[0]);
if (action === 'sheet') await reviewSheet(args.slice(1), args[0]);
if (action === 'pending') {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const entry = manifest.find(x => x.id === args[0]);
  if (entry) { entry.reviewed = false; entry.reviewNotes = args[1]; }
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify({ id: args[0], status: 'replacement pending' }));
}
