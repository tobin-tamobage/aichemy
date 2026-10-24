import { mkdir, writeFile } from "node:fs/promises";
const poses = [
  [
    "front-neutral",
    "Depan · kepala tegak",
    "Head and shoulders, directly frontal face, neck perfectly upright on the vertical axis, level eyes and shoulders, neutral closed-mouth expression, arms down out of frame. No head tilt or hand near face.",
  ],
  [
    "front-smile",
    "Depan · senyum alami",
    "Head and shoulders, frontal face and upright vertical neck, level shoulders, natural open smile with modestly visible teeth, relaxed cheeks, both hands below frame. No head tilt.",
  ],
  [
    "threequarter-left",
    "Tiga perempat kiri",
    "Waist-up portrait; torso rotated about 35 degrees toward the left side of the image, face follows torso with both eyes still visible, eyes glance gently toward camera. Spine and neck upright, shoulders level. Both arms relaxed by the waist, no hand near face.",
  ],
  [
    "threequarter-right",
    "Tiga perempat kanan",
    "Waist-up portrait; torso rotated about 35 degrees toward the right side of the image, face follows torso with both eyes visible. Look slightly past camera, upright spine and vertical neck, level shoulders, both arms relaxed naturally by sides. No tilted head or hand near face.",
  ],
  [
    "profile-left",
    "Profil samping kiri",
    "Chest-up exact side profile with nose pointing toward the LEFT edge of the image. Only one eye visible. Upright vertical neck, chin level, spine straight, shoulders naturally turned with body, arms below frame. No head tilt.",
  ],
  [
    "profile-right",
    "Profil samping kanan",
    "Chest-up exact side profile with nose pointing toward the RIGHT edge of the image. Only one eye visible. Upright vertical neck, chin level, spine straight, shoulders naturally turned with body, arms below frame. No head tilt.",
  ],
  [
    "standing-front",
    "Berdiri santai",
    "FULL BODY head to shoes: stand naturally facing camera with level shoulders, upright vertical neck, relaxed straight posture, weight comfortably balanced, arms resting at sides, hands visible with natural fingers, feet on ground. No crossed arms, no hand near face, no sideways head tilt.",
  ],
  [
    "seated-upright",
    "Duduk tegak",
    "Three-quarter-length seated portrait on a plain stool, spine upright, vertical relaxed neck, chin level, shoulders level, BOTH hands resting naturally on thighs, fingers visible, face looking calmly at camera. No leaning on a hand, no face touching, no sideways tilt.",
  ],
  [
    "walking",
    "Berjalan natural",
    "FULL BODY head to shoes: caught mid-stride walking toward camera with a gentle natural arm swing, upright vertical neck, chin level, shoulders relaxed, gaze slightly past camera, natural candid smile. No hands near face, no forced neck lean.",
  ],
];
const base =
  "Use case: identity-preserve. Asset type: neutral photographic pose reference bank for a visual prompt builder, ONE photograph, portrait 4:5. Image 1 is a frontal identity reference of the user's adult synthetic AI influencer; preserve her recognizable face, dark brown eyes, small freckles and short black bob. Do not clone the reference composition when a different pose is requested. Outfit in every image: plain light gray high-neck crewneck cotton T-shirt, straight charcoal trousers, plain white shoes where visible. Background in every image: simple matte warm gray studio. Soft even neutral daylight, realistic pores and hair strands, minimal natural makeup. ";
const jobs = poses.map(([id, label, pose]) => ({
  id,
  label,
  prompt: `${base}POSE REQUIRED: ${pose} Camera at natural chest/eye height, realistic anatomy. No props other than a stool when seated, no logos, no jewelry, no text, no watermark, not a collage. The goal is distinct body/head orientations while preserving identity.`,
  references: [process.cwd() + "/design/v3/originals/formal-front.png"],
  reviewed: false,
}));
await mkdir("design/v3/pose-bank/originals", { recursive: true });
await writeFile(
  "design/v3/pose-bank/jobs.json",
  JSON.stringify(jobs, null, 2) + "\n",
);
console.log(`Prepared ${jobs.length} distinct pose references`);
