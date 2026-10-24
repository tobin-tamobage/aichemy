import React, { useState, useEffect } from "react";
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Brand, ExampleImage, ThemeToggle } from "./ui";
import { useSite } from "./context";
import { api, post } from "./api";
import { authClient } from "./authentication";
import { PRICE_LABEL, type Order } from "../shared/product";
import { VIRAL_TEASERS } from "../shared/viral-photography";
export function AuthPage({
  mode,
}: {
  mode: "login" | "register" | "forgot" | "reset" | "verify";
}) {
  const { user, refresh } = useSite();
  const navigate = useNavigate();
  const [query] = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(query.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const titles = {
    login: "Ide bagusmu menunggu.",
    register: "Ruang untuk semua idemu.",
    forgot: "Kita bantu kamu kembali.",
    reset: "Mulai dengan kata sandi baru.",
    verify: "Tinggal satu langkah lagi.",
  };
  const subtitles = {
    login: "Masuk dan lanjutkan racikan kreatifmu.",
    register: "Buat akun, lalu aktifkan akses lifetime Aichemy.",
    forgot:
      "Masukkan email akunmu. Kami akan mengirim tautan pengaturan ulang.",
    reset: "Gunakan minimal 10 karakter agar akunmu tetap aman.",
    verify: "Buka email dari Aichemy dan klik tautan verifikasi.",
  };
  if (user?.active && (mode === "login" || mode === "register"))
    return <Navigate to="/app" replace />;
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      if (mode === "login") {
        const response = await authClient.signIn.email({ email, password });
        if (response.error) {
          if (response.error.code === "EMAIL_NOT_VERIFIED") {
            navigate(`/verifikasi-email?email=${encodeURIComponent(email)}`);
            return;
          }
          throw new Error(
            "Email atau kata sandi belum sesuai. Periksa kembali.",
          );
        }
        await refresh();
        navigate("/app");
      } else if (mode === "register") {
        const response = await authClient.signUp.email({
          name,
          email,
          password,
          callbackURL: "/checkout",
        });
        if (response.error)
          throw new Error(
            response.error.code?.includes("EXISTS")
              ? "Email sudah terdaftar. Silakan masuk atau atur ulang kata sandi."
              : "Akun belum dapat dibuat. Periksa isian atau coba lagi.",
          );
        navigate(`/verifikasi-email?email=${encodeURIComponent(email)}`);
      } else if (mode === "forgot") {
        const response = await authClient.requestPasswordReset({
          email,
          redirectTo: "/atur-ulang-kata-sandi",
        });
        if (response.error)
          throw new Error("Tautan belum dapat dikirim. Silakan coba lagi.");
        setSuccess(
          "Jika email terdaftar, tautan pengaturan ulang akan dikirim. Periksa juga folder spam.",
        );
      } else if (mode === "reset") {
        const token = query.get("token");
        if (!token)
          throw new Error(
            "Tautan tidak lengkap. Minta tautan pengaturan ulang yang baru.",
          );
        const response = await authClient.resetPassword({
          newPassword: password,
          token,
        });
        if (response.error)
          throw new Error(
            "Tautan kedaluwarsa atau tidak valid. Minta tautan baru.",
          );
        setSuccess("Kata sandi berhasil diubah. Silakan masuk kembali.");
      } else {
        const response = await authClient.sendVerificationEmail({
          email,
          callbackURL: "/checkout",
        });
        if (response.error)
          throw new Error(
            "Email verifikasi belum dapat dikirim. Coba lagi sebentar.",
          );
        setSuccess(
          "Email verifikasi dikirim ulang. Periksa kotak masuk dan spam.",
        );
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <div className="auth-main">
        <div className="auth-top">
          <Brand />
          <ThemeToggle />
        </div>
        <div className="auth-form-wrap">
          <Link to="/" className="back-link">
            <ArrowLeft size={16} />
            Kembali ke beranda
          </Link>
          <div className="eyebrow">
            {mode === "register"
              ? "MULAI PERJALANAN KREATIFMU"
              : "SELAMAT DATANG DI AICHEMY"}
          </div>
          <h1>{titles[mode]}</h1>
          <p className="auth-subtitle">{subtitles[mode]}</p>
          {mode === "verify" && (
            <div className="mail-illustration">
              <Mail size={36} />
              <span>✦</span>
            </div>
          )}
          <form onSubmit={submit} className="auth-form">
            {mode === "register" && (
              <label>
                Nama kamu
                <input
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder="Nama yang ingin kami sapa"
                />
              </label>
            )}
            {mode !== "reset" && (
              <label>
                Email
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="kamu@email.com"
                />
              </label>
            )}
            {["login", "register", "reset"].includes(mode) && (
              <label>
                Kata sandi
                <div className="password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={mode === "login" ? 1 : 10}
                    maxLength={128}
                    placeholder={
                      mode === "login"
                        ? "Kata sandi akunmu"
                        : "Minimal 10 karakter"
                    }
                  />
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={
                      showPassword
                        ? "Sembunyikan kata sandi"
                        : "Tampilkan kata sandi"
                    }
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
            )}
            {mode === "register" && (
              <label className="checkbox-label">
                <input type="checkbox" required />
                <span>
                  Saya menyetujui{" "}
                  <Link to="/ketentuan" target="_blank">
                    ketentuan akses
                  </Link>{" "}
                  dan{" "}
                  <Link to="/privasi" target="_blank">
                    kebijakan privasi
                  </Link>{" "}
                  Aichemy.
                </span>
              </label>
            )}
            {mode === "login" && (
              <Link to="/lupa-kata-sandi" className="forgot-link">
                Lupa kata sandi?
              </Link>
            )}
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            {success && (
              <p role="status" className="form-success">
                {success}
              </p>
            )}
            <button
              className="button button-primary full-width"
              disabled={busy}
            >
              {busy
                ? "Sebentar ya…"
                : {
                    login: "Masuk ke Aichemy",
                    register: "Buat Akun",
                    forgot: "Kirim Tautan",
                    reset: "Simpan Kata Sandi",
                    verify: "Kirim Ulang Verifikasi",
                  }[mode]}
              <ArrowRight size={17} />
            </button>
          </form>
          {mode === "login" && (
            <p className="auth-switch">
              Belum punya akun? <Link to="/daftar">Mulai di sini</Link>
            </p>
          )}
          {mode === "register" && (
            <>
              <p className="auth-switch">
                Sudah punya akun? <Link to="/masuk">Masuk</Link>
              </p>
              <p className="auth-price">
                <ShieldCheck size={15} />
                {PRICE_LABEL} sekali bayar · Akses aktif setelah pembayaran
              </p>
            </>
          )}
          {(mode === "forgot" || mode === "reset") && (
            <Link className="auth-switch" to="/masuk">
              Kembali ke halaman masuk
            </Link>
          )}
          {mode === "verify" && (
            <button
              className="button button-secondary full-width"
              onClick={async () => {
                await refresh();
                navigate("/checkout");
              }}
            >
              Saya sudah verifikasi <ArrowRight size={17} />
            </button>
          )}
        </div>
        <p className="auth-footer">Racik prompt untuk arah visual studio-mu.</p>
      </div>
      <aside className="auth-art">
        <ExampleImage id="product" alt="Contoh visual produk kreatif" eager />
        <div className="auth-art-shade" />
        <span className="auth-art-label">
          <Sparkles size={15} />
          RUANG KERJA STUDIO AI-MU
        </span>
        <div className="auth-art-copy">
          <h2>
            Studio-mu.
            <br />
            Arah kreatifmu.
          </h2>
          <p>
            Pilih visual, susun prompt.
            <br />
            Siapkan karya untuk kebutuhan klien.
          </p>
        </div>
        <span className="auth-art-sticker">
          Racik
          <br />
          <em>versimu.</em> ✦
        </span>
      </aside>
    </div>
  );
}
export function CheckoutPage() {
  const { user, refresh } = useSite();
  const [configuration, setConfiguration] = useState<{
    paymentConfigured: boolean;
    environment: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api<{ paymentConfigured: boolean; environment: string }>("/config")
      .then(setConfiguration)
      .catch(() => setError("Layanan checkout belum dapat dihubungi."));
  }, []);
  if (user?.active) return <Navigate to="/app" replace />;
  return (
    <div className="commerce-page">
      <header className="container commerce-header">
        <Brand />
        <ThemeToggle />
      </header>
      <main className="checkout-layout container">
        <div>
          <Link to="/" className="back-link">
            <ArrowLeft size={16} />
            Kembali ke beranda
          </Link>
          <div className="eyebrow">SATU LANGKAH MENUJU STUDIO AI-MU</div>
          <h1>
            Bangun studio AI-mu.
            <br />
            Mulai dari sini<span className="purple-text">.</span>
          </h1>
          <p className="large-muted">
            Akses semua studio Aichemy.
            <br />
            Sekali bayar, tanpa tanggal kedaluwarsa.
          </p>
          <ul className="check-list">
            {[
              `${PRODUCT_COUNTS.services} jasa dan ${PRODUCT_COUNTS.styles} gaya awal dengan pilihan visual`,
              `${VIRAL_TEASERS.length} prompt fotografi siap salin`,
              "Draft dan preset tersimpan di akun",
              "Studio kustom untuk ide yang unik",
              "Pembaruan fitur mendatang",
            ].map((t) => (
              <li key={t}>
                <CheckCircle2 />
                {t}
              </li>
            ))}
          </ul>
          <div className="checkout-preview">
            <ExampleImage id="portrait" alt="Contoh potret" />
            <ExampleImage id="food" alt="Contoh fotografi makanan" />
            <ExampleImage id="real-estate" alt="Contoh interior" />
          </div>
        </div>
        <section className="checkout-card">
          <div className="pill">
            <Sparkles size={14} />
            AICHEMY LIFETIME
          </div>
          <h2>Ringkasan pembelian</h2>
          <div className="order-line">
            <span>Akun pembeli</span>
            <strong>{user?.email}</strong>
          </div>
          <div className="order-line">
            <span>Akses lifetime</span>
            <strong>{PRICE_LABEL}</strong>
          </div>
          <div className="order-line order-total">
            <span>Total</span>
            <strong>{PRICE_LABEL}</strong>
          </div>
          <p className="muted">
            Satu akun pribadi. Termasuk pembaruan fitur mendatang. Biaya
            aplikasi pembuat gambar eksternal terpisah.
          </p>
          {!user?.emailVerified && (
            <div className="form-error">
              Verifikasi email terlebih dahulu.{" "}
              <Link
                to={`/verifikasi-email?email=${encodeURIComponent(user?.email ?? "")}`}
              >
                Kirim ulang email
              </Link>
            </div>
          )}
          {configuration?.environment === "sandbox" && (
            <div className="sandbox-notice">
              <ShieldCheck size={19} />
              <div>
                <strong>Mode pengujian sandbox</strong>
                <p>
                  Transaksi di lingkungan ini bukan pembayaran sungguhan dan
                  tidak memberikan lisensi produksi.
                </p>
              </div>
            </div>
          )}
          {configuration && !configuration.paymentConfigured && (
            <div className="form-error">
              Pembayaran uji belum dikonfigurasi. Pengelola sedang menyiapkan
              checkout.
            </div>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="button button-primary full-width"
            disabled={
              busy || !configuration?.paymentConfigured || !user?.emailVerified
            }
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                const order = await post<{ checkoutUrl: string }>("/checkout");
                window.location.assign(order.checkoutUrl);
              } catch (e) {
                setError((e as Error).message);
                setBusy(false);
              }
            }}
          >
            Lanjut ke Pembayaran <ArrowRight size={18} />
          </button>
          <p className="checkout-secure">
            <LockKeyhole size={14} />
            Pembayaran diverifikasi otomatis di server
          </p>
          <Link className="button button-quiet full-width" to="/akun">
            Lihat akun dan pesanan
          </Link>
        </section>
      </main>
    </div>
  );
}
export function OrderPage() {
  const { id } = useParams();
  const { refresh } = useSite();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = () =>
    api<{ order: Order }>(`/orders/${id}`).then((r) => setOrder(r.order));
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [id]);
  useEffect(() => {
    if (order?.status !== "pending") return;
    const timer = setInterval(() => load().catch(() => {}), 5000);
    return () => clearInterval(timer);
  }, [order?.status, id]);
  return (
    <div className="status-page">
      <Brand />
      <section className="status-card">
        <div className="status-icon">
          {order?.status === "paid" ? (
            <CheckCircle2 size={40} />
          ) : (
            <RefreshCw size={36} />
          )}
        </div>
        <div className="eyebrow">PESANAN AICHEMY</div>
        <h1>
          {order?.status === "paid"
            ? "Selamat datang di ruang kreatifmu!"
            : order?.status === "expired" || order?.status === "failed"
              ? "Pembayaran belum berhasil."
              : "Menunggu konfirmasi pembayaran."}
        </h1>
        <p className="muted">
          {order?.status === "paid"
            ? "Akses lifetime aktif. Yuk, mulai racikan pertamamu."
            : "Akses akan aktif setelah pembayaran berhasil diverifikasi oleh server."}
        </p>
        {order && (
          <div className="order-info">
            <p>{order.id}</p>
            <strong>{PRICE_LABEL}</strong>
            <span>
              {
                (
                  {
                    pending: "Menunggu pembayaran",
                    paid: "Berhasil",
                    failed: "Gagal",
                    expired: "Kedaluwarsa",
                    revoked: "Akses dicabut",
                    created: "Dibuat",
                  } as Record<string, string>
                )[order.status]
              }
            </span>
            {order.environment === "sandbox" && (
              <small>Transaksi sandbox — bukan lisensi produksi</small>
            )}
          </div>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {order?.status === "paid" ? (
          <Link
            to="/app"
            className="button button-primary"
            onClick={() => refresh()}
          >
            Buka Studio <ArrowRight size={17} />
          </Link>
        ) : (
          <>
            <button
              className="button button-primary"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await post(`/orders/${id}/refresh`);
                  await load();
                  await refresh();
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <RefreshCw size={17} />
              {busy ? "Memeriksa…" : "Periksa Pembayaran"}
            </button>
            {order?.checkoutUrl && order.status === "pending" && (
              <a className="button button-secondary" href={order.checkoutUrl}>
                Lanjutkan Pembayaran
              </a>
            )}
            <Link to="/checkout" className="back-link">
              Kembali ke checkout
            </Link>
          </>
        )}
      </section>
    </div>
  );
}
import { PRODUCT_COUNTS } from "../shared/marketing";
