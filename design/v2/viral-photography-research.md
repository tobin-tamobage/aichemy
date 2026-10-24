# Kurasi fotografi — 23 Oktober 2026

Koleksi aktif berisi 18 prompt fotografi yang ditulis Aichemy. Empat entri memakai acuan riset/teknik, dan 14 entri merupakan kreasi Aichemy. Tidak ada klaim bahwa prompt baru ini sudah viral atau akan menghasilkan jangkauan tertentu.

| Sumber primer | Temuan yang digunakan | Entri |
| --- | --- | --- |
| [Adobe Digital Insights, 8 Januari 2026](https://blog.adobe.com/en/publish/2026/01/08/halftone-nostalgia-more-2025-top-firefly-prompt-trends) | Analisis penggunaan Firefly sepanjang 2025 menunjukkan minat pada fotografi sinematik, grain, dan nostalgia. Ini data historis global, bukan ukuran tren Indonesia hari ini. | Potret vintage hangat; Potret sinematik senja |
| [Adobe Community, 10 September 2026](https://community.adobe.com/announcements-402/firefly-creative-challenge-slaying-the-retro-80-s-look-1641286/index1.html) | Tantangan komunitas untuk restyling potret studio era 80-an. Sinyal komunitas, tanpa klaim skala popularitas. | Studio retro 80-an |
| [Nikon — 10 Tips for Better Camera Panning](https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/10-tips-for-better-camera-panning) | Dasar teknik: subjek relatif tajam dan latar memperlihatkan gerakan, dengan kemungkinan bantuan flash. Referensi teknik, bukan bukti viralitas. | Jalanan motion blur |

Sumber diperiksa 23 Oktober 2026 waktu Melbourne. Tanggal terbit konten aplikasi adalah 22 Oktober 2026 UTC agar cocok dengan pemeriksaan publikasi server. Prompt Aichemy ditulis sendiri, tidak menyalin prompt dari halaman sumber.

Kreasi lain mengeksplorasi flash digicam, bias prisma, kaca hujan, sudut tinggi/rendah, hitam putih, blue hour, golden hour, neon, double exposure, bayangan jendela, splash produk, caustic air, dan potret editorial. Label **Kreasi Aichemy** menjelaskan asal kurasi, bukan popularitas yang terukur.

## Aset dan pemeliharaan

- Prompt anggota: `server/content/viral-prompts.json`; metadata publik serta sumber: `shared/viral-photography.ts`.
- Dua belas gambar baru dibuat dengan built-in image_gen. Sumber final, termasuk koreksi tas pada motion blur, tersimpan di `design/v2/viral-photography-originals/`. Enam contoh fotografis lama yang relevan digunakan kembali.
- Seluruh 18 pasangan sebelum/sesudah, gambar besar dan thumbnail, ada di `public/assets/v2/viral/photography-v2/`. Generasi, referensi, dan pemeriksaan per gambar dicatat di `viral-photography-jobs.json` dan `viral-assets.json`.
- Contoh memakai sumber sintetis yang sama, bukan pelanggan. Pada bidikan seluruh badan, celana/sepatu ditambahkan secara sintetis dari potret; panduan anggota merekomendasikan foto seluruh badan agar detail tersebut berasal dari pengguna.
- Figur, clay, diorama, papercut, karakter 3D, dan produk raksasa tidak masuk koleksi aktif. Konten serta provenance lama dipertahankan di `design/v2/archive/`; aset lamanya tidak dihapus.
- Untuk menyusun ulang output tanpa generasi baru: `node --import tsx scripts/prepare-viral-photography.ts`. Periksa gambar sebelum menetapkan `reviewed: true`; build tetap memeriksa seluruh pasangan.

Saat menambah konten, pertahankan medium fotografi, contoh yang cocok, panduan referensi, serta sumber dan tanggal untuk entri riset. Jangan memakai jumlah views atau label sedang viral tanpa bukti yang relevan.
