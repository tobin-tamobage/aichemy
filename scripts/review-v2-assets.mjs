import sharp from "sharp";
import { mkdir, readFile } from "node:fs/promises";
const kind = process.argv[2] ?? "case";
if (!["case", "viral", "option"].includes(kind))
  throw new Error("Pilih case, viral, atau option.");
const rows = JSON.parse(
  await readFile(`design/v2/${kind}-assets.json`, "utf8"),
);
if (kind === "option")
  try {
    rows.push(
      ...JSON.parse(
        await readFile("design/v2/food-option-assets.json", "utf8"),
      ),
    );
  } catch {}
const folder = "artifacts/v2-review";
await mkdir(folder, { recursive: true });
const pageSize = 12;
const cellWidth = 360;
const cellHeight = 260;
for (let start = 0; start < rows.length; start += pageSize) {
  const page = rows.slice(start, start + pageSize);
  const overlays = [];
  for (const [index, row] of page.entries()) {
    const left = (index % 3) * cellWidth;
    const top = Math.floor(index / 3) * cellHeight;
    const paths = kind === "option" ? [row.src] : [row.before, row.after];
    for (const [side, src] of paths.entries())
      overlays.push({
        input: await sharp(`public${src}`)
          .resize({
            width: kind === "option" ? 360 : 180,
            height: 225,
            fit: "contain",
            background: "#f3f0eb",
          })
          .toBuffer(),
        left: left + side * 180,
        top,
      });
    const title = String(row.id)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;");
    overlays.push({
      input: Buffer.from(
        `<svg width="360" height="35"><rect width="360" height="35" fill="white"/><text x="10" y="23" font-family="sans-serif" font-size="13" fill="#282136">${title}</text></svg>`,
      ),
      left,
      top: top + 225,
    });
  }
  const out = `${folder}/${kind}-sheet-${Math.floor(start / pageSize) + 1}.jpg`;
  await sharp({
    create: {
      width: 1080,
      height: Math.ceil(page.length / 3) * cellHeight,
      channels: 3,
      background: "#e6e1da",
    },
  })
    .composite(overlays)
    .jpeg({ quality: 92 })
    .toFile(out);
  console.log(out);
}
