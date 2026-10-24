import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SERVICES,
  ALL_STUDIO_SETS,
  LEGACY_SERVICES,
  setImage,
  favoriteServiceId,
} from "../shared/v2-catalog";
import { NEW_SERVICES, CURRENT_CATALOG } from "../shared/services-v3";
import { buildStudioV2 } from "../server/engine-v2";
import { changeSet, presetStyle } from "../shared/v2-state";
import { emptyBrief } from "../shared/v2";
import { EXPANDED_PHOTOS, expandedPhotoId } from "../server/expanded-options";

test("perluasan menambah pilihan nyata per pengaturan, bukan angka gaya awal", () => {
  const minima: Record<string, Record<string, number>> = {
    pets: {
      concept: 12,
      background: 36,
      petPose: 12,
      lighting: 12,
      petProps: 10,
      framing: 12,
      treatment: 16,
    },
    professional: {
      background: 48,
      pose: 20,
      expression: 8,
      framing: 16,
      treatment: 16,
    },
    prewedding: {
      background: 48,
      couplePose: 20,
      wardrobe: 16,
      decoration: 16,
    },
    formal: { background: 40, wardrobe: 11 },
    jewelry: { concept: 12, surface: 12, lighting: 12, background: 32 },
    property: { view: 10, lighting: 10, style: 14 },
    branding: { mark: 32, typography: 12, palette: 32 },
    ads: { layout: 24, typography: 12, copyArea: 12 },
    social: { layout: 24, typography: 12, copyArea: 12 },
    fashion: { concept: 17 },
    beauty: { concept: 12 },
    creator: { concept: 12 },
    graduation: { concept: 12 },
    family: { concept: 12 },
  };
  for (const service of SERVICES) {
    const d = buildStudioV2({ serviceId: service.id, catalogVersion: 3 });
    for (const [key, minimum] of Object.entries(minima[service.id] ?? {})) {
      const count =
        d.fields
          .find((f) => f.key === key)
          ?.options.filter((o) => o.value !== "__skip").length ?? 0;
      assert.ok(
        count >= minimum,
        `${service.id}/${key}: ${count} < ${minimum}`,
      );
    }
    assert.equal(
      d.fields.find((f) => f.key === "ratio")!.options.length - 1,
      12,
    );
    for (const f of d.fields)
      assert.equal(
        new Set(f.options.map((o) => o.value)).size,
        f.options.length,
        `${service.id}/${f.key} duplicated values`,
      );
  }
  const ids = EXPANDED_PHOTOS.flatMap((s) =>
    s.rows.map(([value]) => expandedPhotoId(s, value)),
  );
  assert.equal(ids.length, 126);
  assert.equal(new Set(ids).size, ids.length);
});

test("pengaturan baru dimulai dari Tanpa; kontrol pose tidak bocor ke beauty atau relight", () => {
  const pets = buildStudioV2({ serviceId: "pets", catalogVersion: 3 });
  for (const key of ["petProps", "framing", "depth"])
    assert.equal(pets.state.selections[key], "__skip");
  for (const serviceId of ["beauty", "relight"] as const) {
    const d = buildStudioV2({ serviceId, catalogVersion: 3 });
    assert.ok(!d.fields.some((f) => f.key === "pose"));
  }
  const jewelry = buildStudioV2({
    serviceId: "jewelry",
    catalogVersion: 3,
    selections: { angle: "cap-detail" },
  });
  assert.ok(!/bottle|cap detail/i.test(jewelry.document.text));
});

test("18 jasa dan 218 gaya unik; seluruh gaya katalog baru koheren tanpa mengisi formulir", () => {
  assert.equal(SERVICES.length, 18);
  assert.equal(ALL_STUDIO_SETS.length, 218);
  assert.equal(new Set(ALL_STUDIO_SETS.map((s) => s.id)).size, 218);
  for (const s of SERVICES)
    for (const set of s.sets) {
      const d = buildStudioV2({
        catalogVersion: CURRENT_CATALOG,
        serviceId: s.id,
        setId: set.id,
      });
      assert.deepEqual(d.issues, [], `${set.id}: ${JSON.stringify(d.issues)}`);
      assert.ok(d.document.text.length > 300, set.id);
      assert.ok(
        !/undefined|\[object Object\]|__skip/.test(d.document.text),
        set.id,
      );
      assert.deepEqual(d.state.brief, emptyBrief());
      assert.ok(setImage(set.id).endsWith(".webp"));
    }
});

test("setiap opsi V3 termasuk Tanpa memperbarui satu blok; pilihan efektif tidak bersembunyi", () => {
  let checked = 0;
  for (const service of SERVICES) {
    const baseline = buildStudioV2({
      serviceId: service.id,
      catalogVersion: 3,
    });
    for (const field of baseline.fields)
      for (const choice of field.options) {
        if (
          choice.disabledReason ||
          baseline.state.selections[field.key] === choice.value
        )
          continue;
        const next = buildStudioV2({
          ...baseline.state,
          selections: {
            ...baseline.state.selections,
            [field.key]: choice.value,
          },
        });
        assert.equal(
          next.state.selections[field.key],
          choice.value,
          `${service.id}/${field.key}/${choice.value}`,
        );
        const ids = new Set([
          ...baseline.document.blocks.map((b) => b.id),
          ...next.document.blocks.map((b) => b.id),
        ]);
        const changes = [...ids].filter(
          (id) =>
            baseline.document.blocks.find((b) => b.id === id)?.text !==
            next.document.blocks.find((b) => b.id === id)?.text,
        );
        assert.equal(
          changes.length,
          1,
          `${service.id}/${field.key}/${choice.value}: ${changes}`,
        );
        assert.ok(
          next.effectiveChoices.some(
            (c) => c.key === field.key && c.value === choice.value,
          ),
        );
        checked++;
      }
  }
  assert.ok(checked > 1000, `Only ${checked} options tested`);
});

test("favorit lama tidak melebar ke jasa baru dengan recipe dasar yang sama", () => {
  assert.equal(
    favoriteServiceId({ studioId: "portrait", data: {} }),
    "professional",
  );
  assert.equal(favoriteServiceId({ studioId: "product", data: {} }), "product");
  assert.equal(
    favoriteServiceId({ studioId: "portrait", data: { serviceId: "creator" } }),
    "creator",
  );
  assert.equal(
    favoriteServiceId({ studioId: "product", data: { serviceId: "jewelry" } }),
    "jewelry",
  );
});
test("Tanpa tidak memasukkan instruksi bawaan lagi; data asli dan mode referensi tetap aman", () => {
  for (const service of SERVICES) {
    const baseline = buildStudioV2({
      serviceId: service.id,
      catalogVersion: 3,
    });
    assert.ok(
      baseline.fields.every(
        (f) => f.optional && f.options.some((o) => o.value === "__skip"),
      ),
    );
    const allSkipped = Object.fromEntries(
      baseline.fields.map((f) => [f.key, "__skip"]),
    );
    const next = buildStudioV2({ ...baseline.state, selections: allSkipped });
    assert.deepEqual(next.state.selections, allSkipped);
    assert.deepEqual(next.issues, []);
    assert.ok(!next.document.text.includes("__skip"));
    for (const block of ["scene", "lighting", "composition", "format"])
      assert.ok(
        !next.document.blocks.some((b) => b.id === block),
        `${service.id}/${block}`,
      );
  }
  const noReference = buildStudioV2({
    catalogVersion: 3,
    serviceId: "professional",
    referenceMode: "none",
    selections: { wardrobe: "__skip" },
  });
  assert.equal(noReference.state.selections.wardrobe, "__skip");
  assert.ok(!noReference.document.blocks.some((b) => b.id === "reference"));
});

test("katalog lama, detail Indonesia, prompt manual dan preset tidak dimigrasikan diam-diam", () => {
  for (const service of LEGACY_SERVICES) {
    const old = buildStudioV2({ serviceId: service.id, catalogVersion: 2 });
    assert.equal(old.catalogVersion, 2);
    assert.ok(
      old.fields.every((f) => !f.options.some((o) => o.value === "__skip")),
    );
  }
  const d = buildStudioV2({
    serviceId: "creator",
    catalogVersion: 3,
    brief: {
      subject: "Wajah karakter saya",
      brand: "MÉRAH & PUTIH",
      text: "Halo, dunia!",
    },
  });
  const saved = JSON.stringify(d.state);
  const switched = changeSet(
    d.state,
    NEW_SERVICES.find((s) => s.id === "creator")!.sets[2],
  );
  assert.deepEqual(switched.brief, d.state.brief);
  assert.equal(switched.catalogVersion, 3);
  const preset = presetStyle(d.state, switched);
  assert.deepEqual(preset.brief, d.state.brief);
  assert.equal(JSON.stringify(d.state), saved);
  for (const text of Object.values(d.state.brief).filter(Boolean))
    assert.ok(d.document.text.includes(text));
  assert.throws(() =>
    buildStudioV2({ serviceId: "creator", catalogVersion: 2 }),
  );
});

test("pilihan tidak dikenal tidak bocor, dan referensi bukan kewajiban visual baru", () => {
  for (const service of NEW_SERVICES) {
    const d = buildStudioV2({
      serviceId: service.id,
      catalogVersion: 3,
      referenceMode: "none",
      selections: { secretSetting: "DO_NOT_LEAK_THIS" },
    });
    assert.ok(!d.document.text.includes("DO_NOT_LEAK_THIS"));
    assert.ok(d.issues.some((i) => i.field === "secretSetting"));
    assert.ok(!d.document.blocks.some((b) => b.id === "reference"));
  }
  const jewelry = buildStudioV2({ serviceId: "jewelry", catalogVersion: 3 });
  assert.ok(!jewelry.document.text.includes("bottle"));
  const pets = buildStudioV2({ serviceId: "pets", catalogVersion: 3 });
  assert.ok(!pets.document.text.includes("product silhouette"));
});
