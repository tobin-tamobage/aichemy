import type {
  BlockId,
  ServiceId,
  VisualField,
  VisualOption,
} from "../shared/v2";
import { expandOptions } from "./expanded-options";
import {
  NEW_SERVICES,
  PEOPLE_SERVICES,
  portfolioImage,
} from "../shared/services-v3";

export type SemanticOption = VisualOption & { instruction: string };
export type Definition = Omit<VisualField, "options"> & {
  block: BlockId;
  options: SemanticOption[];
};
export const SKIP = "__skip";
const photo = (id: string) => ({
  kind: "photo" as const,
  src: portfolioImage(id, true),
});
const simpleField = (
  key: string,
  label: string,
  block: BlockId,
  rows: [string, string, string, string, string][],
  advanced = false,
): Definition => ({
  key,
  label,
  block,
  help: "Pilih contoh yang mendekati keinginanmu. Bagian ini boleh tidak diatur.",
  advanced,
  options: rows.map(([value, label, hint, instruction, asset]) => ({
    value,
    label,
    hint,
    instruction,
    visual: photo(asset),
    group: "Pilihan visual",
  })),
});
const diagram = (
  value: string,
  label: string,
  hint: string,
  instruction: string,
  layout: string,
): SemanticOption => ({
  value,
  label,
  hint,
  instruction,
  visual: { kind: "layout", layout },
});

const CONCEPTS: Record<string, Record<string, string>> = {
  fashion: {
    catalog:
      "Fashion catalog styling: a cream linen coordinated outfit; show seams, drape, and true fabric texture.",
    street:
      "Streetwear styling: a blue denim jacket with simple black trousers; preserve plausible fabric construction.",
    modest:
      "Modest fashion styling: a fully covering sage tunic, cream hijab, and coordinated loose trousers.",
    resort:
      "Resort fashion styling: a tasteful white linen dress with natural fabric drape.",
    editorial:
      "Editorial fashion styling: a sharp black blazer and simple coordinated trousers.",
    batik:
      "Contemporary batik styling: an original batik blouse; use supplied motif references where available, without claiming a specific cultural origin.",
  },
  beauty: {
    natural:
      "Use restrained natural makeup, believable pores and natural lip color; do not change facial structure.",
    dewy: "Use dewy makeup with controlled highlights, fine realistic skin texture, and no plastic skin smoothing.",
    glam: "Use refined warm-toned glamour makeup with precise eyeliner and balanced lip color; retain facial identity.",
    bridal:
      "Use soft bridal makeup with refined natural finish and a fully covering ivory neckline.",
    color:
      "Use a precise lilac eyeshadow accent and restrained complementary makeup without changing eye shape.",
    mono: "Use minimal beauty makeup; keep tonal separation and real skin texture. The selected color treatment controls whether the result is monochrome.",
  },
  jewelry: {
    ring: "Photograph one original plain gold ring; show the complete ring silhouette and physically plausible metal reflections.",
    necklace:
      "Photograph a delicate gold necklace with one plain circular pendant; keep chain links coherent and untangled.",
    earrings:
      "Photograph a matched pair of original gold earrings; preserve symmetry, clasps, and consistent scale.",
    watch:
      "Photograph an original unbranded wristwatch with a simple dial and brown leather strap; do not invent a brand or certification.",
    gift: "Photograph a plain gold ring presented in one open cream gift box, with clear believable construction.",
    dark: "Photograph one original plain gold ring with controlled specular highlights suitable for a dark presentation.",
  },
  creator: {
    cafe: "Lifestyle content concept: the adult creator naturally holds one plain unbranded cup. Do not imply a real review or endorsement.",
    skincare:
      "Product-content concept: the adult creator holds the supplied skincare product with the label facing camera. Without a product reference, use one plain unbranded white bottle; invent no claims.",
    desk: "Creator workday concept: the adult creator is seated at a tidy desk with one unbranded laptop. No invented client logos or performance claims.",
    travel:
      "Travel lifestyle concept: the adult creator holds one fresh coconut in a relaxed manner. This is a conceptual synthetic scene, not evidence of a real trip.",
    city: "Everyday creator concept: an adult creator in a natural walking moment; no staged testimonial or implied endorsement.",
    home: "Relaxed lifestyle concept: the adult creator is fully clothed, with an authentic quiet everyday feeling.",
  },
  graduation: {
    studio:
      "Graduation portrait with a plain black academic gown and mortarboard, without invented institutional insignia.",
    garden:
      "Graduation portrait with a plain black gown and mortarboard, holding a small ivory flower bouquet; no invented institutional insignia.",
    formal:
      "Formal graduation portrait: hold one plain closed document folder with no invented name, degree, or credential.",
    confetti:
      "Celebratory graduation portrait with a small ivory bouquet and a few restrained gold confetti pieces, none obscuring the face.",
    sunset:
      "Reflective graduation portrait with a calm celebratory mood, plain gown and mortarboard, and a small ivory bouquet; no invented insignia.",
    mono: "Timeless graduation portrait with a plain gown and mortarboard; preserve fabric detail and natural face texture.",
  },
  family: {
    studio:
      "Warm family portrait with coordinated modest cream clothing; keep every family member distinct.",
    garden:
      "Relaxed family picnic portrait with natural gestures and comfortable coordinated clothing.",
    celebration:
      "Small family birthday concept with one plain cake, no invented age, name or lettering, and restrained decorations.",
    festive:
      "Family celebration concept with coordinated fully covering sage outfits; keep expressions and poses natural.",
    home: "Candid-feeling family portrait seated close together; natural affectionate non-staged body language.",
    beach:
      "Family walking portrait with safe comfortable movement and distinct readable faces.",
  },
  pets: {
    cat: "Portrait of the referenced cat; without a reference use one orange-and-white domestic cat with realistic fur.",
    dog: "Portrait of the referenced dog; without a reference use one adult golden retriever with realistic fur.",
    cozy: "Resting pet portrait on a simple cream blanket; keep natural safe anatomy and no costume.",
    birthday:
      "Pet celebration portrait with small safe decorations placed away from the animal; no dangerous food or invented lettering.",
    detail:
      "Close pet portrait emphasizing eyes, whiskers, and authentic fur patterns, without altering the animal's face.",
    outdoor:
      "Natural outdoor pet portrait with relaxed safe movement; keep species and characteristic fur markings.",
  },
};

const SERVICE_PLACES: Record<string, [string, string, string][]> = {
  fashion: [
    [
      "catalog",
      "Studio putih",
      "Use a clean matte white fashion studio with no additional decorative objects.",
    ],
    [
      "street",
      "Jalan kota",
      "Use a quiet city sidewalk with restrained architecture and no readable branding.",
    ],
    [
      "modest",
      "Studio hangat",
      "Use a simple warm cream studio interior with a quiet uncluttered background.",
    ],
    [
      "resort",
      "Teras vila",
      "Use a refined tropical villa terrace with restrained greenery and believable architecture.",
    ],
    [
      "editorial",
      "Studio abu",
      "Use a clean matte gray fashion studio, without decorative props or text.",
    ],
    [
      "batik",
      "Pelataran bangunan",
      "Use a quiet heritage-inspired architectural courtyard without inventing specific ceremonial context.",
    ],
  ],
  creator: [
    [
      "cafe",
      "Kafe",
      "Place the subject in a quiet contemporary cafe with a simple table and no third-party logos.",
    ],
    [
      "skincare",
      "Ruang terang",
      "Place the subject before a clean warm neutral indoor background with restrained detail.",
    ],
    [
      "desk",
      "Meja kerja",
      "Place the subject at a tidy desk in a quiet home workspace, with no readable screens or brands.",
    ],
    [
      "travel",
      "Halaman tropis",
      "Use a quiet tropical courtyard with restrained greenery and believable local architecture.",
    ],
    [
      "city",
      "Trotoar kota",
      "Place the subject on a quiet urban sidewalk with clear safe walking space and no readable signage.",
    ],
    [
      "home",
      "Ruang rumah",
      "Place the subject in a warm neutral living room with a simple sofa and restrained decor.",
    ],
  ],
  family: [
    [
      "studio",
      "Studio keluarga",
      "Place all family members in a spacious warm cream portrait studio with an uncluttered background.",
    ],
    [
      "garden",
      "Taman piknik",
      "Use a safe green garden with one simple picnic blanket and restrained background detail.",
    ],
    [
      "celebration",
      "Ruang perayaan",
      "Use a warm home celebration space with restrained blank decorations and no invented names, ages or lettering.",
    ],
    [
      "festive",
      "Rumah hari raya",
      "Use a tidy warm home interior with restrained neutral festive decoration, without invented cultural insignia.",
    ],
    [
      "home",
      "Sofa di rumah",
      "Place the family on a comfortable neutral sofa in a quiet warm home living room.",
    ],
    [
      "beach",
      "Pantai tenang",
      "Use a quiet calm sandy beach with safe level footing and a clear natural horizon.",
    ],
  ],
};
export const NEW_TASKS: Record<string, string> = {
  fashion:
    "Create a realistic commercial fashion photograph suitable for a clothing catalog or lookbook. Preserve the supplied garment construction, color, pattern and model identity.",
  beauty:
    "Create a photorealistic beauty makeup concept portrait with real skin texture. This is not evidence of a treatment result or product efficacy.",
  jewelry:
    "Create a precise commercial jewelry or accessories photograph. Preserve authentic materials and exact product geometry without inventing purity, value, or certification.",
  creator:
    "Create a photorealistic conceptual creator lifestyle photograph for a brand-content portfolio, not a real customer testimonial or undisclosed endorsement.",
  graduation:
    "Create a realistic personal graduation keepsake concept, not evidence of an earned degree or attendance at a real event.",
  family:
    "Create a warm realistic family portrait concept. Preserve the number and distinct identities of all referenced people, including their ages and natural proportions.",
  pets: "Create a realistic pet portrait, preserving the animal's species, markings, eye color, and safe natural anatomy.",
};

export function extendDefinitions(
  service: ServiceId,
  original: Definition[],
  banks: { professional: Definition[]; product: Definition[] },
): Definition[] {
  let fields = original.map((f) => ({
    ...f,
    options: f.options.map((o) => ({ ...o })),
  }));
  const added = NEW_SERVICES.find((s) => s.id === service);
  const people = PEOPLE_SERVICES.includes(service);
  const replace = (f: Definition) => {
    const index = fields.findIndex((x) => x.key === f.key);
    if (index < 0) fields.push(f);
    else fields[index] = f;
  };
  const fromBank = (
    bank: Definition[],
    key: string,
    overrides: Partial<Definition> = {},
  ) => ({
    ...bank.find((f) => f.key === key)!,
    ...overrides,
    options: bank.find((f) => f.key === key)!.options.map((o) => ({ ...o })),
  });
  if (service === "cinematic")
    for (const key of ["background", "wardrobe", "expression"])
      replace(fromBank(banks.professional, key));
  if (["ads", "social"].includes(service)) {
    replace(fromBank(banks.product, "background", { label: "Latar gambar" }));
    replace(fromBank(banks.product, "props", { label: "Dekorasi pendukung" }));
  }
  if (added) {
    if (SERVICE_PLACES[service]) {
      const background = fields.find((f) => f.key === "background")!;
      background.label = "Tempat";
      background.help =
        "Pilih tempat yang cocok. Contoh khusus jasa ini ada di urutan pertama; warna polos dan tempat lain tetap tersedia.";
      background.options = [
        ...SERVICE_PLACES[service].map(([slug, label, instruction]) => ({
          value: `location-${slug}`,
          label,
          instruction,
          hint: `Contoh ${label.toLocaleLowerCase("id")} untuk ${added.short.toLocaleLowerCase("id")}.`,
          visual: photo(`${service}-${slug}`),
          group: "Pilihan jasa ini",
        })),
        ...background.options,
      ];
    }
    // A concept owns only its subject/styling, not light, camera, location or format.
    fields.unshift({
      key: "concept",
      label:
        service === "beauty"
          ? "Tampilan makeup"
          : service === "jewelry"
            ? "Jenis aksesori"
            : "Konsep foto",
      block: service === "jewelry" || service === "pets" ? "subject" : "look",
      help: "Pilih arah utama, lalu atur detail lainnya sesuai keinginanmu.",
      options: added.sets.map((s) => ({
        value: s.selections.concept,
        label: s.label,
        hint: s.description,
        visual: photo(s.id),
        group: "Konsep pilihan",
        instruction: CONCEPTS[service][s.selections.concept],
      })),
    });
    if (["fashion", "beauty", "graduation", "family"].includes(service))
      fields = fields.filter((f) => f.key !== "wardrobe");
    if (service === "beauty") fields = fields.filter((f) => f.key !== "pose");
    if (service === "pets")
      fields = fields.filter(
        (f) => !["angle", "surface", "props"].includes(f.key),
      );
    if (service === "family") fields = fields.filter((f) => f.key !== "pose");
    if (service === "jewelry") {
      fields = fields.map((f) => ({
        ...f,
        options: f.options.map((o) => ({
          ...o,
          instruction: o.instruction
            .replaceAll("the same bottle", "the same accessory")
            .replaceAll("the bottle", "the accessory"),
        })),
      }));
      const swatches = fields.find((f) => f.key === "background")!;
      swatches.options = swatches.options
        .filter((o) => o.visual.kind === "background")
        .map((o) => ({ ...o, visual: { ...o.visual, src: "" } }));
      replace(
        simpleField("surface", "Permukaan", "scene", [
          [
            "stone",
            "Batu terang",
            "Tekstur lembut yang tidak ramai.",
            "Place the accessory on pale natural stone with realistic contact and restrained texture.",
            "jewelry-ring",
          ],
          [
            "linen",
            "Kain ivory",
            "Lipatan halus untuk foto premium.",
            "Place the accessory on soft ivory fabric, keeping folds clear of fine details.",
            "jewelry-necklace",
          ],
          [
            "marble",
            "Marmer abu",
            "Pola batu yang lebih tegas.",
            "Place the accessory on subtle gray marble with physically plausible scale and contact.",
            "jewelry-earrings",
          ],
          [
            "velvet",
            "Beludru hitam",
            "Kontras gelap, detail tetap terbaca.",
            "Place the accessory on black velvet with readable fine texture and controlled reflections.",
            "jewelry-dark",
          ],
          [
            "box",
            "Kotak krem",
            "Untuk visual hadiah.",
            "Present the accessory in one open cream gift box with believable size and geometry.",
            "jewelry-gift",
          ],
          [
            "stand",
            "Dudukan lembut",
            "Menjaga aksesori terlihat utuh.",
            "Present the accessory on a small softly upholstered cream display stand without obscuring functional details.",
            "jewelry-watch",
          ],
        ]),
      );
      replace(
        simpleField("props", "Tambahan di sekitar produk", "scene", [
          [
            "none",
            "Tanpa tambahan",
            "Hanya aksesori dan permukaannya.",
            "Do not add decorative props; show only the accessory and selected display surface.",
            "jewelry-ring",
          ],
          [
            "fabric",
            "Kain pendukung",
            "Aksen kain di belakang objek.",
            "Add a restrained ivory fabric accent behind the accessory without hiding its silhouette or details.",
            "jewelry-necklace",
          ],
          [
            "box",
            "Kotak hadiah",
            "Satu kotak sebagai pendamping.",
            "Add one open cream gift box beside the accessory at realistic scale, without duplicate jewelry or added claims.",
            "jewelry-gift",
          ],
        ]),
      );
      replace(
        simpleField("lighting", "Cahaya", "lighting", [
          [
            "soft",
            "Kilau lembut",
            "Refleksi rapi, detail mudah dibaca.",
            "Use large diffused studio illumination with controlled metal highlights and accurate material color.",
            "jewelry-ring",
          ],
          [
            "window",
            "Hangat dari jendela",
            "Kesan natural pada material.",
            "Use soft warm window illumination with physically coherent reflections and accurate material color.",
            "jewelry-necklace",
          ],
          [
            "dramatic",
            "Kontras premium",
            "Tepi berkilau dengan bayangan gelap.",
            "Use controlled directional studio illumination with detailed dark shadows and unclipped specular highlights.",
            "jewelry-dark",
          ],
          [
            "neutral",
            "Detail terang",
            "Untuk memeriksa bentuk dan material.",
            "Use neutral color-accurate diffused studio lighting so clasps, edges, and fine details remain readable.",
            "jewelry-earrings",
          ],
        ]),
      );
    }
    if (service === "pets")
      replace({
        key: "background",
        label: "Tempat",
        help: "Gunakan tempat yang nyaman dan aman untuk hewan.",
        block: "scene",
        options: [
          {
            value: "studio",
            label: "Studio krem",
            hint: "Tenang dan tidak ramai.",
            visual: photo("pets-cat"),
            instruction:
              "Use a seamless cream pet photography studio with safe level footing.",
          },
          {
            value: "garden",
            label: "Taman hijau",
            hint: "Latar tanaman yang natural.",
            visual: photo("pets-dog"),
            instruction:
              "Place the animal on a safe garden lawn with restrained greenery and no hazardous props.",
          },
          {
            value: "home",
            label: "Sudut rumah",
            hint: "Tempat istirahat yang nyaman.",
            visual: photo("pets-cozy"),
            instruction:
              "Place the animal on a comfortable cream blanket in a quiet home corner.",
          },
        ],
      });
    if (service === "pets")
      replace(
        simpleField("lighting", "Cahaya", "lighting", [
          [
            "soft",
            "Studio lembut",
            "Bulu dan mata mudah terlihat.",
            "Use a large diffused studio light with natural fur detail and clear readable eyes.",
            "pets-cat",
          ],
          [
            "window",
            "Jendela rumah",
            "Natural dengan bayangan halus.",
            "Use soft window light from one side with natural falloff, accurate fur color and readable eyes.",
            "pets-cozy",
          ],
          [
            "overcast",
            "Taman terang",
            "Cahaya menyebar tanpa bayangan keras.",
            "Use soft diffused outdoor daylight with natural contrast and detailed fur.",
            "pets-dog",
          ],
          [
            "golden",
            "Sore hangat",
            "Cahaya sore pada tepi bulu.",
            "Use restrained warm low-angle late-afternoon light with readable face detail and natural fur color.",
            "pets-outdoor",
          ],
        ]),
      );
    if (service === "pets")
      replace(
        simpleField("petPose", "Posisi hewan", "composition", [
          [
            "sit",
            "Duduk santai",
            "Posisi alami yang nyaman.",
            "Show the animal sitting naturally with anatomically correct limbs and relaxed posture.",
            "pets-cat",
          ],
          [
            "rest",
            "Berbaring nyaman",
            "Tidak dipaksa berpose.",
            "Show the animal resting comfortably, with natural anatomy and no forced posture.",
            "pets-cozy",
          ],
          [
            "stand",
            "Berdiri di halaman",
            "Tubuh dan kaki terlihat.",
            "Show the animal standing naturally on a safe level surface, preserving its proportions.",
            "pets-outdoor",
          ],
        ]),
      );
  }
  if (
    (people && !["cinematic", "relight"].includes(service)) ||
    service === "pets" ||
    ["product", "food", "jewelry"].includes(service)
  )
    replace({
      key: "treatment",
      label: "Hasil warna",
      block: "look",
      help: "Tidak mengubah warna asli kulit atau produk secara diam-diam. Untuk katalog, pilih warna asli.",
      advanced: true,
      options: [
        {
          value: "true",
          label: "Warna asli",
          hint: "Warna kulit dan produk tetap akurat.",
          instruction:
            "Use color-accurate natural processing without stylistic hue shifts; preserve authentic skin and product colors.",
          visual: {
            kind: "palette",
            colors: ["#f4eee4", "#c39573", "#6c7761", "#393631"],
          },
        },
        {
          value: "warm",
          label: "Sedikit hangat",
          hint: "Suasana hangat, subjek tidak oranye.",
          instruction:
            "Apply a restrained warm color treatment to ambient tones while keeping skin and product colors believable and accurate.",
          visual: {
            kind: "palette",
            colors: ["#faead4", "#c79571", "#ab6952", "#423430"],
          },
        },
        {
          value: "cool",
          label: "Sedikit sejuk",
          hint: "Latar lebih sejuk, warna utama tetap wajar.",
          instruction:
            "Apply restrained cool ambient tones while preserving accurate skin and product colors; avoid a blue cast on the subject.",
          visual: {
            kind: "palette",
            colors: ["#e9edf3", "#a6b9c6", "#778e9b", "#293943"],
          },
        },
        {
          value: "mono",
          label: "Hitam putih",
          hint: "Untuk karya kreatif, bukan warna katalog.",
          instruction:
            "Render in true black and white. For this selected monochrome treatment, color preservation means authentic relative tonal relationships and material detail rather than original hues; do not reshape the subject.",
          visual: {
            kind: "palette",
            colors: ["#f4f4f4", "#bababa", "#707070", "#222222"],
          },
        },
      ],
    });
  // New-service sets may not contain fields filtered out for that particular subject.
  if (people && service !== "formal" && service !== "family") {
    const couple = service === "prewedding";
    const opts = [
      diagram(
        "close",
        "Dekat ke wajah",
        "Wajah menjadi perhatian utama.",
        `Frame ${couple ? "both faces together" : "the face"} as a close portrait with comfortable headroom.`,
        "head",
      ),
      diagram(
        "chest",
        "Sampai dada",
        "Cocok untuk profil dan beauty.",
        `Frame ${couple ? "both people" : "the subject"} from head to upper chest with natural proportions.`,
        "chest",
      ),
      diagram(
        "waist",
        "Setengah badan",
        "Pakaian dan gesture ikut terlihat.",
        `Frame ${couple ? "both people" : "the subject"} from head to waist, keeping hands intact where visible.`,
        "waist",
      ),
      diagram(
        "knee",
        "Sampai lutut",
        "Tampilan busana lebih leluasa.",
        `Frame ${couple ? "both people" : "the subject"} from head to below the knees without cutting joints.`,
        "knee",
      ),
      diagram(
        "full",
        "Seluruh badan",
        "Tampilkan busana sampai alas kaki.",
        `Show ${couple ? "both people" : "the subject"} full length with complete feet and balanced headroom.`,
        "full",
      ),
      diagram(
        "space-left",
        "Ruang kosong di kiri",
        "Untuk judul di editor.",
        "Place the subject in the right third, reserving clean negative space on the left without generating text.",
        "left",
      ),
      diagram(
        "space-right",
        "Ruang kosong di kanan",
        "Untuk tulisan atau layout.",
        "Place the subject in the left third, reserving clean negative space on the right without generating text.",
        "right",
      ),
      diagram(
        "environment",
        "Subjek & suasana",
        "Lebih banyak tempat terlihat.",
        "Use an environmental portrait composition with the subject clearly readable and surroundings visible.",
        "wide",
      ),
    ];
    replace({
      key: "framing",
      label: "Potongan gambar",
      help: "Atur seberapa banyak subjek dan latar yang terlihat.",
      block: "composition",
      options: opts,
    });
  }
  if (["product", "jewelry", "food"].includes(service))
    replace({
      key: "distance",
      label: "Jarak foto",
      help: "Dari keseluruhan objek sampai detail kecil.",
      block: "composition",
      options: [
        diagram(
          "whole",
          "Objek utuh",
          "Seluruh bentuk mudah diperiksa.",
          "Show the entire main object with comfortable margins and no accidental edge cropping.",
          "center",
        ),
        diagram(
          "detail",
          "Detail dekat",
          "Sorot tekstur dan material.",
          "Use a tight detail composition that clearly shows authentic texture and construction, without inventing new details.",
          "head",
        ),
        diagram(
          "context",
          "Objek & suasana",
          "Tampilkan lingkungan secukupnya.",
          "Show the main object with some surrounding context, keeping the object dominant and readable.",
          "wide",
        ),
      ],
    });
  if (["professional", "cinematic", "relight"].includes(service)) {
    const source = fields.find((f) => f.key === "background");
    if (!source && service === "cinematic") {
      // Reuse the established location catalog; photographic previews remain explicit illustrations.
      fields.push({
        key: "background",
        label: "Tempat",
        help: "Tentukan lokasi adegan, terpisah dari cahaya dan warna.",
        block: "scene",
        options: [
          {
            value: "city",
            label: "Jalan kota",
            hint: "Latar kota yang tidak ramai.",
            visual: photo("cinematic-city"),
            instruction:
              "Place the subject on a quiet urban street with no invented signs or logos.",
          },
          {
            value: "cafe",
            label: "Kafe hangat",
            hint: "Suasana sehari-hari yang rapi.",
            visual: photo("creator-cafe"),
            instruction:
              "Place the subject in a quiet contemporary cafe with restrained background details and no third-party brands.",
          },
          {
            value: "home",
            label: "Ruang rumah",
            hint: "Lebih dekat dan personal.",
            visual: photo("creator-home"),
            instruction:
              "Place the subject in a quiet warm neutral home interior without adding distracting props.",
          },
        ],
      });
    }
  }
  if (["ads", "social"].includes(service))
    replace({
      key: "copyArea",
      label: "Area tulisan",
      help: "Siapkan ruang kosong. Tulisan asli bisa ditambahkan di bagian Tambah detail.",
      block: "text",
      options: [
        diagram(
          "small",
          "Untuk judul pendek",
          "Ruang secukupnya, gambar tetap besar.",
          "Keep the text-safe region modest, enough for one short headline; respect the selected layout position and do not invent copy.",
          "top",
        ),
        diagram(
          "balanced",
          "Gambar & tulisan seimbang",
          "Cukup untuk judul dan satu keterangan.",
          "Balance the image and text-safe region, allowing a headline and one short supporting line; use the selected layout position.",
          "left",
        ),
        diagram(
          "large",
          "Lebih banyak ruang",
          "Untuk informasi yang lebih panjang.",
          "Allocate a generous clean text-safe region at the selected layout position while keeping the main subject readable.",
          "right",
        ),
        diagram(
          "none",
          "Tanpa tulisan",
          "Hanya visual, tanpa huruf otomatis.",
          "Do not render any lettering. Treat any negative space in the selected layout as visual breathing room, not a requirement to add copy.",
          "center",
        ),
      ],
    });
  if (service === "property")
    replace({
      key: "staging",
      label: "Penataan ruang",
      help: "Pilih tidak diubah untuk listing apa adanya. Perubahan furnitur harus diberi label ilustrasi.",
      block: "scene",
      options: [
        diagram(
          "preserve",
          "Jangan ubah isi",
          "Pertahankan furnitur dan objek asli.",
          "Preserve all existing furnishings and objects; do not add, remove or rearrange them.",
          "center",
        ),
        diagram(
          "tidy",
          "Rapikan ringan",
          "Hanya barang kecil, bukan struktur.",
          "Tidy only loose small clutter, without changing permanent structure, fixtures or room size; disclose edits.",
          "left",
        ),
        diagram(
          "minimal",
          "Tambah furnitur simpel",
          "Konsep virtual staging, bukan kondisi asli.",
          "Add a restrained set of movable minimalist furnishings at physically plausible scale. Preserve all permanent architecture and label the delivery as illustrative virtual staging.",
          "right",
        ),
        diagram(
          "warm",
          "Furnitur hangat",
          "Konsep kayu dan kain bernuansa netral.",
          "Add movable warm wood and neutral textile furnishings at honest scale; keep permanent geometry and label the result as illustrative virtual staging.",
          "top",
        ),
      ],
    });

  if (
    people &&
    service !== "formal" &&
    service !== "prewedding" &&
    service !== "family"
  ) {
    const pose = fields.find((f) => f.key === "pose");
    if (pose) {
      pose.options = pose.options.filter(
        (o) =>
          ![
            "natural-smile",
            "reflective",
            "confident-gaze",
            "half-body",
            "environmental",
          ].includes(o.value),
      );
      pose.options.push(
        {
          value: "threequarter-right",
          label: "Menyamping kanan",
          hint: "Bahu dan tubuh berputar ringan.",
          instruction:
            "Turn the torso slightly toward camera right, keeping both eyes visible, neck naturally upright and hands relaxed.",
          visual: {
            kind: "photo",
            src: "/assets/v3/poses/threequarter-right-small.webp",
          },
        },
        {
          value: "profile-right",
          label: "Profil kanan",
          hint: "Satu sisi wajah terlihat jelas.",
          instruction:
            "Use a natural right-facing side profile with upright neck and level chin, preserving facial anatomy.",
          visual: {
            kind: "photo",
            src: "/assets/v3/poses/profile-right-small.webp",
          },
        },
        {
          value: "walk",
          label: "Berjalan natural",
          hint: "Gerak ringan, tidak kaku.",
          instruction:
            "Show a natural walking stride with gentle arm movement, relaxed level shoulders, and a supported upright neck.",
          visual: { kind: "photo", src: "/assets/v3/poses/walking-small.webp" },
        },
      );
    }
  }
  if (service === "beauty")
    replace({
      key: "faceAngle",
      label: "Sudut wajah",
      help: "Pilih arah wajah tanpa harus mengubah ekspresi.",
      block: "composition",
      options: [
        [
          "front",
          "Menghadap depan",
          "front-neutral",
          "Keep the face frontal with level eyes and a naturally upright neck.",
        ],
        [
          "left",
          "Sedikit ke kiri",
          "threequarter-left",
          "Turn the face gently left to a three-quarter view, with both eyes visible and neck upright.",
        ],
        [
          "right",
          "Sedikit ke kanan",
          "threequarter-right",
          "Turn the face gently right to a three-quarter view, with both eyes visible and neck upright.",
        ],
        [
          "profile-left",
          "Profil kiri",
          "profile-left",
          "Use an exact left-facing side profile with level chin and naturally upright neck.",
        ],
        [
          "profile-right",
          "Profil kanan",
          "profile-right",
          "Use an exact right-facing side profile with level chin and naturally upright neck.",
        ],
      ].map(([value, label, pose, instruction]) => ({
        value,
        label,
        hint: "Contoh pose dengan wajah karakter yang sama.",
        instruction,
        visual: {
          kind: "photo" as const,
          src: `/assets/v3/poses/${pose}-small.webp`,
        },
      })),
    });
  // Explicit opt-out removes the field's instruction. It never means remove clothing,
  // erase the client's subject, invent transparency, or silently apply a default.
  if (people && service !== "prewedding") {
    const poses: Record<string, string> = {
      front: "front-neutral",
      "three-quarter": "threequarter-left",
      seated: "seated-upright",
      standing: "standing-front",
      "look-aside": "threequarter-right",
      profile: "profile-left",
    };
    fields = fields.map((f) => ({
      ...f,
      options: f.options.map((o) => {
        const pose =
          f.key === "pose"
            ? poses[o.value]
            : f.key === "expression" && o.value === "neutral"
              ? "front-neutral"
              : f.key === "expression" && o.value === "smile"
                ? "front-smile"
                : undefined;
        return pose
          ? {
              ...o,
              visual: {
                kind: "photo" as const,
                src: `/assets/v3/poses/${pose}-small.webp`,
              },
            }
          : o;
      }),
    }));
  }
  return expandOptions(service, fields, banks).map((f) => ({
    ...f,
    optional: true,
    label:
      f.key === "lighting"
        ? "Cahaya"
        : f.key === "lens"
          ? "Tampilan lensa"
          : f.label,
    options: [
      {
        value: SKIP,
        label:
          f.key === "wardrobe"
            ? "Tanpa perubahan pakaian"
            : "Tanpa arahan tambahan",
        hint: "Bagian ini tidak menambah instruksi ke prompt. Detail pada foto asli tetap dijaga.",
        group: "Tidak diatur",
        instruction: "",
        visual: { kind: "none" as const },
      },
      ...f.options,
    ],
  }));
}
