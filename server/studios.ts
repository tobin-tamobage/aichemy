import { DOMAINS } from "../domains";
import { toDomainRecipe } from "../domains/custom/toDomainRecipe";
import { validateRecipe } from "../domains/custom/validate";
import type { DomainRecipe } from "../domains/types";
import type { CustomField, CustomRecipe } from "../domains/custom/types";
import type { StudioDescriptor, StudioState } from "../shared/product";
import { findLook } from "../shared/product";
import { translate, studioLabel } from "./localize";
import assetIndex from "../shared/asset-index.json";
import bundledPresets from "./data/bundled-presets.json";
const availableImages = new Set(assetIndex);
const advanced = new Set([
  "camera",
  "lens",
  "focalLength",
  "fStop",
  "filmStock",
  "photographer",
  "designer",
]);
export function cloneStudio(recipe: DomainRecipe): CustomRecipe {
  const defaults = recipe.createEmptyState();
  const sections = recipe.sections
    .map((section) => ({
      id: section.id,
      title: studioLabel(recipe.id, `section.${section.id}`, section.title),
      fields: section.fields.flatMap((field) => {
        const kind =
          field.kind === "visual"
            ? ("multi" in field && field.multi) ||
              Array.isArray(defaults[field.key])
              ? "chips"
              : "select"
            : field.kind;
        const options =
          "options" in field
            ? (typeof field.options === "function"
                ? field.options(defaults)
                : field.options
              )
                .filter((option) => option.value)
                .map((option) => ({
                  ...option,
                  label: studioLabel(
                    recipe.id,
                    `option.${field.key}.${option.value}`,
                    option.label,
                  ),
                  promptPhrase:
                    "promptPhrase" in option
                      ? String(option.promptPhrase)
                      : option.label,
                }))
            : undefined;
        if ((kind === "select" || kind === "chips") && !options?.length)
          return [];
        const value = defaults[field.key];
        const validDefault =
          kind === "select"
            ? options?.some((option) => option.value === value)
            : kind === "chips"
              ? Array.isArray(value)
              : value !== undefined;
        return [
          {
            key: field.key,
            label: studioLabel(recipe.id, `field.${field.key}`, field.label),
            kind,
            ...(options ? { options } : {}),
            ...(field.kind === "textarea"
              ? { placeholder: "Jelaskan ide Anda…" }
              : {}),
            ...(field.kind === "toggle" ? { text: field.label } : {}),
            ...(validDefault
              ? {
                  default:
                    kind === "chips"
                      ? (value as string[]).filter((v) =>
                          options?.some((o) => o.value === v),
                        )
                      : value,
                }
              : {}),
          } satisfies CustomField,
        ];
      }),
    }))
    .filter((section) => section.fields.length);
  const fields = sections.flatMap((section) => section.fields);
  return {
    recipeVersion: 1,
    id: `x-${recipe.id}-${crypto.randomUUID().slice(0, 6)}`,
    label: `${findLook(recipe.id)?.label ?? recipe.label} Pribadi`,
    icon: "✦",
    tagline: "Ruang kreasi dengan pilihan dan template milikmu.",
    sections,
    template: fields.map((field) => ({
      kind: "field",
      field: field.key,
      suffix: ".",
      separator: ", ",
    })),
    presetProtectedKeys: recipe.presetProtectedKeys.filter((key) =>
      fields.some((field) => field.key === key),
    ),
  };
}
export function getRecipe(id: string, custom?: unknown): DomainRecipe {
  const builtin = DOMAINS.find((domain) => domain.id === id);
  if (builtin) return builtin;
  const result = validateRecipe(
    custom,
    DOMAINS.map((domain) => domain.id),
  );
  if (!result.ok || result.recipe.id !== id)
    throw new Error("Studio tidak ditemukan.");
  return toDomainRecipe(result.recipe);
}
export function describeStudio(
  recipe: DomainRecipe,
  input: StudioState = {},
  starter = false,
): StudioDescriptor {
  const defaults = recipe.createEmptyState();
  const seed = starter ? (findLook(recipe.id)?.state ?? {}) : {};
  const state: StudioState = { ...defaults, ...seed };
  if (recipe.referencePhoto && "hasReferencePhoto" in input) {
    if (typeof input.hasReferencePhoto !== "boolean")
      throw new Error("Pilihan referensi harus benar atau salah.");
    state.hasReferencePhoto = input.hasReferencePhoto;
  }
  const fields = recipe.sections.flatMap((section) => section.fields);
  for (const field of fields) {
    if (!(field.key in input)) continue;
    const value = input[field.key];
    if (field.kind === "textarea") {
      if (typeof value !== "string" || value.length > 6000)
        throw new Error("Deskripsi harus berupa teks maksimal 6.000 karakter.");
    } else if (field.kind === "toggle") {
      if (typeof value !== "boolean")
        throw new Error("Nilai pilihan tidak sesuai.");
    } else if (Array.isArray(value)) {
      if (
        field.kind !== "chips" &&
        !("multi" in field && field.multi) &&
        !Array.isArray(defaults[field.key])
      )
        throw new Error("Kolom ini hanya menerima satu pilihan.");
      if (
        value.length > ("max" in field ? (field.max ?? 30) : 30) ||
        !value.every((v) => typeof v === "string")
      )
        throw new Error("Jumlah pilihan tidak sesuai.");
    } else if (typeof value !== "string")
      throw new Error("Nilai pilihan tidak sesuai.");
    Object.defineProperty(state, field.key, {
      value,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }
  for (const field of fields) {
    if (
      !("options" in field) ||
      (field.visibleWhen && !field.visibleWhen(state))
    )
      continue;
    const options =
      typeof field.options === "function"
        ? field.options(state)
        : field.options;
    const values = new Set(options.map((option) => option.value));
    const value = state[field.key];
    if (Array.isArray(value))
      state[field.key] = value.filter((v) => values.has(String(v)));
    else if (value && !values.has(String(value)))
      state[field.key] = defaults[field.key] ?? "";
  }
  const first = recipe.sections[0]?.id;
  return {
    id: recipe.id,
    label: findLook(recipe.id)?.label ?? recipe.label,
    tagline: findLook(recipe.id)?.description ?? recipe.tagline,
    state,
    referencePhoto: recipe.referencePhoto,
    presets: bundledPresets
      .filter((preset) => preset.studioId === recipe.id)
      .map((preset) => ({
        id: preset.id,
        name: translate(preset.name),
        state: preset.state,
      })),
    protectedKeys: [
      ...new Set([
        ...recipe.presetProtectedKeys,
        ...fields.filter((f) => f.kind === "textarea").map((f) => f.key),
      ]),
    ],
    prompt: recipe.buildPrompt(state),
    warnings: (recipe.warnings?.(state) ?? []).map((w) => ({
      ...w,
      text: studioLabel(recipe.id, `warning.${w.sectionId}.${w.text}`, w.text),
    })),
    sections: recipe.sections.map((section) => ({
      id: section.id,
      title: studioLabel(recipe.id, `section.${section.id}`, section.title),
      stage:
        section.id === first ||
        section.fields.some((field) => field.kind === "textarea")
          ? "describe"
          : "shape",
      fields: section.fields.map((field) => ({
        key: field.key,
        kind: field.kind,
        label: studioLabel(recipe.id, `field.${field.key}`, field.label),
        visible: !field.visibleWhen || field.visibleWhen(state),
        advanced: advanced.has(field.key),
        ...("placeholder" in field
          ? { placeholder: "Jelaskan ide Anda dengan singkat dan spesifik…" }
          : {}),
        ...("hint" in field && field.hint
          ? { hint: studioLabel(recipe.id, `hint.${field.key}`, field.hint) }
          : {}),
        ...("max" in field ? { max: field.max } : {}),
        ...("multi" in field ? { multi: field.multi } : {}),
        ...("options" in field
          ? {
              options: (typeof field.options === "function"
                ? field.options(state)
                : field.options
              ).map((option) => ({
                value: option.value,
                label: studioLabel(
                  recipe.id,
                  `option.${field.key}.${option.value}`,
                  option.label,
                ),
                ...(option.image &&
                availableImages.has(`/${option.image.replace(/^\//, "")}`)
                  ? { image: `/${option.image.replace(/^\//, "")}` }
                  : {}),
                ...(option.hint
                  ? {
                      hint: studioLabel(
                        recipe.id,
                        `optionHint.${field.key}.${option.value}`,
                        option.hint,
                      ),
                    }
                  : {}),
              })),
            }
          : {}),
      })),
    })),
  };
}
