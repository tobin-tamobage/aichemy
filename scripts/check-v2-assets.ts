import { readFile, stat } from "node:fs/promises";
import { resolve, relative } from "node:path";
import { buildStudioV2 } from "../server/engine-v2";
import { SETS, SERVICES, VIRAL_TEASERS, setImage } from "../shared/v2-catalog";
import { publishedViral } from "../server/viral";
import sharp from "sharp";
import { z } from "zod";
import { EXPANDED_PHOTOS, expandedPhotoId } from "../server/expanded-options";
const root = resolve(import.meta.dirname, "..");
type Row = {
  id: string;
  src?: string;
  before?: string;
  after?: string;
  source?: string;
  beforeSource?: string;
  afterSource?: string;
  prompt: string;
  references: string[];
  reviewed: boolean;
  reviewNotes: string;
  medium?: string;
};
const issues: string[] = [];
const assetSchema = z
  .object({
    id: z.string().regex(/^[a-zA-Z0-9-]+$/),
    src: z.string().optional(),
    before: z.string().optional(),
    after: z.string().optional(),
    source: z.string().optional(),
    beforeSource: z.string().optional(),
    afterSource: z.string().optional(),
    prompt: z.string().min(30),
    references: z.array(z.string().min(1)),
    reviewed: z.boolean(),
    reviewNotes: z.string().min(15),
    tool: z.enum(["built-in image_gen", "user-provided synthetic reference"]),
  })
  .passthrough();
const manifests = await Promise.all(
  [
    ["case", "case-assets.json"],
    ["viral", "viral-assets.json"],
    ["option", "option-assets.json"],
    ["food-option", "food-option-assets.json"],
    ["option-v3", "option-assets-v3.json"],
    ["style", "style-assets-v3.json"],
    ["portfolio", "../v3/portfolio-assets.json"],
    ["pose-bank", "../v3/pose-bank/manifest.json"],
    ["expanded", "../expanded-options/manifest.json"],
  ].map(async ([kind, file]) => {
    try {
      return z
        .array(assetSchema)
        .parse(
          JSON.parse(
            await readFile(resolve(root, `design/v2/${file}`), "utf8"),
          ),
        ) as Row[];
    } catch {
      issues.push(`Manifest ${kind} hilang atau tidak valid`);
      return [];
    }
  }),
);
const [
  cases,
  viral,
  baseOptions,
  foodOptions,
  v3Options,
  styleAssets,
  portfolio,
  poses,
  expanded,
] = manifests;
const options = [...baseOptions, ...foodOptions, ...v3Options];
for (const series of EXPANDED_PHOTOS)
  for (const [value] of series.rows)
    if (!expanded.some((row) => row.id === expandedPhotoId(series, value)))
      issues.push(
        `Contoh perluasan wajib hilang: ${expandedPhotoId(series, value)}`,
      );
if (new Set(options.map((r) => r.id)).size !== options.length)
  issues.push("ID opsi fotografis duplikat antar manifest.");
for (const rows of manifests)
  if (new Set(rows.map((r) => r.id)).size !== rows.length)
    issues.push("ID manifest aset duplikat.");
const rebase = (path: string) =>
  path.includes("/design/")
    ? resolve(root, `design/${path.split("/design/")[1]}`)
    : path.includes("/public/")
      ? resolve(root, `public/${path.split("/public/")[1]}`)
      : resolve(root, path.replace(/^\//, ""));
async function exists(path: string, label: string) {
  try {
    const info = await stat(path);
    if (!info.isFile() || !info.size) issues.push(`${label}: berkas kosong`);
  } catch {
    issues.push(`${label}: ${relative(root, path)} tidak ditemukan`);
  }
}
async function imageCheck(path: string, width: number, label: string) {
  try {
    const meta = await sharp(path).metadata();
    if (meta.format !== "webp" || meta.width !== width || !meta.height)
      issues.push(`${label}: format/dimensi gambar tidak sesuai.`);
  } catch {
    issues.push(`${label}: gambar tidak dapat dibaca.`);
  }
}
for (const [rows, ids, kind] of [
  [cases, SETS.map((s) => s.id), "case"],
  [viral, VIRAL_TEASERS.map((v) => v.id), "viral"],
] as const) {
  for (const id of ids) {
    const row = rows.find((r) => r.id === id);
    if (!row) {
      issues.push(`${kind}: ${id} hilang`);
      continue;
    }
    if (!row.before || !row.after) issues.push(`${id}: pasangan belum lengkap`);
  }
}
const used = new Set<string>();
for (const service of SERVICES) {
  const legacy = !service.sets[0].visualSrc?.startsWith("/assets/v3/");
  if (service.sets.length !== (legacy ? 16 : 6))
    issues.push(`${service.id}: jumlah gaya awal tidak sesuai katalog.`);
  for (const set of service.sets) {
    await exists(
      resolve(root, "public", setImage(set.id).replace(/^\//, "")),
      `${set.id} cover`,
    );
    await exists(
      resolve(root, "public", setImage(set.id, true).replace(/^\//, "")),
      `${set.id} cover thumbnail`,
    );
  }
  for (const set of service.sets.slice(3)) {
    if (!set.visualSrc) issues.push(`${set.id}: sampul gaya awal hilang.`);
    else used.add(set.visualSrc.replace(".webp", "-small.webp"));
  }
  const d = buildStudioV2({
    serviceId: service.id,
    catalogVersion: legacy ? 2 : 3,
  });
  const minimumOptions: Partial<Record<string, Record<string, number>>> = {
    professional: {
      background: 24,
      wardrobe: 16,
      pose: 16,
      lens: 6,
      lighting: 12,
    },
    formal: { background: 16, lighting: 4 },
    prewedding: {
      couplePose: 16,
      wardrobe: 16,
      background: 24,
      decoration: 16,
      bouquet: 16,
      lens: 6,
      lighting: 12,
    },
    product: { background: 24, angle: 8, surface: 16, props: 16, lighting: 12 },
    food: {
      background: 24,
      angle: 8,
      surface: 16,
      props: 16,
      presentation: 16,
      lighting: 12,
    },
    ads: { layout: 16, palette: 16, typography: 6, lighting: 12 },
    social: { layout: 16, palette: 16, typography: 6, lighting: 12 },
    cinematic: { palette: 16, lighting: 12 },
    property: { palette: 16 },
    branding: { mark: 16, palette: 16, typography: 6 },
  };
  for (const [key, count] of Object.entries(minimumOptions[service.id] ?? {}))
    if ((d.fields.find((f) => f.key === key)?.options.length ?? 0) < count)
      issues.push(`${service.id}/${key}: minimum ${count} pilihan diperlukan.`);
  for (const f of d.fields)
    for (const o of f.options) {
      if (["photo", "layout"].includes(o.visual.kind) && o.visual.src)
        used.add(o.visual.src);
      if (o.visual.kind === "background")
        used.add("/assets/v2/options/people-cutout-small.webp");
    }
  const current = buildStudioV2({ serviceId: service.id, catalogVersion: 3 });
  for (const f of current.fields)
    for (const o of f.options)
      if (o.visual.kind === "photo" && o.visual.src) used.add(o.visual.src);
}
for (const src of used) {
  const isOption = /\/options(?:-v3)?\//.test(src);
  const isSet = src.includes("/sets-v3/");
  const id = src
    .split("/")
    .at(-1)!
    .replace(/-small\.webp$/, "");
  const row = src.startsWith("/assets/expanded/options/")
    ? expanded.find((o) => o.src === src.replace("-small.webp", ".webp"))
    : src.startsWith("/assets/v3/poses/")
      ? poses.find((o) => o.src === src.replace("-small.webp", ".webp"))
      : src.startsWith("/assets/v3/portfolio/")
        ? portfolio.find((o) => o.src === src.replace("-small.webp", ".webp"))
        : isSet
          ? styleAssets.find((o) => o.id === id)
          : isOption
            ? options.find((o) => o.id === id)
            : cases.find(
                (c) =>
                  src === c.before?.replace(".webp", "-small.webp") ||
                  src === c.after?.replace(".webp", "-small.webp"),
              );
  if (!row) issues.push(`Visual tanpa manifest: ${src}`);
  if ((isOption || isSet) && row?.src !== src.replace("-small.webp", ".webp"))
    issues.push(`Pemetaan ID dan aset tidak sesuai: ${src}`);
  await exists(resolve(root, "public", src.replace(/^\//, "")), src);
}
for (const row of manifests.flat()) {
  if (row.reviewed !== true || !row.reviewNotes || row.reviewNotes.length < 15)
    issues.push(`${row.id}: wajib ditinjau secara visual`);
  if (!row.prompt || !Array.isArray(row.references))
    issues.push(`${row.id}: catatan sumber belum lengkap`);
  for (const src of [row.src, row.before, row.after].filter(
    Boolean,
  ) as string[]) {
    await exists(resolve(root, "public", src.replace(/^\//, "")), row.id);
    await imageCheck(
      resolve(root, "public", src.replace(/^\//, "")),
      /^\/assets\/(v3|expanded)\//.test(src)
        ? 1000
        : /\/(?:sets|options)-v3\//.test(src)
          ? 800
          : row.src
            ? 700
            : 1000,
      row.id,
    );
    await exists(
      resolve(
        root,
        "public",
        src.replace(/^\//, "").replace(".webp", "-small.webp"),
      ),
      `${row.id} thumbnail`,
    );
    await imageCheck(
      resolve(
        root,
        "public",
        src.replace(/^\//, "").replace(".webp", "-small.webp"),
      ),
      /^\/assets\/(v3|expanded)\//.test(src) ? 450 : row.src ? 350 : 450,
      `${row.id} thumbnail`,
    );
  }
  for (const src of [
    row.source,
    row.beforeSource,
    row.afterSource,
    ...row.references,
  ].filter(Boolean) as string[])
    await exists(rebase(src), `${row.id} source`);
}
const releasedViral = publishedViral();
for (const meta of VIRAL_TEASERS) {
  const row = viral.find((item) => item.id === meta.id);
  if (row?.medium !== "photography")
    issues.push(`${meta.id}: contoh koleksi wajib berupa fotografi.`);
  if (row?.before !== meta.before || row?.after !== meta.after)
    issues.push(`${meta.id}: pemetaan contoh fotografi tidak sesuai metadata.`);
}
if (viral.length !== VIRAL_TEASERS.length)
  issues.push(
    "Manifest fotografi aktif harus sesuai koleksi yang diterbitkan.",
  );
if (releasedViral.length !== VIRAL_TEASERS.length)
  issues.push(
    "Metadata publik hanya boleh mencantumkan konten Viral yang sudah terbit dan tersedia.",
  );
try {
  const image = sharp(
    resolve(root, "public/assets/v2/options/people-cutout.webp"),
  );
  const metadata = await image.metadata();
  const stats = await image.stats();
  if (
    !metadata.hasAlpha ||
    stats.channels.at(-1)?.min !== 0 ||
    stats.channels.at(-1)?.max !== 255
  )
    issues.push("Subjek swatch wajib memiliki transparansi alpha yang nyata.");
} catch {
  issues.push("Subjek swatch transparan belum dapat divalidasi.");
}
await exists(
  resolve(root, "public/assets/brand/social-v4.png"),
  "Gambar Open Graph V2",
);
if (issues.length) {
  console.error(
    `Aset V2 belum lolos validasi (${issues.length}):\n${issues.join("\n")}`,
  );
  process.exit(1);
}
console.log(
  `Aset V2 valid: ${cases.length} pasangan jasa, ${viral.length} pasangan Viral, ${options.length} visual opsi dasar + ${expanded.length} foto opsi baru; ${used.size} aset opsi wajib ditemukan dan ditinjau.`,
);
