import type {
  LegacyServiceId,
  NewServiceId,
  ServiceDefinition,
  ServiceId,
} from "./v2";

export const CURRENT_CATALOG = 3 as const;
export const NEW_SERVICE_IDS: NewServiceId[] = [
  "fashion",
  "beauty",
  "jewelry",
  "creator",
  "graduation",
  "family",
  "pets",
];
export const SERVICE_BASE: Record<NewServiceId, LegacyServiceId> = {
  fashion: "professional",
  beauty: "professional",
  jewelry: "product",
  creator: "professional",
  graduation: "professional",
  family: "professional",
  pets: "product",
};
export const PEOPLE_SERVICES: ServiceId[] = [
  "professional",
  "formal",
  "prewedding",
  "cinematic",
  "relight",
  "fashion",
  "beauty",
  "creator",
  "graduation",
  "family",
];
export const SERVICE_GROUPS = [
  "Semua",
  "Foto orang",
  "Jualan & merek",
  "Ruang & lainnya",
] as const;
export const serviceGroup = (
  id: ServiceId,
): Exclude<(typeof SERVICE_GROUPS)[number], "Semua"> =>
  ["product", "food", "ads", "social", "branding", "jewelry"].includes(id)
    ? "Jualan & merek"
    : ["property", "relight", "pets"].includes(id)
      ? "Ruang & lainnya"
      : "Foto orang";

export const portfolioImage = (id: string, small = false) =>
  `/assets/v3/portfolio/${id}${/^(fashion-|beauty-|creator-|graduation-)/.test(id) || ["professional-profile", "prewedding-modern", "cinematic-city", "relight-window"].includes(id) ? "-v2" : ""}${small ? "-small" : ""}.webp`;
export const PORTFOLIO_OVERRIDES: Record<string, string> = {
  "professional-linkedin": "professional-profile",
  "formal-cv": "formal-front",
  "prewedding-minimal": "prewedding-modern",
  "cinematic-poster": "cinematic-city",
  "relight-balanced": "relight-window",
};

type ServiceRow = {
  id: NewServiceId;
  label: string;
  short: string;
  pitch: string;
  audience: string;
  deliverable: string;
  referenceGuide: string;
  starterNote: string;
  keywords: string[];
  looks: [string, string, string][];
};
export const SERVICE_EXPANSION: ServiceRow[] = [
  {
    id: "fashion",
    label: "Fashion & Katalog Busana",
    short: "Fashion",
    pitch: "Bantu brand menampilkan koleksi tanpa menebak tampilan.",
    audience: "Toko baju, brand lokal, dan penjual aksesori",
    deliverable: "Foto katalog, lookbook, dan kampanye busana",
    referenceGuide:
      "Gunakan foto model berizin serta foto busana tampak depan dan detail di aplikasi AI. Jelaskan mana referensi wajah dan mana referensi pakaian. Periksa motif, jahitan, warna, dan bentuk busana; ini bukan jaminan ukuran atau hasil fitting asli.",
    starterNote:
      "Cocok untuk menawarkan foto katalog per koleksi. Periksa detail baju sebelum diserahkan.",
    keywords: ["baju", "ootd", "lookbook", "model", "fitting", "butik"],
    looks: [
      [
        "catalog",
        "Katalog bersih",
        "Model dewasa mengenakan setelan linen krem di studio putih",
      ],
      [
        "street",
        "Gaya jalanan",
        "Model dewasa mengenakan jaket denim biru dan celana hitam di jalan kota",
      ],
      [
        "modest",
        "Busana tertutup",
        "Model dewasa mengenakan tunik sage dan hijab krem di studio hangat",
      ],
      [
        "resort",
        "Koleksi liburan",
        "Model dewasa mengenakan gaun linen putih di teras vila tropis",
      ],
      [
        "editorial",
        "Editorial berani",
        "Model dewasa dengan blazer hitam di studio abu berbayang terarah",
      ],
      [
        "batik",
        "Batik modern",
        "Model dewasa mengenakan blus batik orisinal di pelataran berarsitektur sederhana",
      ],
    ],
  },
  {
    id: "beauty",
    label: "Beauty & Potret Makeup",
    short: "Beauty",
    pitch: "Tawarkan konsep beauty yang tetap terasa manusiawi.",
    audience: "MUA, salon, brand kosmetik, dan kreator beauty",
    deliverable: "Potret makeup, detail beauty, dan visual kampanye",
    referenceGuide:
      "Lampirkan foto wajah yang jelas dan contoh makeup bila ada di aplikasi AI. Pertahankan identitas serta tekstur kulit. Foto ini ilustrasi konsep, bukan bukti hasil perawatan atau klaim khasiat kosmetik.",
    starterNote:
      "Untuk konsep portofolio MUA dan kampanye. Jangan tampilkan gambar AI sebagai bukti hasil treatment nyata.",
    keywords: ["makeup", "mua", "salon", "skincare", "kosmetik"],
    looks: [
      [
        "natural",
        "Makeup natural",
        "Potret beauty dewasa dengan makeup natural dan tekstur kulit nyata",
      ],
      [
        "dewy",
        "Kulit tampak segar",
        "Potret beauty dewasa dengan makeup dewy dan highlight lembut",
      ],
      [
        "glam",
        "Glam elegan",
        "Potret beauty dewasa dengan makeup glam berwarna hangat",
      ],
      [
        "bridal",
        "Makeup pengantin",
        "Potret beauty dewasa dengan makeup bridal lembut dan busana putih tertutup",
      ],
      [
        "color",
        "Aksen warna",
        "Potret beauty dewasa dengan eyeshadow lilac yang rapi",
      ],
      [
        "mono",
        "Beauty hitam putih",
        "Potret beauty dewasa dengan makeup minimal dalam hitam putih",
      ],
    ],
  },
  {
    id: "jewelry",
    label: "Perhiasan & Aksesori",
    short: "Perhiasan",
    pitch: "Sorot kilau, bentuk, dan detail kecil yang penting.",
    audience: "Toko perhiasan, jam, dan aksesori",
    deliverable: "Foto detail, katalog aksesori, dan visual hadiah",
    referenceGuide:
      "Lampirkan foto produk tajam dan detail pengait, batu, ukiran, atau dial jam di aplikasi AI. Warna, jumlah batu, dan geometri wajib diperiksa. Jangan mengarang kadar logam, merek, atau sertifikasi.",
    starterNote:
      "Cocok untuk paket foto detail produk. Detail kecil tetap perlu diperiksa secara manual.",
    keywords: ["cincin", "kalung", "jam", "anting", "emas", "aksesoris"],
    looks: [
      [
        "ring",
        "Cincin minimalis",
        "Satu cincin emas polos orisinal di atas batu krem",
      ],
      [
        "necklace",
        "Kalung elegan",
        "Satu kalung emas dengan liontin bundar polos di atas kain ivory",
      ],
      [
        "earrings",
        "Anting berkilau",
        "Sepasang anting emas orisinal di atas marmer abu",
      ],
      [
        "watch",
        "Jam premium",
        "Jam tangan orisinal tanpa merek dengan dial sederhana dan tali kulit cokelat",
      ],
      [
        "gift",
        "Kotak hadiah",
        "Cincin emas polos dalam kotak hadiah krem yang terbuka",
      ],
      [
        "dark",
        "Latar gelap",
        "Cincin emas polos orisinal di atas beludru hitam",
      ],
    ],
  },
  {
    id: "creator",
    label: "Konten Influencer & Brand",
    short: "Influencer",
    pitch: "Racik foto konten dengan karakter yang konsisten.",
    audience: "Kreator, pengelola akun, dan brand lokal",
    deliverable: "Foto lifestyle, konsep konten produk, dan kampanye kreator",
    referenceGuide:
      "Lampirkan foto wajah karakter berizin dan, jika digunakan, foto produk terpisah di aplikasi AI. Jelaskan peran tiap referensi. Ungkapkan penggunaan karakter atau konten sintetis bila relevan. Jangan mengarang testimoni, endorsement, atau pengalaman memakai produk.",
    starterNote:
      "Untuk gambar lifestyle dan konsep kampanye, bukan video UGC atau testimoni pelanggan nyata.",
    keywords: [
      "influencer",
      "ugc",
      "lifestyle",
      "konten",
      "ai model",
      "brand ambassador",
    ],
    looks: [
      [
        "cafe",
        "Konten di kafe",
        "Kreator dewasa duduk di kafe dengan cangkir polos tanpa merek",
      ],
      [
        "skincare",
        "Produk di tangan",
        "Kreator dewasa memegang botol skincare putih polos tanpa merek",
      ],
      [
        "desk",
        "Meja kerja kreator",
        "Kreator dewasa duduk di meja kerja yang rapi dengan laptop tanpa merek",
      ],
      [
        "travel",
        "Cerita liburan",
        "Kreator dewasa menikmati kelapa muda di halaman tropis",
      ],
      [
        "city",
        "Jalan sore",
        "Kreator dewasa dalam pakaian kasual berjalan di trotoar kota saat sore",
      ],
      [
        "home",
        "Santai di rumah",
        "Kreator dewasa duduk santai dengan pakaian rumah sopan di ruang bernuansa krem",
      ],
    ],
  },
  {
    id: "graduation",
    label: "Wisuda & Kelulusan",
    short: "Wisuda",
    pitch: "Buat konsep kenangan kelulusan yang lebih personal.",
    audience: "Lulusan, keluarga, dan jasa cetak kenangan",
    deliverable: "Potret wisuda, foto toga, dan konsep kartu kelulusan",
    referenceGuide:
      "Lampirkan foto wajah serta foto toga atau atribut asli di aplikasi AI. Jangan mengarang nama, gelar, lambang, kampus, atau tanggal kelulusan. Konsep AI bukan bukti kelulusan atau dokumentasi acara nyata.",
    starterNote:
      "Untuk kenangan personal dan jasa cetak. Gunakan atribut kampus asli hanya dengan referensi yang sesuai.",
    keywords: ["toga", "kelulusan", "kampus", "sarjana"],
    looks: [
      [
        "studio",
        "Toga di studio",
        "Lulusan dewasa mengenakan toga hitam polos di studio krem",
      ],
      [
        "garden",
        "Taman kampus",
        "Lulusan dewasa mengenakan toga hitam polos di taman hijau",
      ],
      [
        "formal",
        "Potret ijazah",
        "Lulusan dewasa bertoga hitam polos memegang map kosong tanpa lambang",
      ],
      [
        "confetti",
        "Perayaan kecil",
        "Lulusan dewasa bertoga hitam polos dengan sedikit confetti emas",
      ],
      [
        "sunset",
        "Senja kelulusan",
        "Lulusan dewasa bertoga hitam polos di halaman saat sore",
      ],
      [
        "mono",
        "Kenangan hitam putih",
        "Lulusan dewasa bertoga hitam polos dalam potret hitam putih",
      ],
    ],
  },
  {
    id: "family",
    label: "Keluarga & Momen Spesial",
    short: "Keluarga",
    pitch: "Konsep kebersamaan untuk kenangan yang hangat.",
    audience: "Keluarga, pasangan, dan usaha cetak foto",
    deliverable: "Potret keluarga, ulang tahun, dan kartu ucapan",
    referenceGuide:
      "Lampirkan satu foto grup yang menampilkan semua orang dengan jelas di aplikasi AI. Pertahankan jumlah orang, identitas, usia, dan hubungan posisi. Gunakan persetujuan orang yang bersangkutan dan wali anak. Periksa setiap wajah sebelum dicetak.",
    starterNote:
      "Untuk konsep potret keluarga; cek jumlah orang dan kemiripan setiap wajah sebelum dikirim.",
    keywords: ["keluarga", "ulang tahun", "lebaran", "hari raya", "kenangan"],
    looks: [
      [
        "studio",
        "Studio keluarga",
        "Dua orang tua dewasa dan seorang anak berpakaian krem sopan di studio hangat",
      ],
      [
        "garden",
        "Piknik keluarga",
        "Dua orang tua dewasa dan seorang anak duduk di taman hijau",
      ],
      [
        "celebration",
        "Ulang tahun",
        "Keluarga tiga orang di ruang rumah dengan kue polos dan dekorasi sederhana",
      ],
      [
        "festive",
        "Hari raya",
        "Keluarga tiga orang mengenakan busana tertutup warna sage di ruang rumah",
      ],
      [
        "home",
        "Cerita di rumah",
        "Keluarga tiga orang duduk berdekatan di sofa rumah yang hangat",
      ],
      [
        "beach",
        "Sore di pantai",
        "Keluarga tiga orang berjalan di pantai saat sore",
      ],
    ],
  },
  {
    id: "pets",
    label: "Foto Hewan Kesayangan",
    short: "Hewan",
    pitch: "Bantu pemilik hewan membuat kenangan yang personal.",
    audience: "Pemilik hewan, pet shop, dan usaha cetak",
    deliverable: "Potret hewan, konsep kartu, dan foto produk pet shop",
    referenceGuide:
      "Lampirkan foto hewan yang tajam di aplikasi AI. Pertahankan spesies, pola bulu, warna mata, proporsi, dan ciri khasnya. Jangan mengarang perubahan fisik atau menyarankan pose berbahaya.",
    starterNote:
      "Untuk potret personal dan konsep konten pet shop. Hasil bukan dokumentasi kejadian nyata.",
    keywords: ["kucing", "anjing", "pet", "petshop", "hewan"],
    looks: [
      [
        "cat",
        "Kucing di studio",
        "Kucing domestik berbulu jingga dan putih duduk di studio krem",
      ],
      [
        "dog",
        "Anjing di taman",
        "Anjing golden retriever dewasa duduk santai di taman hijau",
      ],
      [
        "cozy",
        "Sudut nyaman",
        "Kucing domestik jingga dan putih berbaring di atas selimut krem",
      ],
      [
        "birthday",
        "Ulang tahun hewan",
        "Anjing golden retriever di dekat dekorasi ulang tahun sederhana yang aman",
      ],
      [
        "detail",
        "Detail si kesayangan",
        "Potret dekat wajah kucing domestik jingga dan putih dengan mata tajam",
      ],
      [
        "outdoor",
        "Main di halaman",
        "Anjing golden retriever dewasa di halaman hijau pada sore hari",
      ],
    ],
  },
];

export const NEW_SERVICES: ServiceDefinition[] = SERVICE_EXPANSION.map((s) => ({
  ...s,
  recipeId: SERVICE_BASE[s.id] === "product" ? "product" : "portrait",
  color: "#ece8f7",
  group: serviceGroup(s.id),
  sets: s.looks.map(([slug, label, subject]) => ({
    id: `${s.id}-${slug}`,
    serviceId: s.id,
    label,
    subject,
    description: `${subject}. Ubah detailnya sesuai kebutuhanmu.`,
    input: s.referenceGuide,
    changes: `Arah ${label.toLocaleLowerCase("id")} dengan pilihan yang bisa diubah.`,
    preserved:
      s.id === "pets"
        ? "Pola bulu, warna mata, dan proporsi hewan."
        : s.id === "jewelry"
          ? "Bentuk, bahan, detail, dan tanda produk."
          : "Identitas wajah, usia, warna kulit, dan ciri personal.",
    selections: {
      concept: slug,
      ratio: "4:5",
      lighting: /sunset|beach|outdoor|resort/.test(slug) ? "golden" : "soft",
      ...(s.id === "jewelry"
        ? {
            props: "none",
            background: slug === "dark" ? "__skip" : "cream",
            surface:
              slug === "dark"
                ? "velvet"
                : slug === "necklace"
                  ? "linen"
                  : slug === "earrings"
                    ? "marble"
                    : slug === "gift"
                      ? "box"
                      : slug === "watch"
                        ? "stand"
                        : "stone",
            distance: "whole",
            angle: "three-quarter",
          }
        : s.id === "pets"
          ? {
              background: /dog|outdoor/.test(slug)
                ? "garden"
                : /cozy|birthday/.test(slug)
                  ? "home"
                  : "studio",
              petPose: /cozy/.test(slug)
                ? "rest"
                : /outdoor/.test(slug)
                  ? "stand"
                  : "sit",
            }
          : {
              background: ["fashion", "creator", "family"].includes(s.id)
                ? `location-${slug}`
                : /garden|sunset/.test(slug)
                  ? "greenery"
                  : "studio-cream",
              ...(!["family", "beauty"].includes(s.id)
                ? {
                    pose: /street|city/.test(slug)
                      ? "walk"
                      : /modest|cafe|desk|home/.test(slug)
                        ? "seated"
                        : /resort|sunset/.test(slug)
                          ? "threequarter-right"
                          : /editorial|garden/.test(slug)
                            ? "three-quarter"
                            : slug === "mono"
                              ? "profile"
                              : "standing",
                  }
                : {}),
              ...(s.id === "beauty"
                ? {
                    faceAngle:
                      slug === "dewy"
                        ? "right"
                        : slug === "glam"
                          ? "left"
                          : slug === "color"
                            ? "profile-left"
                            : slug === "mono"
                              ? "profile-right"
                              : "front",
                  }
                : {}),
              expression: "neutral",
              lens: "85",
              depth: "balanced",
              ...(s.id !== "family"
                ? {
                    framing:
                      s.id === "beauty"
                        ? "close"
                        : s.id === "fashion"
                          ? "full"
                          : "waist",
                  }
                : {}),
              ...(s.id === "creator" ? { wardrobe: "original" } : {}),
            }),
      ...(/mono/.test(slug) ? { treatment: "mono" } : { treatment: "__skip" }),
    },
    visualSrc: portfolioImage(`${s.id}-${slug}`),
  })),
}));

export function serviceChecklist(id: ServiceId): string[] {
  const core = [
    "Rasio dan resolusi cocok untuk kebutuhan klien.",
    "Izin foto referensi dan hak penggunaan komersial sudah diperiksa.",
  ];
  const checks: Partial<Record<ServiceId, string[]>> = {
    professional: [
      "Wajah tetap mirip, tekstur kulit wajar, dan pakaian terlihat rapi.",
      "Tangan, gigi, rambut, serta tepi tubuh tidak janggal.",
    ],
    formal: [
      "Posisi wajah, warna latar, ukuran, dan potongan sesuai syarat instansi.",
      "Wajah tidak berubah. Ini bukan pengganti perekaman KTP-el.",
    ],
    prewedding: [
      "Kedua wajah tetap mirip dan tidak tertukar atau menyatu.",
      "Tangan, busana pasangan, dan interaksi tubuh terlihat alami.",
    ],
    product: [
      "Bentuk, kemasan, label, dan warna produk tidak berubah.",
      "Dekorasi tidak mengesankan bahan atau khasiat yang tidak ada.",
    ],
    food: [
      "Hidangan, bahan yang terlihat, porsi, dan wadah tetap akurat.",
      "Tidak ada topping, ukuran porsi, atau klaim gizi yang dikarang.",
    ],
    fashion: [
      "Motif, jahitan, warna, dan bentuk baju sesuai referensi.",
      "Wajah, tangan, dan jatuh kain wajar. Jangan menjamin ukuran dari gambar AI.",
    ],
    beauty: [
      "Wajah tetap mirip dan kulit tidak menjadi plastik.",
      "Labeli konsep AI. Jangan jadikan gambar ini bukti hasil treatment atau khasiat kosmetik.",
    ],
    jewelry: [
      "Jumlah batu, pengait, ukiran, dan bentuk aksesori akurat.",
      "Tidak ada kadar logam, merek, atau sertifikasi yang dikarang.",
    ],
    creator: [
      "Wajah karakter dan produk tetap konsisten.",
      "Tidak mengarang testimoni atau endorsement. Ungkapkan konten sintetis bila relevan.",
    ],
    graduation: [
      "Wajah dan atribut toga sesuai referensi.",
      "Nama kampus, gelar, lambang, dan tanggal tidak dikarang.",
    ],
    family: [
      "Jumlah anggota keluarga benar dan setiap wajah tetap berbeda.",
      "Usia, tangan, serta posisi tubuh wajar. Izin wali anak sudah ada.",
    ],
    pets: [
      "Spesies, pola bulu, warna mata, dan ciri khas hewan tidak berubah.",
      "Anatomi wajar dan tidak ada pose atau properti yang membahayakan.",
    ],
    property: [
      "Dinding, pintu, jendela, dan ukuran relatif ruang tidak berubah.",
      "Tambahan furnitur diberi label ilustrasi virtual staging.",
    ],
    branding: [
      "Nama merek tepat dan bentuk tetap terbaca pada ukuran kecil.",
      "Orisinalitas, lisensi, dan file vektor akhir diperiksa sebelum penyerahan.",
    ],
  };
  return [
    ...(checks[id] ?? [
      "Detail subjek dan identitas tetap akurat.",
      "Teks serta klaim promosi sesuai input, bukan karangan generator.",
    ]),
    ...core,
  ];
}
