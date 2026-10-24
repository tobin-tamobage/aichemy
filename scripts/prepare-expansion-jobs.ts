import { mkdir, writeFile } from "node:fs/promises";
import { SERVICE_EXPANSION } from "../shared/services-v3";
const references = [
  "/Users/tobin/Downloads/hf_20260420_131356_3b50b8d7-1d55-4a2c-8f55-29e232ca0bb4.png",
  "/Users/tobin/Downloads/hf_20260423_133200_479b4afc-ce60-4fe1-965f-2dfbd5f065cb.png",
];
const identity =
  "Images 1 and 2 are identity references of the SAME adult synthetic AI influencer owned by the user. Preserve her recognizable facial identity, dark brown eyes, natural small freckles, short black bob hair, skin tone and natural proportions. These are references, not layout targets. ";
const jobs: {
  id: string;
  serviceId: string;
  setting: string;
  option: string;
  label: string;
  references: string[];
  prompt: string;
  reviewed: boolean;
}[] = SERVICE_EXPANSION.flatMap((s) =>
  s.looks.map(([slug, label, subject]) => {
    const useInfluencer = [
      "fashion",
      "beauty",
      "creator",
      "graduation",
    ].includes(s.id);
    const specifics =
      s.id === "beauty"
        ? "Head and shoulders beauty closeup, visible real pores, restrained retouching. "
        : s.id === "jewelry"
          ? "Precise premium commercial still-life photograph, physically plausible reflections, unbranded original object. "
          : s.id === "family"
            ? "Use the same fictional family throughout: Indonesian father with short black hair, mother in her thirties with shoulder-length dark hair, one child aged about seven. Ordinary fully clothed family photograph, warm and respectful. "
            : s.id === "pets"
              ? "Respect natural animal anatomy and species. No costume or unsafe objects touching the animal. "
              : "Natural editorial commercial photography, beautiful but believable texture. ";
    return {
      id: `${s.id}-${slug}`,
      serviceId: s.id,
      setting: "concept",
      option: slug,
      label,
      references: useInfluencer ? references : [],
      prompt: `Use case: ${useInfluencer ? "identity-preserve" : "photorealistic-natural"}. Asset type: Aichemy service-specific visual example, one portrait 4:5 photograph, not a collage. ${useInfluencer ? identity : ""}Primary request: ${subject}. ${specifics}The whole photograph must clearly demonstrate '${label}' for ${s.label}. ${s.id === "fashion" ? "Show clothing silhouette and fabric, knees-up or full-body; avoid cropping the outfit awkwardly. " : ""}${s.id === "graduation" ? "Black graduation gown and plain mortarboard; no university crests, names, degrees, or false lettering. " : ""}${/mono/.test(slug) ? "True black-and-white monochrome photograph. " : "True-to-life colors. "}${/sunset|outdoor|beach|travel|resort/.test(slug) ? "Soft warm late-afternoon natural light with controlled highlights. " : /editorial|dark/.test(slug) ? "Controlled side light with rich detailed shadows. " : "Soft realistic directional light, readable shadows. "}Uncluttered commercial composition, subject safely within a crop-friendly central area. Keep faces distinct and hands anatomically correct. No text, numbers, watermark, visible third-party brands, fake endorsements or collage panels.`,
      reviewed: false,
    };
  }),
);
const additions = [
  [
    "formal-front",
    "formal",
    "Pas foto frontal",
    "Create a formal head-and-upper-chest photograph of this same adult woman. Face straight and centered, neutral closed-mouth expression, both eyes level, white collared shirt and dark blazer, clean solid blue background #1769ba, soft even frontal illumination. Preserve her real facial features and bob. No glam retouch, no jewelry, no tilt.",
  ],
  [
    "prewedding-before",
    "prewedding",
    "Pasangan sebelum styling",
    "Create a plain casual couple reference photograph: this same adult woman in modest white tee beside a distinct adult Indonesian man with short dark hair wearing a gray collared shirt. Stand together facing camera in a simple neutral home with soft ordinary daylight. Show heads to knees. This is a synthetic before-photo, not wedding styling.",
  ],
  [
    "prewedding-modern",
    "prewedding",
    "Prewedding studio",
    "Create an elegant modern prewedding photograph of this same adult woman beside a distinct adult Indonesian man with short dark hair. Woman in refined ivory high-neck long-sleeve wedding gown, man in dark tailored suit, standing close holding hands, both looking gently at camera. Minimal cream studio, small ivory bouquet, soft side light, full-length couple photograph. Preserve woman identity; keep man distinct.",
  ],
  [
    "cinematic-city",
    "cinematic",
    "Editorial kota",
    "Create a cinematic three-quarter portrait of this same adult woman standing on a quiet city street at blue hour. Plain black jacket and dark shirt, calm confident expression, 50mm natural framing, soft warm streetlight and cool ambient light, subtle film grain. No signs, logos, text or sunglasses obscuring her face.",
  ],
  [
    "relight-window",
    "relight",
    "Cahaya jendela",
    "Create a natural head-and-shoulders portrait of this same adult woman in a plain cream blouse, beside a window in a warm quiet room. Directional soft window light from left, detailed gentle shadows, relaxed neutral expression. Preserve bob, natural skin texture and facial identity. No text or logos.",
  ],
];
for (const [id, serviceId, label, request] of additions)
  jobs.push({
    id,
    serviceId,
    setting: "portfolio",
    option: id,
    label,
    references,
    prompt: `Use case: identity-preserve. Asset type: Aichemy photographic example, ONE portrait 4:5 photo. ${identity}${request} Photorealistic natural skin texture, no watermark, no collage.`,
    reviewed: false,
  });
await mkdir("design/v3/originals", { recursive: true });
await writeFile(
  "design/v3/generation-jobs.json",
  JSON.stringify(jobs, null, 2) + "\n",
);
console.log(`${jobs.length} image-generation briefs prepared`);
