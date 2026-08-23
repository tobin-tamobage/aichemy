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
const CELL_HEIGHT = 1920;
/** Jarak antar cell. */
const GAP = 16;
/** Lebar total maksimum; di atas ini komposit di-scale down proporsional. */
const MAX_WIDTH = 5760;
/** Output — PNG lossless, efficient max ~8MB untuk paste Gemini/ChatGPT (limit 20MB, tapi 8MB paling cepat & detail penuh). */
const OUTPUT_MIME = 'image/png' as const;
const MAX_BYTES = 8 * 1024 * 1024;
const loadImage = (dataUrl: string): Promise<HTMLImageElement> => {
  const { promise, resolve, reject } = Promise.withResolvers<HTMLImageElement>();
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error('Could not load image for compositing'));
  img.src = dataUrl;
  return promise;
};

/**
 * Gabungkan 1-4 foto referensi jadi SATU dataUrl dengan label agar AI paham.
 * 1 input → single cell 1920px. 2 → side-by-side. 3 → grid 2+1. 4 → grid 2x2. Cell height 1920, gap 16,
 * latar putih, lebar total <= 5760 (scale proporsional). Output PNG lossless efficient max ~8MB (≤20MB limit, optimal untuk paste).
 * Jika hasil >8MB, otomatis scale down proporsional agar tetap ≤8MB. Label digambar di bawah tiap cell (bar hitam + teks putih).
 * Melempar Error bila ada gambar yang gagal dimuat.
 */
export type CompositeSource = { dataUrl: string; label: string };
export async function composeReferenceImages(sources: Array<string | CompositeSource>): Promise<string> {
  const dataUrls: string[] = sources.map(s => typeof s === 'string' ? s : s.dataUrl);
  const labels: string[] = sources.map(s => typeof s === 'string' ? '' : s.label);
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

  const drawCell = (index: number, x: number, y: number) => {
    ctx.drawImage(images[index], x, y, cellWidths[index], CELL_HEIGHT);
    const label = labels[index];
    if (label) {
      const barH = 72;
      const pad = 12;
      // bar hitam semi-transparan di bawah cell
      ctx.fillStyle = 'rgba(0,0,0,0.82)';
      ctx.fillRect(x, y + CELL_HEIGHT - barH, cellWidths[index], barH);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Inter, Nunito, sans-serif';
      ctx.textBaseline = 'middle';
      // potong jika terlalu panjang
      let text = label;
      const maxW = cellWidths[index] - pad * 2;
      while (ctx.measureText(text).width > maxW && text.length > 4) text = text.slice(0, -2) + '…';
      ctx.fillText(text, x + pad, y + CELL_HEIGHT - barH / 2);
    }
  };

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
  // PNG 1920 biasanya ~6-8MB untuk 4 gambar. Jika >8MB (foto sangat detail), scale down proporsional agar tetap ≤8MB (efficient max).
  let dataUrl = canvas.toDataURL(OUTPUT_MIME);
  let blob = dataURLToBlob(dataUrl);
  if (blob.size > MAX_BYTES) {
    const ratio = Math.sqrt(MAX_BYTES / blob.size) * 0.97;
    const tmp = document.createElement('canvas');
    tmp.width = Math.max(1, Math.round(canvas.width * ratio));
    tmp.height = Math.max(1, Math.round(canvas.height * ratio));
    const tCtx = tmp.getContext('2d');
    if (tCtx) {
      tCtx.drawImage(canvas, 0, 0, tmp.width, tmp.height);
      dataUrl = tmp.toDataURL(OUTPUT_MIME);
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
