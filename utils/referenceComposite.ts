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

/** Tinggi setiap cell komposit — lebar mengikuti rasio asli gambar. */
const CELL_HEIGHT = 2560;
/** Jarak antar cell. */
const GAP = 16;
/** Lebar total maksimum; di atas ini komposit di-scale down proporsional. */
const MAX_WIDTH = 7680;
/** Output format — PNG lossless, detail maksimal (≤20MB limit ChatGPT/Gemini). */
const OUTPUT_MIME = 'image/png' as const;
const loadImage = (dataUrl: string): Promise<HTMLImageElement> => {
  const { promise, resolve, reject } = Promise.withResolvers<HTMLImageElement>();
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error('Could not load image for compositing'));
  img.src = dataUrl;
  return promise;
};

/**
 * Gabungkan 1-4 foto referensi jadi SATU dataUrl.
 * 1 input → dikembalikan apa adanya (tanpa re-encode). 2 → side-by-side.
 * 3 → grid 2 atas + 1 bawah (bawah centered). 4 → grid 2x2. Cell height 2560, gap 16,
 * latar putih, lebar total <= 7680 (scale proporsional). Output PNG lossless (~10-18MB, ≤20MB limit).
 * Melempar Error bila ada gambar yang gagal dimuat.
 */
export async function composeReferenceImages(dataUrls: string[]): Promise<string> {
  if (dataUrls.length === 0) {
    throw new Error('composeReferenceImages needs at least one image');
  }

  const images = await Promise.all(dataUrls.map(loadImage));
  const cellWidths = images.map((img) =>
    Math.round((img.naturalWidth * CELL_HEIGHT) / img.naturalHeight),
  );

  // Layout: 2 → satu baris; 3 → baris atas 2 cell + baris bawah 1 cell centered; 4 → grid 2x2.
  let layoutW: number;
  let layoutH: number;
  // Layout: 1 → single cell; 2 → satu baris; 3 → baris atas 2 + bawah 1 centered; 4 → grid 2x2.
  if (images.length === 1) {
    layoutW = cellWidths[0];
    layoutH = CELL_HEIGHT;
  } else if (images.length === 2) {
    layoutW = cellWidths[0] + GAP + cellWidths[1];
    layoutH = CELL_HEIGHT;
  } else if (images.length === 3) {
    const topW = cellWidths[0] + GAP + cellWidths[1];
    layoutW = Math.max(topW, cellWidths[2]);
    layoutH = CELL_HEIGHT + GAP + CELL_HEIGHT;
  } else if (images.length === 4) {
    const topW = cellWidths[0] + GAP + cellWidths[1];
    const bottomW = cellWidths[2] + GAP + cellWidths[3];
    layoutW = Math.max(topW, bottomW);
    layoutH = CELL_HEIGHT + GAP + CELL_HEIGHT;
  } else {
    // Fallback untuk >4: baris atas 2, sisanya centered seperti 3, tapi tetap handle
    const topW = cellWidths[0] + GAP + cellWidths[1];
    const bottomCount = images.length - 2;
    const bottomWs = cellWidths.slice(2);
    const bottomW = bottomWs.reduce((a, w, i) => a + w + (i ? GAP : 0), 0);
    layoutW = Math.max(topW, bottomW);
    layoutH = CELL_HEIGHT + GAP + CELL_HEIGHT;
  }

  const scale = layoutW > MAX_WIDTH ? MAX_WIDTH / layoutW : 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(layoutW * scale);
  canvas.height = Math.round(layoutH * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas context for compositing');
  if (scale !== 1) ctx.scale(scale, scale);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, layoutW, layoutH);

  if (images.length === 1) {
    drawCell(0, 0, 0);
  } else if (images.length === 2) {
    drawCell(0, 0, 0);
    drawCell(1, cellWidths[0] + GAP, 0);
  } else if (images.length === 3) {
    const topW = cellWidths[0] + GAP + cellWidths[1];
    const topX = Math.round((layoutW - topW) / 2);
    drawCell(0, topX, 0);
    drawCell(1, topX + cellWidths[0] + GAP, 0);
    const bottomX = Math.round((layoutW - cellWidths[2]) / 2);
    drawCell(2, bottomX, CELL_HEIGHT + GAP);
  } else if (images.length === 4) {
    const topW = cellWidths[0] + GAP + cellWidths[1];
    const bottomW = cellWidths[2] + GAP + cellWidths[3];
    const topX = Math.round((layoutW - topW) / 2);
    const bottomX = Math.round((layoutW - bottomW) / 2);
    drawCell(0, topX, 0);
    drawCell(1, topX + cellWidths[0] + GAP, 0);
    drawCell(2, bottomX, CELL_HEIGHT + GAP);
    drawCell(3, bottomX + cellWidths[2] + GAP, CELL_HEIGHT + GAP);
  } else {
    const topW = cellWidths[0] + GAP + cellWidths[1];
    const topX = Math.round((layoutW - topW) / 2);
    drawCell(0, topX, 0);
    drawCell(1, topX + cellWidths[0] + GAP, 0);
    // fallback: tumpuk sisa di baris bawah tanpa centering sempurna
    let x = Math.round((layoutW - cellWidths.slice(2).reduce((a, w, i) => a + w + (i ? GAP : 0), 0)) / 2);
    for (let i = 2; i < images.length; i++) {
      drawCell(i, x, CELL_HEIGHT + GAP);
      x += cellWidths[i] + GAP;
    }
  }

  return canvas.toDataURL(OUTPUT_MIME);
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
