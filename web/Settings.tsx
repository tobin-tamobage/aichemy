import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  CheckCircle2,
  LogOut,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { api, post } from "./api";
import { authClient } from "./authentication";
import { useSite } from "./context";
import { Confirm } from "./ui";
import type { Order } from "../shared/product";
export function AccountPage() {
  const {
    user,
    notify,
    refresh,
    dark,
    toggleTheme,
    reducedMotion,
    toggleMotion,
  } = useSite();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [password, setPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api<{ orders: Order[] }>("/orders")
      .then((r) => setOrders(r.orders))
      .catch((e) => notify(e.message, true));
  }, []);
  return (
    <main className="container member-main settings-main">
      <div className="eyebrow">RUMAH UNTUK AKUNMU</div>
      <h1>
        Halo, {user?.name}
        <span className="purple-text">.</span>
      </h1>
      <p className="muted">Kelola akses dan kenyamanan ruang kreasimu.</p>
      <div className="settings-grid">
        <section className="settings-card">
          <span className="settings-icon">
            <UserIcon />
          </span>
          <h2>Profil akun</h2>
          <div className="order-line">
            <span>Nama</span>
            <strong>{user?.name}</strong>
          </div>
          <div className="order-line">
            <span>Email</span>
            <strong>{user?.email}</strong>
          </div>
          <div className="order-line">
            <span>Verifikasi</span>
            <strong>
              {user?.emailVerified ? "Terverifikasi ✓" : "Belum diverifikasi"}
            </strong>
          </div>
          <button
            className="button button-secondary"
            onClick={async () => {
              await authClient.signOut();
              await refresh();
              navigate("/");
            }}
          >
            <LogOut size={16} />
            Keluar dari Akun
          </button>
        </section>
        <section className="settings-card access-card">
          <Sparkles size={28} />
          <h2>
            {user?.active
              ? "Akses Lifetime Aktif"
              : "Ruang kreatifmu menunggu."}
          </h2>
          <p>
            {user?.active
              ? "Hak akses tanpa tanggal kedaluwarsa, termasuk pembaruan fitur mendatang."
              : "Aktifkan akses Rp149.000 sekali bayar untuk mulai menggunakan semua studio."}
          </p>
          {user?.environment === "sandbox" && (
            <span className="pill">LINGKUNGAN SANDBOX</span>
          )}
          <Link
            className="button button-primary"
            to={user?.active ? "/app" : "/checkout"}
          >
            {user?.active ? "Mulai Berkreasi" : "Aktifkan Akses Lifetime"}
            <ArrowUpRight size={17} />
          </Link>
        </section>
        <section className="settings-card">
          <h2>Kenyamananmu</h2>
          <label className="toggle-field">
            <input
              type="checkbox"
              role="switch"
              checked={dark}
              onChange={toggleTheme}
            />
            <span className="switch-track" />
            <span>
              Tema gelap<small>Warna yang lebih tenang untuk malam hari.</small>
            </span>
          </label>
          <label className="toggle-field">
            <input
              type="checkbox"
              role="switch"
              checked={reducedMotion}
              onChange={toggleMotion}
            />
            <span className="switch-track" />
            <span>
              Kurangi animasi
              <small>Transisi lebih sederhana tanpa gerakan dekoratif.</small>
            </span>
          </label>
        </section>
        <section className="settings-card">
          <h2>Ubah kata sandi</h2>
          <form
            className="form-grid"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              const r = await authClient.changePassword({
                currentPassword: password,
                newPassword: nextPassword,
                revokeOtherSessions: true,
              });
              if (r.error)
                notify(
                  "Kata sandi belum sesuai atau tidak dapat diubah.",
                  true,
                );
              else {
                setPassword("");
                setNextPassword("");
                notify("Kata sandi berhasil diperbarui.");
              }
              setBusy(false);
            }}
          >
            <label className="form-label">
              Kata sandi saat ini
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            <label className="form-label">
              Kata sandi baru
              <input
                type="password"
                autoComplete="new-password"
                value={nextPassword}
                onChange={(e) => setNextPassword(e.target.value)}
                minLength={10}
                maxLength={128}
                required
              />
            </label>
            <button className="button button-secondary" disabled={busy}>
              Simpan Kata Sandi
            </button>
          </form>
        </section>
      </div>
      <section className="settings-card orders-card">
        <h2>Riwayat pesanan</h2>
        {orders.length ? (
          orders.map((order) => (
            <Link
              className="order-history-row"
              key={order.id}
              to={`/pesanan/${order.id}`}
            >
              <div>
                <strong>Aktivasi Aichemy Lifetime</strong>
                <small>
                  {new Date(order.createdAt).toLocaleDateString("id-ID")} ·{" "}
                  {order.environment}
                </small>
              </div>
              <span>Rp{order.amount.toLocaleString("id-ID")}</span>
              <span className="status-pill">
                {(
                  {
                    paid: "Berhasil",
                    pending: "Menunggu",
                    expired: "Kedaluwarsa",
                    failed: "Gagal",
                    revoked: "Dicabut",
                  } as Record<string, string>
                )[order.status] ?? order.status}
              </span>
              <ArrowUpRight size={16} />
            </Link>
          ))
        ) : (
          <p className="muted">Belum ada pesanan pada akun ini.</p>
        )}
      </section>
      {user?.admin && (
        <Link className="button button-secondary" to="/admin">
          <ShieldCheck size={17} />
          Panel Admin
        </Link>
      )}
    </main>
  );
}
function UserIcon() {
  return <span aria-hidden="true">✦</span>;
}
interface AdminData {
  users: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    access: string;
  }[];
  orders: Record<string, unknown>[];
  audit: Record<string, unknown>[];
  reviews: { order_id: string; status: string; email: string }[];
}
export function AdminPage() {
  const { notify } = useSite();
  const [data, setData] = useState<AdminData | null>(null);
  const [action, setAction] = useState<{
    id: string;
    email: string;
    active: boolean;
  } | null>(null);
  const load = () => api<AdminData>("/admin").then(setData);
  useEffect(() => {
    load().catch((e) => notify(e.message, true));
  }, []);
  return (
    <main className="container member-main">
      <div className="eyebrow">PENGELOLA AICHEMY</div>
      <h1>
        Panel admin<span className="purple-text">.</span>
      </h1>
      <div className="admin-summary">
        <span>
          {data?.users.length ?? 0}
          <small>Akun ditampilkan</small>
        </span>
        <span>
          {data?.orders.length ?? 0}
          <small>Pesanan ditampilkan</small>
        </span>
        <span>
          {data?.audit.length ?? 0}
          <small>Catatan audit</small>
        </span>
      </div>
      <section className="settings-card">
        <h2>Pengguna dan akses</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Verifikasi</th>
                <th>Akses</th>
                <th>Kelola akses</th>
              </tr>
            </thead>
            <tbody>
              {data?.users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.emailVerified ? "Ya" : "Belum"}</td>
                  <td>
                    {u.access === "active"
                      ? "Lifetime aktif"
                      : u.access === "revoked"
                        ? "Dicabut"
                        : "Belum berbayar"}
                  </td>
                  <td>
                    <button
                      className="text-button"
                      disabled={!u.emailVerified}
                      onClick={() =>
                        setAction({ id: u.id, email: u.email, active: true })
                      }
                    >
                      Aktifkan
                    </button>
                    <button
                      className="text-button danger-text"
                      onClick={() =>
                        setAction({ id: u.id, email: u.email, active: false })
                      }
                    >
                      Cabut
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="settings-card">
        <h2>Pesanan terbaru</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Nominal</th>
                <th>Status</th>
                <th>Lingkungan</th>
              </tr>
            </thead>
            <tbody>
              {data?.orders.map((o, i) => (
                <tr key={i}>
                  <td>{String(o.email)}</td>
                  <td>Rp{Number(o.amount).toLocaleString("id-ID")}</td>
                  <td>{String(o.status)}</td>
                  <td>{String(o.environment)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="settings-card">
        <h2>Catatan perubahan akses</h2>
        {data?.audit.map((a, i) => (
          <p className="audit-row" key={i}>
            {String(a.action)} · {String(a.target_id)} ·{" "}
            {new Date(String(a.created_at)).toLocaleString("id-ID")}
          </p>
        ))}
      </section>
      {Boolean(data?.reviews.length) && (
        <section className="settings-card">
          <h2>Perlu ditinjau: pengembalian sebagian</h2>
          <p className="muted">
            Akses tidak dicabut otomatis. Tinjau transaksi di dashboard Midtrans
            sebelum memutuskan perubahan akses.
          </p>
          {data?.reviews.map((review, i) => (
            <p className="audit-row" key={i}>
              {review.email} · {review.status} · {review.order_id}
            </p>
          ))}
        </section>
      )}
      {action && (
        <Confirm
          title={
            action.active ? "Aktifkan akses akun ini?" : "Cabut akses akun ini?"
          }
          description={`Perubahan untuk ${action.email} akan dicatat dalam audit. Berlaku hanya pada lingkungan server saat ini.`}
          action={action.active ? "Aktifkan Akses" : "Cabut Akses"}
          onClose={() => setAction(null)}
          onConfirm={async () => {
            try {
              await post("/admin/access", {
                userId: action.id,
                active: action.active,
              });
              setAction(null);
              await load();
              notify("Hak akses diperbarui.");
            } catch (e) {
              notify((e as Error).message, true);
            }
          }}
        />
      )}
    </main>
  );
}
