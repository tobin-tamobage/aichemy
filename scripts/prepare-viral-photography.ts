import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
import { VIRAL_TEASERS } from "../shared/viral-photography";

// Mechanical asset ingestion only. All photographic edits use built-in image_gen.
const root = resolve(import.meta.dirname, "..");
type Source = {
  id: string;
  afterSource: string;
  prompt: string;
  references: string[];
  reviewed: boolean;
  reviewNotes: string;
};
const jobs: Source[] = JSON.parse(
  await readFile(
    resolve(root, "design/v2/viral-photography-jobs.json"),
    "utf8",
  ),
);
const archived = JSON.parse(
  await readFile(
    resolve(root, "design/v2/archive/viral-assets-v1.json"),
    "utf8",
  ),
);
const rebase = (path: string) =>
  path.includes("/design/")
    ? resolve(root, "design", path.split("/design/")[1])
    : resolve(root, path);
const manifest = [];
for (const item of VIRAL_TEASERS) {
  const job = jobs.find((row) => row.id === item.id);
  const old = archived.find((row: Source) => row.id === item.id);
  if (!job && !old) throw new Error(`Missing photographic source: ${item.id}`);
  const beforeSource = job
    ? `design/v2/cases-originals/source-${item.id.startsWith("product-") ? "product" : "professional"}.png`
    : old.beforeSource;
  const afterSource = job?.afterSource ?? old.afterSource;
  for (const [source, target] of [
    [beforeSource, item.before],
    [afterSource, item.after],
  ]) {
    const output = resolve(root, "public", target.replace(/^\//, ""));
    await mkdir(resolve(output, ".."), { recursive: true });
    await sharp(rebase(source))
      .rotate()
      .resize({ width: 1000 })
      .webp({ quality: 84, effort: 6 })
      .toFile(output);
    await sharp(rebase(source))
      .rotate()
      .resize({ width: 450 })
      .webp({ quality: 82, effort: 6 })
      .toFile(output.replace(".webp", "-small.webp"));
  }
  manifest.push({
    id: item.id,
    kind: "viral",
    medium: "photography",
    before: item.before,
    after: item.after,
    beforeSource,
    afterSource,
    prompt: job?.prompt ?? old.prompt,
    references: job?.references ?? old.references,
    reviewed: job?.reviewed ?? old.reviewed,
    reviewNotes: job?.reviewNotes ?? old.reviewNotes,
    tool: "built-in image_gen",
  });
}
await writeFile(
  resolve(root, "design/v2/viral-assets.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(
  `Prepared ${manifest.length} photography pairs; review gate remains enforced by validate:v2.`,
);
