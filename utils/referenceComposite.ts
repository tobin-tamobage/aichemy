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
const CELL_HEIGHT = 1024;
/** Jarak antar cell. */
const GAP = 16;
/** Lebar total maksimum; di atas ini komposit di-scale down proporsional. */
const MAX_WIDTH = 2048;

const loadImage = (dataUrl: string): Promise<HTMLImageElement> => {
  const { promise, resolve, reject } = Promise.withResolvers<HTMLImageElement>();
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error('Could not load image for compositing'));
  img.src = dataUrl;
  return promise;
};

/**
 * Gabungkan 1-3 foto referensi jadi SATU dataUrl.
 * 1 input → dikembalikan apa adanya (tanpa re-encode). 2 → side-by-side.
 * 3 → grid 2 atas + 1 bawah (bawah centered). Cell height 1024, gap 16,
 * latar putih, lebar total <= 2048 (scale proporsional). Output JPEG q=0.92.
 * Melempar Error bila ada gambar yang gagal dimuat.
 */
export async function composeReferenceImages(dataUrls: string[]): Promise<string> {
  if (dataUrls.length === 0) {
    throw new Error('composeReferenceImages needs at least one image');
  }
  if (dataUrls.length === 1) {
    return dataUrls[0];
  }

  const images = await Promise.all(dataUrls.map(loadImage));
  const cellWidths = images.map((img) =>
    Math.round((img.naturalWidth * CELL_HEIGHT) / img.naturalHeight),
  );

  // Layout: 2 → satu baris; 3 → baris atas 2 cell + baris bawah 1 cell centered.
  let layoutW: number;
  let layoutH: number;
  if (images.length === 2) {
    layoutW = cellWidths[0] + GAP + cellWidths[1];
    layoutH = CELL_HEIGHT;
  } else {
    const topW = cellWidths[0] + GAP + cellWidths[1];
    layoutW = Math.max(topW, cellWidths[2]);
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

  const drawCell = (index: number, x: number, y: number) => {
    ctx.drawImage(images[index], x, y, cellWidths[index], CELL_HEIGHT);
  };

  if (images.length === 2) {
    drawCell(0, 0, 0);
    drawCell(1, cellWidths[0] + GAP, 0);
  } else {
    const topW = cellWidths[0] + GAP + cellWidths[1];
    const topX = Math.round((layoutW - topW) / 2);
    drawCell(0, topX, 0);
    drawCell(1, topX + cellWidths[0] + GAP, 0);
    const bottomX = Math.round((layoutW - cellWidths[2]) / 2);
    drawCell(2, bottomX, CELL_HEIGHT + GAP);
  }

  return canvas.toDataURL('image/jpeg', 0.92);
}
