import { SERVICES, ALL_STUDIO_SETS } from "./v2-catalog";
import { VIRAL_TEASERS } from "./viral-photography";

export const PRODUCT_COUNTS = {
  services: SERVICES.length,
  styles: ALL_STUDIO_SETS.length,
  photographyPrompts: VIRAL_TEASERS.length,
};
const salesOrder = [
  "professional",
  "product",
  "prewedding",
  "fashion",
  "creator",
  "food",
];
export const SALES_SERVICES = [
  ...salesOrder.map((id) => SERVICES.find((s) => s.id === id)!),
  ...SERVICES.filter((s) => !salesOrder.includes(s.id)),
];

// Illustrative prices chosen to explain arithmetic, not market-rate estimates.
export const INCOME_EXAMPLES = [
  {
    id: "professional",
    label: "Jasa foto profil",
    client: "Untuk pelamar kerja & pemilik bisnis",
    orders: 5,
    price: 50000,
    image: "professional-linkedin",
  },
  {
    id: "product",
    label: "Jasa foto produk",
    client: "Untuk toko online & UMKM",
    orders: 10,
    price: 75000,
    image: "product-skincare",
  },
  {
    id: "prewedding",
    label: "Jasa foto prewedding",
    client: "Untuk pasangan & undangan digital",
    orders: 4,
    price: 150000,
    image: "prewedding-minimal",
  },
];

export const SIMPLE_SERVICES: Record<
  string,
  { label: string; result: string; customer: string }
> = {
  fashion: {
    label: "Foto fashion & baju",
    result: "Foto katalog, koleksi busana, dan lookbook.",
    customer: "Brand baju, butik & toko online",
  },
  beauty: {
    label: "Foto beauty & makeup",
    result: "Konsep potret makeup dan kampanye kosmetik.",
    customer: "MUA, salon & brand kosmetik",
  },
  jewelry: {
    label: "Foto perhiasan & aksesori",
    result: "Foto cincin, kalung, jam, dan detail aksesori.",
    customer: "Toko perhiasan & aksesori",
  },
  creator: {
    label: "Konten influencer",
    result:
      "Foto lifestyle dan konsep konten produk dengan karakter konsisten.",
    customer: "Kreator, brand & pengelola akun",
  },
  graduation: {
    label: "Foto wisuda",
    result: "Potret toga dan konsep kenangan kelulusan.",
    customer: "Lulusan & usaha cetak foto",
  },
  family: {
    label: "Foto keluarga",
    result: "Potret keluarga, hari raya, dan ulang tahun.",
    customer: "Keluarga & usaha cetak kenangan",
  },
  pets: {
    label: "Foto hewan kesayangan",
    result: "Potret personal dan konsep konten pet shop.",
    customer: "Pemilik hewan & pet shop",
  },
  professional: {
    label: "Foto profil profesional",
    result: "Foto LinkedIn, profil usaha, dan wisuda.",
    customer: "Pelamar kerja & pemilik bisnis",
  },
  formal: {
    label: "Pas foto",
    result: "Foto rapi untuk CV dan kebutuhan administrasi.",
    customer: "Pelamar kerja & kebutuhan kartu",
  },
  prewedding: {
    label: "Foto prewedding",
    result: "Foto pasangan untuk undangan dan kenangan.",
    customer: "Pasangan & jasa pernikahan",
  },
  product: {
    label: "Foto produk",
    result: "Foto katalog dan promosi yang menarik dilihat.",
    customer: "Toko online & UMKM",
  },
  food: {
    label: "Foto makanan",
    result: "Foto menu, kopi, dan camilan untuk promosi.",
    customer: "Kafe & usaha kuliner",
  },
  ads: {
    label: "Banner & iklan",
    result: "Visual promosi untuk toko dan media sosial.",
    customer: "UMKM & toko online",
  },
  social: {
    label: "Konten media sosial",
    result: "Foto feed, sampul video, dan konten produk.",
    customer: "Kreator & pemilik merek",
  },
  cinematic: {
    label: "Foto sinematik",
    result: "Foto berkarakter untuk poster dan konten kreatif.",
    customer: "Kreator & musisi",
  },
  property: {
    label: "Foto properti",
    result: "Foto ruangan dan konsep penataan interior.",
    customer: "Agen properti & penginapan",
  },
  branding: {
    label: "Logo & merek",
    result: "Ide logo, simbol, dan tampilan merek.",
    customer: "Usaha baru & merek lokal",
  },
  relight: {
    label: "Edit cahaya & latar",
    result: "Ubah suasana foto lewat cahaya dan latar baru.",
    customer: "Pemilik foto & fotografer",
  },
};
