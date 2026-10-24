import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const originals = path.join(root, 'design/v2/food-options-originals');
const assets = path.join(root, 'public/assets/v2/options');
const manifestPath = path.join(root, 'design/v2/food-option-assets.json');
const source = path.join(root, 'design/v2/cases-originals/source-food.png');
const baseline = path.join(originals, 'food-angle-three-quarter.png');
const saved = id => path.join(originals, `${id}.png`);
const jobs = new Map();
const lock = 'Preserve this exact synthetic nasi goreng serving and its beige speckled ceramic plate, dark small sambal bowl at left, one sunny-side-up egg with orange yolk and crisp lacy edges over the same chicken fried rice, same visible rice grains, chicken pieces, scallion, red chili, cooked egg pieces and fried shallot already present. Keep the exact serving quantity, cucumber and tomato fan at rear left, pale crackers at rear right, and their relative arrangement. Do not invent ingredients, add garnish, restyle or redistribute the food, change the plate or bowl, or change the portion.';
const baselinePrompt = `Use case: precise-object-edit\nAsset type: Aichemy V2 food option comparison food-angle-three-quarter, single portrait 4:5 photorealistic food photograph.\nInput images: Image 1 is the edit target and exact dish identity reference.\nPrimary request: establish a quiet neutral controlled comparison baseline. Change only the environment to a smooth matte WHITE tabletop and a plain light warm-gray neutral backdrop with no props. Retain the original elevated THREE-QUARTER camera view at about 40 degrees downward: egg top, rice front and plate rim clearly visible. Pull back just enough to show the entire same plate with a small margin at both sides, centered with quiet space above and below. Broad soft neutral diffuse illumination from upper left with gentle fill and low-contrast shadows. No direct sun or dramatic color cast.\nSubject invariants: ${lock}\nStyle/medium: realistic appetizing commercial food photography, natural rice grain texture, ceramic speckles and crisp egg edges; no illustration.\nConstraints: one single portrait 4:5 photo, no collage, no diagram, no text, logo or watermark, no utensils, napkins, plants, hands, extra food or external styling objects. The plate and sambal bowl are the only tableware. Keep natural food colors. This exact framing, plate position, food arrangement, backdrop and light will anchor subsequent comparisons.`;
jobs.set('food-angle-three-quarter', { id: 'food-angle-three-quarter', prompt: baselinePrompt, references: [source] });
function series(prefix, variants, useCase = 'precise-object-edit') {
  for (const [name, change] of Object.entries(variants)) {
    const id = `${prefix}-${name}`;
    jobs.set(id, {
      id,
      prompt: `Use case: ${useCase}\nAsset type: Aichemy V2 controlled food option comparison ${id}; one single portrait 4:5 photorealistic food photograph.\nInput images: Image 1 is the edit target and invariant baseline.\nPrimary request: ${change}\nSubject invariants: ${lock}\nScene invariants: retain the same smooth matte white horizontal tabletop, plain light warm-gray neutral backdrop, elevated three-quarter camera at about 40 degrees downward, exact plate size and position in frame, entire plate visible with small side margins, and broad soft neutral diffuse light from upper left, except the ONE variable explicitly requested above. Do not change any other variable.\nStyle/medium: realistic commercial food photography with natural texture and food color; preserve ceramic speckles, rice grain detail and appetizing crisp egg edge.\nConstraints: single portrait 4:5 photo, no collage, no diagrams, no text, logo or watermark. No added ingredients, food on the plate, utensils, hands, containers or other props except the expressly requested external styling. External styling must remain outside the plate with visible separation; it conveys no ingredient or product claim.`,
      references: [baseline],
    });
  }
}
series('food-angle', {
  eye: 'Change only camera viewpoint to a clearly LOW EYE-LEVEL view with lens just above the plate rim, looking almost horizontally across it with only about 8 degrees of downward tilt. Emphasize the height and side profile of the same rice mound, egg and upright crackers; the plate appears as a shallow ellipse. Camera height must look obviously different from a three-quarter view. Keep the same plate and food in place, comparable dish width and full plate in frame, same white surface, gray backdrop and neutral soft light. Do not flatten or reduce the serving.',
  overhead: 'Change only camera viewpoint to a TRUE 90-DEGREE OVERHEAD top-down flatlay, lens axis perpendicular to the tabletop. The same round plate must appear circular without perspective tilt, its rim visible all around; white tabletop fills the environment. Preserve the same actual serving quantity and food arrangement as viewed from above: egg on rice, sambal bowl left, cucumber and tomato rear left, crackers rear right. Maintain comparable dish width with margins, same soft neutral light from upper left. No new ingredients or props.',
  macro: 'Change only camera framing to an obvious tight MACRO texture close-up at the same three-quarter view: sharply resolve the fried egg crisp edge and glossy orange yolk, individual seasoned rice grains and existing chicken below. Outer plate naturally extends outside the frame. Keep the actual serving and all ingredients intact; this is a crop of the same dish, not a smaller or replated portion. Shallow close-focus falloff is appropriate; retain same soft neutral light and white tabletop. Do not add droplets, garnish, ingredients or props.',
});
series('food-surface', {
  stone: 'Change ONLY the horizontal tabletop material from smooth matte white to pale warm-gray natural stone with restrained visible mineral grain and subtle pores. Preserve tabletop geometry, plain gray backdrop, food and plate pixels as closely as possible, camera framing, light direction and softness. No cloth or props.',
  wood: 'Change ONLY the horizontal tabletop material from smooth matte white to natural warm oak with clearly visible fine wood grain. Preserve tabletop geometry, plain gray backdrop, food and plate pixels as closely as possible, camera framing, light direction and softness. No cloth or props.',
  pastel: 'Change ONLY the horizontal tabletop material/color from smooth matte white to smooth matte pale pastel dusty-rose. Preserve tabletop geometry, plain gray backdrop, food and plate pixels as closely as possible, camera framing, light direction and softness. Do not tint the food. No cloth or props.',
});
series('food-light', {
  window: 'Change ONLY illumination to directional neutral daylight from one window at camera-left. Show a clearly brighter left side and gentle but distinct shadow falloff on the right, a longer directional tabletop shadow, with natural neutral food colors. Keep readable detail on the shadow side. Do not add a physical window, window frame, room or props. Same exact camera, food, plate, white surface and gray backdrop.',
  golden: 'Change ONLY illumination to warm low-angle golden sun from camera-left: distinct honey-colored highlights on egg, rice and plate with long soft-edged shadows to the right on the SAME white tabletop. Maintain readable food detail and plausible warm color. Do not change the surface material, backdrop, camera, food or tableware, and do not add a sun, room, steam or props.',
  rim: 'Change ONLY illumination to pronounced BACK RIM LIGHT from behind the plate at upper right, outlining egg edge, rice mound and crackers with a clear luminous edge. Use restrained broad frontal fill so yolk, rice and sambal remain appetizing and readable. A slightly darker-looking gray background due only to illumination is appropriate. Same camera, framing, exact food and plate, white tabletop. No invented steam, smoke or props.',
}, 'lighting-weather');
series('food-props', {
  botanical: 'Add ONLY a small decorative green leafy branch lying on the tabletop OUTSIDE the plate near the lower-left edge, with a visible gap to the ceramic rim. It is external decorative styling, not garnish or an ingredient. Keep the entire dish, serving, plate, white tabletop, gray backdrop, camera and soft diffuse lighting unchanged. No flowers, new food, bowls or other props.',
  citrus: 'Add ONLY one small lemon half and one thin lemon slice lying on the tabletop OUTSIDE the plate near the lower-left edge, with a visible gap to the ceramic rim. The citrus is external decorative styling, not an ingredient addition or a product claim. Keep the entire dish, serving, plate, white tabletop, gray backdrop, camera and soft diffuse lighting unchanged. No citrus on the plate and no other props.',
  fabric: 'Add ONLY a small softly folded piece of natural ivory linen on the tabletop OUTSIDE the plate near the lower-left edge, with a visible gap to the ceramic rim. Linen texture and a few folds should be clear. Keep the entire dish, serving, plate, white tabletop, gray backdrop, camera and soft diffuse lighting unchanged. Do not place fabric on or under the plate, and do not add utensils or other props.',
});
for (const id of ['food-surface-white', 'food-light-soft', 'food-props-none']) {
  jobs.set(id, { id, prompt: baselinePrompt, references: [source], reuse: 'food-angle-three-quarter' });
}
export { jobs, root, originals, assets, manifestPath };

async function checkHandoff(id) {
  const ack = JSON.parse(await fs.readFile(path.join(root, 'design/v2/food-handoff.json'), 'utf8'));
  if (!ack.safeToStart) throw new Error('Ownership handoff does not authorize generation');
  const skipped = [...(ack.inFlight ?? []), ...(ack.completed ?? []), ...(ack.alreadyCompleted ?? [])];
  if (id && skipped.includes(id)) throw new Error(`Ownership excludes ${id}`);
  return { safeToStart: ack.safeToStart, skipped };
}

async function record(id, input, reviewNotes) {
  const job = jobs.get(id);
  if (!job) throw new Error(`Unknown food key: ${id}`);
  await checkHandoff(id);
  if (!reviewNotes?.trim()) throw new Error('Specific actual visual review notes required');
  const meta = await sharp(input).metadata();
  if (Math.abs(meta.width / meta.height - 0.8) > 0.01) throw new Error(`Expected portrait 4:5, got ${meta.width}x${meta.height}`);
  await fs.mkdir(originals, { recursive: true });
  await fs.mkdir(assets, { recursive: true });
  const original = saved(id);
  if (path.resolve(input) !== original) await fs.copyFile(input, original);
  for (const [width, quality] of [[700, 82], [350, 80]]) {
    await sharp(original).rotate().resize({ width, height: Math.round(width * 1.25), fit: 'cover' }).webp({ quality, effort: 6 }).toFile(path.join(assets, `${id}${width === 350 ? '-small' : ''}.webp`));
  }
  let manifest = [];
  try { manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  const entry = { id, src: `/assets/v2/options/${id}.webp`, source: original, prompt: job.prompt, references: job.references, reviewed: true, reviewNotes, tool: 'built-in image_gen' };
  await fs.writeFile(path.join(originals, `${id}.provenance.json`), `${JSON.stringify({
    id,
    tool: 'built-in image_gen',
    operation: job.reuse ? 'reuse of reviewed generated baseline; copy and Sharp resize only' : 'built-in image edit; saved original copied without semantic alteration',
    generatedInput: path.resolve(input),
    savedOriginal: original,
    toolInput: { prompt: job.prompt, referenced_image_paths: job.references, transparent_background: false },
    reuse: job.reuse ?? null,
    derivativeEncoding: [{ width: 700, quality: 82, format: 'webp' }, { width: 350, quality: 80, format: 'webp' }],
    reviewed: true,
    reviewNotes,
  }, null, 2)}\n`);
  manifest = [...manifest.filter(item => item.id !== id), entry].sort((a, b) => a.id.localeCompare(b.id));
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify({ id, original, generatedInput: input, reuse: job.reuse ?? null, count: manifest.length }));
}

async function audit() {
  const ack = await checkHandoff();
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const expected = [...jobs.keys()].filter(id => !ack.skipped.includes(id));
  const problems = [];
  if (new Set(manifest.map(item => item.id)).size !== manifest.length) problems.push('Duplicate manifest ids');
  const files = [];
  for (const item of manifest) {
    if (!jobs.has(item.id) || !item.reviewed || !item.reviewNotes || item.tool !== 'built-in image_gen') problems.push(`${item.id}: bad record`);
    if (item.source !== saved(item.id)) problems.push(`${item.id}: source outside owned original path`);
    if (item.src !== `/assets/v2/options/${item.id}.webp`) problems.push(`${item.id}: wrong src`);
    if (item.prompt !== jobs.get(item.id)?.prompt) problems.push(`${item.id}: prompt mismatch`);
    await fs.access(item.source);
    for (const reference of item.references) await fs.access(reference);
    const provenance = JSON.parse(await fs.readFile(path.join(originals, `${item.id}.provenance.json`), 'utf8'));
    if (provenance.toolInput.prompt !== item.prompt || provenance.reviewNotes !== item.reviewNotes) problems.push(`${item.id}: provenance mismatch`);
    for (const [suffix, width] of [['', 700], ['-small', 350]]) {
      const file = path.join(assets, `${item.id}${suffix}.webp`);
      const meta = await sharp(file).metadata();
      if (meta.width !== width || meta.height !== Math.round(width * 1.25) || meta.format !== 'webp') problems.push(`${item.id}${suffix}: wrong output geometry`);
      files.push({ file: path.relative(root, file), width: meta.width, height: meta.height, bytes: (await fs.stat(file)).size });
    }
  }
  const result = { expected: expected.length, completed: manifest.length, skipped: ack.skipped, missing: expected.filter(id => !manifest.some(item => item.id === id)), problems, webpFiles: files.length, totalWebpBytes: files.reduce((sum, file) => sum + file.bytes, 0), files };
  await fs.writeFile(path.join(originals, 'audit.json'), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
  if (result.missing.length || problems.length) process.exitCode = 1;
}

async function contact() {
  const groups = [
    ['food-angle-eye', 'food-angle-three-quarter', 'food-angle-overhead', 'food-angle-macro'],
    ['food-surface-white', 'food-surface-stone', 'food-surface-wood', 'food-surface-pastel'],
    ['food-light-soft', 'food-light-window', 'food-light-golden', 'food-light-rim'],
    ['food-props-none', 'food-props-botanical', 'food-props-citrus', 'food-props-fabric'],
  ];
  const tiles = [];
  for (const [row, ids] of groups.entries()) {
    for (const [column, id] of ids.entries()) {
      tiles.push({ input: await fs.readFile(path.join(assets, `${id}-small.webp`)), left: column * 350, top: row * 438 });
    }
  }
  const output = path.join(originals, 'qa-food-comparison.webp');
  await sharp({ create: { width: 1400, height: 1752, channels: 3, background: '#ffffff' } }).composite(tiles).webp({ quality: 90 }).toFile(output);
  console.log(JSON.stringify({ output, rows: groups }));
}

async function reencode() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  for (const item of manifest) {
    if (!jobs.has(item.id) || !item.reviewed || item.source !== saved(item.id)) throw new Error(`Cannot reencode unreviewed or unowned ${item.id}`);
    for (const [width, quality] of [[700, 82], [350, 80]]) {
      await sharp(item.source).rotate().resize({ width, height: Math.round(width * 1.25), fit: 'cover' }).webp({ quality, effort: 6 }).toFile(path.join(assets, `${item.id}${width === 350 ? '-small' : ''}.webp`));
    }
  }
  console.log(JSON.stringify({ reencoded: manifest.length, widths: [700, 350], heights: [875, 438] }));
}

const [action, ...args] = process.argv.slice(2);
try {
  const overrides = JSON.parse(await fs.readFile(path.join(originals, 'prompt-overrides.json'), 'utf8'));
  for (const job of overrides) {
    if (!jobs.has(job.id)) throw new Error(`Unknown food prompt override ${job.id}`);
    jobs.set(job.id, job);
  }
} catch (e) { if (e.code !== 'ENOENT') throw e; }
if (action === 'job') console.log(JSON.stringify(jobs.get(args[0])));
if (action === 'list') console.log(JSON.stringify([...jobs.values()], null, 2));
if (action === 'handoff') console.log(JSON.stringify(await checkHandoff()));
if (action === 'record') await record(...args);
if (action === 'audit') await audit();
if (action === 'contact') await contact();
if (action === 'reencode') await reencode();
