import { test } from "node:test";
import assert from "node:assert/strict";
import { buildStudioV2, demoV2 } from "../server/engine-v2";
import {
  LEGACY_SERVICES as SERVICES,
  SERVICES as ALL_SERVICES,
  SETS,
  VIRAL_TEASERS,
} from "../shared/v2-catalog";
import { businessSimulation, emptyBrief, isV2Draft } from "../shared/v2";
import { changeSet, legacyCopy, presetStyle } from "../shared/v2-state";
import { publishedViral, resolveViral } from "../server/viral";
import { INCOME_EXAMPLES, PRODUCT_COUNTS } from "../shared/marketing";
test("angka penawaran mengikuti katalog dan contoh omzet dihitung tanpa klaim laba", () => {
  assert.deepEqual(PRODUCT_COUNTS, {
    services: 18,
    styles: 218,
    photographyPrompts: 18,
  });
  assert.deepEqual(
    INCOME_EXAMPLES.map((item) => item.orders * item.price),
    [250000, 750000, 600000],
  );
  for (const item of INCOME_EXAMPLES)
    assert.ok(SETS.some((set) => set.id === item.image));
});
test("11 jasa, 176 gaya awal unik, dan 33 studi kasus tetap tersedia", () => {
  assert.equal(SERVICES.length, 11);
  assert.equal(SETS.length, 33);
  assert.equal(
    SERVICES.reduce((sum, service) => sum + service.sets.length, 0),
    176,
  );
  assert.equal(
    new Set(SERVICES.flatMap((service) => service.sets.map((set) => set.id)))
      .size,
    176,
  );
  assert.equal(new Set(SETS.map((s) => s.id)).size, 33);
  for (const service of SERVICES)
    for (const set of service.sets) {
      const d = buildStudioV2({ serviceId: service.id, setId: set.id });
      assert.equal(d.engineVersion, 2);
      assert.equal(
        d.issues.length,
        0,
        `${set.id}: ${JSON.stringify(d.issues)}`,
      );
      assert.ok(d.document.text.length > 400);
      assert.equal(d.document.blocks[0].id, "task");
      assert.equal(d.document.blocks.at(-1)?.id, "constraints");
      assert.ok(!/undefined|\[object Object\]/.test(d.document.text));
      for (const f of d.fields)
        assert.ok(
          f.options.some(
            (o) => o.value === d.state.selections[f.key] && !o.disabledReason,
          ),
        );
    }
});
test("katalog visual V2 punya galeri pasangan yang sesuai dan semua 176 set valid", () => {
  for (const service of SERVICES) {
    assert.equal(service.sets.length, 16, service.id);
    for (const set of service.sets) {
      const descriptor = buildStudioV2({
        serviceId: service.id,
        catalogVersion: 2,
        setId: set.id,
      });
      assert.deepEqual(
        descriptor.issues,
        [],
        `${set.id}: ${JSON.stringify(descriptor.issues)}`,
      );
    }
  }
  const wedding = buildStudioV2({ serviceId: "prewedding", catalogVersion: 2 });
  const counts = Object.fromEntries(
    wedding.fields.map((field) => [field.key, field.options.length]),
  );
  assert.equal(counts.couplePose, 16);
  assert.equal(counts.wardrobe, 16);
  assert.equal(counts.background, 24);
  assert.equal(counts.decoration, 16);
  assert.equal(counts.bouquet, 16);
  assert.equal(counts.lens, 6);
  assert.equal(counts.lighting, 12);
  for (const key of ["couplePose", "wardrobe", "background", "lens"]) {
    const field = wedding.fields.find((item) => item.key === key)!;
    assert.ok(
      field.options.every(
        (item) =>
          item.visual.kind === "photo" || item.visual.kind === "background",
      ),
    );
    if (key !== "background")
      assert.ok(
        field.options.every((item) => {
          const src = item.visual.src ?? "";
          return (
            src.includes("prewedding-") ||
            (key === "couplePose" && src.includes("couple-pose-"))
          );
        }),
        `${key}: wedding-only visual examples`,
      );
  }
  const professional = buildStudioV2({
    serviceId: "professional",
    catalogVersion: 2,
  });
  assert.equal(
    professional.fields.find((f) => f.key === "background")?.options.length,
    24,
  );
  assert.ok(
    professional.fields
      .find((f) => f.key === "background")
      ?.options.filter((item) => item.visual.kind === "photo")
      .every((item) => item.visual.src?.includes("professional-background-")),
  );
  assert.equal(
    professional.fields.find((f) => f.key === "wardrobe")?.options.length,
    16,
  );
  assert.equal(
    professional.fields.find((f) => f.key === "pose")?.options.length,
    16,
  );
  assert.equal(
    professional.fields.find((f) => f.key === "lighting")?.options.length,
    12,
  );
  assert.equal(
    professional.fields.find((f) => f.key === "lens")?.options.length,
    6,
  );
  const product = buildStudioV2({ serviceId: "product", catalogVersion: 2 });
  assert.equal(
    product.fields.find((f) => f.key === "background")?.options.length,
    24,
  );
  assert.ok(
    product.fields
      .find((f) => f.key === "background")
      ?.options.filter((item) => item.visual.kind === "photo")
      .every((item) => item.visual.src?.includes("product-background-")),
  );
  assert.equal(
    product.fields.find((f) => f.key === "surface")?.options.length,
    16,
  );
  assert.equal(
    product.fields.find((f) => f.key === "angle")?.options.length,
    8,
  );
  assert.equal(
    product.fields.find((f) => f.key === "props")?.options.length,
    16,
  );
  assert.equal(
    product.fields.find((f) => f.key === "lighting")?.options.length,
    12,
  );
  const food = buildStudioV2({ serviceId: "food", catalogVersion: 2 });
  assert.equal(
    food.fields.find((f) => f.key === "background")?.options.length,
    24,
  );
  assert.ok(
    food.fields
      .find((f) => f.key === "background")
      ?.options.filter((item) => item.visual.kind === "photo")
      .every((item) => item.visual.src?.includes("food-environment-")),
  );
  assert.equal(
    food.fields.find((f) => f.key === "presentation")?.options.length,
    16,
  );
  assert.equal(food.fields.find((f) => f.key === "angle")?.options.length, 8);
  assert.equal(
    food.fields.find((f) => f.key === "surface")?.options.length,
    16,
  );
  assert.equal(food.fields.find((f) => f.key === "props")?.options.length, 16);
  assert.equal(
    food.fields.find((f) => f.key === "lighting")?.options.length,
    12,
  );
  const ads = buildStudioV2({ serviceId: "ads", catalogVersion: 2 });
  assert.equal(ads.fields.find((f) => f.key === "layout")?.options.length, 16);
  assert.equal(ads.fields.find((f) => f.key === "palette")?.options.length, 16);
  assert.equal(
    ads.fields.find((f) => f.key === "lighting")?.options.length,
    12,
  );
  const branding = buildStudioV2({ serviceId: "branding", catalogVersion: 2 });
  assert.equal(
    branding.fields.find((f) => f.key === "mark")?.options.length,
    16,
  );
});
test("setiap opsi katalog V2 memperbarui tepat satu blok prompt", () => {
  let checked = 0;
  for (const service of SERVICES) {
    const baseline = buildStudioV2({
      serviceId: service.id,
      catalogVersion: 2,
    });
    for (const field of baseline.fields) {
      for (const choice of field.options.filter(
        (item) =>
          !item.disabledReason &&
          item.value !== baseline.state.selections[field.key],
      )) {
        const next = buildStudioV2({
          ...baseline.state,
          selections: {
            ...baseline.state.selections,
            [field.key]: choice.value,
          },
        });
        const changed = next.document.blocks.filter(
          (block) =>
            baseline.document.blocks.find((old) => old.id === block.id)
              ?.text !== block.text,
        );
        assert.equal(
          changed.length,
          1,
          `${service.id}/${field.key}/${choice.value}`,
        );
        assert.equal(next.state.selections[field.key], choice.value);
        checked++;
      }
    }
  }
  assert.ok(checked > 400);
});
test("setiap opsi yang diaktifkan memengaruhi tepat satu blok, tanpa instruksi tersembunyi", () => {
  let count = 0;
  for (const service of SERVICES) {
    const baseline = buildStudioV2({ serviceId: service.id });
    for (const field of baseline.fields) {
      for (const option of field.options.filter(
        (o) =>
          !o.disabledReason && o.value !== baseline.state.selections[field.key],
      )) {
        const d = buildStudioV2({
          ...baseline.state,
          selections: {
            ...baseline.state.selections,
            [field.key]: option.value,
          },
        });
        const changed = d.document.blocks.filter(
          (b) =>
            baseline.document.blocks.find((p) => p.id === b.id)?.text !==
            b.text,
        );
        assert.equal(
          changed.length,
          1,
          `${service.id}/${field.key}/${option.value}`,
        );
        assert.equal(d.state.selections[field.key], option.value);
        count++;
      }
    }
    const hidden = buildStudioV2({
      ...baseline.state,
      selections: {
        ...baseline.state.selections,
        imaginaryProp: "unicorn-secret",
      },
    });
    assert.ok(!hidden.document.text.includes("unicorn-secret"));
    assert.ok(hidden.issues.some((i) => i.field === "imaginaryProp"));
  }
  assert.ok(count > 200);
});
test("prioritas eksplisit, aturan formal, dan referensi tidak saling bertentangan", () => {
  const d = buildStudioV2({
    serviceId: "professional",
    setId: "professional-linkedin",
    selections: { background: "red", lens: "35" },
  });
  assert.equal(d.state.selections.background, "red");
  assert.equal(d.state.selections.lens, "35");
  const formal = buildStudioV2({
    serviceId: "formal",
    selections: { pose: "standing", lens: "35", expression: "thoughtful" },
  });
  assert.equal(formal.state.selections.pose, "front");
  assert.notEqual(formal.state.selections.lens, "35");
  assert.equal(formal.issues.length, 3);
  assert.ok(!formal.document.text.includes("standing pose"));
  for (const s of SERVICES) {
    const noRef = buildStudioV2({ serviceId: s.id, referenceMode: "none" });
    assert.ok(!noRef.document.blocks.some((b) => b.id === "reference"));
    assert.ok(!/attached|reference photo/i.test(noRef.document.text), s.id);
  }
  const couple = buildStudioV2({
    serviceId: "prewedding",
    referenceMode: "individuals",
  });
  assert.match(
    couple.document.text,
    /photo 1 identifies person A and photo 2 identifies person B/,
  );
  assert.throws(() =>
    buildStudioV2({ serviceId: "professional", referenceMode: "individuals" }),
  );
  assert.throws(() =>
    buildStudioV2({ serviceId: "product", setId: "formal-cv" }),
  );
});
test("aturan jasa tidak melarang hasil yang diminta atau menambah label pada makanan", () => {
  const food = buildStudioV2({
    serviceId: "food",
    selections: { angle: "eye" },
  });
  assert.ok(!food.document.text.includes("readable front label"));
  assert.ok(!food.document.text.includes("Inspect faces"));
  const branding = buildStudioV2({ serviceId: "branding" });
  assert.ok(!branding.document.text.includes("No invented logos"));
  assert.equal(branding.state.brief.brand, "");
  assert.ok(branding.document.text.includes("Create an original"));
  const emptyBrand = buildStudioV2({
    serviceId: "branding",
    brief: emptyBrief(),
  });
  assert.deepEqual(emptyBrand.issues, []);
  assert.match(
    emptyBrand.document.text,
    /without inventing letters or a brand name/,
  );
});
test("brief, nama merek dan teks iklan tetap verbatim ketika set/preset berubah", () => {
  const brief = {
    ...emptyBrief(),
    subject: "Botol kopi milik klien — bukan teh.",
    brand: "Kopi “Pagi!”",
    text: "Diskon 10% hanya 1–3 Mei.",
    required: "Logo jangan diubah.",
    preserve: "Bentuk tutup tetap.",
  };
  const d = buildStudioV2({ serviceId: "ads", brief });
  for (const v of Object.values(brief).filter(Boolean))
    assert.ok(d.document.text.includes(v));
  const changed = changeSet(
    d.state,
    SERVICES.find((s) => s.id === "ads")!.sets[1],
  );
  assert.deepEqual(changed.brief, brief);
  const preset = buildStudioV2({
    serviceId: "ads",
    setId: "ads-story",
    brief: { ...emptyBrief(), subject: "JANGAN TIMPA" },
  }).state;
  assert.deepEqual(presetStyle(changed, preset).brief, brief);
  const empty = buildStudioV2({ serviceId: "ads" });
  assert.ok(
    !/50%|five.star|best.selling|guaranteed benefit/i.test(empty.document.text),
  );
  assert.match(empty.document.text, /Do not generate promotional copy/);
});
test("salinan V1 eksplisit menyimpan data asli dan manual tanpa mutasi", () => {
  const source = {
    id: crypto.randomUUID(),
    kind: "draft" as const,
    studioId: "product",
    name: "Draft lama",
    updatedAt: new Date().toISOString(),
    data: {
      state: {
        productName: "Cangkir buatan tangan",
        unknown: "tetap tersimpan",
      },
      manual: "MY EXACT PROMPT",
    },
  };
  const before = structuredClone(source);
  const result = legacyCopy(source);
  assert.equal(isV2Draft(result), true);
  assert.equal(
    isV2Draft({ ...result, state: { ...result.state, selections: "rusak" } }),
    false,
  );
  assert.equal(
    isV2Draft({ ...result, state: { ...result.state, brief: null } }),
    false,
  );
  assert.deepEqual(source, before);
  assert.equal(result.manual, "MY EXACT PROMPT");
  assert.equal(result.state.brief.subject, "Cangkir buatan tangan");
  assert.deepEqual(result.legacySource?.data, source.data);
  assert.equal(result.engineVersion, 2);
});
test("demo publik dibatasi 3 jasa dan opsi yang diizinkan, memakai compiler yang sama", () => {
  for (const serviceId of ["professional", "formal", "product"] as const) {
    const demo = demoV2({
      serviceId,
      selections: { background: "gray", lighting: "window" },
    });
    const full = buildStudioV2({
      serviceId,
      selections: { background: "gray", lighting: "window" },
    });
    assert.equal(demo.document.text, full.document.text);
    assert.ok(demo.fields.length < full.fields.length);
  }
  assert.throws(() => demoV2({ serviceId: "prewedding" }));
  assert.throws(() =>
    demoV2({ serviceId: "product", selections: { props: "botanical" } }),
  );
});
test("18 prompt hanya fotografi, sumber riset tersedia, dan teks premium tetap privat", () => {
  const viral = publishedViral();
  assert.equal(viral.length, 18);
  assert.equal(VIRAL_TEASERS.length, 18);
  for (const v of viral) {
    assert.ok(v.prompt.length > 200);
    assert.ok(!/\{\{|\[INSERT|TODO/.test(v.prompt));
    assert.equal(v.status, "published");
    assert.ok(v.instructions.length >= 3);
    assert.equal(v.medium, "photography");
    assert.match(v.prompt, /photograph|photographic/i);
    if (v.curation === "research") {
      assert.match(v.research!.url, /^https:\/\//);
      assert.ok(v.research!.note.length > 30);
      assert.match(v.research!.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
    }
    assert.ok(
      ![
        "collectible",
        "diorama",
        "clay",
        "papercut",
        "character",
        "giant-product",
      ].includes(v.id),
    );
  }
  assert.ok(viral.some((v) => v.curation === "research"));
  assert.ok(viral.some((v) => v.curation === "aichemy"));
  assert.throws(
    () =>
      resolveViral(
        [{ ...VIRAL_TEASERS[0], curation: "research", research: undefined }],
        [
          {
            id: VIRAL_TEASERS[0].id,
            prompt: "Valid photographic prompt. ".repeat(15),
          },
        ],
      ),
    /Sumber riset/,
  );
  assert.ok(!JSON.stringify(VIRAL_TEASERS).includes("Transform the person"));
  for (const item of viral)
    assert.ok(!JSON.stringify(VIRAL_TEASERS).includes(item.prompt));
});
test("konten Viral draft atau bertanggal mendatang tidak dikirim", () => {
  const meta = VIRAL_TEASERS.slice(0, 2);
  const content = meta.map((m, i) => ({
    id: m.id,
    prompt: "Valid private curated prompt. ".repeat(15),
    status: i ? "published" : "draft",
    publishedAt: i ? "2099-01-01" : "2026-10-22",
  }));
  assert.equal(resolveViral(meta, content, "2026-10-22").length, 0);
  assert.equal(resolveViral(meta, content, "2100-01-01").length, 1);
});
test("simulasi menampilkan nol, rugi, dan biaya pembelian hanya bulan pertama", () => {
  assert.deepEqual(businessSimulation(75000, 4, 10000, 50000), {
    revenue: 300000,
    costs: 90000,
    difference: 210000,
    firstMonth: 61000,
  });
  assert.equal(businessSimulation(0, 0, 0, 0).firstMonth, -149000);
  assert.equal(businessSimulation(10000, 1, 20000, 50000).difference, -60000);
  assert.equal(businessSimulation(NaN, -1, Infinity, 0).revenue, 0);
});
