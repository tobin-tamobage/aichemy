export type LegacyServiceId =
  | "professional"
  | "formal"
  | "prewedding"
  | "product"
  | "food"
  | "ads"
  | "social"
  | "cinematic"
  | "property"
  | "branding"
  | "relight";
export type NewServiceId =
  | "fashion"
  | "beauty"
  | "jewelry"
  | "creator"
  | "graduation"
  | "family"
  | "pets";
export type ServiceId = LegacyServiceId | NewServiceId;
export type CatalogVersion = 1 | 2 | 3;
export type BlockId =
  | "task"
  | "reference"
  | "subject"
  | "scene"
  | "look"
  | "lighting"
  | "composition"
  | "text"
  | "format"
  | "constraints";
export interface PromptBlock {
  id: BlockId;
  label: string;
  text: string;
}
export interface PromptDocument {
  engineVersion: 2;
  blocks: PromptBlock[];
  text: string;
}
export interface VisualPreview {
  kind:
    "photo" | "background" | "ratio" | "layout" | "palette" | "type" | "none";
  src?: string;
  color?: string;
  colors?: string[];
  ratio?: string;
  layout?: string;
}
export interface VisualOption {
  value: string;
  label: string;
  hint: string;
  visual: VisualPreview;
  group?: string;
  keywords?: string[];
  disabledReason?: string;
}
export interface VisualField {
  key: string;
  label: string;
  help: string;
  options: VisualOption[];
  group?: string;
  advanced?: boolean;
  optional?: boolean;
}
export interface StudioSet {
  id: string;
  serviceId: ServiceId;
  label: string;
  description: string;
  subject: string;
  input: string;
  changes: string;
  preserved: string;
  selections: Record<string, string>;
  visualSrc?: string;
}
export interface ServiceDefinition {
  id: ServiceId;
  recipeId: string;
  label: string;
  short: string;
  pitch: string;
  audience: string;
  deliverable: string;
  referenceGuide: string;
  color: string;
  sets: StudioSet[];
  group?: "Foto orang" | "Jualan & merek" | "Ruang & lainnya";
  keywords?: string[];
  starterNote?: string;
}
export interface ClientBrief {
  subject: string;
  purpose: string;
  required: string;
  preserve: string;
  brand: string;
  text: string;
}
export interface StudioV2State {
  catalogVersion?: CatalogVersion;
  serviceId: ServiceId;
  setId: string;
  referenceMode: "none" | "single" | "couple" | "individuals";
  brief: ClientBrief;
  selections: Record<string, string>;
}
export interface V2Issue {
  field: string;
  text: string;
  level: "info" | "warning" | "error";
}
export interface StudioV2Descriptor {
  engineVersion: 2;
  catalogVersion: CatalogVersion;
  service: ServiceDefinition;
  set: StudioSet;
  state: StudioV2State;
  fields: VisualField[];
  effectiveChoices: {
    key: string;
    label: string;
    value: string;
    valueLabel: string;
  }[];
  document: PromptDocument;
  referenceGuide: string;
  issues: V2Issue[];
}
export interface V2Draft {
  schemaVersion: 2;
  engineVersion: 2;
  catalogVersion?: CatalogVersion;
  state: StudioV2State;
  manual: string | null;
  legacySource?: Record<string, unknown>;
  clientModifiedAt?: string;
}
export function isV2Draft(value: unknown): value is V2Draft {
  if (!value || typeof value !== "object") return false;
  const d = value as Partial<V2Draft>;
  const s = d.state;
  return (
    d.engineVersion === 2 &&
    d.schemaVersion === 2 &&
    !!s &&
    typeof s.serviceId === "string" &&
    typeof s.setId === "string" &&
    ["none", "single", "couple", "individuals"].includes(s.referenceMode) &&
    !!s.brief &&
    ["subject", "purpose", "required", "preserve", "brand", "text"].every(
      (k) => typeof s.brief[k as keyof ClientBrief] === "string",
    ) &&
    !!s.selections &&
    typeof s.selections === "object" &&
    !Array.isArray(s.selections) &&
    Object.values(s.selections).every((v) => typeof v === "string") &&
    (d.manual === null || typeof d.manual === "string")
  );
}
export interface ViralMetadata {
  id: string;
  medium: "photography";
  curation: "research" | "aichemy";
  research?: {
    title: string;
    url: string;
    publishedAt?: string;
    checkedAt: string;
    basis: "trend-report" | "technique";
    note: string;
  };
  title: string;
  summary: string;
  tags: string[];
  references: string;
  publishedAt: string;
  status: "published" | "draft";
  before: string;
  after: string;
}
export interface ViralContent extends ViralMetadata {
  prompt: string;
  instructions: string[];
}
export interface VisualAsset {
  id: string;
  src?: string;
  before?: string;
  after?: string;
  source?: string;
  prompt: string;
  references: string[];
  reviewed: boolean;
  reviewNotes: string;
}
export const emptyBrief = (): ClientBrief => ({
  subject: "",
  purpose: "",
  required: "",
  preserve: "",
  brand: "",
  text: "",
});
export function businessSimulation(
  price: number,
  orders: number,
  variable: number,
  tools: number,
) {
  const safe = (n: number) => (Number.isFinite(n) ? Math.max(0, n) : 0);
  const revenue = safe(price) * Math.floor(safe(orders));
  const costs = safe(variable) * Math.floor(safe(orders)) + safe(tools);
  return {
    revenue,
    costs,
    difference: revenue - costs,
    firstMonth: revenue - costs - 149000,
  };
}
