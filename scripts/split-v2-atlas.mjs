import { readFile, writeFile, mkdir } from "node:fs/promises";
import { basename, dirname, resolve, join } from "node:path";
import sharp from "sharp";

const repo = process.cwd();
const configPath = process.argv[2];
if (!configPath) throw new Error("Usage: node scripts/split-v2-atlas.mjs <jobs.json>");
const jobs = JSON.parse(await readFile(resolve(repo, configPath), "utf8"));
const manifests = new Map();
for (const job of jobs) {
  const { source: sourceRel, prefix, names, prompt, manifest: manifestRel } = job;
  const cols = job.cols ?? 4;
  const rows = job.rows ?? 4;
  if (names.length !== cols * rows) throw new Error(`${sourceRel}: tile names don't match grid`);
  const source = resolve(repo, sourceRel);
  const outputRel = job.output ?? "public/assets/v2/sets-v3";
  const { width, height } = await sharp(source).metadata();
  if (!width || !height) throw new Error(`${sourceRel}: atlas has no dimensions`);
  const cellW = width / cols;
  const cellH = height / rows;
  const gutterX = job.gutterX ?? 4;
  const gutterY = job.gutterY ?? 4;
  const manifestPath = resolve(repo, manifestRel);
  if (!manifests.has(manifestPath)) {
    try {
      manifests.set(manifestPath, JSON.parse(await readFile(manifestPath, "utf8")));
    } catch {
      manifests.set(manifestPath, []);
    }
  }
  let manifest = manifests.get(manifestPath);
  const outputDir = resolve(repo, outputRel);
  const outputPublicPath = `/${outputRel.replace(/^public\//, "")}`;
  await mkdir(outputDir, { recursive: true });
  const sourceRef = `/${source.slice(repo.length + 1)}`;
  for (let index = 0; index < names.length; index++) {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const [left, right] = job.columnBounds?.[col] ?? [
      Math.max(0, Math.round(col * cellW + (col ? gutterX / 2 : 0))),
      Math.min(width, Math.round((col + 1) * cellW - (col < cols - 1 ? gutterX / 2 : 0))),
    ];
    const [top, bottom] = job.rowBounds?.[row] ?? [
      Math.max(0, Math.round(row * cellH + (row ? gutterY / 2 : 0))),
      Math.min(height, Math.round((row + 1) * cellH - (row < rows - 1 ? gutterY / 2 : 0))),
    ];
    const id = `${prefix}${String(index + 1).padStart(2, "0")}`;
    const fullName = `${id}.webp`;
    const fullPath = join(outputDir, fullName);
    const tile = sharp(source).extract({ left, top, width: right - left, height: bottom - top });
    const resize = { fit: job.fit ?? "cover", position: job.position ?? "centre", ...(job.background ? { background: job.background } : {}) };
    await tile.clone().resize(800, 800, resize).webp({ quality: 84 }).toFile(fullPath);
    await tile.clone().resize(350, 350, resize).webp({ quality: 78 }).toFile(fullPath.replace(".webp", "-small.webp"));
    const previous = manifest.find((entry) => entry.id === id);
    manifest = manifest.filter((entry) => entry.id !== id);
    manifest.push({
      id,
      src: `${outputPublicPath}/${fullName}`,
      source: sourceRef,
      prompt,
      references: [],
      reviewed: previous?.reviewed ?? false,
      reviewNotes: previous?.reviewNotes ?? `Potongan atlas ${basename(source)}; tinjauan visual per tile diperlukan.`,
      tool: "built-in image_gen",
      label: names[index],
    });
  }
  manifests.set(manifestPath, manifest);
}
for (const [path, rows] of manifests) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
  console.log(`${rows.length} atlas tiles indexed in ${path}`);
}
