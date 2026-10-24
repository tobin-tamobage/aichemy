import type { ViralMetadata } from "./v2";

const research: Record<string, NonNullable<ViralMetadata["research"]>> = {
  adobe: {
    title: "Adobe — tren prompt Firefly 2025",
    url: "https://blog.adobe.com/en/publish/2026/01/08/halftone-nostalgia-more-2025-top-firefly-prompt-trends",
    publishedAt: "2026-01-08",
    checkedAt: "2026-10-23",
    basis: "trend-report",
    note: "Laporan Adobe atas penggunaan Firefly pada 2025 mencatat minat pada fotografi sinematik, grain, dan nostalgia. Prompt ini ditulis ulang oleh Aichemy sebagai interpretasi fotografi; laporan tersebut bukan ukuran viralitas prompt ini di Indonesia.",
  },
  retro: {
    title: "Adobe Community — tantangan potret retro 80-an",
    url: "https://community.adobe.com/announcements-402/firefly-creative-challenge-slaying-the-retro-80-s-look-1641286/index1.html",
    publishedAt: "2026-09-10",
    checkedAt: "2026-10-23",
    basis: "trend-report",
    note: "Tantangan komunitas Adobe membahas potret 80-an pada September 2026. Ini sumber inspirasi gaya, bukan bukti bahwa prompt Aichemy sedang viral. Teks prompt ditulis sendiri oleh Aichemy.",
  },
  panning: {
    title: "Nikon — 10 Tips for Better Camera Panning",
    url: "https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/10-tips-for-better-camera-panning",
    checkedAt: "2026-10-23",
    basis: "technique",
    note: "Panduan Nikon menjadi acuan efek panning: subjek relatif tajam dan latar memperlihatkan gerakan. Ini referensi teknik fotografi, bukan klaim tren. Prompt AI ditulis sendiri oleh Aichemy.",
  },
};

type PhotoSeed = [
  id: string,
  title: string,
  summary: string,
  category: string,
  references: string,
  researchKey?: string,
];
const rows: PhotoSeed[] = [
  [
    "flash-digicam",
    "Flash digicam 2000-an",
    "Flash tegas, latar malam, dan kesan candid seperti foto kamera saku.",
    "Warna & tekstur",
    "Satu foto wajah atau setengah badan yang jelas.",
  ],
  [
    "motion-blur",
    "Jalanan motion blur",
    "Subjek tetap terbaca, sementara latar menyapu seperti foto sambil bergerak.",
    "Jenis shot",
    "Satu foto setengah badan atau seluruh badan, wajah terlihat jelas.",
    "panning",
  ],
  [
    "retro",
    "Potret vintage hangat",
    "Warna cetak hangat, grain, dan tekstur foto lawas yang nostalgis.",
    "Warna & tekstur",
    "Satu foto potret dengan wajah yang terang.",
    "adobe",
  ],
  [
    "prism-glow",
    "Bias pelangi prisma",
    "Satu bias pelangi lembut memberi karakter tanpa menutupi wajah.",
    "Efek cahaya",
    "Satu foto wajah dengan detail kulit yang jelas.",
  ],
  [
    "rainy-window",
    "Di balik kaca hujan",
    "Tetes air di kaca, pantulan kota, dan cahaya hangat yang terasa intim.",
    "Efek cahaya",
    "Satu foto wajah atau setengah badan yang jelas.",
  ],
  [
    "overhead-street",
    "Street shot dari atas",
    "Sudut tinggi dengan pola paving menjadi bingkai editorial yang berbeda.",
    "Jenis shot",
    "Satu foto seluruh badan; wajah dan pakaian terlihat jelas.",
  ],
  [
    "low-angle-editorial",
    "Sudut rendah editorial",
    "Garis arsitektur dan sudut rendah memberi kesan tegas pada foto fashion.",
    "Jenis shot",
    "Satu foto seluruh badan dengan pakaian lengkap terlihat.",
  ],
  [
    "retro-studio",
    "Studio retro 80-an",
    "Backdrop gradasi, cahaya lembut, dan warna foto studio era 80-an.",
    "Potret",
    "Satu foto potret dengan wajah dan rambut terlihat jelas.",
    "retro",
  ],
  [
    "film-poster",
    "Potret sinematik senja",
    "Cahaya tepi keemasan dan laut senja untuk potret bernuansa film.",
    "Potret",
    "Satu foto wajah atau setengah badan yang jelas.",
    "adobe",
  ],
  [
    "black-white",
    "Hitam putih berkarakter",
    "Cahaya dari samping, tekstur kulit asli, dan kontras monokrom yang rapi.",
    "Warna & tekstur",
    "Satu foto wajah dengan detail yang tajam.",
  ],
  [
    "blue-hour",
    "Kota selepas senja",
    "Biru langit sore bertemu lampu kota hangat, dengan wajah tetap natural.",
    "Potret",
    "Satu foto wajah atau setengah badan yang jelas.",
  ],
  [
    "sunset-rim",
    "Cahaya tepi golden hour",
    "Rambut tersapu cahaya sore dengan kilau tipis dan latar yang lembut.",
    "Efek cahaya",
    "Satu foto wajah atau setengah badan yang jelas.",
  ],
  [
    "neon",
    "Dua warna neon",
    "Cahaya cyan dan magenta untuk potret malam yang penuh karakter.",
    "Efek cahaya",
    "Satu foto wajah dengan detail yang jelas.",
  ],
  [
    "double-exposure",
    "Double exposure hutan",
    "Siluet potret berlapis pepohonan, dengan bagian tengah wajah tetap terbaca.",
    "Eksperimental",
    "Satu foto potret dengan siluet rambut yang jelas.",
  ],
  [
    "window-shadow",
    "Bayangan jendela",
    "Garis cahaya jendela jatuh di dinding dan bahu untuk potret minimalis.",
    "Efek cahaya",
    "Satu foto wajah atau setengah badan yang jelas.",
  ],
  [
    "product-splash",
    "Produk dengan splash",
    "Gerak air yang tertahan di sekitar produk, seperti pemotretan high-speed.",
    "Produk",
    "Satu foto produk utuh, label dan tutup terlihat jelas.",
  ],
  [
    "product-caustics",
    "Produk & pantulan air",
    "Pantulan cahaya air di permukaan memberi kesan segar pada foto produk.",
    "Produk",
    "Satu foto produk utuh dengan bentuk dan material yang jelas.",
  ],
  [
    "cover-portrait",
    "Potret sampul editorial",
    "Blazer, cahaya jendela, dan ruang judul untuk konsep personal branding.",
    "Potret",
    "Satu foto wajah atau setengah badan yang jelas.",
  ],
];

export const VIRAL_TEASERS: ViralMetadata[] = rows.map(
  ([id, title, summary, category, references, key]) => ({
    id,
    medium: "photography",
    curation: key ? "research" : "aichemy",
    ...(key ? { research: research[key] } : {}),
    title,
    summary,
    tags: [category],
    references,
    // Tanggal terbit UTC; pemeriksaan publikasi server juga menggunakan UTC.
    publishedAt: "2026-10-22",
    status: "published",
    before: `/assets/v2/viral/photography-v2/${id}-before.webp`,
    after: `/assets/v2/viral/photography-v2/${id}-after.webp`,
  }),
);

export const viralCurationLabel = (
  item: Pick<ViralMetadata, "curation" | "research">,
) =>
  item.curation === "research"
    ? item.research?.basis === "technique"
      ? "Referensi teknik"
      : "Terinspirasi tren"
    : "Kreasi Aichemy";
