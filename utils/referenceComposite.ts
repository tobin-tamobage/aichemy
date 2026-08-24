/**
 * Reference photo compositing — gabungkan 1-3 foto referensi jadi SATU dataUrl
 * saat upload (bukan saat copy), sehingga state tetap satu dataUrl dan format
 * project v3 tidak berubah. Lihat docs/superpowers/specs/2026-08-22-reference-composite-copy-design.md
 */

/** Convert a `data:image/...;base64,...` URL into a Blob for clipboard image+text copy. */
export function dataURLToBlob(dataUrl: string): Blob {
  const comma = dataUrl.indexOf(',');
  const header = comma >= 0 ? dataUrl.slice(0, comma) : '';
  const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  const mime = /^data:([^;]+);/.exec(header)?.[1] ?? 'image/png';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/** 2×2 grid — AI-friendly: gap putih jelas, label warna kategori + sub-hint Keep…, jarak tegas. */
const GAP = 24;
const MAX_CANVAS = 2500;
const LABEL_H = 108;
const FOOTER_H = 56;
const OUTPUT_MIME = 'image/webp' as const;
const OUTPUT_QUALITY = 0.92;
const loadImage = (dataUrl: string): Promise<HTMLImageElement> => {
  const { promise, resolve, reject } = Promise.withResolvers<HTMLImageElement>();
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error('Could not load image for compositing'));
  img.src = dataUrl;
  return promise;
};

/**
 * Gabungkan 1-4 foto referensi jadi SATU dataUrl grid 2×2 — AI mudah bedakan per referensi.
 * - 1 foto: 1 cell besar (2500×2500) label atas
 * - 2 foto: 1 baris 2 kolom (2500×~1300) gap 24
 * - 3-4 foto: 2 baris 2 kolom (2500×2500) gap 24
 * Tiap cell: label bar solid putih di ATAS (bukan overlay di gambar) font 44px bold, kategori jelas,
 * jarak putih antar cell, border tipis, gambar object-contain center (tidak crop), footer instruksi bawah.
 * WebP 0.92 cap 2500, fallback turunkan quality/scale jika >8MB.
 */
export type CompositeSource = { dataUrl: string; label: string };
export async function composeReferenceImages(
  sources: Array<string | CompositeSource>,
): Promise<string> {
  const dataUrls: string[] = sources.map((s) => (typeof s === 'string' ? s : s.dataUrl));
  const labels: string[] = sources.map((s) => (typeof s === 'string' ? '' : s.label));
  if (dataUrls.length === 0) throw new Error('composeReferenceImages needs at least one image');
  const n = Math.min(dataUrls.length, 4);
  const images = await Promise.all(dataUrls.slice(0, 4).map(loadImage));

  // Grid geometry
  const cols = n === 1 ? 1 : 2;
  const rows = n <= 2 ? 1 : 2;
  // Canvas size — 1 image: full 2500 square besar; 2: 1 baris; 3-4: 2x2 penuh
  const canvasW = MAX_CANVAS;
  const canvasH = n === 1 ? MAX_CANVAS : rows === 1 ? Math.round(MAX_CANVAS * 0.52) + FOOTER_H : MAX_CANVAS;
  const gridW = canvasW;
  const gridH = canvasH - FOOTER_H;
  const cellW = cols === 1 ? gridW : Math.floor((gridW - GAP) / 2);
  const cellH = rows === 1 ? gridH : Math.floor((gridH - GAP) / 2);
  const imgAreaH = cellH - LABEL_H;

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas context for compositing');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasW, canvasH);

  const drawCell = (idx: number, col: number, row: number) => {
    if (idx >= n) return;
    const x = col * (cellW + GAP);
    const y = row * (cellH + GAP);
    const raw = labels[idx] || `Image ${idx + 1}`;
    const catRaw = raw.includes('-') ? raw.split('-').pop()!.trim().toUpperCase() : raw.toUpperCase();
    // Warna + sub-hint per kategori
    const catKey = catRaw.toLowerCase();
    const isFace = catKey.includes('face');
    const isOutfit = catKey.includes('outfit') || catKey.includes('cloth');
    const isObject = catKey.includes('object') || catKey.includes('product');
    const isScene = catKey.includes('scene') || catKey.includes('background');
    const accent = isFace ? '#2563eb' : isOutfit ? '#d97706' : isObject ? '#059669' : isScene ? '#7c3aed' : '#111827';
    const subHint = isFace ? 'Keep face identity' : isOutfit ? 'Keep clothing' : isObject ? 'Keep object' : isScene ? 'Keep background' : 'Keep as reference';
    const labelText = catRaw; // e.g. OUTFIT
    // Cell background + border warna kategori
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, cellW, cellH);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.strokeRect(x + 2, y + 2, cellW - 4, cellH - 4);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);
    // Label bar solid putih, garis bawah warna kategori
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, cellW, LABEL_H);
    ctx.fillStyle = accent;
    ctx.fillRect(x, y + LABEL_H - 4, cellW, 4);
    // Badge bulat warna kategori
    const badgeR = 26;
    const badgeX = x + 20 + badgeR;
    const badgeY = y + 36;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Inter, Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${idx + 1}`, badgeX, badgeY + 1);
    // Label utama besar
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 40px Inter, Nunito, sans-serif';
    ctx.textAlign = 'left';
    let text = labelText;
    const maxW = cellW - (badgeX + badgeR + 16) - 16;
    while (ctx.measureText(text).width > maxW && text.length > 4) text = text.slice(0, -2) + '…';
    ctx.fillText(text, badgeX + badgeR + 14, y + 38);
    // Sub-hint kecil abu
    ctx.fillStyle = '#64748b';
    ctx.font = '600 20px Inter, Nunito, sans-serif';
    ctx.fillText(subHint, badgeX + badgeR + 14, y + 68);
    // Image area — object-contain center, tidak crop
    const img = images[idx];
    const scale = Math.min(cellW / img.naturalWidth, imgAreaH / img.naturalHeight) * 0.94;
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = x + (cellW - dw) / 2;
    const dy = y + LABEL_H + (imgAreaH - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  };
  if (n === 1) {
    drawCell(0, 0, 0);
  } else if (n === 2) {
    drawCell(0, 0, 0);
    drawCell(1, 1, 0);
  } else if (n === 3) {
    drawCell(0, 0, 0);
    drawCell(1, 1, 0);
    drawCell(2, 0, 1);
    // cell (1,1) kosong — biarkan putih
  } else {
    drawCell(0, 0, 0);
    drawCell(1, 1, 0);
    drawCell(2, 0, 1);
    drawCell(3, 1, 1);
  }

  // Footer instruksi — bantu AI jangan campur referensi
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, canvasH - FOOTER_H, canvasW, FOOTER_H);
  ctx.fillStyle = '#e5e7eb';
  ctx.fillRect(0, canvasH - FOOTER_H, canvasW, 2);
  ctx.fillStyle = '#64748b';
  ctx.font = '700 22px Inter, Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const footerText = n === 1
    ? 'REFERENCE  —  use as labeled, keep identity'
    : `REFERENCE SHEET  ·  ${n} IMAGES  ·  each labeled — do not mix, keep separate`;
  ctx.fillText(footerText, canvasW / 2, canvasH - FOOTER_H / 2 + 1);

  // Encode WebP 0.92, fallback quality/scale jika >8MB
  let quality = OUTPUT_QUALITY;
  let dataUrl = canvas.toDataURL(OUTPUT_MIME, quality);
  let blob = dataURLToBlob(dataUrl);
  while (blob.size > MAX_BYTES && quality > 0.7) {
    quality = Math.max(0.7, quality - 0.06);
    dataUrl = canvas.toDataURL(OUTPUT_MIME, quality);
    blob = dataURLToBlob(dataUrl);
    if (quality <= 0.7) break;
  }
  if (blob.size > MAX_BYTES) {
    const ratio = Math.sqrt(MAX_BYTES / blob.size) * 0.97;
    const tmp = document.createElement('canvas');
    tmp.width = Math.max(1, Math.round(canvas.width * ratio));
    tmp.height = Math.max(1, Math.round(canvas.height * ratio));
    const tCtx = tmp.getContext('2d');
    if (tCtx) {
      tCtx.drawImage(canvas, 0, 0, tmp.width, tmp.height);
      dataUrl = tmp.toDataURL(OUTPUT_MIME, quality);
    }
  }
  return dataUrl;
}


/**
 * Clipboard web (Chrome/Safari) HANYA menerima `image/png` di clipboard.write —
 * blob WebP/JPEG ditolak dengan TypeError. Transcode via canvas ke PNG bila
 * perlu; PNG dikembalikan apa adanya. Melempar bila gambar tidak bisa dimuat.
 */
export async function toClipboardImageBlob(blob: Blob): Promise<Blob> {
  if (blob.type === 'image/png') return blob;
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create canvas context for clipboard image');
    ctx.drawImage(img, 0, 0);
    const { promise, resolve, reject } = Promise.withResolvers<Blob>();
    canvas.toBlob(
      (png) => (png ? resolve(png) : reject(new Error('PNG encoding failed'))),
      'image/png',
    );
    return promise;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Download a dataUrl as a file — for WebP full-detail download. */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Generate filename for composite download — e.g. aichemy-reference-2026-08-23.webp */
export function compositeFilename(prefix = 'aichemy-reference'): string {
  const d = new Date().toISOString().slice(0, 10);
  return `${prefix}-${d}.webp`;
}
