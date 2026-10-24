import { z } from "zod";
import content from "./content/viral-prompts.json";
import { VIRAL_TEASERS } from "../shared/v2-catalog";
import type { ViralContent, ViralMetadata } from "../shared/v2";
const schema = z.array(
  z
    .object({
      id: z.string().regex(/^[a-z-]+$/),
      prompt: z.string().min(200).max(10000),
      status: z.enum(["published", "draft"]).default("published"),
      publishedAt: z.iso.date().optional(),
    })
    .strict(),
);
export function resolveViral(
  metadata: ViralMetadata[],
  input: unknown,
  today = new Date().toISOString().slice(0, 10),
): ViralContent[] {
  const rows = schema.parse(input);
  for (const meta of metadata) {
    if (meta.medium !== "photography")
      throw new Error(`Koleksi hanya menerima fotografi: ${meta.id}`);
    if (meta.curation === "research" && !meta.research)
      throw new Error(`Sumber riset fotografi belum tersedia: ${meta.id}`);
    if (meta.research) {
      z.object({
        url: z.url({ protocol: /^https$/ }),
        title: z.string().min(5),
        checkedAt: z.iso.date(),
        publishedAt: z.iso.date().optional(),
        basis: z.enum(["trend-report", "technique"]),
        note: z.string().min(30),
      }).parse(meta.research);
    }
  }
  if (new Set(rows.map((r) => r.id)).size !== rows.length)
    throw new Error("ID Prompt Viral duplikat.");
  if (
    rows.some(
      (r) =>
        r.status === "published" && /\{\{|\[INSERT|<YOUR|TODO/.test(r.prompt),
    )
  )
    throw new Error("Prompt Viral belum siap pakai.");
  return metadata
    .filter((m) => m.status === "published" && m.publishedAt <= today)
    .flatMap((meta) => {
      const row = rows.find((r) => r.id === meta.id);
      if (!row) throw new Error(`Konten Viral hilang: ${meta.id}`);
      if (
        row.status !== "published" ||
        (row.publishedAt && row.publishedAt > today)
      )
        return [];
      return [
        {
          ...meta,
          prompt: row.prompt,
          instructions: [
            "Siapkan foto referensi sesuai panduan dan pastikan kamu memiliki izin penggunaannya.",
            "Salin prompt, lalu tempel bersama foto pada generator gambar AI pilihanmu. Biaya generator terpisah.",
            "Periksa identitas, bentuk, tulisan, dan lisensi hasil. Rapikan hasil sebelum ditawarkan atau diserahkan ke klien.",
          ],
        },
      ];
    });
}
export const publishedViral = () => resolveViral(VIRAL_TEASERS, content);
