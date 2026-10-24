import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Asset-only ingestion and resizing. All semantic edits are built-in image_gen.
const root = path.resolve(import.meta.dirname, "..");
const projectSource = (p) =>
  p.includes("/design/")
    ? path.join(root, "design", p.split("/design/")[1])
    : p;
const originals = path.join(root, "design/v2/cases-originals");
const progressPath = path.join(originals, "progress.json");
const allowedKinds = new Set(["case", "viral"]);
const read = async (p, fallback) =>
  JSON.parse(
    await fs.readFile(p, "utf8").catch((e) => {
      if (e.code === "ENOENT") return JSON.stringify(fallback);
      throw e;
    }),
  );
const write = async (p, data) =>
  fs.writeFile(p, `${JSON.stringify(data, null, 2)}\n`);
await fs.mkdir(originals, { recursive: true });
const [command, ...args] = process.argv.slice(2);
const progress = await read(progressPath, {});
if (command === "ingest") {
  const [id, input, prompt, referencesJSON = "[]"] = args;
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error("Invalid original ID");
  const destination = path.join(
    originals,
    `${id}${path.extname(input) || ".png"}`,
  );
  if (path.resolve(input) !== destination)
    await fs.copyFile(input, destination);
  progress[id] = {
    path: destination,
    prompt,
    references: JSON.parse(referencesJSON),
  };
  await write(progressPath, progress);
  console.log(JSON.stringify({ id, path: destination }));
} else if (command === "pair") {
  const [kind, id, beforeID, afterID, reviewNotes] = args;
  if (!allowedKinds.has(kind) || !/^[a-z0-9-]+$/.test(id))
    throw new Error("Invalid pair");
  const before = progress[beforeID] && {
      ...progress[beforeID],
      path: projectSource(progress[beforeID].path),
    },
    after = progress[afterID] && {
      ...progress[afterID],
      path: projectSource(progress[afterID].path),
    };
  if (!before || !after || !reviewNotes)
    throw new Error("Missing reviewed source");
  const folder = kind === "case" ? "cases" : "viral";
  const out = path.join(root, "public/assets/v2", folder);
  await fs.mkdir(out, { recursive: true });
  for (const [side, source] of [
    ["before", before],
    ["after", after],
  ]) {
    await sharp(source.path)
      .rotate()
      .resize({ width: 1000 })
      .webp({ quality: 82, effort: 6 })
      .toFile(path.join(out, `${id}-${side}.webp`));
    await sharp(source.path)
      .rotate()
      .resize({ width: 450 })
      .webp({ quality: 82, effort: 6 })
      .toFile(path.join(out, `${id}-${side}-small.webp`));
  }
  const manifestPath = path.join(
    root,
    `design/v2/${kind === "case" ? "case" : "viral"}-assets.json`,
  );
  const manifest = await read(manifestPath, []);
  const item = {
    id,
    kind,
    before: `/assets/v2/${folder}/${id}-before.webp`,
    after: `/assets/v2/${folder}/${id}-after.webp`,
    beforeSource: before.path,
    afterSource: after.path,
    prompt: `Synthetic illustrative AI example, not a real customer or outcome claim.\nBEFORE source preparation:\n${before.prompt}\nAFTER generation or edit:\n${after.prompt}`,
    references: [
      ...new Set([before.path, ...before.references, ...after.references]),
    ],
    reviewed: true,
    reviewNotes,
    tool: "built-in image_gen",
  };
  const index = manifest.findIndex((x) => x.id === id);
  if (index < 0) manifest.push(item);
  else manifest[index] = item;
  await write(manifestPath, manifest);
  console.log(JSON.stringify({ id, kind, pairsInManifest: manifest.length }));
} else if (command === "provenance") {
  const historic = await read(
    path.join(root, "design/generated-assets.json"),
    {},
  );
  for (const [name, useCase, prompt] of historic.prompts) {
    const record = progress[`original-${name}`];
    if (record)
      record.prompt = `Historical built-in image_gen prompt, recorded in design/generated-assets.json. Use case: ${useCase}. ${prompt}`;
  }
  if (progress["original-relight"]) {
    progress["original-relight"].prompt =
      `Historical built-in image_gen edit prompt, recorded in design/generated-assets.json: ${historic.relightEditPrompt}`;
    progress["original-relight"].references = [
      progress["original-relight-before"].path,
    ];
  }
  await write(progressPath, progress);
  for (const kind of ["case", "viral"]) {
    const manifestPath = path.join(root, `design/v2/${kind}-assets.json`);
    const manifest = await read(manifestPath, []);
    for (const item of manifest) {
      const before = Object.values(progress).find(
        (x) => x.path === item.beforeSource,
      );
      const after = Object.values(progress).find(
        (x) => x.path === item.afterSource,
      );
      if (before && after) {
        item.prompt = `Synthetic illustrative AI example, not a real customer or outcome claim.\nBEFORE source preparation:\n${before.prompt}\nAFTER generation or edit:\n${after.prompt}`;
        item.references = [
          ...new Set([before.path, ...before.references, ...after.references]),
        ];
      }
    }
    if (manifest.length) await write(manifestPath, manifest);
  }
  console.log(
    JSON.stringify({
      historicalOriginalPromptsUpdated: historic.prompts.length + 1,
    }),
  );
} else if (command === "audit") {
  for (const kind of ["case", "viral"]) {
    const manifest = await read(
      path.join(root, `design/v2/${kind}-assets.json`),
      [],
    );
    let bytes = 0;
    for (const item of manifest) {
      for (const side of ["before", "after"]) {
        for (const small of [false, true]) {
          const relative = item[side].replace(
            /\.webp$/,
            `${small ? "-small" : ""}.webp`,
          );
          const p = path.join(root, "public", relative);
          const meta = await sharp(p).metadata();
          if (meta.format !== "webp" || meta.width !== (small ? 450 : 1000))
            throw new Error(`Bad output: ${p}`);
          bytes += (await fs.stat(p)).size;
        }
      }
      await fs.access(projectSource(item.beforeSource));
      await fs.access(projectSource(item.afterSource));
    }
    console.log(
      JSON.stringify({
        kind,
        pairs: manifest.length,
        files: manifest.length * 4,
        bytes,
      }),
    );
  }
} else throw new Error("Expected ingest, pair, or audit");
