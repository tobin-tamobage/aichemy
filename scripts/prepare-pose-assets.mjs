import { readFile, mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
const jobs = JSON.parse(
  await readFile("design/v3/pose-bank/jobs.json", "utf8"),
);
let reviews = {};
try {
  reviews = JSON.parse(
    await readFile("design/v3/pose-bank/reviews.json", "utf8"),
  );
} catch {}
await mkdir("public/assets/v3/poses", { recursive: true });
const tiles = [],
  rows = [];
for (let i = 0; i < jobs.length; i++) {
  const j = jobs[i],
    source = `design/v3/pose-bank/originals/${j.id}.png`;
  for (const width of [1000, 450])
    await sharp(source)
      .resize(width, Math.round(width * 1.25), { fit: "cover" })
      .webp({ quality: width === 1000 ? 87 : 80 })
      .toFile(
        `public/assets/v3/poses/${j.id}${width === 450 ? "-small" : ""}.webp`,
      );
  const thumb = await sharp(source)
    .resize(300, 375, { fit: "cover" })
    .png()
    .toBuffer();
  tiles.push({
    input: thumb,
    left: (i % 3) * 300,
    top: Math.floor(i / 3) * 411,
  });
  tiles.push({
    input: Buffer.from(
      `<svg width="300" height="36"><rect width="300" height="36" fill="white"/><text x="8" y="24" font-family="sans-serif" font-size="15" fill="#222">${j.label.replaceAll("&", "&amp;")}</text></svg>`,
    ),
    left: (i % 3) * 300,
    top: Math.floor(i / 3) * 411 + 375,
  });
  rows.push({
    ...j,
    source: `${process.cwd()}/${source}`,
    src: `/assets/v3/poses/${j.id}.webp`,
    tool: "built-in image_gen",
    reviewed: !!reviews[j.id],
    reviewNotes: reviews[j.id] ?? "Pending pose and identity review.",
  });
}
await sharp({
  create: {
    width: 900,
    height: Math.ceil(jobs.length / 3) * 411,
    channels: 3,
    background: "#f6f3ef",
  },
})
  .composite(tiles)
  .png()
  .toFile("design/v3/pose-bank/contact-sheet.png");
await writeFile(
  "design/v3/pose-bank/manifest.json",
  JSON.stringify(rows, null, 2) + "\n",
);
console.log(`${rows.length} pose references prepared`);
