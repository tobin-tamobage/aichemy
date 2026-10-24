# Menjalankan Aichemy di VPS

Aplikasi terdiri dari frontend React yang diprarender, API Node/Fastify, PostgreSQL 17, dan Caddy untuk HTTPS. Akun memakai Better Auth dan email melalui SMTP. Pembayaran default **sandbox**.

Panduan katalog 11 jasa, mesin prompt V2, kompatibilitas draft lama, aset visual, dan pembaruan Prompt Viral tersedia di [panduan V2](V2.md).
Hasil pengujian serta batas kesiapan produksi dicatat pada [verifikasi V2](VERIFICATION-V2.md).

## Pengembangan lokal

Gunakan Node 24, PostgreSQL, dan Mailpit. Salin `.env.example` menjadi `.env`, isi secret acak, dan buat database sesuai `DATABASE_URL`.

```sh
npm ci
npm run db:migrate
npm run dev:server
npm run dev
```

Jalankan Mailpit pada port SMTP 1025 dan web 8025, atau `docker compose --profile dev up mailpit`. Email verifikasi dan reset akan tampil pada Mailpit. Tidak ada akun berbayar bawaan maupun akses melalui localStorage. Admin ditentukan melalui `ADMIN_EMAILS`; daftar dan verifikasi akun tersebut sebelum mengelola akses.

## VPS

1. Pasang Docker Engine dan Compose. Arahkan DNS domain ke VPS dan buka port 80/443.
2. Salin `.env.example` menjadi `.env`. Isi `DOMAIN`, `APP_URL=https://domain-anda`, `POSTGRES_PASSWORD`, secret autentikasi acak minimal 32 karakter, identitas pengelola, email dukungan, SMTP sungguhan, dan daftar email admin. Gunakan password database berbentuk URL-safe, misalnya hex.
3. Jalankan `docker compose up -d --build`. Migrasi berjalan sebelum API dinyalakan. Caddy mengurus sertifikat HTTPS. Database tidak memiliki port publik.
4. Buka `/api/health`, uji pendaftaran, pengiriman email, verifikasi, reset kata sandi, dan login. Daftar sebagai email admin yang sudah dikonfigurasi. Panel `/admin` menyediakan akses manual yang dicatat di audit pada lingkungan saat ini.

## Midtrans sandbox

Isi `MIDTRANS_SERVER_KEY` dan `MIDTRANS_CLIENT_KEY` dari dashboard sandbox. Tetapkan URL notifikasi Midtrans ke `https://domain-anda/api/payments/webhook` dan URL selesai ke halaman pesanan aplikasi. Checkout dibuat oleh backend dengan nominal **149000 IDR**. Redirect browser tidak mengaktifkan akses; backend memeriksa webhook dan mengambil status otoritatif melalui API Midtrans.

Tanpa kunci, checkout menampilkan pesan belum dikonfigurasi. Pengujian otomatis menggunakan respons penyedia tiruan dan tidak membuktikan koneksi merchant sungguhan.

## Aktivasi produksi

Ganti `PAYMENT_MODE=production`, gunakan pasangan kunci merchant produksi, lalu rebuild/restart. Hak akses dan pesanan sandbox tidak berlaku pada mode produksi. Periksa ulang harga, kontak, identitas pengelola, kebijakan, pengiriman email, HTTPS, dan URL webhook sebelum membuka penjualan. Source tidak mengandung kunci merchant.

## Backup dan pemulihan

Database menggunakan volume persisten. Contoh backup yang dijalankan dari direktori proyek:

```sh
umask 077
docker compose exec -T db pg_dump -U aichemy -d aichemy --format=custom > aichemy-backup.dump
```

Simpan backup di lokasi terpisah. Uji pemulihan ke database pengujian baru sebelum mengganti database aktif. Gunakan `pg_restore --no-owner` dengan akun database yang sesuai; jangan menimpa database aktif tanpa backup dan rencana pemulihan.

Periksa layanan melalui `docker compose ps`, `docker compose logs --tail=100 api`, dan `/api/health`. Jangan membagikan file `.env`, cookie sesi, tautan reset, ataupun dump database. Migrasi berikutnya harus ditinjau dan dicadangkan sebelum diterapkan.

## Pengujian

Salin `.env.test.example` menjadi `.env.test`, buat database terpisah bernama `aichemy_test`, dan sesuaikan koneksinya. Contoh kunci Midtrans di file tersebut sengaja tidak valid; semua panggilan gateway dalam test ditiru, bukan dikirim ke merchant. Jalankan migrasi pada database itu dengan `node --env-file=.env.test --import tsx server/migrate.ts`, lalu `npm test`. Test tidak boleh diarahkan ke database pengembangan/produksi. Mailpit diperlukan untuk test email.

`npm run typecheck`, `npm run build`, dan `node scripts/check-recipe-prompts.mjs` memeriksa kedua aplikasi serta mesin sepuluh studio. Test browser memerlukan frontend dan API lokal berjalan.

Untuk browser: jalankan `npx playwright install chromium`, lalu `npm run test:browser`. Fixture membuat akun uji, memverifikasi email melalui Mailpit, memberikan entitlement sandbox melalui database lokal, dan membersihkan akun uji setelah selesai. Ini bukan bukti pembayaran merchant. Snapshot dibuat di macOS/Chromium; platform lain perlu baseline yang ditinjau pada platform tersebut.

Label studio memakai kamus ID di `server/locales/id.json`; nilai dan frasa prompt tetap stabil. `npx tsx scripts/generate-locales.ts` menambahkan ID baru tanpa mengganti terjemahan yang telah disunting. Tinjau terjemahan baru sebelum rilis. Aset asli dan prompt generasi disimpan pada `design/`; `node scripts/prepare-brand.mjs` menyiapkan varian web.

Rujukan integrasi: [Better Auth + Fastify](https://better-auth.com/docs/integrations/fastify), [notifikasi pembayaran Midtrans](https://docs.midtrans.com/docs/https-notification-webhooks).
