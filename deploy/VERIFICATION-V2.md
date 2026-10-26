# Verifikasi Aichemy V2 — 23 Oktober 2026

## Penghapusan demo landing — 26 Oktober 2026

Demo “Coba sebelum membeli” dan seluruh tautan Coba Gratis pada landing aktif diganti dengan Cara Kerja bergambar. HTML prerender diverifikasi tanpa `#demo`, tautan ke demo, atau klaim coba gratis. Tes browser memblokir endpoint demo dan memastikan tidak ada permintaan yang dibuat. Semua gambar pengganti termuat; section diperiksa pada 390/768/1280/1440 px dan kedua tema, termasuk Axe dan fokus navigasi HP. Typecheck, build, 39 tes unit/API dan 16 perjalanan browser lulus tanpa pembaruan baseline screenshot. Builder anggota, pembayaran dan akun tidak diubah. Ini verifikasi lokal, bukan konfirmasi deploy/push produksi.

## Perluasan Racik terbaru

- Jumlah gaya awal tetap 218 di 18 jasa; fokus perubahan adalah pilihan di dalam setiap pengaturan. Ada 2.496 entri pilihan lintas jasa, tidak menghitung “Tanpa” dan bukan 2.496 opsi unik.
- Hewan: 12 konsep, 36 tempat/warna latar, 12 posisi, 12 cahaya, 10 tambahan, 12 panduan bingkai, 16 arah warna, 12 rasio dan 3 tingkat ketajaman latar. Profesional: 48 latar, 20 pose, 8 ekspresi. Prewedding: 48 latar, 20 pose pasangan. Banner/Konten: 24 layout, 12 tipografi, 12 area tulisan. Logo: 32 bentuk dan 32 palet. Fashion: 17 konsep; Beauty/Creator/Wisuda/Keluarga: 12 konsep masing-masing. Angka tidak memasukkan opt-out.
- 126 foto baru dibuat melalui imagegen bawaan, ditinjau melalui tujuh contact sheet, dan tersimpan bersama prompt/referensi/manifest di `design/expanded-options`. Tidak ada API generasi baru pada produk. Aset fotografis dihasilkan per pilihan, bukan semua kombinasi. Perbandingan merupakan ilustrasi AI, bukan pengukuran optik atau rekonstruksi akurat ruangan nyata.
- Pengaturan baru dimulai dari “Tanpa”, galeri dibatasi 24 kartu awal, pilihan aktif didahulukan, pencarian beberapa kata/filter tersedia, dan label diperbesar agar nyaman dibaca di HP.
- Typecheck, 39 tes unit/API, validasi 126 foto baru beserta aset lama, build/prerender/server, sepuluh recipe V1, dan 16 perjalanan browser pada build lokal lulus tanpa pembaruan baseline screenshot. Galeri baru diuji di 390/768/1280/1440 px dan dua tema: cari beberapa kata, muat lagi, penerapan pilihan, fokus kembali, Tanpa, refresh, serta Axe. Uji lama tetap mencakup prompt manual, undo/preset, ekspor, keyboard dan reduced motion. Pemeriksaan gambar fotografis baru memastikan thumbnail benar-benar dimuat.
- Lab landing hasil build pada 390×844, 4 Mbps, latency 80 ms dan CPU slowdown 4×: satu pengukuran dingin mencatat LCP 900 ms dan CLS 0,000089, tanpa error atau overflow pada delapan kombinasi ukuran/tema. Bukti di `artifacts/expanded-options/performance/metrics.json`. Ini bukan data lapangan atau skor Lighthouse, dan bukan jaminan performa produksi.

Laporan di bawah dipertahankan sebagai histori; angka katalog dan hasil tes terdahulu bukan hasil run terbaru.

Hasil siap ditinjau lokal. Ini bukan konfirmasi deployment VPS atau aktivasi merchant produksi. Catatan ini melengkapi laporan V1 tanggal 18 Oktober.

## Pemeriksaan yang lulus

- `npm run typecheck`, `npm test`, dan `npm run build` lulus. Build mencakup validasi aset, frontend, prerender landing Indonesia, dan bundle Fastify.
- 30 pengujian unit/API memakai PostgreSQL khusus test. Mencakup 11 jasa, 176 gaya awal, 33 studi kasus, setiap opsi aktif, pilihan wedding khusus pasangan, latar formal/produk/makanan, aturan referensi, perlindungan data, salinan V1, status publikasi koleksi, jumlah katalog penawaran, tiga contoh omzet, rate limit, origin, entitlement, kepemilikan, dan urutan autosave. Helper simulasi lama tetap diuji untuk kompatibilitas, tetapi kalkulator tidak ditampilkan di landing.
- Regresi pembayaran, nominal server, webhook palsu/ganda/terlambat, pemisahan lingkungan, checkout ulang, serta email verifikasi/reset/logout tetap lulus. Email benar-benar diproses Better Auth dan Mailpit. Gateway pembayaran pada test **ditiru**, bukan transaksi merchant.
- `node scripts/check-recipe-prompts.mjs` lulus untuk sepuluh recipe V1 dan cabangnya.
- Dua belas perjalanan browser Chromium lulus pada server pengembangan lokal, pada run akhir tanpa pembaruan snapshot. Build produksi lulus terpisah. Alur mencakup login, checkout, demo publik yang dapat disalin, galeri, contoh omzet tanpa formulir, penyimpanan, undo, refresh, clipboard, ekspor, migrasi V1, studio kustom, dan koleksi fotografi. Tambahan: 16 sampul gaya, kegagalan pratinjau di HP, prompt manual yang tetap bisa disalin, CTA akun aktif, serta fokus/Escape menu HP. Fixture email menunggu pengiriman Mailpit selesai agar tidak bergantung pada timing.
- 68 baseline screenshot mencakup 390, 768, 1280, dan 1440 px: landing, katalog, builder V1/V2, galeri, koleksi, dan dialog dalam dua tema; login diuji dalam tema terang. Tidak ditemukan overflow horizontal pada pemeriksaan otomatis.
- Panduan anggota baru diringkas menjadi satu kartu foto yang dapat diklik. Setelah perapian terakhir ini, pemeriksaan katalog/builder/keyboard di empat ukuran dan dua tema dijalankan kembali dan lulus tanpa pembaruan snapshot.
- Pemeriksaan Axe pada aturan WCAG 2 A/AA, 2.1 AA, dan 2.2 AA yang dijalankan tidak melaporkan pelanggaran pada landing/login, studio produk V1, builder formal V2, serta dialog koleksi. Escape, Tab/Shift+Tab, pemulihan fokus, range keyboard, dan reduced motion diperiksa. Ini bukan sertifikasi aksesibilitas seluruh aplikasi.
- Pemindaian bundle frontend dan HTML hasil prerender tidak menemukan teks lengkap 18 prompt fotografi premium. Endpoint koleksi dan studio tetap memerlukan sesi serta entitlement aktif. Konten ilustrasi lama tidak dilayani API; metadata riset dan kategori tidak membuka prompt lengkap.

## Aset dan peninjauan visual

- 33 pasangan contoh jasa dan 18 pasangan fotografi memakai sumber sintetis/orisinal yang konsisten. Dua belas contoh fotografi dibuat baru dengan built-in image_gen; enam foto lama yang relevan digunakan kembali. Bukan hasil pelanggan atau bukti penghasilan. Sumber riset, batas interpretasi, dan provenance dicatat di `design/v2/viral-photography-research.md`.
- 413 visual pilihan pada manifest dan 494 aset opsi wajib yang dipetakan ke builder (termasuk gaya awal, ilustrasi subjek, serta contoh kasus yang dipakai ulang). Seri wedding memakai pasangan konsisten; seri latar produk/makanan mempertahankan objek. Latar polos memakai swatch CSS presisi; rasio/layout/palet/tipografi memakai preview deterministik.
- Total 1.430 WebP final/thumbnail di folder V2, sekitar 52 MiB, termasuk aset lama yang tetap dipertahankan. Sumber PNG, prompt, referensi, batas crop atlas, dan catatan tinjauan disimpan di `design/v2/`.
- Gate build benar-benar menolak aset yang hilang atau belum ditinjau selama produksi. Hasil akhirnya memvalidasi nama/pemetaan, sumber, status tinjauan boolean, format/dimensi, serta alpha transparan asli.
- Peninjauan membandingkan wajah, pakaian, pasangan, bentuk botol/tas/gelas, porsi makanan, dan geometri ruang. Foto listing dikoreksi agar furnitur asli tetap ada; Virtual Staging diberi konteks berbeda. Pembanding lensa menggunakan subjek/framing/ruang konsisten, bukan klaim simulasi optik terukur.
- Hero mobile menampilkan perbandingan karya lebih awal; CTA harga tetap tersedia. Logo pilihan pengguna dipertahankan dan gambar berbagi versi baru memakai positioning studio AI.

## Pengamatan performa hasil build

Pengamatan terakhir pada build putaran kelima: **LCP 624 ms, CLS 0,000089**, tanpa `pageerror`, respons HTTP gagal, maupun overflow pada delapan kombinasi lebar/tema yang diperiksa. Ini satu sampel laboratorium lokal pada 23 Oktober 2026, bukan hasil lapangan.

Metode: satu cold run Chromium 390×844, 4 Mbps unduh / 1 Mbps unggah, latensi 80 ms, CPU slowdown 4×. Ini pengukuran laboratorium lokal, **bukan** data pengguna lapangan, Lighthouse, benchmark HP fisik, atau jaminan performa produksi. Nilai dapat berubah menurut host, jaringan, perangkat, dan cache.

Hasil terbaru dan screenshot lokal ada di `artifacts/conversion-review/performance/metrics.json` serta folder yang sama (diabaikan Git). Hasil sebelumnya tetap disimpan di `artifacts/v2-review/`. Untuk mengulang pada hasil build, jalankan di terminal terpisah:

```sh
APP_URL=http://localhost:4173 PORT=3002 node --env-file=.env dist-server/index.mjs
AICHEMY_API_PROXY=http://localhost:3002 npm run preview -- --port 4173
PERFORMANCE_OUTPUT=artifacts/conversion-review/performance node scripts/measure-v2.mjs
BROWSER_TEST_BASE_URL=http://localhost:4173 npm run test:browser
```

Gunakan database pengembangan lokal; jangan mengarahkan fixture browser ke database produksi. Semua akun fixture menggunakan alamat sintetis dan dibersihkan setelah test.

## Lima putaran kritik dan perbaikan

Audit dilakukan sendiri dari sudut calon pembeli, UI/UX, kesederhanaan, marketing, serta fungsi/kepercayaan. Ini bukan panel penilai independen atau pengukuran konversi.

| Putaran | Fokus perbaikan | Skor checklist internal |
| --- | --- | --- |
| 1 | Penawaran, bahasa sederhana, angka katalog, tiga contoh omzet | 64/100 |
| 2 | Hero tunggal responsif, teks lebih terbaca, galeri lebih ringkas | 80/100 |
| 3 | Sampul gaya, jalur mulai, salin demo, kesiapan prompt | 88/100 |
| 4 | Fokus keyboard, menu HP, tombol sentuh, kegagalan jaringan | 92/100 |
| 5 | CTA sesuai tujuan klik, metadata, gambar berbagi, regresi akhir | 96/100 |

Rubrik berisi 25 kriteria, masing-masing empat poin. Dua puluh empat terpenuhi; empat poin belum diberikan karena belum ada peserta pemula sungguhan yang menjalankan alur tanpa bantuan. Skor ini tidak membuktikan keberhasilan penjualan. Kriteria, kritik, perubahan, dan lokasi bukti: `design/v2/conversion-review.json`. Screenshot tiap keadaan tersimpan di `artifacts/conversion-review/`.

## Yang belum dibuktikan dan wajib sebelum penjualan

- **Midtrans sandbox merchant sungguhan belum diuji** karena kredensial belum tersedia. Tidak ada transaksi/lisensi produksi yang dibuat.
- Docker Engine tidak tersedia di mesin pengerjaan. Build container, HTTPS/domain, backup/restore aktual, dan deployment VPS perlu diverifikasi pada host tujuan. Sumber aset disertakan pada build stage agar gate provenance tetap berjalan; tidak disalin ke image web/runtime akhir.
- Lengkapi domain, identitas penjual, kontak dukungan, SMTP produksi, admin, secret, dan kredensial merchant. Pastikan `APP_URL` HTTPS masuk saat build untuk canonical/Open Graph absolut.
- Belum ada penelitian dengan pemula sungguhan, pengukuran konversi, audit VoiceOver/NVDA manual menyeluruh, atau benchmark perangkat fisik. Jangan mengklaim seluruh usability/aksesibilitas/performa telah tersertifikasi.
- Contoh gambar adalah ilustrasi AI. Hasil generator, hak komersial, konsistensi wajah, ketepatan teks, penerimaan foto formal, serta keberhasilan penjualan tetap perlu dinilai pengguna. Tidak ada janji penghasilan.
- Peringatan introspeksi Better Auth tentang `rateLimit.lastRequest` (`number`/PostgreSQL `int8`) masih muncul; pengujian sesi dan pembatasan permintaan tetap lulus. Pantau saat memperbarui dependensi.

Panduan operasi serta pembaruan konten: [V2](V2.md) dan [deployment VPS](README.md).
# Pembaruan katalog 3 — 23 Oktober 2026

Bagian ini melengkapi hasil V2 sebelumnya di bawah; bukan aktivasi produksi.

- Katalog sekarang **18 jasa / 218 gaya**: tujuh jasa baru adalah fashion, beauty, perhiasan, konten influencer, wisuda, keluarga, dan hewan. Ada 154 pengaturan dengan total 1.567 entri pilihan lintas jasa, **termasuk pilihan berulang dan opt-out, bukan 1.567 opsi unik**. Semua 218 gaya diuji tanpa teks wajib.
- Setiap field katalog 3 memiliki **Tanpa arahan tambahan**. Nilainya tersimpan dan benar-benar menghilangkan instruksi field, bukan mengembalikan default. Pencarian jasa/alias, kelompok jasa, pencarian pengaturan, dan filter Diatur/Tidak diatur tersedia.
- 50 aset portofolio aktif terdiri dari 49 hasil imagegen dan satu sumber karakter sintetis dari pemilik. Sembilan referensi pose tambahan dibuat dan ditinjau. Setelah umpan balik tentang kepala miring/tangan di pipi, **28 foto utama dibuat ulang** memakai bank pose. Versi pertama tidak dihapus. Semua memakai built-in imagegen, bukan API generasi berbayar dalam aplikasi.
- Wajah influencer digunakan pada portret utama, fashion, beauty, kreator, dan wisuda. Keluarga/hewan/produk memakai subjek relevan. Contoh baru bukan pasangan before/after acak; foto sumber pasangan yang dibuat terpisah tidak dipasarkan sebagai transformasi yang mempertahankan identitas.
- Sumber, prompt final, pose, thumbnail WebP, dan tinjauan ada pada `design/v3/portfolio-assets.json`, `design/v3/pose-bank/manifest.json`, serta berkas jobs/reviews di direktori yang sama. Build menolak aset hilang atau belum ditinjau. Alpha cutout baru diverifikasi mempunyai rentang 0–255.
- Draft katalog 1/2 tetap pada versinya. Duplikasi ke katalog 3 eksplisit; prompt manual, detail, dan sumber lama tetap dijaga. Favorit legacy tidak melebar ke jasa baru yang memakai recipe dasar sama. Simpan gaya memakai kontrol terkini, bukan hasil pratinjau lama ketika jaringan gagal.
- Landing menampilkan jasa baru dalam urutan utama. Kartu jasa tanpa studi kasus before/after membuka portofolio enam gambar, bukan filter kosong. Warna polos produk/makanan tidak memakai potret manusia sebagai preview.
- Pemeriksaan terakhir: typecheck, build/prerender/server, validasi aset, **37 tes unit/API**, sepuluh recipe V1, serta **15 perjalanan browser** pada build lokal. Screenshot pada 390/768/1280/1440 dan dua tema mencakup portofolio baru. Axe, fokus dialog, keyboard, reduced motion, clipboard, opt-out, serta pemulihan manual diperiksa. Regresi pembayaran tetap memakai penyedia tiruan.
- Lab landing hasil build: LCP **684 ms**, CLS **0,000089**, 14 resource pada pengukuran awal, tanpa error atau overflow di delapan kombinasi lebar/tema. Metode dan batas pengukuran sama dengan laporan sebelumnya; bukti di `artifacts/expansion-review/performance/metrics.json`. Bukan data perangkat/pengguna nyata atau jaminan produksi.

Sepuluh putaran self-review dari sudut pembeli, nilai fitur, kesederhanaan, kontrol, semantik prompt, kepercayaan, data lama, HP, keragaman pose, dan regresi selesai. Skor checklist internal **9,5/10 (19 dari 20 kriteria)**. Setengah poin tidak diberikan karena pengujian dengan calon pembeli/pemula Indonesia sungguhan belum dilakukan. Ini bukan rating independen atau jaminan kepuasan/penghasilan. Riset primer, kritik, perubahan per putaran, rubrik, dan bukti: `design/v3/research-and-review.json`.

Semua batas merchant, domain/SMTP, VPS, dan uji pengguna nyata yang dicatat di bawah tetap berlaku. Tidak ada transaksi atau deployment produksi baru.
