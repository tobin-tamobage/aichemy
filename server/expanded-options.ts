import type { BlockId, ServiceId } from "../shared/v2";
import { PEOPLE_SERVICES, portfolioImage } from "../shared/services-v3";
import type { Definition, SemanticOption } from "./options-v3";

// Server-only: descriptive instructions must never enter the public UI bundle.
export type PhotoSeries = {
  service: string;
  field: string;
  block: BlockId;
  label: string;
  reference: string;
  invariant: string;
  replaceExisting?: boolean;
  rows: [string, string, string, string, string][];
};
const rows = (text: string): PhotoSeries["rows"] =>
  text
    .trim()
    .split("\n")
    .map((line) => line.trim().split("|")) as PhotoSeries["rows"];
export const EXPANDED_PHOTOS: PhotoSeries[] = [
  {
    service: "jewelry",
    field: "angle",
    block: "composition",
    label: "Sudut pengambilan",
    replaceExisting: true,
    reference: "public/assets/v3/portfolio/jewelry-ring.webp",
    invariant:
      "Keep the exact plain gold ring, pale stone surface, cream background, neutral soft light and physically plausible metal. Change ONLY camera angle or stated detail crop. No other products, text, gemstones or objects.",
    rows: rows(`
      eye|Sejajar produk|Bentuk terlihat dari tinggi objek.|View the accessory at its own height with a level camera and natural perspective.|Sejajar & samping
      three-quarter|Sedikit menyamping|Bentuk dan ketebalan sama-sama terbaca.|View the accessory from a three-quarter angle, preserving its authentic geometry and material.|Sejajar & samping
      slightly-high|Sedikit dari atas|Bagian atas dan sisi ikut terlihat.|View the accessory from a gently elevated angle, showing the top and side without flattening its shape.|Dari atas
      overhead|Tepat dari atas|Kamera menghadap lurus ke permukaan.|Use a true overhead camera perpendicular to the surface, keeping the complete accessory outline readable.|Dari atas
      low|Sedikit dari bawah|Objek terasa lebih menonjol.|Use a restrained low camera angle near surface height, preserving realistic proportions and the full accessory outline.|Sejajar & samping
      side|Tampak samping|Tunjukkan ketebalan yang sebenarnya.|Use a true side view of the accessory, retaining authentic thickness and geometry.|Sejajar & samping
      macro|Detail dekat|Tekstur dan tepi logam terlihat.|Use a close macro composition on authentic surface texture and edge detail without inventing features.|Detail dekat
      cap-detail|Detail sambungan|Periksa bagian sambungan yang memang ada.|Frame an existing joint, clasp or connection detail of the accessory without inventing parts or altering geometry. For a seamless ring, show its continuous inner edge instead.|Detail dekat
    `),
  },
  {
    service: "beauty",
    field: "concept",
    block: "look",
    label: "Tampilan makeup",
    reference: "public/assets/v3/poses/front-neutral.webp",
    invariant:
      "Keep the exact adult fictional woman's face, short black bob, upright neck, frontal head-and-shoulders composition, cream crewneck, warm gray studio and neutral soft light. Change only makeup. Real pores, no facial reshaping, no hand near face, no text.",
    rows: rows(`
      rose-lip|Bibir mawar|Warna bibir lembut dengan mata natural.|Use a muted rose lip color with restrained neutral eye makeup and authentic skin texture.|Warna lembut
      peach|Peach segar|Pipi dan bibir bernuansa peach.|Use soft peach blush and lip color with subtle neutral eyeshadow, retaining real skin texture.|Warna lembut
      berry-lip|Bibir berry|Bibir jadi pusat perhatian.|Use a defined muted berry lip with minimal neutral eye makeup, keeping facial anatomy unchanged.|Lebih tegas
      red-lip|Bibir merah klasik|Merah rapi dengan mata sederhana.|Use a precise classic red lip and restrained neutral eye makeup, without changing lip shape.|Lebih tegas
      wing-liner|Garis mata tegas|Eyeliner rapi, wajah tetap natural.|Use refined black winged eyeliner with neutral lips and realistic skin texture; preserve natural eye shape.|Lebih tegas
      bronze|Cokelat berkilau|Kilau halus pada kelopak mata.|Use restrained bronze eyeshadow with a soft neutral lip and controlled skin highlights, without glitter overlays.|Warna hangat
    `),
  },
  {
    service: "creator",
    field: "concept",
    block: "look",
    label: "Konsep foto",
    reference: "public/assets/v3/poses/standing-front.webp",
    invariant:
      "Keep the exact adult fictional woman's identity, short bob, upright neck, gray crewneck and charcoal trousers, neutral cream studio and soft daylight. Natural mid-length commercial lifestyle portrait. Change only the stated activity and object; no head tilt, logos, readable text or implied endorsement.",
    rows: rows(`
      book|Baca buku|Konten santai untuk gaya hidup.|Show the adult creator naturally holding one open plain book; generate no readable title or text, and imply no real endorsement.|Gaya hidup
      headphones|Dengar musik|Headphone polos sebagai fokus aktivitas.|Show the adult creator comfortably wearing plain unbranded over-ear headphones with a relaxed natural expression.|Gaya hidup
      camera|Kreator foto|Satu kamera di tangan, wajah terlihat.|Show the adult creator holding one plain unbranded camera at waist level, leaving the face unobstructed and hands anatomically correct.|Aktivitas
      tote|Tas sehari-hari|Tote polos untuk konten produk.|Show the adult creator holding one plain canvas tote by its handles at their side, without logos or invented product claims.|Konten produk
      phone|Pakai ponsel|Momen melihat layar tanpa data pribadi.|Show the adult creator looking naturally at one unbranded phone, with no readable screen, personal data or implied testimonial.|Aktivitas
      bakery|Kotak bakery|Kemasan polos untuk visual UMKM.|Show the adult creator holding one plain closed bakery box at waist height, without invented branding or claims.|Konten produk
    `),
  },
  {
    service: "graduation",
    field: "concept",
    block: "look",
    label: "Konsep foto",
    reference: "public/assets/v3/portfolio/graduation-studio-v2.webp",
    invariant:
      "Keep the same adult fictional woman, short bob, upright neck, natural standing pose and plain cream studio with soft neutral light. Change ONLY academic outfit. No university logos, letters, medals, degree names, certificate, props or invented credentials.",
    rows: rows(`
      navy-robe|Toga biru navy|Alternatif warna toga yang tenang.|Use a plain navy academic robe and matching unbranded mortarboard, without insignia or degree claims.|Warna toga
      maroon-robe|Toga merah marun|Warna lebih hangat dan tegas.|Use a plain deep maroon academic robe and matching unbranded mortarboard, without institutional insignia.|Warna toga
      gray-robe|Toga abu|Netral dengan detail lipatan jelas.|Use a plain charcoal gray academic robe and matching unbranded mortarboard, without institutional symbols.|Warna toga
      ivory-stole|Selempang ivory|Toga hitam dengan selempang polos.|Use a plain black academic gown and mortarboard with an unlettered ivory stole; invent no honors, degree or institutional marks.|Selempang polos
      blue-stole|Selempang biru|Aksen biru di atas toga hitam.|Use a plain black academic gown and mortarboard with an unlettered muted blue stole, without honors or degree claims.|Selempang polos
      gold-stole|Selempang emas lembut|Aksen hangat tanpa tulisan.|Use a plain black academic gown and mortarboard with an unlettered muted gold stole, without inventing honors or credentials.|Selempang polos
    `),
  },
  {
    service: "family",
    field: "concept",
    block: "look",
    label: "Konsep foto",
    reference: "public/assets/v3/portfolio/family-studio.webp",
    invariant:
      "Keep the exact same two adult parents and young child, distinct identities and ages, relaxed seated family pose, plain cream studio and neutral soft light. Change ONLY coordinated fully clothed outfits. No additional people, logos, text, accessories or furniture changes.",
    rows: rows(`
      blue-outfits|Biru lembut|Busana biru yang senada, tidak seragam kaku.|Dress the family in coordinated modest soft blue outfits with realistic fabric, retaining individual identities and ages.|Warna busana
      denim|Denim santai|Denim biru dengan atasan putih polos.|Dress the family in coordinated comfortable blue denim and plain white tops, with age-appropriate fully clothed styling.|Santai
      navy|Navy & putih|Kontras rapi untuk potret keluarga.|Dress the family in coordinated modest navy and white clothing with authentic fabric texture.|Warna busana
      batik|Batik modern|Motif orisinal yang tidak terlalu ramai.|Dress the family in coordinated modest original batik-inspired patterned clothing, without claiming a specific cultural or ceremonial origin.|Bermotif
      knit|Rajut lembut|Tekstur hangat dengan warna netral.|Dress the family in comfortable modest cream and oatmeal knitwear with believable age-appropriate construction.|Santai
      earth|Cokelat & ivory|Warna bumi yang saling melengkapi.|Dress the family in coordinated modest muted brown and ivory clothing, preserving realistic textile texture and distinct identities.|Warna busana
    `),
  },
  {
    service: "pets",
    field: "concept",
    block: "subject",
    label: "Konsep foto",
    reference: "public/assets/v3/portfolio/pets-cat.webp",
    invariant:
      "Keep the exact orange-and-white cat in a natural seated pose, cream seamless studio, full-body view and neutral soft light. Change ONLY the animal's natural facial behavior, with anatomically plausible eyes and mouth. No human smile, props, clothing, text or different species.",
    rows: rows(`
      curious-face|Penasaran|Mata memperhatikan sesuatu dengan tenang.|Use a naturally curious attentive animal expression with relaxed anatomy and clear eyes; do not impose a human facial expression.|Ekspresi alami
      sleepy-face|Mengantuk|Mata setengah terpejam dengan santai.|Use a comfortable sleepy animal expression with softly half-closed eyes, not an injured or distressed appearance.|Ekspresi alami
      yawn|Menguap|Momen spontan yang lucu dan wajar.|Capture a gentle natural yawn appropriate to the animal's species, with correct mouth anatomy and no aggressive appearance.|Momen spontan
      alert-face|Siaga santai|Telinga dan mata terlihat memperhatikan.|Use a calmly alert animal expression with attentive ears and bright readable eyes, without fear or stress.|Ekspresi alami
      eyes-closed|Mata terpejam|Kesan damai tanpa pose yang dipaksakan.|Show a peaceful animal expression with comfortably closed eyes and relaxed facial muscles.|Ekspresi alami
      sniff|Mencium udara|Gerakan hidung kecil yang natural.|Capture a subtle natural sniffing moment with a gently lifted nose, species-appropriate anatomy and no exaggerated neck stretch.|Momen spontan
    `),
  },
  {
    service: "jewelry",
    field: "concept",
    block: "subject",
    label: "Jenis aksesori",
    reference: "public/assets/v3/portfolio/jewelry-ring.webp",
    invariant:
      "Use the reference for polished commercial lighting, pale stone surface, cream background and three-quarter camera ONLY. Replace the ring with exactly one specified unbranded accessory; no extra jewelry, logos, claims, text or invented gems.",
    rows: rows(`
      bracelet|Gelang rantai|Rantai polos dengan sambungan rapi.|Photograph one original plain gold chain bracelet with coherent links and clasp, without invented certification.|Perhiasan
      bangle|Gelang kaku|Bentuk lingkaran dengan pantulan rapi.|Photograph one original plain gold bangle with a complete consistent silhouette and realistic metal reflections.|Perhiasan
      brooch|Bros sederhana|Bentuk bunga polos tanpa batu tambahan.|Photograph one original simple gold floral brooch with physically plausible construction and no invented gemstones.|Perhiasan
      hairclip|Jepit rambut|Detail bentuk dan penjepit terlihat.|Photograph one original plain ivory hair clip with believable hinge construction and authentic material detail.|Aksesori lain
      sunglasses|Kacamata hitam|Bingkai polos dan lensa yang masuk akal.|Photograph one original unbranded black sunglasses frame with coherent temples and physically plausible lenses.|Aksesori lain
      leather-wallet|Dompet kulit|Tekstur dan jahitan jadi perhatian.|Photograph one original unbranded brown leather wallet with authentic stitching, honest texture and no invented luxury insignia.|Aksesori lain
    `),
  },
  {
    service: "pets",
    field: "background",
    block: "scene",
    label: "Tempat",
    reference: "public/assets/v3/portfolio/pets-cat.webp",
    invariant:
      "Keep the exact orange-and-white cat, sitting pose, full body, natural fur markings, soft neutral daylight and eye-level camera. Change ONLY the environment. No accessories, costume, text or other animals.",
    rows: rows(`
      sofa|Sofa linen|Sudut ruang yang nyaman.|Place the pet on a safe low cream linen sofa, with a quiet neutral living-room background.|Di rumah
      window-seat|Dekat jendela|Jendela besar, latar tetap rapi.|Place the pet on a broad safe floor-level cushion beside a large closed window, with restrained curtains.|Di rumah
      wood-floor|Lantai kayu|Hangat dan tidak ramai.|Place the pet on a clean light oak floor in a spacious quiet home interior.|Di rumah
      terrace|Teras rumah|Terbuka, dengan tanaman di belakang.|Place the pet on a safe enclosed level terrace with restrained potted greenery in the distance.|Luar ruangan
      meadow|Padang rumput|Rumput pendek dan ruang terbuka.|Place the pet on a safe level short-grass meadow, with a low distant natural horizon.|Luar ruangan
      autumn|Taman daun kering|Daun hangat di sekitar subjek.|Place the pet on a safe garden path with a few dry fallen leaves and restrained trees behind it.|Luar ruangan
      courtyard|Halaman batu|Tekstur batu dengan tanaman jauh.|Place the pet on a level pale stone courtyard with restrained distant greenery and no obstacles.|Luar ruangan
      gray-studio|Studio abu|Netral agar warna bulu menonjol.|Use a seamless matte light-gray pet photography studio with safe level footing.|Studio
      dark-studio|Studio gelap|Latar gelap, bulu tetap terlihat.|Use a seamless charcoal studio background with safe level footing and clear subject separation.|Studio
    `),
  },
  {
    service: "pets",
    field: "petPose",
    block: "composition",
    label: "Posisi hewan",
    reference: "public/assets/v3/portfolio/pets-cat.webp",
    invariant:
      "Keep the exact orange-and-white cat, cream seamless studio, soft neutral light, eye-level camera and full animal visible. Change ONLY its natural pose. No props or costumes, no humanlike limbs.",
    rows: rows(`
      loaf|Duduk seperti roti|Kaki depan terlipat dengan nyaman.|Show the pet resting in a natural tucked-paw loaf position, appropriate to its species and anatomy.|Santai
      side-rest|Berbaring menyamping|Badan santai dan kepala terangkat.|Show the pet lying comfortably on its side with its head naturally raised and limbs relaxed.|Santai
      paws-forward|Kaki depan memanjang|Tubuh rebah, kaki tetap alami.|Show the pet lying on its belly with front paws extended naturally and head upright.|Santai
      curled|Melingkar nyaman|Pose istirahat yang tenang.|Show the pet curled into a comfortable resting position with plausible anatomy and a readable face.|Santai
      look-left|Melihat ke kiri|Tubuh duduk, kepala menoleh ringan.|Show the pet seated naturally with its head gently turned left, neck supported and ears relaxed.|Arah pandang
      look-right|Melihat ke kanan|Tubuh duduk, mata tetap terlihat.|Show the pet seated naturally with its head gently turned right and eyes clearly readable.|Arah pandang
      look-up|Melihat sedikit ke atas|Tatapan penasaran tanpa leher berlebihan.|Show the pet looking slightly upward from a natural seated posture without stretching its neck unnaturally.|Arah pandang
      walking|Berjalan santai|Langkah ringan dengan kaki yang benar.|Show the pet in a slow natural walking stride on level ground with all limbs anatomically correct.|Bergerak
      stretching|Meregang santai|Gerakan peregangan yang wajar.|Show the pet in a comfortable species-appropriate forward stretch, with natural paw placement and no exaggerated joints.|Bergerak
    `),
  },
  {
    service: "pets",
    field: "lighting",
    block: "lighting",
    label: "Cahaya",
    reference: "public/assets/v3/portfolio/pets-cat.webp",
    invariant:
      "Keep the exact orange-and-white cat, seated full-body pose, cream seamless studio and eye-level camera. Change ONLY illumination; retain accurate fur color, readable eyes and no added props.",
    rows: rows(`
      side-soft|Lembut dari samping|Satu sisi lebih terang, bulu tetap detail.|Use a large soft key light from camera left with gentle side shadows and readable eyes.|Studio lembut
      front-even|Terang dari depan|Warna dan detail bulu mudah diperiksa.|Use even neutral frontal diffused light with restrained shadows and accurate fur color.|Studio lembut
      two-soft|Dua sisi lembut|Kedua sisi wajah terlihat jelas.|Use two broad diffused lights at balanced intensity for soft dimensional fur detail.|Studio lembut
      top-soft|Lembut dari atas|Bayangan ringan di bawah dagu.|Use a broad diffused light above and slightly in front, keeping eyes bright and shadows open.|Studio lembut
      rim-soft|Tepi bulu berkilau|Siluet lebih terpisah dari latar.|Use a restrained rear side rim light with a soft frontal fill, retaining every fur detail.|Cahaya tepi
      back-window|Jendela dari belakang|Tepi hangat, wajah tidak gelap.|Use broad window backlighting with gentle frontal fill so face and eyes remain readable.|Cahaya alami
      low-key-soft|Dramatis lembut|Bayangan lebih dalam, mata tetap jelas.|Use low-key directional soft light with controlled dark shadows and clear eye catchlights.|Lebih dramatis
      bright-airy|Terang ringan|Kesan bersih tanpa bulu memutih.|Use bright airy high-key diffused illumination with retained highlight texture in white fur.|Studio lembut
    `),
  },
  {
    service: "pets",
    field: "petProps",
    block: "scene",
    label: "Tambahan di sekitar hewan",
    reference: "public/assets/v3/portfolio/pets-cat.webp",
    invariant:
      "Keep the exact orange-and-white cat seated naturally in the cream studio, same full-body framing and neutral soft light. Add ONLY the stated item beside the cat. No costume, no contact with neck, no tiny ingestible parts, no food, no text.",
    rows: rows(`
      cushion|Bantal kecil|Pendamping lembut di samping hewan.|Place one soft plain cream cushion beside the pet, leaving the face and paws unobstructed.|Nyaman
      basket|Keranjang rendah|Aksen anyaman yang sederhana.|Place one broad low woven basket beside the pet, with no handles or loose fibers near its head.|Nyaman
      mat|Alas rajut|Tekstur lembut di bawah hewan.|Use one plain soft knitted mat beneath the pet, with no loose yarn or fringe.|Nyaman
      plush|Mainan kain|Satu mainan besar tanpa bagian kecil.|Place one large plain soft plush toy beside the pet, without removable small parts or readable branding.|Bermain
      ball|Bola besar|Satu bola di samping kaki.|Place one smooth pet-safe ball larger than the animal's mouth beside it, with no chewing or small parts.|Bermain
      tunnel|Terowongan kain|Aksen bermain di belakang subjek.|Place one broad open fabric pet tunnel behind the pet, leaving the animal fully visible and unobstructed.|Bermain
      blank-sign|Papan polos|Untuk tulisan yang ditambah di editor.|Place a small blank freestanding sign at a safe distance beside the pet; generate no lettering.|Kartu & hadiah
      gift-box|Kotak hadiah polos|Kotak tertutup tanpa pita panjang.|Place one closed plain gift box beside the pet, with no dangling ribbons, food, or invented lettering.|Kartu & hadiah
      blanket-roll|Gulungan selimut|Tekstur hangat tanpa menutupi tubuh.|Place one neatly rolled plain cream blanket beside the pet without covering the body.|Nyaman
      low-plinth|Panggung rendah|Alas lebar, datar, dan aman.|Use one very low broad stable rounded display platform beneath the pet, with safe level footing.|Studio
    `),
  },
  {
    service: "jewelry",
    field: "surface",
    block: "scene",
    label: "Permukaan",
    reference: "public/assets/v3/portfolio/jewelry-ring.webp",
    invariant:
      "Keep the same plain gold ring and its geometry, a three-quarter close commercial composition, cream distant background and large soft neutral light. Change ONLY the surface. No extra jewelry or decorative props.",
    rows: rows(`
      white-paper|Kertas putih|Bersih untuk katalog.|Place the accessory on smooth matte white paper with a physically plausible contact shadow.|Polos
      blush-satin|Satin merah muda|Lipatan halus dengan warna lembut.|Place the accessory on pale blush satin with restrained folds clear of fine details.|Kain
      dark-wood|Kayu gelap|Serat kayu memberi rasa hangat.|Place the accessory on smooth dark walnut wood with realistic scale and a restrained grain.|Tekstur
      pale-concrete|Beton terang|Tekstur rapi untuk kesan modern.|Place the accessory on pale fine-grain concrete without scratches or excessive texture.|Tekstur
      acrylic|Akrilik bening|Pantulan tipis yang bersih.|Place the accessory on clear acrylic with controlled physically plausible reflections.|Berkilau
      ceramic|Keramik ivory|Permukaan lembut dan sedikit melengkung.|Place the accessory on a broad plain ivory ceramic dish with no patterns or lettering.|Tekstur
    `),
  },
  {
    service: "jewelry",
    field: "props",
    block: "scene",
    label: "Tambahan di sekitar produk",
    reference: "public/assets/v3/portfolio/jewelry-ring.webp",
    invariant:
      "Keep the same plain gold ring on pale stone, same three-quarter close composition and neutral soft illumination. Add ONLY the specified prop beside or behind it without blocking the complete ring.",
    rows: rows(`
      blank-card|Kartu polos|Untuk nama yang ditambah di editor.|Place one small blank cream card beside the accessory; do not invent lettering, certification or claims.|Katalog
      smooth-pebble|Batu kecil halus|Satu aksen tekstur yang tenang.|Place one smooth pale pebble behind the accessory at a realistic scale, without hiding any edges.|Natural
      ceramic-prop|Piring keramik kecil|Aksen bulat tanpa motif.|Place one small plain ivory ceramic dish beside the accessory, without duplicate products.|Katalog
      ribbon-short|Pita pendek|Aksen hadiah yang tidak menutupi detail.|Place one short softly folded satin ribbon beside the accessory, leaving fine details unobstructed.|Hadiah
      dried-sprig|Tangkai kering|Aksen natural di belakang produk.|Place one restrained dried botanical sprig behind the accessory, with no claim about product ingredients.|Natural
    `),
  },
  {
    service: "jewelry",
    field: "lighting",
    block: "lighting",
    label: "Cahaya",
    reference: "public/assets/v3/portfolio/jewelry-ring.webp",
    invariant:
      "Keep the exact plain gold ring, pale stone surface, cream background, three-quarter camera and crop unchanged. Change ONLY lighting. No props, invented gems, sparkle stickers or text.",
    rows: rows(`
      side-strip|Kilau dari samping|Garis refleksi memanjang di logam.|Use one large diffused strip light from the side, producing a clean elongated reflection and readable metal edges.|Kilau terarah
      overhead-soft|Lembut dari atas|Detail permukaan terlihat rapi.|Use a broad overhead diffuser and subtle frontal fill for clear surface detail without clipped highlights.|Lembut
      two-strip|Kilau dua sisi|Dua garis cahaya yang terkontrol.|Use two large diffused side strips with controlled reflections, retaining exact product geometry.|Kilau terarah
      back-edge|Tepi bercahaya|Siluet tegas dengan isi tetap terlihat.|Use a restrained rear edge light and broad soft fill to reveal the complete accessory outline.|Kilau terarah
      bright-catalog|Terang katalog|Bayangan ringan dan warna akurat.|Use bright neutral high-key studio illumination with open shadows and unclipped metallic highlights.|Lembut
      warm-soft|Hangat lembut|Nuansa hangat tanpa mengubah bahan.|Use gently warm diffused illumination while retaining honest metal color and material detail.|Suasana
      cool-soft|Sejuk lembut|Suasana sejuk dengan warna logam wajar.|Use slightly cool ambient fill with neutral key illumination, preserving accurate metal color.|Suasana
      hard-beam|Sorot tegas|Bayangan lebih tajam dan terarah.|Use a controlled hard directional beam with defined shadows, natural specular response and retained highlight detail.|Lebih dramatis
    `),
  },
  {
    service: "property",
    field: "view",
    block: "composition",
    label: "Sudut ruang",
    reference: "public/assets/v2/options/property-light-soft.webp",
    invariant:
      "Use the same tropical living room, arched opening, timber ceiling, cream sofas, round wood coffee table, rugs and garden, with the same neutral daylight. Change ONLY camera position. Maintain real architecture, dimensions and furniture identity; no fisheye stretching.",
    rows: rows(`
      doorway|Dari pintu masuk|Perlihatkan alur masuk ke ruang.|View the room from the entrance at natural standing eye height, preserving honest room scale and straight verticals.|Ruang utuh
      seated-eye|Setinggi duduk|Ruang terasa dekat dan nyaman.|View the room from seated eye height with level camera, honest proportions and straight architecture.|Ruang utuh
      opposite|Dari sisi seberang|Tampilkan sisi lain ruangan.|View the same room from the opposite accessible side, preserving the original floor plan and furniture positions.|Ruang utuh
      window-side|Dari samping jendela|Cahaya dan kedalaman ruang terbaca.|View the room from beside the main window, looking inward with natural perspective and undistorted verticals.|Ruang utuh
      furniture-detail|Detail furnitur|Tekstur satu furnitur jadi fokus.|Frame a close detail of one existing furniture piece with authentic material texture; add no new objects.|Detail
      decor-detail|Detail dekorasi|Sorot detail kecil yang memang ada.|Frame a close detail of existing decor on the coffee table, preserving every object's material and scale.|Detail
    `),
  },
  {
    service: "property",
    field: "lighting",
    block: "lighting",
    label: "Cahaya",
    reference: "public/assets/v2/options/property-light-soft.webp",
    invariant:
      "Keep the exact tropical living room, architecture, furniture, camera angle, framing and material colors. Change ONLY illumination. No added furniture, lamps, people, text or fixtures.",
    rows: rows(`
      cloudy|Siang berawan|Cahaya merata dengan bayangan halus.|Use soft overcast daylight through the existing openings, retaining realistic interior exposure and material colors.|Siang
      morning|Pagi hangat|Sinar rendah yang terasa segar.|Use gentle warm morning sunlight through the existing openings with plausible shadows and honest material color.|Pagi & sore
      noon|Siang terang|Ruang dan detail mudah dilihat.|Use bright neutral midday daylight with controlled window highlights and readable interior shadows.|Siang
      late-day|Sore lembut|Hangat tanpa warna berlebihan.|Use soft late-afternoon daylight with restrained warmth, preserving wall and furniture colors.|Pagi & sore
      blue-hour|Menjelang malam|Suasana biru di luar, interior tetap jelas.|Use natural blue-hour exterior ambient light and the room's existing practical lights only; retain readable interior detail.|Malam
      practical|Lampu ruang|Suasana malam yang hangat.|Use only plausible warm illumination from existing room light fixtures at night; do not invent fixtures or alter architecture.|Malam
      balanced-listing|Terang untuk listing|Jendela dan sudut ruang seimbang.|Balance natural window illumination and gentle interior fill so both exterior openings and room details are readable, without unrealistic HDR halos.|Siang
    `),
  },
  {
    service: "people",
    field: "pose",
    block: "composition",
    label: "Pose",
    reference: "public/assets/v3/poses/standing-front.webp",
    invariant:
      "Use the exact adult fictional woman, short black bob, face and proportions in the reference, light gray crewneck T-shirt, charcoal trousers and white sneakers. Same warm gray studio, neutral soft light and full-body framing. Change ONLY pose. Neck upright, shoulders level; no repeated tilted head, cheek-on-hand pose, logos or text.",
    rows: rows(`
      one-pocket|Satu tangan di saku|Santai dengan bahu tetap rileks.|Place one hand loosely in a trouser pocket and let the other arm rest naturally; keep shoulders level and neck upright.|Berdiri santai
      hands-behind|Tangan di belakang|Siluet badan lebih rapi.|Let both hands rest naturally behind the lower back, keeping shoulders relaxed and neck upright.|Berdiri santai
      slight-lean|Badan sedikit maju|Kesan dekat tanpa kepala miring.|Lean the torso very slightly forward from the hips with a naturally supported upright neck and relaxed arms.|Berdiri santai
      seated-side|Duduk menyamping|Tubuh sedikit berputar di kursi.|Sit sideways on a plain backless stool with torso gently turned toward camera, feet supported and neck upright.|Duduk
      one-step|Satu kaki di depan|Pose berdiri yang tidak kaku.|Stand with one foot slightly forward and weight balanced naturally, with relaxed arms and level shoulders.|Berdiri santai
      look-back|Menoleh ke kamera|Badan berputar, leher tetap wajar.|Turn the torso gently away and glance back toward camera within comfortable neck range; do not twist the spine or tilt the head.|Arah tubuh
    `),
  },
  {
    service: "people",
    field: "expression",
    block: "look",
    label: "Ekspresi",
    reference: "public/assets/v3/poses/front-neutral.webp",
    invariant:
      "Same adult fictional woman, exact face, bob haircut, gray crewneck, frontal head-and-shoulders crop, warm gray studio, upright neck and neutral soft light. Change ONLY facial expression, preserving age and facial structure; no hands, face tilt or text.",
    rows: rows(`
      closed-smile|Senyum tipis|Bibir tertutup dan terasa ramah.|Use a gentle closed-lip smile with relaxed cheeks and natural eyes, without changing facial structure.|Ramah
      laugh|Tertawa natural|Momen ceria tanpa berlebihan.|Use a spontaneous gentle laugh with believable teeth, natural eye creases and no exaggerated mouth opening.|Ceria
      curious|Penasaran ringan|Mata lebih hidup, tetap natural.|Use a subtly curious expression with slightly attentive eyebrows and relaxed lips, without distorting the eyes.|Ekspresif
      serene|Tenang lembut|Tatapan santai dan bibir rileks.|Use a serene expression with relaxed eyelids and softly resting lips, preserving recognizable facial identity.|Tenang
    `),
  },
  {
    service: "prewedding",
    field: "couplePose",
    block: "composition",
    label: "Pose pasangan",
    reference: "public/assets/v3/portfolio/prewedding-modern-v2.webp",
    invariant:
      "Keep the same two adults and distinct faces, woman with short black bob and modest long-sleeved ivory gown, man in black suit, plain cream studio and soft neutral light. Change ONLY the couple pose; no bouquet, props or head-on-hand pose, keep both necks natural.",
    rows: rows(`
      side-by-side|Berdampingan santai|Keduanya terlihat jelas dari depan.|Place the couple side by side facing camera with relaxed arms, level shoulders and distinct unobstructed faces.|Berdiri bersama
      back-to-back|Saling membelakangi|Pose editorial yang tetap santai.|Pose the couple gently back to back, both faces turned comfortably toward camera with natural neck rotation.|Berdiri bersama
      walking-camera|Berjalan ke kamera|Langkah ringan dengan wajah terlihat.|Show the couple walking slowly toward camera side by side, with natural steps and both faces readable.|Bergerak
      seated-distance|Duduk berdampingan|Duduk rapi tanpa saling menutupi.|Seat the couple side by side on a broad plain bench with a small comfortable gap, feet supported and both faces unobstructed.|Duduk bersama
    `),
  },
];

export const expandedPhotoId = (series: PhotoSeries, value: string) =>
  `${series.service}-${series.field}-${value}`;
const photoOptions = (series: PhotoSeries): SemanticOption[] =>
  series.rows.map(([value, label, hint, instruction, group]) => ({
    value: series.replaceExisting ? value : `more-${value}`,
    label,
    hint,
    instruction,
    group,
    visual: {
      kind: "photo",
      src: `/assets/expanded/options/${expandedPhotoId(series, value)}-small.webp`,
    },
    keywords: [label, group, series.label],
  }));
const COLORS: [string, string, string][] = [
  ["ivory", "Ivory", "#fffaf0"],
  ["oat", "Oat", "#ddd0b9"],
  ["sand", "Pasir", "#d5bd95"],
  ["taupe", "Cokelat abu", "#a99788"],
  ["chocolate", "Cokelat pekat", "#583f35"],
  ["terracotta", "Terakota", "#bd7156"],
  ["coral", "Coral", "#ef8f83"],
  ["salmon", "Salmon", "#e6a092"],
  ["rose", "Mawar lembut", "#d6a7b4"],
  ["dusty-pink", "Merah muda redup", "#c996a6"],
  ["burgundy", "Merah anggur", "#722f46"],
  ["plum", "Ungu plum", "#67435c"],
  ["lilac", "Lilac", "#cbb8e6"],
  ["periwinkle", "Ungu kebiruan", "#adb7e9"],
  ["cobalt", "Biru terang", "#3456ba"],
  ["slate-blue", "Biru abu", "#7d94a9"],
  ["sky", "Biru langit", "#b6d6ee"],
  ["mint", "Mint", "#c4e4d4"],
  ["olive", "Hijau zaitun", "#8a9566"],
  ["forest", "Hijau hutan", "#315c4c"],
  ["pistachio", "Hijau pistachio", "#cdd6a6"],
  ["butter", "Kuning mentega", "#f2dfa3"],
  ["mustard", "Kuning tua", "#c7a146"],
  ["apricot", "Jingga lembut", "#f2c49c"],
];
const colorOptions = (people: boolean): SemanticOption[] =>
  COLORS.map(([id, label, color]) => ({
    value: `color-${id}`,
    label,
    hint: `Latar polos ${label.toLocaleLowerCase("id")}, tanpa tekstur.`,
    group: "Warna polos",
    instruction: `Use a seamless solid ${id.replaceAll("-", " ")} background with exact target color ${color}, without texture or distracting objects. Preserve the subject and its authentic colors.`,
    visual: { kind: "background", color, ...(people ? {} : { src: "" }) },
  }));

const PALETTES: [string, string, string[]][] = [
  ["sand", "Pasir & ivory", ["#fffaf0", "#dcc9a6", "#9a8366", "#40392e"]],
  ["clay", "Tanah hangat", ["#f6e9db", "#d1a88b", "#a4664d", "#483831"]],
  ["rose", "Mawar & krem", ["#fff4ed", "#e9c2cb", "#ac7386", "#543e49"]],
  ["sunny", "Kuning cerah", ["#fff9e5", "#f7d568", "#d59643", "#494231"]],
  ["sea", "Biru laut", ["#f0f8f8", "#abd7d5", "#397b8f", "#233e56"]],
  ["coffee", "Kopi & susu", ["#f6f0e5", "#ceb79e", "#96765d", "#49372e"]],
  ["sage", "Sage & putih", ["#fbfaf2", "#d9dfcc", "#94a38a", "#3f5145"]],
  ["peach", "Peach & coral", ["#fff1e4", "#f6c6ad", "#df8b7d", "#67494d"]],
  ["night", "Biru malam", ["#eef1f6", "#aab6ce", "#516181", "#242f45"]],
  ["lilac", "Lilac lembut", ["#f7f2fb", "#d8c8ee", "#a692c7", "#594775"]],
  ["berry", "Berry gelap", ["#f8eaf0", "#d4a5b8", "#965069", "#492d45"]],
  ["leaf", "Hijau segar", ["#f2f8e9", "#c7dfa4", "#7ba468", "#3d6248"]],
  ["stone", "Batu netral", ["#f4f2ef", "#cec9c1", "#969086", "#47443f"]],
  ["sunset", "Senja lembut", ["#fff0d8", "#f4c292", "#cc8b83", "#766080"]],
  [
    "blue-yellow",
    "Biru & kuning",
    ["#f4f7fc", "#b3cee9", "#e5cc78", "#33516c"],
  ],
  ["black-gold", "Hitam & emas", ["#f7f0dc", "#d1b777", "#756745", "#262626"]],
];

const TONES: [string, string, string[], string][] = [
  [
    "soft",
    "Lembut natural",
    ["#f4eee5", "#cbbb9f", "#8e9380"],
    "Use soft restrained tonal contrast and gentle highlight rolloff, retaining fine texture and authentic subject color.",
  ],
  [
    "crisp",
    "Bersih & tegas",
    ["#f5f4ed", "#afbdc2", "#36494d"],
    "Use crisp restrained tonal contrast and clear midtone separation, without oversharpening or changing authentic colors.",
  ],
  [
    "matte",
    "Matte lembut",
    ["#eee6d8", "#b4a997", "#666059"],
    "Use gently lifted shadow tones and a restrained matte finish, preserving fine detail and truthful subject colors.",
  ],
  [
    "pastel",
    "Pastel ringan",
    ["#f7eadf", "#d9c5d8", "#b9d0c4"],
    "Use restrained pastel ambient tones and low saturation in the surroundings only; preserve accurate skin, fur, food and product hues.",
  ],
  [
    "earth",
    "Warna bumi",
    ["#eee0c8", "#af9272", "#6d775d"],
    "Use a restrained earthy treatment in ambient tones, with authentic subject colors and no orange skin or product color shifts.",
  ],
  [
    "film-soft",
    "Foto film lembut",
    ["#f1e4cc", "#c3ad92", "#62736c"],
    "Use gentle film-like highlight rolloff, restrained fine grain and natural saturation; preserve authentic subject colors.",
  ],
  [
    "cool-shadow",
    "Bayangan sejuk",
    ["#eee9e0", "#acc1ca", "#4c6b79"],
    "Use subtle cool ambient shadow tones with neutral highlights and accurate subject colors; do not tint the subject blue.",
  ],
  [
    "warm-highlight",
    "Sorotan hangat",
    ["#faeed8", "#d4ba91", "#8b7d69"],
    "Use gently warm highlight tones in the environment, retaining neutral skin, fur and product color and unclipped texture.",
  ],
  [
    "low-saturation",
    "Warna lebih tenang",
    ["#e5e1da", "#b3b1a3", "#7d8583"],
    "Use restrained ambient saturation while preserving the subject's authentic hues and readable material texture.",
  ],
  [
    "punchy",
    "Warna lebih hidup",
    ["#f5e7c4", "#bd8b72", "#436a64"],
    "Use modestly richer ambient colors with natural contrast; do not exaggerate skin, fur, food or product saturation.",
  ],
  [
    "mono-soft",
    "Hitam putih lembut",
    ["#eee", "#b9b9b9", "#555"],
    "Render in black and white with soft tonal contrast. In this explicitly selected monochrome treatment, preserve authentic relative tones and material texture rather than original hues.",
  ],
  [
    "mono-crisp",
    "Hitam putih tegas",
    ["#fff", "#999", "#191919"],
    "Render in black and white with defined tonal separation, retaining highlight and shadow detail. In this explicitly selected monochrome treatment, preserve relative tones rather than original hues.",
  ],
];
const tones = (): SemanticOption[] =>
  TONES.map(([id, label, colors, instruction]) => ({
    value: `tone-${id}`,
    label,
    hint: "Contoh arah warna; bukan pratinjau hasil langsung.",
    group: id.startsWith("mono") ? "Hitam putih" : "Warna kreatif",
    instruction,
    visual: { kind: "palette", colors },
  }));

// Frame guides deliberately use one consistent subject with a precise crop/placement
// overlay, rather than passing off unrelated generated photos as measured comparisons.
const FRAMES: [string, string, string, string][] = [
  [
    "room-top",
    "Ruang kosong di atas",
    "Subjek di bagian bawah untuk ruang judul.",
    "Place the complete main subject in the lower half with generous clean negative space above, without rendering lettering.",
  ],
  [
    "room-bottom",
    "Ruang kosong di bawah",
    "Subjek di atas, ruang tambahan di bawah.",
    "Place the main subject in the upper half with clean negative space below; do not crop essential subject details or render lettering.",
  ],
  [
    "room-around",
    "Ruang lega di sekeliling",
    "Objek lebih kecil dengan ruang bernapas.",
    "Use generous even margins around the complete subject, keeping it clearly readable with no added objects.",
  ],
  [
    "tight",
    "Lebih rapat",
    "Subjek hampir memenuhi bingkai.",
    "Use a tight composition around the main subject, preserving every essential edge and avoiding awkward joint crops.",
  ],
  [
    "upper-left",
    "Subjek kiri atas",
    "Letakkan subjek di pertemuan garis kiri atas.",
    "Place the subject near the upper-left rule-of-thirds intersection with balanced negative space and no accidental edge cropping.",
  ],
  [
    "lower-left",
    "Subjek kiri bawah",
    "Ruang lebih banyak di atas dan kanan.",
    "Place the subject near the lower-left rule-of-thirds intersection, retaining complete essential details.",
  ],
  [
    "upper-right",
    "Subjek kanan atas",
    "Ruang lebih banyak di kiri dan bawah.",
    "Place the subject near the upper-right rule-of-thirds intersection, with readable essential details and natural proportions.",
  ],
  [
    "lower-right",
    "Subjek kanan bawah",
    "Ruang lebih banyak di atas dan kiri.",
    "Place the subject near the lower-right rule-of-thirds intersection with generous clean negative space above and left.",
  ],
];
const frames = (src: string): SemanticOption[] =>
  FRAMES.map(([value, label, hint, instruction]) => ({
    value: `frame-${value}`,
    label,
    hint,
    instruction,
    group: "Letak dalam bingkai",
    visual: { kind: "layout", src, layout: `frame-${value}` },
  }));

export function expandOptions(
  service: ServiceId,
  input: Definition[],
  banks: { professional: Definition[]; product: Definition[] },
): Definition[] {
  const fields = input.map((f) => ({
    ...f,
    options: f.options.map((o) => ({ ...o })),
  }));
  const people = PEOPLE_SERVICES.includes(service);
  const append = (key: string, options: SemanticOption[]) => {
    const f = fields.find((f) => f.key === key);
    if (!f) return;
    const values = new Set(f.options.map((o) => o.value));
    f.options.push(...options.filter((o) => !values.has(o.value)));
  };
  const add = (
    key: string,
    label: string,
    block: BlockId,
    options: SemanticOption[],
    advanced = false,
  ) => {
    if (!fields.some((f) => f.key === key))
      fields.push({
        key,
        label,
        block,
        advanced,
        help: "Pilih lewat contoh. Jika tidak diperlukan, pilih Tanpa arahan tambahan.",
        options: [],
      });
    append(key, options);
  };
  for (const series of EXPANDED_PHOTOS) {
    const applies =
      series.service === service ||
      (series.service === "people" &&
        people &&
        !["formal", "prewedding", "family", "relight"].includes(service) &&
        (series.field !== "pose" || fields.some((f) => f.key === "pose")));
    if (applies && series.replaceExisting) {
      const field = fields.find((f) => f.key === series.field)!;
      const replacements = photoOptions(series);
      field.options = field.options.map((o) => {
        const replacement = replacements.find((r) => r.value === o.value);
        // Existing selections keep their instruction except the old bottle-cap
        // detail, which was not appropriate for an accessory.
        return replacement
          ? {
              ...o,
              ...replacement,
              instruction:
                o.value === "cap-detail"
                  ? replacement.instruction
                  : o.instruction,
            }
          : o;
      });
    } else if (applies)
      add(series.field, series.label, series.block, photoOptions(series));
  }
  append("background", colorOptions(people && service !== "prewedding"));
  append(
    "palette",
    PALETTES.map(([id, label, colors]) => ({
      value: `palette-${id}`,
      label,
      hint: "Warna pendukung; warna subjek tetap dijaga.",
      group: "Palet tambahan",
      visual: { kind: "palette", colors },
      instruction: `Use a supporting design palette of ${colors.join(", ")}; preserve accurate subject and product colors. This controls palette, not lighting, layout or lettering.`,
    })),
  );
  append("treatment", tones());
  if (["property", "relight", "cinematic"].includes(service))
    append("style", tones());
  append(
    "ratio",
    [
      ["3:2", "Foto mendatar"],
      ["5:4", "Mendatar pendek"],
      ["2:1", "Banner lebar"],
      ["21:9", "Sangat lebar"],
      ["1:2", "Vertikal panjang"],
    ].map(([ratio, label]) => ({
      value: ratio,
      label: `${label} — ${ratio}`,
      hint: `Perbandingan lebar dan tinggi ${ratio}. Bukan ukuran cetak resmi.`,
      group: ratio === "1:2" ? "Vertikal" : "Mendatar",
      visual: { kind: "ratio", ratio },
      instruction: `Use an output image aspect ratio of ${ratio}; this specifies proportions, not an official document size or guaranteed pixel resolution.`,
    })),
  );
  append(
    "typography",
    [
      [
        "mono",
        "Huruf mesin",
        "monospace lettering with equal-width characters",
      ],
      [
        "serif-upright",
        "Serif klasik",
        "upright classic serif lettering with readable stroke contrast",
      ],
      [
        "light",
        "Tipis minimalis",
        "lightweight clean sans-serif lettering with generous spacing",
      ],
      [
        "spaced",
        "Huruf berjarak",
        "widely tracked uppercase sans-serif lettering",
      ],
      [
        "italic",
        "Miring dinamis",
        "italic sans-serif lettering with clear readable forms",
      ],
      [
        "slab",
        "Serif tebal",
        "bold slab-serif lettering with sturdy rectangular serifs",
      ],
    ].map(([id, label, description]) => ({
      value: `type-${id}`,
      label,
      hint: "Contoh gaya huruf, bukan font final atau teks otomatis.",
      group: "Gaya huruf tambahan",
      visual: { kind: "type", layout: id },
      instruction: `Use ${description} for exact supplied text only. Do not invent a brand, slogan, discount or claims. If no text is supplied, leave the typography region empty for later editing.`,
    })),
  );
  append(
    "layout",
    [
      ["corner-tl", "Produk kiri atas", "upper-left", "lower-right"],
      ["corner-tr", "Produk kanan atas", "upper-right", "lower-left"],
      ["corner-bl", "Produk kiri bawah", "lower-left", "upper-right"],
      ["corner-br", "Produk kanan bawah", "lower-right", "upper-left"],
      [
        "wide-band",
        "Gambar tengah, judul atas",
        "central horizontal band",
        "top band",
      ],
      [
        "lower-band",
        "Gambar bawah, judul besar",
        "lower horizontal band",
        "upper half",
      ],
      [
        "narrow-left",
        "Gambar kecil kiri",
        "left third with generous margins",
        "right two thirds",
      ],
      [
        "narrow-right",
        "Gambar kecil kanan",
        "right third with generous margins",
        "left two thirds",
      ],
    ].map(([id, label, subject, copy]) => ({
      value: `layout-${id}`,
      label,
      hint: "Blok ungu = subjek; garis gelap = area tulisan.",
      group: "Letak tambahan",
      visual: { kind: "layout", layout: id },
      instruction: `Place the main subject in the ${subject}; reserve clean text-safe space in the ${copy}. Preserve product geometry and use only supplied copy, without inventing claims or discounts.`,
    })),
  );
  append(
    "copyArea",
    [
      ["headline", "Judul saja", "one short supplied headline", "top"],
      [
        "headline-sub",
        "Judul & keterangan",
        "a supplied headline and short supporting line",
        "subject-left",
      ],
      [
        "price",
        "Judul & harga",
        "a supplied headline and exact supplied price; omit a price if none is supplied",
        "center",
      ],
      [
        "cta",
        "Judul & tombol",
        "a supplied headline and supplied call-to-action label, without inventing either",
        "subject-top",
      ],
      [
        "three-points",
        "Untuk tiga poin",
        "up to three short supplied information points; leave missing points empty",
        "left",
      ],
      [
        "footer",
        "Catatan kecil",
        "a short supplied footer note with a clear visual hierarchy",
        "bottom",
      ],
      [
        "brand",
        "Untuk nama merek",
        "only the exact supplied brand name, without a made-up slogan",
        "copy-corner",
      ],
      [
        "long-copy",
        "Informasi lengkap",
        "a supplied headline, supporting copy and supplied contact line, omitting any missing content",
        "subject-small-bottom",
      ],
    ].map(([id, label, purpose, layout]) => ({
      value: `copy-${id}`,
      label,
      hint: "Hanya gunakan tulisan yang kamu isi; bagian kosong tidak dikarang.",
      group: "Isi tulisan",
      visual: { kind: "layout", layout },
      instruction: `Provide a clear typographic hierarchy suitable for ${purpose}. Respect the selected layout's text-safe location. Do not invent copy, ratings, discounts, prices or claims.`,
    })),
  );
  append(
    "mark",
    [
      ["heart", "Hati", "a compact heart silhouette"],
      [
        "sun",
        "Matahari",
        "a circular sun with a small number of balanced rays",
      ],
      ["star", "Bintang", "a clear balanced star silhouette"],
      [
        "hexagon",
        "Segi enam",
        "a compact hexagonal silhouette with readable negative space",
      ],
      [
        "diamond",
        "Berlian geometris",
        "an abstract faceted diamond silhouette, without implying gem certification",
      ],
      [
        "shield",
        "Perisai",
        "a simple shield outline, without implying security certification",
      ],
      ["cloud", "Awan", "a simple rounded cloud silhouette"],
      [
        "infinity",
        "Lengkung tak berujung",
        "an original continuous double-loop contour",
      ],
      ["orbit", "Orbit", "an original ellipse and central circle arrangement"],
      ["pin", "Penanda lokasi", "a simple location-pin shape"],
      ["flame", "Api", "a compact abstract flame silhouette"],
      ["music", "Nada musik", "a simple musical-note-inspired contour"],
      ["spark", "Percikan", "an original four-point sparkle silhouette"],
      ["link", "Dua bentuk terhubung", "two simple linked rounded forms"],
      ["leaf", "Daun tunggal", "a single compact leaf silhouette"],
      [
        "circle",
        "Lingkaran",
        "a distinctive original circular mark with balanced negative space",
      ],
    ].map(([id, label, description]) => ({
      value: `mark-${id}`,
      label,
      hint: "Arah bentuk sederhana; logo akhir harus orisinal dan diperiksa lagi.",
      group: "Bentuk tambahan",
      visual: { kind: "layout", layout: `mark-${id}` },
      instruction: `Explore an original brand symbol based on ${description}. Keep a reproducible silhouette, avoid known brand resemblance, and invent no brand name or unsupported certification.`,
    })),
  );
  if (service === "fashion") {
    const wardrobe = banks.professional.find((f) => f.key === "wardrobe")!;
    append(
      "concept",
      wardrobe.options
        .filter(
          (o) =>
            ![
              "original",
              "graduation",
              "graduation-gown",
              "medical-coat",
              "blazer",
            ].includes(o.value),
        )
        .map((o) => ({
          ...o,
          value: `outfit-${o.value}`,
          group: "Busana tambahan",
        })),
    );
  }
  // The previously tiny formal wardrobe now exposes relevant existing clothing
  // samples without offering theatrical or wedding outfits.
  if (service === "formal")
    append(
      "wardrobe",
      banks.professional
        .find((f) => f.key === "wardrobe")!
        .options.filter((o) =>
          [
            "formal-suit",
            "light-blue-blouse",
            "navy-blazer",
            "sage-blazer",
            "collared-shirt",
            "hijab-blazer",
            "dark-monochrome",
          ].includes(o.value),
        ),
    );
  if (service === "jewelry") {
    const angle = fields.find((f) => f.key === "angle")!;
    angle.options.find((o) => o.value === "cap-detail")!.label =
      "Detail sambungan";
    angle.options.find((o) => o.value === "cap-detail")!.hint =
      "Periksa bagian sambungan yang memang ada.";
  }
  const src =
    service === "pets"
      ? portfolioImage("pets-cat", true)
      : service === "jewelry"
        ? portfolioImage("jewelry-ring", true)
        : service === "food"
          ? "/assets/v2/options/food-presentation-clean-small.webp"
          : service === "prewedding"
            ? portfolioImage("prewedding-modern", true)
            : people
              ? "/assets/v3/poses/standing-front-small.webp"
              : "/assets/v2/options/product-angle-eye-small.webp";
  append("framing", frames(src));
  append("distance", frames(src));
  if (service === "pets") {
    add("framing", "Potongan gambar", "composition", [
      ...["full", "close", "space-left", "space-right"].map(
        (value, i): SemanticOption => ({
          value,
          label: [
            "Seluruh tubuh",
            "Dekat ke wajah",
            "Ruang di kiri",
            "Ruang di kanan",
          ][i],
          hint: "Panduan bingkai menggunakan hewan yang sama.",
          group: "Potongan utama",
          visual: { kind: "layout", src, layout: `frame-${value}` },
          instruction: [
            "Show the complete animal including paws and tail with comfortable headroom.",
            "Use a close portrait of the animal's face with intact ears, readable eyes and whiskers.",
            "Place the animal in the right third with clean negative space on the left.",
            "Place the animal in the left third with clean negative space on the right.",
          ][i],
        }),
      ),
      ...frames(src),
    ]);
    add(
      "depth",
      "Ketajaman latar",
      "composition",
      [
        [
          "deep",
          "Latar tetap jelas",
          "Keep the complete animal and surrounding context clearly readable with sufficient depth of field.",
        ],
        [
          "balanced",
          "Latar agak lembut",
          "Keep the complete animal sharp with moderately soft surrounding details.",
        ],
        [
          "shallow",
          "Latar sangat lembut",
          "Use shallow depth of field with smooth background blur, keeping both eyes on the focus plane and the face sharp.",
        ],
      ].map(([value, label, instruction]) => ({
        value,
        label,
        instruction,
        hint: "Panduan ketajaman, bukan simulasi optik terukur.",
        visual: { kind: "layout", src, layout: `depth-${value}` },
        group: "Ketajaman",
      })),
      true,
    );
  }
  return fields;
}
