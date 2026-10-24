import React, { lazy, Suspense, useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import Landing from "./V2Landing";
import { SiteProvider } from "./context";
import { Protected, Loading } from "./Access";
import { Brand } from "./ui";
import { api } from "./api";
const Library = lazy(() => import("./Library"));
const AuthPage = lazy(() =>
  import("./AccountPages").then((m) => ({ default: m.AuthPage })),
);
const CheckoutPage = lazy(() =>
  import("./AccountPages").then((m) => ({ default: m.CheckoutPage })),
);
const OrderPage = lazy(() =>
  import("./AccountPages").then((m) => ({ default: m.OrderPage })),
);
const MemberLayout = lazy(() =>
  import("./Members").then((m) => ({ default: m.MemberLayout })),
);
const ExplorePage = lazy(() =>
  import("./V2Members").then((m) => ({ default: m.ExploreV2 })),
);
const StudioPage = lazy(() => import("./V2Studio"));
const ViralPage = lazy(() =>
  import("./V2Members").then((m) => ({ default: m.ViralPage })),
);
const AccountPage = lazy(() =>
  import("./Settings").then((m) => ({ default: m.AccountPage })),
);
const AdminPage = lazy(() =>
  import("./Settings").then((m) => ({ default: m.AdminPage })),
);
function NavigationEffects() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title =
      pathname === "/"
        ? "Aichemy — Bangun Studio AI-mu. Rp149.000 Sekali Bayar."
        : `${pathname.includes("/studio") ? "Studio Kreatif" : pathname.includes("masuk") ? "Masuk" : pathname.includes("daftar") ? "Buat Akun" : "Ruang Kreatif"} — Aichemy`;
  }, [pathname]);
  return null;
}
function InformationPage({
  kind,
}: {
  kind: "ketentuan" | "privasi" | "kontak";
}) {
  const [settings, setSettings] = useState<{
    supportEmail: string;
    businessName: string;
  } | null>(null);
  useEffect(() => {
    api<{ supportEmail: string; businessName: string }>("/config")
      .then(setSettings)
      .catch(() => {});
  }, []);
  return (
    <div className="information-page container">
      <Brand />
      <Link to="/" className="back-link">
        ← Kembali ke beranda
      </Link>
      <div className="prose">
        <h1>
          {kind === "ketentuan"
            ? "Ketentuan akses"
            : kind === "privasi"
              ? "Privasi akunmu"
              : "Hubungi Aichemy"}
        </h1>
        {kind === "ketentuan" ? (
          <>
            <p>
              Aichemy adalah platform penyusun prompt visual. Pembelian
              Rp149.000 memberikan satu akun pribadi dengan hak akses tanpa
              tanggal kedaluwarsa dan pembaruan fitur Aichemy mendatang.
            </p>
            <h2>Yang termasuk</h2>
            <p>
              Studio prompt builder, pilihan visual, penyimpanan draft dan
              preset, studio pribadi, serta fitur sunting, salin, dan ekspor
              yang tersedia di platform.
            </p>
            <h2>Penggunaan akun</h2>
            <p>
              Akun digunakan secara pribadi. Jangan membagikan kredensial,
              menjual kembali akses akun, atau mengganggu layanan. Prompt dapat
              digunakan untuk pekerjaan pribadi maupun komersial, mengikuti
              ketentuan aplikasi gambar yang Anda gunakan.
            </p>
            <h2>Layanan gambar eksternal</h2>
            <p>
              Aichemy tidak menjalankan generator gambar. Akses, biaya,
              ketentuan, dan hasil dari aplikasi gambar AI berada di luar
              pembelian Aichemy. Gambar contoh merupakan ilustrasi; hasil tidak
              dijamin sama.
            </p>
            <h2>Pekerjaan komersial dan pemeriksaan hasil</h2>
            <p>
              Aichemy membantu menyusun prompt, bukan menjamin pesanan,
              pendapatan, kesamaan wajah, atau penerimaan foto oleh instansi.
              Pastikan izin foto referensi, lisensi generator, hak merek, serta
              kualitas hasil sebelum digunakan atau dijual. Ilustrasi virtual
              staging perlu dijelaskan sebagai ilustrasi, bukan kondisi properti
              sebenarnya.
            </p>
            <h2>Pembelian dan aktivasi</h2>
            <p>
              Akses aktif setelah pembayaran terverifikasi. Transaksi sandbox
              hanya untuk pengujian dan tidak memberikan lisensi produksi.
              Halaman ini tidak menawarkan garansi uang kembali.
            </p>
          </>
        ) : kind === "privasi" ? (
          <>
            <p>
              Aichemy menyimpan nama, email, sesi akun, status pembelian, draft,
              preset, favorit, dan studio kustom untuk menjalankan layanan serta
              sinkronisasi antarperangkat.
            </p>
            <h2>Penyimpanan dan pemrosesan</h2>
            <p>
              Data akun dan konten pengguna disimpan pada server Aichemy. Prompt
              diproses oleh backend Aichemy untuk menyusun teks. Aichemy tidak
              meneruskan prompt ke generator gambar eksternal.
            </p>
            <h2>Pembayaran</h2>
            <p>
              Pembayaran diproses melalui Midtrans. Aichemy menyimpan identitas
              pesanan, nominal, dan status transaksi. Kata sandi disimpan dalam
              bentuk hash melalui sistem autentikasi.
            </p>
            <h2>Preferensi browser</h2>
            <p>
              Cookie sesi digunakan untuk login. Tema, preferensi animasi, dan
              penanda impor dapat disimpan di browser. Data lama hanya diimpor
              ke akun setelah Anda memilih melakukannya.
            </p>
            <p>
              Untuk melindungi perubahan yang belum tersimpan, salinan sementara
              draft dapat disimpan di browser dengan penanda akun dan ID draft.
              Salinan dibersihkan setelah penyimpanan dikonfirmasi server. Foto
              referensi klien tidak diunggah ke Aichemy; lampirkan langsung di
              generator pilihan Anda sesuai izin penggunaannya.
            </p>
            <h2>Permintaan data</h2>
            <p>
              Hubungi pengelola untuk pertanyaan mengenai data, koreksi
              informasi, atau permintaan penghapusan akun.
            </p>
          </>
        ) : (
          <>
            <p>
              Untuk bantuan akun, akses, atau pembayaran, gunakan kontak
              pengelola berikut.
            </p>
            {settings?.businessName && <h2>{settings.businessName}</h2>}
            {settings?.supportEmail ? (
              <a
                className="button button-primary"
                href={`mailto:${settings.supportEmail}`}
              >
                {settings.supportEmail}
              </a>
            ) : (
              <p className="field-note">
                Kontak dukungan sedang disiapkan. Halaman ini akan menampilkan
                alamat resmi setelah konfigurasi produk selesai.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <SiteProvider>
        <NavigationEffects />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route
              path="/masuk"
              element={<AuthPage key="login" mode="login" />}
            />
            <Route
              path="/daftar"
              element={<AuthPage key="register" mode="register" />}
            />
            <Route
              path="/verifikasi-email"
              element={<AuthPage key="verify" mode="verify" />}
            />
            <Route
              path="/lupa-kata-sandi"
              element={<AuthPage key="forgot" mode="forgot" />}
            />
            <Route
              path="/atur-ulang-kata-sandi"
              element={<AuthPage key="reset" mode="reset" />}
            />
            <Route
              path="/checkout"
              element={
                <Protected>
                  <CheckoutPage />
                </Protected>
              }
            />
            <Route
              path="/pesanan/:id"
              element={
                <Protected>
                  <OrderPage />
                </Protected>
              }
            />
            <Route
              element={
                <Protected paid>
                  <MemberLayout />
                </Protected>
              }
            >
              <Route path="/app" element={<ExplorePage />} />
              <Route path="/app/viral" element={<ViralPage />} />
              <Route path="/app/studio/:id" element={<StudioPage />} />
              <Route path="/app/pustaka" element={<Library />} />
            </Route>
            <Route
              element={
                <Protected>
                  <MemberLayout />
                </Protected>
              }
            >
              <Route path="/akun" element={<AccountPage />} />
            </Route>
            <Route
              path="/admin"
              element={
                <Protected admin>
                  <MemberLayout />
                </Protected>
              }
            >
              <Route index element={<AdminPage />} />
            </Route>
            {(["ketentuan", "privasi", "kontak"] as const).map((kind) => (
              <Route
                key={kind}
                path={`/${kind}`}
                element={<InformationPage kind={kind} />}
              />
            ))}
            <Route
              path="*"
              element={
                <div className="empty-state">
                  <Brand />
                  <h1>Halaman ini belum ada.</h1>
                  <Link className="button button-primary" to="/">
                    Kembali ke Beranda
                  </Link>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </SiteProvider>
    </BrowserRouter>
  );
}
