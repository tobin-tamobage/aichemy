import { z } from "zod";
import { findService, findSet, SERVICES } from "../shared/v2-catalog";
import {
  CURRENT_CATALOG,
  NEW_SERVICE_IDS,
  SERVICE_BASE,
  PEOPLE_SERVICES,
} from "../shared/services-v3";
import { extendDefinitions, NEW_TASKS } from "./options-v3";
import {
  emptyBrief,
  type BlockId,
  type ClientBrief,
  type ServiceId,
  type StudioV2Descriptor,
  type StudioV2State,
  type VisualField,
  type VisualOption,
  type VisualPreview,
  type V2Issue,
  type LegacyServiceId,
  type CatalogVersion,
} from "../shared/v2";

type SemanticOption = VisualOption & { instruction: string };
type Definition = Omit<VisualField, "options"> & {
  block: BlockId;
  options: SemanticOption[];
};
const photo = (key: string): VisualPreview => ({
  kind: "photo",
  src: `/assets/v2/options/${key}-small.webp`,
});
const option = (
  value: string,
  label: string,
  hint: string,
  instruction: string,
  visual: VisualPreview,
): SemanticOption => ({ value, label, hint, instruction, visual });
const photoOptions = (prefix: string, rows: string[][]) =>
  rows.map(([value, label, hint, instruction]) =>
    option(value, label, hint, instruction, photo(`${prefix}-${value}`)),
  );
type AtlasChoice = [string, string, string, string, number?];
const atlasOptions = (
  prefix: string,
  rows: AtlasChoice[],
  offset = 1,
): SemanticOption[] =>
  rows.map(([value, label, hint, instruction, imageIndex], index) =>
    option(value, label, hint, instruction, {
      kind: "photo",
      src: `/assets/v2/options-v3/${prefix}${String(imageIndex ?? index + offset).padStart(2, "0")}-small.webp`,
    }),
  );
const field = (
  key: string,
  label: string,
  help: string,
  block: BlockId,
  options: SemanticOption[],
  advanced = false,
): Definition => ({
  key,
  label,
  help,
  block,
  options: options.map((item) => ({
    ...item,
    group:
      item.group ??
      (() => {
        const text = `${item.label} ${item.value}`.toLocaleLowerCase("id");
        if (key === "background")
          return item.visual.kind === "photo"
            ? "Suasana tempat"
            : "Warna polos";
        if (key === "lighting")
          return /rim|tepi|belakang|backlight/.test(text)
            ? "Cahaya tepi"
            : /window|jendela|golden|matahari|sore/.test(text)
              ? "Cahaya alami"
              : "Cahaya studio";
        if (key === "lens")
          return ["24", "35"].includes(item.value)
            ? "Latar lebih luas"
            : item.value === "50"
              ? "Tampilan natural"
              : "Potret lebih dekat";
        if (key === "angle")
          return /atas|overhead|flat lay/.test(text)
            ? "Dari atas"
            : /detail|dekat|macro/.test(text)
              ? "Detail dekat"
              : "Sejajar & samping";
        if (key === "decoration")
          return /bunga|floral|mawar/.test(text)
            ? "Dekorasi bunga"
            : /lampu|lilin|lentera/.test(text)
              ? "Cahaya dekorasi"
              : "Backdrop";
        if (key === "bouquet")
          return /tanpa/.test(text) ? "Tanpa buket" : "Pilihan bunga";
        if (["pose", "couplePose"].includes(key))
          return /duduk|seated|bench/.test(text)
            ? "Duduk bersama"
            : /jalan|walk/.test(text)
              ? "Bergerak"
              : "Pose berdiri & dekat";
        if (key === "wardrobe")
          return /adat|kebaya|batik/.test(text)
            ? "Adat modern"
            : /hijab/.test(text)
              ? "Berhijab"
              : "Formal & kasual";
        if (key === "ratio")
          return item.value === "16:9"
            ? "Banner"
            : item.value === "9:16"
              ? "Story & Reels"
              : "Foto & feed";
        if (key === "palette")
          return /warm|hangat|coral|peach|cream/.test(text)
            ? "Warna hangat"
            : /teal|biru|blue|mint/.test(text)
              ? "Warna sejuk"
              : "Netral";
        if (key === "layout")
          return /left|kiri/.test(text)
            ? "Ruang kiri"
            : /top|atas/.test(text)
              ? "Ruang atas"
              : /bottom|bawah/.test(text)
                ? "Ruang bawah"
                : "Subjek tengah";
        if (key === "surface")
          return /wood|kayu|stone|batu|sand|pasir/.test(text)
            ? "Tekstur natural"
            : /white|putih|cream|krem/.test(text)
              ? "Netral"
              : "Warna & refleksi";
        if (key === "props")
          return /none|tanpa/.test(text)
            ? "Tanpa dekorasi"
            : /botanical|daun|bunga/.test(text)
              ? "Aksen alam"
              : "Aksen pendukung";
        return "Pilihan visual";
      })(),
  })),
  advanced,
});
const PEOPLE = PEOPLE_SERVICES;
const commercial = ["product", "food", "ads", "social"];
export const briefSchema = z.object({
  subject: z.string().max(3000).default(""),
  purpose: z.string().max(2000).default(""),
  required: z.string().max(3000).default(""),
  preserve: z.string().max(2000).default(""),
  brand: z.string().max(300).default(""),
  text: z.string().max(2000).default(""),
});
export const v2InputSchema = z.object({
  catalogVersion: z
    .union([z.literal(1), z.literal(2), z.literal(3)])
    .optional(),
  serviceId: z.enum(SERVICES.map((s) => s.id) as [ServiceId, ...ServiceId[]]),
  setId: z.string().max(100).optional(),
  referenceMode: z.enum(["none", "single", "couple", "individuals"]).optional(),
  brief: briefSchema.optional(),
  selections: z.record(z.string().max(80), z.string().max(150)).default({}),
});
export type V2Input = z.input<typeof v2InputSchema>;

function definitions(
  service: ServiceId,
  catalogVersion: CatalogVersion = 1,
): Definition[] {
  const base = Object.hasOwn(SERVICE_BASE, service)
    ? SERVICE_BASE[service as keyof typeof SERVICE_BASE]
    : (service as LegacyServiceId);
  const original = legacyDefinitions(base, catalogVersion === 1 ? 1 : 2);
  return catalogVersion === 3
    ? extendDefinitions(service, original, {
        professional: legacyDefinitions("professional", 2),
        product: legacyDefinitions("product", 2),
      })
    : original;
}
function legacyDefinitions(
  service: LegacyServiceId,
  catalogVersion: 1 | 2 = 1,
): Definition[] {
  const people = PEOPLE.includes(service),
    product = commercial.includes(service);
  const lightingRows = [
    [
      "soft",
      "Lembut & merata",
      "Bayangan lembut, detail mudah dibaca.",
      "Use a large diffused key light with gentle fill, even exposure, and soft-edged shadows.",
    ],
    [
      "window",
      "Cahaya jendela",
      "Dimensi alami dari satu sisi.",
      "Use soft directional window light from camera left, with natural falloff and gentle shadow detail.",
    ],
    [
      "golden",
      "Golden hour",
      "Cahaya hangat dari matahari rendah.",
      "Use a low warm golden-hour sun as the dominant light, with consistent shadow direction and subtle ambient fill.",
    ],
    [
      "rim",
      "Cahaya tepi",
      "Pisahkan subjek dari latar.",
      "Use a controlled rim light behind the subject and soft frontal fill; retain readable front details.",
    ],
  ];
  if (people && service !== "formal")
    lightingRows.push(
      [
        "rembrandt",
        "Potret berkarakter",
        "Segitiga cahaya kecil di pipi.",
        "Use one soft key light at 45 degrees to create a restrained Rembrandt cheek triangle, with readable shadow detail.",
      ],
      [
        "dramatic",
        "Dramatis",
        "Kontras lebih kuat dan terarah.",
        "Use a focused directional key light, deep but detailed shadows, and a restrained contrast range without clipped highlights.",
      ],
    );
  const lighting = field(
    "lighting",
    "Arah cahaya",
    "Pilih satu sumber cahaya dominan agar instruksi tetap konsisten.",
    "lighting",
    photoOptions(
      service === "food"
        ? "food-light"
        : product
          ? "product-light"
          : "people-light",
      lightingRows,
    ),
  );
  if (service === "property")
    lighting.options = photoOptions("property-light", lightingRows.slice(0, 3));
  if (
    catalogVersion === 2 &&
    !["formal", "property", "relight"].includes(service)
  ) {
    const lightingPrefix =
      service === "prewedding"
        ? "prewedding-lighting-"
        : service === "food"
          ? "food-lighting-"
          : ["product", "ads", "social"].includes(service)
            ? "product-lighting-"
            : "professional-lighting-";
    lighting.options = atlasOptions(lightingPrefix, [
      [
        "soft",
        "Lembut & merata",
        "Bayangan halus dan detail mudah dibaca.",
        "Use a large diffused soft key light with gentle fill, even exposure, and soft-edged shadows.",
      ],
      [
        "window",
        "Cahaya jendela",
        "Terarah alami dari satu sisi.",
        "Use soft directional window light from camera left with realistic falloff and readable shadow detail.",
      ],
      [
        "golden",
        "Golden hour",
        "Hangat seperti matahari sore.",
        "Use low warm golden-hour light as the dominant source, keeping highlights controlled and the subject readable.",
      ],
      [
        "rim",
        "Cahaya tepi",
        "Memisahkan subjek dari latar.",
        "Use a restrained rim light behind the subject plus soft fill; keep important front details readable.",
      ],
      [
        "overcast",
        "Lembut seperti mendung",
        "Cahaya menyebar dan rata.",
        "Use broad diffused overcast-style light with gentle contrast and no harsh shadows.",
      ],
      [
        "rembrandt",
        "Potret berkarakter",
        "Satu sisi lebih teduh dengan detail terjaga.",
        "Use one soft key at roughly 45 degrees for restrained side modeling and readable shadow detail.",
      ],
      [
        "butterfly",
        "Cahaya dari atas",
        "Bayangan ringan tepat di bawah wajah/objek.",
        "Use a soft frontal key slightly above the subject with controlled natural shadows and even detail.",
      ],
      [
        "dramatic",
        "Kontras terarah",
        "Lebih dramatis tanpa detail hilang.",
        "Use focused directional light with deep but detailed shadows and no clipped highlights.",
      ],
      [
        "high-key",
        "Terang bersih",
        "Latar dan subjek terasa cerah.",
        "Use a bright high-key setup with even exposure and retained texture in highlights.",
      ],
      [
        "low-key",
        "Suasana lebih gelap",
        "Fokus pada bagian yang terkena cahaya.",
        "Use a controlled low-key setup with dark surroundings while preserving essential subject detail.",
      ],
      [
        "backlight",
        "Cahaya dari belakang",
        "Tepi bercahaya, wajah tetap terbaca.",
        "Use natural backlight with gentle front fill so faces, labels, and key details remain clear.",
      ],
      [
        "neutral",
        "Studio netral",
        "Warna terlihat seimbang dan akurat.",
        "Use balanced neutral studio lighting with accurate colors, restrained reflections, and natural shadows.",
      ],
    ]);
  }
  const background = field(
    "background",
    "Latar",
    "Swatch menunjukkan warna; foto subjek adalah ilustrasi, bukan hasil racikan langsung.",
    "scene",
    [
      ...[
        ["white", "Putih bersih", "#ffffff"],
        ["gray", "Abu studio", "#b6bac4"],
        ["cream", "Krem hangat", "#ede3d4"],
        ["blue", "Biru formal", "#1769ba"],
        ["red", "Merah formal", "#bd2638"],
        ["peach", "Peach lembut", "#efbea5"],
      ].map(([value, label, color]) =>
        option(
          value,
          label,
          `Latar polos ${label.toLowerCase()}.`,
          `Use a seamless solid ${value === "peach" ? "soft peach" : value === "cream" ? "warm cream" : value} background (${color}), free of texture and distracting objects.`,
          { kind: "background", color },
        ),
      ),
      ...(service === "prewedding"
        ? [
            option(
              "garden",
              "Taman alami",
              "Tanaman menjadi latar, bukan menutupi wajah.",
              "Place the couple in a natural landscaped garden with realistic plants and a quiet uncluttered background.",
              {
                kind: "photo",
                src: "/assets/v2/cases/prewedding-garden-after-small.webp",
              },
            ),
          ]
        : []),
      ...(service === "professional"
        ? [
            option(
              "office",
              "Kantor hangat",
              "Suasana bisnis dengan latar yang tetap tenang.",
              "Use a warm modern office background with restrained detail and realistic spatial depth, without invented signage or distracting objects.",
              {
                kind: "photo",
                src: "/assets/v2/cases/professional-business-after-small.webp",
              },
            ),
          ]
        : []),
      ...(service === "relight"
        ? [
            option(
              "original",
              "Latar asli",
              "Jangan mengganti lokasi foto.",
              "Preserve the original background and all its objects; change only its illumination consistently with the subject.",
              {
                kind: "photo",
                src: "/assets/v2/cases/relight-balanced-before-small.webp",
              },
            ),
          ]
        : []),
    ],
  );
  if (service === "prewedding" && catalogVersion === 2) {
    background.label = "Tempat";
    background.help =
      "Pilih suasana lokasi. Contoh memperlihatkan pasangan prewedding; hasil akhir dapat berbeda.";
    background.options = atlasOptions("prewedding-place-", [
      [
        "studio-white",
        "Studio putih",
        "Bersih, fokus pada pasangan.",
        "Place the couple in a spacious minimal white photography studio with soft natural light.",
      ],
      [
        "garden",
        "Taman hijau",
        "Rimbun dan terasa alami.",
        "Place the couple in a lush landscaped garden with layered greenery and a quiet background.",
      ],
      [
        "flower-garden",
        "Kebun bunga",
        "Warna bunga menjadi aksen.",
        "Place the couple among a restrained flowering garden; keep flowers behind, not across, either face.",
      ],
      [
        "beach-sunset",
        "Pantai senja",
        "Laut dan cahaya sore.",
        "Place the couple on a calm beach at sunset, with a readable horizon and warm natural sky.",
      ],
      [
        "ballroom",
        "Ballroom klasik",
        "Ruang pesta yang elegan.",
        "Place the couple in an elegant classic ballroom with tasteful chandeliers and realistic scale.",
      ],
      [
        "heritage-courtyard",
        "Pelataran heritage",
        "Arsitektur berkarakter.",
        "Place the couple in a refined heritage courtyard; preserve plausible architectural details and cultural neutrality.",
      ],
      [
        "intimate-dinner",
        "Makan malam intim",
        "Suasana hangat di dalam ruang.",
        "Place the couple in a softly lit intimate dinner setting with subtle candles and no distracting guests.",
      ],
      [
        "highland",
        "Padang pegunungan",
        "Pemandangan luas dan sejuk.",
        "Place the couple in an open highland meadow with distant mountains and natural atmospheric depth.",
      ],
      [
        "glasshouse",
        "Rumah kaca",
        "Cahaya alami yang menyebar.",
        "Place the couple inside a tasteful glasshouse with diffused daylight and restrained plants.",
      ],
      [
        "tropical-villa",
        "Vila tropis",
        "Hijau dan terasa santai.",
        "Place the couple in a refined tropical villa garden with believable architecture and restrained foliage.",
      ],
      [
        "rain-garden",
        "Taman setelah hujan",
        "Pantulan lembut, tetap romantis.",
        "Place the couple in a garden after light rain, with subtle wet reflections and no heavy rainfall obscuring faces.",
      ],
      [
        "forest-path",
        "Jalur hutan",
        "Nuansa hijau yang lebih tenang.",
        "Place the couple on a clear forest path with soft dappled light and enough separation from dark foliage.",
      ],
      [
        "city-rooftop",
        "Rooftop kota",
        "Latar kota saat senja.",
        "Place the couple on a safe elegant rooftop terrace at blue hour, with a softly readable city skyline.",
      ],
      [
        "hotel-lobby",
        "Lobi hotel",
        "Interior rapi dan berkelas.",
        "Place the couple in a polished hotel lobby with restrained decor and realistic interior proportions.",
      ],
      [
        "stone-courtyard",
        "Halaman batu",
        "Tekstur klasik yang sederhana.",
        "Place the couple in a quiet stone courtyard with subtle greenery and natural perspective.",
      ],
      [
        "lakeside",
        "Tepi danau",
        "Pantulan air dan suasana senja.",
        "Place the couple beside a calm lake at sunset, with natural water reflections and a clear safe foreground.",
      ],
    ]);
    background.options.push(
      ...[
        [
          "white",
          "Studio putih",
          "Warna latar polos yang bersih.",
          "Use a seamless pure white studio background, evenly lit and free of texture.",
        ],
        [
          "gray",
          "Abu lembut",
          "Netral dan mudah dipadukan.",
          "Use a seamless soft gray studio background with even tone and no texture.",
        ],
        [
          "cream",
          "Krem hangat",
          "Kesan studio terasa hangat.",
          "Use a seamless warm cream studio background with even tone and no texture.",
        ],
        [
          "blue",
          "Biru lembut",
          "Latar polos bernuansa sejuk.",
          "Use a seamless soft blue studio background with even tone and no texture.",
        ],
        [
          "red",
          "Merah marun",
          "Warna kuat untuk studio formal.",
          "Use a seamless muted deep red studio background with even tone and no texture.",
        ],
        [
          "peach",
          "Peach lembut",
          "Latar studio terasa romantis.",
          "Use a seamless soft peach studio background with even tone and no texture.",
        ],
        [
          "sage",
          "Sage lembut",
          "Warna alam yang tidak ramai.",
          "Use a seamless muted sage-green studio background with even tone and no texture.",
        ],
        [
          "charcoal",
          "Arang gelap",
          "Kontras elegan dan dramatis.",
          "Use a seamless charcoal studio background, with controlled exposure and no texture.",
        ],
      ].map(([value, label, hint, instruction, color]) =>
        option(value, label, hint, instruction, {
          kind: "background",
          color:
            color ??
            (value === "white"
              ? "#ffffff"
              : value === "gray"
                ? "#b6bac4"
                : value === "cream"
                  ? "#ede3d4"
                  : value === "blue"
                    ? "#1769ba"
                    : value === "red"
                      ? "#8f3544"
                      : value === "peach"
                        ? "#efbea5"
                        : value === "sage"
                          ? "#9caf9e"
                          : "#29272b"),
          src: "",
        }),
      ),
    );
  }
  if (
    catalogVersion === 2 &&
    ["professional", "product", "food"].includes(service)
  ) {
    const colorSwatches = background.options.filter(
      (choice) => choice.visual.kind === "background",
    );
    const backgroundRows: Record<string, AtlasChoice[]> = {
      professional: [
        [
          "studio-white",
          "Studio putih",
          "Bersih dan fokus ke wajah.",
          "Use a seamless clean white portrait-studio background, evenly lit and free of texture.",
        ],
        [
          "studio-gray",
          "Studio abu",
          "Netral untuk profil kerja.",
          "Use a seamless soft-gray portrait-studio background with even tone and no texture.",
        ],
        [
          "studio-cream",
          "Studio krem",
          "Terasa lebih hangat.",
          "Use a seamless warm cream portrait-studio background with even tone and no texture.",
        ],
        [
          "studio-blue",
          "Studio biru",
          "Warna tenang untuk profil.",
          "Use a seamless muted blue portrait-studio background with even tone and no texture.",
        ],
        [
          "studio-peach",
          "Studio peach",
          "Lembut dan ramah.",
          "Use a seamless soft peach portrait-studio background with even tone and no texture.",
        ],
        [
          "studio-dark",
          "Studio gelap",
          "Kontras potret lebih kuat.",
          "Use a seamless dark portrait-studio background with controlled exposure and visible subject separation.",
        ],
        [
          "modern-office",
          "Kantor modern",
          "Suasana bisnis yang rapi.",
          "Place the subject in a warm modern office with restrained details and no readable signage.",
        ],
        [
          "coworking",
          "Ruang kerja bersama",
          "Lebih kasual dan kreatif.",
          "Place the subject in a softly blurred contemporary coworking space without readable screens, signs, or logos.",
        ],
        [
          "library",
          "Perpustakaan",
          "Latar tenang dan bertekstur.",
          "Place the subject before a softly blurred modern library with orderly shelves and no readable titles.",
        ],
        [
          "quiet-cafe",
          "Kafe tenang",
          "Terasa santai tetapi profesional.",
          "Place the subject in a quiet refined cafe with a softly blurred background and no visible branding.",
        ],
        [
          "window",
          "Dekat jendela",
          "Cahaya dan ruang terasa alami.",
          "Place the subject near a large bright window in a simple studio, keeping the background soft and uncluttered.",
        ],
        [
          "greenery",
          "Latar tanaman",
          "Aksen hijau yang lembut.",
          "Use restrained softly blurred greenery behind the subject; keep plants away from the face and avoid a busy scene.",
        ],
        [
          "charcoal",
          "Studio arang",
          "Gelap elegan dan sederhana.",
          "Use a seamless charcoal portrait-studio background with even tone and clear subject separation.",
        ],
        [
          "warm-brick",
          "Bata hangat",
          "Tekstur editorial yang halus.",
          "Place the subject before a softly rendered warm brick wall with restrained texture and no signs or graffiti.",
        ],
        [
          "business-lobby",
          "Lobi bisnis",
          "Kesan profesional dan berkelas.",
          "Place the subject in a polished business lobby with realistic proportions and restrained decor.",
        ],
        [
          "city-soft",
          "Kota berjarak",
          "Suasana kota tanpa ramai.",
          "Use a softly blurred city background at a natural distance, with no legible signage and the subject clearly dominant.",
        ],
      ],
      product: [
        [
          "clean-white",
          "Putih bersih",
          "Produk terlihat jelas.",
          "Use a seamless clean white product-photography backdrop, evenly lit and free of texture.",
        ],
        [
          "warm-cream",
          "Krem hangat",
          "Nuansa lembut dan premium.",
          "Use a seamless warm cream product backdrop with even tone and no texture.",
        ],
        [
          "soft-gray",
          "Abu lembut",
          "Netral agar bentuk produk menonjol.",
          "Use a seamless soft gray product backdrop with even tone and no texture.",
        ],
        [
          "pastel-peach",
          "Peach pastel",
          "Aksen hangat dan ringan.",
          "Use a seamless muted peach product backdrop; preserve the product's authentic color.",
        ],
        [
          "soft-sage",
          "Sage lembut",
          "Warna alam yang tenang.",
          "Use a seamless muted sage product backdrop; preserve the product's authentic color.",
        ],
        [
          "soft-blue",
          "Biru lembut",
          "Terasa sejuk dan bersih.",
          "Use a seamless soft blue product backdrop; preserve the product's authentic color.",
        ],
        [
          "premium-navy",
          "Navy premium",
          "Kontras lebih tegas.",
          "Use a seamless deep navy product-photography backdrop with controlled contrast.",
        ],
        [
          "soft-lilac",
          "Lilac lembut",
          "Pastel yang terasa modern.",
          "Use a seamless soft lilac product backdrop; preserve the product's authentic color.",
        ],
        [
          "botanical",
          "Hijau tanaman",
          "Aksen alam yang tidak ramai.",
          "Use restrained softly blurred botanical greenery behind the product; keep foliage away from the label and outline.",
        ],
        [
          "bright-bathroom",
          "Kamar mandi terang",
          "Cocok untuk produk perawatan.",
          "Place the product in a bright clean bathroom setting with subtle stone detail and no other branded items.",
        ],
        [
          "wood-table",
          "Meja kayu",
          "Suasana sehari-hari yang hangat.",
          "Place the product on a simple warm wood display surface with a restrained softly rendered background.",
        ],
        [
          "minimal-cafe",
          "Kafe minimalis",
          "Gaya lifestyle yang rapi.",
          "Place the product in a minimal cafe setting with softly blurred neutral decor and no readable branding.",
        ],
        [
          "window-glow",
          "Jendela bercahaya",
          "Cahaya alami di latar.",
          "Use a softly glowing bright window backdrop with natural depth, preserving the product's silhouette and label.",
        ],
        [
          "light-stone",
          "Batu terang",
          "Tekstur alami yang halus.",
          "Use a restrained pale stone background with subtle realistic texture and no distracting objects.",
        ],
        [
          "dark-charcoal",
          "Arang gelap",
          "Tampilan dramatis dan elegan.",
          "Use a seamless charcoal product backdrop with controlled highlights and clear product separation.",
        ],
        [
          "warm-gradient",
          "Gradien hangat",
          "Warna beralih dengan lembut.",
          "Use a smooth restrained warm gradient background with no banding, preserving exact product color and shape.",
        ],
      ],
      food: [
        [
          "wood-table",
          "Meja kayu",
          "Nuansa hangat seperti kafe.",
          "Place the same dish on a warm natural wood table with believable contact shadows.",
        ],
        [
          "warm-cafe",
          "Kafe hangat",
          "Suasana makan yang akrab.",
          "Place the same dish in a softly blurred warm cafe setting without people, signs, or logos.",
        ],
        [
          "light-stone",
          "Batu terang",
          "Bersih dan segar.",
          "Place the same dish on pale natural stone with restrained texture and realistic contact shadows.",
        ],
        [
          "white-table",
          "Meja putih",
          "Fokus ke hidangan.",
          "Place the same dish on a clean matte white table with an uncluttered background.",
        ],
        [
          "dark-slate",
          "Slate gelap",
          "Warna makanan lebih menonjol.",
          "Place the same dish on dark slate with controlled reflections and accurate food color.",
        ],
        [
          "neutral-linen",
          "Linen netral",
          "Lembut dan terasa rumahan.",
          "Place the same dish on neutral linen with realistic folds kept away from the plate.",
        ],
        [
          "home-kitchen",
          "Dapur rumahan",
          "Suasana dekat dan santai.",
          "Place the same dish in a tidy home kitchen with a softly blurred, restrained background.",
        ],
        [
          "window-cafe",
          "Kafe dekat jendela",
          "Cahaya alami dan suasana ringan.",
          "Place the same dish near a cafe window with soft natural daylight and restrained background detail.",
        ],
        [
          "shaded-garden",
          "Taman teduh",
          "Aksen hijau yang lembut.",
          "Place the same dish on a calm shaded outdoor table with soft greenery in the distance.",
        ],
        [
          "warm-brick",
          "Bata hangat",
          "Tekstur suasana kafe.",
          "Place the same dish in front of a softly blurred warm brick cafe wall without signs or logos.",
        ],
        [
          "marble-table",
          "Meja marmer",
          "Terlihat bersih dan premium.",
          "Place the same dish on pale understated marble with natural veining and realistic plate contact.",
        ],
        [
          "cream-paper",
          "Latar krem",
          "Netral dan terasa editorial.",
          "Use a seamless warm cream food-photography background with gentle natural shadows.",
        ],
        [
          "rustic-board",
          "Papan rustic",
          "Karakter kayu lebih kuat.",
          "Place the same dish on a rustic wooden board with restrained texture and no extra ingredients.",
        ],
        [
          "soft-blue",
          "Biru lembut",
          "Kontras warna yang segar.",
          "Use a matte muted blue background behind the same dish, preserving its authentic food colors.",
        ],
        [
          "woven-table",
          "Meja rotan",
          "Aksen natural yang santai.",
          "Place the same dish on a neat woven-rattan table with realistic texture and restrained detail.",
        ],
        [
          "clean-studio",
          "Studio bersih",
          "Tampilan katalog yang sederhana.",
          "Use a clean neutral food-photo studio background with even tone and natural contact shadow.",
        ],
      ],
    };
    const prefix =
      service === "food" ? "food-environment-" : `${service}-background-`;
    const extraSwatches = [
      [
        "sage",
        "Sage lembut",
        "Warna alam yang tenang.",
        "Use a seamless muted sage-green background; preserve accurate skin, food, and product colors.",
        "#9caf9e",
      ],
      [
        "lavender",
        "Lavender",
        "Ungu muda yang lembut.",
        "Use a seamless soft lavender background; preserve accurate skin, food, and product colors.",
        "#c9b9ed",
      ],
    ].map(([value, label, hint, instruction, color]) =>
      option(value, label, hint, instruction, { kind: "background", color }),
    );
    background.options = [
      ...colorSwatches,
      ...extraSwatches,
      ...atlasOptions(prefix, backgroundRows[service]),
    ];
    background.help =
      service === "professional"
        ? "Pilih warna studio atau suasana kerja. Foto memakai model ilustrasi yang sama."
        : service === "product"
          ? "Pilih warna atau suasana latar. Contoh memakai botol ilustrasi yang sama."
          : "Pilih meja atau suasana. Contoh memakai hidangan ilustrasi yang sama.";
  }
  if (service === "formal" && catalogVersion === 2)
    background.options.push(
      ...[
        [
          "black",
          "Hitam",
          "Kontras formal yang kuat.",
          "Use a seamless solid black background with even tone and no texture.",
          "#171820",
        ],
        [
          "navy",
          "Navy",
          "Tegas tetapi tetap tenang.",
          "Use a seamless deep navy blue background with even tone and no texture.",
          "#192e52",
        ],
        [
          "light-blue",
          "Biru muda",
          "Pilihan warna yang cerah.",
          "Use a seamless light blue background with even tone and no texture.",
          "#9ec9e8",
        ],
        [
          "green",
          "Hijau",
          "Warna polos yang jelas.",
          "Use a seamless solid green background with even tone and no texture.",
          "#31825e",
        ],
        [
          "pink",
          "Merah muda",
          "Warna lembut yang bersih.",
          "Use a seamless soft pink background with even tone and no texture.",
          "#e8b2c0",
        ],
        [
          "lavender",
          "Lavender",
          "Ungu muda yang lembut.",
          "Use a seamless light lavender background with even tone and no texture.",
          "#c9b9ed",
        ],
        [
          "beige",
          "Beige",
          "Netral terang dan hangat.",
          "Use a seamless beige background with even tone and no texture.",
          "#d8c8a8",
        ],
        [
          "light-gray",
          "Abu terang",
          "Netral lembut.",
          "Use a seamless light gray background with even tone and no texture.",
          "#d7d9df",
        ],
        [
          "yellow",
          "Kuning",
          "Warna cerah dan mudah dibaca.",
          "Use a seamless solid yellow background with even tone and no texture.",
          "#f0d853",
        ],
        [
          "teal",
          "Teal",
          "Warna sejuk dengan karakter.",
          "Use a seamless teal background with even tone and no texture.",
          "#277c80",
        ],
      ].map(([value, label, hint, instruction, color]) =>
        option(value, label, hint, instruction, {
          kind: "background",
          color,
        }),
      ),
    );
  const lens = field(
    "lens",
    "Karakter lensa",
    "Ilustrasi AI dengan subjek dan cahaya serupa, bukan simulasi optik terukur. Jarak kamera disesuaikan agar framing sebanding.",
    "composition",
    photoOptions("people-lens", [
      [
        "35",
        "Latar lebih luas — 35 mm",
        "Kamera relatif dekat; lingkungan lebih terasa.",
        "Use a 35 mm full-frame-equivalent perspective with more surrounding context; keep faces away from frame edges and avoid close facial distortion.",
      ],
      [
        "50",
        "Terasa natural — 50 mm",
        "Jarak dan lingkungan terasa seimbang.",
        "Use a 50 mm full-frame-equivalent perspective from a natural working distance, with balanced subject and environmental context.",
      ],
      [
        "85",
        "Potret lebih intim — 85 mm",
        "Kamera mundur; latar tampak lebih rapat.",
        "Use an 85 mm full-frame-equivalent portrait perspective; move the camera farther away for the chosen framing, with visually compressed background relationships.",
      ],
      [
        "100",
        "Detail & kompresi — 100 mm",
        "Jarak lebih jauh, perhatian pada subjek.",
        "Use a 100 mm full-frame-equivalent perspective from a longer camera distance for the selected framing, emphasizing the subject and a compressed background.",
      ],
    ]),
  );
  if (service === "prewedding" && catalogVersion === 2)
    lens.options = atlasOptions("prewedding-lens-", [
      [
        "35",
        "Latar lebih luas · 35 mm",
        "Lebih banyak suasana lokasi.",
        "Use an illustrative 35 mm full-frame-equivalent perspective with more wedding-location context; keep both faces natural and away from frame edges.",
        1,
      ],
      [
        "50",
        "Terasa natural · 50 mm",
        "Pasangan dan latar seimbang.",
        "Use an illustrative 50 mm full-frame-equivalent perspective from a natural working distance, balancing the couple and wedding setting.",
        2,
      ],
      [
        "85",
        "Potret lebih intim · 85 mm",
        "Latar tampak lebih rapat.",
        "Use an illustrative 85 mm full-frame-equivalent portrait perspective from farther away for similar framing, with gentle background compression.",
        3,
      ],
      [
        "100",
        "Detail & kompresi · 100 mm",
        "Pasangan lebih menonjol.",
        "Use an illustrative 100 mm full-frame-equivalent perspective from a longer distance, emphasizing the couple with a compressed background.",
        4,
      ],
      [
        "24",
        "Sangat lebar · 24 mm",
        "Lokasi terasa luas; wajah tetap natural.",
        "Use an illustrative 24 mm environmental perspective, step back to keep faces natural, and avoid exaggerated edge distortion.",
        5,
      ],
      [
        "135",
        "Latar lebih rapat · 135 mm",
        "Kesan intim dari jarak lebih jauh.",
        "Use an illustrative 135 mm full-frame-equivalent perspective from farther away, with visibly compressed background relationships and natural faces.",
        6,
      ],
    ]);
  if (service === "professional" && catalogVersion === 2)
    lens.options = atlasOptions("professional-lens-", [
      [
        "24",
        "Latar lebih luas · 24 mm",
        "Lingkungan lebih terasa; kamera tetap agak jauh.",
        "Use an illustrative 24 mm environmental perspective from a sensible distance; preserve natural face proportions and avoid edge distortion.",
      ],
      [
        "35",
        "Lebih banyak suasana · 35 mm",
        "Potret dan lingkungan terasa seimbang.",
        "Use an illustrative 35 mm full-frame-equivalent perspective with useful environmental context and natural face proportions.",
      ],
      [
        "50",
        "Terasa natural · 50 mm",
        "Jarak potret terasa seimbang.",
        "Use an illustrative 50 mm full-frame-equivalent perspective from a natural portrait distance with balanced context.",
      ],
      [
        "85",
        "Potret lebih intim · 85 mm",
        "Subjek menonjol, latar terasa lembut.",
        "Use an illustrative 85 mm portrait perspective from farther away for similar framing, with gentle background compression.",
      ],
      [
        "100",
        "Latar lebih rapat · 100 mm",
        "Kesan potret lebih dekat.",
        "Use an illustrative 100 mm portrait perspective from a longer distance, with natural facial proportions and a visually compressed background.",
      ],
      [
        "135",
        "Potret paling intim · 135 mm",
        "Latar terasa lebih dekat ke subjek.",
        "Use an illustrative 135 mm portrait perspective from farther away, preserving natural face shape and showing compressed background relationships.",
      ],
    ]);
  if (service === "formal")
    lens.options[0].disabledReason =
      "Pas foto memerlukan perspektif wajah yang netral; pilih 50–100 mm.";
  const pose = field(
    "pose",
    "Pose",
    "Contoh menggunakan satu subjek agar perubahan pose mudah dibandingkan.",
    "subject",
    photoOptions("people-pose", [
      [
        "front",
        "Menghadap depan",
        "Wajah dan bahu sejajar kamera.",
        "Pose facing the camera with level shoulders, upright posture, and both eyes visible.",
      ],
      [
        "three-quarter",
        "Sedikit menyamping",
        "Bahu berputar, wajah tetap terbaca.",
        "Turn the shoulders slightly to a three-quarter angle while keeping the face and both eyes clearly visible.",
      ],
      [
        "seated",
        "Duduk santai",
        "Bahasa tubuh lebih approachable.",
        "Use a relaxed seated pose with natural hand placement, upright spine, and plausible anatomy.",
      ],
      [
        "standing",
        "Berdiri percaya diri",
        "Cocok untuk profil bisnis dan editorial.",
        "Use a confident standing pose, relaxed shoulders, natural hands, and anatomically plausible body proportions.",
      ],
    ]),
  );
  if (service === "formal")
    pose.options.forEach((o) => {
      if (o.value !== "front")
        o.disabledReason =
          "Set formal menggunakan wajah menghadap depan. Gunakan Foto Profesional untuk pose lain.";
    });
  if (service === "professional" && catalogVersion === 2)
    pose.options.push(
      ...atlasOptions(
        "professional-pose-",
        [
          [
            "angled-shoulders",
            "Bahu sedikit miring",
            "Lebih dinamis tetapi tetap profesional.",
            "Turn the shoulders slightly while keeping the face and both eyes clearly readable.",
          ],
          [
            "folded-hands",
            "Tangan terlipat",
            "Bahasa tubuh terasa tenang.",
            "Use a relaxed professional pose with hands lightly folded and anatomically natural fingers.",
          ],
          [
            "relaxed-arms",
            "Tangan rileks",
            "Natural dan tidak kaku.",
            "Pose the person standing with arms relaxed at the sides, shoulders natural, and balanced posture.",
          ],
          [
            "look-aside",
            "Pandang ke samping",
            "Pilihan editorial yang ringan.",
            "Use a gentle off-camera gaze with a natural head angle and relaxed shoulders.",
          ],
          [
            "confident-gaze",
            "Tatapan percaya diri",
            "Tatap kamera dengan tenang.",
            "Use a composed confident direct gaze with relaxed jaw and natural facial proportions.",
          ],
          [
            "half-body",
            "Potret setengah badan",
            "Lebih banyak ruang untuk profil bisnis.",
            "Frame from the waist up with balanced margins, natural posture, and clear hands if visible.",
          ],
          [
            "at-desk",
            "Duduk di meja kerja",
            "Kesan profesional yang approachable.",
            "Pose seated at a simple desk with relaxed shoulders; keep props minimal and avoid invented screens or text.",
          ],
          [
            "profile",
            "Profil samping",
            "Menonjolkan garis wajah secara natural.",
            "Use a gentle side-profile portrait with realistic facial anatomy and a relaxed neck and shoulders.",
          ],
          [
            "natural-smile",
            "Senyum natural",
            "Terlihat ramah dan terbuka.",
            "Use a modest natural smile with realistic teeth and no change to facial identity.",
          ],
          [
            "reflective",
            "Ekspresi reflektif",
            "Suasana lebih editorial.",
            "Use a thoughtful relaxed expression with a soft gaze and natural face.",
          ],
          [
            "loose-crossed-arms",
            "Tangan bersilang santai",
            "Kesan tegas tanpa terlihat kaku.",
            "Pose with loosely crossed arms, relaxed shoulders, and plausible hands and elbows.",
          ],
          [
            "environmental",
            "Potret dengan suasana",
            "Lingkungan kerja tetap sederhana.",
            "Use a wider environmental professional portrait with the subject clearly dominant and background details restrained.",
          ],
        ],
        5,
      ),
    );
  const wardrobe = field(
    "wardrobe",
    "Pakaian",
    "Ikuti izin dan kebutuhan klien. Busana merupakan ilustrasi arah tampilan.",
    "look",
    photoOptions("people-wardrobe", [
      [
        "original",
        "Pakaian asli",
        "Pertahankan pakaian pada foto.",
        "Preserve the original clothing, accessories, and visible fabric details from the reference photo.",
      ],
      [
        "shirt",
        "Kemeja rapi",
        "Sederhana, cocok untuk profil kerja.",
        "Dress the subject in a neatly fitted plain professional shirt, with realistic folds and no invented logos.",
      ],
      [
        "blazer",
        "Blazer profesional",
        "Kesan bisnis yang lebih formal.",
        "Dress the subject in a refined well-fitted blazer over a simple shirt, with natural fabric structure and no invented insignia.",
      ],
      [
        "graduation",
        "Busana wisuda",
        "Toga tanpa lambang universitas rekaan.",
        "Use a clean graduation gown and mortarboard; do not invent university emblems, medals, or qualifications.",
      ],
      [
        "kebaya",
        "Adat modern",
        "Rincian adat mengikuti brief klien.",
        "Use tasteful modern Indonesian ceremonial clothing according to the client brief; do not invent culturally specific ceremonial attributes.",
      ],
      [
        "hijab",
        "Hijab rapi",
        "Tertutup, bentuk wajah tetap terlihat.",
        "Use a neatly arranged modest hijab and professional modest clothing, preserving the visible facial identity and natural fabric folds.",
      ],
    ]),
  );
  if (service === "formal")
    wardrobe.options = wardrobe.options.filter((o) =>
      ["original", "shirt", "blazer", "hijab"].includes(o.value),
    );
  if (service === "professional" && catalogVersion === 2)
    wardrobe.options.push(
      ...atlasOptions(
        "professional-wardrobe-",
        [
          [
            "formal-suit",
            "Jas formal",
            "Untuk profil bisnis yang lebih resmi.",
            "Dress the person in a well-fitted formal business suit with a plain shirt, natural fabric folds, and no invented insignia.",
          ],
          [
            "light-blue-blouse",
            "Blus biru muda",
            "Warna lembut untuk profil kerja.",
            "Dress the person in a neat light-blue professional blouse with realistic fabric and no logos.",
          ],
          [
            "medical-coat",
            "Jas medis polos",
            "Untuk potret tenaga kesehatan.",
            "Use a clean plain medical coat only as wardrobe styling; do not add credentials, badges, or imply a qualification.",
          ],
          [
            "creative-casual",
            "Kasual kreatif",
            "Rapi tanpa terasa terlalu formal.",
            "Dress the person in polished creative-casual clothing suitable for a professional profile, with no logos.",
          ],
          [
            "navy-blazer",
            "Blazer navy",
            "Tampilan bisnis yang klasik.",
            "Dress the person in a restrained navy blazer and plain top, with realistic tailoring and no insignia.",
          ],
          [
            "sage-blazer",
            "Blazer sage",
            "Pilihan warna modern yang tenang.",
            "Dress the person in a muted sage blazer and simple top, preserving realistic material and natural proportions.",
          ],
          [
            "collared-shirt",
            "Kemeja berkerah",
            "Sederhana dan mudah dipadukan.",
            "Dress the person in a clean collared professional shirt with realistic folds and no visible logo.",
          ],
          [
            "hijab-blazer",
            "Hijab & blazer",
            "Busana tertutup untuk profil profesional.",
            "Use a neatly arranged modest hijab with a coordinated professional blazer; preserve facial identity and natural fabric folds.",
          ],
          [
            "graduation-gown",
            "Busana wisuda",
            "Toga tanpa lambang rekaan.",
            "Use a simple graduation gown and mortarboard; do not invent university emblems, medals, or qualifications.",
          ],
          [
            "dark-monochrome",
            "Monokrom gelap",
            "Tampilan rapi dengan warna senada.",
            "Dress the person in restrained dark monochrome professional clothing with clear fabric detail and no logos.",
          ],
        ],
        7,
      ),
    );
  if (service === "prewedding") {
    wardrobe.options = wardrobe.options.filter((o) =>
      ["original", "kebaya", "hijab"].includes(o.value),
    );
    wardrobe.options.splice(
      1,
      0,
      option(
        "couple-formal",
        "Busana pasangan elegan",
        "Terkoordinasi, mengikuti kebutuhan masing-masing orang.",
        "Dress the couple in coordinated refined formal attire suitable for each individual and the client brief, with realistic tailoring and no invented insignia. Keep identities and outfit roles distinct.",
        {
          kind: "photo",
          src: "/assets/v2/cases/prewedding-minimal-after-small.webp",
        },
      ),
    );
    const traditional = wardrobe.options.find((o) => o.value === "kebaya")!;
    traditional.visual = {
      kind: "photo",
      src: "/assets/v2/cases/prewedding-traditional-after-small.webp",
    };
    if (catalogVersion === 2) {
      const wardrobeVisuals: Record<string, number> = {
        original: 2,
        "couple-formal": 1,
        kebaya: 3,
        hijab: 4,
      };
      wardrobe.options.forEach((choice) => {
        const imageIndex = wardrobeVisuals[choice.value];
        if (imageIndex)
          choice.visual = {
            kind: "photo",
            src: `/assets/v2/options-v3/prewedding-wardrobe-${String(imageIndex).padStart(2, "0")}-small.webp`,
          };
      });
      wardrobe.options.push(
        ...atlasOptions(
          "prewedding-wardrobe-",
          [
            [
              "dusty-rose",
              "Dusty rose",
              "Lembut dan senada.",
              "Dress the couple in coordinated dusty-rose wedding attire with refined realistic tailoring and distinct roles.",
            ],
            [
              "navy-formal",
              "Navy formal",
              "Warna gelap yang rapi.",
              "Dress the couple in coordinated navy formal wedding attire with restrained accessories and realistic fabric.",
            ],
            [
              "batik-modern",
              "Batik modern",
              "Motif adat sebagai aksen.",
              "Dress the couple in tasteful modern Indonesian batik wedding attire; avoid inventing specific ceremonial status.",
            ],
            [
              "tuxedo",
              "Tuxedo klasik",
              "Tampilan pesta malam.",
              "Dress the couple in a classic black tuxedo and coordinated wedding gown, keeping each person's styling distinct.",
            ],
            [
              "hijab-cream",
              "Krem berhijab",
              "Busana tertutup bernuansa hangat.",
              "Dress the couple in coordinated cream wedding attire with a neatly arranged modest hijab and natural fabric folds.",
            ],
            [
              "sky-blue",
              "Biru muda",
              "Terasa ringan dan segar.",
              "Dress the couple in coordinated soft sky-blue wedding attire, keeping colors realistic and outfits individually appropriate.",
            ],
            [
              "white-minimal",
              "Putih minimalis",
              "Detail busana tetap sederhana.",
              "Dress the couple in minimal refined white wedding attire with clean tailoring and no invented insignia.",
            ],
            [
              "terracotta",
              "Terracotta",
              "Warna hangat yang menonjol.",
              "Dress the couple in coordinated muted terracotta wedding attire with realistic fabric and subtle styling.",
            ],
            [
              "deep-green",
              "Hijau tua",
              "Tampilan formal berkarakter.",
              "Dress the couple in coordinated deep-green formal wedding attire with realistic material and restrained accessories.",
            ],
            [
              "hijab-white",
              "Putih berhijab",
              "Putih bersih dengan gaya tertutup.",
              "Dress the couple in coordinated white wedding attire with a modest white hijab, preserving natural facial identity.",
            ],
            [
              "maroon",
              "Marun hangat",
              "Lebih kaya dan klasik.",
              "Dress the couple in coordinated warm-maroon wedding attire with elegant realistic tailoring.",
            ],
            [
              "black-ivory",
              "Hitam & ivory",
              "Kontras klasik yang seimbang.",
              "Dress the couple in coordinated black and ivory formal wedding attire with clear distinct outfit roles.",
            ],
          ],
          5,
        ),
      );
    }
  }
  const expression = field(
    "expression",
    "Ekspresi",
    "Tetap natural, tanpa mengubah bentuk wajah.",
    "subject",
    photoOptions("people-expression", [
      [
        "neutral",
        "Netral",
        "Tenang, bibir menutup natural.",
        "Use a calm neutral expression with naturally closed lips and eyes directed toward the camera.",
      ],
      [
        "smile",
        "Senyum ringan",
        "Ramah tanpa ekspresi berlebihan.",
        "Use a gentle natural smile without changing facial proportions or exaggerating teeth.",
      ],
      [
        "confident",
        "Percaya diri",
        "Tatapan tegas, rahang tetap santai.",
        "Use a confident direct gaze with a relaxed jaw and a subtle composed expression.",
      ],
      [
        "thoughtful",
        "Reflektif",
        "Lebih editorial, arah pandang lembut.",
        "Use a thoughtful, softly focused expression and a natural relaxed face.",
      ],
    ]),
  );
  if (service === "formal")
    expression.options[3].disabledReason =
      "Untuk foto formal, gunakan tatapan ke kamera.";
  const depth = field(
    "depth",
    "Ketajaman latar",
    "Tidak menetapkan aperture yang bertentangan dengan kedalaman bidang.",
    "composition",
    photoOptions("people-depth", [
      [
        "deep",
        "Detail menyeluruh",
        "Subjek dan lingkungan tetap jelas.",
        "Use sufficient depth of field to keep the subject and relevant surroundings sharply readable; avoid strong background blur.",
      ],
      [
        "balanced",
        "Fokus seimbang",
        "Subjek tajam, latar sedikit lembut.",
        "Keep the entire subject sharp with moderate background separation; preserve context and avoid excessive blur.",
      ],
      [
        "shallow",
        "Latar lembut",
        "Subjek menonjol; detail penting tetap tajam.",
        "Use selective shallow depth of field with smooth background blur; keep all critical subject details on the focus plane.",
      ],
    ]),
    true,
  );
  const ratio = field(
    "ratio",
    "Format gambar",
    "Rasio memberi arah komposisi, bukan ukuran cetak atau jaminan spesifikasi dokumen.",
    "format",
    ["1:1", "4:5", "3:4", "2:3", "4:3", "16:9", "9:16"].map((value) =>
      option(
        value,
        value,
        value === "9:16"
          ? "Story dan Reels."
          : value === "16:9"
            ? "Banner horizontal."
            : "Sesuaikan dengan kebutuhan penyerahan.",
        `Compose the final image in a ${value} aspect ratio; keep the important subject within safe margins.`,
        { kind: "ratio", ratio: value },
      ),
    ),
  );
  const palette = field(
    "palette",
    "Palet warna",
    "Palet adalah arahan visual; warna produk dan identitas tetap akurat.",
    "look",
    [
      [
        "violet",
        "Violet modern",
        "#6b4de6",
        "#eee9ff",
        "Use a controlled violet and warm-white accent palette.",
      ],
      [
        "coral",
        "Coral hangat",
        "#ea725a",
        "#fff0e6",
        "Use a controlled coral and warm cream accent palette.",
      ],
      [
        "mint",
        "Mint segar",
        "#4b8c77",
        "#e0efe6",
        "Use a restrained mint green and off-white accent palette.",
      ],
      [
        "cream",
        "Netral hangat",
        "#b1997d",
        "#f1e8dc",
        "Use warm cream and restrained neutral accents.",
      ],
      [
        "ink",
        "Tinta monokrom",
        "#23232d",
        "#f8f7f2",
        "Use a high-contrast dark ink and warm-white monochrome palette.",
      ],
      [
        "teal",
        "Teal & amber",
        "#28545c",
        "#d3a06c",
        "Use restrained teal shadows and amber highlights without changing real subject colors.",
      ],
      [
        "warm",
        "Warna hangat",
        "#b26b48",
        "#e6cba3",
        "Use a restrained warm natural color grade with accurate skin and material tones.",
      ],
    ].map(([value, label, a, b, instruction]) =>
      option(
        value,
        label,
        "Warna aksen tidak mengganti warna asli produk.",
        instruction,
        { kind: "palette", colors: [a, b] },
      ),
    ),
  );
  if (
    catalogVersion === 2 &&
    ["ads", "social", "cinematic", "property", "branding"].includes(service)
  )
    palette.options.push(
      ...[
        [
          "berry",
          "Berry & peach",
          "Aksen cerah tetapi tetap lembut.",
          "Use a restrained berry and peach accent palette while preserving authentic subject and product colors.",
          "#9b496d",
          "#f1c1ae",
        ],
        [
          "olive",
          "Olive & krem",
          "Nuansa alam yang hangat.",
          "Use muted olive green with warm cream accents; do not alter real product or skin colors.",
          "#68744b",
          "#f0e7d2",
        ],
        [
          "lavender",
          "Lavender & plum",
          "Ungu lembut dengan kontras.",
          "Use a soft lavender and deep plum palette with clear accessible contrast.",
          "#bda9e8",
          "#553e70",
        ],
        [
          "cobalt",
          "Biru & putih",
          "Bersih dan terasa modern.",
          "Use restrained cobalt blue and warm white accents; preserve the original subject colors.",
          "#2856b8",
          "#f7f5ee",
        ],
        [
          "mustard",
          "Mustard & charcoal",
          "Kontras kuat untuk promosi.",
          "Use muted mustard accents with charcoal and warm white, keeping text areas clear.",
          "#d9a83e",
          "#292832",
        ],
        [
          "plum",
          "Plum & sage",
          "Kesan dewasa dan tenang.",
          "Use deep plum with restrained sage accents and natural material colors.",
          "#61415f",
          "#9caf91",
        ],
        [
          "forest",
          "Forest & sand",
          "Nuansa natural yang matang.",
          "Use deep forest green and soft sand accents without implying product ingredients.",
          "#315846",
          "#dfcaa6",
        ],
        [
          "rose",
          "Rose & burgundy",
          "Warna hangat dengan aksen gelap.",
          "Use muted rose with burgundy accents and balanced warm-white space.",
          "#d68e99",
          "#6b334d",
        ],
        [
          "mono-warm",
          "Monokrom hangat",
          "Satu warna dengan beberapa tingkat.",
          "Use a warm monochrome range from cream to deep brown with distinct readable tonal hierarchy.",
          "#c7a98b",
          "#483a33",
        ],
      ].map(([value, label, hint, instruction, first, second]) =>
        option(value, label, hint, instruction, {
          kind: "palette",
          colors: [first, second],
        }),
      ),
    );
  const layout = field(
    "layout",
    "Letak subjek & ruang teks",
    "Teks dapat diselesaikan di editor agar akurat. Tidak menambahkan klaim atau promo otomatis.",
    "composition",
    [
      [
        "left",
        "Teks di kiri",
        "Subjek berada di kanan.",
        "Place the subject on the right and reserve uncluttered negative space on the left for later text.",
      ],
      [
        "top",
        "Teks di atas",
        "Area judul tetap lega.",
        "Place the subject in the lower two thirds and reserve a clean upper area for later text.",
      ],
      [
        "center",
        "Subjek di tengah",
        "Ruang aman di sekeliling subjek.",
        "Center the subject with generous uncluttered margins and separate space for later copy.",
      ],
      [
        "bottom",
        "Teks di bawah",
        "Produk atau wajah tidak tertutup.",
        "Place the subject in the upper portion and reserve a clean lower area for later text.",
      ],
    ].map(([value, label, hint, instruction]) =>
      option(value, label, hint, instruction, {
        kind: "layout",
        layout: value,
      }),
    ),
  );
  if (catalogVersion === 2 && ["ads", "social"].includes(service))
    layout.options.push(
      ...[
        [
          "subject-left",
          "Produk di kiri, teks kanan",
          "Seimbang untuk banner horizontal.",
          "Place the main product or subject on the left and reserve a clean readable area on the right for later copy.",
          "subject-left",
        ],
        [
          "subject-top",
          "Subjek di atas",
          "Judul dapat ditempatkan di bawah.",
          "Place the subject in the upper third and keep a clear lower text area for later typesetting.",
          "subject-top",
        ],
        [
          "subject-bottom",
          "Subjek di bawah",
          "Judul mendapat ruang di atas.",
          "Place the subject in the lower third and reserve a calm upper area for a short headline.",
          "subject-bottom",
        ],
        [
          "split-columns",
          "Dua kolom",
          "Subjek dan ruang tulisan terpisah.",
          "Create a balanced two-column composition with the subject in one half and uncluttered copy space in the other.",
          "split-columns",
        ],
        [
          "product-close-left",
          "Detail produk di kiri",
          "Cocok untuk menonjolkan satu fitur visual.",
          "Use a close subject crop on the left while preserving the complete recognizable product silhouette and a clean right text area.",
          "product-close-left",
        ],
        [
          "subject-small-bottom",
          "Subjek kecil di bawah",
          "Area judul terasa lebih lega.",
          "Keep the subject smaller in the lower area and leave generous clean negative space above for later typesetting.",
          "subject-small-bottom",
        ],
        [
          "copy-corner",
          "Ruang tulisan di sudut",
          "Teks singkat tidak menutupi fokus utama.",
          "Keep the main subject central and reserve one uncluttered upper corner for a short later caption.",
          "copy-corner",
        ],
        [
          "stacked",
          "Bertumpuk vertikal",
          "Cocok untuk konten vertikal.",
          "Use a vertical hierarchy with the subject in the upper half and a separate clean lower copy zone.",
          "stacked",
        ],
        [
          "wide-left",
          "Visual lebar di kiri",
          "Sisakan sisi kanan untuk informasi.",
          "Compose a wider scene on the left two-thirds and reserve the right third as clean text space.",
          "wide-left",
        ],
        [
          "balanced-grid",
          "Subjek dengan margin",
          "Tampilan rapi untuk feed.",
          "Center the subject within generous safe margins and keep a separate uncluttered strip for later copy.",
          "balanced-grid",
        ],
        [
          "portrait-upper",
          "Potret di bagian atas",
          "Ruang bawah siap untuk judul.",
          "Place the portrait in the upper two-thirds and reserve a plain lower band for precise typesetting later.",
          "portrait-upper",
        ],
        [
          "story-safe",
          "Area aman Story",
          "Jauhkan subjek dari kontrol aplikasi.",
          "Use a vertical story composition with the subject centered inside safe margins, leaving clear top and bottom UI zones.",
          "story-safe",
        ],
      ].map(([value, label, hint, instruction, layoutValue]) =>
        option(value, label, hint, instruction, {
          kind: "layout",
          layout: layoutValue,
        }),
      ),
    );
  const typography = field(
    "typography",
    "Arah tipografi",
    "Contoh deterministik, bukan font yang akan dihasilkan persis oleh generator.",
    "look",
    [
      [
        "sans",
        "Sans bersih",
        "Modern dan mudah dibaca.",
        "Use a clean contemporary sans-serif typographic direction.",
      ],
      [
        "serif",
        "Serif editorial",
        "Lebih elegan dan berkarakter.",
        "Use a refined editorial serif typographic direction.",
      ],
      [
        "bold",
        "Tebal ekspresif",
        "Judul singkat yang menonjol.",
        "Use a bold compact display typographic direction with clear hierarchy.",
      ],
    ].map(([value, label, hint, instruction]) =>
      option(value, label, hint, instruction, { kind: "type", layout: value }),
    ),
  );
  if (catalogVersion === 2 && ["ads", "social", "branding"].includes(service))
    typography.options.push(
      option(
        "rounded",
        "Sans membulat",
        "Terasa ramah dan ringan.",
        "Use a friendly rounded sans-serif typographic direction with clear hierarchy and legibility.",
        { kind: "type", layout: "rounded" },
      ),
      option(
        "handwritten",
        "Tulisan tangan",
        "Aksen personal untuk kata singkat.",
        "Use a restrained hand-lettered typographic accent for short words only; preserve exact supplied copy and do not invent text.",
        { kind: "type", layout: "handwritten" },
      ),
      option(
        "condensed",
        "Tebal ramping",
        "Judul kuat dengan bentuk lebih rapat.",
        "Use a compact condensed display typographic direction for a short headline, leaving generous legibility and clear spacing.",
        { kind: "type", layout: "condensed" },
      ),
    );
  const angle = field(
    "angle",
    "Sudut pengambilan",
    "Pilih sudut sesuai detail yang ingin dijual.",
    "composition",
    photoOptions(service === "food" ? "food-angle" : "product-angle", [
      [
        "eye",
        "Sejajar produk",
        "Bentuk dan label mudah dibaca.",
        "Photograph at product eye level with a straight, undistorted view and a readable front label.",
      ],
      [
        "three-quarter",
        "Sudut tiga perempat",
        "Kedalaman dan sisi produk terlihat.",
        "Photograph from a three-quarter angle to show front and side geometry while retaining label readability.",
      ],
      [
        "overhead",
        "Dari atas",
        "Cocok untuk komposisi meja.",
        "Use a top-down overhead view with a coherent flat-lay arrangement and consistent scale.",
      ],
      [
        "macro",
        "Detail dekat",
        "Tekstur menjadi pusat perhatian.",
        "Use a close detail composition emphasizing authentic material texture, without inventing tiny printed details.",
      ],
    ]),
  );
  if (catalogVersion === 2 && ["product", "food"].includes(service))
    angle.options =
      service === "product"
        ? atlasOptions("product-angle-", [
            [
              "eye",
              "Sejajar produk",
              "Bentuk dan label mudah dibaca.",
              "Photograph at product eye level with a straight, undistorted view and readable supplied label.",
              1,
            ],
            [
              "three-quarter",
              "Tiga perempat",
              "Bagian depan dan sisi terlihat.",
              "Photograph from a three-quarter angle to show front and side geometry while retaining label readability.",
              2,
            ],
            [
              "slightly-high",
              "Sedikit dari atas",
              "Bagian atas produk ikut terlihat.",
              "Use a gently elevated camera angle that reveals the top edge while preserving product geometry and label shape.",
              3,
            ],
            [
              "overhead",
              "Dari atas",
              "Cocok untuk komposisi meja.",
              "Use a top-down view with coherent flat-lay composition and consistent product scale.",
              4,
            ],
            [
              "low",
              "Sudut rendah",
              "Produk tampak lebih menonjol.",
              "Photograph from a modestly low camera position while preserving true product proportions and a readable label.",
              5,
            ],
            [
              "side",
              "Sisi produk",
              "Bentuk samping lebih terlihat.",
              "Show a restrained side view that reveals product depth while retaining enough front silhouette for recognition.",
              6,
            ],
            [
              "macro",
              "Detail label",
              "Fokus pada area label yang ada.",
              "Use a close detail framing of the supplied label area; do not invent, redraw, or alter any printed text.",
              7,
            ],
            [
              "cap-detail",
              "Detail tutup",
              "Menonjolkan bentuk tutup.",
              "Use a close material detail of the original cap and neck; preserve geometry and avoid invented texture or text.",
              8,
            ],
          ])
        : atlasOptions("food-angle-", [
            [
              "eye",
              "Sejajar hidangan",
              "Bentuk sajian dan wadah terbaca.",
              "Photograph at dish eye level, showing authentic food texture and serving-vessel geometry.",
              1,
            ],
            [
              "three-quarter",
              "Tiga perempat",
              "Isi dan tinggi sajian terlihat.",
              "Photograph from a slightly elevated three-quarter angle to show authentic plating and food depth.",
              2,
            ],
            [
              "slightly-high",
              "Sedikit dari atas",
              "Komposisi meja ikut terlihat.",
              "Use a moderately elevated angle that shows plating while retaining natural dish depth and food proportions.",
              3,
            ],
            [
              "overhead",
              "Dari atas",
              "Tata piring terlihat menyeluruh.",
              "Use a true overhead view with the complete serving vessel inside frame and authentic food arrangement.",
              4,
            ],
            [
              "low",
              "Rendah sejajar meja",
              "Lapisan hidangan lebih terasa.",
              "Photograph from a low table-level angle, keeping the original portion and serving vessel recognizable.",
              5,
            ],
            [
              "diagonal",
              "Diagonal dari samping",
              "Terasa editorial dan dinamis.",
              "Use a gentle diagonal tabletop composition with the same dish and serving vessel fully readable.",
              6,
            ],
            [
              "macro",
              "Detail tekstur",
              "Fokus dekat pada tekstur asli.",
              "Use a close detail composition emphasizing authentic food texture without changing ingredients or creating unnatural gloss.",
              7,
            ],
            [
              "wide",
              "Sajian lebih luas",
              "Lebih banyak ruang di sekitar piring.",
              "Use a wider environmental food composition with generous table context while keeping the same dish and portion clear.",
              8,
            ],
          ]);
  const surface = field(
    "surface",
    "Permukaan",
    service === "food"
      ? "Contoh memakai hidangan yang sama."
      : "Contoh memakai produk yang sama.",
    "scene",
    photoOptions(service === "food" ? "food-surface" : "product-surface", [
      [
        "white",
        "Putih bersih",
        "Fokus penuh pada produk.",
        "Place the product on a clean matte white surface with a physically consistent contact shadow.",
      ],
      [
        "stone",
        "Batu natural",
        "Tekstur premium yang tenang.",
        "Place the product on a subtle pale natural stone surface, with realistic contact and restrained texture.",
      ],
      [
        "wood",
        "Kayu hangat",
        "Organik dan terasa akrab.",
        "Place the product on a natural wood tabletop with restrained grain and realistic contact.",
      ],
      [
        "pastel",
        "Bidang pastel",
        "Lebih ekspresif namun tetap rapi.",
        "Place the product on a matte pastel surface coordinated with the background; retain the true product color.",
      ],
    ]),
  );
  if (service === "product" && catalogVersion === 2)
    surface.options.push(
      ...atlasOptions(
        "product-surface-",
        [
          [
            "blush-acrylic",
            "Akrilik blush",
            "Permukaan glossy bernuansa pastel.",
            "Place the product on blush acrylic with restrained physically plausible reflections and accurate product geometry.",
          ],
          [
            "mirror",
            "Cermin",
            "Pantulan rapi untuk kesan premium.",
            "Place the product on a clean mirror surface with a physically plausible restrained reflection; preserve its true shape and color.",
          ],
          [
            "travertine",
            "Travertine",
            "Batu terang dengan tekstur halus.",
            "Place the product on pale travertine with subtle natural pores and realistic contact shadows.",
          ],
          [
            "linen",
            "Kain linen",
            "Tekstur lembut tanpa menutupi produk.",
            "Place the product on clean neutral linen with restrained folds; keep all packaging and labels unobstructed.",
          ],
          [
            "terrazzo",
            "Terrazzo",
            "Bintik warna halus sebagai aksen.",
            "Place the product on restrained terrazzo with a fine balanced aggregate pattern; retain product color accurately.",
          ],
          [
            "glass",
            "Kaca bening",
            "Bersih dan memantulkan cahaya.",
            "Place the product on a clear glass surface with subtle physically plausible reflections and safe stable contact.",
          ],
          [
            "concrete",
            "Beton halus",
            "Nuansa modern dan minimal.",
            "Place the product on smooth pale concrete with restrained pores and a consistent contact shadow.",
          ],
          [
            "cream-paper",
            "Kertas krem",
            "Latar lembut untuk katalog.",
            "Place the product on matte warm cream paper with an even tone and no writing or texture distractions.",
          ],
          [
            "black-lacquer",
            "Lacquer hitam",
            "Pantulan gelap yang elegan.",
            "Place the product on dark black lacquer with a controlled subtle reflection and readable product details.",
          ],
          [
            "sage-ceramic",
            "Keramik sage",
            "Warna hijau lembut yang tenang.",
            "Place the product on a matte muted sage ceramic surface; keep the product's authentic colors unchanged.",
          ],
          [
            "sand",
            "Pasir halus",
            "Tekstur natural yang lembut.",
            "Place the product on clean fine sand with a stable contact shadow; do not imply an outdoor location unless selected separately.",
          ],
          [
            "peach",
            "Peach lembut",
            "Aksen pastel yang hangat.",
            "Place the product on a matte soft-peach surface with a smooth finish and realistic contact shadow.",
          ],
        ],
        5,
      ),
    );
  if (service === "food" && catalogVersion === 2)
    surface.options = atlasOptions("food-surface-", [
      [
        "white",
        "Putih matte",
        "Bersih dan fokus ke sajian.",
        "Place the same dish on a clean matte white tabletop with soft realistic contact shadow.",
        1,
      ],
      [
        "stone",
        "Batu terang",
        "Tekstur natural yang halus.",
        "Place the same dish on pale natural stone with restrained texture and realistic contact.",
        2,
      ],
      [
        "wood",
        "Kayu oak",
        "Hangat dan terasa akrab.",
        "Place the same dish on warm oak wood with natural understated grain.",
        3,
      ],
      [
        "slate",
        "Slate gelap",
        "Warna hidangan lebih menonjol.",
        "Place the same dish on dark slate while preserving accurate food color and realistic shadow.",
        4,
      ],
      [
        "linen",
        "Linen krem",
        "Lembut dengan tekstur kain.",
        "Place the same dish on neutral cream linen, with folds kept clear of the plate.",
        5,
      ],
      [
        "terrazzo",
        "Terrazzo",
        "Bintik lembut sebagai aksen.",
        "Place the same dish on pale terrazzo with fine restrained aggregate and realistic plate contact.",
        6,
      ],
      [
        "bamboo",
        "Bambu natural",
        "Suasana tropis yang ringan.",
        "Place the same dish on a clean natural bamboo surface with restrained grain.",
        7,
      ],
      [
        "sage-tile",
        "Keramik sage",
        "Warna alam yang menenangkan.",
        "Place the same dish on muted sage ceramic tile, keeping food colors authentic.",
        8,
      ],
      [
        "walnut",
        "Walnut gelap",
        "Nuansa kayu yang lebih kaya.",
        "Place the same dish on dark walnut wood with realistic subdued grain.",
        9,
      ],
      [
        "marble",
        "Marmer terang",
        "Rapi dan terasa premium.",
        "Place the same dish on pale marble with subtle natural veining and no distracting reflections.",
        10,
      ],
      [
        "pastel",
        "Peach lembut",
        "Aksen hangat yang ringan.",
        "Place the same dish on a matte soft peach surface while retaining true food colors.",
        11,
      ],
      [
        "blue-gray",
        "Biru abu",
        "Kontras sejuk dan modern.",
        "Place the same dish on a matte blue-gray tabletop with restrained tone and authentic food colors.",
        12,
      ],
      [
        "concrete",
        "Beton halus",
        "Modern dan minimal.",
        "Place the same dish on smooth pale concrete with restrained texture and natural contact shadow.",
        13,
      ],
      [
        "rattan",
        "Rotan",
        "Tekstur natural yang santai.",
        "Place the same dish on a neat woven rattan surface with realistic scale and safe plate contact.",
        14,
      ],
      [
        "kraft",
        "Kertas kraft",
        "Hangat untuk gaya takeaway.",
        "Place the same dish on clean kraft paper with no writing or invented packaging claims.",
        15,
      ],
      [
        "travertine",
        "Travertine",
        "Batu hangat dengan pola lembut.",
        "Place the same dish on warm pale travertine with subtle pores and a realistic contact shadow.",
        16,
      ],
    ]);
  const props = field(
    "props",
    "Properti pendukung",
    "Tidak menambah klaim bahan produk. Pilih hanya bila relevan.",
    "scene",
    photoOptions(service === "food" ? "food-props" : "product-props", [
      [
        "none",
        "Tanpa properti",
        "Katalog yang tidak ramai.",
        "Do not add decorative props; keep the scene focused on the original product.",
      ],
      [
        "botanical",
        "Daun dekoratif",
        "Dekorasi, bukan klaim kandungan.",
        "Add a few restrained decorative green leaves without implying ingredients or product claims.",
      ],
      [
        "citrus",
        "Aksen citrus",
        "Gunakan bila relevan dengan brief.",
        "Add a restrained decorative citrus accent only as styling, not as an ingredient or benefit claim.",
      ],
      [
        "fabric",
        "Kain lembut",
        "Tekstur tambahan yang tidak menutup label.",
        "Add a subtle fabric drape as a supporting prop, keeping the product shape and label unobstructed.",
      ],
    ]),
  );
  if (service === "product" && catalogVersion === 2)
    props.options = atlasOptions("product-props-", [
      [
        "botanical",
        "Daun dekoratif",
        "Aksen alam, bukan klaim kandungan.",
        "Add a restrained decorative green branch outside the bottle; do not imply ingredients or benefits.",
        1,
      ],
      [
        "fabric",
        "Kain krem",
        "Tekstur lembut tanpa menutup label.",
        "Add a neutral cream fabric fold behind the bottle, keeping its shape and label unobstructed.",
        2,
      ],
      [
        "glass-sphere",
        "Bola kaca",
        "Pantulan kecil sebagai aksen.",
        "Add one clear glass sphere beside the bottle with subtle physically plausible reflections.",
        3,
      ],
      [
        "ceramic-tray",
        "Nampan keramik",
        "Menata produk dengan rapi.",
        "Place the bottle near a simple pale ceramic tray without covering its label or changing its proportions.",
        4,
      ],
      [
        "citrus",
        "Aksen citrus",
        "Hanya dekorasi, bukan klaim bahan.",
        "Add one restrained decorative citrus accent outside the bottle; do not imply it is an ingredient or product benefit.",
        5,
      ],
      [
        "dried-flowers",
        "Bunga kering",
        "Nuansa natural yang lembut.",
        "Place a small dried botanical accent behind the bottle, keeping it clear of the label and silhouette.",
        6,
      ],
      [
        "mirror-card",
        "Kartu cermin",
        "Pantulan halus untuk kesan premium.",
        "Add a small mirror card beside the bottle, with controlled reflections and no reflected text.",
        7,
      ],
      [
        "stone",
        "Batu halus",
        "Aksen natural yang sederhana.",
        "Add one pale smooth stone beside the bottle with realistic scale and contact.",
        8,
      ],
      [
        "blush-paper",
        "Kertas blush",
        "Aksen warna pastel.",
        "Add a restrained blush paper plane behind the bottle, keeping color accurate and avoiding text.",
        9,
      ],
      [
        "ribbon",
        "Pita netral",
        "Detail lembut di sekitar produk.",
        "Add a simple neutral ribbon beside the bottle, never covering its label or cap.",
        10,
      ],
      [
        "water-drops",
        "Tetes air",
        "Kilau kecil pada permukaan.",
        "Add a few small water droplets on the display surface only; do not imply a product claim or wet the label.",
        11,
      ],
      [
        "sage-block",
        "Balok sage",
        "Bidang kecil sebagai penyangga visual.",
        "Add a small matte sage display block beside the bottle with stable contact and restrained color.",
        12,
      ],
      [
        "large-dried-bloom",
        "Bunga kering besar",
        "Aksen floral tetap di latar.",
        "Place one restrained dried bloom at the frame edge, behind the bottle and away from its label.",
        13,
      ],
      [
        "acrylic-block",
        "Akrilik bening",
        "Bentuk transparan yang ringan.",
        "Add one clear acrylic block beside the product with subtle realistic edges and no distracting reflections.",
        14,
      ],
      [
        "linen",
        "Linen natural",
        "Kain bertekstur yang lembut.",
        "Add a restrained neutral linen fold behind the bottle, keeping every packaging detail unobstructed.",
        15,
      ],
      [
        "none",
        "Tanpa properti",
        "Produk menjadi satu-satunya fokus.",
        "Do not add props; keep the scene focused on the original product and its packaging.",
        16,
      ],
    ]);
  if (service === "food" && catalogVersion === 2)
    props.options.push(
      ...atlasOptions("food-props-", [
        [
          "cutlery",
          "Alat makan polos",
          "Aksen sederhana di sisi piring.",
          "Place plain clean cutlery beside, not on top of, the dish; do not change its portion.",
          2,
        ],
        [
          "water-glass",
          "Gelas air",
          "Memberi konteks suasana makan.",
          "Add one plain water glass in the background, with no label and no extra food.",
          3,
        ],
        [
          "banana-leaf",
          "Daun pisang",
          "Aksen lokal yang natural.",
          "Add one clean banana-leaf accent beside the plate as styling only, keeping the original dish unchanged.",
          4,
        ],
        [
          "chili-bowl",
          "Sambal kecil",
          "Sajian pendamping di luar piring.",
          "Place a small separate condiment bowl beside the dish; do not alter the main serving or invent ingredients.",
          5,
        ],
        [
          "wooden-spoon",
          "Sendok kayu",
          "Tekstur hangat sebagai aksen.",
          "Place a clean wooden spoon beside the plate, never covering the food.",
          6,
        ],
        [
          "neutral-napkin",
          "Serbet netral",
          "Kain dilipat rapi di meja.",
          "Add a neatly folded neutral napkin beside the plate without covering the serving.",
          7,
        ],
        [
          "ceramic-cup",
          "Cangkir keramik",
          "Konteks kafe yang sederhana.",
          "Add one plain ceramic cup in the distance; do not add readable text or another dish.",
          8,
        ],
        [
          "herb-sprig",
          "Daun herba",
          "Aksen kecil di sisi piring.",
          "Add a small decorative herb sprig outside the plate; do not imply or change ingredients.",
          9,
        ],
        [
          "blank-menu",
          "Papan menu kosong",
          "Latar kafe tanpa tulisan rekaan.",
          "Place a blank menu board softly out of focus in the distance with no writing, logo, or claims.",
          10,
        ],
        [
          "woven-mat",
          "Alas anyaman",
          "Tekstur natural di bawah piring.",
          "Place the dish on a neat woven placemat with realistic scale and stable plate contact.",
          11,
        ],
        [
          "sauce-bowl",
          "Mangkuk saus",
          "Pendamping kecil, tidak menutup sajian.",
          "Add one small plain sauce bowl beside the plate; keep the original food and portion unchanged.",
          12,
        ],
        [
          "serving-tray",
          "Nampan bersih",
          "Membingkai sajian dengan rapi.",
          "Place the plate on a clean understated serving tray, keeping the full dish visible.",
          13,
        ],
      ]),
    );
  if (service === "food") {
    Object.assign(angle.options[0], {
      label: "Sejajar sajian",
      hint: "Bentuk sajian dan wadah mudah terbaca.",
      instruction:
        "Photograph at dish or drink eye level, showing authentic food texture and serving-vessel geometry without invented labels.",
    });
    Object.assign(angle.options[1], {
      hint: "Isi piring dan kedalaman sajian terlihat.",
      instruction:
        "Photograph from a slightly elevated three-quarter angle to show authentic plating, food depth, and the original serving vessel.",
    });
    const macroAngle = angle.options.find((item) => item.value === "macro");
    if (macroAngle)
      macroAngle.instruction =
        "Use a close detail composition emphasizing authentic food texture, natural moisture, and recognizable ingredients without unnatural gloss or invented details.";
    surface.options.forEach((o) => {
      o.instruction = o.instruction
        .replaceAll("the product", "the dish or drink")
        .replaceAll("true product color", "authentic food colors");
    });
    surface.options[0].hint = "Fokus pada hidangan dan wadah.";
    props.help =
      "Properti tetap di luar piring atau gelas. Jangan menyiratkan bahan atau porsi tambahan.";
    props.options[0].instruction =
      "Do not add decorative props; keep the scene focused on the original dish or drink and its serving vessel.";
    Object.assign(props.options[3], {
      hint: "Kain tidak menutup sajian.",
      instruction:
        "Add a subtle linen fabric as a supporting tabletop prop, keeping the dish, ingredient arrangement, and serving vessel unobstructed.",
    });
  }
  const style = field(
    "style",
    "Karakter visual",
    "Gaya tidak mengubah identitas atau geometri subjek.",
    "look",
    photoOptions("people-style", [
      [
        "natural",
        "Natural",
        "Warna dan detail terasa nyata.",
        "Use natural realistic rendering with authentic texture, restrained retouching, and accurate colors.",
      ],
      [
        "editorial",
        "Editorial",
        "Lebih terarah, tetap realistis.",
        "Use a refined editorial photographic treatment with intentional composition and realistic tactile detail.",
      ],
      [
        "cinematic",
        "Sinematik",
        "Atmosfer lebih kuat.",
        "Use a restrained cinematic photographic treatment, subtle film-like grain, and coherent visual storytelling.",
      ],
      [
        "monochrome",
        "Hitam putih",
        "Utamakan bentuk dan kontras tonal.",
        "Render in carefully balanced black and white, retaining texture and separation in shadows and highlights.",
      ],
    ]),
  );
  if (service === "property")
    style.options = style.options
      .slice(0, 2)
      .map((o) => ({ ...o, visual: photo(`property-style-${o.value}`) }));
  const couple = field(
    "couplePose",
    "Pose pasangan",
    "Peran orang A dan B tidak boleh tertukar.",
    "subject",
    photoOptions("couple-pose", [
      [
        "facing",
        "Saling menghadap",
        "Interaksi tenang dan intim.",
        "Pose the two people gently facing each other, with natural distance and distinct unmerged identities.",
      ],
      [
        "walk",
        "Berjalan bersama",
        "Gerak spontan yang terasa natural.",
        "Pose the couple walking together at a relaxed pace, with plausible hands, feet, and fabric motion.",
      ],
      [
        "seated",
        "Duduk bersama",
        "Kedekatan yang tidak dipaksakan.",
        "Pose the couple seated comfortably together with natural contact and anatomically plausible hands.",
      ],
      [
        "embrace",
        "Pelukan ringan",
        "Kedua wajah tetap terlihat.",
        "Use a gentle consensual embrace with both faces visible and distinct, and realistic arms and hands.",
      ],
    ]),
  );
  if (service === "prewedding" && catalogVersion === 2)
    couple.options.push(
      ...atlasOptions(
        "prewedding-pose-",
        [
          [
            "hand-in-hand",
            "Saling menggenggam",
            "Dekat dan terasa natural.",
            "Pose the couple gently holding hands, with natural fingers, comfortable distance, and both faces distinct.",
          ],
          [
            "soft-embrace",
            "Pelukan lembut",
            "Kedua wajah tetap terlihat.",
            "Pose the couple in a gentle consensual embrace, keeping both faces unobstructed and identities distinct.",
          ],
          [
            "camera",
            "Memandang kamera",
            "Senyum ringan untuk potret klasik.",
            "Pose both people standing together and looking toward the camera with relaxed natural expressions.",
          ],
          [
            "shoulder-lean",
            "Bahu bersandar",
            "Kedekatan yang santai.",
            "Pose one person lightly leaning on the other's shoulder with natural balance and visible faces.",
          ],
          [
            "turn-away",
            "Memandang ke arah lain",
            "Lebih editorial dan tenang.",
            "Pose the couple looking gently toward the same off-camera direction, maintaining relaxed shoulders and distinct profiles.",
          ],
          [
            "wide-distance",
            "Berdiri berjauhan",
            "Lokasi ikut terasa luas.",
            "Frame the couple standing with comfortable space between them, using open natural body language and plausible proportions.",
          ],
          [
            "bench",
            "Duduk di bangku",
            "Suasana akrab dan rapi.",
            "Pose the couple seated side by side on a simple bench, with natural posture and hands.",
          ],
          [
            "heads-close",
            "Kepala berdekatan",
            "Potret intim tanpa pose rumit.",
            "Pose the couple with heads gently close together, comfortable expressions, and no merged facial features.",
          ],
          [
            "bouquet",
            "Memegang buket",
            "Buket jadi detail pendukung.",
            "Pose the couple together with one person holding a modest wedding bouquet below both faces.",
          ],
          [
            "laughing",
            "Tertawa bersama",
            "Momen spontan yang ringan.",
            "Pose a candid shared laugh with natural expressions, realistic teeth, and relaxed hands.",
          ],
          [
            "walk-away",
            "Berjalan menjauh",
            "Punggung dan suasana jadi fokus.",
            "Show the couple walking away together at an unhurried pace, with plausible steps and natural fabric movement.",
          ],
          [
            "close-couple",
            "Potret dekat berdua",
            "Fokus pada ekspresi pasangan.",
            "Use a close two-person portrait with both faces fully visible, distinct, and naturally proportioned.",
          ],
        ],
        5,
      ),
    );
  const decoration = field(
    "decoration",
    "Dekorasi",
    "Contoh memakai pasangan yang sama; hanya dekorasi yang berubah.",
    "scene",
    photoOptions("prewedding-decor", [
      [
        "minimal-arch",
        "Lengkung minimalis",
        "Sederhana dan tidak ramai.",
        "Use a refined minimal wedding arch with understated proportions; keep both people unobstructed.",
      ],
      [
        "white-florals",
        "Bunga putih",
        "Nuansa klasik dan lembut.",
        "Add restrained white wedding florals around the couple without covering either face.",
      ],
      [
        "greenery-arch",
        "Lengkung dedaunan",
        "Aksen hijau yang natural.",
        "Frame the couple with a tasteful greenery arch, keeping leaves clear of faces and clothing details.",
      ],
      [
        "candle-aisle",
        "Lorong lilin",
        "Cahaya hangat di sisi pasangan.",
        "Arrange a safe elegant candlelit aisle behind the couple, with no flames near clothing or people.",
      ],
    ]),
  );
  const bouquet = field(
    "bouquet",
    "Buket bunga",
    "Pilih buket atau tanpa buket; wajah tetap menjadi fokus.",
    "look",
    photoOptions("prewedding-bouquet", [
      [
        "white-rose",
        "Mawar putih",
        "Klasik dan lembut.",
        "Use a modest bouquet of white roses held below both faces; keep hands natural and flowers realistic.",
      ],
      [
        "blush-rose",
        "Mawar blush",
        "Warna pink yang halus.",
        "Use a modest blush-pink rose bouquet held below both faces, with realistic flowers and natural hands.",
      ],
      [
        "cream-peony",
        "Peony krem",
        "Tampilan penuh tetapi ringan.",
        "Use a restrained cream peony bouquet below both faces, keeping the arrangement physically plausible.",
      ],
      [
        "wildflowers",
        "Bunga liar",
        "Lebih natural dan santai.",
        "Use a small natural wildflower bouquet held below both faces, with a varied but restrained palette.",
      ],
    ]),
  );
  if (service === "prewedding" && catalogVersion === 2) {
    decoration.options = atlasOptions("prewedding-decor-", [
      [
        "minimal-arch",
        "Lengkung minimalis",
        "Sederhana dan tidak ramai.",
        "Set a refined minimal wedding arch behind the couple, with understated proportions and both faces unobstructed.",
      ],
      [
        "white-florals",
        "Lengkung bunga putih",
        "Bunga putih dengan kesan klasik.",
        "Frame the couple with a restrained white-flower arch, keeping flowers behind rather than across either face.",
      ],
      [
        "greenery-arch",
        "Lengkung dedaunan",
        "Aksen hijau yang natural.",
        "Frame the couple with a tasteful greenery arch, keeping foliage clear of faces and clothing details.",
      ],
      [
        "candle-aisle",
        "Lorong lilin",
        "Cahaya hangat di sisi pasangan.",
        "Arrange a safe elegant candlelit aisle behind the couple, with flames kept far from clothing and people.",
      ],
      [
        "soft-drape",
        "Kain lembut",
        "Latar terasa ringan dan romantis.",
        "Add softly draped neutral fabric behind the couple with realistic folds and a clean uncluttered silhouette.",
      ],
      [
        "warm-lanterns",
        "Lentera hangat",
        "Titik cahaya kecil di latar.",
        "Place a few warm decorative lanterns behind the couple at a safe distance, with no clutter near their faces.",
      ],
      [
        "classic-pillars",
        "Pilar klasik",
        "Bentuk arsitektur yang rapi.",
        "Use balanced classic columns as background decor, maintaining believable scale and clear space around the couple.",
      ],
      [
        "geometric-arch",
        "Lengkung geometris",
        "Gaya modern yang bersih.",
        "Use a simple modern geometric wedding arch behind the couple, with restrained styling and realistic proportions.",
      ],
      [
        "rose-installation",
        "Rangkaian mawar",
        "Bunga menjadi bingkai lembut.",
        "Create a refined rose installation behind the couple, preserving clear faces and avoiding a crowded floral wall.",
      ],
      [
        "tropical-foliage",
        "Daun tropis",
        "Nuansa hijau yang lebih kaya.",
        "Use tasteful tropical foliage as wedding decor, positioned behind the couple and clear of both faces.",
      ],
      [
        "textile-backdrop",
        "Tekstil bernuansa adat",
        "Motif jadi latar, bukan klaim adat.",
        "Use a tasteful textile-inspired wedding backdrop with restrained pattern; do not imply a specific ceremony or status.",
      ],
      [
        "ballroom-florals",
        "Ballroom berbunga",
        "Dekorasi pesta yang elegan.",
        "Set the couple in a refined ballroom with restrained floral decor and realistic room scale.",
      ],
      [
        "garden-arch",
        "Lengkung taman",
        "Bunga dan tanaman terasa alami.",
        "Place a simple floral arch in a garden setting, keeping plants behind and away from the couple's faces.",
      ],
      [
        "neutral-pampas",
        "Pampas netral",
        "Tekstur kering bernuansa hangat.",
        "Use a restrained neutral pampas arrangement at the sides of the couple, never obscuring clothing or faces.",
      ],
      [
        "string-lights",
        "Lampu gantung hangat",
        "Titik cahaya untuk suasana sore.",
        "Add subtle warm string lights in the distant background, with realistic scale and no visual clutter.",
      ],
      [
        "studio-plinths",
        "Plinth studio",
        "Tampilan studio minimalis.",
        "Arrange a few clean white studio plinths around but not in front of the couple, with a minimal wedding editorial feel.",
      ],
    ]);
    bouquet.options = atlasOptions("prewedding-bouquet-", [
      [
        "white-rose",
        "Mawar putih",
        "Klasik dan lembut.",
        "Use a modest bouquet of white roses held below both faces, with natural hands and realistic flowers.",
      ],
      [
        "blush-rose",
        "Mawar blush",
        "Warna pink yang halus.",
        "Use a modest blush-pink rose bouquet held below both faces, with natural hands and realistic flowers.",
      ],
      [
        "cream-peony",
        "Peony krem",
        "Tampilan penuh tetapi ringan.",
        "Use a restrained cream peony bouquet below both faces, keeping the arrangement physically plausible.",
      ],
      [
        "wildflowers",
        "Bunga liar",
        "Lebih natural dan santai.",
        "Use a small natural wildflower bouquet held below both faces, with a varied but restrained palette.",
      ],
      [
        "white-orchid",
        "Anggrek putih",
        "Bentuk bunga yang anggun.",
        "Use a tasteful white orchid bouquet below both faces, keeping flower stems and hands plausible.",
      ],
      [
        "soft-lavender",
        "Lavender lembut",
        "Aksen ungu yang tenang.",
        "Use a restrained lavender bouquet held below both faces, with natural color and realistic stems.",
      ],
      [
        "red-rose",
        "Mawar merah",
        "Warna lebih kuat dan klasik.",
        "Use a modest deep-red rose bouquet below both faces, with realistic scale and natural hands.",
      ],
      [
        "dried-neutral",
        "Bunga kering",
        "Warna netral dan bertekstur.",
        "Use a small neutral dried-flower bouquet below both faces, keeping texture natural and not brittle-looking.",
      ],
      [
        "babys-breath",
        "Baby's breath",
        "Kecil dan terasa ringan.",
        "Use a compact baby's-breath bouquet held below both faces, with delicate realistic stems.",
      ],
      [
        "calla-lily",
        "Calla lily",
        "Bentuk sederhana dan elegan.",
        "Use a small calla-lily bouquet below both faces, with clean natural stems and realistic flower proportions.",
      ],
      [
        "greenery",
        "Dominan hijau",
        "Bunga sedikit, daun lebih terasa.",
        "Use a greenery-forward modest bouquet below both faces, with a few restrained pale flowers.",
      ],
      [
        "sunflower",
        "Aksen bunga matahari",
        "Warna cerah sebagai aksen.",
        "Use a small bouquet with a restrained sunflower accent, held below both faces without changing the wedding mood.",
      ],
      [
        "pink-mix",
        "Campuran pink",
        "Rangkaian lembut dengan variasi.",
        "Use a refined mixed pale-pink bouquet below both faces, with realistic flowers and restrained color variation.",
      ],
      [
        "white-lily",
        "Lili putih",
        "Kesan bersih dan anggun.",
        "Use a modest white-lily bouquet held below both faces, keeping petals and hands natural.",
      ],
      [
        "terracotta",
        "Aksen terracotta",
        "Warna hangat untuk suasana senja.",
        "Use a warm terracotta-accented bouquet below both faces, maintaining realistic floral colors.",
      ],
      [
        "none",
        "Tanpa buket",
        "Tangan pasangan tetap terlihat natural.",
        "Do not add a bouquet; pose the couple with hands gently joined in a natural relaxed position.",
      ],
    ]);
  }
  const presentation = field(
    "presentation",
    "Penyajian",
    "Contoh menunjukkan arah penataan, bukan perubahan resep makanan.",
    "look",
    photoOptions("food-presentation", [
      [
        "rustic",
        "Rustic hangat",
        "Tekstur bahan lebih terasa.",
        "Use a warm rustic food presentation with an authentic appetizing serving and no invented ingredients.",
      ],
      [
        "clean",
        "Menu bersih",
        "Hidangan mudah dikenali.",
        "Use a clean restrained menu presentation, realistic portion size, and accurate food identity.",
      ],
      [
        "flatlay",
        "Cerita di atas meja",
        "Komposisi bahan dan sajian teratur.",
        "Arrange the dish and relevant serving items in an orderly tabletop composition without adding unsupported ingredients.",
      ],
      [
        "close",
        "Detail menggugah",
        "Tekstur dan kematangan natural.",
        "Emphasize appetizing authentic food texture in a detail-led presentation without unnatural gloss or misleading portions.",
      ],
    ]),
  );
  if (service === "food" && catalogVersion === 2)
    presentation.options.push(
      ...atlasOptions(
        "food-presentation-",
        [
          [
            "ceramic-bowl",
            "Mangkuk keramik",
            "Sajian terasa akrab.",
            "Present the exact original dish in a simple ceramic bowl; preserve its ingredients, portion, and authentic appearance.",
          ],
          [
            "dark-plate",
            "Piring gelap",
            "Warna hidangan lebih menonjol.",
            "Present the exact dish on a plain dark plate, keeping ingredients, portion size, and food colors accurate.",
          ],
          [
            "white-plate",
            "Piring putih",
            "Tampilan menu yang bersih.",
            "Present the exact dish on a clean white plate with restrained styling and no additional ingredients.",
          ],
          [
            "side-dish",
            "Dengan pendamping",
            "Gunakan hanya pendamping yang ada.",
            "Show the exact dish with only its already-present side items; do not add ingredients or increase the portion.",
          ],
          [
            "linen-table",
            "Meja linen",
            "Suasana rapi dan hangat.",
            "Present the original dish on a simple linen table setting, keeping garnish, ingredients, and portion unchanged.",
          ],
          [
            "cafe-table",
            "Meja kafe",
            "Kesan santai untuk konten.",
            "Present the exact dish in a restrained cafe-table scene; no invented menu, signage, or additional food.",
          ],
          [
            "wood-board",
            "Papan kayu",
            "Tekstur natural sebagai alas.",
            "Present the exact dish with a simple wooden serving board as a supporting base, not as an additional ingredient.",
          ],
          [
            "stoneware",
            "Piring stoneware",
            "Material matte yang berkarakter.",
            "Use a matte stoneware plate for the original dish; preserve the exact recipe, portion, and food texture.",
          ],
          [
            "more-space",
            "Ruang lebih lega",
            "Hidangan mudah dibaca di katalog.",
            "Compose the original dish with generous clean negative space while keeping the plate and serving size unchanged.",
          ],
          [
            "editorial",
            "Komposisi editorial",
            "Letak sajian terasa lebih dinamis.",
            "Arrange the original plated dish slightly off-center in a refined editorial composition without cropping essential food details.",
          ],
          [
            "takeaway",
            "Kemasan takeaway",
            "Cocok untuk layanan bungkus.",
            "Show the same original dish in a plain unbranded takeaway presentation, without inventing packaging text or changing ingredients.",
          ],
          [
            "family-style",
            "Sajian di tengah meja",
            "Suasana berbagi yang hangat.",
            "Present the same original serving as a shared-table scene without multiplying portions or inventing dishes.",
          ],
        ],
        5,
      ),
    );
  const view = field(
    "view",
    "Sudut ruang",
    "Contoh ruang sama; tidak mengubah denah atau ukuran ruangan.",
    "composition",
    photoOptions("property-view", [
      [
        "wide",
        "Ruang lebih utuh",
        "Garis tetap tegak, tidak dilebarkan palsu.",
        "Use a wide architectural view with vertical lines straight, realistic scale, and no deceptive stretching.",
      ],
      [
        "straight",
        "Lurus simetris",
        "Cocok untuk memperlihatkan proporsi.",
        "Use a straight-on architectural composition, level horizon, and accurate parallel verticals.",
      ],
      [
        "detail",
        "Detail interior",
        "Fokus pada material dan furnitur.",
        "Use a detail architectural composition showing authentic materials and furnishings without changing permanent geometry.",
      ],
      [
        "corner",
        "Dari sudut ruangan",
        "Dua sisi ruang terbaca.",
        "Photograph from a plausible room corner, showing two walls with realistic perspective and undistorted proportions.",
      ],
    ]),
  );
  const mark = field(
    "mark",
    "Bentuk identitas",
    "Pratinjau berupa arah bentuk deterministik, bukan logo final.",
    "look",
    [
      option(
        "monogram",
        "Monogram",
        "Huruf merek jika nama sudah diisi.",
        "If a brand name is supplied, explore an original compact letter-based monogram from that exact name. If no name is supplied, use a simple abstract mark without inventing letters or a brand name.",
        {
          kind: "photo",
          src: "/assets/v2/cases/branding-monogram-after-small.webp",
        },
      ),
      option(
        "symbol",
        "Simbol sederhana",
        "Satu gagasan yang mudah dikenali.",
        "Explore an original simple standalone brand symbol derived from the brief, with readable negative space and a reproducible silhouette.",
        {
          kind: "photo",
          src: "/assets/v2/cases/branding-symbol-after-small.webp",
        },
      ),
      option(
        "playful",
        "Bentuk playful",
        "Ramah dengan bentuk organik.",
        "Explore an original friendly playful brand mark with restrained organic geometry and a clear silhouette, avoiding famous brand resemblance.",
        {
          kind: "photo",
          src: "/assets/v2/cases/branding-playful-after-small.webp",
        },
      ),
    ],
  );
  if (service === "branding" && catalogVersion === 2)
    mark.options.push(
      ...[
        [
          "coffee-bean",
          "Biji kopi",
          "Simbol sederhana untuk usaha kopi.",
          "Explore an original simple coffee-bean silhouette with readable negative space; do not add an invented brand name.",
        ],
        [
          "house",
          "Rumah",
          "Bentuk mudah dikenali untuk jasa properti.",
          "Explore an original compact house symbol with a clear roof and doorway silhouette, avoiding resemblance to known brands.",
        ],
        [
          "botanical",
          "Daun botani",
          "Garis natural yang tetap sederhana.",
          "Explore an original botanical leaf mark with a simple reproducible silhouette and no implied ingredient or certification claims.",
        ],
        [
          "bowl",
          "Mangkuk",
          "Cocok sebagai arah visual kuliner.",
          "Explore an original bowl-shaped symbol using simple geometric forms and clear small-size readability.",
        ],
        [
          "rings",
          "Cincin",
          "Aksen dua bentuk yang saling terhubung.",
          "Explore an original pair of interlocking ring-like forms without imitating a known jewelry or wedding brand.",
        ],
        [
          "aperture",
          "Apertur",
          "Bentuk berulang terinspirasi lensa.",
          "Explore an original aperture-inspired geometric mark with a distinct silhouette, not a copied camera logo.",
        ],
        [
          "wave",
          "Gelombang",
          "Garis mengalir dan terasa ringan.",
          "Explore an original flowing wave symbol with a simple balanced contour and clear negative space.",
        ],
        [
          "arch",
          "Lengkung",
          "Bentuk geometris yang lembut.",
          "Explore an original arch-based symbol with balanced geometric proportions and no copied architectural mark.",
        ],
        [
          "flower",
          "Bunga",
          "Simbol floral yang ringkas.",
          "Explore an original simple flower symbol with a small number of petals and a reproducible silhouette.",
        ],
        [
          "tile",
          "Geometri ubin",
          "Pola bentuk yang teratur.",
          "Explore an original modular tile-inspired mark from simple repeatable geometry; avoid copying a cultural or commercial emblem.",
        ],
        [
          "mountain",
          "Gunung",
          "Siluet kokoh untuk tema perjalanan.",
          "Explore an original mountain silhouette with simple layered peaks and readable negative space.",
        ],
        [
          "arrow",
          "Arah abstrak",
          "Bentuk bergerak yang dinamis.",
          "Explore an original abstract directional mark using a simple forward-moving shape without implying unsupported claims.",
        ],
        [
          "droplet",
          "Tetes",
          "Bentuk bersih dengan satu lengkung utama.",
          "Explore an original droplet silhouette with a clean reproducible outline and no implied product benefit.",
        ],
      ].map(([value, label, hint, instruction], index) =>
        option(value, label, hint, instruction, {
          kind: "photo",
          src: `/assets/v2/sets-v3/branding-style-${String(index + 4).padStart(2, "0")}-small.webp`,
        }),
      ),
    );
  const crop = field(
    "crop",
    "Potongan foto",
    "Ruang kepala dan bahu harus cukup. Periksa lagi spesifikasi instansi tujuan.",
    "composition",
    [
      option(
        "head",
        "Kepala & bahu",
        "Pilihan utama pas foto.",
        "Frame the head and upper shoulders with balanced headroom, centered face, and both ears visible where not covered.",
        { kind: "layout", layout: "head" },
      ),
      option(
        "chest",
        "Sampai dada",
        "Lebih leluasa untuk kartu profesi.",
        "Frame the head through upper chest with balanced headroom and centered shoulders.",
        { kind: "layout", layout: "chest" },
      ),
    ],
  );
  if (!people)
    background.options = background.options.map((o) =>
      o.visual.kind === "background"
        ? { ...o, visual: { ...o.visual, src: "" } }
        : o,
    );
  switch (service) {
    case "professional":
      return [
        background,
        wardrobe,
        pose,
        expression,
        lighting,
        lens,
        ratio,
        depth,
      ];
    case "formal":
      return [
        background,
        wardrobe,
        expression,
        crop,
        lighting,
        lens,
        ratio,
        pose,
      ];
    case "prewedding":
      return catalogVersion === 2
        ? [
            couple,
            wardrobe,
            background,
            decoration,
            bouquet,
            lighting,
            lens,
            ratio,
            depth,
          ]
        : [couple, wardrobe, background, lighting, lens, ratio, depth];
    case "product":
      return [angle, surface, background, lighting, props, ratio];
    case "food":
      return [presentation, angle, surface, background, lighting, props, ratio];
    case "ads":
    case "social":
      return [layout, palette, lighting, typography, ratio];
    case "cinematic":
      return [style, pose, lighting, lens, palette, ratio, depth];
    case "property":
      return [view, lighting, style, palette, ratio];
    case "branding":
      return [mark, palette, typography, ratio];
    case "relight":
      return [lighting, background, style, depth, ratio];
  }
}
export const BLOCK_LABELS: Record<BlockId, string> = {
  task: "Tugas",
  reference: "Referensi",
  subject: "Subjek & brief",
  scene: "Adegan & latar",
  look: "Tampilan",
  lighting: "Cahaya",
  composition: "Lensa & komposisi",
  text: "Teks",
  format: "Format",
  constraints: "Batasan & pemeriksaan",
};
const task: Record<LegacyServiceId, string> = {
  professional:
    "Create a realistic professional personal portrait suitable for a client-facing profile.",
  formal:
    "Create a realistic, neatly composed formal portrait for the stated general administrative purpose. This is not a guarantee of official document acceptance.",
  prewedding:
    "Create a refined realistic prewedding portrait of two people with distinct consistent identities.",
  product:
    "Create a realistic commercial product photograph with accurate product geometry and packaging.",
  food: "Create a realistic appetizing commercial food photograph with accurate ingredients and portions.",
  ads: "Create a commercial advertising visual from the supplied client brief, with an honest, clear visual hierarchy.",
  social:
    "Create a brand-consistent social media visual with a clear subject, safe margins, and restrained visual hierarchy.",
  cinematic:
    "Create an original cinematic editorial visual with a coherent scene and plausible physical details.",
  property:
    "Create a realistic architectural property photograph with honest proportions and accurate permanent geometry.",
  branding:
    "Explore an original brand identity concept based on the supplied brief, not a finished trademark-cleared vector deliverable.",
  relight:
    "Edit the illumination and selected background of the reference photograph while preserving its subject identity and geometry.",
};

export function buildStudioV2(raw: unknown): StudioV2Descriptor {
  const input = v2InputSchema.parse(raw);
  const service = findService(input.serviceId)!;
  if (input.setId && !findSet(input.setId))
    throw Object.assign(
      new Error("Set tidak ditemukan. Pilih set yang tersedia pada jasa ini."),
      { statusCode: 400 },
    );
  const set = findSet(input.setId ?? "") ?? service.sets[0];
  if (set.serviceId !== service.id)
    throw Object.assign(
      new Error("Set tidak sesuai dengan jasa yang dipilih."),
      { statusCode: 400 },
    );
  const isNewService = NEW_SERVICE_IDS.includes(
    service.id as (typeof NEW_SERVICE_IDS)[number],
  );
  if (
    isNewService &&
    input.catalogVersion &&
    input.catalogVersion < CURRENT_CATALOG
  )
    throw Object.assign(
      new Error("Jasa ini memerlukan katalog terbaru. Mulai racikan baru."),
      { statusCode: 400 },
    );
  const catalogVersion =
    input.catalogVersion ?? (isNewService ? CURRENT_CATALOG : 1);
  const fields = definitions(service.id, catalogVersion);
  const issues: V2Issue[] = [];
  const selections: Record<string, string> = {};
  for (const f of fields) {
    const requested =
      input.selections[f.key] ??
      set.selections[f.key] ??
      (f.key === "ratio"
        ? "4:5"
        : f.key === "lens"
          ? "85"
          : f.key === "depth"
            ? service.id === "pets" && catalogVersion === 3
              ? "__skip"
              : "balanced"
            : f.key === "wardrobe"
              ? catalogVersion === 3
                ? "__skip"
                : "original"
              : f.options[0].value);
    const wanted =
      catalogVersion >= 2 && f.key === "background" && requested === "office"
        ? "modern-office"
        : requested;
    const chosen =
      f.options.find((o) => o.value === wanted && !o.disabledReason) ??
      f.options.find((o) => !o.disabledReason)!;
    selections[f.key] = chosen.value;
    if (chosen.value !== wanted)
      issues.push({
        field: f.key,
        level: "warning",
        text: `Pilihan ${f.label.toLowerCase()} tidak tersedia. Diganti ke ${chosen.label}; periksa sebelum menyalin.`,
      });
  }
  for (const key of Object.keys(input.selections))
    if (!fields.some((f) => f.key === key))
      issues.push({
        field: key,
        level: "info",
        text: `Pilihan lama “${key}” tidak dipakai pada jasa ini; data asli tetap tersimpan pada sumbernya.`,
      });
  let referenceMode =
    input.referenceMode ??
    (service.id === "branding" || service.id === "cinematic"
      ? "none"
      : service.id === "prewedding"
        ? "couple"
        : "single");
  if (
    service.id !== "prewedding" &&
    ["couple", "individuals"].includes(referenceMode)
  )
    throw Object.assign(
      new Error("Mode dua orang hanya tersedia untuk jasa pasangan."),
      { statusCode: 400 },
    );
  if (referenceMode === "none") {
    const f = fields.find((f) => f.key === "wardrobe");
    if (f?.options.some((o) => o.value === "original")) {
      const o = f.options.find((o) => o.value === "original")!;
      o.disabledReason =
        "Pakaian asli memerlukan foto referensi. Pilih pakaian untuk visual baru.";
      if (selections.wardrobe === "original") {
        selections.wardrobe =
          f.options.find((o) => o.value === "shirt")?.value ??
          f.options.find((o) => o.value !== "original")!.value;
        issues.push({
          field: "wardrobe",
          level: "info",
          text: `Tanpa foto referensi, pakaian diatur ke ${f.options.find((o) => o.value === selections.wardrobe)!.label}. Pilihan efektif ditampilkan.`,
        });
      }
    }
  }
  if (service.id === "relight" && referenceMode === "none")
    issues.push({
      field: "referenceMode",
      level: "error",
      text: "Relight memerlukan foto referensi di generator eksternal. Aktifkan mode referensi sebelum menggunakan prompt.",
    });
  const brief: ClientBrief = { ...emptyBrief(), ...(input.brief ?? {}) };
  const state: StudioV2State = {
    catalogVersion,
    serviceId: service.id,
    setId: set.id,
    referenceMode,
    brief,
    selections,
  };
  const blocks: Record<BlockId, string[]> = {
    task: [NEW_TASKS[service.id] ?? task[service.id as LegacyServiceId]],
    reference: [],
    subject: [],
    scene: [],
    look: [],
    lighting: [],
    composition: [],
    text: [],
    format: [],
    constraints: [],
  };
  if (referenceMode !== "none") {
    blocks.reference.push(
      service.id === "branding"
        ? "Use the attached sketch or visual brief as a concept reference, preserving the intended initials and core symbol idea while refining the design."
        : referenceMode === "individuals"
          ? "Use the two attached individual photos: photo 1 identifies person A and photo 2 identifies person B. Keep identities distinct; do not blend or swap faces."
          : referenceMode === "couple"
            ? "Use the attached couple photograph as the identity reference for both people. Keep each person distinct and recognizable."
            : "Use the attached reference photograph as the source of truth for the subject.",
    );
    blocks.constraints.push(
      PEOPLE.includes(service.id)
        ? "Preserve facial identity, age, skin tone, distinctive features, natural proportions, and realistic skin texture. Do not beautify into a different person."
        : service.id === "branding"
          ? "Preserve the supplied brand name, initials, and core concept. Refine rough sketch geometry into an original readable mark; do not invent unrelated brand claims or reproduce sketch artifacts."
          : service.id === "property"
            ? "Preserve permanent architecture, wall positions, openings, room dimensions, and structural materials. Do not add windows, remove walls, or falsely enlarge the space."
            : service.id === "food"
              ? "Preserve the exact dish or beverage identity, visible ingredients, portion sizes, serving vessel, and authentic food colors. Do not invent ingredients, misleading portions, or nutritional claims."
              : service.id === "pets"
                ? "Preserve the animal's species, individual fur markings, eye color, ears, tail, and natural proportions. Do not replace it with a generic animal or add unsafe costumes."
                : "Preserve the exact product silhouette, packaging structure, brand marks, existing label content, and authentic material colors. Do not invent labels or product benefits.",
    );
  }
  const genericSubjects: Record<string, string> = {
    fashion:
      "One adult fashion model, using the supplied garment references when available.",
    beauty:
      "One adult beauty portrait subject with natural facial proportions.",
    jewelry:
      "The supplied jewelry or accessory. Without a reference use the selected original unbranded concept.",
    creator:
      "One adult creator with a consistent identity and authentic natural proportions.",
    graduation:
      "One adult graduate with plain academic clothing and no invented credentials.",
    family:
      "The family members in the reference, preserving their exact count. Without a reference use two adult parents and one child in ordinary modest clothing.",
    pets: "The animal in the reference, preserving its species and individual identity. Without a reference use the selected pet concept.",
  };
  blocks.subject.push(
    brief.subject ||
      (catalogVersion === 3 ? genericSubjects[service.id] : undefined) ||
      set.subject,
  );
  if (brief.purpose)
    blocks.subject.push(`Client purpose (verbatim):\n${brief.purpose}`);
  if (brief.brand)
    blocks.subject.push(`Brand name (verbatim):\n${brief.brand}`);
  if (brief.required)
    blocks.subject.push(`Required details (verbatim):\n${brief.required}`);
  if (brief.preserve)
    blocks.constraints.push(
      `Client details that must not change (verbatim):\n${brief.preserve}`,
    );
  for (const f of fields) {
    const instruction = f.options.find(
      (o) => o.value === selections[f.key],
    )!.instruction;
    if (instruction) blocks[f.block].push(instruction);
  }
  if (brief.text)
    blocks.text.push(
      `Requested copy, preserve spelling and punctuation exactly (verbatim):\n${brief.text}\nDo not invent additional claims, discounts, ratings, certifications, or numbers. If exact lettering cannot be rendered, leave clean space for manual typesetting.`,
    );
  else if (["ads", "social", "cinematic", "branding"].includes(service.id))
    blocks.text.push(
      service.id === "branding"
        ? "Do not invent a brand name, slogan, or trademark. Use the supplied brand name only if one is provided."
        : "Do not generate promotional copy, prices, ratings, discount badges, or unsupported claims. Leave the reserved text area clean for editing later.",
    );
  if (service.id === "formal")
    blocks.constraints.push(
      "Keep the face centered and unobstructed, with neutral proportions and clean edges. Check the receiving institution requirements manually. Do not represent this as a replacement for official KTP-el capture.",
    );
  if (service.id === "property" && set.id === "property-staging")
    blocks.constraints.push(
      "Add only movable furnishings, preserving permanent architecture. Label the delivered image as an illustrative virtual staging.",
    );
  if (service.id === "branding")
    blocks.constraints.push(
      "Create an original, simple, readable brand mark suitable for later vector reconstruction. Avoid recognizable existing brands or copyrighted characters, and do not invent endorsements. This is a concept: check originality, licensing, lettering, and vector construction before commercial delivery.",
    );
  if (service.id === "food")
    blocks.constraints.push(
      "Keep decorative props outside the serving vessel; do not imply additional ingredients, portions, or nutritional benefits.",
    );
  const quality = PEOPLE.includes(service.id)
    ? "Check facial identity, natural skin, hands where visible, anatomy, edges, and final resolution."
    : service.id === "property"
      ? "Check permanent geometry, accurate scale, vertical lines, materials, and final resolution."
      : service.id === "branding"
        ? "Check the original mark silhouette, exact supplied lettering, negative space, and small-size readability."
        : service.id === "food"
          ? "Check dish identity, visible ingredients, portion sizes, serving-vessel geometry, and final resolution."
          : "Check exact product geometry, materials, existing labels, any requested copy, and final resolution.";
  blocks.constraints.push(
    `No watermark. ${service.id === "branding" ? "No copied third-party logos." : "No invented logos or misleading product claims."} Do not add unnecessary objects. ${quality}`,
  );
  if (referenceMode === "none") {
    // No wording may ask for an attachment in a new-image task.
    for (const key of Object.keys(blocks) as BlockId[])
      blocks[key] = blocks[key].map((s) =>
        s
          .replaceAll("from the reference photo", "described in the brief")
          .replaceAll("reference photograph", "client brief")
          .replaceAll("from photo reference", "from the client brief"),
      );
  }
  const documentBlocks = (Object.keys(BLOCK_LABELS) as BlockId[])
    .filter((id) => blocks[id].length)
    .map((id) => ({
      id,
      label: BLOCK_LABELS[id],
      text: blocks[id].join("\n"),
    }));
  return {
    engineVersion: 2,
    catalogVersion,
    effectiveChoices: fields.map((f) => ({
      key: f.key,
      label: f.label,
      value: selections[f.key],
      valueLabel: f.options.find((o) => o.value === selections[f.key])!.label,
    })),
    service,
    set,
    state,
    fields: fields.map(({ block, options, ...f }) => ({
      ...f,
      options: options.map(({ instruction, ...o }) => o),
    })),
    document: {
      engineVersion: 2,
      blocks: documentBlocks,
      text: documentBlocks
        .map((b) => `${b.id.toUpperCase()}\n${b.text}`)
        .join("\n\n"),
    },
    referenceGuide:
      referenceMode === "none"
        ? "Visual baru: tidak perlu melampirkan foto. Deskripsikan subjek dan detail penting dengan jelas."
        : service.referenceGuide,
    issues,
  };
}

export function demoV2(raw: unknown) {
  const input = v2InputSchema.parse(raw);
  if (!["professional", "formal", "product"].includes(input.serviceId))
    throw Object.assign(
      new Error("Jasa ini tidak tersedia pada demo publik."),
      { statusCode: 400 },
    );
  const allowed: Record<string, string[]> = {
    background: ["white", "gray", "cream", "blue", "red", "peach"],
    lighting: ["soft", "window", "golden"],
    lens: ["50", "85", "100"],
  };
  for (const [key, value] of Object.entries(input.selections))
    if (!allowed[key]?.includes(value))
      throw Object.assign(
        new Error("Pilihan tidak tersedia pada demo publik."),
        { statusCode: 400 },
      );
  const descriptor = buildStudioV2({
    serviceId: input.serviceId,
    selections: input.selections,
  });
  return {
    ...descriptor,
    fields: descriptor.fields
      .filter((f) => Object.hasOwn(allowed, f.key))
      .map((f) => ({
        ...f,
        options: f.options.filter((o) => allowed[f.key].includes(o.value)),
      })),
    demo: true,
  };
}
