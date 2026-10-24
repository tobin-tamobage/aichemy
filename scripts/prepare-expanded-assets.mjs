import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import sharp from "sharp";
const jobs = JSON.parse(
  await readFile("design/expanded-options/jobs.json", "utf8"),
);
let reviews = {};
try {
  reviews = JSON.parse(
    await readFile("design/expanded-options/reviews.json", "utf8"),
  );
} catch {}
await mkdir("public/assets/expanded/options", { recursive: true });
const rows = [],
  tiles = [];
for (const job of jobs) {
  const source = `design/expanded-options/originals/${job.id}.png`;
  try {
    await access(source);
  } catch {
    continue;
  }
  for (const width of [1000, 450])
    await sharp(source)
      .resize(width, Math.round(width * 1.25), { fit: "cover" })
      .webp({ quality: width === 1000 ? 86 : 79 })
      .toFile(
        `public/assets/expanded/options/${job.id}${width === 450 ? "-small" : ""}.webp`,
      );
  const i = rows.length;
  tiles.push({
    input: await sharp(source)
      .resize(190, 238, { fit: "cover" })
      .png()
      .toBuffer(),
    left: (i % 6) * 190,
    top: Math.floor(i / 6) * 270,
  });
  const safe = job.id.replaceAll("&", "&amp;");
  const safeLabel = job.label
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  tiles.push({
    input: Buffer.from(
      `<svg width="190" height="32"><rect width="190" height="32" fill="white"/><text x="4" y="13" font-size="9" font-family="sans-serif" fill="#222">${safe.slice(0, 35)}</text><text x="4" y="26" font-size="10" font-family="sans-serif" fill="#333">${safeLabel}</text></svg>`,
    ),
    left: (i % 6) * 190,
    top: Math.floor(i / 6) * 270 + 238,
  });
  rows.push({
    ...job,
    source: `${process.cwd()}/${source}`,
    src: `/assets/expanded/options/${job.id}.webp`,
    tool: "built-in image_gen",
    reviewed: !!reviews[job.id],
    reviewNotes: reviews[job.id] ?? "Pending visual review before release.",
  });
}
if (rows.length) {
  await sharp({
    create: {
      width: 1140,
      height: Math.ceil(rows.length / 6) * 270,
      channels: 3,
      background: "#f7f4ef",
    },
  })
    .composite(tiles)
    .png()
    .toFile("design/expanded-options/contact-sheet.png");
  // Smaller sheets preserve inspection detail when viewed in conversation.
  for (let start = 0; start < rows.length; start += 18) {
    const height = Math.ceil(Math.min(18, rows.length - start) / 6) * 270;
    await sharp("design/expanded-options/contact-sheet.png")
      .extract({ left: 0, top: (start / 6) * 270, width: 1140, height })
      .png()
      .toFile(
        `design/expanded-options/review-${Math.floor(start / 18) + 1}.png`,
      );
  }
}
await writeFile(
  "design/expanded-options/manifest.json",
  JSON.stringify(rows, null, 2) + "\n",
);
console.log(
  `${rows.length}/${jobs.length} photos prepared; ${rows.filter((r) => r.reviewed).length} reviewed.`,
);
