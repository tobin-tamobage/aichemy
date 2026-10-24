import sharp from "sharp";
// Deterministic brand layout, not a generated photograph. Photo sources are archived in design/v2.
const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="630" fill="#faf8f5"/><text x="126" y="92" font-family="sans-serif" font-size="38" font-weight="bold" letter-spacing="-2" fill="#272437">aichemy.</text><text x="60" y="166" font-family="sans-serif" font-size="13" font-weight="bold" letter-spacing="2" fill="#5a43df">PILIH GAMBARNYA. RACIK PROMPT-NYA.</text><text x="57" y="257" font-family="sans-serif" font-size="65" font-weight="bold" letter-spacing="-3" fill="#272437">Bangun Studio</text><text x="57" y="331" font-family="sans-serif" font-size="65" font-weight="bold" letter-spacing="-3" fill="#5a43df">AI-mu sendiri.</text><text x="60" y="393" font-family="sans-serif" font-size="24" fill="#655e70">Pilih gambar. Racik gayanya.</text><text x="60" y="429" font-family="sans-serif" font-size="24" fill="#655e70">Salin instruksi untuk aplikasi AI.</text><rect x="60" y="475" width="538" height="69" rx="12" fill="#5a43df"/><text x="85" y="519" font-family="sans-serif" font-size="25" font-weight="bold" fill="white">Rp149.000 · Sekali bayar, pakai terus</text><text x="60" y="589" font-family="sans-serif" font-size="15" fill="#655e70">Aichemy menyusun prompt. Aplikasi gambar AI terpisah.</text><rect x="716" y="65" width="424" height="493" rx="18" fill="#e9e5ef"/></svg>`;
const images = [];
for (const [side, x] of [
  ["before", 728],
  ["after", 928],
])
  images.push({
    input: await sharp(
      `public/assets/v3/portfolio/${side === "before" ? "influencer-source" : "professional-profile-v2"}.webp`,
    )
      .resize(200, 457, { fit: "cover" })
      .toBuffer(),
    left: x,
    top: 77,
  });
const labels = Buffer.from(
  `<svg width="400" height="457" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="15" width="78" height="27" rx="4" fill="#fffef5"/><text x="26" y="33" font-family="sans-serif" font-size="12" fill="#272437">Foto awal</text><rect x="267" y="15" width="119" height="27" rx="4" fill="#272437"/><text x="278" y="33" font-family="sans-serif" font-size="12" fill="white">Contoh hasil AI</text><path d="M200 0V457" stroke="white" stroke-width="3"/><circle cx="200" cy="228" r="17" fill="#fffef5"/><text x="190" y="234" font-family="sans-serif" font-size="20" fill="#272437">↔</text></svg>`,
);
await sharp(Buffer.from(svg))
  .composite([
    {
      input: await sharp("public/assets/brand/mark-192.png")
        .resize(48, 48)
        .toBuffer(),
      left: 60,
      top: 51,
    },
    ...images,
    { input: labels, left: 728, top: 77 },
  ])
  .png()
  .toFile("public/assets/brand/social-v4.png");
console.log("Social card V4: public/assets/brand/social-v4.png");
