import { readFile, writeFile, mkdir } from "node:fs/promises";
type Job = {
  id: string;
  serviceId: string;
  label: string;
  prompt: string;
  references: string[];
  setting: string;
  option: string;
};
const original: Job[] = JSON.parse(
  await readFile("design/v3/generation-jobs.json", "utf8"),
);
const assignments: Record<string, [string, string]> = {
  "fashion-catalog": [
    "standing-front",
    "Stand with full outfit visible, neck vertical, both arms hanging naturally, shoulders level. Camera frontal.",
  ],
  "fashion-street": [
    "walking",
    "Walk naturally along the street, looking past camera, neck upright, arms in natural swing. Full outfit readable.",
  ],
  "fashion-modest": [
    "seated-upright",
    "Sit upright on a simple stool, both hands resting on thighs, chin level, shoulders relaxed, no face touching.",
  ],
  "fashion-resort": [
    "threequarter-right",
    "Stand in three-quarter view facing right, neck upright, hands loosely resting near waist, gaze toward the distance.",
  ],
  "fashion-editorial": [
    "threequarter-left",
    "Stand with torso angled left, face looking to camera, neck upright, relaxed arms down. Show complete black pantsuit over a high-neck cream shirt.",
  ],
  "fashion-batik": [
    "standing-front",
    "Stand facing camera with level chin and neck, hands lightly joined at waist, show original batik blouse and neutral trousers.",
  ],
  "beauty-natural": [
    "front-neutral",
    "Frontal close portrait, vertical neck, level eyes and shoulders, neutral relaxed closed lips, hands entirely out of frame.",
  ],
  "beauty-dewy": [
    "threequarter-right",
    "Close beauty portrait in three-quarter view to right, chin level, neck upright, eyes gently toward camera, hands entirely out of frame.",
  ],
  "beauty-glam": [
    "threequarter-left",
    "Close beauty portrait angled left, neck upright, chin level, gaze past camera, hands below frame.",
  ],
  "beauty-bridal": [
    "front-smile",
    "Frontal bridal beauty portrait with upright vertical neck and a warm natural smile, both hands below frame, high-neck ivory bridal clothing.",
  ],
  "beauty-color": [
    "profile-left",
    "Exact left-facing side profile beauty photograph showing lilac eye makeup, only one eye visible, chin level and neck vertical. Hands entirely below frame.",
  ],
  "beauty-mono": [
    "profile-right",
    "Exact right-facing profile beauty photograph in black and white, chin level and vertical neck, only one eye visible, hands outside frame.",
  ],
  "creator-cafe": [
    "seated-upright",
    "Sit upright at the cafe table, shoulders level, neck vertical. Hold a plain cup low near the table with one hand, the other rests on table. Smile naturally. Do not rest face on hand.",
  ],
  "creator-skincare": [
    "standing-front",
    "Stand upright facing camera, neck vertical. Hold one unbranded white bottle at upper chest height away from the face with one hand, other hand relaxed at waist. Natural smile.",
  ],
  "creator-desk": [
    "seated-upright",
    "Sit upright at the desk in a gentle side angle, both hands typing naturally on laptop keyboard, look toward laptop screen, neck natural not sideways tilted. Do not touch face.",
  ],
  "creator-travel": [
    "standing-front",
    "Stand upright in a tropical courtyard, level neck and shoulders. Hold a coconut with both hands at waist level and smile naturally. Do not use a hand to support the face.",
  ],
  "creator-city": [
    "walking",
    "Walk naturally along a city sidewalk, upright neck, relaxed shoulders, natural arm swing, gaze slightly away from camera. Do not touch neck or face.",
  ],
  "creator-home": [
    "threequarter-right",
    "Sit comfortably on a sofa with torso gently angled right, upright neck, hands loosely together in lap, relaxed natural expression, not leaning on a hand.",
  ],
  "graduation-studio": [
    "standing-front",
    "Stand upright in the graduation gown, chin level, neck vertical, both arms resting at sides. Head-to-knees composition, gentle confident closed-mouth smile.",
  ],
  "graduation-garden": [
    "threequarter-left",
    "Stand turned three-quarter left, upright neck, hold a small ivory bouquet with BOTH hands at waist level, look toward camera. No hand near face.",
  ],
  "graduation-formal": [
    "front-smile",
    "Stand frontally with upright neck and natural smile. Hold a closed plain folder with both hands at waist level, not across chest or face.",
  ],
  "graduation-confetti": [
    "standing-front",
    "Stand straight with vertical neck and natural laughing smile, both hands holding a small bouquet at waist, restrained confetti behind and beside the subject, not covering face.",
  ],
  "graduation-sunset": [
    "threequarter-right",
    "Stand in three-quarter view toward right at sunset, upright neck, chin level, look toward distance, bouquet held with both hands at waist.",
  ],
  "graduation-mono": [
    "profile-left",
    "Left-facing near-profile graduate portrait in black and white, neck upright and chin level, arms below the crop, plain mortarboard level on head.",
  ],
  "professional-profile": [
    "threequarter-left",
    "Professional head-and-shoulders portrait, torso angled slightly left and face directed to camera, neck perfectly upright, level chin, both hands below crop. Dark blazer over cream high-neck shirt, neutral gray studio, soft light.",
  ],
  "cinematic-city": [
    "walking",
    "Natural walking street editorial at blue hour, full torso and arms visible, neck upright, gaze toward distance, arms down in gentle motion, no hand touching face.",
  ],
  "relight-window": [
    "threequarter-left",
    "Three-quarter portrait by a window, neck upright and chin level, both hands below frame, quiet natural expression. Cream high-neck blouse. Soft window light from left.",
  ],
  "prewedding-modern": [
    "standing-front",
    "Full-length modern wedding couple: the same woman stands upright, neck vertical, chin level and face directed toward camera, holding hands with a distinct adult male partner at waist level. Her ivory wedding gown is high-neck and long-sleeved; partner in black suit. Cream studio, natural different poses, no heads leaning together or hand supporting face.",
  ],
};
const professional: Job = {
  id: "professional-profile",
  serviceId: "professional",
  label: "Foto profil",
  prompt:
    "Create a realistic professional head-and-shoulders portrait in a dark blazer and cream high-neck shirt, neutral gray studio, soft large studio light, accurate natural skin and recognizable face, no logos or text.",
  references: [],
  setting: "portfolio",
  option: "linkedin",
};
const jobs = [...original, professional]
  .filter((j) => assignments[j.id])
  .map((job) => {
    const [pose, direction] = assignments[job.id];
    // Use a neutral pose bank instead of the original repeated tilted-head selfie.
    const clean = job.prompt.replace(
      /Input images.*?Primary request:/,
      "Primary request:",
    );
    return {
      ...job,
      poseReference: pose,
      references: [
        process.cwd() + `/design/v3/pose-bank/originals/${pose}.png`,
        process.cwd() + "/design/v3/originals/formal-front.png",
      ],
      prompt: `Use case: identity-preserve. Create ONE finished commercial photograph, not a collage. Image 1 supplies the REQUIRED BODY/HEAD POSE of the user's adult synthetic AI influencer; image 2 confirms facial identity only. Preserve the same recognizable face, dark eyes, short black bob and natural skin texture. ${clean} IMPORTANT POSE OVERRIDE, takes priority over any previous composition: ${direction} Do NOT repeat the old tilted-head selfie pose. Do NOT lean face or chin on a hand. Do NOT angle the neck sideways. The head and spine are naturally supported. If no hands are required, leave hands resting naturally away from the face. Follow the specified gaze and body angle. Outfit and scene come from the requested final photograph, NOT the neutral gray pose-bank clothing. No watermark or text.`,
      reviewed: false,
    };
  });
await mkdir("design/v3/originals-v2", { recursive: true });
await writeFile(
  "design/v3/diverse-portfolio-jobs.json",
  JSON.stringify(jobs, null, 2) + "\n",
);
console.log(
  `Prepared ${jobs.length} pose-diverse portfolio replacements; originals preserved`,
);
