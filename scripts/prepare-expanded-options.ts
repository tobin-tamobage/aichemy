import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { EXPANDED_PHOTOS, expandedPhotoId } from "../server/expanded-options";

await mkdir("design/expanded-options/originals", { recursive: true });
const jobs = EXPANDED_PHOTOS.flatMap((series) =>
  series.rows.map(([value, label, hint, instruction, group]) => ({
    id: expandedPhotoId(series, value),
    service: series.service,
    field: series.field,
    value: series.replaceExisting ? value : `more-${value}`,
    label,
    hint,
    group,
    comparisonSeries: `${series.service}-${series.field}`,
    references: [resolve(series.reference)],
    prompt: `Use case: photorealistic-natural\nAsset type: one photographic visual-picker example for Aichemy.\nInput image: identity/object and comparison-scene reference only.\nPrimary request: ${instruction}\nInvariants: ${series.invariant}\nStyle: realistic premium commercial photography, believable texture and anatomy. A single image, portrait 4:5 composition, no labels, text, watermark, collage or UI. Not a before-after comparison. The named option must be immediately legible.`,
  })),
);
await writeFile(
  "design/expanded-options/jobs.json",
  JSON.stringify(jobs, null, 2) + "\n",
);
console.log(`${jobs.length} distinct photographic options prepared.`);
