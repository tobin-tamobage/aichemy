# Hasil verifikasi implementasi — 18 Oktober 2026

Versi ini siap ditinjau secara lokal. Ini bukan konfirmasi aplikasi telah dipasang di VPS atau transaksi merchant telah aktif.

## Lulus

- `npm run typecheck` dan `npm run build`: frontend, prerender landing Indonesia, serta bundle backend berhasil. Halaman anggota dipisah menjadi chunk; font dan aset disimpan sendiri.
- Smoke test terhadap hasil build yang disajikan melalui Vite Preview berhasil membuka landing dan navigasi login beserta chunk lazy; tidak ada `pageerror` yang teramati.
- `node scripts/check-recipe-prompts.mjs`: sepuluh recipe bawaan dan cabang marketing, relight, portrait, dan logo.
- `npm test`: 14 pengujian unit/API dengan PostgreSQL khusus test. Mencakup akses belum berbayar, isolasi akun, nominal, signature palsu, webhook ganda/terlambat, pemisahan lingkungan, checkout ulang, template duplikat, undo/redo, dan validasi input.
- Verifikasi email, reset sekali pakai, pencabutan sesi setelah reset, login kata sandi baru, dan logout benar-benar menggunakan Better Auth, database, serta SMTP Mailpit. Tidak memanggil layanan email produksi.
- `npm run test:browser`: 5 perjalanan Chromium mencakup login, starter, refresh draft, suntingan manual, acak gaya, undo, preset dengan deskripsi terlindungi, clipboard, unduhan, serta buat/sunting/hapus studio pribadi.
- 20 baseline screenshot: landing terang/gelap, login, dan studio terang/gelap pada 390, 768, 1280, dan 1440 piksel. Tidak ditemukan overflow horizontal pada pemeriksaan otomatis. Screenshot login memakai tema terang; kedua tema landing/studio diperiksa.
- Axe tidak menemukan pelanggaran pada aturan WCAG 2 A/AA, 2.1 AA, dan 2.2 AA yang dijalankan untuk landing, login, serta studio produk. Tema gelap landing/studio, fokus Tab/Shift+Tab dialog, Escape, pemulihan fokus, label, dan reduced motion diperiksa. Ini bukan sertifikasi aksesibilitas seluruh aplikasi.
- `npm audit --omit=dev`: 0 kerentanan yang dilaporkan pada dependensi produksi. Lockfile diperiksa melalui `npm ci --ignore-scripts --dry-run`.
- Logo pilihan pengguna diterapkan pada navigasi, akun, studio, favicon, dan gambar berbagi. Sepuluh contoh studio serta sumber tambahan relight disimpan dengan aset asli dan catatan generasi.

## Batas pengujian dan pekerjaan sebelum penjualan

- Semua interaksi gateway pada pengujian otomatis memakai respons tiruan. **Midtrans sandbox merchant sungguhan belum diuji**, karena kunci merchant belum tersedia. Tidak ada pembelian atau lisensi produksi yang dibuat.
- Docker Engine tidak tersedia pada mesin pengerjaan ini. Dockerfile, Compose, Caddy, health check, dan panduan backup telah disiapkan; build container, HTTPS/domain, backup/restore aktual, dan deployment VPS masih perlu diuji di host tujuan.
- Isi domain, identitas pengelola, email dukungan, SMTP produksi, admin, secret acak, dan kredensial merchant sebelum mengaktifkan penjualan. Akun uji sandbox tidak berlaku di mode produksi. Tidak ada backdoor login atau pembukaan akses dari status browser/localStorage.
- Audit dependensi pengembangan masih melaporkan 7 advisory dari rantai alat yang ada. Dependensi produksi bersih pada pemeriksaan ini; jangan menjalankan upgrade mayor paksa tanpa menguji kompatibilitas.
- Ada peringatan introspeksi Better Auth tentang tipe `rateLimit.lastRequest` (`number`/PostgreSQL `int8`); migrasi dan pengujian sesi/rate limit tetap berfungsi. Pantau kompatibilitas pada pembaruan Better Auth.
- Belum dilakukan penelitian dengan pengguna pemula, pengukuran konversi/waktu ke prompt pertama, audit VoiceOver/NVDA manual menyeluruh, atau benchmark perangkat fisik berkinerja rendah. Lakukan sebelum menyatakan seluruh penerimaan usability/performa selesai.
- Frasa bawaan prompt tetap Inggris. Deskripsi bebas dipertahankan apa adanya; antarmuka menjelaskan bahwa pengguna perlu menulis deskripsi Inggris untuk hasil sepenuhnya Inggris. Tidak ada layanan terjemahan AI tersembunyi.

Snapshot regresi berada di `tests/browser/product.spec.ts-snapshots/`. Screenshot tinjauan lokal berada di `artifacts/screenshots/` (diabaikan Git). Instruksi operasional ada pada [panduan deployment](README.md).
