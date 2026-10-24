import type {
  ServiceDefinition,
  LegacyServiceId as ServiceId,
  StudioSet,
} from "./v2";
import {
  NEW_SERVICES,
  serviceGroup,
  PORTFOLIO_OVERRIDES,
  portfolioImage,
} from "./services-v3";

type SetInput = [string, string, string, Record<string, string>, string?];
const caseDetails: Record<string, [string, string]> = {
  "professional-linkedin": [
    "Profil karier dengan wajah terbaca dan tampilan rapi.",
    "Pakaian kasual diarahkan menjadi blazer, latar studio netral, dan cahaya lembut.",
  ],
  "professional-business": [
    "Potret personal untuk halaman bisnis atau profil pemilik usaha.",
    "Styling profesional, suasana kantor hangat, dan komposisi editorial.",
  ],
  "professional-graduation": [
    "Konsep potret wisuda personal tanpa lambang institusi rekaan.",
    "Busana toga, arah cahaya studio, dan nuansa perayaan yang tenang.",
  ],
  "formal-cv": [
    "Foto wajah yang rapi untuk kebutuhan lamaran dan CV.",
    "Pakaian profesional, latar polos, dan wajah menghadap kamera.",
  ],
  "formal-administration": [
    "Arah foto formal yang dapat disesuaikan dengan persyaratan instansi.",
    "Kemeja rapi, latar biru, serta pencahayaan wajah lebih merata.",
  ],
  "formal-badge": [
    "Potret yang jelas untuk kartu profesi atau profil organisasi.",
    "Blazer, latar merah polos, serta potongan kepala dan bahu.",
  ],
  "prewedding-minimal": [
    "Konsep pasangan yang elegan dalam studio sederhana.",
    "Styling busana pasangan, latar hangat minimalis, dan cahaya lembut.",
  ],
  "prewedding-garden": [
    "Cerita pasangan dengan suasana taman romantis.",
    "Busana sesi pasangan, taman hijau, dan nuansa cahaya hangat.",
  ],
  "prewedding-traditional": [
    "Arah adat modern yang detailnya mengikuti brief pasangan.",
    "Busana terinspirasi adat dan penataan studio yang lebih formal.",
  ],
  "product-marketplace": [
    "Katalog bersih agar bentuk dan detail produk mudah diperiksa.",
    "Latar putih seamless, sudut katalog, dan bayangan kontak yang lembut.",
  ],
  "product-skincare": [
    "Hero produk dengan material dan styling yang lebih premium.",
    "Permukaan batu, nuansa peach, aksen citrus, dan cahaya terarah.",
  ],
  "product-fashion": [
    "Editorial aksesori dengan perhatian pada bentuk dan material.",
    "Pedestal netral, kain pendukung, serta cahaya studio lembut.",
  ],
  "food-restaurant": [
    "Foto menu yang menjaga hidangan tetap mudah dikenali.",
    "Cahaya restoran hangat, meja, serta penataan di sekitar piring.",
  ],
  "food-coffee": [
    "Visual menu minuman untuk kafe atau kedai kopi.",
    "Meja kayu, cahaya jendela, serta suasana kafe di belakang gelas.",
  ],
  "food-snack": [
    "Tampilkan tekstur camilan untuk etalase usaha kuliner.",
    "Permukaan kayu, linen, dan cahaya hangat yang menonjolkan tekstur.",
  ],
  "ads-promo": [
    "Konsep kampanye produk dengan ruang untuk penawaranmu sendiri.",
    "Set dekoratif hijau, pencahayaan produk, dan penataan promosi tanpa klaim rekaan.",
  ],
  "ads-marketplace": [
    "Arah visual banner toko; rasio akhir dapat disesuaikan.",
    "Set geometris mint–krem dan ruang komposisi yang lebih lega.",
  ],
  "ads-story": [
    "Konsep iklan vertikal dengan produk sebagai pusat perhatian.",
    "Latar kain hijau, gerak dekoratif, dan ruang aman untuk teks.",
  ],
  "social-branding": [
    "Arah feed dengan material dan warna merek yang konsisten.",
    "Permukaan terracotta, linen krem, dan bayangan tanaman lembut.",
  ],
  "social-product": [
    "Konten produk dengan nuansa visual yang tenang dan terarah.",
    "Latar sage, permukaan batu reflektif, dan cahaya editorial.",
  ],
  "social-cover": [
    "Komposisi cover dengan area judul yang bisa dirapikan di editor.",
    "Set krem, bayangan lengkung, dan area atas yang sengaja dikosongkan.",
  ],
  "cinematic-poster": [
    "Eksplorasi poster fiksi orisinal tanpa judul atau kredit rekaan.",
    "Suasana adegan, cahaya dramatis, dan arah warna sinematik.",
  ],
  "cinematic-street": [
    "Editorial jalanan dengan karakter cahaya kota.",
    "Latar jalanan, atmosfer malam, dan pemisahan cahaya pada subjek.",
  ],
  "cinematic-travel": [
    "Konsep perjalanan yang harus dilabeli sebagai ilustrasi.",
    "Lanskap pesisir konseptual dan nuansa matahari senja.",
  ],
  "property-listing": [
    "Foto listing dengan tampilan ruang yang terang dan proporsional.",
    "Keseimbangan cahaya dan presentasi ruang; bukan memperbesar denah.",
  ],
  "property-interior": [
    "Sorot material serta karakter interior yang sudah ada.",
    "Sudut komposisi, pencahayaan, dan kerapian presentasi interior.",
  ],
  "property-staging": [
    "Ilustrasi potensi penataan, bukan foto furnitur yang benar-benar tersedia.",
    "Furnitur dan dekorasi non-permanen; hasil diberi label virtual staging.",
  ],
  "branding-monogram": [
    "Mulai eksplorasi merek dari bentuk huruf yang sederhana.",
    "Brief/sketsa dikembangkan menjadi konsep monogram yang lebih terarah.",
  ],
  "branding-symbol": [
    "Terjemahkan gagasan merek menjadi konsep simbol orisinal.",
    "Penyederhanaan bentuk, ruang negatif, dan arah warna identitas.",
  ],
  "branding-playful": [
    "Eksplorasi identitas yang ramah dan ekspresif.",
    "Bentuk organik, warna aksen, serta karakter tipografi.",
  ],
  "relight-balanced": [
    "Perbaiki arah cahaya tanpa mengganti identitas subjek.",
    "Eksposur wajah dan keseimbangan bayangan diperbaiki.",
  ],
  "relight-golden": [
    "Arah cahaya keemasan untuk foto sumber yang sama.",
    "Cahaya tepi hangat dan suasana latar mengikuti pencahayaan baru.",
  ],
  "relight-backdrop": [
    "Ganti suasana studio dengan subjek yang tetap konsisten.",
    "Latar studio dan arah cahaya baru, tanpa mengganti wajah.",
  ],
};
const EXTRA_SET_NAMES: Record<ServiceId, [string, string, string][]> = {
  professional: [
    ["founder", "Pemilik bisnis", "Pemilik bisnis Indonesia"],
    ["consultant-woman", "Konsultan wanita", "Potret profesional Indonesia"],
    ["consultant-man", "Konsultan pria", "Potret profesional Indonesia"],
    ["graduate-woman", "Wisuda wanita", "Lulusan dengan toga"],
    ["graduate-man", "Wisuda pria", "Lulusan dengan toga"],
    ["creative", "Kreator", "Kreator Indonesia"],
    ["medical", "Profesional medis", "Profesional kesehatan"],
    ["architect", "Arsitek", "Arsitek Indonesia"],
    ["teacher", "Pengajar", "Pengajar Indonesia"],
    ["hijab", "Profil berhijab", "Profesional berhijab"],
    ["owner", "Pemilik usaha", "Pemilik usaha lokal"],
    ["team-lead", "Pemimpin tim", "Pemimpin tim profesional"],
    ["monochrome", "Monokrom", "Potret hitam putih"],
  ],
  formal: [
    ["blue-hijab", "Biru muda hijab", "Pas foto menghadap kamera"],
    ["gray-man", "Abu formal pria", "Pas foto menghadap kamera"],
    ["blue-woman", "Biru formal wanita", "Pas foto menghadap kamera"],
    ["red-hijab", "Merah dan hijab krem", "Pas foto menghadap kamera"],
    ["blue-shirt", "Biru muda pria", "Pas foto menghadap kamera"],
    ["gray-woman", "Abu formal wanita", "Pas foto menghadap kamera"],
    ["white-neutral", "Putih netral", "Pas foto menghadap kamera"],
    ["navy-man", "Navy formal pria", "Pas foto menghadap kamera"],
    ["gray-neutral", "Abu netral", "Pas foto menghadap kamera"],
    ["red-neutral", "Merah formal", "Pas foto menghadap kamera"],
    ["hijab-gray", "Hijab abu lembut", "Pas foto menghadap kamera"],
    ["hijab-rose", "Hijab dusty pink", "Pas foto menghadap kamera"],
    ["hijab-navy", "Hijab navy", "Pas foto menghadap kamera"],
  ],
  prewedding: [
    ["seaside", "Pantai senja", "Pasangan di pantai saat senja"],
    ["ballroom", "Ballroom klasik", "Pasangan di ballroom"],
    ["heritage", "Pelataran heritage", "Pasangan di halaman heritage"],
    ["dinner", "Makan malam intim", "Pasangan saat makan malam"],
    ["mountain", "Pegunungan", "Pasangan di pegunungan"],
    ["glasshouse", "Rumah kaca", "Pasangan di rumah kaca"],
    ["modern-adat", "Adat modern", "Pasangan dengan busana adat modern"],
    ["rain", "Hujan romantis", "Pasangan di bawah payung"],
    ["forest", "Hutan hijau", "Pasangan di jalan setapak"],
    ["monochrome", "Hitam putih", "Potret pasangan monokrom"],
    ["pastel-morning", "Pagi pastel", "Pasangan di taman pagi"],
    ["city-night", "Kota malam", "Pasangan di kota malam"],
    ["close-portrait", "Potret dekat", "Potret pasangan intim"],
  ],
  product: [
    ["sneaker", "Katalog sepatu", "Sepatu putih untuk katalog"],
    ["watch", "Aksesori premium", "Jam tangan metal"],
    ["handbag", "Tas kulit", "Tas kulit di studio"],
    ["supplement", "Jar minimalis", "Wadah polos tanpa tulisan"],
    ["jewelry", "Perhiasan", "Perhiasan emas sederhana"],
    ["candle", "Lilin aromaterapi", "Lilin kaca di studio"],
    ["skincare-jar", "Skincare jar", "Krim skincare tanpa merek"],
    ["headphones", "Audio modern", "Headphone minimalis"],
    ["perfume", "Parfum kaca", "Botol parfum tanpa label"],
    ["soap", "Sabun artisan", "Sabun handmade"],
    ["sunglasses", "Kacamata", "Kacamata di atas batu"],
    ["plant", "Tanaman dekoratif", "Tanaman hias dalam pot"],
    ["chocolate", "Cokelat premium", "Kotak cokelat tanpa tulisan"],
  ],
  food: [
    ["satay", "Sate nusantara", "Sate dengan saus kacang"],
    ["gado-gado", "Gado-gado", "Gado-gado dengan sayuran"],
    ["mie", "Mi goreng", "Mi goreng di piring"],
    ["martabak", "Martabak manis", "Potongan martabak"],
    ["pisang", "Pisang goreng", "Pisang goreng hangat"],
    ["iced-coffee", "Kopi susu dingin", "Segelas kopi susu"],
    ["latte", "Latte art", "Cangkir latte"],
    ["citrus-tea", "Teh jeruk", "Teh jeruk dingin"],
    ["cake", "Kue cokelat", "Sepotong kue cokelat"],
    ["pandan", "Kue pandan", "Potongan kue pandan"],
    ["fish", "Ikan bakar", "Ikan bakar dengan lalapan"],
    ["noodles", "Menu mi", "Mangkuk mi kuah"],
    ["klepon", "Klepon", "Klepon kelapa"],
  ],
  ads: [
    ["amber", "Produk terracotta", "Produk di atas pedestal"],
    ["dark-premium", "Premium gelap", "Produk dengan latar gelap"],
    ["water-light", "Cahaya berkilau", "Produk dengan bayangan air"],
    ["amber-bottle", "Botol amber", "Botol dalam cahaya hangat"],
    ["pink-stage", "Panggung pink", "Produk di panggung pastel"],
    ["green-bottle", "Botani segar", "Produk dengan aksen hijau"],
    ["flatlay", "Flat lay", "Komposisi produk dari atas"],
    ["terracotta", "Terracotta hangat", "Produk di latar terracotta"],
    ["tube-clean", "Produk minimal", "Produk di latar bersih"],
    ["playful", "Bentuk playful", "Produk dengan grafis ceria"],
    ["soft-floral", "Lembut dan floral", "Produk di set bunga"],
    ["green-stage", "Panggung hijau", "Produk di panggung geometris"],
    ["warm-studio", "Studio hangat", "Produk dalam set hangat"],
  ],
  social: [
    [
      "flatlay-stationery",
      "Flat lay alat tulis",
      "Flat lay notebook dan alat tulis",
    ],
    ["creator-product", "Kreator dan produk", "Kreator memegang produk"],
    ["beauty-story", "Story kecantikan", "Konten vertikal skincare"],
    ["packaging", "Kemasan UMKM", "Produk dengan kemasan kertas"],
    ["cafe", "Suasana kafe", "Kopi untuk konten kafe"],
    ["carousel", "Cover carousel", "Sampul konten produk"],
    ["beauty-flatlay", "Flat lay skincare", "Susunan produk skincare"],
    ["boutique", "Detail butik", "Konten butik pakaian"],
    ["food-content", "Konten makanan", "Hidangan dari atas"],
    ["travel-creator", "Kreator perjalanan", "Potret kreator saat bepergian"],
    ["mint-product", "Produk mint", "Produk di set hijau minimal"],
    [
      "editorial-portrait",
      "Potret editorial",
      "Potret kreator bernuansa hangat",
    ],
    ["neutral-backdrop", "Latar brand netral", "Latar sederhana untuk konten"],
  ],
  cinematic: [
    ["window", "Cahaya jendela", "Potret sinematik"],
    ["night-market", "Pasar malam", "Adegan malam di kota"],
    ["station", "Stasiun", "Adegan menunggu perjalanan"],
    ["mountain-road", "Jalan pegunungan", "Adegan perjalanan"],
    ["monochrome", "Monokrom kota", "Editorial hitam putih"],
    ["gold-field", "Padang senja", "Potret di cahaya senja"],
    ["blue-studio", "Studio biru", "Potret dramatis biru"],
    ["cafe", "Kafe malam", "Adegan kafe"],
    ["sunset-city", "Kota saat senja", "Siluet kota"],
    ["forest", "Hutan sinematik", "Adegan di hutan"],
    ["close-portrait", "Potret dekat", "Potret sinematik dekat"],
    ["city-motion", "Gerak kota", "Adegan jalanan malam"],
    ["backstage", "Suasana panggung", "Potret editorial malam"],
  ],
  property: [
    ["cozy-living", "Ruang keluarga", "Ruang keluarga nyaman"],
    ["dining-room", "Ruang makan", "Ruang makan modern"],
    ["kitchen", "Dapur modern", "Dapur untuk katalog properti"],
    ["bathroom", "Kamar mandi", "Kamar mandi modern"],
    ["heritage", "Rumah heritage", "Interior rumah heritage"],
    ["natural-light", "Cahaya alami", "Ruang bercahaya alami"],
    ["wood-detail", "Detail kayu", "Detail interior kayu"],
    ["neutral-lounge", "Lounge netral", "Interior ruang keluarga netral"],
    ["green-accent", "Aksen hijau", "Interior dengan aksen tanaman"],
    ["compact-apartment", "Apartemen ringkas", "Ruang apartemen modern"],
    ["tropical-lounge", "Lounge tropis", "Ruang dengan material tropis"],
    ["reading-nook", "Sudut baca", "Sudut baca di dekat jendela"],
    ["staircase", "Tangga elegan", "Tangga interior"],
  ],
  branding: [
    ["coffee-bean", "Biji kopi", "Simbol sederhana untuk merek kopi"],
    ["home-mark", "Rumah", "Simbol sederhana untuk properti"],
    ["botanical", "Botani", "Simbol daun sederhana"],
    ["bowl", "Mangkuk", "Simbol untuk usaha kuliner"],
    ["wedding-rings", "Cincin", "Simbol untuk jasa pernikahan"],
    ["aperture", "Apertur", "Simbol kamera orisinal"],
    ["wave", "Gelombang", "Simbol garis mengalir"],
    ["arch", "Lengkung", "Simbol bentuk lengkung"],
    ["flower", "Bunga", "Simbol bunga sederhana"],
    ["tile", "Geometri ubin", "Simbol geometri abstrak"],
    ["mountain", "Gunung", "Simbol gunung sederhana"],
    ["arrow", "Arah", "Simbol panah abstrak"],
    ["droplet", "Tetes", "Simbol tetes sederhana"],
  ],
  relight: [
    ["high-key", "Terang merata", "Potret dengan cahaya high-key"],
    ["warm-side-light", "Samping keemasan", "Cahaya hangat dari samping"],
    ["cool", "Samping sejuk", "Cahaya lembut bernuansa sejuk"],
    ["rim-left", "Tepi dari kiri", "Cahaya pemisah dari kiri"],
    ["rim-right", "Tepi dari kanan", "Cahaya pemisah dari kanan"],
    ["rembrandt", "Potret berkarakter", "Bayangan lembut pada satu sisi wajah"],
    ["butterfly", "Cahaya dari atas", "Cahaya potret dari arah depan atas"],
    [
      "dramatic",
      "Kontras terarah",
      "Bayangan lebih tegas tetapi detail tetap terlihat",
    ],
    ["overcast", "Lembut seperti mendung", "Cahaya menyebar dan rata"],
    ["warm-bounce", "Pantulan hangat", "Cahaya isi bernuansa hangat"],
    ["neutral", "Studio netral", "Cahaya studio seimbang"],
    ["low-key", "Latar lebih gelap", "Potret dengan cahaya low-key terkontrol"],
    [
      "backlight",
      "Dari belakang",
      "Cahaya belakang dengan detail depan terjaga",
    ],
  ],
};
const EXTRA_SET_POOLS: Record<ServiceId, Record<string, string[]>> = {
  professional: {
    background: ["gray", "office", "cream", "peach", "white"],
    wardrobe: ["blazer", "shirt", "graduation", "hijab"],
    pose: ["front", "three-quarter", "standing", "seated"],
    expression: ["smile", "confident", "neutral"],
    lighting: ["soft", "window", "golden", "rim", "rembrandt", "dramatic"],
    lens: ["50", "85", "100", "35"],
    ratio: ["4:5", "1:1", "3:4", "2:3"],
  },
  formal: {
    background: ["white", "gray", "blue", "red", "cream"],
    wardrobe: ["shirt", "blazer", "hijab", "original"],
    expression: ["neutral", "smile"],
    lighting: ["soft", "window", "golden", "rim"],
    lens: ["50", "85", "100"],
    crop: ["head", "chest"],
    pose: ["front"],
  },
  prewedding: {
    couplePose: ["facing", "walk", "seated", "embrace"],
    wardrobe: ["couple-formal", "kebaya", "hijab", "original"],
    background: ["garden", "cream", "peach", "blue"],
    lighting: ["soft", "window", "golden", "rim"],
    lens: ["50", "85", "100", "35"],
    ratio: ["4:5", "3:2", "1:1", "9:16"],
    depth: ["balanced", "shallow", "deep"],
  },
  product: {
    angle: ["eye", "three-quarter", "overhead", "macro"],
    surface: ["white", "stone", "wood", "pastel"],
    background: ["white", "cream", "peach", "gray"],
    lighting: ["soft", "window", "golden", "rim"],
    props: ["none", "botanical", "citrus", "fabric"],
    ratio: ["1:1", "4:5", "3:4", "16:9"],
  },
  food: {
    presentation: ["rustic", "clean", "flatlay", "close"],
    angle: ["eye", "three-quarter", "overhead", "macro"],
    surface: ["wood", "stone", "white", "pastel"],
    lighting: ["soft", "window", "golden", "rim"],
    props: ["none", "botanical", "citrus", "fabric"],
    ratio: ["4:5", "1:1", "3:2", "16:9"],
  },
  ads: {
    layout: ["left", "top", "center", "bottom"],
    palette: ["mint", "coral", "violet", "cream", "warm"],
    typography: ["sans", "serif", "bold"],
    ratio: ["4:5", "16:9", "9:16", "1:1"],
    lighting: ["soft", "window", "golden", "rim"],
  },
  social: {
    layout: ["left", "top", "center", "bottom"],
    palette: ["coral", "mint", "violet", "cream", "warm"],
    typography: ["sans", "serif", "bold"],
    ratio: ["1:1", "4:5", "9:16", "16:9"],
    lighting: ["soft", "window", "golden", "rim"],
  },
  cinematic: {
    style: ["natural", "editorial", "cinematic", "monochrome"],
    pose: ["front", "three-quarter", "seated", "standing"],
    lighting: ["soft", "window", "golden", "rim", "rembrandt", "dramatic"],
    lens: ["35", "50", "85", "100"],
    palette: ["ink", "teal", "warm", "violet", "coral"],
    ratio: ["2:3", "16:9", "4:5", "9:16"],
    depth: ["balanced", "shallow", "deep"],
  },
  property: {
    view: ["wide", "straight", "detail", "corner"],
    lighting: ["soft", "window", "golden"],
    style: ["natural", "editorial"],
    palette: ["cream", "warm", "mint", "ink"],
    ratio: ["4:3", "16:9", "4:5", "3:4"],
  },
  branding: {
    mark: ["monogram", "symbol", "playful"],
    palette: ["violet", "coral", "mint", "cream", "ink"],
    typography: ["sans", "serif", "bold"],
    ratio: ["1:1", "4:5", "3:4"],
  },
  relight: {
    lighting: ["soft", "window", "golden", "rim", "rembrandt", "dramatic"],
    background: ["original", "white", "gray", "cream", "blue", "peach"],
    style: ["natural", "editorial", "cinematic", "monochrome"],
    depth: ["balanced", "shallow", "deep"],
    ratio: ["4:5", "1:1", "3:2", "9:16"],
  },
};
function service(
  id: ServiceId,
  recipeId: string,
  label: string,
  short: string,
  pitch: string,
  audience: string,
  deliverable: string,
  color: string,
  referenceGuide: string,
  input: SetInput[],
): ServiceDefinition {
  const featuredSets = input.map(
    ([key, name, subject, selections, visualSrc]) => ({
      id: `${id}-${key}`,
      serviceId: id,
      label: name,
      subject,
      input:
        id === "branding"
          ? "Brief atau sketsa konsep merek."
          : id === "prewedding"
            ? "Foto awal pasangan dengan pakaian sehari-hari."
            : ["professional", "formal", "cinematic", "relight"].includes(id)
              ? "Foto awal satu orang dengan pencahayaan biasa."
              : id === "property"
                ? "Foto ruang asli sebelum penataan visual."
                : id === "food"
                  ? "Foto hidangan atau minuman dari dapur/kedai."
                  : "Foto sederhana produk asli sebelum styling.",
      description:
        caseDetails[`${id}-${key}`]?.[0] ??
        `Contoh gaya ${name.toLowerCase()} untuk kebutuhan ${short.toLowerCase()}.`,
      changes:
        caseDetails[`${id}-${key}`]?.[1] ??
        `Arah visual ${name.toLowerCase()} dengan pilihan tampilan yang dapat kamu ubah satu per satu.`,
      preserved: ["professional", "formal", "prewedding", "relight"].includes(
        id,
      )
        ? "Identitas wajah, ciri personal, dan proporsi alami."
        : id === "food"
          ? "Identitas hidangan, bahan yang terlihat, porsi, dan wadah asli."
          : ["product", "ads", "social"].includes(id)
            ? "Bentuk produk, bahan, kemasan, dan label asli."
            : id === "property"
              ? "Geometri ruang, bukaan, dan elemen permanen."
              : id === "branding"
                ? "Nama merek dan gagasan utama dari brief."
                : "Identitas subjek dan detail wajib dari brief.",
      selections,
      ...(visualSrc ? { visualSrc } : {}),
    }),
  );
  const extraNames = EXTRA_SET_NAMES[id];
  const pools = EXTRA_SET_POOLS[id];
  const extraSets = extraNames.map(([slug, label, subject], index) => {
    const base = featuredSets[index % featuredSets.length];
    const selections = { ...base.selections };
    for (const [key, values] of Object.entries(pools))
      if (key in selections && values.length)
        selections[key] = values[index % values.length];
    const artIndex = String(index + 4).padStart(2, "0");
    const visualSrc = `/assets/v2/sets-v3/${id}-style-${artIndex}.webp`;
    return {
      ...base,
      id: `${id}-${slug}`,
      label,
      subject,
      description: `Contoh gaya ${label.toLowerCase()} untuk ${short.toLowerCase()}.`,
      changes: `Pilih arah ${label.toLowerCase()}, lalu ubah tampilan satu per satu.`,
      selections,
      visualSrc,
    };
  });
  return {
    id,
    recipeId,
    label,
    short,
    pitch,
    audience,
    deliverable,
    color,
    referenceGuide,
    sets: [...featuredSets, ...extraSets],
  };
}
const portraitRef =
  "Lampirkan satu foto wajah yang tajam dan terang di generator AI. Gunakan foto milik sendiri atau dengan izin. Aichemy tidak mengunggah atau menyimpan foto klien.";
const productRef =
  "Lampirkan satu foto produk dari sudut yang jelas di generator AI. Tambahkan foto detail kemasan bila label penting. Periksa kembali bentuk dan tulisan hasilnya.";
export const SERVICES: ServiceDefinition[] = [
  service(
    "professional",
    "portrait",
    "Foto Profesional & Personal",
    "Profesional",
    "Kesan pertama yang siap bekerja.",
    "Pencari kerja, profesional, pemilik bisnis",
    "Foto profil LinkedIn, profil bisnis, dan wisuda",
    "#e4e1f4",
    portraitRef,
    [
      [
        "linkedin",
        "Profil LinkedIn",
        "Seorang profesional Indonesia, potret profil yang ramah",
        {
          background: "gray",
          lighting: "soft",
          lens: "85",
          pose: "three-quarter",
          wardrobe: "blazer",
          expression: "smile",
        },
      ],
      [
        "business",
        "Profil bisnis",
        "Pemilik usaha Indonesia, tampil percaya diri",
        {
          background: "office",
          lighting: "window",
          lens: "50",
          pose: "standing",
          wardrobe: "blazer",
          expression: "confident",
        },
      ],
      [
        "graduation",
        "Momen wisuda",
        "Lulusan universitas Indonesia, potret wisuda",
        {
          background: "cream",
          lighting: "soft",
          lens: "85",
          pose: "front",
          wardrobe: "graduation",
          expression: "smile",
        },
      ],
    ],
  ),
  service(
    "formal",
    "id-photo",
    "Pas Foto Formal",
    "Pas Foto",
    "Rapi, terang, mudah disesuaikan.",
    "Pelamar kerja dan pemilik kartu profesional",
    "Pas foto CV, administrasi umum, dan kartu profesi",
    "#dceaf4",
    portraitRef,
    [
      [
        "cv",
        "Lamaran & CV",
        "Pas foto pelamar kerja Indonesia",
        {
          background: "blue",
          lighting: "soft",
          pose: "front",
          wardrobe: "blazer",
          expression: "neutral",
          crop: "head",
          ratio: "3:4",
        },
      ],
      [
        "administration",
        "Administrasi umum",
        "Pas foto administrasi umum",
        {
          background: "blue",
          lighting: "soft",
          pose: "front",
          wardrobe: "shirt",
          expression: "neutral",
          crop: "head",
          ratio: "3:4",
        },
      ],
      [
        "badge",
        "Kartu profesional",
        "Potret kartu identitas profesional",
        {
          background: "red",
          lighting: "soft",
          pose: "front",
          wardrobe: "blazer",
          expression: "smile",
          crop: "head",
          ratio: "3:4",
        },
      ],
    ],
  ),
  service(
    "prewedding",
    "wedding",
    "Prewedding & Pasangan",
    "Prewedding",
    "Cerita berdua, dalam arah visual pilihanmu.",
    "Pasangan dan penyedia jasa pernikahan",
    "Konsep foto pasangan, prewedding, dan undangan",
    "#f0e7dd",
    "Di generator AI, lampirkan satu foto pasangan atau dua foto individu. Untuk dua foto, foto 1 adalah orang A dan foto 2 adalah orang B. Jangan menukar atau mencampurkan wajah. Dapatkan izin keduanya.",
    [
      [
        "minimal",
        "Studio minimalis",
        "Pasangan Indonesia dalam sesi prewedding studio",
        {
          background: "cream",
          lighting: "soft",
          couplePose: "facing",
          wardrobe: "couple-formal",
          lens: "50",
        },
      ],
      [
        "garden",
        "Taman golden hour",
        "Pasangan Indonesia di taman hijau",
        {
          background: "garden",
          lighting: "golden",
          couplePose: "walk",
          wardrobe: "couple-formal",
          lens: "85",
        },
      ],
      [
        "traditional",
        "Adat modern",
        "Pasangan Indonesia dengan busana adat modern sesuai brief",
        {
          background: "cream",
          lighting: "window",
          couplePose: "facing",
          wardrobe: "kebaya",
          lens: "50",
        },
      ],
    ],
  ),
  service(
    "product",
    "product",
    "Foto Produk",
    "Produk",
    "Buat produk kecil terlihat bernilai.",
    "Penjual marketplace dan merek lokal",
    "Foto katalog, hero skincare, dan aksesori",
    "#f6e4da",
    productRef,
    [
      [
        "marketplace",
        "Katalog marketplace",
        "Botol serum skincare dari foto referensi",
        {
          background: "white",
          lighting: "soft",
          angle: "eye",
          surface: "white",
          props: "none",
          ratio: "1:1",
        },
      ],
      [
        "skincare",
        "Skincare premium",
        "Botol serum skincare dengan detail kemasan jelas",
        {
          background: "peach",
          lighting: "window",
          angle: "three-quarter",
          surface: "stone",
          props: "citrus",
          ratio: "4:5",
        },
      ],
      [
        "fashion",
        "Fashion & aksesori",
        "Tas tangan dari foto referensi",
        {
          background: "cream",
          lighting: "soft",
          angle: "three-quarter",
          surface: "stone",
          props: "fabric",
          ratio: "4:5",
        },
      ],
    ],
  ),
  service(
    "food",
    "food",
    "Foto Makanan",
    "Makanan",
    "Visual menu yang menggugah selera.",
    "Restoran, kedai kopi, dan usaha kuliner",
    "Foto menu, kampanye minuman, dan katalog camilan",
    "#e7ebd9",
    productRef,
    [
      [
        "restaurant",
        "Menu restoran",
        "Semangkuk hidangan Indonesia untuk menu restoran",
        {
          lighting: "window",
          angle: "three-quarter",
          surface: "wood",
          presentation: "rustic",
          props: "none",
        },
      ],
      [
        "coffee",
        "Kopi & kafe",
        "Segelas kopi susu dingin dari foto referensi untuk menu kafe",
        {
          lighting: "window",
          angle: "eye",
          surface: "wood",
          presentation: "clean",
          props: "none",
        },
      ],
      [
        "snack",
        "Camilan UMKM",
        "Pisang goreng dari foto referensi, ditata di atas meja",
        {
          lighting: "soft",
          angle: "eye",
          surface: "wood",
          presentation: "close",
          props: "none",
        },
      ],
    ],
  ),
  service(
    "ads",
    "marketing",
    "Banner & Iklan",
    "Iklan",
    "Arah visual untuk penawaran yang jelas.",
    "UMKM, toko online, dan pengiklan",
    "Banner promosi, marketplace, dan Story",
    "#f1e5ef",
    productRef,
    [
      [
        "promo",
        "Promo UMKM",
        "Produk unggulan UMKM untuk materi promosi",
        {
          layout: "left",
          palette: "mint",
          typography: "sans",
          ratio: "4:5",
          lighting: "soft",
        },
      ],
      [
        "marketplace",
        "Banner marketplace",
        "Produk untuk banner toko marketplace",
        {
          layout: "left",
          palette: "mint",
          typography: "bold",
          ratio: "16:9",
          lighting: "soft",
        },
      ],
      [
        "story",
        "Iklan Story",
        "Produk utama untuk iklan Story",
        {
          layout: "top",
          palette: "mint",
          typography: "sans",
          ratio: "9:16",
          lighting: "window",
        },
      ],
    ],
  ),
  service(
    "social",
    "marketing",
    "Konten Media Sosial",
    "Konten Sosial",
    "Satu identitas, banyak kesempatan tampil.",
    "Merek lokal dan kreator konten",
    "Feed branding, konten produk, dan cover Reels",
    "#e2eee8",
    productRef,
    [
      [
        "branding",
        "Feed branding",
        "Produk sebuah merek lokal untuk feed konsisten",
        {
          layout: "center",
          palette: "coral",
          typography: "sans",
          ratio: "1:1",
          lighting: "soft",
        },
      ],
      [
        "product",
        "Konten produk",
        "Produk unggulan untuk konten sosial",
        {
          layout: "left",
          palette: "mint",
          typography: "serif",
          ratio: "4:5",
          lighting: "window",
        },
      ],
      [
        "cover",
        "Cover Reels / Story",
        "Subjek utama untuk cover video vertikal",
        {
          layout: "top",
          palette: "cream",
          typography: "bold",
          ratio: "9:16",
          lighting: "rim",
        },
      ],
    ],
  ),
  service(
    "cinematic",
    "cinematic",
    "Visual Sinematik",
    "Sinematik",
    "Bangun suasana, bukan sekadar gambar.",
    "Kreator, musisi, dan tim kampanye",
    "Poster fiksi, editorial, dan visual perjalanan",
    "#dde4eb",
    "Lampirkan foto subjek hanya jika ingin mempertahankan identitas. Jika membuat adegan baru, pilih tanpa referensi. Hindari tokoh atau merek yang tidak memiliki izin.",
    [
      [
        "poster",
        "Poster film fiksi",
        "Tokoh fiksi orisinal dalam adegan penuh ketegangan",
        {
          lighting: "dramatic",
          style: "cinematic",
          lens: "50",
          palette: "teal",
          ratio: "2:3",
          pose: "standing",
        },
      ],
      [
        "street",
        "Editorial jalanan",
        "Subjek di jalan kota Indonesia menjelang malam",
        {
          lighting: "rim",
          style: "editorial",
          lens: "35",
          palette: "warm",
          ratio: "4:5",
          pose: "standing",
        },
      ],
      [
        "travel",
        "Kampanye perjalanan",
        "Seorang pelancong di lanskap tropis Indonesia",
        {
          lighting: "golden",
          style: "natural",
          lens: "35",
          palette: "warm",
          ratio: "16:9",
          pose: "standing",
        },
      ],
    ],
  ),
  service(
    "property",
    "real-estate",
    "Properti & Interior",
    "Properti",
    "Tampilkan potensi ruang secara jujur.",
    "Agen properti, pemilik penginapan, dan desainer",
    "Foto listing, interior showcase, dan virtual staging",
    "#e5ebe0",
    "Lampirkan foto ruang dengan garis dinding yang jelas di generator AI. Pertahankan pintu, jendela, struktur, serta ukuran relatif. Labeli virtual staging sebagai ilustrasi.",
    [
      [
        "listing",
        "Foto listing",
        "Ruang hunian dari foto referensi",
        {
          view: "wide",
          lighting: "window",
          style: "natural",
          palette: "cream",
          ratio: "4:3",
        },
      ],
      [
        "interior",
        "Interior showcase",
        "Interior rumah dengan material dan detail asli",
        {
          view: "corner",
          lighting: "soft",
          style: "editorial",
          palette: "warm",
          ratio: "4:3",
        },
      ],
      [
        "staging",
        "Virtual staging",
        "Ruang hunian yang ditata dengan furnitur non-permanen",
        {
          view: "straight",
          lighting: "window",
          style: "natural",
          palette: "cream",
          ratio: "16:9",
        },
      ],
    ],
  ),
  service(
    "branding",
    "logo",
    "Logo & Branding",
    "Logo",
    "Mulai identitas merek dari ide yang kuat.",
    "Usaha baru dan pemilik merek",
    "Konsep monogram, simbol, dan eksplorasi identitas",
    "#eee2f0",
    "Tidak memerlukan foto. Brief/sketsa opsional dapat dilampirkan di generator AI sebagai arah konsep. Hasil adalah konsep visual; periksa orisinalitas dan rapikan file vektor sebelum penyerahan.",
    [
      [
        "monogram",
        "Monogram minimalis",
        "Konsep monogram orisinal untuk merek pada brief",
        { mark: "monogram", palette: "ink", typography: "serif", ratio: "1:1" },
      ],
      [
        "symbol",
        "Simbol UMKM",
        "Simbol merek UMKM berdasarkan brief",
        { mark: "symbol", palette: "mint", typography: "sans", ratio: "1:1" },
      ],
      [
        "playful",
        "Identitas playful",
        "Identitas visual merek yang ramah dan ekspresif",
        { mark: "playful", palette: "coral", typography: "bold", ratio: "1:1" },
      ],
    ],
  ),
  service(
    "relight",
    "relight",
    "Edit Foto & Relight",
    "Relight",
    "Foto yang sama, cahaya yang lebih terarah.",
    "Fotografer, kreator, dan pemilik foto",
    "Perbaikan pencahayaan dan penggantian latar",
    "#e9e2f4",
    portraitRef,
    [
      [
        "balanced",
        "Perbaikan cahaya",
        "Subjek dari foto referensi dengan cahaya lebih seimbang",
        {
          lighting: "soft",
          background: "original",
          style: "natural",
          depth: "balanced",
        },
      ],
      [
        "golden",
        "Golden hour",
        "Subjek foto referensi dengan suasana golden hour",
        {
          lighting: "golden",
          background: "original",
          style: "natural",
          depth: "balanced",
        },
      ],
      [
        "backdrop",
        "Latar studio baru",
        "Subjek foto referensi dengan latar studio bersih",
        {
          lighting: "window",
          background: "gray",
          style: "editorial",
          depth: "balanced",
        },
      ],
    ],
  ),
];
// Keep the original 33 before/after case IDs stable. New services have portfolio covers, not fabricated before/after pairs.
export const FEATURED_CASES = SERVICES.flatMap((s) => s.sets.slice(0, 3));
export const LEGACY_SERVICES = [...SERVICES];
for (const s of SERVICES) s.group = serviceGroup(s.id);
SERVICES.push(...NEW_SERVICES);
export const SETS = FEATURED_CASES;
export const ALL_STUDIO_SETS = SERVICES.flatMap((s) => s.sets);
export const findService = (id: string) => SERVICES.find((s) => s.id === id);
export const serviceForRecipe = (id: string) =>
  SERVICES.find((s) => s.recipeId === id);
export const favoriteServiceId = (item: {
  studioId: string;
  data: Record<string, unknown>;
}) =>
  typeof item.data.serviceId === "string"
    ? item.data.serviceId
    : serviceForRecipe(item.studioId)?.id;
export const findSet = (id: string) => ALL_STUDIO_SETS.find((s) => s.id === id);
export const caseImage = (
  id: string,
  side: "before" | "after" = "after",
  small = false,
) =>
  id === "professional-linkedin"
    ? portfolioImage(
        side === "before" ? "influencer-source" : "professional-profile",
        small,
      )
    : `/assets/v2/cases/${id}-${side}${small ? "-small" : ""}.webp`;
export const setImage = (id: string, small = false) => {
  const source = PORTFOLIO_OVERRIDES[id]
    ? portfolioImage(PORTFOLIO_OVERRIDES[id])
    : (findSet(id)?.visualSrc ?? caseImage(id));
  return small ? source.replace(".webp", "-small.webp") : source;
};
export const studioUrl = (service: ServiceDefinition, set = service.sets[0]) =>
  `/app/studio/${service.recipeId}?service=${service.id}&set=${set.id}&starter=1`;

export { VIRAL_TEASERS } from "./viral-photography";
