export const PRICE = 149000;
export const PRICE_LABEL = "Rp149.000";
export type StudioState = Record<string, unknown>;
export interface StudioOption {
  value: string;
  label: string;
  image?: string;
  hint?: string;
}
export interface StudioField {
  key: string;
  kind: string;
  label: string;
  placeholder?: string;
  hint?: string;
  multi?: boolean;
  max?: number;
  options?: StudioOption[];
  visible: boolean;
  advanced?: boolean;
}
export interface StudioSection {
  id: string;
  title: string;
  stage: "describe" | "shape";
  fields: StudioField[];
}
export interface StudioDescriptor {
  id: string;
  label: string;
  tagline: string;
  state: StudioState;
  sections: StudioSection[];
  protectedKeys: string[];
  referencePhoto?: boolean;
  presets?: { id: string; name: string; state: StudioState }[];
  prompt: string;
  warnings: { text: string; level: string; sectionId: string }[];
}
export interface LibraryItem {
  id: string;
  kind: "draft" | "preset" | "favorite" | "studio";
  studioId: string;
  name: string;
  data: Record<string, unknown>;
  updatedAt: string;
}
export interface Account {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  admin: boolean;
  active: boolean;
  environment: string;
}
export interface Order {
  id: string;
  status: string;
  amount: number;
  environment: string;
  createdAt: string;
  checkoutUrl?: string;
}
export const LOOKS = [
  {
    id: "product",
    label: "Foto Produk",
    title: "Produk kecil. Kesan besar.",
    short: "Produk",
    color: "#ffe1cc",
    description:
      "Foto katalog dan kampanye yang bikin produk jadi pusat perhatian.",
    ingredients: ["Latar pastel", "Cahaya jendela", "Detail tajam"],
    state: {
      productName:
        "A frosted peach glass skincare serum bottle with an ivory dropper cap",
      surface: "colored-paper",
      lighting: "window",
      shotType: "hero",
    },
  },
  {
    id: "food",
    label: "Foto Makanan",
    title: "Bikin lapar dari pandangan pertama.",
    short: "Makanan",
    color: "#e8efcf",
    description:
      "Racik pencahayaan, penyajian, dan suasana untuk menu andalanmu.",
    ingredients: ["Cahaya alami", "Tekstur menggoda", "Suasana hangat"],
    state: {},
  },
  {
    id: "portrait",
    label: "Potret",
    title: "Karakter yang terasa hidup.",
    short: "Potret",
    color: "#f8d6db",
    description:
      "Dari potret profesional sampai editorial dengan karakter kuat.",
    ingredients: ["Ekspresi natural", "Warna hangat", "Fokus pada mata"],
    state: { lighting: "rembrandt", expression: "confident-smile" },
  },
  {
    id: "cinematic",
    label: "Sinematik",
    title: "Satu gambar, seribu cerita.",
    short: "Sinematik",
    color: "#ddd8f8",
    description: "Bangun adegan dengan sudut kamera, cahaya, dan nuansa film.",
    ingredients: ["Golden hour", "Warna film", "Komposisi luas"],
    state: {
      subjectAction:
        "An Indonesian woman in a flowing coral dress standing on a coastal cliff",
      environment: "Turquoise ocean, distant mist, a soft peach sunset sky",
      mood: "Dreamlike, peaceful, cinematic",
    },
  },
  {
    id: "wedding",
    label: "Pernikahan",
    title: "Momen yang layak dikenang.",
    short: "Pernikahan",
    color: "#f5e5cb",
    description: "Potret pasangan dan suasana pernikahan yang romantis.",
    ingredients: ["Cahaya keemasan", "Momen intim", "Detail lembut"],
    state: {},
  },
  {
    id: "real-estate",
    label: "Properti",
    title: "Ruang yang ingin kamu tinggali.",
    short: "Properti",
    color: "#dbe9dd",
    description:
      "Interior, eksterior, dan penataan ruang dengan sudut terbaik.",
    ingredients: ["Material alami", "Ruang terang", "Sudut arsitektur"],
    state: {},
  },
  {
    id: "marketing",
    label: "Marketing",
    title: "Visual yang berhenti diingat.",
    short: "Marketing",
    color: "#e3f0cc",
    description: "Arahkan visual iklan, promosi, dan konten media sosial.",
    ingredients: ["Warna segar", "Ruang untuk teks", "Komposisi berani"],
    state: {},
  },
  {
    id: "logo",
    label: "Logo & Identitas",
    title: "Identitas dengan cerita sendiri.",
    short: "Logo",
    color: "#ffe3cf",
    description: "Eksplorasi bentuk, warna, dan karakter sebuah merek.",
    ingredients: ["Bentuk sederhana", "Warna berkarakter", "Ruang negatif"],
    state: {
      brandBrief: "An artisan Indonesian cafe inspired by orange blossoms",
    },
  },
  {
    id: "id-photo",
    label: "Foto Formal",
    title: "Kesan pertama yang profesional.",
    short: "Foto Formal",
    color: "#dce7fa",
    description: "Siapkan arahan foto profesional, profil kerja, dan pas foto.",
    ingredients: ["Latar bersih", "Pose rapi", "Cahaya merata"],
    state: {},
  },
  {
    id: "relight",
    label: "Relight",
    title: "Subjek sama. Suasana baru.",
    short: "Relight",
    color: "#e9dcf8",
    description: "Ubah arah cahaya dan warna sambil mempertahankan identitas.",
    ingredients: ["Warna keemasan", "Dimensi cahaya", "Identitas tetap"],
    state: {},
  },
] as const;
export const lookImage = (id: string) => `/assets/examples/${id}.webp`;
export const findLook = (id: string) => LOOKS.find((look) => look.id === id);
export const DEMO_PROMPTS: Record<string, string> = {
  product:
    "Premium editorial product photography of a frosted peach glass serum bottle with an ivory dropper cap. Soft natural window light, matte pastel backdrop, gentle directional shadows. Hero composition, refined tactile materials, sharp product details. No watermark.",
  portrait:
    "An expressive editorial portrait with a natural confident smile. Warm directional lighting, a soft peach backdrop, shallow depth of field, sharp focus on the eyes, and realistic skin texture. An intimate and approachable mood.",
  cinematic:
    "A woman in a flowing coral dress stands on a coastal cliff above a turquoise ocean. A soft peach sunset, distant mist, and warm rim lighting create a dreamlike cinematic atmosphere. Wide composition, natural film texture, restrained colors.",
};
