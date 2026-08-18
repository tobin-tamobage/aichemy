import { VisualOption } from "./types";
import { WESTERN_ANIMATION_STYLES } from './westernAnimationCatalog';
import { ANIME_GENRES } from './animeGenreCatalog';
import { ANIME_SHOW_STYLES } from './animeShowStyleCatalog';

export { WESTERN_ANIMATION_STYLES, ANIME_GENRES, ANIME_SHOW_STYLES };

// --- Helper to create visual options ---
const createOptions = (items: string[], category: string): VisualOption[] => {
  return items.map(item => {
    // 1. Convert to lowercase
    // 2. Remove apostrophes (Bird's-eye -> birdseye) or similar special chars if desired, 
    //    but here we just replace non-alphanumeric chars with dashes.
    // 3. Example: "Bird's-eye view" -> "birds-eye-view"
    // 4. Example: "Black & White" -> "black-white"
    const slug = item
      .normalize('NFD')            // Break out diacritics (e.g., ä -> a)
      .replace(/[\u0300-\u036f]/g, '') // Strip diacritics to keep ASCII filenames
      .toLowerCase()
      .replace(/'/g, '')           // Remove apostrophes
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with dashes
      .replace(/^-+|-+$/g, '');    // Trim dashes from start/end

    return {
      label: item,
      value: item,
      // EXPECTATION: You have a folder named 'public/images/[category]/' containing '[slug].webp'
      image: `/images/${category}/${slug}.webp` 
    };
  });
};

const createOptionsWithValues = (
  items: { label: string; value: string }[],
  category: string
): VisualOption[] => {
  return items.map(item => {
    const slug = item.label
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/'/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return {
      label: item.label,
      value: item.value,
      image: `/images/${category}/${slug}.webp`
    };
  });
};

const RAW_SHOT_TYPES = [
  { label: "Bird's-eye view", value: "Bird's-eye view: The camera is positioned directly above the subject, looking down from a height," },
  { label: "Close up", value: "Close up shot" },
  { label: "Cutaway shot", value: "Cutaway shot" },
  { label: "Cowboy-shot", value: "Cowboy-shot" },
  { label: "Dutch angle", value: "Tilted dutch angle shot" },
  { label: "Entire body", value: "Entire body shot" },
  { label: "Establishing shot", value: "Establishing shot" },
  { label: "Extreme close up", value: "Extreme close up" },
  { label: "Group shot", value: "Group shot" },
  { label: "Headshot", value: "Headshot" },
  { label: "High angle shot", value: "High angle shot: camera is physically higher than the subject looking down," },
  { label: "Insert shot", value: "Insert shot" },
  { label: "Low angle shot", value: "Low angle shot: camera is physically lower than the subject looking up," },
  { label: "Medium shot", value: "Medium shot" },
  { label: "Over the shoulder shot", value: "Over the shoulder shot looking at someone or something else in the scene from behind a shoulder or object" },
  { label: "Overhead shot", value: "Overhead shot" },
  { label: "Point of view shot", value: "strict first-person Point of View shot the camera is mounted at eye-level, the subject is not in frame, a Go-Pro Bodycam without text overlay from the perspective of" },
  { label: "Reaction shot", value: "Reaction shot" },
  { label: "Reverse shot", value: "Reverse shot" },
  { label: "Three quarter body", value: "Three quarter body shot" },
  { label: "Tight headshot", value: "Tight headshot" },
  { label: "Two-shot", value: "Two-shot" },
  { label: "Upper body", value: "Upper body shot" },
  { label: "Wide shot", value: "Wide shot" },
  { label: "Worm's-eye view", value: "worm's-eye view - the camera is very low to the ground looking up and the ground could be included in frame" }
];
export const SHOT_TYPES = createOptionsWithValues(RAW_SHOT_TYPES, 'shots');

const RAW_VIEWING_DIRECTIONS = [
  { label: "from the front", value: "facing the camera:" },
  { label: "from the back", value: "facing away from the camera:" },
  { label: "from the left", value: "facing the left side of the camera:" },
  { label: "from the right", value: "facing the right side of the camera:" }
];
export const VIEWING_DIRECTIONS = createOptionsWithValues(RAW_VIEWING_DIRECTIONS, 'directions');

const RAW_LIGHTING_TYPES = [
  { label: "Backlighting / Rim Lighting", value: "Backlighting / Rim Lighting" },
  { label: "Blue hour", value: "blue-hour ambient lighting" },
  { label: "Bounce Lighting", value: "Bounce Lighting" },
  { label: "Broad Lighting", value: "Broad Lighting with the near cheek lit brighter and gentle shadow falloff" },
  { label: "Candlelight Lighting", value: "Candlelight Lighting with warm flicker and deep surrounding shadows" },
  { label: "Chiaroscuro Lighting", value: "Chiaroscuro Lighting with a single hard key and heavy shadow contrast" },
  { label: "Color Gels", value: "Color Gels gelled key light and a contrasting gelled rim light" },
  { label: "Direct flash", value: "direct on-camera flash, creating harsh shadows and a flat, artificial look" },
  { label: "Fog diffusion", value: "fog-diffused light" },
  { label: "Gobo Lighting", value: "Gobo Lighting with patterned shadows and a soft ambient fill" },
  { label: "Golden hour", value: "warm golden-hour lighting" },
  { label: "Hard Lighting", value: "Hard Lighting with a small punchy key and crisp shadow edges" },
  { label: "High Key Lighting", value: "High Key Lighting" },
  { label: "LED streetlights", value: "cool white LED streetlights" },
  { label: "Loop Lighting", value: "Loop Lighting" },
  { label: "Low Key Lighting", value: "Low Key Lighting" },
  { label: "Midday sun", value: "harsh midday sun lighting" },
  { label: "Moonlight", value: "moonlight" },
  { label: "Motivated Lighting", value: "Motivated Lighting" },
  { label: "Natural daylight", value: "natural daylight" },
  { label: "Neon Lighting", value: "Neon Lighting" },
  { label: "Open shade", value: "open-shade skylight lighting" },
  { label: "Overcast Lighting", value: "Overcast Lighting" },
  { label: "Paramount Lighting", value: "Paramount Lighting with a high centered key and a soft shadow under the nose" },
  { label: "Phone flashlight", value: "harsh phone flashlight fill" },
  { label: "Practical Lighting", value: "Practical Lighting from practical light sources visible in the scene" },
  { label: "Product side key", value: "product side key lighting" },
  { label: "Rembrandt Lighting", value: "Rembrandt Lighting" },
  { label: "Rim & soft fill", value: "subtle rim backlight with soft front fill lighting" },
  { label: "Ring light", value: "frontal ring light out of frame with catchlights but IMPORTANT don't show the ring light is in the shot" },
  { label: "Shopfront fluorescents", value: "harsh white shopfront fluorescents with a green tint" },
  { label: "Silhouette Shadows", value: "Silhouette Shadows with strong backlight and no front fill, face mostly in shadow" },
  { label: "Sodium streetlamps", value: "orange sodium streetlamps" },
  { label: "Soft Lighting", value: "Soft Lighting" },
  { label: "Softbox key lighting", value: "softbox key lighting" },
  { label: "Split Lighting", value: "Split Lighting with a side key lighting half the face and minimal fill" },
  { label: "Teal and orange", value: "teal-and-orange cinematic contrast lighting" },
  { label: "Three point lighting", value: "three-point lighting with a soft key, gentle fill, and a clean rim light separation" },
  { label: "Top Lighting", value: "Top Lighting with an overhead key and subtle fill to control eye shadows" },
  { label: "Top-down flat lay", value: "top-down diffuse lighting" },
  { label: "Underlighting", value: "Underlighting with a low key light and reduced fill for eerie upward shadows" },
  { label: "Volumetric Lighting", value: "Volumetric Lighting with visible light beams through haze" },
  { label: "Window spill", value: "warm window spill lighting" }
];
export const LIGHTING_TYPES = createOptionsWithValues(RAW_LIGHTING_TYPES, 'lighting');

// Cameras usually don't need visual examples as much as the result, but we can keep them consistent
const RAW_CAMERAS = [
  { label: "8mm film camera", value: "8mm film camera" },
  { label: "35mm film camera", value: "35mm film camera" },
  { label: "Aaton XTR", value: "Aaton XTR" },
  { label: "Argus C3", value: "Argus C3" },
  { label: "ARRI ALEXA 65", value: "ARRI ALEXA 65" },
  { label: "Bolex H16", value: "Bolex H16" },
  { label: "Canon C500", value: "Canon C500" },
  { label: "Panavision Panaflex", value: "Panavision Panaflex" },
  { label: "RED digital cinema camera", value: "RED digital cinema camera" },
  { label: "s16mm film camera", value: "s16mm film camera" },
  { label: "Sony FX6", value: "Sony FX6" },
  { label: "Sony Venice", value: "Sony Venice" },
  { label: "VHS Camera", value: "VHS Camera" },
  { label: "Canon EOS 5D", value: "Canon EOS 5D" },
  { label: "Fujifilm X-T4", value: "Fujifilm X-T4" },
  { label: "GoPro Hero", value: "GoPro Hero" },
  { label: "Hasselblad X1D II", value: "Hasselblad X1D II" },
  { label: "Insta360 X4", value: "Insta360 X4" },
  { label: "Leica Q2 Monochrom", value: "Leica Q2 Monochrom" },
  { label: "Lumix GH5", value: "Lumix GH5" },
  { label: "Pentax 645Z", value: "Pentax 645Z" },
  { label: "Phase One XF IQ4", value: "Phase One XF IQ4" },
  { label: "Sony FX3", value: "Sony FX3" },
  { label: "Canon AE-1", value: "Canon AE-1" },
  { label: "Contax T2", value: "Contax T2" },
  { label: "Diana F+", value: "Diana F+" },
  { label: "Hasselblad 500CM", value: "Hasselblad 500CM" },
  { label: "Holga 120N", value: "Holga 120N" },
  { label: "Kodak Brownie", value: "Kodak Brownie" },
  { label: "Kodak Funsaver", value: "Kodak Funsaver" },
  { label: "Leica M3", value: "Leica M3" },
  { label: "Lomo LC-A", value: "Lomo LC-A" },
  { label: "Mamiya RB67", value: "Mamiya RB67" },
  { label: "Minolta SRT-101", value: "Minolta SRT-101" },
  { label: "Nikon F2", value: "Nikon F2" },
  { label: "Nikon FM2", value: "Nikon FM2" },
  { label: "Olympus OM-1", value: "Olympus OM-1" },
  { label: "Pentax K1000", value: "Pentax K1000" },
  { label: "Polaroid 600", value: "Polaroid 600" },
  { label: "Polaroid SX-70", value: "Polaroid SX-70" },
  { label: "Rolleiflex", value: "Rolleiflex" },
  { label: "Yashica T4", value: "Yashica T4" },
  { label: "Zenit-E", value: "Zenit-E" },
  // New items
  { label: "Compact camera", value: "early 2000s compact digital camera with deep depth of field, cool white balance, and plastic skin tones" },
  { label: "Doorbell cam", value: "doorbell security camera" },
  { label: "iPhone Pro", value: "modern iPhone Pro camera" },
  { label: "Old android phone", value: "early Android smartphone camera with aggressive noise reduction, soft detail, flattened contrast, and dull colors" },
  { label: "Security camera", value: "low-resolution security camera" },
  { label: "Webcam", value: "modern 1080p webcam" }
];
export const CAMERAS = createOptionsWithValues(RAW_CAMERAS, 'cameras');

const RAW_FOCAL_LENGTHS = [
  "8mm Fisheye", "14mm Ultra Wide", "24mm Wide Angle", "35mm Wide", "50mm Standard", 
  "85mm Portrait", "100mm Macro", "200mm Super Telephoto", "300mm Extreme Telephoto"
];
export const FOCAL_LENGTHS = createOptions(RAW_FOCAL_LENGTHS, 'focal-length');

const RAW_LENSES = [
  "Anamorphic Cinema Lens", "Catadioptric (Mirror) Lens", "Fisheye Lens", "Helios 44-2 Swirly Bokeh", 
  "Holga Style Lens", "Lensbaby / Selective Focus", "Macro Lens", "Petzval Portrait Lens", 
  "Soft-Focus Portrait Lens", "Tilt-Shift Lens", "Toy Plastic Lens", "Voigtländer Nokton 50mm f1"
];
export const LENSES = createOptions(RAW_LENSES, 'lenses');

const RAW_FILM_STOCKS = [
  "Agfa Vista", "Cinestill 50D", "Cinestill 800T", "Ektachrome E100", "Ektar 100", 
  "Fuji Acros 100", "Fuji Pro 400H", "Fuji Superia 400", "Fujicolor Pro", "Ilford Delta", 
  "Ilford HP5 Plus", "Ilford XP2 Super", "Kodachrome 64", "Kodak Gold 200", "Kodak Tri-X 400", 
  "Kodak UltraMax 400", "Kodak Vision3 500T", "Kodak Vision3 IMAX", "LomoChrome Metropolis", 
  "LomoChrome Turquoise", "Lomography Berlin Kino B&W", "Lomography Color Tiger", 
  "Lomography Lady Grey 400", "Lomography Lobster Redscale", "Lomography Purple", 
  "Portra 160", "Portra 400", "Portra 800", "Provia 100F", "Velvia 100"
];
export const FILM_STOCKS = createOptions(RAW_FILM_STOCKS, 'films');

const RAW_GENRES = [
  "Abstract", "Action Photography", "Aerial Photography", "Analog", "Architecture", "Astrophotography", "Automotive", "Beauty", 
  "Boudoir Photography", "Candid", "Cityscape Photography", "Conceptual Photography", "Documentary", "Double Exposure",
  "Drone Photography", "Editorial", "Environmental Portrait", "Event Photography", "Experimental", "Family Photography", 
  "Fine Art", "Food", "Glamour", "High Fashion", "Instant", "Landscape", "Large Format", "Lomo Style",
  "Macro", "Minimalist", "Modernist", "Nature Photography", "Newborn Photography", "Night Photography", "Paparazzi", 
  "Photojournalism", "Pictorialist", "Pinhole", "Portrait", "Product", "Reportage", "Seascape Photography", "Sports", "Still Life", "Street Fashion",
  "Street Photography", "Surrealism", "Tintype", "Travel Photography", "Underwater Photography", "Urban Exploration", 
  "Wedding Photography", "Wildlife"
];
export const GENRES = createOptions(RAW_GENRES, 'genres');

const RAW_PHOTOGRAPHERS = [
  "7th Era", "Alberto Seveso", "Alec Soth", "Alen Palander", "Alex Strohl", "Alex Webb", 
  "Alfred Stieglitz", "Ando Fuchs", "Andreas Gursky", "Anne Brigman", "Annie Leibovitz", 
  "Ansel Adams", "August Sander", "Barbara Kruger", "Benjamin Hardman", "Bernd and Hilla Becher", 
  "Bill Brandt", "Brandon Woelfel", "Bryan Schutmaat", "Chris Burkard", "Chris Friel", 
  "Chris Hau", "Cindy Sherman", "Daido Moriyama", "Daniel Schiffer", "David LaChapelle", 
  "David Yarrow", "Dorothea Lange", "Dylan Furst", "Elliott Erwitt", "Eugène Atget", 
  "Fan Ho", "Garry Winogrand", "George Hurrell", "Germaine Krull", "Gregory Crewdson", 
  "Guy Bourdin", "Hans Bellmer", "Helmut Newton", "Henri Cartier-Bresson", "Herb Ritts", 
  "Hiroshi Sugimoto", "Irene Rudnyk", "James Bidgood", "Jeff Wall", "Jerry Uelsmann", 
  "Jord Hammond", "Jordi Koalitic", "Juergen Teller", "Julia Trotti", "Kim Keever", 
  "László Moholy-Nagy", "Lee Friedlander", "Liam Wong", "Lotte Reiniger", "Man Ray", 
  "Mango Street", "Manny Ortiz", "Martin Schoeller", "Mary Ellen Mark", "Michael Kenna", 
  "Mickalene Thomas", "Miko Lagerstedt", "Miles Aldridge", "Misha Gordin", "Nadav Kander", 
  "Nan Goldin", "Nathan Wirth", "Nick Knight", "Northborders", "Oleg Oprisco", 
  "Paolo Roversi", "Peter Lindbergh", "Peter McKinnon", "Philip-Lorca diCorcia", "Platon", 
  "Rankin", "Réhahn", "Reuben Wu", "Richard Avedon", "Rinko Kawauchi", "Robert Capa", 
  "Robert Frank", "Saul Leiter", "Sebastião Salgado", "Sorelle Amore", "Stephen Shore", 
  "Steve McCurry", "Thomas Struth", "Tim Walker", "Todd Hido", "Tyler Shields", 
  "Vivian Maier", "W. Eugene Smith", "Walker Evans", "William Eggleston", "Wolfgang Tillmans", 
  "Yousuf Karsh", "Zanele Muholi"
];
export const PHOTOGRAPHERS = createOptions(RAW_PHOTOGRAPHERS, 'photographers');

export const PHOTOGRAPHER_LOOK_DETAILS: Record<string, string> = {
  "7th Era": "cinematic street, long exposure light glow, high contrast, moody haze",
  "Alberto Seveso": "ink in water textures, vibrant color clouds, surreal composites",
  "Alec Soth": "quiet Americana, soft natural light, subdued color, large format calm",
  "Alen Palander": "documentary feel, muted palette, natural light, teal and orange,candid moments",
  "Alex Strohl": "outdoor portraits, pastel tones, soft light, shallow depth of field",
  "Alex Webb": "layered street scenes, saturated color, strong shadows, complex framing",
  "Alfred Stieglitz": "early modernist, soft tonal range, atmospheric light, classic composition",
  "Ando Fuchs": "Black and White, shadow play, negative space, crushed blacks, overexposed whites, ominous framing, heavy image noise",
  "Andreas Gursky": "large scale, elevated perspective, crisp detail, repeating patterns in environments",
  "Anne Brigman": "pictorialist, soft focus, ethereal light, staged naturalism",
  "Annie Leibovitz": "editorial portraits, dramatic lighting, rich color, styled staging",
  "Ansel Adams": "Black and White, high contrast, crisp detail, grand landscapes",
  "August Sander": "Black and White, straight portraits, neutral light, formal composition, documentary tone",
  "Barbara Kruger": "graphic typography overlays, bold contrast, conceptual framing",
  "Benjamin Hardman": "muted arctic palette, soft light, minimalist landscapes, cold tones",
  "Bernd and Hilla Becher": "typologies, flat light, frontal framing, industrial grids",
  "Bill Brandt": "Black and White, high contrast, sculptural light, dramatic shadows",
  "Brandon Woelfel": "bokeh, dreamy glow, pastel color, light leaks",
  "Bryan Schutmaat": "western Americana, natural light, faded color, quiet portraits",
  "Chris Burkard": "adventure landscapes, golden light, crisp detail, cool tones",
  "Chris Friel": "moody landscapes, fog and mist, muted color, soft contrast, motion blur",
  "Chris Hau": "travel cityscapes, clean color, cinematic light, wide angles, long exposure light trails",
  "Cindy Sherman": "staged self portrait, cinematic lighting, character transformation",
  "Daido Moriyama": "Black and White, high grain, high contrast, raw street energy",
  "Daniel Schiffer": "product detail, hard light, glossy highlights, shallow depth of field",
  "David LaChapelle": "hyper saturated color, glossy lighting, surreal staging",
  "David Yarrow": "Black and White, dramatic wildlife, sharp detail, high contrast",
  "Dorothea Lange": "Black and White, documentary portrait, natural light, empathetic framing, soft grain",
  "Dylan Furst": "cinematic, blue and green desaturated tones, shallow depth of field",
  "Elliott Erwitt": "Black and White, candid humor, decisive moments, often contains a dog, simple framing",
  "EugÇùne Atget": "Black and White, early street scenes, soft light, quiet architecture, nostalgic tone",
  "Fan Ho": "Black and White, shafted light, silhouettes, strong geometry",
  "Garry Winogrand": "Black and White, gritty street, wide angle, candid chaos",
  "George Hurrell": "Black and White, Hollywood glamour, hard light, glossy highlights, classic portrait",
  "Germaine Krull": "Black and White, modernist angles, industrial subjects, stark contrast, dynamic framing",
  "Gregory Crewdson": "cinematic tableau, controlled lighting, suburban surrealism",
  "Guy Bourdin": "bold color, provocative fashion, strong shadows, saturated sets",
  "Hans Bellmer": "surreal dolls, unsettling staging, muted tones, stark lighting",
  "Helmut Newton": "Black and White, high fashion, hard light, provocative poses",
  "Henri Cartier-Bresson": "Black and White, decisive moment, candid street, balanced composition",
  "Herb Ritts": "clean fashion portrait, hard light, sculptural bodies, high contrast",
  "Hiroshi Sugimoto": "minimalist seascapes, long exposure, smooth tones, serene mood",
  "Irene Rudnyk": "natural light portrait, warm tones, soft shadows, lifestyle feel",
  "James Bidgood": "saturated color, theatrical sets, soft focus, surreal fantasy",
  "Jeff Wall": "large scale tableau, cinematic lighting, staged realism",
  "Jerry Uelsmann": "darkroom composites, surreal landscapes, Black and White",
  "Jord Hammond": "moody outdoor portrait, golden light, soft color, shallow depth",
  "Jordi Koalitic": "mobile photo tricks, strong symmetry, bright color, clean lines",
  "Juergen Teller": "flash snapshot, raw fashion, casual framing, harsh light",
  "Julia Trotti": "soft pastel portraits, natural light, airy tones, shallow depth",
  "Kim Keever": "abstract landscapes, pigment in water, soft focus, dreamy color",
  "LÇ­szlÇü Moholy-Nagy": "modernist abstraction, experimental angles, high contrast",
  "Lee Friedlander": "Black and White, busy frames, use of reflections, street layers",
  "Liam Wong": "subtle neon city night, rain reflections, pink and purple colors, moody haze",
  "Lotte Reiniger": "silhouette style, stark contrast, graphic shapes, theatrical framing",
  "Man Ray": "surreal experiments, black and white solarized look, studio abstraction, high contrast",
  "Mango Street": "clean fashion portrait, bright color, studio light, crisp detail",
  "Manny Ortiz": "off camera flash, studio portraits, outdoor fashion, warm skin tones, soft bokeh",
  "Martin Schoeller": "tight headshots, even light, high detail, neutral background",
  "Mary Ellen Mark": "documentary portrait, natural light, compassionate realism",
  "Michael Kenna": "Black and White, minimalist landscapes, long exposure, soft tones",
  "Mickalene Thomas": "bold patterns, rich color, staged portrait, mixed media feel",
  "Miko Lagerstedt": "moody landscapes, mist and fog, cool tones, soft contrast",
  "Miles Aldridge": "hyper saturated color, glossy fashion, stylized sets",
  "Misha Gordin": "surreal portrait, geometric framing, muted tones, staged minimalism",
  "Nadav Kander": "atmospheric portraits, muted palette, soft haze, cinematic light",
  "Nan Goldin": "intimate snapshot, low light, raw color, candid emotion",
  "Nathan Wirth": "moody cinematic portrait, shallow depth, soft light, subdued color",
  "Nick Knight": "experimental fashion, bold color, innovative lighting, bold styling",
  "Northborders": "mobile travel, vibrant color, moody skies, clean composition",
  "Oleg Oprisco": "fine art portrait, pastel tones, stylized props, surreal mood",
  "Paolo Roversi": "soft focus, romantic portrait, muted color, gentle light",
  "Peter Lindbergh": "Black and White, natural light, candid fashion, soft grain",
  "Peter McKinnon": "cinematic travel, teal and orange, crisp detail, moody contrast",
  "Philip-Lorca diCorcia": "street with flash, staged candid, high contrast, cinematic color",
  "Platon": "dramatic portrait, strong key light, textured skin, close framing",
  "Rankin": "glossy fashion, bold color, punchy contrast, studio light",
  "RÇ¸hahn": "travel portrait, rich color, natural light, cultural storytelling",
  "Reuben Wu": "light painted landscapes, night scenes, moody atmosphere",
  "Richard Avedon": "high key portraits, clean background, crisp detail, direct gaze",
  "Rinko Kawauchi": "soft light, pastel tones, poetic everyday, airy mood",
  "Robert Capa": "conflict reportage, gritty grain, high contrast, candid action",
  "Robert Frank": "Black and White, raw street, loose framing, grainy texture",
  "Saul Leiter": "color street, view through glass, reflections, muted palette, soft focus",
  "SebastiÇœo Salgado": "Black and White, dramatic light, high contrast, epic documentary",
  "Sorelle Amore": "adventure portrait, warm tones, golden light, candid feel",
  "Stephen Shore": "color documentary, everyday scenes, balanced composition, neutral light",
  "Steve McCurry": "rich color, vivid portraits, strong eyes, natural light",
  "Thomas Struth": "large format, groups of people, neutral light, architectural clarity, human scale",
  "Tim Walker": "whimsical fashion, surreal sets, soft light, rich color",
  "Todd Hido": "moody suburbs, night scenes, misty light, muted color",
  "Tyler Shields": "high contrast, bold staging, cinematic portrait, edgy tone",
  "Vivian Maier": "Black and White, street candid, sharp detail, reflective moments",
  "W. Eugene Smith": "documentary essay, dramatic light, deep shadows, emotive portraits",
  "Walker Evans": "straight documentary, neutral light, American vernacular, quiet tone",
  "William Eggleston": "color snapshot, everyday scenes, warm tones, simple framing",
  "Wolfgang Tillmans": "casual documentary, soft light, experimental abstraction, muted color",
  "Yousuf Karsh": "classic portrait, dramatic lighting, sculpted shadows, formal pose",
  "Zanele Muholi": "Black and White, high contrast, direct gaze, activist portrait"
};

const RAW_MOVIE_LOOKS = [
  "1917",
  "2001: A Space Odyssey",
  "Alien",
  "Amélie",
  "Annihilation",
  "Apocalypse Now",
  "Arrival",
  "Ash vs The Evil Dead",
  "Avatar",
  "Back to the Future",
  "Beetlejuice",
  "Ben-Hur (1959)",
  "Black Hawk Down",
  "Blade Runner",
  "Blade Runner 2049",
  "Casablanca",
  "Children of Men",
  "Chinatown",
  "City of God",
  "Cleopatra (1963)",
  "Close Encounters of the Third Kind",
  "Collateral",
  "Conan the Barbarian",
  "Crouching Tiger, Hidden Dragon",
  "Dark City",
  "Days of Heaven",
  "District 9",
  "Drive",
  "Dune",
  "Enter the Void",
  "Eraserhead",
  "Fight Club",
  "Full Metal Jacket",
  "Game of Thrones",
  "Ghostbusters",
  "Gladiator",
  "Godzilla Minus One",
  "Grease",
  "Halloween",
  "Hereditary",
  "Hook",
  "In the Mood for Love",
  "Jaws",
  "John Wick",
  "Joker",
  "Jurassic Park",
  "Kill Bill: Volume 1",
  "King Kong (1933)",
  "La La Land",
  "Lawrence of Arabia",
  "Life of Pi",
  "Lost in Translation",
  "Mad Max: Fury Road",
  "Metropolis (1927)",
  "Midsommar",
  "Minority Report",
  "Monty Python and the Holy Grail",
  "Moonlight",
  "No Country for Old Men",
  "Nope",
  "Nosferatu",
  "Notting Hill",
  "O Brother, Where Art Thou?",
  "Oblivion",
  "Pans Labyrinth",
  "Parasite",
  "Psycho",
  "Raiders of the Lost Ark",
  "Roma",
  "Saving Private Ryan",
  "Saw",
  "Sicario",
  "Sin City",
  "Skyfall",
  "Squid Game",
  "Stalker",
  "Star Wars: A New Hope",
  "Stranger Things",
  "Suspiria (1977)",
  "Terminator 2",
  "The Assassination of Jesse James",
  "The Bourne Ultimatum",
  "The Dark Crystal",
  "The Dark Knight",
  "The Exorcist",
  "The Godfather",
  "The Good, the Bad and the Ugly",
  "The Grand Budapest Hotel",
  "The Hurt Locker",
  "The Lighthouse",
  "The Lord of the Rings",
  "The Maltese Falcon",
  "The Matrix",
  "The NeverEnding Story",
  "The Revenant",
  "The Ring",
  "The Shape of Water",
  "The Shining",
  "The Ten Commandments",
  "The Texas Chain Saw Massacre",
  "The Thing",
  "The Witch",
  "There Will Be Blood",
  "Titanic",
  "Trainspotting",
  "Twilight",
  "Under the Skin",
  "Utopia",
  "Who Framed Roger Rabbit",
  "Zero Dark Thirty"
];
export const MOVIE_LOOKS = createOptions(RAW_MOVIE_LOOKS, 'movies');

export const MOVIE_LOOK_DETAILS: Record<string, string> = {
  "1917": "with muted khaki palette, smoky haze, soft contrast, subtle grain",
  "2001: A Space Odyssey": "with pristine retro-futurist design, minimalist symmetry and a clean 1960s large-format sci-fi look.",
  "Alien": "with cold industrial lighting, deep shadows, blue-green tint, heavy grain",
  "Amélie": "with warm amber and green tones, whimsical glow, soft contrast",
  "Annihilation": "with prismatic color shifts, dreamy haze, ethereal glow, soft focus",
  "Apocalypse Now": "with gritty 1970s film texture, heavy atmosphere and surreal war-odyssey mood.",
  "Arrival": "with desaturated neutrals, foggy diffusion, low contrast, moody lighting",
  "Ash vs The Evil Dead": "with heavy film grain, warm color tones, dark environments, faint green in light highlights and a 1970s look",
  "Avatar": "with rich cyan and teal glow, high saturation, crisp detail",
  "Back to the Future": "with 1980s color pop, clean contrast, subtle film grain",
  "Beetlejuice": "with high contrast, gothic shadows, saturated blacks, quirky color accents",
  "Ben-Hur (1959)": "with grand historical spectacle, monumental sets and a rich 1950s Technicolor epic look.",
  "Black Hawk Down": "with dusty desaturation, harsh sunlight, handheld grit, high contrast",
  "Blade Runner": "with subtle incidental neon lights, reflections, deep shadows and a 1980s film neo noir look. ",
  "Blade Runner 2049": "with amber desert tones, cyan shadows, clean contrast, minimal grain",
  "Casablanca": "with classic 1940s studio black-and-white glamour, soft facial key light and smoky atmosphere.",
  "Children of Men": "with naturalistic light, muted palette, handheld realism, soft contrast",
  "Chinatown": "with warm golden tones, sun-bleached highlights, soft contrast, film grain",
  "City of God": "with vibrant tropical colors, punchy contrast, sunlit warmth, lively saturation",
  "Cleopatra (1963)": "with lavish set design, opulent costuming and a 1960s classic Technicolor look.",
  "Close Encounters of the Third Kind": "with grounded 1970s suburban realism and luminous, practical-effects sci-fi spectacle.",
  "Collateral": "with green blue interior light tones contrasted with tungsten street lighting, crisp digital sharpness, high contrast",
  "Conan the Barbarian": "with warm earth tones, rugged grain, dramatic contrast, harsh light, with 1970s fantasy style",
  "Crouching Tiger, Hidden Dragon": "with lush greens, misty diffusion, soft contrast, elegant color",
  "Dark City": "with blue-gray highlights, heavy shadows, hard lighting, steam, smoke or mist",
  "Days of Heaven": "with golden hour glow, soft highlights, warm film grain, pastel skies",
  "District 9": "with gritty handheld look, desaturated palette, documentary realism, dust haze",
  "Drive": "with neon pink and blue, glossy highlights, night glow, soft contrast",
  "Dune": "with sandy amber palette, high contrast, atmospheric haze, minimal grain",
  "Enter the Void": "with psychedelic neon, intense saturation, glowing bloom, yellowish skin tones, high contrast",
  "Eraserhead": "with stark black and white, harsh lighting, heavy grain, deep shadows",
  "Fight Club": "with grimy greenish tint, low-key lighting, gritty grain, high contrast",
  "Full Metal Jacket": "with stark 1980s realism, cold institutional interiors and rigid, clinical framing.",
  "Game of Thrones": "with muted medieval palette, moody shadows, natural light, soft grain",
  "Ghostbusters": "with 1980s color pop, crisp contrast, light haze, mild grain",
  "Gladiator": "with gritty historical realism, warm dusty tones and dramatic early-2000s cinematic contrast.",
  "Godzilla Minus One": "with monochrome-leaning desaturation, smoky haze, high contrast, film grain",
  "Grease": "with bright pastel palette, glossy highlights, clean contrast, 1950s technicolor sheen",
  "Halloween": "with deep blacks, cool autumn tones, minimal light, suspenseful contrast",
  "Hereditary": "with dim interior lighting, brown-orange palette, heavy shadows, low contrast",
  "Hook": "with high saturation color, matte painted background plates, subtle film grain, gentle contrast.",
  "In the Mood for Love": "with rich reds and greens, soft diffusion, romantic glow, fine grain",
  "Jaws": "with bright coastal realism and a tense 1970s thriller film look with natural daylight photography.",
  "John Wick": "with neon-accented darkness, cool shadows, crisp contrast, sleek polish",
  "Joker": "with gritty texture, muted greens and yellows, heavy grain, harsh light",
  "Jurassic Park": "with naturalistic greens, humid haze, cinematic contrast, warm highlights",
  "Kill Bill: Volume 1": "with Technicolor palette with saturated primary colors, the lighting is high-contrast and hard, creating sharp, dramatic shadows. The image has a polished, glossy film look with fine grain, sharp focus, and a wide dynamic range.",
  "King Kong (1933)": "with vintage black-and-white adventure, classic studio lighting and old-Hollywood optical-effects texture.",
  "La La Land": "with technicolor palette, golden hour glow, clean contrast, dreamy polish",
  "Lawrence of Arabia": "with sweeping widescreen desert vistas and a crisp 1960s large-format epic film look.",
  "Life of Pi": "with vibrant jewel tones, luminous highlights, soft glow, clean contrast",
  "Lost in Translation": "with muted neon nights, soft grain, cool shadows, gentle contrast",
  "Mad Max: Fury Road": "with high-contrast desert palette, orange-teal split, dust haze, sharp detail",
  "Metropolis (1927)": "with high-contrast monochrome, dramatic lighting, crisp geometry, film grain",
  "Midsommar": "with bright daylight, pastel warmth, soft shadows, airy diffusion",
  "Minority Report": "with cool blue-gray tint, high contrast, soft bloom, slick polish",
  "Monty Python and the Holy Grail": "with scrappy low-budget period comedy and a raw 1970s film look.",
  "Moonlight": "with deep blues and purples, soft glow, rich shadows, fine grain",
  "No Country for Old Men": "with sun-bleached neutrals, stark shadows, dry contrast, subdued palette",
  "Nope": "with natural dusk tones, deep sky blues, crisp contrast, subtle grain",
  "Nosferatu": "with silent-era monochrome, heavy vignetting, stark shadows, film grain",
  "Notting Hill": "with soft naturalism, cosy London street photography and clean late-1990s rom-com polish.",
  "O Brother, Where Art Thou?": "with sepia and warm amber grade, dry contrast, dusty haze",
  "Oblivion": "with clean sci-fi gloss, cool blue palette, high clarity, soft bloom",
  "Pans Labyrinth": "by Guillermo Del Toro, with mossy greens, warm candlelight glow, soft contrast, fairy-tale haze",
  "Parasite": "with clean modern tones, neutral palette, crisp contrast, controlled lighting",
  "Psycho": "with sharp black and white, high contrast, hard light, film grain",
  "Raiders of the Lost Ark": "with punchy 1980s adventure cinematography, practical stunts energy and warm, dusty film texture.",
  "Roma": "with crisp black and white, soft natural light, fine grain, gentle contrast",
  "Saving Private Ryan": "with desaturated palette, high shutter sharpness, gritty, contrast",
  "Saw": "with cold greenish tint, gritty low-light realism and early-2000s horror-thriller film style.",
  "Sicario": "with dusty amber tones, harsh sunlight, high contrast, heat haze",
  "Sin City": "with stark black and white, extreme contrast, selective color accents",
  "Skyfall": "with rich teal shadows, glossy highlights, moody contrast, refined grain",
  "Squid Game": "with bright candy colors, clean contrast, flat lighting, graphic clarity",
  "Stalker": "with muted earth tones, low saturation, soft focus, misty atmosphere",
  "Star Wars: A New Hope": "with lived-in practical-effects texture and a classic late-1970s space-opera film look.",
  "Stranger Things": "with 1980s nostalgia grade, warm practical glow, soft grain, moody contrast, red tinted cloudyskies, particle effects",
  "Suspiria (1977)": "with saturated primary colors, heavy gels, surreal glow, high contrast",
  "Terminator 2": "with cool steel-blue palette, sharp contrast, cinematic shine, mild grain",
  "The Assassination of Jesse James": "with sepia-leaning tones, soft vignetting, gentle contrast, film grain",
  "The Bourne Ultimatum": "with handheld kinetic look, cool desaturation, sharp contrast, gritty grain",
  "The Dark Crystal": "with a DVD screengrab quality without text overlay, lo-fi appearance, rich earthy palette, soft diffusion, dim glow, fantasy haze",
  "The Dark Knight": "with cool urban tones, deep shadows, high contrast, crisp clarity",
  "The Exorcist": "with cold greenish tint, low-key lighting, heavy grain, stark contrast",
  "The Godfather": "with warm amber low-key lighting, deep shadows, soft film grain",
  "The Good, the Bad and the Ugly": "with sun-bleached Western landscapes, gritty close-ups and a classic 1960s spaghetti-western film look with Technicolor 3-Strip film.",
  "The Grand Budapest Hotel": "with pastel palette, symmetrical polish typical of Wes Anderson, soft contrast, playful tint",
  "The Hurt Locker": "with desaturated palette, harsh sunlight, handheld grit, dusty haze",
  "The Lighthouse": "with high-contrast black and white, harsh light, heavy grain, vignetting",
  "The Lord of the Rings": "with natural greens and golds, warm light, soft contrast, epic grade",
  "The Maltese Falcon": "with high-contrast 1940s black-and-white noir, hard shadows and smoky interiors.",
  "The Matrix": "with green tint, high contrast, cool shadows, glossy highlights",
  "The NeverEnding Story": "with a DVD screengrab quality without text overlay, lo-fi appearance, soft 1980s fantasy glow, warm palette, gentle contrast, film grain",
  "The Revenant": "with cold natural light, desaturated palette, crisp detail, soft grain",
  "The Ring": "with cold blue-gray palette, heavy shadows, damp haze, low saturation",
  "The Shape of Water": "with teal-green palette, soft glow, gentle contrast, dreamy haze",
  "The Shining": "with a 1970's film style with symmetrical compositions, use of patterns, deep reds, sharp contrast, clean clarity",
  "The Ten Commandments": "with grand biblical pageantry, saturated colours and a classic 1950s Technicolor studio-epic look.",
  "The Texas Chain Saw Massacre": "with raw 1970s film grain, sun-bleached tones, harsh contrast",
  "The Thing": "with cold blue lighting, deep shadows, gritty grain, high contrast and a 1980s film look",
  "The Witch": "with muted earth tones, natural candlelight, low contrast, fine grain",
  "There Will Be Blood": "with dusty sepia palette, high contrast, stark shadows, film grain",
  "Titanic": "with romantic period grandeur, warm luxurious interiors and polished 1990s cinematic realism.",
  "Trainspotting": "with gritty 1990s look, muted palette, harsh contrast, light grain",
  "Twilight": "with cool blue tint, soft diffusion, low contrast, dreamy haze",
  "Under the Skin": "with minimal palette, high contrast, cold light, clean negative space, surrealist composition",
  "Utopia": "a British TV Series, with bold colors, high contrast, clean lines, slight vignette",
  "Who Framed Roger Rabbit": "with bright 1940s noir palette, 2D loony toons style cartoon elements mixed with live action, sharp contrast, glossy highlights",
  "Zero Dark Thirty": "with desaturated realism, cool tones, handheld grit, low saturation"
};

const RAW_FILTERS = [
  "Black And White", "Black mist filter", "Bloom Glow", "Bokeh", "Chromatic Aberration", 
  "Collage Cutout", "Color Filter", "Cross Processed", "CRT Scanlines", "Cyanotype", 
  "Datamosh Glitch", "Desaturated Grunge", "Dreamy Haze", "Duotone", "Film Grain", 
  "Glitch Style", "Halftone", "HDR Tone Mapping", "Hologram Effect", "Infrared Filter", 
  "Kaleidoscope", "Lens Flare", "Light Leaks", "Liquify Smear", "Long Exposure", 
  "Mirror Split", "Motion Blur", "ND Filter", "Newspaper Print", 
  "Off-Register CMYK Print", "Orton Glow", "Overexposed", "Photocopy / Xerox", "Pixel Sort", 
  "Posterized", "Radial Blur", "Risograph Print", "Selective Color", "Sepia Tone", 
  "Soft Focus", "Solarized", "Split Tone", "Underexposed", "Vignette"
];
export const FILTERS = createOptions(RAW_FILTERS, 'filters');

export const ASPECT_RATIOS = ["1:1", "3:4", "4:3", "9:16", "16:9", "21:9"];
export const IMAGE_SIZES = ["1K", "2K", "4K"];

// --- Elements Tool (Visual Reference System) ---
// Order matters: this is the UI grid order and the preferred upload/reference order.
export const CHARACTER_ELEMENT_DEFS = {
  face: { id: 'character', label: 'Person Face', promptLabel: 'character reference' },
  outfit: { id: 'outfit', label: 'Outfit', promptLabel: 'clothing reference' },
  object: { id: 'object', label: 'Object', promptLabel: 'prop reference' },
} as const;

export const SCENE_ELEMENT_DEF = { id: 'scene', label: 'Scene', promptLabel: 'style reference' } as const;
