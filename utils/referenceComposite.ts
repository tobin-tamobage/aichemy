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
/** Jarak antar cell — 0 = tanpa celah putih, full 1xN. */
const GAP = 0;
/** Lebar total maksimum; di atas ini komposit di-scale down proporsional. */
const MAX_WIDTH = 7680;
/** Output — PNG lossless, efficient max ~8MB untuk paste Gemini/ChatGPT. */
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
 * Gabungkan 1-4 foto referensi jadi SATU dataUrl horizontal 1×N tanpa celah putih.
 * 1→1 cell, 2→1×2, 3→1×3, 4→1×4. Cell height 1920, tanpa gap (full), lebar total <=7680.
 * Output PNG lossless efficient max ~8MB. Jika >8MB, scale down proporsional.
 * Label digambar di bawah tiap cell (bar hitam + teks putih) agar AI paham face/outfit/scene.
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

  // Layout: 1×N horizontal tanpa celah putih — full strip, AI pisah via label.
  let layoutW: number;
  let layoutH: number;
  if (images.length === 1) {
    layoutW = cellWidths[0];
    layoutH = CELL_HEIGHT;
  } else if (images.length === 2) {
    layoutW = cellWidths[0] + cellWidths[1];
    layoutH = CELL_HEIGHT;
  } else if (images.length === 3) {
    layoutW = cellWidths[0] + cellWidths[1] + cellWidths[2];
    layoutH = CELL_HEIGHT;
  } else if (images.length === 4) {
    layoutW = cellWidths[0] + cellWidths[1] + cellWidths[2] + cellWidths[3];
    layoutH = CELL_HEIGHT;
  } else {
    // >4: single row juga
    layoutW = cellWidths.reduce((a, w) => a + w, 0);
    layoutH = CELL_HEIGHT;
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
    drawCell(1, cellWidths[0], 0);
  } else if (images.length === 3) {
    drawCell(0, 0, 0);
    drawCell(1, cellWidths[0], 0);
    drawCell(2, cellWidths[0] + cellWidths[1], 0);
  } else if (images.length === 4) {
    drawCell(0, 0, 0);
    drawCell(1, cellWidths[0], 0);
    drawCell(2, cellWidths[0] + cellWidths[1], 0);
    drawCell(3, cellWidths[0] + cellWidths[1] + cellWidths[2], 0);
  } else {
    let x = 0;
    for (let i = 0; i < images.length; i++) {
      drawCell(i, x, 0);
      x += cellWidths[i];
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
