import {
  emptyBrief,
  type StudioV2State,
  type V2Draft,
  type StudioSet,
} from "./v2";
import type { LibraryItem } from "./product";
import type { VisualField } from "./v2";
import { serviceForRecipe } from "./v2-catalog";
export function changeSet(state: StudioV2State, set: StudioSet): StudioV2State {
  if (set.serviceId !== state.serviceId) throw new Error("Set berbeda jasa.");
  return {
    ...state,
    setId: set.id,
    selections: { ...set.selections },
    brief: { ...state.brief },
  };
}
export function presetStyle(
  state: StudioV2State,
  preset: StudioV2State,
): StudioV2State {
  if (state.serviceId !== preset.serviceId)
    throw new Error("Preset berbeda jasa.");
  return {
    ...state,
    setId: preset.setId,
    selections: { ...preset.selections },
    brief: { ...state.brief },
  };
}
export function legacyCopy(item: LibraryItem): V2Draft {
  const service = serviceForRecipe(item.studioId);
  if (!service) throw new Error("Studio kustom tetap memakai mesin lama.");
  const old = (item.data.state ?? {}) as Record<string, unknown>;
  const pick = (keys: string[]) =>
    keys.map((k) => old[k]).find((v) => typeof v === "string" && v.length) as
      string | undefined;
  return {
    schemaVersion: 2,
    engineVersion: 2,
    manual: typeof item.data.manual === "string" ? item.data.manual : null,
    legacySource: { id: item.id, name: item.name, data: item.data },
    state: {
      serviceId: service.id,
      setId: service.sets[0].id,
      referenceMode:
        service.id === "branding" || service.id === "cinematic"
          ? "none"
          : service.id === "prewedding"
            ? "couple"
            : "single",
      brief: {
        ...emptyBrief(),
        subject:
          pick([
            "subject",
            "productName",
            "subjectAction",
            "brandBrief",
            "description",
          ]) ?? "",
        brand: pick(["brandName", "companyName"]) ?? "",
        text: pick(["adText", "headline", "textContent"]) ?? "",
        required:
          pick(["additionalDetails", "environment", "customDetails"]) ?? "",
      },
      selections: { ...service.sets[0].selections },
    },
  };
}
export function mapLegacyStyle(
  original: Record<string, unknown>,
  state: StudioV2State,
  fields: VisualField[],
) {
  const selections = { ...state.selections };
  const unavailable: string[] = [];
  const aliases: Record<string, string> = {
    backgroundColor: "background",
    lensType: "lens",
    focalLength: "lens",
    cameraAngle: "angle",
    lightingStyle: "lighting",
    aspectRatio: "ratio",
    clothing: "wardrobe",
    shotType: "crop",
  };
  const values: Record<string, string> = {
    softbox: "soft",
    diffused: "soft",
    "natural-window": "window",
    "golden-hour": "golden",
    "45-degree": "three-quarter",
    "front-facing": "front",
    "85mm": "85",
    "50mm": "50",
    "35mm": "35",
    neutral: "neutral",
    "white-background": "white",
  };
  const protectedKeys = new Set([
    "subject",
    "productName",
    "brandBrief",
    "subjectAction",
    "description",
    "brandName",
    "companyName",
    "adText",
    "headline",
    "textContent",
    "additionalDetails",
    "environment",
    "customDetails",
    "hasReferencePhoto",
  ]);
  for (const [oldKey, value] of Object.entries(original)) {
    if (
      protectedKeys.has(oldKey) ||
      value === null ||
      value === "" ||
      value === false
    )
      continue;
    const key = aliases[oldKey] ?? oldKey;
    const field = fields.find((f) => f.key === key);
    const mapped = values[String(value)] ?? String(value);
    if (field?.options.some((o) => o.value === mapped && !o.disabledReason))
      selections[key] = mapped;
    else unavailable.push(oldKey);
  }
  return {
    state: { ...state, selections, brief: { ...state.brief } },
    unavailable,
  };
}
