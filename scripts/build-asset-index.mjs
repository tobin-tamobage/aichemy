import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
const paths = [];
async function walk(folder) {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) await walk(path);
    else paths.push("/" + path.replace(/^public\//, ""));
  }
}
await walk("public/images");
await writeFile("shared/asset-index.json", JSON.stringify(paths));
const presets = [];
for (const entry of await readdir("public/presets", { recursive: true })) {
  if (!entry.endsWith(".json") || entry.endsWith("index.json")) continue;
  const preset = JSON.parse(
    await readFile(join("public/presets", entry), "utf8"),
  );
  if (preset.name && preset.data)
    presets.push({
      id: preset.id,
      name: preset.name,
      state: preset.data,
      studioId: entry.includes("/") ? entry.split("/")[0] : "cinematic",
    });
}
await mkdir("server/data", { recursive: true });
await writeFile("server/data/bundled-presets.json", JSON.stringify(presets));
