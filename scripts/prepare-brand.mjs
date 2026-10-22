import sharp from "sharp";
import { mkdir, readFile, copyFile, access } from "node:fs/promises";
const root = new URL("../", import.meta.url);
const manifest = JSON.parse(
  await readFile(new URL("design/generated-assets.json", root), "utf8"),
);
await mkdir(new URL("public/assets/brand/", root), { recursive: true });
await mkdir(new URL("public/assets/examples/", root), { recursive: true });
await mkdir(new URL("design/originals/", root), { recursive: true });
for (const [name, original] of Object.entries(manifest.files)) {
  const archived = new URL(`design/originals/${name}.png`, root);
  let file = original;
  try {
    await access(original);
    await copyFile(original, archived);
  } catch {
    file = archived.pathname;
  }
  if (name === "brand") {
    for (const size of [32, 64, 192, 512])
      await sharp(file)
        .trim()
        .resize(size, size, { fit: "contain", background: "#00000000" })
        .png()
        .toFile(new URL(`public/assets/brand/mark-${size}.png`, root).pathname);
  } else {
    await sharp(file)
      .resize({ width: 900, withoutEnlargement: true })
      .webp({ quality: 83 })
      .toFile(new URL(`public/assets/examples/${name}.webp`, root).pathname);
    await sharp(file)
      .resize({ width: 450, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(
        new URL(`public/assets/examples/${name}-small.webp`, root).pathname,
      );
  }
}
const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="630" fill="#faf8f5"/><circle cx="1100" cy="80" r="240" fill="#e5ddff"/><text x="150" y="110" font-family="sans-serif" font-size="40" font-weight="bold" fill="#252238">Aichemy</text><text x="72" y="240" font-family="sans-serif" font-size="68" font-weight="bold" fill="#252238">Ide kamu.</text><text x="72" y="325" font-family="sans-serif" font-size="68" font-weight="bold" fill="#5a43e8">Visual luar biasa.</text><text x="72" y="400" font-family="sans-serif" font-size="25" fill="#666174">Prompt builder visual untuk kreator Indonesia.</text><rect x="72" y="460" width="420" height="70" rx="20" fill="#5a43e8"/><text x="105" y="505" font-family="sans-serif" font-size="28" font-weight="bold" fill="white">Rp149.000 • Akses Lifetime</text></svg>`;
await sharp(Buffer.from(svg))
  .composite([
    {
      input: new URL("public/assets/brand/mark-64.png", root).pathname,
      left: 72,
      top: 57,
    },
    {
      input: await sharp(
        new URL("public/assets/examples/product.webp", root).pathname,
      )
        .resize(300, 410, { fit: "cover" })
        .toBuffer(),
      left: 825,
      top: 160,
    },
  ])
  .png()
  .toFile(new URL("public/assets/brand/social.png", root).pathname);
console.log("Aset merek dan contoh siap.");
